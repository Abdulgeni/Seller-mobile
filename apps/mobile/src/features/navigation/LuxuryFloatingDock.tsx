import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticFeedback, tokens } from "@repo/ui";
import { useNotificationStore } from "../notifications/notificationStore";
import { StorefrontPreviewModal } from "../storefront/StorefrontPreviewModal";
import { LuxuryQuickActionModal } from "./LuxuryQuickActionModal";

export type LuxuryFloatingDockProps = NonNullable<
  React.ComponentProps<typeof Tabs>["tabBar"]
> extends (props: infer P) => unknown
  ? P
  : never;

type TabRoute = LuxuryFloatingDockProps["state"]["routes"][number];

interface TabItemConfig {
  name: string;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_CONFIGS: Record<string, TabItemConfig> = {
  index: {
    name: "index",
    label: "Market",
    activeIcon: "grid",
    inactiveIcon: "grid-outline",
  },
  orders: {
    name: "orders",
    label: "Orders",
    activeIcon: "receipt",
    inactiveIcon: "receipt-outline",
  },
  products: {
    name: "products",
    label: "Catalogue",
    activeIcon: "sparkles",
    inactiveIcon: "sparkles-outline",
  },
  ops: {
    name: "ops",
    label: "Vault & Ops",
    activeIcon: "shield-checkmark",
    inactiveIcon: "shield-checkmark-outline",
  },
};

export function LuxuryFloatingDock(props: LuxuryFloatingDockProps): React.JSX.Element {
  const { state, navigateToTab, emitter, insets: propInsets } = props;
  const safeAreaInsets = useSafeAreaInsets();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [quickActionVisible, setQuickActionVisible] = useState(false);
  const [storefrontVisible, setStorefrontVisible] = useState(false);

  const activeIndex = state.index;

  const handleTabPress = (routeKey: string, routeName: string, isFocused: boolean) => {
    let isPrevented = false;
    if (emitter) {
      const result = emitter.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
        data: undefined,
      });
      if (result?.defaultPrevented) {
        isPrevented = true;
      }
    }

    if (!isFocused && !isPrevented) {
      hapticFeedback.selection();
      if (navigateToTab) {
        navigateToTab(routeKey);
      } else {
        if (routeName === "orders") {
          router.push("/orders");
        } else if (routeName === "products") {
          router.push("/products");
        } else if (routeName === "ops") {
          router.push("/ops");
        } else {
          router.push("/");
        }
      }
    }
  };

  const handleCenterActionPress = () => {
    hapticFeedback.buttonPress();
    setQuickActionVisible(true);
  };

  // Divide routes into left 2 and right 2 around center button
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2, 4);

  const renderTab = (route: TabRoute, routeIndex: number) => {
    const isFocused = activeIndex === routeIndex;
    const config = TAB_CONFIGS[route.name] ?? {
      name: route.name,
      label: route.name,
      activeIcon: "ellipse",
      inactiveIcon: "ellipse-outline",
    };

    const isOrdersTab = route.name === "orders";
    const showBadge = isOrdersTab && unreadCount > 0;

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={config.label}
        testID={`tab-${route.name}`}
        onPress={() => handleTabPress(route.key, route.name, isFocused)}
        activeOpacity={0.7}
        style={[
          styles.tabButton,
          isFocused ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isFocused ? config.activeIcon : config.inactiveIcon}
            size={20}
            color={isFocused ? tokens.colors.light.gold : tokens.colors.dark.textSecondary}
          />
          {showBadge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>

        {isFocused && <View style={styles.activeDot} />}
      </TouchableOpacity>
    );
  };

  const bottomInset = propInsets?.bottom ?? safeAreaInsets.bottom;
  const dockBottomMargin = Math.max(bottomInset, 12);

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[
          styles.outerContainer,
          { paddingBottom: dockBottomMargin },
        ]}
      >
        <View style={styles.dockCapsule}>
          {/* Left tabs (Market & Orders) */}
          <View style={styles.tabsHalf}>
            {leftRoutes.map((route: TabRoute, idx: number) => renderTab(route, idx))}
          </View>

          {/* Elevated Sovereign Gold Center Action Button */}
          <View style={styles.centerButtonAnchor}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Halal Market Quick Action Center"
              testID="luxury-dock-center-action"
              onPress={handleCenterActionPress}
              activeOpacity={0.85}
              style={styles.centerButton}
            >
              <Text style={styles.centerButtonGlyph}>۞</Text>
            </TouchableOpacity>
          </View>

          {/* Right tabs (Catalogue & Ops) */}
          <View style={styles.tabsHalf}>
            {rightRoutes.map((route: TabRoute, idx: number) => renderTab(route, idx + 2))}
          </View>
        </View>
      </View>

      {/* Luxury Quick Action Hub */}
      <LuxuryQuickActionModal
        visible={quickActionVisible}
        onClose={() => setQuickActionVisible(false)}
        onOpenStorefront={() => setStorefrontVisible(true)}
      />

      {/* Customer Storefront Live Preview */}
      <StorefrontPreviewModal
        visible={storefrontVisible}
        onClose={() => setStorefrontVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dockCapsule: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 440,
    height: 64,
    backgroundColor: tokens.colors.dark.bgSurface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.28)",
    paddingHorizontal: 8,
    ...(Platform?.select
      ? Platform.select({
          ios: {
            shadowColor: tokens.colors.light.textPrimary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 18,
          },
          android: {
            elevation: 16,
          },
          default: {},
        })
      : {}),
  },
  tabsHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 64,
  },
  tabButtonActive: {
    backgroundColor: "rgba(217, 119, 6, 0.12)",
  },
  tabButtonInactive: {
    backgroundColor: "transparent",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 22,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: "700",
    color: tokens.colors.light.gold,
  },
  tabLabelInactive: {
    fontWeight: "500",
    color: tokens.colors.dark.textSecondary,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.light.gold,
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: tokens.colors.light.critical,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: tokens.colors.light.textInverse,
    fontSize: 9,
    fontWeight: "800",
  },
  centerButtonAnchor: {
    alignItems: "center",
    justifyContent: "center",
    width: 58,
    height: 64,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: tokens.colors.light.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: tokens.colors.dark.bgSurface,
    marginTop: -18,
    ...(Platform?.select
      ? Platform.select({
          ios: {
            shadowColor: tokens.colors.light.gold,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 10,
          },
          android: {
            elevation: 8,
          },
          default: {},
        })
      : {}),
  },
  centerButtonGlyph: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.light.textInverse,
    lineHeight: 26,
    textAlign: "center",
  },
});
