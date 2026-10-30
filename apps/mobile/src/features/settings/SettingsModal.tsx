import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { syncQueue } from "@repo/api";
import { Badge, Button, Card, hapticFeedback, tokens } from "@repo/ui";
import { useSettingsStore, type AppearanceMode } from "./settingsStore";

export function SettingsModal(): React.JSX.Element | null {
  const {
    isSettingsOpen,
    closeSettings,
    appearanceMode,
    setAppearanceMode,
    hapticsEnabled,
    setHaptics,
    openOnboarding,
  } = useSettingsStore();

  const queryClient = useQueryClient();

  if (!isSettingsOpen) {
    return null;
  }

  const handleClearCache = async () => {
    hapticFeedback.warning();
    queryClient.clear();
    syncQueue.clearSettled();
    Alert.alert("Cache Reset", "Query cache and settled sync items have been cleared.");
  };

  const modes: AppearanceMode[] = ["system", "light", "dark"];

  return (
    <Modal visible={isSettingsOpen} animationType="slide">
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>MERCHANT SETTINGS</Text>
          <Pressable
            onPress={() => {
              hapticFeedback.selection();
              closeSettings();
            }}
            style={styles.closeBtn}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Merchant Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>✦</Text>
            </View>
            <View style={styles.profileMeta}>
              <View style={styles.tierRow}>
                <Text style={styles.storeName}>Atelier Artisans Nairobi</Text>
                <Badge label="SOVEREIGN TIER" variant="warning" size="sm" />
              </View>
              <Text style={styles.storeSub}>
                Single-Vendor Storefront · Multi-Vendor Seam Enabled
              </Text>
              <Text style={styles.storeLocation}>📍 Kilimani, Nairobi, Kenya</Text>
            </View>
          </Card>

          {/* Appearance Section */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>APPEARANCE & THEME</Text>
            <Text style={styles.sectionNotice}>
              Handcrafted Atelier palette with obsidian slate and viridian emerald.
            </Text>
            <View style={styles.themeSelector}>
              {modes.map((mode) => {
                const isSelected = appearanceMode === mode;
                return (
                  <Pressable
                    key={mode}
                    style={[
                      styles.themeTab,
                      isSelected && styles.themeTabActive,
                    ]}
                    onPress={() => {
                      hapticFeedback.selection();
                      setAppearanceMode(mode);
                    }}
                  >
                    <Text
                      style={[
                        styles.themeTabText,
                        isSelected && styles.themeTabTextActive,
                      ]}
                    >
                      {mode.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Tactile Feedback & Motion */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>TACTILE ENGINE & MOTION</Text>
            <View style={styles.toggleRow}>
              <View style={styles.toggleMeta}>
                <Text style={styles.toggleTitle}>Haptic Feedback</Text>
                <Text style={styles.toggleSub}>
                  Subtle physical confirmations for selections, transitions & payments
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={(val) => {
                  setHaptics(val);
                  if (val) hapticFeedback.success();
                }}
                thumbColor={
                  hapticsEnabled
                    ? tokens.colors.light.accent
                    : tokens.colors.light.bgRaised
                }
                trackColor={{
                  true: tokens.colors.light.borderFocus,
                  false: tokens.colors.light.borderSubtle,
                }}
              />
            </View>
          </Card>

          {/* Onboarding & Guide */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>ONBOARDING & PRODUCT TOUR</Text>
            <Text style={styles.sectionNotice}>
              Review the 3-step luxury tour covering AI Studio, Offline Sync & Command Palette.
            </Text>
            <Button
              title="✦ Replay Welcome Tour"
              variant="outline"
              onPress={() => {
                closeSettings();
                openOnboarding();
              }}
            />
          </Card>

          {/* Storage & Diagnostics */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>DIAGNOSTICS & SYSTEM CACHE</Text>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>App Edition</Text>
              <Text style={styles.diagValue}>Signature Edition v2.0.0</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Engine</Text>
              <Text style={styles.diagValue}>Expo SDK 58 · React Native 0.84</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Verification State</Text>
              <Badge label="PRODUCTION READY" variant="success" size="sm" />
            </View>

            <View style={styles.divider} />

            <Button
              title="Reset Cache & Settled Queue"
              variant="danger"
              onPress={handleClearCache}
            />
          </Card>

          {/* Close Action */}
          <View style={styles.actionRow}>
            <Button
              title="Done"
              variant="primary"
              onPress={() => {
                hapticFeedback.selection();
                closeSettings();
              }}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgCanvas,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
    backgroundColor: tokens.colors.light.bgRaised,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.light.gold,
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: tokens.spacing.xs,
  },
  closeText: {
    fontSize: 16,
    color: tokens.colors.light.contentSecondary,
  },
  scrollContent: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
    paddingBottom: 60,
  },
  profileCard: {
    flexDirection: "row",
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
    alignItems: "center",
    backgroundColor: tokens.colors.light.bgSurface,
    borderColor: tokens.colors.light.borderStrong,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.light.bgRaised,
    borderWidth: 1.5,
    borderColor: tokens.colors.light.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    color: tokens.colors.light.gold,
  },
  profileMeta: {
    flex: 1,
    gap: 2,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storeName: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  storeSub: {
    fontSize: 10,
    color: tokens.colors.light.contentSecondary,
  },
  storeLocation: {
    fontSize: 10,
    color: tokens.colors.light.contentMuted,
    marginTop: 2,
  },
  sectionCard: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.bgSurface,
    borderColor: tokens.colors.light.borderStrong,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.light.contentMuted,
    letterSpacing: 1,
  },
  sectionNotice: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
  },
  themeSelector: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
    marginTop: tokens.spacing.xs,
  },
  themeTab: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    alignItems: "center",
    borderRadius: tokens.radii.sm,
    backgroundColor: tokens.colors.light.bgRaised,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  themeTabActive: {
    backgroundColor: tokens.colors.light.bgSurface,
    borderColor: tokens.colors.light.gold,
  },
  themeTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
  },
  themeTabTextActive: {
    color: tokens.colors.light.gold,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: tokens.spacing.xs,
  },
  toggleMeta: {
    flex: 1,
    paddingRight: tokens.spacing.md,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  toggleSub: {
    fontSize: 10,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  diagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  diagLabel: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
  },
  diagValue: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.light.borderSubtle,
    marginVertical: tokens.spacing.xs,
  },
  actionRow: {
    marginTop: tokens.spacing.sm,
  },
});
