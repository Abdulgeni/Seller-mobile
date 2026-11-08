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
import { useAppTheme } from "../../features/theme/ThemeContext";

export default function DashboardScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useAppTheme();
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
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.bgCanvas },
        ]}
      >
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
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.bgCanvas },
        ]}
      >
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
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: 110,
          backgroundColor: colors.bgCanvas,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Halal Market Luxury Brand Header */}
      <View style={styles.luxuryHeader}>
        <View style={styles.headerBrandRow}>
          <View style={styles.brandTitleBox}>
            <View
              style={[
                styles.emblemBadge,
                {
                  backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : tokens.colors.light.goldSubtle,
                  borderColor: tokens.colors.light.gold,
                },
              ]}
            >
              <Text style={styles.emblemText}>۞</Text>
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                HALAL MARKET
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                ADDIS ABABA · CERTIFIED PURE
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* Day / Night Theme Toggle */}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
              onPress={toggleTheme}
              style={[
                styles.themeTogglePill,
                {
                  backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : tokens.colors.light.bgRaised,
                  borderColor: isDark ? tokens.colors.light.gold : tokens.colors.light.borderSubtle,
                },
              ]}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={14}
                color={isDark ? tokens.colors.light.gold : tokens.colors.light.contentPrimary}
              />
              <Text
                style={[
                  styles.themeToggleText,
                  { color: isDark ? tokens.colors.light.gold : tokens.colors.light.contentPrimary },
                ]}
              >
                {isDark ? "Night" : "Day"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Search Command Palette"
              onPress={() => {
                hapticFeedback.buttonPress();
                useCommandPaletteStore.getState().open();
              }}
              style={[
                styles.headerIconButton,
                {
                  backgroundColor: colors.bgRaised,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Ionicons name="search" size={17} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Orders & Notifications"
              onPress={() => {
                hapticFeedback.buttonPress();
                router.push("/orders");
              }}
              style={[
                styles.headerIconButton,
                {
                  backgroundColor: colors.bgRaised,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={17}
                color={colors.textPrimary}
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
              style={[
                styles.headerIconButton,
                styles.headerStorefrontButton,
                {
                  backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : tokens.colors.light.goldSubtle,
                  borderColor: tokens.colors.light.gold,
                },
              ]}
            >
              <Ionicons name="eye-outline" size={17} color={tokens.colors.light.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ethiopian National Payment Switch Live Status Pill */}
        <View
          style={[
            styles.marketStatusPill,
            {
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : tokens.colors.light.accentSubtle,
              borderColor: tokens.colors.light.accent,
            },
          ]}
        >
          <View style={styles.liveIndicatorDot} />
          <Text style={styles.marketStatusText}>
            Live in Addis Ababa · Telebirr, CBE Birr & M-Pesa Active
          </Text>
        </View>
      </View>

      {/* Boutique Sovereign Treasury Hero Card */}
      <Card
        style={[
          styles.treasuryHeroCard,
          {
            backgroundColor: isDark ? tokens.colors.dark.bgSurface : tokens.colors.light.surface,
            borderColor: "rgba(217, 119, 6, 0.35)",
          },
        ]}
      >
        <View style={styles.treasuryTopRow}>
          <View>
            <Text style={styles.treasuryLabel}>TOTAL PORTFOLIO & REVENUE</Text>
            <NumericRoll
              value={kpis.revenueToday}
              prefix={`${kpis.currency} `}
              style={[
                styles.treasuryValue,
                { color: isDark ? tokens.colors.dark.textPrimary : tokens.colors.light.contentPrimary },
              ]}
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
            <Text
              style={[
                styles.settlementStatValue,
                { color: isDark ? tokens.colors.dark.textPrimary : tokens.colors.light.contentPrimary },
              ]}
            >
              {kpis.ordersTodayCount} Today
            </Text>
          </View>
          <View style={styles.settlementDividerVertical} />
          <View style={styles.settlementStat}>
            <Text style={styles.settlementStatLabel}>Pending Payout</Text>
            <Text
              style={[
                styles.settlementStatValue,
                { color: isDark ? tokens.colors.dark.textPrimary : tokens.colors.light.contentPrimary },
              ]}
            >
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
        <View
          style={[
            styles.kpiCard,
            {
              backgroundColor: colors.bgSurface,
              borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(217, 119, 6, 0.16)",
            },
          ]}
        >
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{t("dashboard.ordersToday")}</Text>
          <NumericRoll
            value={kpis.ordersTodayCount}
            style={[styles.kpiValue, { color: colors.textPrimary }]}
          />
          <Text style={[styles.kpiSubtext, { color: colors.textTertiary }]}>
            {kpis.ordersPendingAcceptanceCount} awaiting acceptance
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            {
              backgroundColor: colors.bgSurface,
              borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(217, 119, 6, 0.16)",
            },
          ]}
        >
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{t("dashboard.lowStock")}</Text>
          <NumericRoll
            value={kpis.lowStockItemsCount}
            style={[styles.kpiValue, { color: colors.critical }]}
          />
          <Text style={[styles.kpiSubtext, { color: colors.textTertiary }]}>Needs re-order</Text>
        </View>
      </View>

      {/* 7-Day Revenue Trend (Pre-aggregated Server Series) */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(217, 119, 6, 0.16)",
          },
        ]}
      >
        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>{t("dashboard.revenueTrend")}</Text>
        <View style={styles.chartBars}>
          {kpis.revenue7DaysSeries.map((point) => {
            const maxRev = 200000;
            const barHeight = Math.min(100, Math.max(12, (point.revenue / maxRev) * 100));
            const isHighest = point.label === "Tue";
            return (
              <View key={point.date} style={styles.barColumn}>
                <Text style={[styles.barValue, { color: colors.textTertiary }]}>
                  {Math.round(point.revenue / 1000)}k
                </Text>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: isHighest ? colors.gold : isDark ? "rgba(245, 158, 11, 0.25)" : colors.borderStrong,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: isHighest ? colors.gold : colors.textSecondary, fontWeight: isHighest ? "700" : "500" }]}>
                  {point.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Insights 2.0: Inventory Depletion Forecast */}
      {insights && (
        <View
          style={[
            styles.insightsCard,
            {
              backgroundColor: colors.bgSurface,
              borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(217, 119, 6, 0.16)",
            },
          ]}
        >
          <View style={styles.insightsHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="sparkles" size={15} color={colors.gold} />
              <Text style={[styles.insightsTitle, { color: colors.textPrimary }]}>Stock Runout Forecast</Text>
            </View>
            <Text style={[styles.insightsSubtitle, { color: colors.textSecondary }]}>
              Predictive burn-rate analysis based on order velocity
            </Text>
          </View>

          <View style={styles.forecastList}>
            {insights.depletionForecasts.map((f) => (
              <View key={f.productId} style={[styles.forecastRow, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.forecastMeta}>
                  <Text style={[styles.forecastTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {f.title}
                  </Text>
                  <Text style={[styles.forecastSub, { color: colors.textSecondary }]}>
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
        </View>
      )}

      {/* Insights 2.0: Revenue Margin & Sparkline */}
      {insights && (
        <View
          style={[
            styles.marginCard,
            {
              backgroundColor: colors.bgSurface,
              borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(217, 119, 6, 0.16)",
            },
          ]}
        >
          <View style={styles.marginHeader}>
            <View>
              <Text style={[styles.marginTitle, { color: colors.textSecondary }]}>Net Settlement Margin</Text>
              <Text style={[styles.marginValue, { color: colors.textPrimary }]}>
                {insights.revenueMargin.marginPercent}%
              </Text>
            </View>
            <View style={styles.marginStats}>
              <Text style={[styles.marginDetail, { color: colors.textSecondary }]}>
                Gross: {insights.revenueMargin.currency} {insights.revenueMargin.grossRevenue.toLocaleString()}
              </Text>
              <Text style={[styles.marginFee, { color: colors.textTertiary }]}>
                Gateway Fees: -{insights.revenueMargin.currency} {insights.revenueMargin.estimatedFees.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={{ height: tokens.spacing.sm }} />
          <SparklineChart data={insights.sparklineData} height={64} />
        </View>
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emblemText: {
    fontSize: 16,
    color: tokens.colors.light.gold,
    fontWeight: "800",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  themeTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    gap: 4,
  },
  themeToggleText: {
    fontSize: 11,
    fontWeight: "700",
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  headerStorefrontButton: {},
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
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
    alignSelf: "flex-start",
    marginTop: tokens.spacing.sm,
    borderWidth: 1,
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
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
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
    borderRadius: 18,
    borderWidth: 1,
    padding: tokens.spacing.md,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: tokens.spacing.xs,
    fontVariant: ["tabular-nums"],
  },
  kpiSubtext: {
    fontSize: 12,
    marginTop: tokens.spacing.xs,
  },
  chartCard: {
    padding: tokens.spacing.md,
    borderRadius: 18,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "700",
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
    marginBottom: 4,
  },
  barFill: {
    width: 20,
    borderRadius: tokens.radii.sm,
  },
  barLabel: {
    fontSize: 12,
    marginTop: tokens.spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: tokens.spacing.md,
  },
  insightsCard: {
    padding: tokens.spacing.md,
    borderRadius: 18,
    borderWidth: 1,
  },
  insightsHeader: {
    marginBottom: tokens.spacing.sm,
  },
  insightsTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  insightsSubtitle: {
    fontSize: 12,
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
  },
  forecastMeta: {
    flex: 1,
    marginRight: tokens.spacing.sm,
  },
  forecastTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  forecastSub: {
    fontSize: 11,
    marginTop: 1,
  },
  marginCard: {
    padding: tokens.spacing.md,
    borderRadius: 18,
    borderWidth: 1,
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
