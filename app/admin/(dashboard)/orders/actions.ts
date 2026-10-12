"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@/app/generated/prisma/client";
import { sendOrderStatusEmail, toOrderEmailItems } from "@/lib/email";
import {
  markOrderPaid,
  cancelOrderAndRestoreStock,
  revalidateStorefrontForOrder,
} from "@/lib/orderFulfillment";
import { canAdminTransitionOrderStatus } from "@/lib/orderStatus";
import { isForwardOrderTransition } from "@/lib/orderStatus";
import { sendOrderWhatsAppUpdate } from "@/lib/whatsapp";

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();

  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid order status");
  }

  const current = await prisma.order.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Order not found");
  }

  if (!canAdminTransitionOrderStatus(current.status, status)) {
    throw new Error("That order status change is not allowed.");
  }

  if (status === "REFUNDED") {
    if (current.status !== "CANCELLED" || current.refundStatus !== "PENDING") {
      throw new Error("Only a cancelled order with a pending refund can be marked refunded.");
    }
    const updated = await prisma.order.updateMany({
      where: { id, status: "CANCELLED", refundStatus: "PENDING" },
      data: { status: "REFUNDED", refundStatus: "REFUNDED" },
    });
    if (updated.count === 0) {
      throw new Error("The order changed before it could be marked refunded. Refresh and try again.");
    }
  }

  if (status === "PAID" && current.status === "PENDING") {
    await markOrderPaid(id, current.phonepeTransactionId);
    await revalidateStorefrontForOrder(id);
  } else if (
    status === "CANCELLED" &&
    (current.status === "PENDING" || current.status === "PAID")
  ) {
    const didCancel = await cancelOrderAndRestoreStock(id);
    if (!didCancel) {
      throw new Error("The order changed before it could be cancelled. Refresh and try again.");
    }
  } else if (status === "CANCELLED") {
    throw new Error("This order can't be cancelled from its current status.");
  } else if (status !== current.status && status !== "REFUNDED") {
    const deliveredAt =
      status === "DELIVERED" ? (current.status === "DELIVERED" ? current.deliveredAt : new Date()) : null;
    const firstPackedAt =
      current.firstPackedAt ??
      (current.status === "PACKED" || status === "PACKED" ? new Date() : null);
    await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        deliveredAt,
        firstPackedAt,
      },
    });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { name: true, images: true } } } } },
  });
  if (!order) return;

  const movedForward = isForwardOrderTransition(current.status, order.status);
  if (order.guestEmail && movedForward && order.status !== "CANCELLED") {
    await sendOrderStatusEmail({
      to: order.guestEmail,
      customerName: order.guestName,
      orderId: order.id,
      status: order.status,
      items: toOrderEmailItems(order.items),
      totalAmount: order.totalAmount.toString(),
      ...(order.status === "REFUNDED" ? { refundAmount: order.totalAmount.toString() } : {}),
    });
  }
  if (movedForward && order.status !== "CANCELLED") {
    await sendOrderWhatsAppUpdate({
      to: order.guestPhone,
      optedIn: order.whatsappOptIn,
      customerName: order.guestName,
      orderId: order.id,
      status: order.status,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}
