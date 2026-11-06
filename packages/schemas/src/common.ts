import { z } from "zod";

export const VendorScopeSchema = z.object({
  vendorId: z.string().min(1).default("vdr_primary_store"),
});

export const UuidSchema = z.string().uuid();

export const CurrencyCodeSchema = z.enum(["ETB", "KES", "USD", "EUR", "GBP"]);

export const IsoDateTimeSchema = z.string().datetime();

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type VendorScope = z.infer<typeof VendorScopeSchema>;
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
