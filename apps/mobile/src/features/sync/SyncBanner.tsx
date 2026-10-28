import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { syncQueue } from "@repo/api";
import { Button, t, tokens } from "@repo/ui";

export function SyncBanner(): React.JSX.Element | null {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

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
      await syncQueue.flushQueue(async () => {
        // Mock flush execution
      });
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
