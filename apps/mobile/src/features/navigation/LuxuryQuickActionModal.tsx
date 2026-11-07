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
import { useAppTheme } from "../theme/ThemeContext";

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
  const { isDark, colors } = useAppTheme();
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
      color: colors.accent,
      badge: "AI 2.0",
      action: () => router.push("/products/create"),
    },
    {
      id: "collect_payment",
      title: "Telebirr & CBE Payment Terminal",
      subtitle: "Instant settlement via National Payment Switch",
      icon: "card" as const,
      color: colors.gold,
      badge: "ETB Birr",
      action: () => router.push("/orders/ord_1"),
    },
    {
      id: "command_k",
      title: "Universal Command Palette (⌘K)",
      subtitle: "Instant search across items, orders and ops",
      icon: "search" as const,
      color: colors.accent,
      badge: "⌘K",
      action: () => openCommandPalette(),
    },
    {
      id: "buyer_storefront",
      title: "Live Customer Storefront View",
      subtitle: "Preview Addis Ababa boutique perspective",
      icon: "eye" as const,
      color: colors.gold,
      badge: "Live View",
      action: () => onOpenStorefront(),
    },
    {
      id: "payout_vault",
      title: "Financial Vault & Settlements",
      subtitle: "Biometric balance and batch payouts",
      icon: "shield-checkmark" as const,
      color: colors.gold,
      badge: "Biometric",
      action: () => router.push("/payouts"),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bgSurface,
              borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.emblemBadge, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
                <Ionicons name="sparkles" size={14} color={colors.gold} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Atelier Quick Actions</Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Instant operations for Addis Ababa Boutique Flagship
            </Text>
          </View>

          <View style={styles.actionList}>
            {actions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: colors.bgRaised,
                    borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(217, 119, 6, 0.15)",
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleAction(item.action)}
              >
                <View style={[styles.iconBox, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(217, 119, 6, 0.12)" }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.actionContent}>
                  <View style={styles.actionTopRow}>
                    <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                    <View style={[styles.actionBadge, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
                      <Text style={[styles.actionBadgeText, { color: item.color }]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.gold}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.dismissButton, { backgroundColor: colors.bgRaised, borderColor: colors.borderSubtle }]}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={[styles.dismissText, { color: colors.textPrimary }]}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 14, 20, 0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
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
    opacity: 0.6,
  },
  header: {
    marginVertical: tokens.spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs + 2,
  },
  emblemBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionList: {
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: tokens.spacing.md,
    borderWidth: 1,
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
    fontSize: 13,
    fontWeight: "700",
  },
  actionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  actionSubtitle: {
    fontSize: 11,
  },
  dismissButton: {
    borderRadius: tokens.radii.full,
    paddingVertical: tokens.spacing.md,
    alignItems: "center",
    borderWidth: 1,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
