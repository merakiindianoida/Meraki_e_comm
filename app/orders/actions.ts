"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { returnRequestSchema } from "@/lib/returnSchema";
import { reviewSchema } from "@/lib/reviewSchema";
import { getOrCreateCustomer } from "@/lib/customer";

export type CancelOrderState = { error?: string } | undefined;
export type ReturnRequestState = { error?: string } | undefined;
export type ReviewState = { error?: string } | undefined;

// Self-service cancellation only makes sense before the order has actually
// shipped - once it's SHIPPED or DELIVERED, that's a return, not a
// cancellation (see the ReturnRequest flow instead). CANCELLED is already
// terminal, and there's nothing to cancel from there either.
const CANCELLABLE_STATUSES = new Set(["PENDING", "PAID"]);

export async function cancelOrder(orderId: string): Promise<CancelOrderState> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Please sign in." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: true },
  });

  // Ownership is checked the same way as app/orders/[id]/page.tsx - never
  // trust that an order id belongs to the caller just because they have it.
  if (!order || order.customer?.clerkId !== userId) {
    return { error: "Order not found." };
  }

  if (!CANCELLABLE_STATUSES.has(order.status)) {
    return { error: "This order can no longer be cancelled." };
  }

  await prisma.$transaction(async (tx) => {
    // Stock was decremented at order-creation time (see POST
    // /api/orders) - cancelling has to give it back, or every cancelled
    // order would permanently understate real available stock.
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return undefined;
}

export async function requestReturn(
  orderItemId: string,
  _prevState: ReturnRequestState,
  formData: FormData
): Promise<ReturnRequestState> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Please sign in." };
  }

  const parsed = returnRequestSchema.safeParse({ reason: formData.get("reason") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  // "Verified purchase" is enforced right here: the OrderItem has to
  // belong to an order owned by the caller, and that order has to have
  // actually been delivered — not just claimed via a form field.
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { include: { customer: true } }, returnRequest: true },
  });

  if (!orderItem || orderItem.order.customer?.clerkId !== userId) {
    return { error: "Order item not found." };
  }
  if (orderItem.order.status !== "DELIVERED") {
    return { error: "Returns can only be requested for delivered orders." };
  }
  if (orderItem.returnRequest) {
    return { error: "A return has already been requested for this item." };
  }

  await prisma.returnRequest.create({
    data: { orderItemId, reason: parsed.data.reason },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderItem.orderId}`);
  return undefined;
}

export async function submitReview(
  orderItemId: string,
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Please sign in." };
  }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  // Same verified-purchase check as requestReturn: the OrderItem has to
  // belong to an order owned by the caller, and that order has to have
  // actually been delivered — a review can't be filed against a product
  // never bought, or an order still in transit.
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { include: { customer: true } }, review: true, product: true },
  });

  if (!orderItem || orderItem.order.customer?.clerkId !== userId) {
    return { error: "Order item not found." };
  }
  if (orderItem.order.status !== "DELIVERED") {
    return { error: "You can only review items from delivered orders." };
  }
  if (orderItem.review) {
    return { error: "You've already reviewed this item." };
  }

  const customer = await getOrCreateCustomer(userId);

  await prisma.review.create({
    data: {
      orderItemId,
      productId: orderItem.productId,
      customerId: customer.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderItem.orderId}`);
  revalidatePath(`/products/${orderItem.product.slug}`);
  return undefined;
}
