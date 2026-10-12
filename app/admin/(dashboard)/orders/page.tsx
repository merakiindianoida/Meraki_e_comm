import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import { Prisma } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FILTERS = [
  { label: "All", href: "/admin/orders", key: "all" },
  { label: "Payment pending", href: "/admin/orders?status=PENDING", key: "PENDING" },
  { label: "Payment failed", href: "/admin/orders?status=PAYMENT_FAILED", key: "PAYMENT_FAILED" },
  { label: "Ready to pack", href: "/admin/orders?status=PAID", key: "PAID" },
  { label: "Ready to ship", href: "/admin/orders?status=PACKED", key: "PACKED" },
  { label: "In transit", href: "/admin/orders?status=SHIPPED", key: "SHIPPED" },
  { label: "Delivered", href: "/admin/orders?status=DELIVERED", key: "DELIVERED" },
  { label: "Cancelled", href: "/admin/orders?status=CANCELLED", key: "CANCELLED" },
  { label: "Refund due", href: "/admin/orders?refund=pending", key: "refund-pending" },
  { label: "Refunded", href: "/admin/orders?status=REFUNDED", key: "REFUNDED" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; refund?: string | string[]; stock?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const refund = Array.isArray(params.refund) ? params.refund[0] : params.refund;
  const stock = Array.isArray(params.stock) ? params.stock[0] : params.stock;
  const knownStatuses = ["PENDING", "PAYMENT_FAILED", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
  const status = knownStatuses.find((value) => value === rawStatus);
  const activeFilter = refund === "pending" ? "refund-pending" : stock === "issues" ? "stock-issues" : status ?? "all";

  const where: Prisma.OrderWhereInput | undefined = refund === "pending"
    ? { status: "CANCELLED" as const, refundStatus: "PENDING" as const }
    : stock === "issues"
      ? {
          status: { in: ["PAID", "PACKED", "SHIPPED", "DELIVERED"] },
          items: { some: { stockShortfall: true } },
        }
      : status ? { status } : undefined;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        where: {
          OR: [
            { stockShortfall: true },
            { returnRequest: { is: { status: "REFUNDED" } } },
          ],
        },
        select: { id: true, stockShortfall: true, returnRequest: { select: { status: true } } },
      },
    },
  });

  const filterTitle = refund === "pending"
    ? "Cancelled · refund due"
    : stock === "issues"
      ? "Paid with stock issue"
      : status === "PAYMENT_FAILED"
        ? "Payment failed"
        : status ? status.charAt(0) + status.slice(1).toLowerCase() : "All orders";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Order management</p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">{filterTitle}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {orders.length} {orders.length === 1 ? "order" : "orders"} in this view. Select an order to review its details and update its status.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-[var(--accent)] hover:underline">← Dashboard</Link>
      </div>

      <nav aria-label="Filter orders" className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.key}
            href={filter.href}
            aria-current={activeFilter === filter.key ? "page" : undefined}
            className={`shrink-0 border px-3 py-2 text-xs transition ${activeFilter === filter.key ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--border-strong)] bg-white text-[var(--ink)] hover:border-[var(--accent)]"}`}
          >
            {filter.label}
          </Link>
        ))}
        <Link
          href="/admin/orders?stock=issues"
          aria-current={activeFilter === "stock-issues" ? "page" : undefined}
          className={`shrink-0 border px-3 py-2 text-xs transition ${activeFilter === "stock-issues" ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--border-strong)] bg-white text-[var(--ink)] hover:border-[var(--accent)]"}`}
        >
          Stock issues
        </Link>
      </nav>

      {refund === "pending" && (
        <div className="mb-4 border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          These were paid before cancellation. Complete the refund through the payment provider, then open the order and mark it <strong>Refunded</strong>.
        </div>
      )}

      <div className="overflow-x-auto border border-[var(--border-strong)] bg-white">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-[var(--ink)] hover:text-[var(--accent)]">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--ink)]">
                  {order.guestName ?? "—"}
                  <p className="text-xs text-[var(--muted)]">{order.guestEmail}</p>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--ink)]">{formatPrice(order.totalAmount.toString())}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs uppercase tracking-[0.1em] ${order.status === "PAYMENT_FAILED" || order.status === "CANCELLED" ? "text-red-600" : order.status === "REFUNDED" ? "text-emerald-700" : order.status === "PENDING" ? "text-amber-600" : "text-[var(--accent)]"}`}>
                    {order.status === "PAYMENT_FAILED" ? "Payment Failed" : order.status}
                  </span>
                  {order.status === "CANCELLED" && order.refundStatus === "PENDING" && (
                    <span className="ml-2 bg-red-600 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white">Refund due</span>
                  )}
                  {order.status === "REFUNDED" && (
                    <span className="ml-2 bg-emerald-700 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white">
                      {order.items.some((item) => item.returnRequest?.status === "REFUNDED") ? "Return refund" : "Cancellation refund"}
                    </span>
                  )}
                  {order.items.some((item) => item.stockShortfall) && order.status !== "CANCELLED" && (
                    <span className="ml-2 bg-red-600 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white">Out of stock</span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[var(--muted)]">No orders in this queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
