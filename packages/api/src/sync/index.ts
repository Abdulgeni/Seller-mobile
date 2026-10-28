import { logger } from "@repo/ui";

export type SyncJobType =
  | "ORDER_STATUS_TRANSITION"
  | "PRODUCT_STOCK_TOGGLE"
  | "PRODUCT_PRICE_EDIT"
  | "PRODUCT_CREATE"
  | "PAYMENT_INITIATE";

export interface SyncJob<TPayload = unknown> {
  id: string;
  idempotencyKey: string;
  type: SyncJobType;
  endpoint: string;
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  payload: TPayload;
  timestamp: string;
  status: "pending" | "in_flight" | "failed" | "settled";
  retryCount: number;
  lastAttemptAt?: string;
  error?: string;
}

export interface SyncStorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

// In-memory default storage
const inMemoryStorage = new Map<string, string>();
const defaultAdapter: SyncStorageAdapter = {
  getItem: (key: string) => inMemoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => inMemoryStorage.set(key, value),
  removeItem: (key: string) => inMemoryStorage.delete(key),
};

export class SyncQueueManager {
  private storage: SyncStorageAdapter;
  private queueKey = "seller_sync_mutation_queue_v1";
  private isFlushing = false;
  private listeners = new Set<(pendingCount: number) => void>();

  constructor(storage: SyncStorageAdapter = defaultAdapter) {
    this.storage = storage;
  }

  setStorageAdapter(adapter: SyncStorageAdapter): void {
    this.storage = adapter;
    this.notify();
  }

  subscribe(listener: (pendingCount: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.getPendingCount());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const count = this.getPendingCount();
    for (const listener of this.listeners) {
      listener(count);
    }
  }

  getJobs(): SyncJob[] {
    const raw = this.storage.getItem(this.queueKey);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as SyncJob[];
      }
      return [];
    } catch {
      return [];
    }
  }

  private saveJobs(jobs: SyncJob[]): void {
    this.storage.setItem(this.queueKey, JSON.stringify(jobs));
    this.notify();
  }

  getPendingCount(): number {
    return this.getJobs().filter((j) => j.status === "pending" || j.status === "in_flight").length;
  }

  enqueue<TPayload>(job: Omit<SyncJob<TPayload>, "id" | "status" | "retryCount" | "timestamp">): SyncJob<TPayload> {
    const fullJob: SyncJob<TPayload> = {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: "pending",
      retryCount: 0,
      timestamp: new Date().toISOString(),
    };

    const current = this.getJobs();
    current.push(fullJob as SyncJob);
    this.saveJobs(current);

    logger.info("Enqueued offline mutation job", {
      id: fullJob.id,
      type: fullJob.type,
      idempotencyKey: fullJob.idempotencyKey,
    });

    return fullJob;
  }

  async flushQueue(executor: (job: SyncJob) => Promise<void>): Promise<{ processed: number; failed: number }> {
    if (this.isFlushing) {
      return { processed: 0, failed: 0 };
    }

    this.isFlushing = true;
    let processed = 0;
    let failed = 0;

    try {
      const jobs = this.getJobs();
      for (const job of jobs) {
        if (job.status === "settled" || job.status === "failed") continue;

        job.status = "in_flight";
        job.lastAttemptAt = new Date().toISOString();
        this.saveJobs(jobs);

        try {
          await executor(job);
          job.status = "settled";
          processed++;
          logger.info("Sync job settled successfully", { id: job.id, idempotencyKey: job.idempotencyKey });
        } catch (err: unknown) {
          job.retryCount++;
          const errorMsg = err instanceof Error ? err.message : "Sync dispatch error";
          job.error = errorMsg;

          if (job.retryCount >= 5) {
            job.status = "failed";
            failed++;
            logger.error("Sync job exceeded max retries, marked as failed", err, { id: job.id });
          } else {
            job.status = "pending";
            // Exponential backoff delay with jitter
            const backoffMs = Math.min(30000, 1000 * Math.pow(2, job.retryCount) + Math.random() * 500);
            logger.warn(`Sync job transient failure, scheduled backoff ${backoffMs.toFixed(0)}ms`, { id: job.id });
          }
        }
        this.saveJobs(jobs);
      }
    } finally {
      this.isFlushing = false;
      this.notify();
    }

    return { processed, failed };
  }

  clearSettled(): void {
    const remaining = this.getJobs().filter((j) => j.status !== "settled");
    this.saveJobs(remaining);
  }
}

export const syncQueue = new SyncQueueManager();
export * from "./executor";
