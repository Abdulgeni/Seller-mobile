import React, { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { syncQueue } from "@repo/api";
import { Button, Card, t, tokens } from "@repo/ui";

export default function OpsScreen(): React.JSX.Element {
  const [pendingCount, setPendingCount] = useState(0);
  const [mockFailureActive, setMockFailureActive] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then((hasHw) => {
      setBiometricSupported(hasHw);
    });

    return syncQueue.subscribe((count) => {
      setPendingCount(count);
    });
  }, []);

  const handleSimulateSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncQueue.flushQueue(async () => {
        // Simulated flush
      });
      Alert.alert("Sync Finished", `Processed: ${result.processed}, Failed: ${result.failed}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t("security.biometricPrompt"),
      fallbackLabel: t("security.passcodeFallback"),
    });

    if (result.success) {
      Alert.alert("Authenticated", "Biometric verification succeeded!");
    } else {
      Alert.alert("Authentication Failed", result.error || "Could not verify identity.");
    }
  };

  const handleSimulateIncomingOrder = () => {
    Alert.alert(
      "🔔 Push Notification: New Order!",
      "Order #ORD-2026031 received for KES 4,500.",
      [
        { text: "Dismiss", style: "cancel" },
        { text: "View Order", onPress: () => router.push("/orders/ord_1") },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionHeader}>{t("nav.ops")}</Text>

      {/* Sync Queue Ops */}
      <Card>
        <Text style={styles.cardTitle}>Offline Sync Queue</Text>
        <Text style={styles.cardDesc}>
          Pending offline mutation queue backed by persistent storage.
        </Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Pending Actions:</Text>
          <Text style={styles.statValue}>{pendingCount}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Button
            title={t("sync.syncNow")}
            loading={isSyncing}
            onPress={handleSimulateSync}
          />
          <View style={{ width: tokens.spacing.sm }} />
          <Button
            title="Clear Settled"
            variant="outline"
            onPress={() => syncQueue.clearSettled()}
          />
        </View>
      </Card>

      {/* Security & Financial Access */}
      <Card>
        <Text style={styles.cardTitle}>Security & Biometric Gate</Text>
        <Text style={styles.cardDesc}>
          Hardware biometric authentication for bank details and payouts.
        </Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Biometrics Available:</Text>
          <Text style={styles.statValue}>{biometricSupported ? "Yes" : "No"}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Button
            title={t("security.unlock")}
            onPress={handleTestBiometrics}
          />
          <View style={{ width: tokens.spacing.sm }} />
          <Button
            title="Open Payouts"
            variant="secondary"
            onPress={() => router.push("/payouts")}
          />
        </View>
      </Card>

      {/* Push Notification Simulator Harness */}
      <Card>
        <Text style={styles.cardTitle}>Push Notification Harness</Text>
        <Text style={styles.cardDesc}>
          Simulate FCM foreground, deep links, and order action alerts.
        </Text>
        <Button
          title="Simulate New Order Push"
          variant="outline"
          onPress={handleSimulateIncomingOrder}
        />
      </Card>

      {/* Network Failure Injection */}
      <Card>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Inject Network Faults</Text>
            <Text style={styles.cardDesc}>
              Simulates 503 errors and flaky connectivity for offline queue testing.
            </Text>
          </View>
          <Switch
            value={mockFailureActive}
            onValueChange={(val) => {
              setMockFailureActive(val);
              process.env["MOCK_FAILURE_RATE"] = val ? "0.8" : "0.0";
            }}
            trackColor={{
              false: tokens.colors.light.border,
              true: tokens.colors.light.danger,
            }}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  cardDesc: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    marginVertical: tokens.spacing.xs,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: tokens.spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    color: tokens.colors.light.contentSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: tokens.spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
