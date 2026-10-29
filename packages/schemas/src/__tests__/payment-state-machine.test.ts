import { describe, expect, it } from "vitest";
import {
  assertValidPaymentTransition,
  canTransitionPayment,
  isPaymentTerminal,
} from "../payment-state-machine";

describe("Payment State Machine Rules", () => {
  it("allows legal progression IDLE -> INITIATING -> PENDING -> SUCCESS", () => {
    expect(canTransitionPayment("IDLE", "INITIATING")).toBe(true);
    expect(canTransitionPayment("INITIATING", "PENDING")).toBe(true);
    expect(canTransitionPayment("PENDING", "SUCCESS")).toBe(true);
  });

  it("allows failure transitions from INITIATING and PENDING", () => {
    expect(canTransitionPayment("INITIATING", "FAILED")).toBe(true);
    expect(canTransitionPayment("PENDING", "FAILED")).toBe(true);
    expect(canTransitionPayment("PENDING", "TIMEOUT")).toBe(true);
    expect(canTransitionPayment("PENDING", "CANCELLED")).toBe(true);
  });

  it("blocks illegal transitions and throws in assertValidPaymentTransition", () => {
    expect(canTransitionPayment("IDLE", "SUCCESS")).toBe(false);
    expect(canTransitionPayment("INITIATING", "SUCCESS")).toBe(false);
    expect(canTransitionPayment("PENDING", "INITIATING")).toBe(false);

    expect(() => assertValidPaymentTransition("IDLE", "SUCCESS")).toThrow(
      /Illegal payment transition from IDLE to SUCCESS/
    );
  });

  it("identifies terminal states and blocks transitions out of terminal states", () => {
    expect(isPaymentTerminal("SUCCESS")).toBe(true);
    expect(isPaymentTerminal("FAILED")).toBe(true);
    expect(isPaymentTerminal("TIMEOUT")).toBe(true);
    expect(isPaymentTerminal("CANCELLED")).toBe(true);

    expect(isPaymentTerminal("IDLE")).toBe(false);
    expect(isPaymentTerminal("INITIATING")).toBe(false);
    expect(isPaymentTerminal("PENDING")).toBe(false);

    expect(canTransitionPayment("SUCCESS", "PENDING")).toBe(false);
    expect(canTransitionPayment("FAILED", "INITIATING")).toBe(false);
  });
});
