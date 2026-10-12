"use client";

import { useCart } from "@/lib/useCart";
import CheckoutClient, { type SavedAddress } from "@/components/CheckoutClient";

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
