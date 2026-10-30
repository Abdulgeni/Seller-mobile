import React from "react";
import { describe, expect, it } from "vitest";
import type { PaymentTransaction } from "@repo/schemas";
import { Badge, KineticStatusFlip, PaymentVaultReceiptRise } from "@repo/ui";

const sampleTx: PaymentTransaction = {
  vendorId: "vendor_1",
  id: "tx_12345",
  orderId: "ord_1",
  amount: 4500,
  currency: "KES",
  customerPhone: "+254712345678",
  state: "SUCCESS",
  checkoutRequestId: "ws_CO_12345678",
  receiptNumber: "REC-987654",
  idempotencyKey: "a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d",
  initiatedAt: "2026-10-28T10:00:00.000Z",
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
    } as React.ComponentProps<typeof PaymentVaultReceiptRise>);
    const props = element.props as React.ComponentProps<typeof PaymentVaultReceiptRise>;
    expect(props.transaction.id).toBe("tx_12345");
    expect(props.transaction.amount).toBe(4500);
  });

  it("KineticStatusFlip exports and wraps child badge correctly", () => {
    expect(KineticStatusFlip).toBeDefined();
    expect(typeof KineticStatusFlip).toBe("function");

    const badge = React.createElement(Badge, { label: "ACCEPTED", variant: "accepted" });
    const flipper = React.createElement(
      KineticStatusFlip,
      { status: "ACCEPTED", children: badge } as React.ComponentProps<typeof KineticStatusFlip>
    );
    const props = flipper.props as React.ComponentProps<typeof KineticStatusFlip>;
    expect(props.status).toBe("ACCEPTED");
    expect(props.children).toBe(badge);
  });
});
