import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultApiClient, queryKeys } from "@repo/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  hapticFeedback,
  NumericRoll,
  Skeleton,
  SparklineChart,
  t,
  tokens,
} from "@repo/ui";
import { useCommandPaletteStore } from "../../features/command/commandStore";
import { useNotificationStore } from "../../features/notifications/notificationStore";
import { StorefrontPreviewModal } from "../../features/storefront/StorefrontPreviewModal";

export default function DashboardScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [showStorefrontPreview, setShowStorefrontPreview] = useState(false);
  const unreadNotificationCount = useNotificationStore((s) => s.unreadCount);

  const { data: kpis, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.dashboard.kpis(),
    queryFn: () => defaultApiClient.getDashboardKpis(),
  });

  const { data: insights } = useQuery({
    queryKey: queryKeys.insights.overview(),
    queryFn: () => defaultApiClient.getInsightsOverview(),
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        <Skeleton height={140} borderRadius={tokens.radii.lg} />
        <View style={{ height: tokens.spacing.md }} />
        <Skeleton height={110} borderRadius={tokens.radii.md} />
        <View style={{ height: tokens.spacing.md }} />
        <Skeleton height={180} borderRadius={tokens.radii.md} />
      </View>
    );
  }

  if (isError || !kpis) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
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
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: Math.max(insets.top, 16), paddingBottom: 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Atelier Habesha Luxury Brand Header */}
      <View style={styles.luxuryHeader}>
        <View style={styles.headerBrandRow}>
          <View style={styles.brandTitleBox}>
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemText}>✦</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>ATELIER HABESHA</Text>
              <Text style={styles.brandSubtitle}>ADDIS ABABA · FLAGSHIP BOUTIQUE</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Search Command Palette"
              onPress={() => {
                hapticFeedback.buttonPress();
                useCommandPaletteStore.getState().open();
              }}
              style={styles.headerIconButton}
            >
              <Ionicons name="search" size={18} color={tokens.colors.light.contentPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Orders & Notifications"
              onPress={() => {
                hapticFeedback.buttonPress();
                router.push("/orders");
              }}
              style={styles.headerIconButton}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={tokens.colors.light.contentPrimary}
              />
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationDot} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Preview Storefront"
              onPress={() => {
                hapticFeedback.buttonPress();
                setShowStorefrontPreview(true);
              }}
              style={[styles.headerIconButton, styles.headerStorefrontButton]}
            >
              <Ionicons name="eye-outline" size={18} color={tokens.colors.light.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ethiopian National Payment Switch Live Status Pill */}
        <View style={styles.marketStatusPill}>
          <View style={styles.liveIndicatorDot} />
          <Text style={styles.marketStatusText}>
            Live in Addis Ababa · Telebirr, CBE Birr & M-Pesa Active
          </Text>
        </View>
      </View>

      {/* Boutique Sovereign Treasury Hero Card */}
      <Card style={styles.treasuryHeroCard}>
        <View style={styles.treasuryTopRow}>
          <View>
            <Text style={styles.treasuryLabel}>TOTAL PORTFOLIO & REVENUE</Text>
            <NumericRoll
              value={kpis.revenueToday}
              prefix={`${kpis.currency} `}
              style={styles.treasuryValue}
            />
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={14} color={tokens.colors.light.success} />
            <Text style={styles.trendText}>+{kpis.revenueChangePercent}%</Text>
          </View>
        </View>

        <View style={styles.treasuryDivider} />

        <View style={styles.treasuryBottomRow}>
          <View style={styles.settlementStat}>
            <Text style={styles.settlementStatLabel}>Orders Settled</Text>
            <Text style={styles.settlementStatValue}>{kpis.ordersTodayCount} Today</Text>
          </View>
          <View style={styles.settlementDividerVertical} />
          <View style={styles.settlementStat}>
            <Text style={styles.settlementStatLabel}>Pending Payout</Text>
            <Text style={styles.settlementStatValue}>
              {kpis.currency} {kpis.pendingPayoutAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.settlementDividerVertical} />
          <TouchableOpacity
            style={styles.heroPayoutButton}
            onPress={() => {
              hapticFeedback.buttonPress();
              router.push("/payouts");
            }}
          >
            <Text style={styles.heroPayoutText}>Payout ➔</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Secondary KPI Grid */}
      <View style={styles.kpiGrid}>
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

        <Card style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>{t("dashboard.lowStock")}</Text>
          <NumericRoll
            value={kpis.lowStockItemsCount}
            style={[styles.kpiValue, { color: tokens.colors.light.danger }]}
          />
          <Text style={styles.kpiSubtext}>Needs re-order</Text>
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

      {/* Insights 2.0: Inventory Depletion Forecast */}
      {insights && (
        <Card style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>✦ Stock Runout Forecast</Text>
            <Text style={styles.insightsSubtitle}>
              Predictive burn-rate analysis based on order velocity
            </Text>
          </View>

          <View style={styles.forecastList}>
            {insights.depletionForecasts.map((f) => (
              <View key={f.productId} style={styles.forecastRow}>
                <View style={styles.forecastMeta}>
                  <Text style={styles.forecastTitle} numberOfLines={1}>
                    {f.title}
                  </Text>
                  <Text style={styles.forecastSub}>
                    Stock: {f.currentStock} · Velocity: ~{f.dailyVelocity}/day
                  </Text>
                </View>
                <Badge
                  label={
                    f.urgency === "critical"
                      ? `~${f.daysUntilStockout}d RUNOUT`
                      : f.urgency === "warning"
                        ? `~${f.daysUntilStockout}d stock`
                        : "HEALTHY"
                  }
                  variant={
                    f.urgency === "critical"
                      ? "critical"
                      : f.urgency === "warning"
                        ? "warning"
                        : "success"
                  }
                  size="sm"
                />
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Insights 2.0: Revenue Margin & Sparkline */}
      {insights && (
        <Card style={styles.marginCard}>
          <View style={styles.marginHeader}>
            <View>
              <Text style={styles.marginTitle}>Net Settlement Margin</Text>
              <Text style={styles.marginValue}>
                {insights.revenueMargin.marginPercent}%
              </Text>
            </View>
            <View style={styles.marginStats}>
              <Text style={styles.marginDetail}>
                Gross: {insights.revenueMargin.currency} {insights.revenueMargin.grossRevenue.toLocaleString()}
              </Text>
              <Text style={styles.marginFee}>
                Payment Gateway Fees: -{insights.revenueMargin.currency} {insights.revenueMargin.estimatedFees.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={{ height: tokens.spacing.sm }} />
          <SparklineChart data={insights.sparklineData} height={64} />
        </Card>
      )}

      {/* Quick Ops Navigation */}
      <View style={styles.actionsRow}>
        <Button
          title="+ Add Product"
          onPress={() => {
            hapticFeedback.buttonPress();
            router.push("/products/create");
          }}
        />
        <View style={{ width: tokens.spacing.sm }} />
        <Button
          title="✦ Buyer View"
          variant="gold"
          onPress={() => {
            hapticFeedback.buttonPress();
            setShowStorefrontPreview(true);
          }}
        />
        <View style={{ width: tokens.spacing.sm }} />
        <Button
          title="Payouts"
          variant="secondary"
          onPress={() => {
            hapticFeedback.buttonPress();
            router.push("/payouts");
          }}
        />
        <View style={{ width: tokens.spacing.sm }} />
        <Button
          title="⌘K"
          variant="outline"
          onPress={() => {
            hapticFeedback.buttonPress();
            useCommandPaletteStore.getState().open();
          }}
        />
      </View>

      <StorefrontPreviewModal
        visible={showStorefrontPreview}
        onClose={() => setShowStorefrontPreview(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
    backgroundColor: tokens.colors.light.bgCanvas,
  },
  luxuryHeader: {
    marginBottom: tokens.spacing.xs,
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  emblemBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.light.goldSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.light.gold,
  },
  emblemText: {
    fontSize: 16,
    color: tokens.colors.light.gold,
    fontWeight: "800",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.light.bgRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
    position: "relative",
  },
  headerStorefrontButton: {
    backgroundColor: tokens.colors.light.goldSubtle,
    borderColor: tokens.colors.light.gold,
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: tokens.colors.light.critical,
  },
  marketStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.light.accentSubtle,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
    alignSelf: "flex-start",
    marginTop: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.accent,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.light.accent,
    marginRight: 6,
  },
  marketStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: tokens.colors.light.accent,
    letterSpacing: 0.2,
  },
  treasuryHeroCard: {
    backgroundColor: tokens.colors.dark.bgSurface,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.35)",
  },
  treasuryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  treasuryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.light.gold,
    letterSpacing: 0.8,
  },
  treasuryValue: {
    fontSize: 28,
    fontWeight: "800",
    color: tokens.colors.dark.textPrimary,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: tokens.colors.light.accentSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.success,
  },
  treasuryDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: tokens.spacing.md,
  },
  treasuryBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settlementStat: {
    flex: 1,
  },
  settlementStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: tokens.colors.dark.textSecondary,
  },
  settlementStatValue: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.dark.textPrimary,
    marginTop: 2,
  },
  settlementDividerVertical: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: tokens.spacing.xs,
  },
  heroPayoutButton: {
    backgroundColor: tokens.colors.light.gold,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 6,
    borderRadius: tokens.radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPayoutText: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.light.textInverse,
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
  insightsCard: {
    padding: tokens.spacing.md,
  },
  insightsHeader: {
    marginBottom: tokens.spacing.sm,
  },
  insightsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: 0.3,
  },
  insightsSubtitle: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  forecastList: {
    gap: tokens.spacing.xs,
  },
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: tokens.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
  },
  forecastMeta: {
    flex: 1,
    marginRight: tokens.spacing.sm,
  },
  forecastTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  forecastSub: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    marginTop: 1,
  },
  marginCard: {
    padding: tokens.spacing.md,
  },
  marginHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  marginTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
  },
  marginValue: {
    fontSize: 24,
    fontWeight: "700",
    color: tokens.colors.light.accent,
    fontVariant: ["tabular-nums"],
    marginTop: 2,
  },
  marginStats: {
    alignItems: "flex-end",
  },
  marginDetail: {
    fontSize: 11,
    color: tokens.colors.light.contentPrimary,
    fontWeight: "500",
  },
  marginFee: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
});
