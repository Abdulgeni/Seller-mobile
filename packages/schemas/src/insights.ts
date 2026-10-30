import { z } from "zod";

export const DepletionUrgencySchema = z.enum(["critical", "warning", "healthy"]);
export type DepletionUrgency = z.infer<typeof DepletionUrgencySchema>;

export const InventoryDepletionForecastSchema = z.object({
  productId: z.string(),
  title: z.string(),
  category: z.string(),
  currentStock: z.number().int().nonnegative(),
  dailyVelocity: z.number().nonnegative(),
  daysUntilStockout: z.number().nonnegative(),
  urgency: DepletionUrgencySchema,
});
export type InventoryDepletionForecast = z.infer<
  typeof InventoryDepletionForecastSchema
>;

export const RevenueMarginBreakdownSchema = z.object({
  grossRevenue: z.number().nonnegative(),
  estimatedFees: z.number().nonnegative(),
  netPayout: z.number().nonnegative(),
  currency: z.string().default("KES"),
  marginPercent: z.number(),
});
export type RevenueMarginBreakdown = z.infer<
  typeof RevenueMarginBreakdownSchema
>;

export const TrendPointSchema = z.object({
  date: z.string(),
  label: z.string(),
  value: z.number(),
});
export type TrendPoint = z.infer<typeof TrendPointSchema>;

export const Insights2OverviewSchema = z.object({
  depletionForecasts: z.array(InventoryDepletionForecastSchema),
  revenueMargin: RevenueMarginBreakdownSchema,
  sparklineData: z.array(TrendPointSchema),
});
export type Insights2Overview = z.infer<typeof Insights2OverviewSchema>;
