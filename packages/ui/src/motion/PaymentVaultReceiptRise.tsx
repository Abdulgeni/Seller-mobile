import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Button } from "../components";
import { hapticFeedback } from "../haptics";
import { useReducedMotion } from "./index";
import { tokens } from "../tokens";

export interface ReceiptTransaction {
  id: string;
  amount: number;
  currency: string;
  state: string;
  checkoutRequestId?: string | undefined;
  receiptNumber?: string | null | undefined;
  completedAt?: string | null | undefined;
  createdAt?: string | null | undefined;
  failureReason?: string | null | undefined;
  [key: string]: unknown;
}

export interface PaymentVaultReceiptRiseProps {
  transaction: ReceiptTransaction;
  onShare: () => void;
  onDone: () => void;
}

export function PaymentVaultReceiptRise({
  transaction,
  onShare,
  onDone,
}: PaymentVaultReceiptRiseProps): React.JSX.Element {
  const isReducedMotion = useReducedMotion();
  const [slideAnim] = useState(() => new Animated.Value(isReducedMotion ? 0 : 50));
  const [scaleAnim] = useState(() => new Animated.Value(isReducedMotion ? 1 : 0.85));
  const [checkAnim] = useState(() => new Animated.Value(isReducedMotion ? 1 : 0));

  useEffect(() => {
    hapticFeedback.success();

    if (!isReducedMotion) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isReducedMotion, slideAnim, scaleAnim, checkAnim]);

  return (
    <Animated.View
      style={[
        styles.receiptContainer,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {/* Gold Seal Header */}
      <View style={styles.sealBadge}>
        <Text style={styles.sealIcon}>✦</Text>
        <Text style={styles.sealText}>ATELIER SETTLEMENT VAULT</Text>
      </View>

      {/* Vector Draw-on Checkmark representation */}
      <Animated.View style={[styles.checkCircle, { opacity: checkAnim }]}>
        <Text style={styles.checkIcon}>✓</Text>
      </Animated.View>

      <Text style={styles.successHeading}>Payment Cleared</Text>
      <Text style={styles.amountLarge}>
        {transaction.currency} {transaction.amount.toLocaleString()}
      </Text>

      {/* Receipt Details Table */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference No.</Text>
          <Text style={styles.detailValue}>
            {transaction.receiptNumber ?? transaction.checkoutRequestId}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Channel</Text>
          <Text style={styles.detailValue}>M-Pesa Express (STK)</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Timestamp</Text>
          <Text style={styles.detailValue}>
            {new Date(transaction.createdAt ?? transaction.completedAt ?? Date.now()).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={[styles.detailValue, { color: tokens.colors.light.accent }]}>
            SETTLED & CONFIRMED
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button title="Share Printable Receipt" variant="outline" onPress={onShare} />
        <View style={{ height: tokens.spacing.xs }} />
        <Button title="Dismiss & Finalize" variant="primary" onPress={onDone} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  receiptContainer: {
    alignItems: "center",
    paddingVertical: tokens.spacing.sm,
  },
  sealBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.light.bgRaised,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 3,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    borderColor: tokens.colors.light.gold,
    marginBottom: tokens.spacing.md,
  },
  sealIcon: {
    fontSize: 10,
    color: tokens.colors.light.gold,
  },
  sealText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: tokens.colors.light.gold,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.badgeDeliveredBg,
    borderWidth: 2,
    borderColor: tokens.colors.light.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.sm,
  },
  checkIcon: {
    fontSize: 28,
    fontWeight: "800",
    color: tokens.colors.light.accent,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    letterSpacing: -0.2,
  },
  amountLarge: {
    fontSize: 28,
    fontWeight: "800",
    color: tokens.colors.light.contentPrimary,
    fontVariant: ["tabular-nums"],
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.md,
  },
  detailsCard: {
    width: "100%",
    backgroundColor: tokens.colors.light.bgRaised,
    borderRadius: tokens.radii.md,
    padding: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
    fontVariant: ["tabular-nums"],
  },
  actionButtons: {
    width: "100%",
  },
});
