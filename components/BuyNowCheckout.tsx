"use client";

import { useState } from "react";
import CheckoutClient, { type SavedAddress } from "@/components/CheckoutClient";

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
