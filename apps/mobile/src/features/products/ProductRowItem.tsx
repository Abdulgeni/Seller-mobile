import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import type { Product } from "@repo/schemas";
import { Card, t, tokens } from "@repo/ui";

interface ProductRowItemProps {
  product: Product;
  onToggleStock: (productId: string, inStock: boolean) => void;
  onQuickEditPrice: (product: Product) => void;
}

export const ProductRowItem = memo(function ProductRowItem({
  product,
  onToggleStock,
  onQuickEditPrice,
}: ProductRowItemProps): React.JSX.Element {
  const coverImage = product.images.find((img) => img.isCover) ?? product.images[0];
  const thumbnailUri = coverImage?.thumbnailUri ?? coverImage?.uri;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={{ fontSize: 20 }}>📦</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={styles.category}>{product.category}</Text>

          <View style={styles.priceRow}>
            <Pressable
              onPress={() => onQuickEditPrice(product)}
              style={styles.priceContainer}
              accessibilityRole="button"
              accessibilityLabel={`Edit price for ${product.title}`}
            >
              <Text style={styles.price}>
                {product.currency} {product.price.toLocaleString()}
              </Text>
              <Text style={styles.editPriceHint}>✏️</Text>
            </Pressable>

            <View style={styles.stockToggle}>
              <Text style={styles.stockLabel}>
                {product.inStock ? t("products.inStock") : t("products.outOfStock")}
              </Text>
              <Switch
                value={product.inStock}
                onValueChange={(val) => onToggleStock(product.id, val)}
                trackColor={{
                  false: tokens.colors.light.border,
                  true: tokens.colors.light.success,
                }}
                thumbColor={tokens.colors.light.surface}
              />
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => router.push(`/products/${product.id}`)}
          style={styles.detailChevron}
          accessibilityRole="button"
          accessibilityLabel={`View full details for ${product.title}`}
        >
          <Text style={styles.chevronText}>›</Text>
        </Pressable>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: tokens.spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: tokens.radii.sm,
    backgroundColor: tokens.colors.light.surfaceSubtle,
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: tokens.radii.sm,
    backgroundColor: tokens.colors.light.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
  },
  content: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  category: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacing.xs,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: tokens.radii.sm,
    backgroundColor: tokens.colors.light.surfaceSubtle,
  },
  price: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.light.primary,
  },
  editPriceHint: {
    fontSize: 11,
  },
  stockToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
  },
  detailChevron: {
    paddingLeft: tokens.spacing.xs,
    paddingVertical: tokens.spacing.sm,
    justifyContent: "center",
  },
  chevronText: {
    fontSize: 24,
    color: tokens.colors.light.contentMuted,
  },
});
