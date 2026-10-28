import React, { useEffect, useRef, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { AppState, type AppStateStatus, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, t, tokens } from "@repo/ui";

const REAUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function PayoutsScreen(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const lastActiveTimestamp = useRef<number>(0);

  const triggerAuth = async () => {
    setAuthError(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("security.biometricPrompt"),
        fallbackLabel: t("security.passcodeFallback"),
      });

      if (result.success) {
        setIsAuthenticated(true);
        lastActiveTimestamp.current = Date.now();
      } else {
        setAuthError(result.error ?? "Authentication failed");
      }
    } catch {
      setAuthError("Biometric hardware unavailable or disabled.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    lastActiveTimestamp.current = Date.now();

    LocalAuthentication.authenticateAsync({
      promptMessage: t("security.biometricPrompt"),
      fallbackLabel: t("security.passcodeFallback"),
    })
      .then((result) => {
        if (!isMounted) return;
        if (result.success) {
          setIsAuthenticated(true);
        } else {
          setAuthError(result.error ?? "Authentication failed");
        }
      })
      .catch(() => {
        if (isMounted) setAuthError("Biometric hardware unavailable or disabled.");
      });

    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        const elapsed = Date.now() - lastActiveTimestamp.current;
        if (elapsed > REAUTH_TIMEOUT_MS) {
          setIsAuthenticated(false);
          void triggerAuth();
        }
      } else if (nextState === "background") {
        lastActiveTimestamp.current = Date.now();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <View style={styles.gateContainer}>
        <EmptyState
          title="Financial Gate Locked"
          description={authError ?? "Biometric authentication is required to access seller payouts and bank details."}
          actionTitle={t("security.unlock")}
          onAction={() => void triggerAuth()}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  gateContainer: {
    flex: 1,
    justifyContent: "center",
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.light.background,
  },
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
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
