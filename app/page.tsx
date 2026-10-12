import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/catalog";
import { STOREFRONT_CATEGORIES } from "@/lib/storefrontCatalog";
import { diversePick } from "@/lib/diversePick";
import PlaceholderImage from "@/components/PlaceholderImage";
import ProductCard from "@/components/ProductCard";
import AddToBagButton from "@/components/AddToBagButton";
import WishlistButton from "@/components/WishlistButton";
import CategoryCarousel from "@/components/CategoryCarousel";
import ShoppableVideoFeed from "@/components/ShoppableVideoFeed";
import { BUSINESS } from "@/lib/siteInfo";

export const revalidate = 60;


const HERO_SLUG = "petal-design-bracelet";
const NEW_ARRIVALS_HERO_SLUG = "elephant-bracelet";
const NEW_ARRIVALS_LAST_SLUG = "pink-round-necklace";

const INSTAGRAM_REELS = [
  "https://res.cloudinary.com/tksnn8ya/video/upload/v1786570169/reel-1-meraki_oafscj.mp4",
  "https://res.cloudinary.com/tksnn8ya/video/upload/v1787940181/5b7f69fe-cbed-4eab-9db7-27404311f521_yyp1ts.mp4",
  "https://res.cloudinary.com/tksnn8ya/video/upload/v1787940138/0a793315-adb6-4ca6-bd92-defbc4abfe1b_a7ujaa.mp4",
  "https://res.cloudinary.com/tksnn8ya/video/upload/v1787940129/04cb0d2e-147c-4aa3-9d96-7f1304dab03f_vxuflh.mp4",
  "https://res.cloudinary.com/tksnn8ya/video/upload/v1787940121/8141c5ae-af58-482b-acd4-780468acb7e8_f6pogw.mp4",
];

