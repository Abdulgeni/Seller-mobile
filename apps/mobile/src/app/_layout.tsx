import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LaunchRevealGate, tokens } from "@repo/ui";
import { hydrateAuthSession, useAuthStore } from "../features/auth/authCoordinator";
import { CommandPaletteModal } from "../features/command/CommandPaletteModal";
import { ForegroundNotificationBanner } from "../features/notifications/ForegroundNotificationBanner";
import { initializeNotifications } from "../features/notifications/notificationManager";
import { NotificationHarnessModal } from "../features/notifications/NotificationHarnessModal";
import { SyncBanner } from "../features/sync/SyncBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 2,
    },
  },
});

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
        <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.light.background }} edges={["top"]}>
          <LaunchRevealGate>
            <StatusBar style="dark" />
            <SyncBanner />
            <ForegroundNotificationBanner />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: tokens.colors.light.surface },
                headerTintColor: tokens.colors.light.contentPrimary,
                headerTitleStyle: { fontWeight: "700" },
                contentStyle: { backgroundColor: tokens.colors.light.background },
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
          </LaunchRevealGate>
        </SafeAreaView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
