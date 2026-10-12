import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendStockShortfallAlert,
} from "@/lib/email";
import { getPhonePeOrderStatus } from "@/lib/phonepe";
import { sendOrderWhatsAppUpdate } from "@/lib/whatsapp";

// Shared by both the PhonePe webhook (the real source of truth) and the
// order-confirmation page's fallback check (for when a customer's browser
// redirects back before the webhook has landed) — the "mark paid, decrement
// stock" step only ever needs to exist in one place, since it's the one
// piece of this whole flow that actually moves money and inventory.
//
// NOTE: this function must NOT call revalidatePath. It runs during render
// when called from app/orders/[id]/page.tsx, where Next.js forbids it. The
// webhook calls revalidateStorefrontForOrder() below after this instead.
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

  const didMarkPaid = await prisma.$transaction(async (tx) => {
    // Claim the pending order before changing inventory. A concurrent
    // cancellation or payment-failure callback can win, but only one
    // transition out of PENDING is allowed to move stock or send email.
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
        // Flagged per line so admin sees it, and so a later cancel doesn't restore stock never taken.
        await tx.orderItem.update({ where: { id: item.id }, data: { stockShortfall: true } });
        shortfalls.push(item.product.name);
        // Payment already went through, so throwing can't undo it - a human sorts it out from admin.
        console.error(
          `SOLD OUT AFTER PAYMENT: order ${order.id}, product ${item.productId} — customer paid but stock ran out. Needs manual follow-up.`
        );
      }
    }

    return true;
  });

  if (!didMarkPaid) return;

  // Emails are awaited (not `void`) on purpose: on Vercel serverless the
  // function can be frozen as soon as the response is sent, which silently
  // killed un-awaited sends. send() in lib/email.ts catches its own errors,
  // so awaiting here can never break order processing.
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

// Refreshes the cached storefront pages (see app/products/[slug]/page.tsx)
// after an order changes stock. Safe to call from route handlers and server
// actions, NOT during render. Idempotent, so the webhook can call it even
// when the order page already marked the order paid.
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
  // A gateway failure only applies while payment is pending. A late failed
  // callback must never overwrite a successful payment or a customer cancel.
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "PAYMENT_FAILED" },
  });
  if (result.count === 0) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (order?.guestEmail) {
    await sendOrderStatusEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      status: "PAYMENT_FAILED",
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

// Reconcile pending payment whenever its order page or the customer's
// order list is opened. PhonePe terminal failure/expiry states are recorded
// immediately; a still-pending gateway result remains pending until a later
// webhook or status check supplies a terminal result.
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
    // If PhonePe is temporarily unreachable, leave the order pending; a
    // later webhook or order-page visit can retry the check.
    console.error("PhonePe status check failed:", error);
  }

  return true;
}

// Shared by the customer's self-service cancel (app/orders/actions.ts) and
// the admin order-status dropdown - same "restore stock only if it was ever
// decremented" rule as markOrderPaid, just in reverse. A raw status flip to
// CANCELLED on a PAID order would silently leave that stock decremented
// forever, permanently understating real inventory for something that
// never actually shipped.
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

  // Send once from this shared cancellation path so customer and admin
  // cancellations receive the same notification. The caller's status
  // email path skips CANCELLED to avoid sending a duplicate.
  if (order.guestEmail) {
    await sendOrderStatusEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      status: "CANCELLED",
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
