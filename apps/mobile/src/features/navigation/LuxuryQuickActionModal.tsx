import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { hapticFeedback, tokens } from "@repo/ui";
import { useCommandPaletteStore } from "../command/commandStore";

export interface LuxuryQuickActionModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenStorefront: () => void;
}

export function LuxuryQuickActionModal({
  visible,
  onClose,
  onOpenStorefront,
}: LuxuryQuickActionModalProps): React.JSX.Element {
  const openCommandPalette = useCommandPaletteStore((s) => s.open);

  const handleAction = (callback: () => void) => {
    hapticFeedback.buttonPress();
    onClose();
    setTimeout(callback, 150);
  };

  const actions = [
    {
      id: "add_product",
      title: "Add Luxury Product (AI Studio)",
      subtitle: "Capture with Carrara Marble & Velvet backdrops",
      icon: "camera" as const,
      color: tokens.colors.light.accent,
      badge: "AI 2.0",
      action: () => router.push("/products/create"),
    },
    {
      id: "collect_payment",
      title: "Telebirr & CBE Payment Terminal",
      subtitle: "Instant settlement via National Payment Switch",
      icon: "card" as const,
      color: tokens.colors.light.gold,
      badge: "ETB Birr",
      action: () => router.push("/orders/ord_1"),
    },
    {
      id: "command_k",
      title: "Universal Command Palette (⌘K)",
      subtitle: "Instant search across items, orders and ops",
      icon: "search" as const,
      color: tokens.colors.light.primary,
      badge: "⌘K",
      action: () => openCommandPalette(),
    },
    {
      id: "buyer_storefront",
      title: "Live Customer Storefront View",
      subtitle: "Preview Addis Ababa boutique perspective",
      icon: "eye" as const,
      color: tokens.colors.light.accent,
      badge: "Live View",
      action: () => onOpenStorefront(),
    },
    {
      id: "payout_vault",
      title: "Financial Vault & Settlements",
      subtitle: "Biometric balance and batch payouts",
      icon: "shield-checkmark" as const,
      color: tokens.colors.light.gold,
      badge: "Biometric",
      action: () => router.push("/payouts"),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header handle & gold accent */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.brandEmblem}>✦</Text>
              <Text style={styles.title}>Atelier Quick Actions</Text>
            </View>
            <Text style={styles.subtitle}>
              Instant operations for Addis Ababa Boutique Flagship
            </Text>
          </View>

          <View style={styles.actionList}>
            {actions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => handleAction(item.action)}
              >
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.actionContent}>
                  <View style={styles.actionTopRow}>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <View style={styles.actionBadge}>
                      <Text style={[styles.actionBadgeText, { color: item.color }]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={tokens.colors.light.contentMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.dismissButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.dismissText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgOverlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: tokens.colors.dark.bgSurface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xl,
    paddingTop: tokens.spacing.sm,
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: tokens.spacing.xs,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.light.contentMuted,
    opacity: 0.4,
  },
  header: {
    marginVertical: tokens.spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  brandEmblem: {
    fontSize: 16,
    color: tokens.colors.light.gold,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.colors.dark.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: tokens.colors.dark.textSecondary,
    marginTop: 2,
  },
  actionList: {
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.dark.bgRaised,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.dark.borderSubtle,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: tokens.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.dark.textPrimary,
  },
  actionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: tokens.colors.dark.textSecondary,
  },
  dismissButton: {
    backgroundColor: tokens.colors.dark.bgRaised,
    borderRadius: tokens.radii.md,
    paddingVertical: tokens.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: tokens.colors.dark.borderSubtle,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.dark.textSecondary,
  },
});
