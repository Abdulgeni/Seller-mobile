import { z } from "zod";
import { CurrencyCodeSchema, IsoDateTimeSchema, VendorScopeSchema } from "./common";

export const OrderStatusSchema = z.enum([
  "NEW",
  "ACCEPTED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const OrderLineItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  productTitle: z.string().min(1),
  sku: z.string().min(1),
  vendorId: z.string().min(1).default("vdr_primary_store"),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
  commissionRate: z.number().min(0).max(1).default(0.0), // Multi-vendor seam
  netVendorAmount: z.number().positive(),                 // Multi-vendor seam
});

export const OrderTimelineEventSchema = z.object({
  id: z.string().min(1),
  status: OrderStatusSchema,
  timestamp: IsoDateTimeSchema,
  actor: z.string().min(1),
  note: z.string().optional(),
});

export const CustomerInfoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  shippingAddress: z.string().min(1),
});

export const OrderSchema = VendorScopeSchema.extend({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  customer: CustomerInfoSchema,
  status: OrderStatusSchema,
  items: z.array(OrderLineItemSchema).min(1),
  currency: CurrencyCodeSchema.default("KES"),
  subtotal: z.number().positive(),
  shippingFee: z.number().nonnegative().default(0),
  discountTotal: z.number().nonnegative().default(0),
  total: z.number().positive(),
  timeline: z.array(OrderTimelineEventSchema),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});

export const OrderTransitionMutationSchema = z.object({
  orderId: z.string().min(1),
  fromStatus: OrderStatusSchema,
  toStatus: OrderStatusSchema,
  note: z.string().optional(),
  idempotencyKey: z.string().uuid(),
});

export const OrderFilterParamsSchema = z.object({
  status: OrderStatusSchema.optional(),
  search: z.string().optional(),
  startDate: IsoDateTimeSchema.optional(),
  endDate: IsoDateTimeSchema.optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;
export type OrderTimelineEvent = z.infer<typeof OrderTimelineEventSchema>;
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderTransitionMutation = z.infer<typeof OrderTransitionMutationSchema>;
export type OrderFilterParams = z.infer<typeof OrderFilterParamsSchema>;
