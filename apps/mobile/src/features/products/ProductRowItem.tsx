import React, { memo } from "react";
import { Image, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Product } from "@repo/schemas";
import { hapticFeedback, t, tokens } from "@repo/ui";
import { useAppTheme } from "../theme/ThemeContext";

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
  const { isDark, colors } = useAppTheme();
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
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.bgSurface,
            borderColor: isSelected
              ? colors.gold
              : isDark
              ? "rgba(245, 158, 11, 0.2)"
              : "rgba(217, 119, 6, 0.16)",
          },
          isSelected && {
            backgroundColor: isDark ? "rgba(245, 158, 11, 0.12)" : "#FEF3C7",
          },
        ]}
      >
        <View style={styles.row}>
          {isSelectMode && (
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isSelected ? colors.gold : colors.borderStrong,
                  backgroundColor: isSelected ? colors.gold : colors.bgSurface,
                },
              ]}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={isDark ? "#0A0D14" : "#FFFFFF"}
                />
              )}
            </View>
          )}

          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={[
                styles.thumbnail,
                {
                  borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
                },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.thumbnailPlaceholder,
                {
                  backgroundColor: colors.bgRaised,
                  borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
                },
              ]}
            >
              <Ionicons name="sparkles" size={22} color={colors.gold} />
            </View>
          )}

          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {product.title}
            </Text>
            <Text style={[styles.category, { color: colors.textSecondary }]}>{product.category}</Text>

            <View style={styles.priceRow}>
              <Pressable
                onPress={() => {
                  hapticFeedback.selection();
                  onQuickEditPrice(product);
                }}
                style={[
                  styles.priceContainer,
                  {
                    backgroundColor: colors.bgRaised,
                    borderColor: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Edit price for ${product.title}`}
              >
                <Text style={[styles.price, { color: colors.textPrimary }]}>
                  <Text style={{ color: colors.gold, fontSize: 11, fontWeight: "700" }}>{product.currency} </Text>
                  {product.price.toLocaleString()}
                </Text>
                <Ionicons name="pencil-outline" size={11} color={colors.gold} style={{ marginLeft: 4 }} />
              </Pressable>

              <View style={styles.stockToggle}>
                <Text style={[styles.stockLabel, { color: product.inStock ? colors.accent : colors.textTertiary }]}>
                  {product.inStock ? t("products.inStock") : t("products.outOfStock")}
                </Text>
                <Switch
                  value={product.inStock}
                  onValueChange={(val) => {
                    hapticFeedback.selection();
                    onToggleStock(product.id, val);
                  }}
                  trackColor={{
                    false: colors.borderSubtle,
                    true: colors.accent,
                  }}
                  thumbColor={isDark ? "#F2F5FA" : "#FFFFFF"}
                  disabled={isSelectMode}
                />
              </View>
            </View>
          </View>

          {!isSelectMode && (
            <Pressable
              onPress={() => {
                hapticFeedback.selection();
                router.push(`/products/${product.id}`);
              }}
              style={styles.detailChevron}
              accessibilityRole="button"
              accessibilityLabel={`View full details for ${product.title}`}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.gold} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: tokens.spacing.sm + 2,
    marginBottom: tokens.spacing.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: tokens.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
  },
  thumbnailPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  content: {
    flex: 1,
    marginLeft: tokens.spacing.sm + 2,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  category: {
    fontSize: 11,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  stockToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginRight: tokens.spacing.xs,
  },
  detailChevron: {
    paddingHorizontal: 6,
    paddingVertical: tokens.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
