"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@/app/generated/prisma/client";
import { sendOrderStatusEmail } from "@/lib/email";

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();

  // `status` arrives from a <select> value — a plain string, not
  // guaranteed to be a real OrderStatus (a stale client, a forged
  // request). Reject anything that isn't one of the five real values
  // rather than letting Prisma throw further down.
  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid order status");
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
  });

  // guestEmail/guestName are the point-in-time snapshot taken when the
  // order was placed (see POST /api/orders) — using those instead of
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
