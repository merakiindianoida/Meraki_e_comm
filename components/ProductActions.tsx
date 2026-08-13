"use client";

import { useState } from "react";
import Link from "next/link";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/lib/useCart";

// Isolated to its own Client Component just for the quantity + cart state —
// the product detail page around it stays a Server Component. Add to Bag
// adds the chosen quantity to the persisted cart and stays on this page
// (same "keep shopping" convention as the grid cards); Buy Now instead
// skips the cart entirely and carries the quantity straight through to an
// express checkout for just this item.
export default function ProductActions({
  product,
  inStock,
  maxQuantity,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number | string;
    image: string | null;
    category: string;
  };
  inStock: boolean;
  maxQuantity: number;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!inStock) {
    return (
      <button
        disabled
        className="mt-9 w-full cursor-not-allowed rounded-lg bg-[var(--ink)]/40 px-9 py-3.5 text-sm uppercase tracking-[0.15em] text-white"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="mt-9 space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Quantity
        </span>
        <QuantitySelector value={quantity} onChange={setQuantity} max={maxQuantity} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            addItem({ ...product, maxQuantity }, quantity);
            setJustAdded(true);
            window.setTimeout(() => setJustAdded(false), 1200);
          }}
          className={`w-full transform-gpu rounded-lg bg-[var(--ink)] px-6 py-3.5 text-xs uppercase tracking-[0.15em] text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--ink)]/90 sm:text-sm ${
            justAdded ? "scale-[1.03]" : "scale-100"
          }`}
        >
          {justAdded ? "Added to Bag ✓" : "Add to Bag"}
        </button>
        <Link
          href={`/products/${product.slug}/checkout?qty=${quantity}`}
          className="w-full rounded-lg bg-[var(--accent)] px-6 py-3.5 text-center text-xs uppercase tracking-[0.15em] text-white transition duration-500 hover:bg-[var(--accent)]/90 sm:text-sm"
        >
          Buy Now
        </Link>
      </div>
    </div>
  );
}
