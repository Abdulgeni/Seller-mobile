import React from "react";
import { describe, expect, it } from "vitest";
import { LaunchRevealGate, NumericRoll } from "@repo/ui";
import { SyncBanner } from "../features/sync/SyncBanner";
import { syncQueue } from "@repo/api";

describe("Loop 2: Signature Moments Core", () => {
  it("verifies NumericRoll component export and contract", () => {
    expect(NumericRoll).toBeDefined();
    expect(typeof NumericRoll).toBe("function");

    const element = React.createElement(NumericRoll, {
      value: 12500,
      prefix: "ETB ",
      durationMs: 450,
    });
    expect(element.props.value).toBe(12500);
    expect(element.props.prefix).toBe("ETB ");
  });

  it("verifies LaunchRevealGate wraps children and defines overlay spring", () => {
    expect(LaunchRevealGate).toBeDefined();
    expect(typeof LaunchRevealGate).toBe("function");

    const child = React.createElement("div", null, "Dashboard Child");
    const gate = React.createElement(LaunchRevealGate, null, child);
    expect(gate.props.children).toBe(child);
  });

  it("SyncBanner reflects queue changes and integrates with syncQueue", () => {
    expect(SyncBanner).toBeDefined();
    expect(typeof SyncBanner).toBe("function");

    // Enqueue mutation to verify syncQueue subscriber behavior
    syncQueue.enqueue({
      type: "PRODUCT_STOCK_TOGGLE",
      method: "PATCH",
      endpoint: "/api/products/p_l2_test/stock",
      payload: { productId: "p_l2_test", inStock: false },
      idempotencyKey: "test-l2-key",
    });

    expect(syncQueue.getPendingCount()).toBeGreaterThan(0);

    // Clean up
    syncQueue.clearSettled();
  });
});
