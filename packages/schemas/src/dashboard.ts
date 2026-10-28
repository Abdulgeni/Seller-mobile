import { z } from "zod";
import { CurrencyCodeSchema, IsoDateTimeSchema, VendorScopeSchema } from "./common";

export const RevenueDataPointSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  label: z.string(), // e.g. "Mon", "Tue"
  revenue: z.number().nonnegative(),
  orderCount: z.number().int().nonnegative(),
});

export const DashboardKpiMetricsSchema = VendorScopeSchema.extend({
  revenueToday: z.number().nonnegative(),
  revenueYesterday: z.number().nonnegative(),
  revenueChangePercent: z.number(),
  ordersTodayCount: z.number().int().nonnegative(),
  ordersPendingAcceptanceCount: z.number().int().nonnegative(),
  lowStockItemsCount: z.number().int().nonnegative(),
  pendingPayoutAmount: z.number().nonnegative(),
  currency: CurrencyCodeSchema.default("KES"),
  revenue7DaysSeries: z.array(RevenueDataPointSchema),
  lastAggregatedAt: IsoDateTimeSchema,
});

export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;
export type DashboardKpiMetrics = z.infer<typeof DashboardKpiMetricsSchema>;
