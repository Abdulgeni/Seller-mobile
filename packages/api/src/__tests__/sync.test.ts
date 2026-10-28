import { describe, expect, it } from "vitest";
import { SyncQueueManager, type SyncStorageAdapter } from "../sync";

class MockStorage implements SyncStorageAdapter {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
}

describe("SyncQueueManager", () => {
  it("enqueues jobs and persists across restarts", () => {
    const storage = new MockStorage();
    const queue1 = new SyncQueueManager(storage);

    queue1.enqueue({
      idempotencyKey: "test-uuid-1",
      type: "PRODUCT_STOCK_TOGGLE",
      endpoint: "/products/prod_1/stock",
      method: "PATCH",
      payload: { inStock: false },
    });

    expect(queue1.getPendingCount()).toBe(1);

    // Simulate app restart by instantiating new manager with same storage
    const queue2 = new SyncQueueManager(storage);
    expect(queue2.getPendingCount()).toBe(1);
    const jobs = queue2.getJobs();
    expect(jobs[0]?.idempotencyKey).toBe("test-uuid-1");
  });

  it("flushes jobs sequentially and settles them", async () => {
    const storage = new MockStorage();
    const queue = new SyncQueueManager(storage);

    queue.enqueue({
      idempotencyKey: "key-1",
      type: "ORDER_STATUS_TRANSITION",
      endpoint: "/orders/ord_1/transition",
      method: "POST",
      payload: { toStatus: "ACCEPTED" },
    });

    queue.enqueue({
      idempotencyKey: "key-2",
      type: "ORDER_STATUS_TRANSITION",
      endpoint: "/orders/ord_1/transition",
      method: "POST",
      payload: { toStatus: "PACKED" },
    });

    const executionLog: string[] = [];
    const result = await queue.flushQueue(async (job) => {
      executionLog.push(job.idempotencyKey);
    });

    expect(result.processed).toBe(2);
    expect(result.failed).toBe(0);
    expect(executionLog).toEqual(["key-1", "key-2"]);
    expect(queue.getPendingCount()).toBe(0);
  });

  it("retries on transient failure and updates retryCount", async () => {
    const storage = new MockStorage();
    const queue = new SyncQueueManager(storage);

    queue.enqueue({
      idempotencyKey: "fail-key",
      type: "PRODUCT_PRICE_EDIT",
      endpoint: "/products/prod_1/price",
      method: "PATCH",
      payload: { price: 2000 },
    });

    let attempts = 0;
    await queue.flushQueue(async () => {
      attempts++;
      throw new Error("Network timeout");
    });

    expect(attempts).toBe(1);
    const jobs = queue.getJobs();
    expect(jobs[0]?.status).toBe("pending");
    expect(jobs[0]?.retryCount).toBe(1);
    expect(jobs[0]?.error).toBe("Network timeout");
  });
});