export default async function Home() {
  const allActive = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const designCount = allActive.length;
  const heroProduct =
    allActive.find((p) => p.slug === HERO_SLUG) ?? allActive[0] ?? null;
  const newArrivalsHero =
    allActive.find((p) => p.slug === NEW_ARRIVALS_HERO_SLUG) ?? allActive[0] ?? null;
  const newArrivalsLast =
    allActive.find((p) => p.slug === NEW_ARRIVALS_LAST_SLUG) ?? null;

  const pinnedIds = new Set(newArrivalsHero ? [newArrivalsHero.id] : []);
  if (newArrivalsLast) pinnedIds.add(newArrivalsLast.id);
  const newArrivalsRest = diversePick(allActive, newArrivalsLast ? 2 : 3, pinnedIds);
  const featured = [
    ...(newArrivalsHero ? [newArrivalsHero] : []),
    ...newArrivalsRest,
    ...(newArrivalsLast ? [newArrivalsLast] : []),
  ];
  for (const p of featured) pinnedIds.add(p.id);

  const collection = diversePick(allActive, 16, pinnedIds);

  const featuredPicks = diversePick(allActive, 4, pinnedIds);

  const latest = heroProduct;

  return (
    <main>
      
      <section className="relative border-b border-[var(--border)] md:h-screen">
        <div className="grid md:h-full md:grid-cols-2">
          <div className="relative flex flex-col justify-center overflow-hidden bg-[var(--surface)] px-6 py-14 sm:px-12 md:px-16 md:py-10 lg:px-20">
            
            <div
              aria-hidden
              className="pointer-events-none absolute -right-28 top-0 h-[27rem] w-[27rem] rounded-full border border-[rgba(111,168,229,0.35)] bg-[rgba(111,168,229,0.07)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[5.5rem] top-6 h-[24rem] w-[24rem] rounded-full border border-[rgba(111,168,229,0.35)] bg-[var(--surface)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-8 h-44 w-44 rounded-full border border-[rgba(111,168,229,0.3)] bg-[rgba(111,168,229,0.07)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -right-4 h-36 w-36 rounded-full border border-[rgba(111,168,229,0.3)] bg-[var(--surface)]"
            />

            <p className="anim-fade-up relative flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              <span className="h-px w-8 bg-[var(--border-strong)]" />
              Meraki Fine Silver &middot; Handcrafted 925 Silver
            </p>
            
            <h1
              className="anim-fade-up relative mt-4 text-[clamp(2.25rem,2.5vw+3rem,5rem)] font-serif leading-[1.05] text-[var(--ink)]"
              style={{ animationDelay: "0.1s" }}
            >
              Crafted in silver,{" "}
              <span className="italic text-[var(--accent)]">worn with</span>{" "}
              intention.
            </h1>
            <p
              className="anim-fade-up relative mt-4 max-w-md text-base text-[var(--muted)] sm:text-lg"
              style={{ animationDelay: "0.2s" }}
            >
              925 hallmarked sterling silver. From a baby&apos;s first
              nazariya to an heirloom bangle &mdash; pieces made for kids,
              women, and men alike.
            </p>
            <div
              className="anim-fade-up relative mt-6 flex flex-wrap gap-3"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href="/products"
                className="rounded-lg bg-[var(--ink)] px-10 py-3.5 text-sm uppercase tracking-[0.15em] text-white transition hover:scale-[1.03] hover:opacity-90"
              >
                Shop Now
              </Link>
            </div>

            
            <div
              className="anim-fade-up relative mt-6 flex gap-10 border-t border-[var(--border-strong)] pt-5"
              style={{ animationDelay: "0.4s" }}
            >
              <div>
                <p className="font-mono text-lg text-[var(--ink)]">
                  {designCount}+
                </p>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
                  Unique Designs
                </p>
              </div>
              <div>
                <p className="font-mono text-lg text-[var(--ink)]">925</p>
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
                  BIS Hallmarked
                </p>
              </div>
            </div>
          </div>

          <div className="anim-fade-up relative h-80 overflow-hidden sm:h-[28rem] md:h-full">
            {latest?.images?.[0] ? (
              <Image
                src={latest.images[0]}
                alt={latest.name}
                fill
                preload
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                quality={85}
              />
            ) : (
              <PlaceholderImage category={latest?.category} />
            )}
          </div>
        </div>
      </section>

      
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 text-center sm:grid-cols-5 sm:px-6">
          {[
            { label: "925 Sterling Silver", caption: "Purity Guaranteed" },
            { label: "BIS Hallmarked", caption: "Certified Quality" },
            { label: "Handcrafted", caption: "Skilled Artisans" },
            { label: "Tarnish Resistant", caption: "Everyday Wear" },
            { label: "Delhi NCR Delivery", caption: "3–10 Business Days" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-sm font-medium text-[var(--ink)]">
                {item.label}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                {item.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-3xl text-[var(--ink)]">
              New Arrivals
            </h2>
            <Link
              href="/products"
              className="underline-hover text-base text-[var(--accent)]"
            >
              View all
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              Products will appear here as soon as they&apos;re added to the
              catalog.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:grid-rows-2">
              {featured[0] && (
                <div className="hover-lift relative sm:row-span-2">
                  <span className="absolute left-2 top-2 z-10 bg-[var(--accent)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
                    New
                  </span>
                  <Link
                    href={`/products/${featured[0].slug}`}
                    className="group relative block aspect-[4/5] h-full overflow-hidden border border-[var(--border-strong)] sm:aspect-auto"
                  >
                    {featured[0].images?.[0] ? (
                      <Image
                        src={featured[0].images[0]}
                        alt={featured[0].name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                    ) : (
                      <PlaceholderImage category={featured[0].category} />
                    )}
                    <WishlistButton
                      item={{
                        id: featured[0].id,
                        slug: featured[0].slug,
                        name: featured[0].name,
                        price: featured[0].price.toString(),
                        image: featured[0].images?.[0] ?? null,
                        category: featured[0].category,
                      }}
                    />
                    
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-black/85" />
                    
                    <div className="absolute inset-x-4 bottom-20 translate-y-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
                      <AddToBagButton
                        item={{
                          id: featured[0].id,
                          slug: featured[0].slug,
                          name: featured[0].name,
                          price: featured[0].price.toString(),
                          image: featured[0].images?.[0] ?? null,
                          category: featured[0].category,
                          maxQuantity: featured[0].stock,
                        }}
                        className="block w-full rounded-lg bg-white py-2 text-center text-xs uppercase tracking-[0.15em] text-[var(--ink)] transition duration-500 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <div className="absolute inset-x-4 bottom-4 text-white">
                      <p className="text-xs uppercase tracking-[0.15em] text-white/70">
                        {featured[0].category}
                      </p>
                      <h3 className="font-serif text-2xl">{featured[0].name}</h3>
                      <p className="font-mono text-base text-white/90">
                        {formatPrice(featured[0].price.toString())}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {featured[1] && (
                <div className="hover-lift relative">
                  <span className="absolute left-2 top-2 z-10 bg-[var(--accent)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
                    New
                  </span>
                  <ProductCard
                    product={{
                      id: featured[1].id,
                      slug: featured[1].slug,
                      name: featured[1].name,
                      price: featured[1].price.toString(),
                      images: featured[1].images,
                      category: featured[1].category,
                      stock: featured[1].stock,
                    }}
                  />
                </div>
              )}

              
              <div className="relative flex flex-col justify-center overflow-hidden bg-[var(--surface)] p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full border border-[rgba(111,168,229,0.35)]"
                />
                <p className="relative text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Handcrafted
                </p>
                <h3 className="relative mt-2 font-serif text-2xl text-[var(--ink)]">
                  Worn <span className="italic text-[var(--accent)]">every</span> day.
                </h3>
                <Link
                  href="/products"
                  className="underline-hover relative mt-4 text-sm uppercase tracking-[0.1em] text-[var(--accent)]"
                >
                  Shop Now &rarr;
                </Link>
              </div>

              {featured[2] && (
                <div className="hover-lift relative">
                  <span className="absolute left-2 top-2 z-10 bg-[var(--accent)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
                    New
                  </span>
                  <ProductCard
                    product={{
                      id: featured[2].id,
                      slug: featured[2].slug,
                      name: featured[2].name,
                      price: featured[2].price.toString(),
                      images: featured[2].images,
                      category: featured[2].category,
                      stock: featured[2].stock,
                    }}
                  />
                </div>
              )}

              {featured[3] && (
                <div className="hover-lift relative">
                  <span className="absolute left-2 top-2 z-10 bg-[var(--accent)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
                    New
                  </span>
                  <ProductCard
                    product={{
                      id: featured[3].id,
                      slug: featured[3].slug,
                      name: featured[3].name,
                      price: featured[3].price.toString(),
                      images: featured[3].images,
                      category: featured[3].category,
                      stock: featured[3].stock,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      
      <section className="border-y border-[var(--border)] bg-[var(--surface)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            Explore
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">
            Shop by Category
          </h2>
        </div>
        <div className="mt-7">
          <CategoryCarousel categories={STOREFRONT_CATEGORIES} />
        </div>
      </section>

      
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-3xl text-[var(--ink)]">
              The Collection
            </h2>
            <Link
              href="/products"
              className="underline-hover text-base text-[var(--accent)]"
            >
              View all
            </Link>
          </div>

          {collection.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              Products will appear here as soon as they&apos;re added to the
              catalog.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {collection.map((product) => (
                <div key={product.id} className="hover-lift relative">
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
        </div>
      </section>

      <ShoppableVideoFeed videos={INSTAGRAM_REELS} />

      
      <section className="bg-[var(--ink)] px-4 py-24 text-center sm:px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Our Promise
        </p>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-4xl leading-tight text-white">
          Silver that carries{" "}
          <span className="italic text-[var(--accent)]">your story.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base text-white/70">
          Meraki Fine Silver — the word meraki, from the Greek, means to do something with soul,
          creativity, and love. Each piece is hallmarked, handcrafted, and
          made to last a lifetime.
        </p>
        <Link
          href="/products"
          className="mt-9 inline-block rounded-lg border border-white/30 px-10 py-3.5 text-sm uppercase tracking-[0.15em] text-white transition hover:scale-[1.03] hover:border-white hover:bg-white/10"
        >
          Explore All Pieces
        </Link>
      </section>

      
      <section className="bg-[var(--surface)] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            <span className="h-px w-8 bg-[var(--border-strong)]" />
            Featured
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h2 className="font-serif text-3xl text-[var(--ink)]">
              Featured Pieces
            </h2>
            <Link
              href="/products"
              className="underline-hover text-base text-[var(--accent)]"
            >
              View all
            </Link>
          </div>

          {featuredPicks.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              Products will appear here as soon as they&apos;re added to the
              catalog.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {featuredPicks.map((product) => (
                <div key={product.id} className="hover-lift relative">
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
        </div>
      </section>

      
      <section className="bg-white px-4 py-24 text-center sm:px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
          Reviews
        </p>
        <h2 className="mx-auto mt-4 font-serif text-4xl text-[var(--ink)]">
          <span className="italic text-[var(--accent)]">Worn</span> with
          love.
        </h2>
        <div className="mt-6 flex justify-center gap-1" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6 text-[var(--border-strong)]"
            >
              <path
                d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6L12 3z"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-md text-base text-[var(--muted)]">
          No reviews yet &mdash; be the first to tell us what you think once
          your order arrives.
        </p>
        <Link
          href="/orders"
          className="mt-8 inline-block rounded-lg border border-[var(--border-strong)] px-8 py-3 text-xs uppercase tracking-[0.15em] text-[var(--ink)] transition duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Write a Review
        </Link>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JewelryStore",
            name: BUSINESS.name,
            alternateName: "Meraki India",
            description: "Handcrafted BIS hallmarked 925 silver jewellery for kids, women, and men. Made with soul in Noida.",
            url: `https://${BUSINESS.website}`,
            telephone: BUSINESS.phoneDisplay,
            email: BUSINESS.email,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Noida",
              addressRegion: "Uttar Pradesh",
              addressCountry: "IN",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 28.5355,
              longitude: 77.391,
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "10:00",
              closes: "19:00",
            },
            sameAs: [
              "https://instagram.com/meraki.fine.silver",
              BUSINESS.whatsappHref,
            ],
            priceRange: "₹₹",
          }),
        }}
      />
    </main>
  );
}
