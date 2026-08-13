"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

// Replaces the "coming soon" IconStub now that the bag actually works
// (client-side, via localStorage - see lib/useCart.ts). Same pattern as
// WishlistHeaderLink: its own component so the count can be live without
// making the async Server Component Header itself a Client Component.
export default function BagHeaderLink() {
  const { totalCount } = useCart();

  return (
    <Link
      href="/bag"
      title="Bag"
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
          d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 116 0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {totalCount > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-medium text-white">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
