import { describe, expect, it } from "vitest";
import {
  DeepLinkParamsSchema,
  OrderSchema,
  PaymentInitiationRequestSchema,
  ProductDraftSchema,
  ProductSchema,
} from "../index";

describe("Schema Boundary Validation", () => {
  it("validates a valid Product", () => {
    const valid = {
      id: "prod_123",
      vendorId: "vdr_primary_store",
      title: "Handmade Leather Bag",
      category: "Accessories",
      price: 2500,
      currency: "KES",
      inStock: true,
      stockCount: 10,
      images: [],
      variants: [],
      tags: ["leather", "bag"],
      createdAt: "2026-10-27T10:00:00Z",
      updatedAt: "2026-10-27T10:00:00Z",
    };

    const parsed = ProductSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid Product missing price or title", () => {
    const invalid = {
      id: "prod_123",
      vendorId: "vdr_primary_store",
      title: "",
      category: "Accessories",
      price: -10, // Invalid negative price
      createdAt: "2026-10-27T10:00:00Z",
      updatedAt: "2026-10-27T10:00:00Z",
    };

    const parsed = ProductSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("validates deep link parameters safely", () => {
    const params = { id: "ord_100", action: "accept" };
    const parsed = DeepLinkParamsSchema.safeParse(params);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe("ord_100");
      expect(parsed.data.action).toBe("accept");
    }

    const invalidParams = { id: "" };
    expect(DeepLinkParamsSchema.safeParse(invalidParams).success).toBe(false);
  });

  it("validates payment initiation request with E.164 phone format", () => {
    const validReq = {
      orderId: "ord_55",
      vendorId: "vdr_primary_store",
      amount: 1500,
      currency: "KES",
      customerPhone: "+254712345678",
      idempotencyKey: "123e4567-e89b-12d3-a456-426614174000",
    };
    expect(PaymentInitiationRequestSchema.safeParse(validReq).success).toBe(true);

    const invalidPhoneReq = {
      ...validReq,
      customerPhone: "07123", // Too short
    };
    expect(PaymentInitiationRequestSchema.safeParse(invalidPhoneReq).success).toBe(false);
  });
});
