import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { t, tokens } from "@repo/ui";

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tokens.colors.light.surface },
        headerTintColor: tokens.colors.light.contentPrimary,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: tokens.colors.light.surface,
          borderTopColor: tokens.colors.light.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: tokens.colors.light.primary,
        tabBarInactiveTintColor: tokens.colors.light.contentMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("nav.orders"),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📦</Text>,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t("nav.products"),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏷️</Text>,
        }}
      />
      <Tabs.Screen
        name="ops"
        options={{
          title: t("nav.ops"),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
