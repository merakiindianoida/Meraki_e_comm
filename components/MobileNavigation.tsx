"use client";

import { useRef } from "react";
import Link from "next/link";
import { AUDIENCES, formatPrice } from "@/lib/catalog";
import { STOREFRONT_CATEGORIES } from "@/lib/storefrontCatalog";
import SearchBar from "@/components/SearchBar";

type LatestProduct = { name: string; slug: string; price: string };

export default function MobileNavigation({ latest }: { latest: LatestProduct[] }) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  function closeAfterNavigation(event: React.MouseEvent<HTMLDetailsElement>) {
    if (!(event.target instanceof Element) || !event.target.closest("a")) return;

    const menu = event.currentTarget;
    menu.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((disclosure) => {
      disclosure.open = false;
    });
    menu.open = false;
  }

  return (
    <details
      ref={menuRef}
      onClick={closeAfterNavigation}
      className="group/mobilenav shrink-0 md:hidden"
    >
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
                      {formatPrice(product.price)}
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
              {STOREFRONT_CATEGORIES.map((category) => (
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
        </div>
      </div>
    </details>
  );
}
