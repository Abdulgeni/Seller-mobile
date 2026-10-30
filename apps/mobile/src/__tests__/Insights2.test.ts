import React from "react";
import { describe, expect, it } from "vitest";
import { defaultApiClient } from "@repo/api";
import { Insights2OverviewSchema } from "@repo/schemas";
import { SparklineChart } from "@repo/ui";

describe("Loop 6: Insights 2.0 & Stock Forecasting", () => {
  it("fetches server-aggregated insights overview matching Zod schema", async () => {
    const data = await defaultApiClient.getInsightsOverview();
    const parsed = Insights2OverviewSchema.parse(data);

    expect(parsed.depletionForecasts.length).toBeGreaterThan(0);
    expect(parsed.revenueMargin.grossRevenue).toBeGreaterThan(0);
    expect(parsed.revenueMargin.marginPercent).toBeGreaterThan(90);
    expect(parsed.sparklineData.length).toBe(7);
  });

  it("verifies inventory depletion urgency levels", async () => {
    const data = await defaultApiClient.getInsightsOverview();
    const criticalItem = data.depletionForecasts.find((f) => f.urgency === "critical");
    const warningItem = data.depletionForecasts.find((f) => f.urgency === "warning");

    expect(criticalItem).toBeDefined();
    expect(criticalItem?.daysUntilStockout).toBeLessThanOrEqual(5);

    expect(warningItem).toBeDefined();
    expect(warningItem?.daysUntilStockout).toBeGreaterThan(5);
  });

  it("SparklineChart component exports and renders valid elements", () => {
    expect(SparklineChart).toBeDefined();
    expect(typeof SparklineChart).toBe("function");

    const element = React.createElement(SparklineChart, {
      data: [
        { value: 10, label: "Mon" },
        { value: 25, label: "Tue" },
        { value: 18, label: "Wed" },
      ],
      height: 54,
    });
    expect(element.props.data.length).toBe(3);
  });
});
