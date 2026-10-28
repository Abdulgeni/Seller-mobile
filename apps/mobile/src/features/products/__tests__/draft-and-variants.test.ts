import { ProductDraftSchema, type ProductDraft } from "@repo/schemas";
import { describe, expect, it } from "vitest";
import { PersistentDraftStorage } from "../draftStorage";
import { generateVariantMatrix } from "../variants";

describe("Product Draft Persistence (survives app kill)", () => {
  it("persists a draft and reloads it cleanly", async () => {
    const storage = new PersistentDraftStorage();
    await storage.clearDraft();

    const draft: ProductDraft = {
      draftId: "draft_test_123",
      title: "Handmade Leather Bag",
      description: "Full grain genuine leather bag",
      category: "Accessories",
      price: 4500,
      currency: "KES",
      stockCount: 15,
      images: [
        {
          id: "img_1",
          uri: "https://picsum.photos/seed/bag/800/800",
          thumbnailUri: "https://picsum.photos/seed/bag/200/200",
          isCover: true,
          order: 0,
          fileSizeBytes: 120 * 1024,
          width: 800,
          height: 800,
        },
      ],
      variants: [],
      tags: ["leather", "bag"],
      lastSavedAt: "2026-10-28T07:00:00.000Z",
    };

    await storage.saveDraft(draft);

    // Simulate app restart by loading from storage instance
    const reloaded = await storage.loadDraft();
    expect(reloaded).not.toBeNull();
    expect(reloaded?.draftId).toBe("draft_test_123");
    expect(reloaded?.title).toBe("Handmade Leather Bag");
    expect(reloaded?.price).toBe(4500);

    // Validates against strict schema
    ProductDraftSchema.parse(reloaded);

    // Clean up
    await storage.clearDraft();
    const afterClear = await storage.loadDraft();
    expect(afterClear).toBeNull();
  });
});

describe("Variant Matrix Generation", () => {
  it("generates cartesian product of sizes x colors with deterministic SKUs", () => {
    const variants = generateVariantMatrix({
      baseSku: "TSHIRT",
      sizes: ["S", "M", "L"],
      colors: ["Black", "White"],
      defaultStock: 5,
      defaultPriceOffset: 0,
    });

    // 3 sizes x 2 colors = 6 variants
    expect(variants.length).toBe(6);

    const skus = variants.map((v) => v.sku);
    expect(skus).toContain("TSHIRT-BLAC-S");
    expect(skus).toContain("TSHIRT-BLAC-M");
    expect(skus).toContain("TSHIRT-BLAC-L");
    expect(skus).toContain("TSHIRT-WHIT-S");
    expect(skus).toContain("TSHIRT-WHIT-M");
    expect(skus).toContain("TSHIRT-WHIT-L");

    // Check individual properties
    const first = variants[0]!;
    expect(first.color).toBe("Black");
    expect(first.stock).toBe(5);
    expect(first.priceOffset).toBe(0);
  });

  it("handles single dimension variants (sizes only)", () => {
    const variants = generateVariantMatrix({
      baseSku: "HAT",
      sizes: ["Standard", "Large"],
      colors: [],
      defaultStock: 8,
    });

    expect(variants.length).toBe(2);
    expect(variants[0]?.sku).toBe("HAT-DEFA-STAN");
  });
});
