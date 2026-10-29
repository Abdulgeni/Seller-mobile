import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { resetMockDb, server } from "@repo/api";
import { defaultPaymentService, PaymentService } from "../paymentService";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  resetMockDb();
});
afterAll(() => server.close());

describe("F4 Mocked Mobile-Money Payment Flow", () => {
  it("prevents double-charging on simultaneous double-taps", async () => {
    const service = new PaymentService();
    const idempotencyKey = "22222222-2222-4222-8222-222222222222";

    const req = {
      orderId: "ord_1",
      vendorId: "vdr_primary_store",
      amount: 3500,
      currency: "KES" as const,
      customerPhone: "+254712345678",
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
      currency: "KES" as const,
      customerPhone: "+254722123456",
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

  it("formats comprehensive shareable payment receipt", () => {
    const tx = {
      id: "tx_receipt_1",
      orderId: "ord_555",
      vendorId: "vdr_primary_store",
      amount: 1500,
      currency: "KES" as const,
      customerPhone: "+254712345678",
      state: "SUCCESS" as const,
      providerReference: "MPESA_ABC123",
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
      checkoutRequestId: "ws_CO_9999",
      initiatedAt: "2026-10-28T10:00:00.000Z",
      completedAt: "2026-10-28T10:00:03.000Z",
      receiptNumber: "REC-9999",
    };

    const receipt = defaultPaymentService.formatReceiptText(tx);
    expect(receipt).toContain("PAYMENT RECEIPT");
    expect(receipt).toContain("REC-9999");
    expect(receipt).toContain("KES 1,500");
    expect(receipt).toContain("+254712345678");
    expect(receipt).toContain("MPESA_ABC123");
  });
});
