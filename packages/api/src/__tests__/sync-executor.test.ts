import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ApiClient } from "../client";
import { resetMockDb } from "../mocks/handlers";
import { server } from "../mocks/server";
import { createSyncExecutor } from "../sync/executor";
import { SyncQueueManager, type SyncStorageAdapter } from "../sync";

const client = new ApiClient({ baseUrl: "https://mock-api.seller.internal", mockNetwork: false });

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetMockDb();
});
afterAll(() => server.close());

function createTestStorage(): SyncStorageAdapter {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, val) => map.set(key, val),
    removeItem: (key) => map.delete(key),
  };
}

describe("F5 Offline Sync Queue & Idempotency Pipeline", () => {
  it("enqueues offline mutations in FIFO order with UUID v4 idempotency keys", () => {
    const queue = new SyncQueueManager(createTestStorage());

    const job1 = queue.enqueue({
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
      type: "PRODUCT_STOCK_TOGGLE",
      endpoint: "/products/prod_1/stock",
      method: "PATCH",
      payload: {
        productId: "prod_1",
        inStock: false,
        idempotencyKey: "11111111-1111-4111-8111-111111111111",
      },
    });

    const job2 = queue.enqueue({
      idempotencyKey: "22222222-2222-4222-8222-222222222222",
      type: "PRODUCT_PRICE_EDIT",
      endpoint: "/products/prod_1/price",
      method: "PATCH",
      payload: {
        productId: "prod_1",
        price: 3200,
        idempotencyKey: "22222222-2222-4222-8222-222222222222",
      },
    });

    expect(queue.getPendingCount()).toBe(2);
    const jobs = queue.getJobs();
    expect(jobs[0]?.id).toBe(job1.id);
    expect(jobs[1]?.id).toBe(job2.id);
  });

  it("flushes mutations via createSyncExecutor and settles all jobs", async () => {
    const queue = new SyncQueueManager(createTestStorage());

    queue.enqueue({
      idempotencyKey: "33333333-3333-4333-8333-333333333333",
      type: "PRODUCT_STOCK_TOGGLE",
      endpoint: "/products/prod_1/stock",
      method: "PATCH",
      payload: {
        productId: "prod_1",
        inStock: false,
        idempotencyKey: "33333333-3333-4333-8333-333333333333",
      },
    });

    queue.enqueue({
      idempotencyKey: "44444444-4444-4444-8444-444444444444",
      type: "PRODUCT_PRICE_EDIT",
      endpoint: "/products/prod_1/price",
      method: "PATCH",
      payload: {
        productId: "prod_1",
        price: 2850,
        idempotencyKey: "44444444-4444-4444-8444-444444444444",
      },
    });

    const executor = createSyncExecutor(client);
    const result = await queue.flushQueue(executor);

    expect(result.processed).toBe(2);
    expect(result.failed).toBe(0);
    expect(queue.getPendingCount()).toBe(0);

    // Verify side effects persisted on backend
    const updatedProd = await client.getProduct("prod_1");
    expect(updatedProd.inStock).toBe(false);
    expect(updatedProd.price).toBe(2850);
  });

  it("reuses idempotency key on retry to guarantee exact-once execution", async () => {
    const key = "55555555-5555-4555-8555-555555555555";
    // First mutation
    const res1 = await client.toggleProductStock({
      productId: "prod_2",
      inStock: false,
      idempotencyKey: key,
    });
    expect(res1.inStock).toBe(false);

    // Simulated retry with the same idempotency key (even if payload is flipped)
    const res2 = await client.toggleProductStock({
      productId: "prod_2",
      inStock: true,
      idempotencyKey: key,
    });
    // Server idempotency log returns the original cached response without re-executing
    expect(res2.inStock).toBe(false);
  });
});
