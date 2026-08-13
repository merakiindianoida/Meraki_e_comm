import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import PlaceholderImage from "@/components/PlaceholderImage";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ReviewForm from "@/components/ReviewForm";
import ReturnRequestForm from "@/components/ReturnRequestForm";
import CancelOrderButton from "@/components/CancelOrderButton";

// Requires a signed-in Clerk user — proxy.ts already redirects anonymous
// visitors here before this ever renders, but the check is repeated here
// for the same reason every other auth-gated route in this repo repeats
// it: a matcher change or a moved route shouldn't silently drop coverage.
export default async function MyOrdersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/orders");
  }

  const customer = await prisma.customer.findUnique({ where: { clerkId: userId } });

  // No Customer row yet just means this account has never completed
  // checkout — an empty state, not an error.
  const orders = customer
    ? await prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true, returnRequest: true, review: true } } },
      })
    : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl text-[var(--ink)]">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 border border-[var(--border-strong)] p-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="underline-hover mt-4 inline-block text-sm font-medium text-[var(--accent)]"
          >
            Start shopping &rarr;
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="border border-[var(--border-strong)] p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
                <div>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                      order.createdAt
                    )}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <ul className="mt-4 divide-y divide-[var(--border)]">
                {order.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center gap-4 py-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden border border-[var(--border)]">
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
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--ink)]">{item.product.name}</p>
                      <p className="text-xs text-[var(--muted)]">Qty {item.quantity}</p>
                    </div>
                    <span className="font-mono text-sm text-[var(--ink)]">
                      {formatPrice(
                        parseFloat(item.priceAtSale.toString()) * item.quantity
                      )}
                    </span>
                    {/* Rating and returns are per purchased item, and only
                        make sense once it's actually arrived — no point
                        offering either while the order is still pending or
                        in transit. */}
                    {order.status === "DELIVERED" && (
                      <div className="flex w-full items-center gap-4 sm:w-auto">
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

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <Link
                  href={`/orders/${order.id}`}
                  className="underline-hover text-sm font-medium text-[var(--accent)]"
                >
                  View details &rarr;
                </Link>
                {/* Cancellation is order-wide (you can't part-cancel an
                    order once it's a single checkout), unlike rating/
                    returns above which are per item. */}
                {(order.status === "PENDING" || order.status === "PAID") && (
                  <CancelOrderButton orderId={order.id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
