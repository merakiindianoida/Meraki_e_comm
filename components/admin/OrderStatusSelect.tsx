"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";

const NEXT_STATUSES: Record<string, readonly string[]> = {
  PENDING: ["PENDING", "PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_FAILED: ["PAYMENT_FAILED"],
  PAID: ["PAID", "PACKED", "CANCELLED"],
  PACKED: ["PACKED", "SHIPPED"],
  SHIPPED: ["SHIPPED", "DELIVERED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
};

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateOrderStatus(orderId, e.target.value))}
      className="border border-[var(--border-strong)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)] disabled:opacity-50"
    >
      {(NEXT_STATUSES[status] ?? [status]).map((s) => (
        <option key={s} value={s}>
          {s === "PAYMENT_FAILED" ? "Payment Failed" : s}
        </option>
      ))}
    </select>
  );
}
