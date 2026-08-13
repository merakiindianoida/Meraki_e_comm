"use client";

import { useState, useTransition } from "react";
import { cancelOrder } from "@/app/orders/actions";

// Two-step inline confirm (click "Cancel Order" -> "Are you sure? Yes/No")
// rather than a native window.confirm() dialog, to match the rest of the
// site's styling instead of dropping into a browser-chrome popup.
export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em]">
        <span className="text-[var(--muted)]">Cancel this order?</span>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className="text-red-600 hover:underline disabled:opacity-60"
        >
          {pending ? "Cancelling…" : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-[var(--muted)] hover:text-[var(--ink)]"
        >
          Never mind
        </button>
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs uppercase tracking-[0.1em] text-red-600 hover:underline"
      >
        Cancel Order
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
