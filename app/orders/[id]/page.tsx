import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import { getPhonePeOrderStatus } from "@/lib/phonepe";
import { markOrderPaid, markOrderCancelled } from "@/lib/orderFulfillment";
import PlaceholderImage from "@/components/PlaceholderImage";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ReviewForm from "@/components/ReviewForm";
import ReturnRequestForm from "@/components/ReturnRequestForm";
import CancelOrderButton from "@/components/CancelOrderButton";
import OrderStatusPoller from "@/components/OrderStatusPoller";

// Checkout now always requires a signed-in Clerk user (see
// POST /api/orders), so every order has a real owner - this page checks
// that the signed-in visitor actually IS that owner rather than trusting
// the UUID alone as the access control. A 404 rather than a 403 on
// mismatch, so the response doesn't confirm an order with that id exists
// for someone else.
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/orders/${id}`);
  }

  let order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, returnRequest: true, review: true } },
      customer: true,
    },
  });

  if (!order || order.customer?.clerkId !== userId) {
    notFound();
  }

  // The customer's browser redirects back here the moment PhonePe's
  // checkout page finishes — but PhonePe's own webhook (the actual source
  // of truth, see app/api/phonepe/webhook) is a separate, unordered
  // delivery that can arrive a beat later. Rather than show "pending"
  // limbo on first landing, ask PhonePe directly once here and finalize
  // inline if it already knows the outcome — markOrderPaid/Cancelled are
  // the same idempotent functions the webhook itself calls, so whichever
  // of the two gets there first is a no-op for the other.
  if (order.status === "PENDING") {
    try {
      const { state, transactionId } = await getPhonePeOrderStatus(order.id);
      if (state === "COMPLETED") {
        await markOrderPaid(order.id, transactionId);
      } else if (state === "FAILED") {
        await markOrderCancelled(order.id);
      }
      if (state !== "PENDING") {
        order = await prisma.order.findUnique({
          where: { id },
          include: {
            items: { include: { product: true, returnRequest: true, review: true } },
            customer: true,
          },
        });
      }
    } catch (error) {
      // PhonePe's status API being briefly unreachable shouldn't break
      // this page — it just falls back to showing "pending" and letting
      // the webhook (or the poller below, on a refresh) catch up.
      console.error("PhonePe status check failed:", error);
    }
  }

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="border-b border-[var(--border)] pb-8 text-center">
        {/* PENDING here means "waiting on PhonePe" specifically — the
            fallback check above already tried to resolve it once, so
            still being PENDING means either the customer bailed out of
            PhonePe's checkout, or its webhook genuinely hasn't landed yet.
            The poller below quietly refreshes this page so the moment
            either resolves it, this message updates without the customer
            having to do anything. */}
        {order.status === "PENDING" ? (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              Awaiting Payment
            </p>
            <h1 className="mt-2 font-serif text-3xl text-[var(--ink)]">
              Almost there, {order.guestName ?? "friend"}.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              We&apos;re confirming your payment with PhonePe — this page
              will update automatically. If you closed the payment window
              before finishing, you can safely place the order again.
            </p>
            <OrderStatusPoller />
          </>
        ) : (
          <h1 className="font-serif text-3xl text-[var(--ink)]">Order Details</h1>
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          <p className="font-mono text-xs text-[var(--muted)]">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <ul className="mt-8 divide-y divide-[var(--border)]">
        {order.items.map((item) => (
          <li key={item.id} className="flex flex-wrap gap-4 py-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden border border-[var(--border-strong)]">
              {item.product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PlaceholderImage category={item.product.category} />
              )}
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">
                  {item.product.name}
                </p>
                <p className="text-xs text-[var(--muted)]">Qty {item.quantity}</p>
              </div>
              <span className="font-mono text-sm text-[var(--ink)]">
                {formatPrice(parseFloat(item.priceAtSale.toString()) * item.quantity)}
              </span>
            </div>
            {/* Per purchased item, only once it's actually arrived. */}
            {order.status === "DELIVERED" && (
              <div className="flex w-full items-center gap-4 pl-20">
                <ReviewForm orderItemId={item.id} existingReview={item.review} />
                <ReturnRequestForm
                  orderItemId={item.id}
                  existingStatus={item.returnRequest?.status}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
        <span className="text-sm text-[var(--muted)]">Total</span>
        <span className="font-mono text-lg text-[var(--ink)]">
          {formatPrice(order.totalAmount.toString())}
        </span>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Shipping to
        </p>
        <p className="mt-1 whitespace-pre-line text-[var(--ink)]">
          {order.shippingAddress}
        </p>
      </div>

      {(order.status === "PENDING" || order.status === "PAID") && (
        <div className="mt-8 flex justify-center border-t border-[var(--border)] pt-6">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}

      <Link
        href="/products"
        className="mt-10 block w-full rounded-lg bg-[var(--accent)] px-6 py-3.5 text-center text-sm uppercase tracking-[0.15em] text-white transition duration-500 hover:bg-[var(--accent)]/90"
      >
        Continue Shopping
      </Link>
    </main>
  );
}
