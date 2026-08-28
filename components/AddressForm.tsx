"use client";

import { useActionState } from "react";
import type { AddressFormState } from "@/app/account/addresses/actions";
import AddressFields, { type AddressFieldDefaults } from "@/components/AddressFields";

// Shared by both "add new address" and "edit address" - same fields
// either way, only the bound Server Action and pre-filled values differ.
// Same division of responsibility as components/admin/ProductForm.tsx.
export type AddressDefaults = AddressFieldDefaults & {
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
      <AddressFields defaults={defaults} />

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
