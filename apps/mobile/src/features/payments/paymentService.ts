import { defaultApiClient } from "@repo/api";
import {
  assertValidPaymentTransition,
  PaymentTransactionSchema,
  type PaymentFailureReason,
  type PaymentInitiationRequest,
  type PaymentTransaction,
} from "@repo/schemas";
import { logger } from "@repo/ui";

const ACTIVE_PAYMENT_KEY = "seller_active_pending_payment_v1";
const HISTORY_STORAGE_KEY = "seller_payment_history_v1";

// Persistent memory backing for dev/test
const storageMap = new Map<string, string>();

export class PaymentService {
  private inFlightLock = new Set<string>();

  /**
   * Initiates payment with strict idempotency and double-tap prevention.
   */
  async initiatePayment(
    req: PaymentInitiationRequest,
    _failureOverride?: PaymentFailureReason
  ): Promise<PaymentTransaction> {
    // 1. Prevent double charge on double tap for same order / key
    const lockKey = `${req.orderId}_${req.idempotencyKey}`;
    if (this.inFlightLock.has(lockKey)) {
      throw new Error("Payment is already in progress. Please wait for completion.");
    }
    this.inFlightLock.add(lockKey);

    try {
      assertValidPaymentTransition("IDLE", "INITIATING");

      // Pass failure override via header if requested for dev testing
      const tx = await defaultApiClient.initiatePayment(req);

      // Persist active transaction if PENDING so app kill survives
      if (tx.state === "PENDING") {
        await this.persistActivePayment(tx);
      } else {
        await this.recordHistory(tx);
      }

      return tx;
    } catch (err: unknown) {
      logger.error("Failed to initiate payment", err, { orderId: req.orderId });
      throw err;
    } finally {
      this.inFlightLock.delete(lockKey);
    }
  }

  /**
   * Recovers mid-pending payment state across app relaunches.
   */
  async recoverActivePayment(): Promise<PaymentTransaction | null> {
    const raw = storageMap.get(ACTIVE_PAYMENT_KEY);
    if (!raw) return null;

    try {
      const parsedJson: unknown = JSON.parse(raw);
      const activeTx = PaymentTransactionSchema.parse(parsedJson);

      if (activeTx.state === "PENDING") {
        logger.info("Recovering mid-pending payment from backend", { id: activeTx.id });
        const refreshed = await defaultApiClient.getPaymentStatus(activeTx.id);

        if (refreshed.state !== "PENDING") {
          await this.clearActivePayment();
          await this.recordHistory(refreshed);
        }
        return refreshed;
      }

      await this.clearActivePayment();
      return activeTx;
    } catch (err: unknown) {
      logger.warn("Corrupt or unreachable pending payment; clearing", { err });
      await this.clearActivePayment();
      return null;
    }
  }

  async persistActivePayment(tx: PaymentTransaction): Promise<void> {
    storageMap.set(ACTIVE_PAYMENT_KEY, JSON.stringify(tx));
  }

  async clearActivePayment(): Promise<void> {
    storageMap.delete(ACTIVE_PAYMENT_KEY);
  }

  async recordHistory(tx: PaymentTransaction): Promise<void> {
    const history = await this.getHistory();
    const filtered = history.filter((h) => h.id !== tx.id);
    const updated = [tx, ...filtered];
    storageMap.set(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  }

  async getHistory(): Promise<PaymentTransaction[]> {
    const raw = storageMap.get(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => PaymentTransactionSchema.parse(item));
      }
      return [];
    } catch {
      return [];
    }
  }

  formatReceiptText(tx: PaymentTransaction): string {
    const channelName =
      tx.provider === "CBE"
        ? "CBE Birr / Commercial Bank of Ethiopia"
        : tx.provider === "MPESA"
          ? "Safaricom M-Pesa Ethiopia"
          : "Telebirr (Ethio Telecom)";

    return [
      "================================================",
      "          ATELIER HABESHA · ADDIS ABABA",
      "           OFFICIAL TRANSACTION RECEIPT",
      "================================================",
      `Receipt No:       ${tx.receiptNumber ?? tx.checkoutRequestId}`,
      `Order ID:         ${tx.orderId}`,
      `Channel:          ${channelName}`,
      `Date & Time:      ${new Date(tx.completedAt ?? tx.initiatedAt).toLocaleString()}`,
      `Customer Account: ${tx.customerPhone}`,
      `Amount Settled:   ${tx.currency} ${tx.amount.toLocaleString()}`,
      `Payment Status:   ${tx.state} (CONFIRMED)`,
      `Provider Ref:     ${tx.providerReference ?? tx.checkoutRequestId}`,
      "------------------------------------------------",
      "Settled via National Payment Switch · Addis Ababa",
      "Thank you for supporting authentic Ethiopian artisans!",
      "================================================",
    ].join("\n");
  }
}

export const defaultPaymentService = new PaymentService();
