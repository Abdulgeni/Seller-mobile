import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { Product } from "@repo/schemas";
import { Badge, Button, hapticFeedback, tokens } from "@repo/ui";
import { useAppTheme } from "../theme/ThemeContext";

export interface StorefrontPreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StorefrontPreviewModal({
  visible,
  onClose,
}: StorefrontPreviewModalProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const [cartItems, setCartItems] = useState<Product[]>([]);

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => defaultApiClient.getProducts(),
    enabled: visible,
  });

  if (!visible) {
    return null;
  }

  const handleAddToCart = (product: Product) => {
    hapticFeedback.selection();
    setCartItems((prev) => [...prev, product]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleSimulateCheckout = () => {
    hapticFeedback.success();
    // Reset cart after simulated checkout
    setCartItems([]);
  };

  const topInset = Math.max(insets.top, 16);
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: topInset, backgroundColor: colors.bgCanvas }]}>
        {/* Luxury Top Bar with prominent Back / Exit button */}
        <View style={[styles.topNavigation, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderSubtle }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back to Halal Market"
            onPress={() => {
              hapticFeedback.buttonPress();
              onClose();
            }}
            style={[styles.backButton, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#02241C", borderColor: colors.gold }]}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={17} color={colors.gold} />
            <Text style={[styles.backButtonText, { color: colors.gold }]}>Back to Market</Text>
          </TouchableOpacity>

          <View style={styles.topHeaderCenter}>
            <Text style={[styles.storeTitle, { color: colors.textPrimary }]}>HALAL MARKET</Text>
            <Text style={[styles.storeSubtitle, { color: colors.gold }]}>CERTIFIED PURE · BUYER VIEW</Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close Storefront Preview"
            onPress={() => {
              hapticFeedback.buttonPress();
              onClose();
            }}
            style={[styles.closeIconButton, { backgroundColor: colors.bgRaised, borderColor: colors.borderSubtle }]}
          >
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Live Customer Preview Indicator Pill */}
        <View
          style={[
            styles.previewModeBanner,
            {
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : "#ECFDF5",
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={[styles.liveIndicatorDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.previewModeText, { color: colors.accent }]}>
            BUYER PERSPECTIVE · 100% Halal Verified · Telebirr & CBE Birr Active
          </Text>
        </View>

        {/* Store Profile Header */}
        <View style={[styles.storeHeader, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderSubtle }]}>
          <View style={[styles.storeAvatar, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7", borderColor: colors.gold }]}>
            <Text style={[styles.avatarText, { color: colors.gold }]}>۞</Text>
          </View>
          <View style={styles.storeMeta}>
            <Text style={[styles.storeName, { color: colors.textPrimary }]}>Halal Market Addis Ababa</Text>
            <Text style={[styles.storeBio, { color: colors.textSecondary }]}>
              100% Certified Halal meats, organic pantry essentials, modest fashion, attar perfumery & specialty dates
            </Text>
            <View style={styles.storeBadges}>
              <Badge label="100% HALAL CERTIFIED" variant="success" size="sm" />
              <Badge label="SAME-DAY DISPATCH" variant="warning" size="sm" />
            </View>
          </View>
        </View>

        {/* Product Catalog Grid */}
        <FlatList
          data={products.slice(0, 20)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.catalogGrid,
            { paddingBottom: cartItems.length > 0 ? 140 : 80 },
          ]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cover = item.images.find((i) => i.isCover) ?? item.images[0];
            const uri = cover?.thumbnailUri ?? cover?.uri;

            return (
              <View
                style={[
                  styles.productCard,
                  {
                    backgroundColor: colors.bgSurface,
                    borderColor: isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(217, 119, 6, 0.16)",
                  },
                ]}
              >
                {uri ? (
                  <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.placeholderImage, { backgroundColor: colors.bgRaised }]}>
                    <Ionicons name="sparkles" size={28} color={colors.gold} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={[styles.productCategory, { color: colors.textTertiary }]}>{item.category}</Text>
                  <Text style={[styles.productTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.gold }]}>
                    {item.currency} {item.price.toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleAddToCart(item)}
                    style={[styles.addToBagBtn, { borderColor: colors.gold, backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB" }]}
                  >
                    <Ionicons name="bag-add-outline" size={13} color={colors.gold} />
                    <Text style={[styles.addToBagBtnText, { color: colors.gold }]}>Add to Bag</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />

        {/* Floating Buyer Cart & Checkout Bar */}
        {cartItems.length > 0 && (
          <View
            style={[
              styles.floatingCartBar,
              {
                bottom: bottomInset,
                backgroundColor: isDark ? "rgba(18, 22, 34, 0.96)" : "#0A0D14",
                borderColor: colors.gold,
              },
            ]}
          >
            <View style={styles.cartInfo}>
              <Text style={styles.cartCountBadge}>
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"} in Bag
              </Text>
              <Text style={[styles.cartPriceTotal, { color: colors.gold }]}>
                ETB {cartTotal.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Simulate Customer Checkout"
              onPress={handleSimulateCheckout}
              style={[styles.checkoutButton, { backgroundColor: colors.gold }]}
            >
              <Ionicons name="card-outline" size={16} color={isDark ? "#0A0D14" : "#FFFFFF"} />
              <Text style={[styles.checkoutButtonText, { color: isDark ? "#0A0D14" : "#FFFFFF" }]}>
                Instant Checkout
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: tokens.radii.full,
    gap: 6,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  topHeaderCenter: {
    alignItems: "center",
  },
  storeTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  storeSubtitle: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  previewModeBanner: {
    borderBottomWidth: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewModeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    gap: tokens.spacing.md,
  },
  storeAvatar: {
    width: 52,
    height: 52,
    borderRadius: tokens.radii.lg,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
  },
  storeMeta: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: "700",
  },
  storeBio: {
    fontSize: 11,
    marginVertical: 2,
    lineHeight: 15,
  },
  storeBadges: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
    marginTop: 3,
  },
  catalogGrid: {
    padding: tokens.spacing.sm,
  },
  columnWrapper: {
    gap: tokens.spacing.sm,
  },
  productCard: {
    flex: 1,
    marginBottom: tokens.spacing.sm,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 130,
  },
  placeholderImage: {
    width: "100%",
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    padding: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  productCategory: {
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: "700",
    minHeight: 32,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  addToBagBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    gap: 4,
    marginTop: 2,
  },
  addToBagBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  floatingCartBar: {
    position: "absolute",
    left: tokens.spacing.md,
    right: tokens.spacing.md,
    borderRadius: 20,
    padding: tokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
      },
      android: {
        elevation: 16,
      },
      default: {},
    }),
  },
  cartInfo: {
    gap: 2,
  },
  cartCountBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9BA5B7",
  },
  cartPriceTotal: {
    fontSize: 16,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 10,
    borderRadius: tokens.radii.full,
    gap: 6,
  },
  checkoutButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
