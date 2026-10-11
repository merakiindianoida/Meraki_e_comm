"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ReturnStatus } from "@/app/generated/prisma/client";

const VALID_STATUSES = new Set<string>(Object.values(ReturnStatus));

export async function updateReturnStatus(id: string, status: string) {
  await requireAdmin();

  // Same reasoning as updateOrderStatus in ../orders/actions.ts - `status`
  // arrives from a <select> value, not guaranteed to be a real
  // ReturnStatus (a stale client, a forged request).
  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid return status");
  }

  const current = await prisma.returnRequest.findUnique({
    where: { id },
    include: { orderItem: { select: { orderId: true } } },
  });
  if (!current) throw new Error("Return request not found");

  const allowed: Record<string, readonly string[]> = {
    REQUESTED: ["APPROVED", "REJECTED"],
    APPROVED: ["REJECTED", "RECEIVED"],
    REJECTED: [],
    RECEIVED: current.type === "RETURN" ? ["REFUND_INITIATED"] : [],
    REFUND_INITIATED: current.type === "RETURN" ? ["REFUNDED"] : [],
    REFUNDED: [],
  };
  if (status !== current.status && !allowed[current.status]?.includes(status)) {
    throw new Error("That return status change is not allowed.");
  }

  await prisma.returnRequest.update({ where: { id }, data: { status: status as ReturnStatus } });

  revalidatePath("/admin/returns");
  revalidatePath("/orders");
  revalidatePath(`/orders/${current.orderItem.orderId}`);
}
