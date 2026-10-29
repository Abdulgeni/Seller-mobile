import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, tokens } from "@repo/ui";
import { BiometricGate } from "../../features/security/BiometricGate";
import { useBiometricSecurityStore } from "../../features/security/biometricAuth";

export default function PayoutsScreen(): React.JSX.Element {
  const lock = useBiometricSecurityStore((s) => s.lock);

  return (
    <BiometricGate title="Financial Payouts & Bank Credentials">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.secureHeader}>🔒 Verified Biometric Session</Text>
          <Button title="Lock Now" variant="outline" size="sm" onPress={lock} />
        </View>

        <Card>
          <Text style={styles.cardHeading}>Available Balance</Text>
          <Text style={styles.balanceValue}>KES 89,400.00</Text>
          <Text style={styles.balanceSubtext}>Next automated settlement on Friday</Text>

          <View style={{ marginTop: tokens.spacing.md }}>
            <Button
              title="Request Instant M-Pesa Payout"
              onPress={() => {}}
            />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardHeading}>Payout Destination</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Settlement Channel:</Text>
            <Text style={styles.detailValue}>M-Pesa Business Till</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone / Account:</Text>
            <Text style={styles.detailValue}>+254 712 *** 678</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Platform Split Cut:</Text>
            <Text style={styles.detailValue}>0.0% (Single-Vendor MVP)</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardHeading}>Recent Settlements</Text>
          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutRef}>BATCH-2026-10-24</Text>
              <Text style={styles.payoutDate}>24 Oct 2026, 06:00 AM</Text>
            </View>
            <Text style={styles.payoutAmount}>KES 135,000.00</Text>
          </View>
          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutRef}>BATCH-2026-10-17</Text>
              <Text style={styles.payoutDate}>17 Oct 2026, 06:00 AM</Text>
            </View>
            <Text style={styles.payoutAmount}>KES 118,500.00</Text>
          </View>
        </Card>
      </ScrollView>
    </BiometricGate>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: tokens.spacing.xs,
  },
  secureHeader: {
    fontSize: 12,
    color: tokens.colors.light.success,
    fontWeight: "700",
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.xs,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "800",
    color: tokens.colors.light.primary,
    marginTop: tokens.spacing.xs,
  },
  balanceSubtext: {
    fontSize: 13,
    color: tokens.colors.light.contentMuted,
    marginTop: tokens.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: tokens.spacing.xs,
  },
  detailLabel: {
    fontSize: 14,
    color: tokens.colors.light.contentSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.border,
  },
  payoutRef: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  payoutDate: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.light.success,
  },
});
