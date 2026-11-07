import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { Order, OrderStatus } from "@repo/schemas";
import { hapticFeedback, Skeleton, tokens } from "@repo/ui";
import { useAppTheme } from "../../features/theme/ThemeContext";

interface StatusFilterOption {
  label: string;
  value?: OrderStatus | undefined;
  icon: keyof typeof Ionicons.glyphMap;
}

const STATUS_FILTERS: StatusFilterOption[] = [
  { label: "All", icon: "grid-outline" },
  { label: "New", value: "NEW", icon: "sparkles-outline" },
  { label: "Accepted", value: "ACCEPTED", icon: "checkmark-circle-outline" },
  { label: "Packed", value: "PACKED", icon: "cube-outline" },
  { label: "Shipped", value: "SHIPPED", icon: "airplane-outline" },
  { label: "Delivered", value: "DELIVERED", icon: "ribbon-outline" },
  { label: "Cancelled", value: "CANCELLED", icon: "close-circle-outline" },
];

type DateFilterKey = "ALL" | "TODAY" | "WEEK";
const DATE_FILTERS: { label: string; key: DateFilterKey }[] = [
  { label: "All Time", key: "ALL" },
  { label: "Today", key: "TODAY" },
  { label: "Last 7 Days", key: "WEEK" },
];

