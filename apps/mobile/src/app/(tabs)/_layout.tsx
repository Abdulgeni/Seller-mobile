import React from "react";
import { Tabs } from "expo-router";
import { t, tokens } from "@repo/ui";
import { LuxuryFloatingDock } from "../../features/navigation/LuxuryFloatingDock";

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      tabBar={(props) => <LuxuryFloatingDock {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("nav.orders"),
          headerShown: true,
          headerStyle: { backgroundColor: tokens.colors.light.surface },
          headerTintColor: tokens.colors.light.contentPrimary,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t("nav.products"),
          headerShown: true,
          headerStyle: { backgroundColor: tokens.colors.light.surface },
          headerTintColor: tokens.colors.light.contentPrimary,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <Tabs.Screen
        name="ops"
        options={{
          title: t("nav.ops"),
          headerShown: true,
          headerStyle: { backgroundColor: tokens.colors.light.surface },
          headerTintColor: tokens.colors.light.contentPrimary,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
    </Tabs>
  );
}
