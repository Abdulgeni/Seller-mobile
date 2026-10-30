import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import type { Product } from "@repo/schemas";
import { Card, hapticFeedback, t, tokens } from "@repo/ui";

interface ProductRowItemProps {
  product: Product;
  onToggleStock: (productId: string, inStock: boolean) => void;
  onQuickEditPrice: (product: Product) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (productId: string) => void;
  onLongPress?: () => void;
}

export const ProductRowItem = memo(function ProductRowItem({
  product,
  onToggleStock,
  onQuickEditPrice,
  isSelectMode = false,
  isSelected = false,
  onSelect,
  onLongPress,
}: ProductRowItemProps): React.JSX.Element {
  const coverImage = product.images.find((img) => img.isCover) ?? product.images[0];
  const thumbnailUri = coverImage?.thumbnailUri ?? coverImage?.uri;

  const handlePressCard = () => {
    if (isSelectMode && onSelect) {
      hapticFeedback.selection();
      onSelect(product.id);
    }
  };

  const handleLongPressCard = () => {
    if (onLongPress) {
      hapticFeedback.selection();
      onLongPress();
    }
  };

  return (
    <Pressable onPress={handlePressCard} onLongPress={handleLongPressCard}>
      <Card style={[styles.card, isSelected && styles.cardSelected]}>
        <View style={styles.row}>
          {isSelectMode && (
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          )}

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
                  disabled={isSelectMode}
                />
              </View>
            </View>
          </View>

          {!isSelectMode && (
            <Pressable
              onPress={() => router.push(`/products/${product.id}`)}
              style={styles.detailChevron}
              accessibilityRole="button"
              accessibilityLabel={`View full details for ${product.title}`}
            >
              <Text style={styles.chevronText}>›</Text>
            </Pressable>
          )}
        </View>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: tokens.spacing.sm,
  },
  cardSelected: {
    borderColor: tokens.colors.light.accent,
    backgroundColor: tokens.colors.light.bgRaised,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: tokens.radii.full,
    borderWidth: 1.5,
    borderColor: tokens.colors.light.borderStrong,
    marginRight: tokens.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.light.bgCanvas,
  },
  checkboxSelected: {
    backgroundColor: tokens.colors.light.accent,
    borderColor: tokens.colors.light.accent,
  },
  checkmark: {
    color: tokens.colors.light.surface,
    fontSize: 12,
    fontWeight: "700",
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
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: tokens.spacing.xs,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.light.bgRaised,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: tokens.radii.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    fontVariant: ["tabular-nums"],
  },
  editPriceHint: {
    fontSize: 10,
    marginLeft: 4,
  },
  stockToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockLabel: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    marginRight: tokens.spacing.xs,
  },
  detailChevron: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.md,
  },
  chevronText: {
    fontSize: 20,
    color: tokens.colors.light.contentMuted,
    fontWeight: "600",
  },
});
