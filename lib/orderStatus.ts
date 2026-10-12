export const NEXT_ORDER_STATUSES: Record<string, readonly string[]> = {
  PENDING: ["PENDING", "PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_FAILED: ["PAYMENT_FAILED"],
  PAID: ["PAID", "PACKED", "CANCELLED"],
  PACKED: ["PACKED", "PAID", "SHIPPED"],
  SHIPPED: ["SHIPPED", "DELIVERED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED", "REFUNDED"],
  REFUNDED: ["REFUNDED"],
};

const ADMIN_ORDER_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ["PAID", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_FAILED: [],
  PAID: ["PACKED", "CANCELLED"],
  PACKED: ["PAID", "SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: ["REFUNDED"],
  REFUNDED: [],
};

export function canAdminTransitionOrderStatus(current: string, next: string): boolean {
  return current === next || ADMIN_ORDER_TRANSITIONS[current]?.includes(next) === true;
}

const ORDER_STAGE_RANK: Record<string, number> = {
  PENDING: 0,
  PAYMENT_FAILED: 1,
  PAID: 2,
  PACKED: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 6,
  REFUNDED: 7,
};

export function isForwardOrderTransition(current: string, next: string): boolean {
  const currentRank = ORDER_STAGE_RANK[current];
  const nextRank = ORDER_STAGE_RANK[next];
  return currentRank !== undefined && nextRank !== undefined && nextRank > currentRank;
}

export function canCustomerCancelOrder(
  status: string,
  firstPackedAt: Date | null
): boolean {
  return firstPackedAt === null && (status === "PENDING" || status === "PAID");
}
