"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ReturnStatus } from "@/app/generated/prisma/client";
import { sendOrderStatusEmail, toOrderEmailItems } from "@/lib/email";
import { sendOrderWhatsAppUpdate } from "@/lib/whatsapp";
import { isForwardOrderTransition } from "@/lib/orderStatus";

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
    include: {
      orderItem: {
        include: {
          order: {
            include: {
              items: { include: { product: { select: { name: true, images: true } } } },
            },
          },
        },
      },
    },
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

  await prisma.$transaction(async (tx) => {
    await tx.returnRequest.update({ where: { id }, data: { status: status as ReturnStatus } });
    if (status === "REFUNDED") {
      await tx.order.update({
        where: { id: current.orderItem.orderId },
        data: { status: "REFUNDED", refundStatus: "REFUNDED" },
      });
    }
  });

  const orderMovedForward = status === "REFUNDED" && isForwardOrderTransition(current.orderItem.order.status, "REFUNDED");
  if (orderMovedForward && current.orderItem.order.guestEmail) {
    await sendOrderStatusEmail({
      to: current.orderItem.order.guestEmail,
      customerName: current.orderItem.order.guestName,
      orderId: current.orderItem.orderId,
      status: "REFUNDED",
      items: toOrderEmailItems(current.orderItem.order.items),
      totalAmount: current.orderItem.order.totalAmount.toString(),
      refundAmount: current.orderItem.priceAtSale.mul(current.orderItem.quantity).toString(),
    });
  }
  if (orderMovedForward) {
    await sendOrderWhatsAppUpdate({
      to: current.orderItem.order.guestPhone,
      optedIn: current.orderItem.order.whatsappOptIn,
      customerName: current.orderItem.order.guestName,
      orderId: current.orderItem.orderId,
      status: "REFUNDED",
    });
  }

  revalidatePath("/admin/returns");
  revalidatePath("/orders");
  revalidatePath(`/orders/${current.orderItem.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
