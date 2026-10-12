"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";
import { NEXT_ORDER_STATUSES } from "@/lib/orderStatus";

export default function OrderStatusSelect({
  orderId,
  status,
  refundStatus,
}: {
  orderId: string;
  status: string;
  refundStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateOrderStatus(orderId, e.target.value))}
      className="border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)] disabled:opacity-50"
    >
      {(NEXT_ORDER_STATUSES[status] ?? [status])
        .filter((s) => s !== "REFUNDED" || refundStatus === "PENDING" || status === "REFUNDED")
        .map((s) => (
          <option key={s} value={s}>
            {s === "PAYMENT_FAILED" ? "Payment Failed" : s === "REFUNDED" ? "Refunded" : s}
          </option>
        ))}
    </select>
  );
}
