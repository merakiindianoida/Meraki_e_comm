"use client";

import { useState, useActionState } from "react";
import { requestReturn, type ReturnRequestState } from "@/app/orders/actions";

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Return requested — under review",
  APPROVED: "Return approved",
  REJECTED: "Return request rejected",
  REFUNDED: "Refunded",
};

// Per order item, not per order - a return is always against one specific
// purchased product (see ReturnRequest.orderItemId in schema.prisma), so
// this renders once per line item rather than once per order.
export default function ReturnRequestForm({
  orderItemId,
  existingStatus,
}: {
  orderItemId: string;
  existingStatus?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = requestReturn.bind(null, orderItemId);
  const [state, formAction, pending] = useActionState<ReturnRequestState, FormData>(
    boundAction,
    undefined
  );

  if (existingStatus) {
    return (
      <span className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
        {STATUS_LABEL[existingStatus] ?? existingStatus}
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs uppercase tracking-[0.1em] text-[var(--accent)] hover:underline"
      >
        Request a Return
      </button>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-xs space-y-2">
      <textarea
        name="reason"
        required
        rows={2}
        placeholder="Why are you returning this item?"
        className="w-full border border-[var(--border)] bg-white px-2.5 py-2 text-xs text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
      />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="text-xs uppercase tracking-[0.1em] text-[var(--accent)] hover:underline disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs uppercase tracking-[0.1em] text-[var(--muted)] hover:text-[var(--ink)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
