"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ReturnStatus } from "@/app/generated/prisma/client";

const VALID_STATUSES = new Set<string>(Object.values(ReturnStatus));

export async function updateReturnStatus(id: string, status: string) {
  await requireAdmin();

  // Same reasoning as updateOrderStatus in ../orders/actions.ts — `status`
  // arrives from a <select> value, not guaranteed to be a real
  // ReturnStatus (a stale client, a forged request).
  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid return status");
  }

  await prisma.returnRequest.update({
    where: { id },
    data: { status: status as ReturnStatus },
  });

  revalidatePath("/admin/returns");
}
