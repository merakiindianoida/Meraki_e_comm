import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, stockStatus } from "@/lib/catalog";
import ProductActiveToggle from "@/components/admin/ProductActiveToggle";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

// Unlike the public /products listing, this includes inactive products -
// the admin needs to see (and re-activate) discontinued pieces too.
export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-[var(--ink)]">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm uppercase tracking-[0.1em] text-white transition duration-500 hover:bg-[var(--accent)]/90"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-[var(--border-strong)] bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const status = stockStatus(product.stock);
              return (
                <tr key={product.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{product.category}</td>
                  <td className="px-4 py-3 font-mono text-[var(--ink)]">
                    {formatPrice(product.price.toString())}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        status === "out_of_stock"
                          ? "text-red-600"
                          : status === "low_stock"
                            ? "text-amber-600"
                            : "text-[var(--ink)]"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs uppercase tracking-[0.1em] ${
                        product.isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs uppercase tracking-[0.1em] text-[var(--muted)] transition hover:text-[var(--accent)]"
                      >
                        Edit
                      </Link>
                      <ProductActiveToggle
                        productId={product.id}
                        isActive={product.isActive}
                      />
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
