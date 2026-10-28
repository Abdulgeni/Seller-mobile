import { describe, expect, it } from "vitest";
import { MockStorageClient } from "../storage/mockStorage";

describe("MockStorageClient", () => {
  it("uploads a file within budget and generates public URL", async () => {
    const storage = new MockStorageClient();
    const bucket = storage.from("product-photos");

    const smallPayload = "a".repeat(1024 * 50); // 50 KB
    const result = await bucket.upload("prod_1/photo_1.jpg", smallPayload, {
      contentType: "image/jpeg",
    });

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.path).toBe("prod_1/photo_1.jpg");
    expect(result.data?.publicUrl).toBe("https://mock-storage.seller.internal/product-photos/prod_1/photo_1.jpg");
    expect(result.data?.sizeBytes).toBe(51200);

    const publicUrlObj = bucket.getPublicUrl("prod_1/photo_1.jpg");
    expect(publicUrlObj.data.publicUrl).toBe("https://mock-storage.seller.internal/product-photos/prod_1/photo_1.jpg");
  });

  it("rejects uploads exceeding the 200 KB budget", async () => {
    const storage = new MockStorageClient();
    const bucket = storage.from("product-photos");

    const hugePayload = "a".repeat(250 * 1024); // 250 KB
    const result = await bucket.upload("prod_1/huge.jpg", hugePayload);

    expect(result.data).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error?.statusCode).toBe(413);
    expect(result.error?.message).toContain("exceeds maximum allowed budget");
  });

  it("supports file removal", async () => {
    const storage = new MockStorageClient();
    const bucket = storage.from("product-photos");

    await bucket.upload("photo_to_delete.jpg", "hello");
    const removeResult = await bucket.remove(["photo_to_delete.jpg"]);

    expect(removeResult.error).toBeNull();
    expect(removeResult.data).toEqual(["photo_to_delete.jpg"]);
  });
});
