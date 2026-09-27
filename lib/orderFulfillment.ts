import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendStockShortfallAlert } from "@/lib/email";

// Shared by both the PhonePe webhook (the real source of truth) and the
// order-confirmation page's fallback check (for when a customer's browser
// redirects back before the webhook has landed) — the "mark paid, decrement
// stock" step only ever needs to exist in one place, since it's the one
// piece of this whole flow that actually moves money and inventory.
export async function markOrderPaid(orderId: string, transactionId: string | null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  // Already handled by whichever caller got here first (webhook vs. the
  // page's own check racing each other) — never double-decrement stock or
  // double-send the confirmation email.
  if (!order || order.status !== "PENDING") return;

  const shortfalls: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        // Flagged per line so admin sees it, and so a later cancel doesn't restore stock never taken.
        await tx.orderItem.update({ where: { id: item.id }, data: { stockShortfall: true } });
        shortfalls.push(item.product.name);
        // Payment already went through, so throwing can't undo it - a human sorts it out from admin.
        console.error(
          `SOLD OUT AFTER PAYMENT: order ${order.id}, product ${item.productId} — customer paid but stock ran out. Needs manual follow-up.`
        );
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        phonepeMerchantTransactionId: order.id,
        phonepeTransactionId: transactionId,
      },
    });
  });

  // Stock just changed for these products - the cached product pages
  // (see app/products/[slug]/page.tsx) shouldn't keep showing "in stock"
  // for up to a minute after something actually sells out.
  for (const item of order.items) {
    revalidatePath(`/products/${item.product.slug}`);
  }
  revalidatePath("/products");
  revalidatePath("/");

  if (shortfalls.length > 0) {
    void sendStockShortfallAlert({
      orderId: order.id,
      customerName: order.guestName,
      customerEmail: order.guestEmail,
      customerPhone: order.guestPhone,
      productNames: shortfalls,
    });
  }

  if (order.guestEmail) {
    void sendOrderConfirmationEmail({
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
}

export async function markOrderCancelled(orderId: string) {
  // Guarded by the same PENDING check inside updateMany's WHERE clause —
  // if it's already PAID (e.g. the page's fallback check and the webhook
  // raced and PAID won), a stale FAILED delivery must never cancel it.
  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}

// Shared by the customer's self-service cancel (app/orders/actions.ts) and
// the admin order-status dropdown - same "restore stock only if it was ever
// decremented" rule as markOrderPaid, just in reverse. A raw status flip to
// CANCELLED on a PAID order would silently leave that stock decremented
// forever, permanently understating real inventory for something that
// never actually shipped.
export async function cancelOrderAndRestoreStock(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || (order.status !== "PENDING" && order.status !== "PAID")) return;

  await prisma.$transaction(async (tx) => {
    if (order.status === "PAID") {
      for (const item of order.items) {
        if (item.stockShortfall) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });

  if (order.status === "PAID") {
    for (const item of order.items) {
      revalidatePath(`/products/${item.product.slug}`);
    }
    revalidatePath("/products");
    revalidatePath("/");
  }
}
