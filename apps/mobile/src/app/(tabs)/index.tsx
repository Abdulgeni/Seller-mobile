import React from "react";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { defaultApiClient, queryKeys } from "@repo/api";
import { Button, Card, EmptyState, NumericRoll, Skeleton, t, tokens } from "@repo/ui";
import { useCommandPaletteStore } from "../../features/command/commandStore";

export default function DashboardScreen(): React.JSX.Element {
  const { data: kpis, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.dashboard.kpis(),
    queryFn: () => defaultApiClient.getDashboardKpis(),
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={110} borderRadius={tokens.radii.md} />
        <View style={{ height: tokens.spacing.md }} />
        <Skeleton height={110} borderRadius={tokens.radii.md} />
        <View style={{ height: tokens.spacing.md }} />
        <Skeleton height={180} borderRadius={tokens.radii.md} />
      </View>
    );
  }

  if (isError || !kpis) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={t("common.error")}
          description={error instanceof Error ? error.message : "Failed to load dashboard KPIs"}
          actionTitle={t("common.retry")}
          onAction={() => refetch()}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionHeader}>{t("dashboard.title")}</Text>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t("dashboard.revenueToday")}</Text>
          <NumericRoll
            value={kpis.revenueToday}
            prefix={`${kpis.currency} `}
            style={styles.kpiValue}
          />
          <Text style={[styles.kpiSubtext, { color: tokens.colors.light.success }]}>
            +{kpis.revenueChangePercent}% vs yesterday
          </Text>
        </Card>

        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t("dashboard.ordersToday")}</Text>
          <NumericRoll
            value={kpis.ordersTodayCount}
            style={styles.kpiValue}
          />
          <Text style={styles.kpiSubtext}>
            {kpis.ordersPendingAcceptanceCount} awaiting acceptance
          </Text>
        </Card>
      </View>

      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t("dashboard.lowStock")}</Text>
          <NumericRoll
            value={kpis.lowStockItemsCount}
            style={[styles.kpiValue, { color: tokens.colors.light.danger }]}
          />
          <Text style={styles.kpiSubtext}>Needs re-order</Text>
        </Card>

        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t("dashboard.pendingPayouts")}</Text>
          <NumericRoll
            value={kpis.pendingPayoutAmount}
            prefix={`${kpis.currency} `}
            style={styles.kpiValue}
          />
          <Text style={[styles.kpiSubtext, { color: tokens.colors.light.primary }]}>
            Biometric protected
          </Text>
        </Card>
      </View>

      {/* 7-Day Revenue Trend (Pre-aggregated Server Series) */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>{t("dashboard.revenueTrend")}</Text>
        <View style={styles.chartBars}>
          {kpis.revenue7DaysSeries.map((point) => {
            const maxRev = 200000;
            const barHeight = Math.min(100, Math.max(12, (point.revenue / maxRev) * 100));
            return (
              <View key={point.date} style={styles.barColumn}>
                <Text style={styles.barValue}>
                  {Math.round(point.revenue / 1000)}k
                </Text>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor:
                        point.label === "Tue"
                          ? tokens.colors.light.primary
                          : tokens.colors.light.borderFocus,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{point.label}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Quick Ops Navigation */}
      <View style={styles.actionsRow}>
        <Button
          title="+ Add Product"
          onPress={() => router.push("/products/create")}
        />
        <View style={{ width: tokens.spacing.sm }} />
        <Button
          title="Payouts"
          variant="secondary"
          onPress={() => router.push("/payouts")}
        />
        <View style={{ width: tokens.spacing.sm }} />
        <Button
          title="⌘K"
          variant="ghost"
          onPress={() => useCommandPaletteStore.getState().open()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.xs,
  },
  kpiGrid: {
    flexDirection: "row",
    gap: tokens.spacing.md,
  },
  kpiCard: {
    flex: 1,
    minHeight: 100,
  },
  kpiLabel: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    fontWeight: "500",
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginTop: tokens.spacing.xs,
  },
  kpiSubtext: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
    marginTop: tokens.spacing.xs,
  },
  chartCard: {
    padding: tokens.spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.md,
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    paddingTop: tokens.spacing.sm,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  barValue: {
    fontSize: 10,
    color: tokens.colors.light.contentMuted,
    marginBottom: 4,
  },
  barFill: {
    width: 20,
    borderRadius: tokens.radii.sm,
  },
  barLabel: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    marginTop: tokens.spacing.xs,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: tokens.spacing.md,
  },
});
