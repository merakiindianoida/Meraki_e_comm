"use client";

import { useState } from "react";
import AddressForm from "@/components/AddressForm";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/account/addresses/actions";

export type AddressListItem = {
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

// Client-side only for the "which form is open" toggle state - the actual
// reads/writes all go through Server Actions in
// app/account/addresses/actions.ts, this just decides what's on screen.
export default function AddressManager({ addresses }: { addresses: AddressListItem[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-8 space-y-4">
      {addresses.map((address) =>
        editingId === address.id ? (
          <AddressForm
            key={address.id}
            action={updateAddress.bind(null, address.id)}
            defaults={address}
            submitLabel="Save Changes"
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={address.id}
            className="flex items-start justify-between gap-4 border border-[var(--border-strong)] p-5"
          >
            <div>
              <div className="flex items-center gap-2">
                {address.label && (
                  <span className="text-xs uppercase tracking-[0.1em] text-[var(--accent)]">
                    {address.label}
                  </span>
                )}
                {address.isDefault && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-emerald-700">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--ink)]">{address.fullName}</p>
              <p className="text-sm text-[var(--muted)]">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {address.city}, {address.state} - {address.pincode}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">Phone: {address.phone}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2 text-xs uppercase tracking-[0.1em]">
              <button
                type="button"
                onClick={() => setEditingId(address.id)}
                className="text-[var(--accent)] hover:underline"
              >
                Edit
              </button>
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefaultAddress(address.id)}
                  className="text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Set as default
                </button>
              )}
              <button
                type="button"
                onClick={() => deleteAddress(address.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}

      {adding ? (
        <AddressForm
          action={createAddress}
          submitLabel="Save Address"
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="w-full border border-dashed border-[var(--border-strong)] py-4 text-sm uppercase tracking-[0.1em] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          + Add New Address
        </button>
      )}
    </div>
  );
}
