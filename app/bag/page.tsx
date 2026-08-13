"use client";

import Link from "next/link";
import PlaceholderImage from "@/components/PlaceholderImage";
import QuantitySelector from "@/components/QuantitySelector";
import { useCart } from "@/lib/useCart";
import { formatPrice } from "@/lib/catalog";

// Client Component end to end — same reasoning as /wishlist: the cart only
// exists in localStorage (see lib/useCart.ts) until Clerk + a real backend
// cart land, so there's nothing for a Server Component to fetch here.
export default function BagPage() {
  const { items, setQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6">
        <h1 className="font-serif text-3xl text-[var(--ink)]">Your Bag</h1>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Your bag is empty — add a piece from the collection to see it here.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-[var(--accent)] px-8 py-3 text-sm uppercase tracking-[0.15em] text-white transition duration-500 hover:bg-[var(--accent)]/90"
        >
          Browse the Collection
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl text-[var(--ink)]">Your Bag</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_300px]">
        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <Link
                href={`/products/${item.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden border border-[var(--border-strong)]"
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderImage category={item.category} />
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
                      {item.category}
                    </p>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs uppercase tracking-[0.1em] text-[var(--muted)] transition hover:text-[var(--accent)]"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(qty) => setQuantity(item.id, qty)}
                    max={item.maxQuantity}
                  />
                  <span className="font-mono text-sm text-[var(--ink)]">
                    {formatPrice(
                      (typeof item.price === "string"
                        ? parseFloat(item.price)
                        : item.price) * item.quantity
                    )}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit space-y-5 border border-[var(--border-strong)] p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span className="font-mono text-base text-[var(--ink)]">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full rounded-lg bg-[var(--accent)] px-6 py-3.5 text-center text-sm uppercase tracking-[0.15em] text-white transition duration-500 hover:bg-[var(--accent)]/90"
          >
            Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
