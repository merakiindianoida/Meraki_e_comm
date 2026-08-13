"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/useWishlist";

// Replaces the "coming soon" IconStub now that the wishlist actually works
// (client-side, via localStorage - see lib/useWishlist.ts). Kept as its own
// component, separate from the async Server Component Header, since it
// needs the live item count.
export default function WishlistHeaderLink() {
  const { items } = useWishlist();

  return (
    <Link
      href="/wishlist"
      title="Wishlist"
      className="relative inline-flex h-10 w-10 items-center justify-center text-[var(--ink)]/70 transition hover:text-[var(--accent)]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {items.length > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-medium text-white">
          {items.length}
        </span>
      )}
    </Link>
  );
}
