import type { ApiClient } from "../client";
import type { SyncJob } from "./index";
import type {
  OrderTransitionMutation,
  PaymentInitiationRequest,
  PriceEditMutation,
  ProductDraft,
  StockToggleMutation,
} from "@repo/schemas";

export function createSyncExecutor(client: ApiClient): (job: SyncJob) => Promise<void> {
  return async function executeSyncJob(job: SyncJob): Promise<void> {
    switch (job.type) {
      case "ORDER_STATUS_TRANSITION": {
        const payload = job.payload as OrderTransitionMutation;
        await client.transitionOrderStatus(payload);
        break;
      }
      case "PRODUCT_STOCK_TOGGLE": {
        const payload = job.payload as StockToggleMutation;
        await client.toggleProductStock(payload);
        break;
      }
      case "PRODUCT_PRICE_EDIT": {
        const payload = job.payload as PriceEditMutation;
        await client.editProductPrice(payload);
        break;
      }
      case "PRODUCT_CREATE": {
        const payload = job.payload as { draft: ProductDraft };
        await client.createProduct(payload.draft, job.idempotencyKey);
        break;
      }
      case "PAYMENT_INITIATE": {
        const payload = job.payload as PaymentInitiationRequest;
        await client.initiatePayment(payload);
        break;
      }
      default: {
        const exhaustiveCheck: never = job.type;
        throw new Error(`Unhandled sync job type: ${String(exhaustiveCheck)}`);
      }
    }
  };
}
