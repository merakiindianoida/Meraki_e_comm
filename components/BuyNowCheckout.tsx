"use client";

import { useState } from "react";
import CheckoutClient, { type SavedAddress } from "@/components/CheckoutClient";

// Thin client wrapper around CheckoutClient for the single-item "Buy Now"
// flow - it bypasses the bag entirely, so quantity lives in local state
// here rather than in the cart store. See app/products/[slug]/checkout.
export default function BuyNowCheckout({
  productId,
  name,
  image,
  category,
  unitPrice,
  maxQuantity,
  initialQuantity,
  addresses,
}: {
  productId: string;
  name: string;
  image: string | null;
  category: string;
  unitPrice: number;
  maxQuantity: number;
  initialQuantity: number;
  addresses: SavedAddress[];
}) {
  const [quantity, setQuantity] = useState(initialQuantity);

  return (
    <CheckoutClient
      items={[
        {
          id: productId,
          name,
          image,
          category,
          unitPrice,
          quantity,
          maxQuantity,
        },
      ]}
      onQuantityChange={(_id, quantity) => setQuantity(quantity)}
      addresses={addresses}
    />
  );
}