export default function OrdersScreen(): React.JSX.Element {
  const { isDark, colors } = useAppTheme();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("ALL");
  const [search, setSearch] = useState("");

  const { data: orders = [], isLoading, isError, error, isStale, refetch } = useQuery({
    queryKey: [...queryKeys.orders.lists(), { status: selectedStatus, search: search || undefined, dateFilter }],
    queryFn: () => {
      let startDate: string | undefined = undefined;
      if (dateFilter === "TODAY") {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        startDate = d.toISOString();
      } else if (dateFilter === "WEEK") {
        startDate = new Date(Date.now() - 7 * 86400000).toISOString();
      }

      return defaultApiClient.getOrders({
        status: selectedStatus,
        search: search || undefined,
        startDate,
      });
    },
  });

  const getStatusBadgeConfig = (status: OrderStatus) => {
    switch (status) {
      case "NEW":
        return {
          bg: isDark ? "rgba(16, 185, 129, 0.16)" : "#ECFDF5",
          text: isDark ? "#34D399" : "#059669",
          border: isDark ? "rgba(16, 185, 129, 0.3)" : "#A7F3D0",
          icon: "sparkles" as const,
        };
      case "ACCEPTED":
        return {
          bg: isDark ? "rgba(245, 158, 11, 0.16)" : "#FEF3C7",
          text: isDark ? "#FBBF24" : "#B45309",
          border: isDark ? "rgba(245, 158, 11, 0.3)" : "#FDE68A",
          icon: "checkmark-circle" as const,
        };
      case "PACKED":
        return {
          bg: isDark ? "rgba(99, 102, 241, 0.16)" : "#EEF2FF",
          text: isDark ? "#818CF8" : "#4338CA",
          border: isDark ? "rgba(99, 102, 241, 0.3)" : "#C7D2FE",
          icon: "cube" as const,
        };
      case "SHIPPED":
        return {
          bg: isDark ? "rgba(59, 130, 246, 0.16)" : "#EFF6FF",
          text: isDark ? "#60A5FA" : "#1D4ED8",
          border: isDark ? "rgba(59, 130, 246, 0.3)" : "#BFDBFE",
          icon: "airplane" as const,
        };
      case "DELIVERED":
        return {
          bg: isDark ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5",
          text: isDark ? "#10B981" : "#047857",
          border: isDark ? "rgba(16, 185, 129, 0.4)" : "#6EE7B7",
          icon: "ribbon" as const,
        };
      case "CANCELLED":
        return {
          bg: isDark ? "rgba(239, 68, 68, 0.16)" : "#FEF2F2",
          text: isDark ? "#F87171" : "#B91C1C",
          border: isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA",
          icon: "close-circle" as const,
        };
    }
  };

  const getPaymentGateway = (orderId: string) => {
    const hash = orderId.charCodeAt(orderId.length - 1) % 3;
    if (hash === 0) return { name: "Telebirr SuperApp", color: "#0284C7", bg: isDark ? "rgba(2, 132, 199, 0.15)" : "#E0F2FE" };
    if (hash === 1) return { name: "CBE Birr", color: "#9333EA", bg: isDark ? "rgba(147, 51, 234, 0.15)" : "#F3E8FF" };
    return { name: "M-Pesa Safaricom", color: "#059669", bg: isDark ? "rgba(5, 150, 105, 0.15)" : "#ECFDF5" };
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusCfg = getStatusBadgeConfig(item.status);
    const payment = getPaymentGateway(item.id);
    const createdDate = new Date(item.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Pressable
        onPress={() => {
          hapticFeedback.selection();
          router.push(`/orders/${item.id}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Order ${item.orderNumber}`}
        style={({ pressed }) => [
          styles.orderCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.22)" : "rgba(217, 119, 6, 0.18)",
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.99 : 1.0 }],
          },
        ]}
      >
        {/* Card Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdBlock}>
            <View style={[styles.orderMonogramBadge, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
              <Ionicons name="sparkles" size={13} color={colors.gold} />
            </View>
            <View>
              <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>{item.orderNumber}</Text>
              <Text style={[styles.orderDate, { color: colors.textTertiary }]}>{createdDate}</Text>
            </View>
          </View>

          {/* Jewel Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusCfg.bg,
                borderColor: statusCfg.border,
              },
            ]}
          >
            <Ionicons name={statusCfg.icon} size={11} color={statusCfg.text} style={{ marginRight: 4 }} />
            <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Customer & Address Details */}
        <View style={[styles.customerSection, { backgroundColor: colors.bgRaised }]}>
          <View style={styles.customerRow}>
            <Ionicons name="person-circle-outline" size={16} color={colors.gold} />
            <Text style={[styles.customerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.customer.name}
            </Text>
          </View>
          {item.customer.shippingAddress ? (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
              <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.customer.shippingAddress}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Payment & Items Breakdown */}
        <View style={styles.metaRow}>
          <View style={[styles.paymentBadge, { backgroundColor: payment.bg }]}>
            <Ionicons name="shield-checkmark" size={12} color={payment.color} />
            <Text style={[styles.paymentBadgeText, { color: payment.color }]}>{payment.name}</Text>
          </View>

          <View style={styles.itemCountRow}>
            <Ionicons name="bag-handle-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.itemCountText, { color: colors.textSecondary }]}>
              {item.items.length} {item.items.length === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.orderDivider, { backgroundColor: colors.borderSubtle }]} />

        {/* Card Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={[styles.totalLabel, { color: colors.textTertiary }]}>TOTAL REVENUE</Text>
            <Text style={[styles.orderTotal, { color: colors.textPrimary }]}>
              <Text style={{ color: colors.gold, fontSize: 13, fontWeight: "700" }}>{item.currency} </Text>
              {item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.viewDossierButton, { borderColor: isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(217, 119, 6, 0.3)" }]}>
            <Text style={[styles.viewDossierText, { color: colors.gold }]}>Dossier</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.gold} />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBarContainer,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.gold} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by order #, client name, or address..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { color: colors.textPrimary }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch("")}
            hitSlop={8}
            style={styles.clearSearchBtn}
          >
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Date Filter Tabs */}
      <View style={styles.dateFilterRow}>
        {DATE_FILTERS.map((df) => {
          const isSelected = dateFilter === df.key;
          return (
            <Pressable
              key={df.key}
              onPress={() => {
                hapticFeedback.selection();
                setDateFilter(df.key);
              }}
              style={[
                styles.dateChip,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? "rgba(245, 158, 11, 0.18)"
                      : "#FEF3C7"
                    : colors.bgSurface,
                  borderColor: isSelected ? colors.gold : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.dateChipText,
                  {
                    color: isSelected ? colors.gold : colors.textSecondary,
                    fontWeight: isSelected ? "700" : "500",
                  },
                ]}
              >
                {df.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Status Filter Chips Scrollable Row */}
      <View style={{ marginBottom: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusChipsScroll}
        >
          {STATUS_FILTERS.map((chip) => {
            const isSelected = selectedStatus === chip.value;
            return (
              <Pressable
                key={chip.label}
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedStatus(chip.value);
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? colors.gold
                      : colors.bgSurface,
                    borderColor: isSelected ? colors.gold : colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={chip.icon}
                  size={12}
                  color={isSelected ? (isDark ? "#0A0D14" : "#FFFFFF") : colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? (isDark ? "#0A0D14" : "#FFFFFF") : colors.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Stale Cache Indicator */}
      {isStale && !isLoading && orders.length > 0 && (
        <View
          style={[
            styles.staleBanner,
            {
              backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB",
              borderColor: colors.gold,
            },
          ]}
        >
          <Ionicons name="cloud-offline-outline" size={14} color={colors.gold} style={{ marginRight: 6 }} />
          <Text style={[styles.staleText, { color: colors.gold }]}>
            Offline cache active (showing cached orders)
          </Text>
        </View>
      )}

      {/* Main Order Content */}
      {isLoading ? (
        <View style={{ gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }}>
          <Skeleton height={130} borderRadius={tokens.radii.lg} />
          <Skeleton height={130} borderRadius={tokens.radii.lg} />
          <Skeleton height={130} borderRadius={tokens.radii.lg} />
        </View>
      ) : isError ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.bgSurface }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }]}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.critical} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Order Synchronization Error</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {error instanceof Error ? error.message : "Failed to load orders"}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: colors.gold }]}
          >
            <Text style={[styles.retryButtonText, { color: isDark ? "#0A0D14" : "#FFFFFF" }]}>
              Retry Connection
            </Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.bgSurface }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
            <Ionicons name="receipt-outline" size={36} color={colors.gold} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Orders Found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            No client orders match the current status and date filters.
          </Text>
          {(selectedStatus !== undefined || dateFilter !== "ALL" || search.length > 0) && (
            <Pressable
              onPress={() => {
                hapticFeedback.selection();
                setSelectedStatus(undefined);
                setDateFilter("ALL");
                setSearch("");
              }}
              style={[styles.clearFilterButton, { borderColor: colors.gold }]}
            >
              <Ionicons name="refresh-outline" size={14} color={colors.gold} style={{ marginRight: 6 }} />
              <Text style={[styles.clearFilterText, { color: colors.gold }]}>Reset All Filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlashList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.sm,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.sm,
    height: 44,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    marginBottom: tokens.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  dateFilterRow: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
    marginVertical: tokens.spacing.xs,
  },
  dateChip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 6,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 12,
  },
  statusChipsScroll: {
    gap: tokens.spacing.xs,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  staleBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radii.sm,
    marginBottom: tokens.spacing.xs,
    borderLeftWidth: 3,
  },
  staleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderMonogramBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  orderDate: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  customerSection: {
    marginTop: tokens.spacing.sm,
    padding: tokens.spacing.xs + 4,
    borderRadius: 10,
    gap: 4,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customerName: {
    fontSize: 13,
    fontWeight: "600",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 2,
  },
  addressText: {
    fontSize: 11,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacing.xs + 2,
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemCountText: {
    fontSize: 12,
  },
  orderDivider: {
    height: 1,
    marginVertical: tokens.spacing.sm,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  orderTotal: {
    fontSize: 17,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
    marginTop: 2,
  },
  viewDossierButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    gap: 2,
  },
  viewDossierText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    marginTop: tokens.spacing.xl,
    padding: tokens.spacing.xl,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: tokens.spacing.md,
  },
  retryButton: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.full,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  clearFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.xs + 2,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
