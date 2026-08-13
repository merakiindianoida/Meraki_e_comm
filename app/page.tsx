import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, formatPrice } from "@/lib/catalog";
import PlaceholderImage from "@/components/PlaceholderImage";
import ProductCard from "@/components/ProductCard";
import AddToBagButton from "@/components/AddToBagButton";
import WishlistButton from "@/components/WishlistButton";
import CategoryCarousel from "@/components/CategoryCarousel";
import ShoppableVideoFeed from "@/components/ShoppableVideoFeed";

// Homepage: hero -> trust bar -> new arrivals -> category carousel ->
// the collection (4x4 grid) -> editorial banner -> featured pieces ->
// reviews. Section backgrounds deliberately alternate (white / light blue
// / dark navy) for visual rhythm rather than every section running
// together on the same background. (A dedicated newsletter section, and
// later an Instagram embed section, both used to sit between the
// editorial banner and reviews — both removed; the footer still has its
// own newsletter box.)

// Client explicitly asked for these by name/piece, not by algorithm — the
// hero banner, the New Arrivals bento's big tile, and its last small tile
// are pinned to specific products rather than "whatever's newest", which is
// what every other slot on this page still uses.
const HERO_SLUG = "petal-design-bracelet";
const NEW_ARRIVALS_HERO_SLUG = "elephant-bracelet";
const NEW_ARRIVALS_LAST_SLUG = "pink-round-necklace";

// "As Seen on Instagram" — reposted clips, not tied to any product listing
// (see components/ShoppableVideoFeed.tsx). Just a plain list of Cloudinary
// video URLs; add or remove entries here as new reels go up.
const INSTAGRAM_REELS = [
  "https://res.cloudinary.com/tksnn8ya/video/upload/v1786570169/reel-1-meraki_oafscj.mp4",
];

// Inferred straight from the query's own return type (rather than a
// hand-rolled interface) so `price` keeps its real Prisma Decimal type —
// a hand-rolled `price: unknown` would break every `.toString()` call
// below.
type HomeProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

// Round-robins across categories (in the site's own CATEGORIES order, then
// anything else) instead of picking straight off createdAt — otherwise
// whichever category was imported last (a big batch of necklaces, in this
// case) dominates every homepage section instead of the page showing the
// actual range of what's for sale.
function diversePick(
  pool: HomeProduct[],
  count: number,
  exclude: Set<string> = new Set()
): HomeProduct[] {
  const available = pool.filter((p) => !exclude.has(p.id));
  const byCategory = new Map<string, HomeProduct[]>();
  for (const p of available) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, []);
    byCategory.get(p.category)!.push(p);
  }
  const extraCategories = Array.from(byCategory.keys()).filter(
    (c) => !(CATEGORIES as readonly string[]).includes(c)
  );
  const categoryOrder = [...CATEGORIES, ...extraCategories];

  const result: HomeProduct[] = [];
  for (let round = 0; result.length < count && round < 20; round++) {
    for (const cat of categoryOrder) {
      const group = byCategory.get(cat);
      if (group && group[round]) {
        result.push(group[round]);
        if (result.length >= count) break;
      }
    }
  }
  return result;
}

