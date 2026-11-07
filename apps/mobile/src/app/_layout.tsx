import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LaunchRevealGate } from "@repo/ui";
import { hydrateAuthSession, useAuthStore } from "../features/auth/authCoordinator";
import { CommandPaletteModal } from "../features/command/CommandPaletteModal";
import { ForegroundNotificationBanner } from "../features/notifications/ForegroundNotificationBanner";
import { initializeNotifications } from "../features/notifications/notificationManager";
import { NotificationHarnessModal } from "../features/notifications/NotificationHarnessModal";
import { OnboardingModal } from "../features/onboarding/OnboardingModal";
import { SettingsModal } from "../features/settings/SettingsModal";
import { SyncBanner } from "../features/sync/SyncBanner";
import { ThemeProvider, useAppTheme } from "../features/theme/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 2,
    },
  },
});

function RootNavigator(): React.JSX.Element {
  const { colors, isDark } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgCanvas }} edges={["top"]}>
      <LaunchRevealGate>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SyncBanner />
        <ForegroundNotificationBanner />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bgSurface },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: colors.bgCanvas },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="orders/[id]" options={{ title: "Order Details" }} />
          <Stack.Screen name="products/[id]" options={{ title: "Edit Product" }} />
          <Stack.Screen name="products/create" options={{ title: "New Product" }} />
          <Stack.Screen name="payouts/index" options={{ title: "Financial Payouts" }} />
        </Stack>
        <NotificationHarnessModal />
        <CommandPaletteModal />
        <SettingsModal />
        <OnboardingModal />
      </LaunchRevealGate>
    </SafeAreaView>
  );
}

export default function RootLayout(): React.JSX.Element {
  useEffect(() => {
    void initializeNotifications().catch(() => {});
    void hydrateAuthSession()
      .then(() => {
        useAuthStore.getState().resolvePendingDeepLink((targetRoute) => {
          router.push(targetRoute as unknown as Parameters<typeof router.push>[0]);
        });
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
