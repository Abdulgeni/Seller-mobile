import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Alert, Animated, StyleSheet, Text, View } from "react-native";
import { createSyncExecutor, defaultApiClient, syncQueue } from "@repo/api";
import { Button, t, tokens } from "@repo/ui";

export function SyncBanner(): React.JSX.Element | null {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showResolvedPulse, setShowResolvedPulse] = useState(false);
  const queryClient = useQueryClient();

  const [filamentOpacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    let loopAnim: Animated.CompositeAnimation | null = null;
    if (pendingCount > 0) {
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(filamentOpacity, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(filamentOpacity, {
            toValue: 0.35,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      loopAnim.start();
    } else {
      filamentOpacity.setValue(0.4);
    }

    return () => {
      if (loopAnim) {
        loopAnim.stop();
      }
    };
  }, [pendingCount, filamentOpacity]);

  useEffect(() => {
    return syncQueue.subscribe((count) => {
      setPendingCount((prev) => {
        if (prev > 0 && count === 0) {
          setShowResolvedPulse(true);
          setTimeout(() => setShowResolvedPulse(false), 1400);
        }
        return count;
      });
    });
  }, []);

  if (pendingCount === 0 && !showResolvedPulse) {
    return null;
  }

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const executor = createSyncExecutor(defaultApiClient);
      const result = await syncQueue.flushQueue(executor);

      if (result.processed > 0) {
        syncQueue.clearSettled();
        void queryClient.invalidateQueries();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setShowResolvedPulse(true);
        setTimeout(() => setShowResolvedPulse(false), 1400);
        Alert.alert(
          "Sync Complete",
          `Synced ${result.processed} offline ${result.processed === 1 ? "mutation" : "mutations"}.`
        );
      } else if (result.failed > 0) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        Alert.alert("Sync Incomplete", `${result.failed} mutations failed. Will retry automatically.`);
      }
    } catch {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert("Sync Error", "Could not reach the server to flush queued mutations.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (showResolvedPulse && pendingCount === 0) {
    return (
      <View style={styles.filamentSuccessContainer}>
        <View style={styles.filamentSuccess} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* 2px hairline live sync filament */}
      <Animated.View style={[styles.filament, { opacity: filamentOpacity }]} />
      <View style={styles.banner}>
        <View style={styles.indicatorRow}>
          <View style={styles.pulsingDot} />
          <Text style={styles.bannerText}>
            {t("sync.pendingCount", { count: pendingCount })}
          </Text>
        </View>
        <Button
          title={t("sync.syncNow")}
          size="sm"
          variant="secondary"
          loading={isSyncing}
          onPress={handleSyncNow}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  filament: {
    height: 2,
    width: "100%",
    backgroundColor: tokens.colors.light.warning,
  },
  filamentSuccessContainer: {
    height: 2,
    width: "100%",
  },
  filamentSuccess: {
    height: 2,
    width: "100%",
    backgroundColor: tokens.colors.light.accent,
  },
  banner: {
    backgroundColor: tokens.colors.light.bgRaised,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.warning,
  },
  bannerText: {
    color: tokens.colors.light.contentPrimary,
    fontWeight: "600",
    fontSize: 13,
  },
});
