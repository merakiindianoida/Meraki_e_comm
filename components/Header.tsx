import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AUDIENCES, formatPrice } from "@/lib/catalog";
import { STOREFRONT_CATEGORIES } from "@/lib/storefrontCatalog";
import SearchBar from "@/components/SearchBar";
import MobileNavigation from "@/components/MobileNavigation";
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
  const latest = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { name: true, slug: true, price: true },
  });

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/90 shadow-sm backdrop-blur-md">
      
      <div className="bg-[var(--ink)] py-2.5 text-center text-xs uppercase tracking-[0.2em] text-white">
        BIS Hallmarked 925 Silver &middot; Handcrafted &middot; Made With Soul
      </div>

      
      <div className="relative border-b border-[var(--border)] bg-white">
        <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-10">
          
          <MobileNavigation
            latest={latest.map((product) => ({
              ...product,
              price: product.price.toString(),
            }))}
          />

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Meraki Fine Silver - 925 Silver Jewellery"
              width={144}
              height={144}
              unoptimized
              className="h-[3.6rem] w-[3.6rem]"
            />
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
              {STOREFRONT_CATEGORIES.map((category) => (
                <DropdownLink
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                >
                  {category}
                </DropdownLink>
              ))}
            </NavDropdown>

          </nav>

          
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