export default async function Home() {
  // One query for every active product — at this catalog size (under a
  // few hundred), doing the hero pin + diversification in JS below is
  // simpler and just as fast as trying to express "one per category,
  // round-robin, minus two pinned slugs" as SQL.
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
  // Two algorithmic picks fill the middle slots, minus one if the last
  // slot is pinned and already excluded from the pool above.
  const newArrivalsRest = diversePick(allActive, newArrivalsLast ? 2 : 3, pinnedIds);
  const featured = [
    ...(newArrivalsHero ? [newArrivalsHero] : []),
    ...newArrivalsRest,
    ...(newArrivalsLast ? [newArrivalsLast] : []),
  ];
  for (const p of featured) pinnedIds.add(p.id);

  // "The Collection" grid — up to 16, diverse rather than newest-first.
  // Excludes whatever's already pinned in New Arrivals so the same piece
  // doesn't appear twice on the page.
  const collection = diversePick(allActive, 16, pinnedIds);

  // "Featured Pieces" — excludes whatever's already in New Arrivals so
  // this section doesn't just repeat the same 4 products directly above
  // the fold. There's no real "bestseller" signal (no order history yet),
  // so this stays an honestly-curated pick, not a sales claim.
  const featuredPicks = diversePick(allActive, 4, pinnedIds);

  const latest = heroProduct;

  return (
    <main>
      {/* Hero — full viewport height on desktop, text/image panels run
          edge-to-edge (no outer container, no floating-card padding). On
          mobile a stacked two-column grid can't sensibly claim 100vh (each
          half would be a cramped ~50vh), so the height constraint only
          applies at md+ and mobile falls back to content-driven height. */}
      <section className="relative border-b border-[var(--border)] md:h-screen">
        <div className="grid md:h-full md:grid-cols-2">
          <div className="relative flex flex-col justify-center overflow-hidden bg-[var(--surface)] px-6 py-14 sm:px-12 md:px-16 md:py-10 lg:px-20">
            {/* Purely decorative rings — each is actually TWO concentric
                circles (an outer boundary, a faint tinted fill, an inner
                boundary that punches the center back out to the panel's own
                background). That band is what reads as a "thick ring" —
                a single hairline circle looked too thin against the
                reference. Both pairs share a center point (inner offset =
                outer offset + half the thickness delta on each side) so
                they stay perfectly concentric. No content inside any of
                them, so they're safe to hide from screen readers. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-28 top-0 h-[27rem] w-[27rem] rounded-full border border-[rgba(90,140,190,0.35)] bg-[rgba(90,140,190,0.07)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[5.5rem] top-6 h-[24rem] w-[24rem] rounded-full border border-[rgba(90,140,190,0.35)] bg-[var(--surface)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -right-8 h-44 w-44 rounded-full border border-[rgba(90,140,190,0.3)] bg-[rgba(90,140,190,0.07)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -right-4 h-36 w-36 rounded-full border border-[rgba(90,140,190,0.3)] bg-[var(--surface)]"
            />

            <p className="anim-fade-up relative flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
              <span className="h-px w-8 bg-[var(--border-strong)]" />
              925 Silver &middot; Handcrafted
            </p>
            {/* clamp() keeps this fluid between breakpoints instead of
                jumping at fixed text-5xl/6xl steps — floors at 2.5rem on
                phones, guaranteed >=5.5rem by ~1280px+ desktop widths. */}
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

            {/* Two real numbers only — no invented customer/order count to
                sit alongside them. See project notes on why. */}
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latest.images[0]}
                alt={latest.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <PlaceholderImage category={latest?.category} />
            )}
          </div>
        </div>
      </section>

      {/* Trust bar — claims we can actually stand behind (hallmark status
          confirmed real, 2026-07-22; shipping confirmed real, 2026-07-29:
          self-shipped by the client, Delhi NCR only, no courier/Shiprocket
          integration). Still deliberately no "Returns" claim — that policy
          hasn't been decided by the client yet. */}
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

      {/* New Arrivals — white, so it reads as a distinct beat after the
          light-blue trust bar rather than blending into it. */}
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
            // Bento layout, not a uniform grid: featured[0] is a large tile
            // spanning both rows, a static promo tile breaks up the
            // remaining three products. Grid auto-placement (row, sparse)
            // fills reading-order: big tile takes col1 rows 1-2, then
            // featured[1] -> col2 row1, promo -> col3 row1, featured[2] ->
            // col2 row2, featured[3] -> col3 row2. Only "NEW" is shown as a
            // badge (derived from real createdAt) — no invented "-21%
            // SALE" or "TRENDING" tags, since there's no discount field or
            // trending logic backing those.
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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featured[0].images[0]}
                        alt={featured[0].name}
                        className="h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
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
                    {/* Same permanent-scrim + overlaid-caption language as
                        ProductCard — kept in sync manually since this tile's
                        markup (full-height flex, no fixed aspect-square) is
                        different enough that reusing that component outright
                        wasn't a clean fit. */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-black/85" />
                    {/* Same hover-reveal chip as ProductCard — this tile's
                        markup is hand-rolled rather than reusing that
                        component, so it needs its own copy. */}
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

              {/* Promo tile — real, already-established copy (handcrafted
                  claim is confirmed, same as the trust bar above), not a
                  product. Links to the full catalog rather than a specific
                  category we may not have stock in. Small decorative ring
                  in the corner, same motif as the hero rings, so this tile
                  doesn't look bare next to the photo tiles around it. */}
              <div className="relative flex flex-col justify-center overflow-hidden bg-[var(--surface)] p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full border border-[rgba(90,140,190,0.35)]"
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

      {/* Shop by category — light blue, arrow-controlled carousel (client
          component); everything else on this page stays a Server
          Component. */}
      <section className="border-y border-[var(--border)] bg-[#EAF3FB] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
            Explore
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[var(--ink)]">
            Shop by Category
          </h2>
        </div>
        <div className="mt-7">
          <CategoryCarousel categories={CATEGORIES} />
        </div>
      </section>

      {/* The Collection — white, plain 4-col grid (not the New Arrivals
          bento). No "NEW" badge here — that's reserved for the New
          Arrivals section above, since these aren't the site's actual
          new arrivals. The reference this was modeled on had per-product
          star ratings and review counts ("★★★★★ (207)"),
          sale/"trending"/"bestseller" tags — none of that exists in our
          data, so none of it is faked here. Same reasoning as the Reviews
          section below. */}
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

      {/* Editorial banner — dark navy, white text. The one deliberately
          heavy-contrast section on the page, meant as a pause between the
          lighter sections above and below it. */}
      <section className="bg-[var(--ink)] px-4 py-24 text-center sm:px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Our Promise
        </p>
        <h2 className="mx-auto mt-4 max-w-xl font-serif text-4xl leading-tight text-white">
          Silver that carries{" "}
          <span className="italic text-[var(--accent)]">your story.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base text-white/70">
          Meraki &mdash; from the Greek, meaning to do something with soul,
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

      {/* Featured Pieces — light blue, flat 4-col grid. Named "Featured"
          rather than "Bestsellers"/"Most Loved": there's no order history
          yet to back a real bestseller claim, so this is an honest curated
          pick, not a sales/popularity claim. No "NEW" badge here either —
          reserved for the New Arrivals section — and no star
          ratings/review counts, no BESTSELLER/TRENDING/SALE tags, same
          reasoning as The Collection and Reviews sections. */}
      <section className="bg-[#EAF3FB] px-4 py-20 sm:px-6">
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

      {/* Reviews — deliberately no reviews yet. Fabricated testimonials
          (invented names, quotes, a fake rating count) would be deceptive
          advertising, not just an unfinished feature, so this stays honest
          until real reviews exist to show. Stars are outlined/empty rather
          than filled — nothing here claims a rating that doesn't exist. */}
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
        <button
          type="button"
          disabled
          title="Reviews are coming soon"
          className="mt-8 cursor-not-allowed rounded-lg border border-[var(--border-strong)] px-8 py-3 text-xs uppercase tracking-[0.15em] text-[var(--muted)]"
        >
          Write a Review &mdash; Coming Soon
        </button>
      </section>
    </main>
  );
}
