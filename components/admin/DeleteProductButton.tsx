"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

// Deliberately a plain window.confirm rather than a custom modal — this is
// an internal single-admin tool, not customer-facing, and the one-line
// native confirm is enough friction to stop a misclick without building
// dialog UI for it. The real safety net is server-side: deleteProduct
// refuses (see actions.ts) if the product has any order history.
export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(`Delete "${productName}" permanently? This can't be undone.`)) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await deleteProduct(productId);
            if (result?.error) setError(result.error);
          });
        }}
        className="rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-[var(--muted)] transition duration-300 hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
