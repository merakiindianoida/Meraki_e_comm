"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@/app/generated/prisma/client";
import { sendOrderStatusEmail } from "@/lib/email";
import {
  markOrderPaid,
  cancelOrderAndRestoreStock,
  revalidateStorefrontForOrder,
} from "@/lib/orderFulfillment";

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

// Once an order has left the building, it can't go back to an unshipped
// state or be cancelled. After delivery the customer uses the return flow
// (see app/orders/actions.ts's requestReturn) for any refund.
const SHIPPED_LOCKED = new Set<string>(["SHIPPED", "DELIVERED"]);
const ALLOWED_AFTER_SHIPPED = new Set<string>(["SHIPPED", "DELIVERED"]);

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();

  // `status` arrives from a <select> value - a plain string, not
  // guaranteed to be a real OrderStatus (a stale client, a forged
  // request). Reject anything that isn't one of the real values
  // rather than letting Prisma throw further down.
  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid order status");
  }

  const current = await prisma.order.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Order not found");
  }

  // Server-side lock: a shipped/delivered order can only move between
  // SHIPPED and DELIVERED. Cancelling, or moving back to PENDING/PAID,
  // is rejected here no matter what the dropdown shows.
  if (SHIPPED_LOCKED.has(current.status) && !ALLOWED_AFTER_SHIPPED.has(status)) {
    throw new Error(
      "Shipped orders can't be cancelled or moved back. After delivery, the customer can request a return."
    );
  }

  // PENDING -> PAID and (PENDING or PAID) -> CANCELLED both move real
  // inventory (decrement or restore) - routed through the same functions
  // the PhonePe webhook and customer self-cancel use, rather than a raw
  // status flip that would silently desync stock from what actually sold.
  // Every other transition (SHIPPED, DELIVERED, ...) never touches stock,
  // so a plain update is correct there.
  if (status === "PAID" && current.status === "PENDING") {
    await markOrderPaid(id, current.phonepeTransactionId);
    // markOrderPaid no longer refreshes the cached storefront itself;
    // server actions are allowed to, so do it here.
    await revalidateStorefrontForOrder(id);
  } else if (
    status === "CANCELLED" &&
    (current.status === "PENDING" || current.status === "PAID")
  ) {
    await cancelOrderAndRestoreStock(id);
  } else if (status === "CANCELLED") {
    // Any other starting status can't be cancelled from here.
    throw new Error("This order can't be cancelled from its current status.");
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
  // changes later. Awaited (not `void`) so Vercel doesn't freeze the
  // function before the email is sent; sendOrderStatusEmail swallows its
  // own errors, so a failed email never breaks the admin's status update.
  // Only send when the status actually changed, so re-saving the same
  // status doesn't email the customer again.
  if (order.guestEmail && order.status !== current.status) {
    await sendOrderStatusEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      status: order.status,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}