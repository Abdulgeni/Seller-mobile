import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "@repo/api";
import {
  canTransitionOrder,
  assertValidOrderTransition,
  InvalidOrderTransitionError,
  type Order,
} from "@repo/schemas";

const baseOrder: Order = {
  id: "ord_opt_test",
  vendorId: "vdr_primary_store",
  orderNumber: "ORD-OPT-001",
  customer: {
    id: "cust_1",
    name: "Faith W.",
    phone: "+254700000001",
    shippingAddress: "Nairobi West",
  },
  status: "NEW",
  items: [
    {
      id: "i_1",
      productId: "p_1",
      productTitle: "Test Item",
      sku: "TI-01",
      vendorId: "vdr_primary_store",
      quantity: 1,
      unitPrice: 1000,
      subtotal: 1000,
      commissionRate: 0,
      netVendorAmount: 1000,
    },
  ],
  subtotal: 1000,
  shippingFee: 100,
  discountTotal: 0,
  total: 1100,
  currency: "KES",
  createdAt: "2026-10-28T04:00:00.000Z",
  updatedAt: "2026-10-28T04:00:00.000Z",
  timeline: [],
};

describe("Order Optimistic Transition & Rollback Pattern", () => {
  it("enforces state machine gate before initiating dispatch", () => {
    // Valid
    expect(() => assertValidOrderTransition(baseOrder.status, "ACCEPTED")).not.toThrow();

    // Invalid: NEW -> DELIVERED
    expect(() => assertValidOrderTransition(baseOrder.status, "DELIVERED")).toThrow(
      InvalidOrderTransitionError
    );
  });

  it("applies optimistic cache update and rolls back on failure with snapshot", async () => {
    const qc = new QueryClient();
    const queryKey = queryKeys.orders.detail(baseOrder.id);

    // Initial cache state
    qc.setQueryData(queryKey, baseOrder);
    expect(qc.getQueryData<Order>(queryKey)?.status).toBe("NEW");

    // Simulate onMutate: snapshot and optimistic patch
    const snapshot = qc.getQueryData<Order>(queryKey);
    const optimisticPatch: Order = {
      ...snapshot!,
      status: "ACCEPTED",
      updatedAt: new Date().toISOString(),
    };
    qc.setQueryData(queryKey, optimisticPatch);

    // Cache immediately reflects ACCEPTED before server responds
    expect(qc.getQueryData<Order>(queryKey)?.status).toBe("ACCEPTED");

    // Simulate mutation failure & onError rollback
    const rollbackToastSpy = vi.fn();
    const simulateError = (err: Error) => {
      // Rollback to snapshot
      qc.setQueryData(queryKey, snapshot);
      rollbackToastSpy(`Rolled back: ${err.message}`);
    };

    simulateError(new Error("Network timeout"));

    // Cache successfully reverted to original state
    expect(qc.getQueryData<Order>(queryKey)?.status).toBe("NEW");
    expect(rollbackToastSpy).toHaveBeenCalledWith("Rolled back: Network timeout");
  });

  it("correctly computes legal next transitions from state machine", () => {
    expect(canTransitionOrder("NEW", "ACCEPTED")).toBe(true);
    expect(canTransitionOrder("NEW", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("NEW", "SHIPPED")).toBe(false);

    expect(canTransitionOrder("ACCEPTED", "PACKED")).toBe(true);
    expect(canTransitionOrder("ACCEPTED", "CANCELLED")).toBe(true);

    expect(canTransitionOrder("PACKED", "SHIPPED")).toBe(true);
    expect(canTransitionOrder("SHIPPED", "DELIVERED")).toBe(true);

    // Terminal
    expect(canTransitionOrder("DELIVERED", "ACCEPTED")).toBe(false);
    expect(canTransitionOrder("CANCELLED", "NEW")).toBe(false);
  });
});
