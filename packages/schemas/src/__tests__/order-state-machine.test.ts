import { describe, expect, it } from "vitest";
import {
  assertValidOrderTransition,
  canTransitionOrder,
  getNextOrderStatuses,
  InvalidOrderTransitionError,
  isOrderTerminal,
} from "../order-state-machine";
import type { OrderStatus } from "../order";

describe("Order State Machine (Contract & Verification)", () => {
  const allStatuses: OrderStatus[] = [
    "NEW",
    "ACCEPTED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  describe("Valid transitions", () => {
    it("allows NEW -> ACCEPTED and NEW -> CANCELLED", () => {
      expect(canTransitionOrder("NEW", "ACCEPTED")).toBe(true);
      expect(canTransitionOrder("NEW", "CANCELLED")).toBe(true);
      expect(() => assertValidOrderTransition("NEW", "ACCEPTED")).not.toThrow();
    });

    it("allows ACCEPTED -> PACKED and ACCEPTED -> CANCELLED", () => {
      expect(canTransitionOrder("ACCEPTED", "PACKED")).toBe(true);
      expect(canTransitionOrder("ACCEPTED", "CANCELLED")).toBe(true);
      expect(() => assertValidOrderTransition("ACCEPTED", "PACKED")).not.toThrow();
    });

    it("allows PACKED -> SHIPPED and PACKED -> CANCELLED", () => {
      expect(canTransitionOrder("PACKED", "SHIPPED")).toBe(true);
      expect(canTransitionOrder("PACKED", "CANCELLED")).toBe(true);
      expect(() => assertValidOrderTransition("PACKED", "SHIPPED")).not.toThrow();
    });

    it("allows SHIPPED -> DELIVERED", () => {
      expect(canTransitionOrder("SHIPPED", "DELIVERED")).toBe(true);
      expect(() => assertValidOrderTransition("SHIPPED", "DELIVERED")).not.toThrow();
    });
  });

  describe("Invalid & illegal transitions", () => {
    it("rejects transition to the same status (self-loop)", () => {
      for (const s of allStatuses) {
        expect(canTransitionOrder(s, s)).toBe(false);
        expect(() => assertValidOrderTransition(s, s)).toThrow(InvalidOrderTransitionError);
      }
    });

    it("rejects backwards transitions", () => {
      expect(canTransitionOrder("ACCEPTED", "NEW")).toBe(false);
      expect(canTransitionOrder("PACKED", "ACCEPTED")).toBe(false);
      expect(canTransitionOrder("SHIPPED", "PACKED")).toBe(false);
      expect(canTransitionOrder("DELIVERED", "SHIPPED")).toBe(false);
    });

    it("rejects skipping forward steps", () => {
      expect(canTransitionOrder("NEW", "PACKED")).toBe(false);
      expect(canTransitionOrder("NEW", "SHIPPED")).toBe(false);
      expect(canTransitionOrder("NEW", "DELIVERED")).toBe(false);
      expect(canTransitionOrder("ACCEPTED", "DELIVERED")).toBe(false);
    });

    it("rejects any transition out of terminal states DELIVERED or CANCELLED", () => {
      for (const target of allStatuses) {
        expect(canTransitionOrder("DELIVERED", target)).toBe(false);
        expect(canTransitionOrder("CANCELLED", target)).toBe(false);
      }
    });

    it("rejects cancelling an order that is already SHIPPED", () => {
      expect(canTransitionOrder("SHIPPED", "CANCELLED")).toBe(false);
    });
  });

  describe("State helpers", () => {
    it("identifies terminal statuses correctly", () => {
      expect(isOrderTerminal("DELIVERED")).toBe(true);
      expect(isOrderTerminal("CANCELLED")).toBe(true);
      expect(isOrderTerminal("NEW")).toBe(false);
      expect(isOrderTerminal("ACCEPTED")).toBe(false);
      expect(isOrderTerminal("PACKED")).toBe(false);
      expect(isOrderTerminal("SHIPPED")).toBe(false);
    });

    it("returns correct next options for each status", () => {
      expect(getNextOrderStatuses("NEW")).toEqual(["ACCEPTED", "CANCELLED"]);
      expect(getNextOrderStatuses("ACCEPTED")).toEqual(["PACKED", "CANCELLED"]);
      expect(getNextOrderStatuses("PACKED")).toEqual(["SHIPPED", "CANCELLED"]);
      expect(getNextOrderStatuses("SHIPPED")).toEqual(["DELIVERED"]);
      expect(getNextOrderStatuses("DELIVERED")).toEqual([]);
      expect(getNextOrderStatuses("CANCELLED")).toEqual([]);
    });
  });
});
