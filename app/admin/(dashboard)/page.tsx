import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stockStatus } from "@/lib/catalog";

export default async function AdminDashboardPage() {
  const [totalProducts, allActiveProducts, pendingOrders, pendingReturns] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({ where: { isActive: true }, select: { stock: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.returnRequest.count({ where: { status: "REQUESTED" } }),
  ]);

  const lowOrOutOfStock = allActiveProducts.filter(
    (p) => stockStatus(p.stock) !== "in_stock"
  ).length;

  const stats = [
    { label: "Active Products", value: totalProducts, href: "/admin/products" },
    { label: "Low / Out of Stock", value: lowOrOutOfStock, href: "/admin/products" },
    { label: "Pending Orders", value: pendingOrders, href: "/admin/orders" },
    { label: "Pending Returns", value: pendingReturns, href: "/admin/returns" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--ink)]">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-[var(--border-strong)] bg-white p-5 transition duration-500 hover:border-[var(--accent)]"
          >
            <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              {stat.label}
            </p>
            <p className="mt-2 font-mono text-3xl text-[var(--ink)]">{stat.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
