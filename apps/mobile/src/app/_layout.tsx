import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { SyncBanner } from "../features/sync/SyncBanner";
import { tokens } from "@repo/ui";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 2,
    },
  },
});

export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={{ flex: 1, backgroundColor: tokens.colors.light.background }} edges={["top"]}>
          <StatusBar style="dark" />
          <SyncBanner />
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
        </SafeAreaView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
