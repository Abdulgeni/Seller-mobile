import { z } from "zod";
import { CurrencyCodeSchema, IsoDateTimeSchema, VendorScopeSchema } from "./common";

export const MsisdnSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid MSISDN phone format (E.164 required)");

export const PaymentStateSchema = z.enum([
  "IDLE",
  "INITIATING",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "TIMEOUT",
  "CANCELLED",
]);

export const PaymentFailureReasonSchema = z.enum([
  "INSUFFICIENT_FUNDS",
  "USER_CANCELLED",
  "TIMEOUT",
  "INVALID_PIN",
  "PROVIDER_ERROR",
  "NETWORK_ERROR",
]);

export const PaymentInitiationRequestSchema = VendorScopeSchema.extend({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: CurrencyCodeSchema.default("KES"),
  customerPhone: MsisdnSchema,
  idempotencyKey: z.string().uuid(),
});

export const PaymentTransactionSchema = VendorScopeSchema.extend({
  id: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: CurrencyCodeSchema.default("KES"),
  customerPhone: MsisdnSchema,
  state: PaymentStateSchema,
  failureReason: PaymentFailureReasonSchema.optional(),
  providerReference: z.string().optional(),
  idempotencyKey: z.string().uuid(),
  checkoutRequestId: z.string().min(1),
  initiatedAt: IsoDateTimeSchema,
  completedAt: IsoDateTimeSchema.optional(),
  receiptNumber: z.string().optional(),
});

export const PayoutBatchSchema = VendorScopeSchema.extend({
  id: z.string().min(1),
  batchNumber: z.string().min(1),
  grossAmount: z.number().positive(),
  platformFee: z.number().nonnegative().default(0), // Multi-vendor seam
  netAmount: z.number().positive(),
  recipientPhone: MsisdnSchema,
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  createdAt: IsoDateTimeSchema,
  completedAt: IsoDateTimeSchema.optional(),
});

export type PaymentState = z.infer<typeof PaymentStateSchema>;
export type PaymentFailureReason = z.infer<typeof PaymentFailureReasonSchema>;
export type PaymentInitiationRequest = z.infer<typeof PaymentInitiationRequestSchema>;
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;
export type PayoutBatch = z.infer<typeof PayoutBatchSchema>;
