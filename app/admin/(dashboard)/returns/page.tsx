import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReturnStatusSelect from "@/components/admin/ReturnStatusSelect";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const validStatuses = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUND_INITIATED", "REFUNDED"] as const;
  const status = validStatuses.find((value) => value === rawStatus);
  const returns = await prisma.returnRequest.findMany({
    where: status ? { status } : undefined,
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Return management</p>
          <h1 className="mt-1 font-serif text-3xl text-[var(--ink)]">
            {status === "REQUESTED" ? "New return requests" : status ? status.replaceAll("_", " ") : "Returns & exchanges"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{returns.length} {returns.length === 1 ? "request" : "requests"} in this view.</p>
        </div>
        <Link href="/admin" className="text-sm text-[var(--accent)] hover:underline">← Dashboard</Link>
      </div>

      <nav aria-label="Filter returns" className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { label: "All", href: "/admin/returns", key: "all" },
          { label: "New requests", href: "/admin/returns?status=REQUESTED", key: "REQUESTED" },
          { label: "Approved", href: "/admin/returns?status=APPROVED", key: "APPROVED" },
          { label: "Received", href: "/admin/returns?status=RECEIVED", key: "RECEIVED" },
          { label: "Refund in progress", href: "/admin/returns?status=REFUND_INITIATED", key: "REFUND_INITIATED" },
          { label: "Refunded", href: "/admin/returns?status=REFUNDED", key: "REFUNDED" },
        ].map((filter) => (
          <Link key={filter.key} href={filter.href} aria-current={(status ?? "all") === filter.key ? "page" : undefined}
            className={`shrink-0 border px-3 py-2 text-xs transition ${(status ?? "all") === filter.key ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--border-strong)] bg-white text-[var(--ink)] hover:border-[var(--accent)]"}`}>
            {filter.label}
          </Link>
        ))}
      </nav>

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
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
                      {ret.type.toLowerCase()}
                    </p>
                    <ReturnStatusSelect returnId={ret.id} status={ret.status} type={ret.type} />
                  </div>
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
