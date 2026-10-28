import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { OrderStatus } from "@repo/schemas";
import { Badge, Button, Card, EmptyState, Skeleton, t, tokens } from "@repo/ui";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function OrderDetailScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = params.id ?? "";
  const queryClient = useQueryClient();
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => defaultApiClient.getOrder(orderId),
    enabled: Boolean(orderId),
  });

  const transitionMutation = useMutation({
    mutationFn: (toStatus: OrderStatus) =>
      defaultApiClient.transitionOrderStatus({
        orderId,
        fromStatus: order!.status,
        toStatus,
        idempotencyKey: `ord_trans_${orderId}_${toStatus}_${Date.now()}`,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.orders.detail(orderId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      Alert.alert("Success", `Order status updated to ${updated.status}`);
    },
    onError: (err) => {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update status");
    },
  });

  const handleSimulateMpesaCollect = async () => {
    if (!order) return;
    setPaymentInProgress(true);
    try {
      const tx = await defaultApiClient.initiatePayment({
        orderId: order.id,
        vendorId: order.vendorId,
        amount: order.total,
        currency: order.currency,
        customerPhone: order.customer.phone,
        idempotencyKey: `pay_${order.id}_${Date.now()}`,
      });

      Alert.alert(
        "M-Pesa STK Push Sent",
        `Sent request for ${order.currency} ${order.total} to ${order.customer.phone}.\nStatus: ${tx.state}`
      );
    } catch (err) {
      Alert.alert("Payment Error", err instanceof Error ? err.message : "Failed to initiate payment");
    } finally {
      setPaymentInProgress(false);
    }
  };

  if (!orderId) {
    return (
      <View style={styles.container}>
        <EmptyState title="Invalid Order ID" description="No order ID was provided in the route." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={140} borderRadius={tokens.radii.md} />
        <View style={{ height: tokens.spacing.md }} />
        <Skeleton height={160} borderRadius={tokens.radii.md} />
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Order Not Found"
          description={error instanceof Error ? error.message : "Could not load order details"}
          actionTitle={t("common.retry")}
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const nextActions = VALID_TRANSITIONS[order.status] ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Info */}
      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Badge label={order.status} variant="new" />
        </View>
        <Text style={styles.orderDate}>Placed on {new Date(order.createdAt).toLocaleDateString()}</Text>
      </Card>

      {/* Customer Information */}
      <Card>
        <Text style={styles.cardHeading}>{t("orders.customer")}</Text>
        <Text style={styles.customerName}>{order.customer.name}</Text>
        <Text style={styles.customerDetail}>📞 {order.customer.phone}</Text>
        <Text style={styles.customerDetail}>📍 {order.customer.shippingAddress}</Text>

        <View style={{ marginTop: tokens.spacing.md }}>
          <Button
            title={`Collect Payment (${order.currency} ${order.total})`}
            variant="outline"
            loading={paymentInProgress}
            onPress={handleSimulateMpesaCollect}
          />
        </View>
      </Card>

      {/* Line Items */}
      <Card>
        <Text style={styles.cardHeading}>Items ({order.items.length})</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.productTitle}</Text>
              <Text style={styles.itemSku}>SKU: {item.sku} | Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {order.currency} {item.subtotal.toLocaleString()}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <Text style={styles.totalLabel}>{t("orders.total")}</Text>
          <Text style={styles.totalAmount}>
            {order.currency} {order.total.toLocaleString()}
          </Text>
        </View>
      </Card>

      {/* Order Status Timeline */}
      <Card>
        <Text style={styles.cardHeading}>{t("orders.timeline")}</Text>
        {order.timeline.map((event) => (
          <View key={event.id} style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={{ flex: 1, marginLeft: tokens.spacing.sm }}>
              <Text style={styles.timelineStatus}>{event.status}</Text>
              <Text style={styles.timelineActor}>{event.actor}</Text>
              <Text style={styles.timelineTime}>{new Date(event.timestamp).toLocaleTimeString()}</Text>
              {event.note && <Text style={styles.timelineNote}>{event.note}</Text>}
            </View>
          </View>
        ))}
      </Card>

      {/* Status Action Buttons */}
      {nextActions.length > 0 && (
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsHeading}>Available Actions</Text>
          <View style={styles.actionsButtons}>
            {nextActions.map((targetStatus) => {
              const isCancel = targetStatus === "CANCELLED";
              return (
                <Button
                  key={targetStatus}
                  title={`Transition to ${targetStatus}`}
                  variant={isCancel ? "danger" : "primary"}
                  loading={transitionMutation.isPending}
                  onPress={() => transitionMutation.mutate(targetStatus)}
                />
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
    marginTop: 4,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.sm,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  customerDetail: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: tokens.spacing.xs,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  itemSku: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.light.border,
    marginVertical: tokens.spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.colors.light.primary,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: tokens.spacing.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.colors.light.primary,
    marginTop: 4,
  },
  timelineStatus: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  timelineActor: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
  },
  timelineTime: {
    fontSize: 11,
    color: tokens.colors.light.contentMuted,
  },
  timelineNote: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
  actionsHeading: {
    fontSize: 15,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  actionsButtons: {
    gap: tokens.spacing.sm,
  },
});
