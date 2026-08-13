import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import PlaceholderImage from "@/components/PlaceholderImage";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-[var(--muted)] hover:text-[var(--accent)]">
        ← All Orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-[var(--ink)]">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
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
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/products/${item.productId}/edit`}
                      className="text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">Qty {item.quantity}</p>
                  </div>
                  <span className="font-mono text-sm text-[var(--ink)]">
                    {formatPrice(parseFloat(item.priceAtSale.toString()) * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="text-sm text-[var(--muted)]">Total</span>
            <span className="font-mono text-lg text-[var(--ink)]">
              {formatPrice(order.totalAmount.toString())}
            </span>
          </div>
        </div>

        <div className="h-fit space-y-5 border border-[var(--border-strong)] bg-white p-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Customer</p>
            <p className="mt-1 text-[var(--ink)]">{order.guestName ?? "—"}</p>
            <p className="text-[var(--muted)]">{order.guestEmail ?? "—"}</p>
            <p className="text-[var(--muted)]">{order.guestPhone ?? "—"}</p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              Shipping Address
            </p>
            <p className="mt-1 whitespace-pre-line text-[var(--ink)]">
              {order.shippingAddress}
            </p>
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">Placed</p>
            <p className="mt-1 text-[var(--ink)]">
              {order.createdAt.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
