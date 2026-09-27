"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@/app/generated/prisma/client";
import { sendOrderStatusEmail } from "@/lib/email";
import { markOrderPaid, cancelOrderAndRestoreStock } from "@/lib/orderFulfillment";

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();

  // `status` arrives from a <select> value - a plain string, not
  // guaranteed to be a real OrderStatus (a stale client, a forged
  // request). Reject anything that isn't one of the five real values
  // rather than letting Prisma throw further down.
  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid order status");
  }

  const current = await prisma.order.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Order not found");
  }

  // PENDING -> PAID and (PENDING or PAID) -> CANCELLED both move real
  // inventory (decrement or restore) - routed through the same functions
  // the PhonePe webhook and customer self-cancel use, rather than a raw
  // status flip that would silently desync stock from what actually sold.
  // Every other transition (SHIPPED, DELIVERED, ...) never touches stock,
  // so a plain update is correct there.
  if (status === "PAID" && current.status === "PENDING") {
    await markOrderPaid(id, current.phonepeTransactionId);
  } else if (
    status === "CANCELLED" &&
    (current.status === "PENDING" || current.status === "PAID")
  ) {
    // Cancelling a SHIPPED/DELIVERED order isn't handled here on purpose -
    // that's what the Return flow is for (see app/orders/actions.ts's
    // requestReturn); falls through to the plain update below instead of
    // silently no-op'ing against cancelOrderAndRestoreStock's own guard.
    await cancelOrderAndRestoreStock(id);
  } else {
    // Keeps the original delivery date if it's re-saved as DELIVERED; cleared if moved back.
    const deliveredAt =
      status === "DELIVERED" ? (current.status === "DELIVERED" ? current.deliveredAt : new Date()) : null;
    await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus, deliveredAt },
    });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return;

  // guestEmail/guestName are the point-in-time snapshot taken when the
  // order was placed (see POST /api/orders) - using those instead of
  // looking up the Customer means this still works even if their profile
  // changes later. Fire-and-forget: sendOrderStatusEmail swallows its own
  // errors, so a failed email never breaks the admin's status update.
  if (order.guestEmail) {
    void sendOrderStatusEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      status: order.status,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
