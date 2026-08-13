import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import PlaceholderImage from "@/components/PlaceholderImage";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ReviewForm from "@/components/ReviewForm";
import ReturnRequestForm from "@/components/ReturnRequestForm";
import CancelOrderButton from "@/components/CancelOrderButton";

// Checkout now always requires a signed-in Clerk user (see
// POST /api/orders), so every order has a real owner — this page checks
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

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, returnRequest: true, review: true } },
      customer: true,
    },
  });

  if (!order || order.customer?.clerkId !== userId) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="border-b border-[var(--border)] pb-8 text-center">
        {/* "Order Confirmed / Thank you" framing only fits the moment right
            after checkout — once the order has moved past PENDING, this
            page is being revisited from My Orders, not landed on fresh. */}
        {order.status === "PENDING" ? (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              Order Confirmed
            </p>
            <h1 className="mt-2 font-serif text-3xl text-[var(--ink)]">
              Thank you, {order.guestName ?? "friend"}.
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Your order has been received and is pending confirmation. Online
              payment isn&apos;t live yet, so we&apos;ll reach out at{" "}
              {order.guestEmail ?? "the email you provided"} to arrange payment
              and delivery.
            </p>
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
