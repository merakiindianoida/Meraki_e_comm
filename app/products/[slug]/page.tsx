import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import PlaceholderImage from "@/components/PlaceholderImage";
import ProductActions from "@/components/ProductActions";
import ProductReviews from "@/components/ProductReviews";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({ where: { slug } });

  // Same rule as the API route: a deactivated product 404s exactly like a
  // slug that never existed, so there's no way to tell "discontinued" apart
  // from "never was" just by hitting the URL.
  if (!product || !product.isActive) {
    notFound();
  }

  // `[null]` as the fallback (instead of an empty array) means the gallery
  // always renders at least one slot — real photo if we have it, the
  // placeholder box if we don't — rather than needing a separate
  // no-images-at-all branch further down.
  const images = product.images.length > 0 ? product.images : [null];
  const inStock = product.stock > 0;

  // Exact stock counts and internal SKUs aren't shown to visitors — both
  // leak real business data (sell-through rate per product, and for SKUs,
  // total catalog size + add order via the sequential numbering). "Only a
  // few left" below a threshold is the normal, expected amount of urgency
  // messaging; a running inventory count is not.
  const LOW_STOCK_THRESHOLD = 5;
  const availabilityLabel = !inStock
    ? "Out of stock"
    : product.stock <= LOW_STOCK_THRESHOLD
      ? `Only ${product.stock} left`
      : "In stock";

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/products" className="hover:text-[var(--accent)]">
          Our Collection
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[var(--accent)]"
        >
          {product.category}
        </Link>
      </nav>

      {/* items-stretch (grid's default) makes this row as tall as the
          right column's content naturally needs — the gallery below
          matches that height on desktop (md:flex-1 within a md:h-full
          flex column) instead of forcing its own height via aspect-square
          and running past the buttons. Mobile keeps aspect-square since
          there's no sibling height to match once the columns stack. */}
      <div className="mt-7 grid gap-10 md:grid-cols-2 md:items-stretch">
        <div className="anim-fade-up flex min-h-0 flex-col items-start gap-3 md:h-full md:min-h-0">
          {/* Fixed square, sized off the column's HEIGHT (matching the
              buttons) rather than its width — md:flex-none so it stops
              stretching to fill the column, md:aspect-square so its width
              just follows from that height. Every product photo is a true
              1:1 square now, so a square box + object-cover shows the
              whole photo with zero cropping and zero letterbox gaps; it
              just may not span the full column width, which beats either
              overflowing past the buttons or showing white bars. */}
          <div className="relative aspect-square w-full overflow-hidden border border-[var(--border-strong)] bg-white md:h-full md:w-auto md:flex-none">
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[0]}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <PlaceholderImage category={product.category} className="absolute inset-0" />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid shrink-0 grid-cols-4 gap-3">
              {images.slice(1).map((image, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden border border-[var(--border-strong)]"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={`${product.name} ${i + 2}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlaceholderImage category={product.category} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="anim-fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
            {product.category}
            {product.audience && product.audience !== "Unisex"
              ? ` · ${product.audience}`
              : ""}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[var(--ink)]">
            {product.name}
          </h1>
          {averageRating !== null && (
            <a
              href="#reviews"
              className="underline-hover mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--muted)]"
            >
              <span className="text-[var(--accent)]">★</span>
              {averageRating.toFixed(1)} ({reviews.length} review
              {reviews.length === 1 ? "" : "s"})
            </a>
          )}
          <p className="mt-4 font-mono text-3xl text-[var(--accent)]">
            {formatPrice(product.price.toString())}
          </p>

          {product.description && (
            <p className="mt-5 text-base leading-relaxed text-[var(--muted)]">
              {product.description}
            </p>
          )}

          {/* Fixed at 4 entries (Category, Purity, Weight, Availability) —
              always the same shape regardless of which optional fields a
              product has, so the 2-col grid never lands on an odd 3rd item
              with an empty gap next to it. */}
          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-[var(--border)] py-5 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Category
              </dt>
              <dd className="mt-1 text-[var(--ink)]">{product.category}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Purity
              </dt>
              <dd className="mt-1 text-[var(--ink)]">
                {product.purity ?? "925 Silver"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Weight
              </dt>
              <dd className="mt-1 text-[var(--ink)]">
                {product.weightGrams ? `${product.weightGrams.toString()} g` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                Availability
              </dt>
              <dd className="mt-1 text-[var(--ink)]">{availabilityLabel}</dd>
            </div>
          </dl>

          {/* Confirmed with the client 2026-07-29: they ship orders
              themselves, no courier/Shiprocket integration, Delhi NCR only.
              Stated plainly here rather than implied, since it directly
              affects whether a visitor outside NCR should even buy. */}
          <p className="mt-5 text-sm text-[var(--muted)]">
            We currently ship within <span className="text-[var(--ink)]">Delhi NCR only</span>,
            with delivery in <span className="text-[var(--ink)]">3–10 business days</span>.
          </p>

          {/* Add to Bag and Buy Now both create a real order on submit (see
              POST /api/orders) — Buy Now just skips the bag, carrying the
              chosen quantity straight through to /products/[slug]/checkout
              instead. See ProductActions for the quantity stepper. */}
          <ProductActions
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price.toString(),
              image: images[0],
              category: product.category,
            }}
            inStock={inStock}
            maxQuantity={product.stock}
          />
        </div>
      </div>

      <ProductReviews reviews={reviews} averageRating={averageRating} />
    </main>
  );
}
