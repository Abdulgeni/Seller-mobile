import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { Product, ProductCategory } from "@repo/schemas";
import { Button, Card, EmptyState, Input, Skeleton, t, tokens } from "@repo/ui";

const CATEGORY_CHIPS: { label: string; value?: ProductCategory | undefined }[] = [
  { label: "All" },
  { label: "Apparel", value: "Apparel" },
  { label: "Footwear", value: "Footwear" },
  { label: "Accessories", value: "Accessories" },
  { label: "Electronics", value: "Electronics" },
  { label: "Home & Living", value: "Home & Living" },
  { label: "Beauty", value: "Beauty & Personal Care" },
];

export default function ProductsScreen(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>(undefined);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.products.list({ category: selectedCategory, search }),
    queryFn: () => defaultApiClient.getProducts({ category: selectedCategory, search: search || undefined }),
  });

  // Optimistic Stock Toggle Mutation
  const stockMutation = useMutation({
    mutationFn: (variables: { productId: string; inStock: boolean }) =>
      defaultApiClient.toggleProductStock({
        productId: variables.productId,
        inStock: variables.inStock,
        idempotencyKey: `stock_${variables.productId}_${Date.now()}`,
      }),
    onMutate: async ({ productId, inStock }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
      const previous = queryClient.getQueryData<Product[]>(
        queryKeys.products.list({ category: selectedCategory, search })
      );

      if (previous) {
        queryClient.setQueryData<Product[]>(
          queryKeys.products.list({ category: selectedCategory, search }),
          previous.map((p) => (p.id === productId ? { ...p, inStock } : p))
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.products.list({ category: selectedCategory, search }),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });

  const renderProductItem = ({ item }: { item: Product }) => {
    return (
      <Card style={styles.productCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.productCategory}>{item.category}</Text>
          </View>
          <Pressable
            onPress={() => router.push(`/products/${item.id}`)}
            style={styles.editButton}
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.productPrice}>
            {item.currency} {item.price.toLocaleString()}
          </Text>
          <View style={styles.stockToggleRow}>
            <Text style={styles.stockLabel}>
              {item.inStock ? t("products.inStock") : t("products.outOfStock")}
            </Text>
            <Switch
              value={item.inStock}
              onValueChange={(val) =>
                stockMutation.mutate({ productId: item.id, inStock: val })
              }
              trackColor={{
                false: tokens.colors.light.border,
                true: tokens.colors.light.success,
              }}
              thumbColor={tokens.colors.light.surface}
            />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={{ width: tokens.spacing.sm }} />
        <Button
          title="+ New"
          onPress={() => router.push("/products/create")}
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipRow}>
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected = selectedCategory === chip.value;
          return (
            <Pressable
              key={chip.label}
              onPress={() => setSelectedCategory(chip.value)}
              style={[
                styles.chip,
                isSelected && { backgroundColor: tokens.colors.light.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && { color: tokens.colors.light.primaryForeground },
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={{ gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }}>
          <Skeleton height={100} borderRadius={tokens.radii.md} />
          <Skeleton height={100} borderRadius={tokens.radii.md} />
          <Skeleton height={100} borderRadius={tokens.radii.md} />
        </View>
      ) : isError ? (
        <EmptyState
          title={t("common.error")}
          description={error instanceof Error ? error.message : "Failed to load products"}
          actionTitle={t("common.retry")}
          onAction={() => refetch()}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title={t("products.empty")}
          actionTitle="+ Add Product"
          onAction={() => router.push("/products/create")}
        />
      ) : (
        <FlashList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: tokens.spacing.xl }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.light.background,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.md,
  },
  chip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
    minHeight: 32,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
  },
  productCard: {
    marginBottom: tokens.spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  productCategory: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.sm,
    backgroundColor: tokens.colors.light.surfaceSubtle,
  },
  editText: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.primary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacing.md,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  stockToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  stockLabel: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    fontWeight: "500",
  },
});
