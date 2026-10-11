"use client";

import { useTransition } from "react";
import { updateReturnStatus } from "@/app/admin/(dashboard)/returns/actions";

const NEXT_STATUSES: Record<string, readonly string[]> = {
  REQUESTED: ["REQUESTED", "APPROVED", "REJECTED"],
  APPROVED: ["APPROVED", "REJECTED", "RECEIVED"],
  REJECTED: ["REJECTED"],
  RECEIVED: ["RECEIVED", "REFUND_INITIATED"],
  REFUND_INITIATED: ["REFUND_INITIATED", "REFUNDED"],
  REFUNDED: ["REFUNDED"],
};

export default function ReturnStatusSelect({
  returnId,
  status,
  type,
}: {
  returnId: string;
  status: string;
  type: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateReturnStatus(returnId, e.target.value))}
      className="border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)] disabled:opacity-50"
    >
      {(type === "EXCHANGE" && status === "RECEIVED"
        ? ["RECEIVED"]
        : NEXT_STATUSES[status] ?? [status]
      ).map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
