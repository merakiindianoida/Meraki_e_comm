import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AUDIENCES, CATEGORIES, COLLECTIONS, formatPrice } from "@/lib/catalog";
import SearchBar from "@/components/SearchBar";
import AccountMenu from "@/components/AccountMenu";
import WishlistHeaderLink from "@/components/WishlistHeaderLink";
import BagHeaderLink from "@/components/BagHeaderLink";

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Dropdown panel shell shared by all four nav items - hover-only (pure
// CSS, no client component), fades + slides down via the same transition
// on each. `trigger` is always a real <Link> so there's a sane fallback
// destination on touch devices that can't hover to reveal the panel.
function NavDropdown({
  trigger,
  href,
  children,
}: {
  trigger: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative shrink-0">
      <Link
        href={href}
        className="underline-hover flex items-center gap-1 whitespace-nowrap py-1 transition group-hover:text-[var(--accent)]"
      >
        {trigger}
        <Chevron />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
        <div className="w-56 border border-[var(--border-strong)] bg-white p-2 normal-case tracking-normal shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

function DropdownLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-sm text-[var(--ink)] transition hover:bg-[var(--surface)] hover:text-[var(--accent)]"
    >
      {children}
    </Link>
  );
}

export default async function Header() {
  // Powers the New Arrivals dropdown with real data - same "newest first"
  // ordering /products already uses by default, so the dropdown and its
  // "View all" link are always consistent with each other.
  const latest = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { name: true, slug: true, price: true },
  });

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/90 shadow-sm backdrop-blur-md">
      {/* Announcement strip - copy here should stay in sync with the trust
          bar on the homepage; both are hardcoded until the policy details
          (shipping threshold, returns window) are confirmed by the client. */}
      <div className="bg-[var(--ink)] py-2.5 text-center text-xs uppercase tracking-[0.2em] text-white">
        BIS Hallmarked 925 Silver &middot; Handcrafted &middot; Made With Soul
      </div>

      {/* Single row, full-bleed (no max-w container) so the logo sits at
          the true edge of the viewport rather than a centered column with
          dead space beyond it on wide screens. Logo + dropdowns cluster
          together on the left; search and icons push to the right via
          ml-auto. Logo is 20% larger than the previous pass (h-12 -> 3.6rem,
          i.e. 48px -> 57.6px). */}
      <div className="relative border-b border-[var(--border)] bg-white">
        <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-10">
          {/* Mobile nav - a native <details> disclosure instead of a client
              component, same "no JS needed" spirit as NavDropdown's pure-CSS
              hover above. Only shown below md; the hover dropdowns in the
              desktop <nav> don't work on touch (no hover event to fire), so
              this is the real navigation on phones/tablets, not just a
              cosmetic swap. */}
          <details className="group/mobilenav shrink-0 md:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-6 w-6 text-[var(--ink)] group-open/mobilenav:hidden"
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="hidden h-6 w-6 text-[var(--ink)] group-open/mobilenav:block"
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
              <span className="sr-only">Menu</span>
            </summary>

            <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[var(--border-strong)] bg-white px-4 py-4 shadow-lg sm:px-6">
              <SearchBar className="w-full" />

              <div className="mt-4 divide-y divide-[var(--border)] text-sm text-[var(--ink)]">
                <details className="py-3">
                  <summary className="cursor-pointer uppercase tracking-[0.1em] text-[var(--ink)]/75">
                    New Arrivals
                  </summary>
                  <div className="mt-2 flex flex-col gap-1 pl-2">
                    {latest.length === 0 ? (
                      <p className="py-1 text-[var(--muted)]">Nothing new yet.</p>
                    ) : (
                      latest.map((product) => (
                        <Link
                          key={product.slug}
                          href={`/products/${product.slug}`}
                          className="flex items-center justify-between gap-3 py-1.5"
                        >
                          <span className="truncate">{product.name}</span>
                          <span className="font-mono text-xs text-[var(--muted)]">
                            {formatPrice(product.price.toString())}
                          </span>
                        </Link>
                      ))
                    )}
                    <Link href="/products" className="py-1.5 font-medium text-[var(--accent)]">
                      View all &rarr;
                    </Link>
                  </div>
                </details>

                <details className="py-3">
                  <summary className="cursor-pointer uppercase tracking-[0.1em] text-[var(--ink)]/75">
                    Shop For
                  </summary>
                  <div className="mt-2 flex flex-col gap-1 pl-2">
                    {AUDIENCES.map((audience) => (
                      <Link
                        key={audience}
                        href={`/products?audience=${encodeURIComponent(audience)}`}
                        className="py-1.5"
                      >
                        {audience}
                      </Link>
                    ))}
                  </div>
                </details>

                <details className="py-3">
                  <summary className="cursor-pointer uppercase tracking-[0.1em] text-[var(--ink)]/75">
                    Shop By Category
                  </summary>
                  <div className="mt-2 flex flex-col gap-1 pl-2">
                    {CATEGORIES.map((category) => (
                      <Link
                        key={category}
                        href={`/products?category=${encodeURIComponent(category)}`}
                        className="py-1.5"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </details>

                <details className="py-3">
                  <summary className="cursor-pointer uppercase tracking-[0.1em] text-[var(--ink)]/75">
                    Shop by Collection
                  </summary>
                  <div className="mt-2 flex flex-col gap-1 pl-2">
                    {COLLECTIONS.map((collection) => (
                      <span key={collection} title="Coming soon" className="py-1.5 text-[var(--muted)]">
                        {collection}
                      </span>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </details>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Meraki" className="h-[3.6rem] w-[3.6rem]" />
            <span className="hidden text-[10px] uppercase leading-tight tracking-[0.25em] text-[var(--accent)] sm:block">
              Fine Silver
              <br />
              Jewellery
            </span>
          </Link>

          <nav className="hidden flex-wrap items-center gap-x-7 gap-y-2 text-xs uppercase tracking-[0.15em] text-[var(--ink)]/75 md:flex">
            <NavDropdown trigger="New Arrivals" href="/products">
              {latest.length === 0 ? (
                <p className="px-3 py-2 text-sm text-[var(--muted)]">
                  Nothing new yet — check back soon.
                </p>
              ) : (
                <>
                  {latest.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-[var(--ink)] transition hover:bg-[var(--surface)] hover:text-[var(--accent)]"
                    >
                      <span className="truncate">{product.name}</span>
                      <span className="font-mono text-xs text-[var(--muted)]">
                        {formatPrice(product.price.toString())}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/products"
                    className="mt-1 block border-t border-[var(--border)] px-3 pt-2 text-sm font-medium text-[var(--accent)]"
                  >
                    View all &rarr;
                  </Link>
                </>
              )}
            </NavDropdown>

            <NavDropdown trigger="Shop For" href="/products">
              {AUDIENCES.map((audience) => (
                <DropdownLink
                  key={audience}
                  href={`/products?audience=${encodeURIComponent(audience)}`}
                >
                  {audience}
                </DropdownLink>
              ))}
            </NavDropdown>

            <NavDropdown trigger="Shop By Category" href="/products">
              {CATEGORIES.map((category) => (
                <DropdownLink
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                >
                  {category}
                </DropdownLink>
              ))}
            </NavDropdown>

            {/* Collections aren't wired to the database yet
                (Product.collections is staged in schema.prisma but
                unmigrated) — listed here so the nav structure is final,
                but each entry is inert rather than linking to a filter
                that doesn't work. */}
            <NavDropdown trigger="Shop by Collection" href="/products">
              {COLLECTIONS.map((collection) => (
                <span
                  key={collection}
                  title="Coming soon"
                  className="block cursor-not-allowed px-3 py-2 text-sm text-[var(--muted)]"
                >
                  {collection}
                </span>
              ))}
            </NavDropdown>
          </nav>

          {/* ml-auto instead of justify-between on the row — lets the nav
              above hug the logo tightly while this block still pins to the
              far right regardless of how much space the nav takes up. */}
          <div className="ml-auto flex shrink-0 items-center gap-4">
            <SearchBar className="hidden md:block md:w-[10rem] lg:w-[19.2rem]" />
            <div className="flex items-center gap-1">
              <AccountMenu />
              <WishlistHeaderLink />
              <BagHeaderLink />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
