"use client";

import { useState, useActionState } from "react";
import { submitReview, type ReviewState } from "@/app/orders/actions";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      <path
        d="M12 3.5l2.47 5.51 5.98.6-4.5 4.06 1.28 5.93L12 16.75l-5.23 2.85 1.28-5.93-4.5-4.06 5.98-.6L12 3.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Per order item, not per order - same reasoning as ReturnRequestForm: a
// review is always against one specific purchased product (see
// Review.orderItemId in schema.prisma), so this renders once per line item.
export default function ReviewForm({
  orderItemId,
  existingReview,
}: {
  orderItemId: string;
  existingReview?: { rating: number; comment: string | null } | null;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const boundAction = submitReview.bind(null, orderItemId);
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    boundAction,
    undefined
  );

  if (existingReview) {
    return (
      <div className="flex items-center gap-2 text-[var(--accent)]">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} filled={n <= existingReview.rating} />
        ))}
        <span className="text-xs text-[var(--muted)]">Your review</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs uppercase tracking-[0.1em] text-[var(--accent)] hover:underline"
      >
        Rate this item
      </button>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-xs space-y-2">
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1 text-[var(--accent)]">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="transition hover:scale-110"
          >
            <Star filled={n <= rating} />
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={2}
        placeholder="Anything you'd like to add? (optional)"
        className="w-full border border-[var(--border)] bg-white px-2.5 py-2 text-xs text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
      />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="text-xs uppercase tracking-[0.1em] text-[var(--accent)] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit Review"}
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
