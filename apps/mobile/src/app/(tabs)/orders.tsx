import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { Order, OrderStatus } from "@repo/schemas";
import { Badge, Card, EmptyState, Input, Skeleton, t, tokens } from "@repo/ui";

const STATUS_FILTERS: { label: string; value?: OrderStatus | undefined }[] = [
  { label: "All" },
  { label: "New", value: "NEW" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

type DateFilterKey = "ALL" | "TODAY" | "WEEK";
const DATE_FILTERS: { label: string; key: DateFilterKey }[] = [
  { label: "All Time", key: "ALL" },
  { label: "Today", key: "TODAY" },
  { label: "Last 7 Days", key: "WEEK" },
];

export default function OrdersScreen(): React.JSX.Element {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<DateFilterKey>("ALL");
  const [search, setSearch] = useState("");

  const startDate = dateFilter === "TODAY"
    ? new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    : dateFilter === "WEEK"
    ? new Date(Date.now() - 7 * 86400000).toISOString()
    : undefined;

  const { data: orders = [], isLoading, isError, error, isStale, refetch } = useQuery({
    queryKey: queryKeys.orders.list({
      status: selectedStatus,
      search: search || undefined,
      startDate,
    }),
    queryFn: () =>
      defaultApiClient.getOrders({
        status: selectedStatus,
        search: search || undefined,
        startDate,
      }),
  });

  const getBadgeVariant = (status: OrderStatus): "new" | "accepted" | "packed" | "shipped" | "delivered" | "cancelled" => {
    switch (status) {
      case "NEW": return "new";
      case "ACCEPTED": return "accepted";
      case "PACKED": return "packed";
      case "SHIPPED": return "shipped";
      case "DELIVERED": return "delivered";
      case "CANCELLED": return "cancelled";
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <Pressable
        onPress={() => router.push(`/orders/${item.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Order ${item.orderNumber}`}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, marginBottom: tokens.spacing.sm }]}
      >
        <Card>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              <Text style={styles.customerName}>{item.customer.name}</Text>
            </View>
            <Badge label={item.status} variant={getBadgeVariant(item.status)} />
          </View>

          <View style={styles.orderDivider} />

          <View style={styles.orderFooter}>
            <Text style={styles.itemCount}>
              {item.items.length} {item.items.length === 1 ? "item" : "items"}
            </Text>
            <Text style={styles.orderTotal}>
              {item.currency} {item.total.toLocaleString()}
            </Text>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder={t("orders.searchPlaceholder")}
        value={search}
        onChangeText={setSearch}
      />

      {/* Date Filter Tabs */}
      <View style={styles.dateFilterRow}>
        {DATE_FILTERS.map((df) => {
          const isSelected = dateFilter === df.key;
          return (
            <Pressable
              key={df.key}
              onPress={() => setDateFilter(df.key)}
              style={[
                styles.dateChip,
                isSelected && { backgroundColor: tokens.colors.light.surfaceSubtle, borderColor: tokens.colors.light.primary },
              ]}
            >
              <Text
                style={[
                  styles.dateChipText,
                  isSelected && { color: tokens.colors.light.primary, fontWeight: "700" },
                ]}
              >
                {df.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((chip) => {
          const isSelected = selectedStatus === chip.value;
          return (
            <Pressable
              key={chip.label}
              onPress={() => setSelectedStatus(chip.value)}
              style={[
                styles.chip,
                isSelected && { backgroundColor: tokens.colors.light.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && { color: tokens.colors.light.primaryForeground },
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Stale Cache Indicator */}
      {isStale && !isLoading && orders.length > 0 && (
        <View style={styles.staleBanner}>
          <Text style={styles.staleText}>⚡ Offline cache active (showing cached orders)</Text>
        </View>
      )}

      {isLoading ? (
        <View style={{ gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }}>
          <Skeleton height={90} borderRadius={tokens.radii.md} />
          <Skeleton height={90} borderRadius={tokens.radii.md} />
          <Skeleton height={90} borderRadius={tokens.radii.md} />
        </View>
      ) : isError ? (
        <EmptyState
          title={t("common.error")}
          description={error instanceof Error ? error.message : "Failed to load orders"}
          actionTitle={t("common.retry")}
          onAction={() => refetch()}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title={t("orders.empty")}
          description="Try clearing filters to see all orders."
        />
      ) : (
        <FlashList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: tokens.spacing.xl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.light.background,
  },
  dateFilterRow: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
  },
  dateChip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
    minHeight: 28,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
  },
  staleBanner: {
    backgroundColor: tokens.colors.light.surfaceSubtle,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radii.sm,
    marginBottom: tokens.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.light.primary,
  },
  staleText: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    fontWeight: "500",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  customerName: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  orderDivider: {
    height: 1,
    backgroundColor: tokens.colors.light.border,
    marginVertical: tokens.spacing.sm,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCount: {
    fontSize: 13,
    color: tokens.colors.light.contentMuted,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
});
