import type { OrderStatus } from "./order";

export const ORDER_TRANSITION_RULES: Record<OrderStatus, readonly OrderStatus[]> = {
  NEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
} as const;

export class InvalidOrderTransitionError extends Error {
  constructor(public readonly from: OrderStatus, public readonly to: OrderStatus) {
    super(`Illegal order status transition from "${from}" to "${to}".`);
    this.name = "InvalidOrderTransitionError";
  }
}

/**
 * Evaluates whether a transition from current status to target status is permitted.
 */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  const allowed = ORDER_TRANSITION_RULES[from];
  return allowed.includes(to);
}

/**
 * Asserts that a transition is allowed; throws InvalidOrderTransitionError if illegal.
 */
export function assertValidOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new InvalidOrderTransitionError(from, to);
  }
}

/**
 * Returns all possible next statuses for an order given its current status.
 */
export function getNextOrderStatuses(current: OrderStatus): readonly OrderStatus[] {
  return ORDER_TRANSITION_RULES[current];
}

/**
 * Checks whether an order is in a terminal state (DELIVERED or CANCELLED).
 */
export function isOrderTerminal(status: OrderStatus): boolean {
  return ORDER_TRANSITION_RULES[status].length === 0;
}
