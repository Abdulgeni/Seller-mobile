import React, { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { syncQueue } from "@repo/api";
import { hapticFeedback, tokens } from "@repo/ui";
import { type AppearanceMode, useSettingsStore } from "../../features/settings/settingsStore";
import { useAppTheme } from "../../features/theme/ThemeContext";

export default function OpsScreen(): React.JSX.Element {
  const { isDark, colors, appearanceMode, setAppearanceMode } = useAppTheme();
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
    hapticFeedback.buttonPress();
    setIsSyncing(true);
    try {
      const result = await syncQueue.flushQueue(async () => {
        // Simulated flush
      });
      hapticFeedback.success();
      Alert.alert("Ledger Synchronized", `Processed: ${result.processed}, Failed: ${result.failed}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestBiometrics = async () => {
    hapticFeedback.buttonPress();
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to access Sovereign Financial Vault",
      fallbackLabel: "Enter Merchant Passcode",
    });

    if (result.success) {
      hapticFeedback.success();
      Alert.alert("Vault Unlocked", "Biometric verification succeeded! Sovereign vault access granted.");
    } else {
      hapticFeedback.warning();
      Alert.alert("Authentication Failed", result.error || "Could not verify identity.");
    }
  };

  const handleSimulateIncomingOrder = () => {
    hapticFeedback.buttonPress();
    Alert.alert(
      "💎 New Client Order Received",
      "Order #ORD-HAB-2026 for ETB 14,500 via Telebirr.",
      [
        { text: "Dismiss", style: "cancel" },
        {
          text: "Open Dossier",
          onPress: () => router.push("/orders/ord_1"),
        },
      ]
    );
  };

  const THEME_OPTIONS: { label: string; mode: AppearanceMode; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "Day", mode: "light", icon: "sunny-outline" },
    { label: "Night", mode: "dark", icon: "moon-outline" },
    { label: "System", mode: "system", icon: "phone-portrait-outline" },
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.bgCanvas }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerBlock}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.headerMonogram, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
            <Ionicons name="shield-checkmark" size={18} color={colors.gold} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Halal Market Vault & Operations</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Cryptographic security & national payment rails
            </Text>
          </View>
        </View>
      </View>

      {/* 1. Day & Night Atmosphere Engine */}
      <View
        style={[
          styles.luxuryCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWrap}>
            <Ionicons name="sparkles" size={17} color={colors.gold} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Atmosphere & Theme Engine</Text>
          </View>
          <View style={[styles.themePill, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
            <Text style={[styles.themePillText, { color: colors.gold }]}>
              {appearanceMode === "dark" ? "Obsidian Gold" : appearanceMode === "light" ? "Imperial Day" : "System Harmony"}
            </Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Toggle between daylight alabaster and nighttime deep obsidian with 24K gold accents.
        </Text>

        <View style={styles.themeSelectorRow}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = appearanceMode === opt.mode;
            return (
              <Pressable
                key={opt.mode}
                onPress={() => {
                  hapticFeedback.selection();
                  setAppearanceMode(opt.mode);
                }}
                style={[
                  styles.themeOptionBtn,
                  {
                    backgroundColor: isSelected
                      ? colors.gold
                      : colors.bgRaised,
                    borderColor: isSelected ? colors.gold : colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={15}
                  color={isSelected ? (isDark ? "#0A0D14" : "#FFFFFF") : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color: isSelected ? (isDark ? "#0A0D14" : "#FFFFFF") : colors.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. National Payment Switch Gateway Status (Ethiopia) */}
      <View
        style={[
          styles.luxuryCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWrap}>
            <Ionicons name="card-outline" size={17} color={colors.gold} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>National Payment Gateways</Text>
          </View>
          <View style={[styles.liveDotWrap, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5" }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.liveDotText, { color: colors.accent }]}>ONLINE</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Real-time settlement connectivity for Ethiopian commercial rails.
        </Text>

        <View style={styles.paymentGatewaysList}>
          {/* Telebirr */}
          <View style={[styles.gatewayRow, { backgroundColor: colors.bgRaised, borderColor: colors.borderSubtle }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.gatewayIconBox, { backgroundColor: "rgba(2, 132, 199, 0.15)" }]}>
                <Ionicons name="phone-portrait-outline" size={16} color="#0284C7" />
              </View>
              <View>
                <Text style={[styles.gatewayName, { color: colors.textPrimary }]}>Telebirr SuperApp</Text>
                <Text style={[styles.gatewaySub, { color: colors.textTertiary }]}>Ethio Telecom Switch</Text>
              </View>
            </View>
            <View style={[styles.uptimeBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <Text style={[styles.uptimeText, { color: colors.accent }]}>99.98% SLA</Text>
            </View>
          </View>

          {/* CBE Birr */}
          <View style={[styles.gatewayRow, { backgroundColor: colors.bgRaised, borderColor: colors.borderSubtle }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.gatewayIconBox, { backgroundColor: "rgba(147, 51, 234, 0.15)" }]}>
                <Ionicons name="business-outline" size={16} color="#9333EA" />
              </View>
              <View>
                <Text style={[styles.gatewayName, { color: colors.textPrimary }]}>CBE Birr Core</Text>
                <Text style={[styles.gatewaySub, { color: colors.textTertiary }]}>Commercial Bank of Ethiopia</Text>
              </View>
            </View>
            <View style={[styles.uptimeBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <Text style={[styles.uptimeText, { color: colors.accent }]}>99.95% SLA</Text>
            </View>
          </View>

          {/* M-Pesa Safaricom */}
          <View style={[styles.gatewayRow, { backgroundColor: colors.bgRaised, borderColor: colors.borderSubtle }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.gatewayIconBox, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <Ionicons name="flash-outline" size={16} color="#059669" />
              </View>
              <View>
                <Text style={[styles.gatewayName, { color: colors.textPrimary }]}>M-Pesa Safaricom</Text>
                <Text style={[styles.gatewaySub, { color: colors.textTertiary }]}>Safaricom Ethiopia</Text>
              </View>
            </View>
            <View style={[styles.uptimeBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
              <Text style={[styles.uptimeText, { color: colors.accent }]}>99.99% SLA</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => {
            hapticFeedback.selection();
            router.push("/payouts");
          }}
          style={[styles.payoutLinkBtn, { borderColor: colors.gold }]}
        >
          <Ionicons name="wallet-outline" size={15} color={colors.gold} />
          <Text style={[styles.payoutLinkText, { color: colors.gold }]}>
            Inspect Merchant Payout Vault & Accounts
          </Text>
          <Ionicons name="chevron-forward" size={15} color={colors.gold} />
        </Pressable>
      </View>

      {/* 3. Security & Biometric Gate */}
      <View
        style={[
          styles.luxuryCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWrap}>
            <Ionicons name="finger-print-outline" size={18} color={colors.gold} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Biometric Security Vault</Text>
          </View>
          <View style={[styles.statusMiniBadge, { backgroundColor: biometricSupported ? (isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5") : (isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2") }]}>
            <Text style={[styles.statusMiniText, { color: biometricSupported ? colors.accent : colors.critical }]}>
              {biometricSupported ? "Hardware Active" : "Unsupported"}
            </Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Hardware-level cryptographic authentication protecting financial settlements and sensitive client dossiers.
        </Text>

        <Pressable
          onPress={handleTestBiometrics}
          style={[styles.luxuryPrimaryBtn, { backgroundColor: colors.gold }]}
        >
          <Ionicons name="lock-open-outline" size={16} color={isDark ? "#0A0D14" : "#FFFFFF"} />
          <Text style={[styles.luxuryPrimaryBtnText, { color: isDark ? "#0A0D14" : "#FFFFFF" }]}>
            Verify Sovereign Biometrics
          </Text>
        </Pressable>
      </View>

      {/* 4. Offline Sync Queue Ops */}
      <View
        style={[
          styles.luxuryCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWrap}>
            <Ionicons name="sync-outline" size={17} color={colors.gold} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Offline Mutation Ledger</Text>
          </View>
          <View style={[styles.pendingPill, { backgroundColor: pendingCount > 0 ? (isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7") : (isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5") }]}>
            <Text style={[styles.pendingPillText, { color: pendingCount > 0 ? colors.gold : colors.accent }]}>
              {pendingCount} Pending
            </Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Guaranteed idempotent transaction queue backing changes made while in low-connectivity areas.
        </Text>

        <View style={styles.btnRow}>
          <Pressable
            onPress={handleSimulateSync}
            disabled={isSyncing}
            style={[styles.actionBtnHalf, { backgroundColor: colors.gold }]}
          >
            <Ionicons name="cloud-upload-outline" size={15} color={isDark ? "#0A0D14" : "#FFFFFF"} />
            <Text style={[styles.actionBtnHalfText, { color: isDark ? "#0A0D14" : "#FFFFFF" }]}>
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              hapticFeedback.selection();
              syncQueue.clearSettled();
              Alert.alert("Settled Queue Cleared", "All archived mutations removed.");
            }}
            style={[styles.actionBtnHalf, { backgroundColor: colors.bgRaised, borderWidth: 1, borderColor: colors.borderSubtle }]}
          >
            <Ionicons name="trash-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.actionBtnHalfText, { color: colors.textPrimary }]}>
              Clear Settled
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 5. Notification Simulator Harness */}
      <View
        style={[
          styles.luxuryCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWrap}>
            <Ionicons name="notifications-outline" size={17} color={colors.gold} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>High-Priority Order Alerts</Text>
          </View>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Simulate foreground and background client orders with high-priority audible and tactile alerts.
        </Text>

        <Pressable
          onPress={handleSimulateIncomingOrder}
          style={[styles.outlineBtn, { borderColor: colors.gold }]}
        >
          <Ionicons name="sparkles-outline" size={15} color={colors.gold} />
          <Text style={[styles.outlineBtnText, { color: colors.gold }]}>
            Simulate Incoming Haute Order
          </Text>
        </Pressable>
      </View>

      {/* 6. Network Fault Injection */}
      <View
        style={[
          styles.luxuryCard,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
          },
        ]}
      >
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.cardTitleWrap}>
              <Ionicons name="flash-off-outline" size={17} color={mockFailureActive ? colors.critical : colors.textSecondary} />
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Inject Network Faults</Text>
            </View>
            <Text style={[styles.cardDesc, { color: colors.textSecondary, marginTop: 4 }]}>
              Simulate 503 gateway timeouts and packet loss to verify resilient offline fallback.
            </Text>
          </View>

          <Switch
            value={mockFailureActive}
            onValueChange={(val) => {
              hapticFeedback.selection();
              setMockFailureActive(val);
              process.env["MOCK_FAILURE_RATE"] = val ? "0.8" : "0.0";
            }}
            trackColor={{
              false: colors.borderSubtle,
              true: colors.critical,
            }}
            thumbColor={isDark ? "#F2F5FA" : "#FFFFFF"}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    paddingBottom: 130,
    gap: tokens.spacing.sm + 4,
  },
  headerBlock: {
    marginBottom: tokens.spacing.xs,
  },
  headerMonogram: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  luxuryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: tokens.spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: tokens.spacing.sm,
  },
  themePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radii.full,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  themeSelectorRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 12,
  },
  liveDotWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radii.full,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveDotText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  paymentGatewaysList: {
    gap: 6,
    marginBottom: tokens.spacing.sm,
  },
  gatewayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  gatewayIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  gatewayName: {
    fontSize: 13,
    fontWeight: "600",
  },
  gatewaySub: {
    fontSize: 10,
  },
  uptimeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uptimeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  payoutLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 2,
  },
  payoutLinkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusMiniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusMiniText: {
    fontSize: 10,
    fontWeight: "700",
  },
  luxuryPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: tokens.radii.full,
    gap: 6,
  },
  luxuryPrimaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  pendingPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radii.full,
  },
  pendingPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtnHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: tokens.radii.full,
    gap: 6,
  },
  actionBtnHalfText: {
    fontSize: 12,
    fontWeight: "700",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    gap: 6,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
