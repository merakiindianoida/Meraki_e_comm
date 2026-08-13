"use client";

import { useActionState } from "react";
import type { AddressFormState } from "@/app/account/addresses/actions";

// Shared by both "add new address" and "edit address" - same fields
// either way, only the bound Server Action and pre-filled values differ.
// Same division of responsibility as components/admin/ProductForm.tsx.
export type AddressDefaults = {
  label?: string | null;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
};

export default function AddressForm({
  action,
  defaults,
  submitLabel,
  onCancel,
}: {
  action: (state: AddressFormState, formData: FormData) => Promise<AddressFormState>;
  defaults?: AddressDefaults;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4 border border-[var(--border-strong)] p-5">
      <div>
        <label htmlFor="label" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Label (optional)
        </label>
        <input
          id="label"
          name="label"
          placeholder="Home, Office, ..."
          defaultValue={defaults?.label ?? ""}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            defaultValue={defaults?.fullName}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={defaults?.phone}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="line1" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Address line 1
        </label>
        <input
          id="line1"
          name="line1"
          required
          defaultValue={defaults?.line1}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label htmlFor="line2" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Address line 2 (optional)
        </label>
        <input
          id="line2"
          name="line2"
          defaultValue={defaults?.line2 ?? ""}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            City
          </label>
          <input
            id="city"
            name="city"
            required
            defaultValue={defaults?.city}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="state" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            State
          </label>
          <input
            id="state"
            name="state"
            required
            defaultValue={defaults?.state}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="pincode" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            PIN code
          </label>
          <input
            id="pincode"
            name="pincode"
            inputMode="numeric"
            required
            defaultValue={defaults?.pincode}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={defaults?.isDefault}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        Set as default address
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-xs uppercase tracking-[0.15em] text-white transition duration-300 hover:bg-[var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs uppercase tracking-[0.1em] text-[var(--muted)] hover:text-[var(--ink)]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
