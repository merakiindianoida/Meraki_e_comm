"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/useCart";

export default function AddToBagButton({
  item,
  className,
}: {
  item: Omit<CartItem, "quantity">;
  className: string;
}) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const outOfStock = item.maxQuantity <= 0;

  return (
    <button
      type="button"
      disabled={outOfStock}
      title={outOfStock ? "Out of stock" : "Add to bag"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (outOfStock) return;
        addItem(item, 1);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1200);
      }}
      className={`${className} transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        justAdded ? "scale-[1.04]" : "scale-100"
      }`}
    >
      {outOfStock ? "Out of Stock" : justAdded ? "Added ✓" : "Add to Bag"}
    </button>
  );
}
