import { afterEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@repo/api";
import { defaultPaymentService, PaymentService } from "../paymentService";

afterEach(() => {
  resetMockDb();
});

describe("F4 Mocked Mobile-Money Payment Flow (Telebirr, CBE Birr, M-Pesa)", () => {
  it("prevents double-charging on simultaneous double-taps", async () => {
    const service = new PaymentService();
    const idempotencyKey = "22222222-2222-4222-8222-222222222222";

    const req = {
      orderId: "ord_1",
      vendorId: "vdr_primary_store",
      amount: 3500,
      currency: "ETB" as const,
      customerPhone: "+251911234567",
      provider: "TELEBIRR" as const,
      idempotencyKey,
    };

    // First attempt succeeds and enters in-flight lock
    const p1 = service.initiatePayment(req);
    // Concurrent second attempt must be immediately rejected by in-flight lock
    const p2Promise = service.initiatePayment(req);

    await expect(p2Promise).rejects.toThrow(/Payment is already in progress/);
    const result1 = await p1;
    expect(result1.state).toBeDefined();
  });

  it("persists pending transaction and recovers it across app restarts", async () => {
    const service = new PaymentService();
    await service.clearActivePayment();

    const req = {
      orderId: "ord_2",
      vendorId: "vdr_primary_store",
      amount: 4500,
      currency: "ETB" as const,
      customerPhone: "+251922123456",
      provider: "CBE" as const,
      idempotencyKey: "33333333-3333-4333-8333-333333333333",
    };

    const initiated = await service.initiatePayment(req);
    expect(initiated.state).toBe("PENDING");

    // Simulate relaunch recovery
    const recovered = await service.recoverActivePayment();
    expect(recovered).not.toBeNull();
    expect(recovered?.id).toBe(initiated.id);
    expect(recovered?.state).toBe("SUCCESS");
    expect(recovered?.receiptNumber).toBeDefined();
  });

  it("formats comprehensive shareable payment receipt with Ethiopian provider details", () => {
    const tx = {
      id: "tx_receipt_1",
      orderId: "ord_555",
      vendorId: "vdr_primary_store",
      amount: 1500,
      currency: "ETB" as const,
      customerPhone: "+251911234567",
      provider: "TELEBIRR" as const,
      state: "SUCCESS" as const,
      providerReference: "TLB-78901234",
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
      checkoutRequestId: "ws_CO_9999",
      initiatedAt: "2026-10-28T10:00:00.000Z",
      completedAt: "2026-10-28T10:00:03.000Z",
      receiptNumber: "REC-9999",
    };

    const receipt = defaultPaymentService.formatReceiptText(tx);
    expect(receipt).toContain("TRANSACTION RECEIPT");
    expect(receipt).toContain("REC-9999");
    expect(receipt).toContain("ETB 1,500");
    expect(receipt).toContain("+251911234567");
    expect(receipt).toContain("TLB-78901234");
    expect(receipt).toContain("Telebirr (Ethio Telecom)");
  });
});
