import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-600",
  PAID: "text-[var(--accent)]",
  SHIPPED: "text-[var(--accent)]",
  DELIVERED: "text-green-600",
  CANCELLED: "text-red-600",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--ink)]">Orders</h1>

      <div className="mt-6 overflow-x-auto border border-[var(--border-strong)] bg-white">
        <table className="w-full min-w-[640px] text-sm">
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
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs text-[var(--ink)] hover:text-[var(--accent)]"
                  >
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--ink)]">
                  {order.guestName ?? "—"}
                  <p className="text-xs text-[var(--muted)]">{order.guestEmail}</p>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {order.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--ink)]">
                  {formatPrice(order.totalAmount.toString())}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs uppercase tracking-[0.1em] ${STATUS_COLORS[order.status] ?? "text-[var(--muted)]"}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[var(--muted)]">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
