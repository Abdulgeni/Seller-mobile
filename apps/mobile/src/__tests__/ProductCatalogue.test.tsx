import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { queryKeys } from "@repo/api";
import type { Product } from "@repo/schemas";

const sampleProduct: Product = {
  id: "prod_1",
  vendorId: "vdr_primary_store",
  title: "Maasai Beaded Leather Sandals",
  description: "Handcrafted authentic leather sandals",
  category: "Footwear",
  price: 2500,
  currency: "ETB",
  inStock: true,
  stockCount: 15,
  images: [
    {
      id: "img_1",
      uri: "https://picsum.photos/seed/prod_1/800/800",
      thumbnailUri: "https://picsum.photos/seed/prod_1/200/200",
      isCover: true,
      order: 0,
      fileSizeBytes: 180000,
      width: 800,
      height: 800,
    },
  ],
  variants: [],
  tags: ["sandals", "leather"],
  createdAt: "2026-10-28T00:00:00.000Z",
  updatedAt: "2026-10-28T00:00:00.000Z",
};

describe("F1 Product Catalogue (5k Items & Optimistic Mutations)", () => {
  it("filters product list by category and search keyword correctly", () => {
    const list: Product[] = [
      sampleProduct,
      {
        ...sampleProduct,
        id: "prod_2",
        title: "Kitenge Print Shirt",
        category: "Apparel",
      },
    ];

    const filter = (cat?: string, search?: string) => {
      return list.filter((p) => {
        const matchesCat = !cat || p.category === cat;
        const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
      });
    };

    expect(filter("Footwear")).toHaveLength(1);
    expect(filter("Apparel")).toHaveLength(1);
    expect(filter(undefined, "Shirt")).toHaveLength(1);
    expect(filter("Footwear", "Shirt")).toHaveLength(0);
  });

  it("performs optimistic stock toggle on query cache and rolls back on failure", () => {
    const qc = new QueryClient();
    const listKey = queryKeys.products.lists();

    qc.setQueryData<Product[]>(listKey, [sampleProduct]);
    expect(qc.getQueryData<Product[]>(listKey)![0]!.inStock).toBe(true);

    // Snapshot before mutation
    const snapshot = qc.getQueryData<Product[]>(listKey)!;

    // Optimistically update
    qc.setQueryData<Product[]>(
      listKey,
      snapshot.map((p) => (p.id === "prod_1" ? { ...p, inStock: false } : p))
    );
    expect(qc.getQueryData<Product[]>(listKey)![0]!.inStock).toBe(false);

    // Rollback on simulated network failure
    const rollbackToast = vi.fn();
    const rollback = () => {
      qc.setQueryData(listKey, snapshot);
      rollbackToast("Stock update failed. Reverted to previous state.");
    };

    rollback();
    expect(qc.getQueryData<Product[]>(listKey)![0]!.inStock).toBe(true);
    expect(rollbackToast).toHaveBeenCalled();
  });

  it("performs optimistic price edit on query cache", () => {
    const qc = new QueryClient();
    const listKey = queryKeys.products.lists();

    qc.setQueryData<Product[]>(listKey, [sampleProduct]);

    const snapshot = qc.getQueryData<Product[]>(listKey)!;
    const newPrice = 2999;

    qc.setQueryData<Product[]>(
      listKey,
      snapshot.map((p) => (p.id === "prod_1" ? { ...p, price: newPrice } : p))
    );
    expect(qc.getQueryData<Product[]>(listKey)![0]!.price).toBe(2999);
  });

  it("Loop 5: performs atomic bulk multi-select stock toggle and rollback", () => {
    const qc = new QueryClient();
    const listKey = queryKeys.products.lists();
    const products: Product[] = [
      { ...sampleProduct, id: "prod_1", inStock: true },
      { ...sampleProduct, id: "prod_2", inStock: true },
      { ...sampleProduct, id: "prod_3", inStock: false },
    ];

    qc.setQueryData<Product[]>(listKey, products);
    const snapshot = qc.getQueryData<Product[]>(listKey)!;

    const selectedIds = ["prod_1", "prod_2"];
    // Optimistic batch mark out of stock
    qc.setQueryData<Product[]>(
      listKey,
      snapshot.map((p) => (selectedIds.includes(p.id) ? { ...p, inStock: false } : p))
    );

    const updated = qc.getQueryData<Product[]>(listKey)!;
    expect(updated[0]!.inStock).toBe(false);
    expect(updated[1]!.inStock).toBe(false);

    // Rollback
    qc.setQueryData(listKey, snapshot);
    const reverted = qc.getQueryData<Product[]>(listKey)!;
    expect(reverted[0]!.inStock).toBe(true);
    expect(reverted[1]!.inStock).toBe(true);
  });
});
