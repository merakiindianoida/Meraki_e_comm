"use client";

import { useState, type FormEvent } from "react";
import PlaceholderImage from "@/components/PlaceholderImage";
import QuantitySelector from "@/components/QuantitySelector";
import AddressFields from "@/components/AddressFields";
import { formatPrice } from "@/lib/catalog";

// Generic over line items rather than tied to a single product - this is
// what lets both /checkout (whatever's in the bag) and
// /products/[slug]/checkout (a single-item Buy Now, bypassing the bag)
// reuse the exact same form, summary and submit logic instead of forking
// it. Callers own the item list and quantity state; this component only
// renders it and talks to the API.
export type CheckoutLineItem = {
  id: string;
  name: string;
  image: string | null;
  category: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
};

export type SavedAddress = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export default function CheckoutClient({
  items,
  onQuantityChange,
  onOrderPlaced,
  addresses = [],
}: {
  items: CheckoutLineItem[];
  onQuantityChange: (id: string, quantity: number) => void;
  // Called right before redirecting to PhonePe - e.g. the bag-based
  // checkout clears the cart here; the single-item Buy Now flow has
  // nothing to clear, so it just omits this prop.
  onOrderPlaced?: () => void;
  // Signed-in customer's saved addresses (see app/account/addresses) -
  // empty for a customer who has never saved one, in which case this just
  // falls back to the plain phone + address fields it always had.
  addresses?: SavedAddress[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultAddressId = addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddressId);
  const [addingNew, setAddingNew] = useState(addresses.length === 0);

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const useSavedAddress = !addingNew && selectedAddressId;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          ...(useSavedAddress
            ? { addressId: selectedAddressId }
            : {
                newAddress: {
                  fullName: form.get("fullName"),
                  phone: form.get("phone"),
                  line1: form.get("line1"),
                  line2: form.get("line2") || undefined,
                  city: form.get("city"),
                  state: form.get("state"),
                  pincode: form.get("pincode"),
                },
              }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Couldn't place your order. Please try again.");
        setSubmitting(false);
        return;
      }

      onOrderPlaced?.();
      // A full navigation, not router.push — PhonePe's checkout page is a
      // different origin entirely, so this has to leave the Next.js app.
      window.location.href = data.redirectUrl;
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <p className="border border-[var(--border-strong)] p-8 text-center text-sm text-[var(--muted)]">
        There&apos;s nothing to check out.
      </p>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px]">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 border border-[var(--border-strong)] p-6 sm:p-8"
      >
        {addresses.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
              Deliver to
            </span>
            <div className="mt-2 space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex cursor-pointer items-start gap-3 border p-3 text-sm transition ${
                    !addingNew && selectedAddressId === address.id
                      ? "border-[var(--accent)] bg-[var(--surface)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    className="mt-1 accent-[var(--accent)]"
                    checked={!addingNew && selectedAddressId === address.id}
                    onChange={() => {
                      setSelectedAddressId(address.id);
                      setAddingNew(false);
                    }}
                  />
                  <span>
                    {address.label && (
                      <span className="mr-2 text-xs uppercase tracking-[0.1em] text-[var(--accent)]">
                        {address.label}
                      </span>
                    )}
                    <span className="block font-medium text-[var(--ink)]">
                      {address.fullName}
                    </span>
                    <span className="block text-[var(--muted)]">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                      {address.state} - {address.pincode}
                    </span>
                  </span>
                </label>
              ))}
              <label
                className={`flex cursor-pointer items-center gap-3 border p-3 text-sm transition ${
                  addingNew ? "border-[var(--accent)] bg-[var(--surface)]" : "border-[var(--border)]"
                }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  className="accent-[var(--accent)]"
                  checked={addingNew}
                  onChange={() => setAddingNew(true)}
                />
                Use a new address
              </label>
            </div>
          </div>
        )}

        {addingNew && <AddressFields showLabel={false} />}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[var(--accent)] px-6 py-3.5 text-sm uppercase tracking-[0.15em] text-white transition duration-300 hover:bg-[var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Redirecting to PhonePe…" : "Proceed to Pay"}
        </button>
        <p className="text-center text-[11px] text-[var(--muted)]">
          You&apos;ll be redirected to PhonePe to complete payment securely.
        </p>
        {/* Confirmed with the client 2026-07-29: self-shipped, Delhi NCR
            only, no courier integration — restated here since this is the
            last screen before an order is actually placed. */}
        <p className="text-center text-[11px] text-[var(--muted)]">
          We currently ship within Delhi NCR only. Delivery takes 3–10
          business days.
        </p>
      </form>

      <div className="h-fit space-y-5 border border-[var(--border-strong)] p-6">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden border border-[var(--border)]">
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
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[var(--ink)]">{item.name}</p>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {formatPrice(item.unitPrice)} each
                  </span>
                </div>
                <QuantitySelector
                  value={item.quantity}
                  onChange={(qty) => onQuantityChange(item.id, qty)}
                  max={item.maxQuantity}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
          <span className="text-[var(--muted)]">Total</span>
          <span className="font-mono text-base text-[var(--ink)]">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
