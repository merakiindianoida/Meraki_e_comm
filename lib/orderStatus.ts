export const NEXT_ORDER_STATUSES: Record<string, readonly string[]> = {
  PENDING: ["PENDING", "PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_FAILED: ["PAYMENT_FAILED"],
  PAID: ["PAID", "PACKED", "CANCELLED"],
  PACKED: ["PACKED", "PAID", "SHIPPED"],
  SHIPPED: ["SHIPPED", "DELIVERED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
};

const ADMIN_ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ["PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_FAILED: [],
  PAID: ["PACKED", "CANCELLED"],
  PACKED: ["PAID", "SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canAdminTransitionOrderStatus(current: string, next: string): boolean {
  return current === next || ADMIN_ORDER_TRANSITIONS[current]?.includes(next) === true;
}

export function canCustomerCancelOrder(
  status: string,
  firstPackedAt: Date | null
): boolean {
  return firstPackedAt === null && (status === "PENDING" || status === "PAID");
}
