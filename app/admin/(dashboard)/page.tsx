import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import { stockStatus } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function QueueCard({
  title,
  description,
  count,
  href,
  tone = "neutral",
}: {
  title: string;
  description: string;
  count: number;
  href: string;
  tone?: "neutral" | "amber" | "red" | "green" | "blue";
}) {
  const tones = {
    neutral: "border-[var(--border-strong)] hover:border-[var(--accent)]",
    amber: "border-amber-200 hover:border-amber-500",
    red: "border-red-200 hover:border-red-500",
    green: "border-emerald-200 hover:border-emerald-500",
    blue: "border-blue-200 hover:border-blue-500",
  };

  return (
    <Link
      href={href}
      className={`flex min-h-36 flex-col justify-between border bg-white p-5 transition hover:shadow-sm ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[var(--ink)]">{title}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{description}</p>
        </div>
        <span className="font-mono text-2xl text-[var(--ink)]">{count}</span>
      </div>
      <span className="mt-4 text-xs font-medium text-[var(--accent)]">Open queue →</span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    allActiveProducts,
    pendingPayments,
    failedPayments,
    paidOrders,
    packedOrders,
    shippedOrders,
    pendingReturns,
    refundsDue,
    refundedOrders,
    stockIssues,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({ where: { isActive: true }, select: { stock: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAYMENT_FAILED" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PACKED" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.returnRequest.count({ where: { status: "REQUESTED" } }),
    prisma.order.count({ where: { status: "CANCELLED", refundStatus: "PENDING" } }),
    prisma.order.count({ where: { status: "REFUNDED" } }),
    prisma.order.count({
      where: {
        status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] },
        items: { some: { stockShortfall: true } },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, guestName: true, status: true, totalAmount: true, createdAt: true },
    }),
  ]);

  const lowOrOutOfStock = allActiveProducts.filter(
    (product) => stockStatus(product.stock) !== "in_stock"
  ).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Store overview</p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Work through the queues below to keep each order moving.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--accent)]"
        >
          View all orders
        </Link>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl text-[var(--ink)]">Order queues</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Each count opens only that group of orders.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QueueCard title="Payment pending" description="Check payment status or follow up." count={pendingPayments} href="/admin/orders?status=PENDING" tone="amber" />
          <QueueCard title="Payment failed" description="Review unsuccessful payment attempts." count={failedPayments} href="/admin/orders?status=PAYMENT_FAILED" tone="red" />
          <QueueCard title="Ready to pack" description="Payment confirmed; prepare these orders." count={paidOrders} href="/admin/orders?status=PAID" tone="blue" />
          <QueueCard title="Ready to ship" description="Packed orders waiting for dispatch." count={packedOrders} href="/admin/orders?status=PACKED" />
          <QueueCard title="In transit" description="Orders shipped and awaiting delivery." count={shippedOrders} href="/admin/orders?status=SHIPPED" tone="blue" />
          <QueueCard title="Return requests" description="Review requests and update their progress." count={pendingReturns} href="/admin/returns?status=REQUESTED" tone="amber" />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl text-[var(--ink)]">Refund management</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Includes refunds after cancellation and refunds completed through returns.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <QueueCard title="Cancelled · refund due" description="Paid cancellations that still need a refund." count={refundsDue} href="/admin/orders?refund=pending" tone="red" />
          <QueueCard title="Refunded orders" description="Completed cancellation and return refunds." count={refundedOrders} href="/admin/orders?status=REFUNDED" tone="green" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[var(--ink)]">Recent orders</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Latest six orders, across every status.</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-medium text-[var(--accent)] hover:underline">
            All orders →
          </Link>
        </div>
        <div className="overflow-x-auto border border-[var(--border-strong)] bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs hover:text-[var(--accent)]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">{order.guestName ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{formatPrice(order.totalAmount.toString())}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {order.status === "PAYMENT_FAILED" ? "Payment Failed" : order.status}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--muted)]">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/products" className="border border-[var(--border-strong)] bg-white p-4 hover:border-[var(--accent)]">
          <p className="text-xs text-[var(--muted)]">Active products</p><p className="mt-1 font-mono text-2xl">{totalProducts}</p>
        </Link>
        <Link href="/admin/products" className="border border-[var(--border-strong)] bg-white p-4 hover:border-[var(--accent)]">
          <p className="text-xs text-[var(--muted)]">Low / out of stock</p><p className="mt-1 font-mono text-2xl">{lowOrOutOfStock}</p>
        </Link>
        <Link href="/admin/orders?stock=issues" className="border border-red-200 bg-white p-4 hover:border-red-500">
          <p className="text-xs text-[var(--muted)]">Paid with stock issue</p><p className="mt-1 font-mono text-2xl">{stockIssues}</p>
        </Link>
      </section>
    </div>
  );
}
