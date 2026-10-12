import { OrderStatus } from "@/app/generated/prisma/client";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PAYMENT_FAILED: "border-red-200 bg-red-50 text-red-700",
  PAID: "border-blue-200 bg-blue-50 text-blue-700",
  PACKED: "border-violet-200 bg-violet-50 text-violet-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] ${STATUS_STYLES[status]}`}
    >
      {status === "PAYMENT_FAILED" ? "Payment Failed" : status}
    </span>
  );
}
