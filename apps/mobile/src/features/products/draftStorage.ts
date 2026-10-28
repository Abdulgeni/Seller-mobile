import { ProductDraftSchema, type ProductDraft } from "@repo/schemas";
import { logger } from "@repo/ui";

const DRAFT_STORAGE_KEY = "seller_product_draft_v1";

// In-memory persistent map fallback for test & development environments
const memoryStore = new Map<string, string>();

export interface DraftStorage {
  saveDraft(draft: ProductDraft): Promise<void>;
  loadDraft(): Promise<ProductDraft | null>;
  clearDraft(): Promise<void>;
}

export class PersistentDraftStorage implements DraftStorage {
  async saveDraft(draft: ProductDraft): Promise<void> {
    try {
      const validated = ProductDraftSchema.parse(draft);
      const serialized = JSON.stringify(validated);
      memoryStore.set(DRAFT_STORAGE_KEY, serialized);
    } catch (err: unknown) {
      logger.error("Failed to persist product draft", err);
      throw err;
    }
  }

  async loadDraft(): Promise<ProductDraft | null> {
    try {
      const raw = memoryStore.get(DRAFT_STORAGE_KEY);
      if (!raw) return null;

      const parsedJson: unknown = JSON.parse(raw);
      const result = ProductDraftSchema.safeParse(parsedJson);
      if (!result.success) {
        logger.warn("Corrupt draft found in storage; clearing", { error: result.error });
        await this.clearDraft();
        return null;
      }

      return result.data;
    } catch (err: unknown) {
      logger.warn("Failed to load product draft", { err });
      return null;
    }
  }

  async clearDraft(): Promise<void> {
    memoryStore.delete(DRAFT_STORAGE_KEY);
  }
}

export const defaultDraftStorage = new PersistentDraftStorage();
