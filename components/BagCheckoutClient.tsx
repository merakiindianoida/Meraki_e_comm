"use client";

import { useCart } from "@/lib/useCart";
import CheckoutClient, { type SavedAddress } from "@/components/CheckoutClient";

// Checkout for whatever's currently in the bag - client-side end to end
// since the cart itself only exists in localStorage (see lib/useCart.ts).
// Saved addresses come from the server (see app/checkout/page.tsx) since
// they live in the database, not localStorage.
export default function BagCheckoutClient({ addresses }: { addresses: SavedAddress[] }) {
  const { items, setQuantity, clear } = useCart();

  return (
    <CheckoutClient
      items={items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        category: item.category,
        unitPrice: typeof item.price === "string" ? parseFloat(item.price) : item.price,
        quantity: item.quantity,
        maxQuantity: item.maxQuantity,
      }))}
      onQuantityChange={setQuantity}
      onOrderPlaced={clear}
      addresses={addresses}
    />
  );
}
