"use client";

import { useTransition } from "react";
import { updateReturnStatus } from "@/app/admin/(dashboard)/returns/actions";

const STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "REFUNDED"] as const;

export default function ReturnStatusSelect({
  returnId,
  status,
}: {
  returnId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateReturnStatus(returnId, e.target.value))}
      className="border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)] disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
