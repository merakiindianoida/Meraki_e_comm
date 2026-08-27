import "server-only";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

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

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        // Payment already succeeded on PhonePe's side, so this can't be
        // undone by throwing — it needs a human to sort out (refund or
        // source a replacement). Logging loudly is the whole mitigation
        // for now; there's no admin "needs attention" flag yet to set.
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

  if (order.guestEmail) {
    void sendOrderConfirmationEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale.toString(),
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
