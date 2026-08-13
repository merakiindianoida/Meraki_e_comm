"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/app/admin/(dashboard)/products/actions";

// Server Actions can be called directly from a Client Component's event
// handler (not just via <form action>) - useTransition gives us a pending
// state to disable the button mid-request without extra plumbing.
export default function ProductActiveToggle({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleProductActive(productId, !isActive))}
      className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "border-[var(--border-strong)] text-[var(--muted)] hover:border-red-400 hover:text-red-500"
          : "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
      }`}
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
