import React, { useState } from "react";
import { router } from "expo-router";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Card, tokens } from "@repo/ui";
import { useAuthStore } from "../auth/authCoordinator";
import { parseAndValidateDeepLink } from "./deepLinks";
import { simulateIncomingNewOrder } from "./notificationManager";
import { useNotificationStore } from "./notificationStore";

export function NotificationHarnessModal(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const handleSimulateForegroundOrder = async () => {
    await simulateIncomingNewOrder({
      id: "ord_1",
      orderNumber: "1001",
      customerName: "Amina Mwangi",
      total: 4200,
    });
    setIsOpen(false);
  };

  const handleSimulateAcceptAction = () => {
    const rawLink = "seller://orders/ord_1?action=accept";
    const parsed = parseAndValidateDeepLink(rawLink);
    setIsOpen(false);
    if (parsed.valid && parsed.targetRoute) {
      router.push(parsed.targetRoute as unknown as Parameters<typeof router.push>[0]);
    }
  };

  const handleSimulateInvalidOrder = () => {
    const rawLink = "seller://orders/invalid_deleted_order_999";
    const parsed = parseAndValidateDeepLink(rawLink);
    setIsOpen(false);
    if (parsed.valid && parsed.targetRoute) {
      router.push(parsed.targetRoute as unknown as Parameters<typeof router.push>[0]);
    }
  };

  const handleSimulateColdStartWithAction = async () => {
    // 1. Reset auth hydration to simulate cold start
    const rawLink = "seller://orders/ord_2?action=accept";
    useAuthStore.setState({ isHydrated: false, pendingDeepLink: rawLink });
    setIsOpen(false);

    // 2. Simulate 200ms auth hydration delay
    setTimeout(() => {
      useAuthStore.getState().setHydrated("vdr_primary_store");
      useAuthStore.getState().resolvePendingDeepLink((route) => {
        router.push(route as unknown as Parameters<typeof router.push>[0]);
      });
    }, 200);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={styles.floatingTrigger}
        accessibilityRole="button"
        accessibilityLabel="Push Notification Dev Harness"
      >
        <Text style={styles.triggerText}>⚡ Push Test</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalContent}>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>Push Notification Harness</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Test foreground banner, action categories, cold-start hydration and empty states.
            </Text>

            <View style={styles.buttonStack}>
              <Button
                title="1. Trigger New Order (Foreground)"
                onPress={handleSimulateForegroundOrder}
              />
              <Button
                title="2. Trigger ACCEPT_ORDER Action"
                variant="secondary"
                onPress={handleSimulateAcceptAction}
              />
              <Button
                title="3. Test Invalid ID (Empty State)"
                variant="outline"
                onPress={handleSimulateInvalidOrder}
              />
              <Button
                title="4. Test Cold Start Deep Link"
                variant="secondary"
                onPress={handleSimulateColdStartWithAction}
              />
              <Button
                title="Clear All Notifications"
                variant="danger"
                onPress={clearAll}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingTrigger: {
    position: "absolute",
    bottom: 75,
    right: 16,
    backgroundColor: tokens.colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radii.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  triggerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: tokens.colors.light.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    margin: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  closeBtn: {
    fontSize: 18,
    color: tokens.colors.light.contentMuted,
    padding: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    marginBottom: tokens.spacing.xs,
  },
  buttonStack: {
    gap: tokens.spacing.xs,
  },
});
