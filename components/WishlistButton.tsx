"use client";

import { useWishlist, type WishlistItem } from "@/lib/useWishlist";

// Isolated to its own Client Component just for the onClick and wishlist
// state - event handlers can't be passed as props from a Server Component,
// and ProductCard (which renders this) otherwise has no reason to be a
// Client Component itself. Swallows the click so tapping the heart doesn't
// also trigger the card's outer <Link> navigation.
export default function WishlistButton({ item }: { item: WishlistItem }) {
  const { has, toggle } = useWishlist();
  const active = has(item.id);

  return (
    <button
      type="button"
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 transition duration-500 ${
        active
          ? "text-red-500 opacity-100"
          : "text-[var(--ink)] opacity-0 group-hover:opacity-100"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
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
  );
}
