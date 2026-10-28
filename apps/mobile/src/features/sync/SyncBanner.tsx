import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Alert, StyleSheet, Text, View } from "react-native";
import { createSyncExecutor, defaultApiClient, syncQueue } from "@repo/api";
import { Button, t, tokens } from "@repo/ui";

export function SyncBanner(): React.JSX.Element | null {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    return syncQueue.subscribe((count) => {
      setPendingCount(count);
    });
  }, []);

  if (pendingCount === 0) {
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

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>
        {t("sync.pendingCount", { count: pendingCount })}
      </Text>
      <Button
        title={t("sync.syncNow")}
        size="sm"
        variant="secondary"
        loading={isSyncing}
        onPress={handleSyncNow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: tokens.colors.light.warning,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerText: {
    color: tokens.colors.light.warningForeground,
    fontWeight: "600",
    fontSize: 14,
  },
});
