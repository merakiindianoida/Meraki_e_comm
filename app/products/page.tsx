import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AUDIENCES, CATEGORIES } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

const MAX_SEARCH_LENGTH = 100;

// Builds the href for a filter chip by merging one changed field (category,
// audience, or search) into whatever's currently in the URL, so filters
// stack instead of clobbering each other. `"key" in patch` (rather than
// `patch.key !== undefined`) is what lets a caller explicitly clear a
// filter by passing `{ category: undefined }` — omitting the key entirely
// would just fall through to `current` instead.
function chipHref(
  current: { category?: string; audience?: string; search?: string },
  patch: { category?: string; audience?: string; search?: string }
) {
  const params = new URLSearchParams();
  const category = "category" in patch ? patch.category : current.category;
  const audience = "audience" in patch ? patch.audience : current.audience;
  const search = "search" in patch ? patch.search : current.search;
  if (category) params.set("category", category);
  if (audience) params.set("audience", audience);
  if (search) params.set("search", search);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; audience?: string; search?: string }>;
}) {
  const { category, audience, search: rawSearch } = await searchParams;
  // Same sanitization as the public API route (trim + length cap) — this
  // comes straight from a URL param, so it's attacker-controlled same as
  // there, even though it only feeds a parameterized Prisma query.
  const search = rawSearch?.trim().slice(0, MAX_SEARCH_LENGTH) || undefined;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
      ...(audience && { audience }),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    },
    // Ascending, not the usual "newest first" — the 40 real products were
    // imported in one sequential run in exact Excel "Photo #" order, so
    // createdAt asc reproduces that same serial order for now. Revisit
    // once products are added individually over time rather than in one
    // batch, since new ones would then just land at the end by date
    // instead of wherever they'd belong in a catalog sense.
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h1 className="anim-fade-up font-serif text-4xl text-[var(--ink)]">
          Our Collection
        </h1>
        <p className="font-mono text-sm text-[var(--muted)]">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {search && (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Results for &ldquo;{search}&rdquo; &middot;{" "}
          <Link
            href={chipHref({ category, audience, search }, { search: undefined })}
            className="underline-hover text-[var(--accent)]"
          >
            Clear search
          </Link>
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-2">
        <Link
          href={chipHref({ category, audience, search }, { category: undefined })}
          className={`rounded-lg border px-5 py-2 text-sm uppercase tracking-[0.1em] transition ${
            !category
              ? "border-[var(--ink)] bg-[var(--ink)] text-white"
              : "border-[var(--border-strong)] text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={chipHref({ category, audience, search }, { category: c })}
            className={`rounded-lg border px-5 py-2 text-sm uppercase tracking-[0.1em] transition ${
              category === c
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--border-strong)] text-[var(--ink)] hover:border-[var(--accent)]"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={chipHref({ category, audience, search }, { audience: undefined })}
          className={`underline-hover px-3 py-1 text-sm transition ${
            !audience
              ? "text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--accent)]"
          }`}
        >
          Everyone
        </Link>
        {AUDIENCES.map((a) => (
          <Link
            key={a}
            href={chipHref({ category, audience, search }, { audience: a })}
            className={`underline-hover px-3 py-1 text-sm transition ${
              audience === a
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--accent)]"
            }`}
          >
            {a}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-sm text-[var(--muted)]">
          No products found for this filter yet.
        </p>
      ) : (
        <div className="mt-9 grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="hover-lift">
              <ProductCard
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price.toString(),
                  images: product.images,
                  category: product.category,
                  stock: product.stock,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
