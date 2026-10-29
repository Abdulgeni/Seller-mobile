import type { PaymentState } from "./payment";

export const PAYMENT_TRANSITION_RULES: Record<PaymentState, readonly PaymentState[]> = {
  IDLE: ["INITIATING"],
  INITIATING: ["PENDING", "FAILED"],
  PENDING: ["SUCCESS", "FAILED", "TIMEOUT", "CANCELLED"],
  SUCCESS: [],
  FAILED: [],
  TIMEOUT: [],
  CANCELLED: [],
};

export function canTransitionPayment(from: PaymentState, to: PaymentState): boolean {
  const allowed = PAYMENT_TRANSITION_RULES[from];
  return allowed.includes(to);
}

export function assertValidPaymentTransition(from: PaymentState, to: PaymentState): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(
      `Illegal payment transition from ${from} to ${to}. Allowed transitions: [${PAYMENT_TRANSITION_RULES[from].join(", ")}]`
    );
  }
}

export function isPaymentTerminal(state: PaymentState): boolean {
  return PAYMENT_TRANSITION_RULES[state].length === 0;
}
