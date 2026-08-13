import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReturnStatusSelect from "@/components/admin/ReturnStatusSelect";

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orderItem: {
        include: {
          product: true,
          order: { include: { customer: true } },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--ink)]">Returns</h1>

      <div className="mt-6 overflow-x-auto border border-[var(--border-strong)] bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => (
              <tr key={ret.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${ret.orderItem.orderId}`}
                    className="font-mono text-xs text-[var(--ink)] hover:text-[var(--accent)]"
                  >
                    #{ret.orderItem.orderId.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--ink)]">{ret.orderItem.product.name}</td>
                <td className="px-4 py-3 text-[var(--ink)]">
                  {ret.orderItem.order.guestName ?? ret.orderItem.order.customer?.name ?? "—"}
                  <p className="text-xs text-[var(--muted)]">
                    {ret.orderItem.order.customer?.email}
                  </p>
                </td>
                <td className="max-w-[240px] px-4 py-3 text-[var(--muted)]">{ret.reason}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {ret.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <ReturnStatusSelect returnId={ret.id} status={ret.status} />
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                  No return requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
