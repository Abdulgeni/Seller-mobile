import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { defaultApiClient, queryKeys } from "@repo/api";
import { Badge, Button, Card, hapticFeedback, tokens } from "@repo/ui";

export interface StorefrontPreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StorefrontPreviewModal({
  visible,
  onClose,
}: StorefrontPreviewModalProps): React.JSX.Element | null {
  const [cartCount, setCartCount] = useState(0);

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => defaultApiClient.getProducts(),
    enabled: visible,
  });

  if (!visible) {
    return null;
  }

  const handleAddToCart = () => {
    hapticFeedback.selection();
    setCartCount((prev) => prev + 1);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Buyer Viewpoint Header Banner */}
        <View style={styles.previewModeBanner}>
          <Text style={styles.previewModeText}>
            ✦ LIVE BUYER PERSPECTIVE · PREVIEW MODE
          </Text>
          <Pressable
            onPress={() => {
              hapticFeedback.selection();
              onClose();
            }}
            style={styles.exitPreviewBtn}
          >
            <Text style={styles.exitPreviewText}>Exit Preview</Text>
          </Pressable>
        </View>

        {/* Store Profile Header */}
        <View style={styles.storeHeader}>
          <View style={styles.storeAvatar}>
            <Text style={styles.avatarText}>✦</Text>
          </View>
          <View style={styles.storeMeta}>
            <Text style={styles.storeName}>Atelier Habesha Addis Ababa</Text>
            <Text style={styles.storeBio}>
              Authentic handcrafted Ethiopian textiles, highland leather & specialty coffee
            </Text>
            <View style={styles.storeBadges}>
              <Badge label="VERIFIED SELLER" variant="success" size="sm" />
              <Badge label="FAST DISPATCH" variant="info" size="sm" />
            </View>
          </View>
        </View>

        {/* Product Catalog Grid */}
        <FlatList
          data={products.slice(0, 20)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.catalogGrid}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => {
            const cover = item.images.find((i) => i.isCover) ?? item.images[0];
            const uri = cover?.thumbnailUri ?? cover?.uri;

            return (
              <Card style={styles.productCard}>
                {uri ? (
                  <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={{ fontSize: 28 }}>📦</Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.productPrice}>
                    {item.currency} {item.price.toLocaleString()}
                  </Text>
                  <Button
                    title="Add to Bag"
                    size="sm"
                    variant="outline"
                    onPress={handleAddToCart}
                  />
                </View>
              </Card>
            );
          }}
        />

        {/* Floating Buyer Cart Bar */}
        {cartCount > 0 && (
          <View style={styles.floatingCartBar}>
            <View style={styles.cartInfo}>
              <Text style={styles.cartCountBadge}>{cartCount} items</Text>
              <Text style={styles.cartPrompt}>Ready for instant checkout</Text>
            </View>
            <Button
              title="View Customer Bag"
              variant="primary"
              size="sm"
              onPress={() => {
                hapticFeedback.success();
              }}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgCanvas,
  },
  previewModeBanner: {
    backgroundColor: tokens.colors.light.bgRaised,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewModeText: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.light.gold,
    letterSpacing: 1,
  },
  exitPreviewBtn: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.sm,
    backgroundColor: tokens.colors.light.bgSurface,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  exitPreviewText: {
    fontSize: 11,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.light.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
    gap: tokens.spacing.md,
  },
  storeAvatar: {
    width: 52,
    height: 52,
    borderRadius: tokens.radii.lg,
    backgroundColor: tokens.colors.light.bgRaised,
    borderWidth: 1,
    borderColor: tokens.colors.light.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    color: tokens.colors.light.accent,
  },
  storeMeta: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  storeBio: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    marginVertical: 2,
  },
  storeBadges: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
    marginTop: 2,
  },
  catalogGrid: {
    padding: tokens.spacing.sm,
    paddingBottom: 80,
  },
  columnWrapper: {
    gap: tokens.spacing.sm,
  },
  productCard: {
    flex: 1,
    marginBottom: tokens.spacing.sm,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: tokens.colors.light.bgRaised,
  },
  placeholderImage: {
    width: "100%",
    height: 120,
    backgroundColor: tokens.colors.light.bgRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    padding: tokens.spacing.sm,
    gap: tokens.spacing.xs,
  },
  productCategory: {
    fontSize: 10,
    color: tokens.colors.light.contentSecondary,
    textTransform: "uppercase",
  },
  productTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
    minHeight: 32,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    fontVariant: ["tabular-nums"],
  },
  floatingCartBar: {
    position: "absolute",
    bottom: tokens.spacing.lg,
    left: tokens.spacing.md,
    right: tokens.spacing.md,
    backgroundColor: tokens.colors.light.bgSurface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: tokens.colors.light.borderStrong,
    shadowColor: tokens.colors.light.contentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: tokens.elevation.light.card.elevation,
  },
  cartInfo: {
    gap: 2,
  },
  cartCountBadge: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.light.accent,
  },
  cartPrompt: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
  },
});
