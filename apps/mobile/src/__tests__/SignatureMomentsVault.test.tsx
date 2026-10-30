import React from "react";
import { describe, expect, it } from "vitest";
import type { PaymentTransaction } from "@repo/schemas";
import { Badge, KineticStatusFlip, PaymentVaultReceiptRise } from "@repo/ui";

const sampleTx: PaymentTransaction = {
  id: "tx_12345",
  orderId: "ord_1",
  amount: 4500,
  currency: "KES",
  phone: "+254712345678",
  state: "SUCCESS",
  checkoutRequestId: "ws_CO_12345678",
  receiptNumber: "REC-987654",
  failureReason: null,
  createdAt: "2026-10-28T10:00:00.000Z",
  updatedAt: "2026-10-28T10:01:00.000Z",
  completedAt: "2026-10-28T10:01:00.000Z",
  providerReference: "MPESA_987654",
};

describe("Loop 8: Signature Moments: Vault & Status Flip", () => {
  it("PaymentVaultReceiptRise exports and instantiates with valid props", () => {
    expect(PaymentVaultReceiptRise).toBeDefined();
    expect(typeof PaymentVaultReceiptRise).toBe("function");

    const element = React.createElement(PaymentVaultReceiptRise, {
      transaction: sampleTx,
      onShare: () => {},
      onDone: () => {},
    });
    expect(element.props.transaction.id).toBe("tx_12345");
    expect(element.props.transaction.amount).toBe(4500);
  });

  it("KineticStatusFlip exports and wraps child badge correctly", () => {
    expect(KineticStatusFlip).toBeDefined();
    expect(typeof KineticStatusFlip).toBe("function");

    const badge = React.createElement(Badge, { label: "ACCEPTED", variant: "accepted" });
    const flipper = React.createElement(
      KineticStatusFlip,
      { status: "ACCEPTED" },
      badge
    );
    expect(flipper.props.status).toBe("ACCEPTED");
    expect(flipper.props.children).toBe(badge);
  });
});
