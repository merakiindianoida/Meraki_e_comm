import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import PlaceholderImage from "@/components/PlaceholderImage";
import ProductActions from "@/components/ProductActions";
import ProductReviews from "@/components/ProductReviews";
import { BUSINESS } from "@/lib/siteInfo";

const SITE_URL = `https://${BUSINESS.website}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.isActive) {
    return {
      title: "Product not found | Meraki Fine Silver",
      robots: { index: false, follow: true },
    };
  }

  const title = `${product.name} | Meraki Fine Silver`;
  const baseDesc = product.description?.trim()
    ? `${product.description.trim().replace(/\s+/g, " ")} `
    : "";
  const description = `${baseDesc}925 silver ${product.category.toLowerCase()}${
    product.audience ? ` for ${product.audience.toLowerCase()}` : ""
  }. Handcrafted in ${BUSINESS.location}.`;
  const image = product.images[0] ?? `${SITE_URL}/og-default.png`;
  const canonical = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    metadataBase: new URL(SITE_URL),
    keywords: [
      product.name,
      product.category,
      "925 silver",
      "meraki fine silver",
      ...(product.audience ? [product.audience] : []),
      "handcrafted jewellery",
      "delhi ncr silver",
    ],
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "Meraki Fine Silver",
      images: [{ url: image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.isActive) {
    notFound();
  }

  const images = product.images.length > 0 ? product.images : [null];
  const inStock = product.stock > 0;

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

  const productUrl = `${SITE_URL}/products/${encodeURIComponent(product.slug)}`;
  const productImage = product.images[0] ?? `${SITE_URL}/og-default.png`;

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

      
      <div className="mt-7 grid gap-10 md:grid-cols-2 md:items-stretch">
        <div className="anim-fade-up flex min-h-0 flex-col items-start gap-3 md:h-full md:min-h-0">
          
          <div className="relative aspect-square w-full overflow-hidden border border-[var(--border-strong)] bg-white md:h-full md:w-auto md:max-w-full md:flex-none">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={product.name}
                fill
                preload
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                quality={85}
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
                  className="relative aspect-square overflow-hidden border border-[var(--border-strong)]"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`${product.name} ${i + 2}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 12vw"
                      className="object-cover"
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
            <p className="mt-2 text-base leading-relaxed text-[var(--muted)]">
              {product.description}
            </p>
          )}

          
          <dl className="mt-1 grid grid-cols-2 gap-4 border-y border-[var(--border)] py-5 text-sm">
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

          
          <p className="mt-5 text-sm text-[var(--muted)]">
            We currently ship within <span className="text-[var(--ink)]">Delhi NCR only</span>,
            with delivery in <span className="text-[var(--ink)]">3–10 business days</span>.
          </p>

          
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description
              ? `${product.description.trim()} 925 silver ${product.category.toLowerCase()}${product.audience ? ` for ${product.audience.toLowerCase()}` : ""}.`
              : `925 silver ${product.category.toLowerCase()}${product.audience ? ` for ${product.audience.toLowerCase()}` : ""}. Handcrafted in ${BUSINESS.location}.`,
            image: [productImage],
            sku: product.id.toString(),
            brand: {
              "@type": "Brand",
              name: BUSINESS.name,
            },
            category: product.category,
            audience: product.audience
              ? { "@type": "Audience", name: product.audience }
              : undefined,
            offers: {
              "@type": "Offer",
              url: productUrl,
              priceCurrency: "INR",
              price: product.price.toString(),
              availability: inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@type": "JewelryStore",
                name: BUSINESS.name,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Noida",
                  addressRegion: "Uttar Pradesh",
                  addressCountry: "IN",
                },
              },
            },
            ...(averageRating !== null && reviews.length > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: averageRating.toFixed(1),
                    reviewCount: reviews.length,
                  },
                  review: reviews.slice(0, 5).map((r) => ({
                    "@type": "Review",
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: r.rating.toString(),
                    },
                    author: { "@type": "Person", name: r.customer.name },
                    reviewBody: r.comment,
                    datePublished: r.createdAt.toISOString().split("T")[0],
                  })),
                }
              : {}),
          }),
        }}
      />
    </main>
  );
}
