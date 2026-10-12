import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendStockShortfallAlert,
  toOrderEmailItems,
} from "@/lib/email";
import { getPhonePeOrderStatus } from "@/lib/phonepe";
import { sendOrderWhatsAppUpdate } from "@/lib/whatsapp";

export async function markOrderPaid(orderId: string, transactionId: string | null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.status !== "PENDING") return;

  const shortfalls: string[] = [];

  // The conditional claim prevents concurrent callbacks from deducting stock twice.
  const didMarkPaid = await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: {
        status: "PAID",
        phonepeMerchantTransactionId: order.id,
        phonepeTransactionId: transactionId,
      },
    });
    if (claimed.count === 0) return false;

    for (const item of order.items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        await tx.orderItem.update({ where: { id: item.id }, data: { stockShortfall: true } });
        shortfalls.push(item.product.name);
        console.error(
          `SOLD OUT AFTER PAYMENT: order ${order.id}, product ${item.productId} — customer paid but stock ran out. Needs manual follow-up.`
        );
      }
    }

    return true;
  });

  if (!didMarkPaid) return;

  if (shortfalls.length > 0) {
    await sendStockShortfallAlert({
      orderId: order.id,
      customerName: order.guestName,
      customerEmail: order.guestEmail,
      customerPhone: order.guestPhone,
      productNames: shortfalls,
    });
  }

  if (order.guestEmail) {
    await sendOrderConfirmationEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale.toString(),
        image: item.product.images[0] ?? null,
      })),
      totalAmount: order.totalAmount.toString(),
      shippingAddress: order.shippingAddress,
    });
  }
  await sendOrderWhatsAppUpdate({
    to: order.guestPhone,
    optedIn: order.whatsappOptIn,
    customerName: order.guestName,
    orderId: order.id,
    status: "PAID",
  });
}

export async function revalidateStorefrontForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { items: { select: { product: { select: { slug: true } } } } },
  });
  if (!order) return;

  try {
    for (const item of order.items) {
      revalidatePath(`/products/${item.product.slug}`);
    }
    revalidatePath("/products");
    revalidatePath("/");
  } catch (error) {
    console.error("revalidateStorefrontForOrder failed:", error);
  }
}

export async function markOrderPaymentFailed(orderId: string) {
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "PAYMENT_FAILED" },
  });
  if (result.count === 0) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true, images: true } } } } },
  });
  if (order?.guestEmail) {
    await sendOrderStatusEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      status: "PAYMENT_FAILED",
      items: toOrderEmailItems(order.items),
      totalAmount: order.totalAmount.toString(),
    });
  }
  if (order) {
    await sendOrderWhatsAppUpdate({
      to: order.guestPhone,
      optedIn: order.whatsappOptIn,
      customerName: order.guestName,
      orderId: order.id,
      status: "PAYMENT_FAILED",
    });
  }
}

export async function reconcilePendingPhonePeOrder(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") {
    return false;
  }

  try {
    const { state, transactionId } = await getPhonePeOrderStatus(order.id);
    if (state === "COMPLETED") {
      await markOrderPaid(order.id, transactionId);
      return true;
    }
    if (state === "FAILED" || state === "EXPIRED") {
      await markOrderPaymentFailed(order.id);
      return true;
    }
  } catch (error) {
    console.error("PhonePe status check failed:", error);
  }

  return true;
}

export async function cancelOrderAndRestoreStock(orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || (order.status !== "PENDING" && order.status !== "PAID")) return false;

  const didCancel = await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: {
        status: "CANCELLED",
        refundStatus: order.status === "PAID" ? "PENDING" : "NOT_REQUIRED",
      },
    });
    if (claimed.count === 0) return false;

    if (order.status === "PAID") {
      for (const item of order.items) {
        if (item.stockShortfall) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return true;
  });

  if (!didCancel) return false;

  if (order.status === "PAID") {
    try {
      for (const item of order.items) {
        revalidatePath(`/products/${item.product.slug}`);
      }
      revalidatePath("/products");
      revalidatePath("/");
    } catch (error) {
      console.error("revalidatePath failed after cancelOrderAndRestoreStock:", error);
    }
  }

  if (order.guestEmail) {
    await sendOrderStatusEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      status: "CANCELLED",
      items: toOrderEmailItems(order.items),
      totalAmount: order.totalAmount.toString(),
    });
  }
  await sendOrderWhatsAppUpdate({
    to: order.guestPhone,
    optedIn: order.whatsappOptIn,
    customerName: order.guestName,
    orderId: order.id,
    status: "CANCELLED",
  });

  return true;
}
