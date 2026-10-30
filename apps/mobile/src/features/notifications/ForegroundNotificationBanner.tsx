import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { tokens } from "@repo/ui";
import { parseAndValidateDeepLink } from "./deepLinks";
import { useNotificationStore } from "./notificationStore";

export function ForegroundNotificationBanner(): React.JSX.Element | null {
  const latestNotification = useNotificationStore((s) => s.notifications[0]);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    if (latestNotification && !latestNotification.read && latestNotification.id !== dismissedId) {
      const timer = setTimeout(() => {
        setDismissedId(latestNotification.id);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [latestNotification, dismissedId]);

  const isVisible = Boolean(
    latestNotification &&
    !latestNotification.read &&
    latestNotification.id !== dismissedId
  );

  if (!isVisible || !latestNotification) {
    return null;
  }

  const handlePress = () => {
    markAsRead(latestNotification.id);
    setDismissedId(latestNotification.id);

    if (latestNotification.data.orderId) {
      const rawDeepLink = latestNotification.data.deepLink ?? `seller://orders/${latestNotification.data.orderId}`;
      const parsed = parseAndValidateDeepLink(rawDeepLink);
      if (parsed.valid && parsed.targetRoute) {
        router.push(parsed.targetRoute as unknown as Parameters<typeof router.push>[0]);
      }
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.bannerContainer}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>🔔</Text>
      </View>
      <View style={styles.contentBox}>
        <Text style={styles.titleText}>{latestNotification.title}</Text>
        <Text style={styles.bodyText} numberOfLines={1}>
          {latestNotification.body}
        </Text>
      </View>
      <Text style={styles.actionText}>View</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: tokens.colors.light.surface,
    borderWidth: 1,
    borderColor: tokens.colors.light.primary,
    borderRadius: tokens.radii.md,
    marginHorizontal: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
    padding: tokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    shadowColor: tokens.elevation.light.card.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
  },
  contentBox: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  bodyText: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.primary,
    paddingHorizontal: tokens.spacing.xs,
  },
});
