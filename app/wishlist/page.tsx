"use client";

import Link from "next/link";
import PlaceholderImage from "@/components/PlaceholderImage";
import { useWishlist } from "@/lib/useWishlist";
import { formatPrice } from "@/lib/catalog";

// Client Component end to end — the wishlist only exists in localStorage
// (see lib/useWishlist.ts), so there's nothing for a Server Component to
// fetch here.
export default function WishlistPage() {
  const { items, toggle } = useWishlist();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl text-[var(--ink)]">Your Wishlist</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Nothing saved yet — tap the heart on any product to add it here.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/products/${item.slug}`} className="block">
                <div className="aspect-square overflow-hidden border border-[var(--border-strong)]">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                  ) : (
                    <PlaceholderImage category={item.category} />
                  )}
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
                  {item.category}
                </p>
                <h3 className="text-sm font-medium text-[var(--ink)]">{item.name}</h3>
                <p className="font-mono text-sm text-[var(--accent)]">
                  {formatPrice(item.price)}
                </p>
              </Link>
              <button
                type="button"
                title="Remove from wishlist"
                onClick={() => toggle(item)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-500 transition hover:bg-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
