import React, { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { Product, ProductCategory } from "@repo/schemas";
import { Button, Card, EmptyState, Input, Skeleton, t, tokens } from "@repo/ui";
import { ProductRowItem } from "../../features/products/ProductRowItem";

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newPriceText, setNewPriceText] = useState("");
  const queryClient = useQueryClient();

  const queryFilters = {
    category: selectedCategory,
    search: search || undefined,
  };

  const { data: products = [], isLoading, isError, error, isStale, refetch } = useQuery({
    queryKey: queryKeys.products.list(queryFilters),
    queryFn: () => defaultApiClient.getProducts(queryFilters),
  });

  // Optimistic Stock Toggle Mutation
  const stockMutation = useMutation<
    Product,
    Error,
    { productId: string; inStock: boolean },
    { previous: Product[] | undefined }
  >({
    mutationFn: (vars) =>
      defaultApiClient.toggleProductStock({
        productId: vars.productId,
        inStock: vars.inStock,
        idempotencyKey: `stock_${vars.productId}_${Date.now()}`,
      }),
    onMutate: async ({ productId, inStock }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
      const previous = queryClient.getQueryData<Product[]>(queryKeys.products.list(queryFilters));

      if (previous) {
        queryClient.setQueryData<Product[]>(
          queryKeys.products.list(queryFilters),
          previous.map((p) => (p.id === productId ? { ...p, inStock } : p))
        );
      }
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.products.list(queryFilters), context.previous);
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert(
        "Stock Update Failed",
        err.message || "Could not update stock status. Rolled back."
      );
    },
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });

  // Optimistic Price Edit Mutation
  const priceMutation = useMutation<
    Product,
    Error,
    { productId: string; price: number },
    { previous: Product[] | undefined }
  >({
    mutationFn: (vars) =>
      defaultApiClient.editProductPrice({
        productId: vars.productId,
        price: vars.price,
        idempotencyKey: `price_${vars.productId}_${Date.now()}`,
      }),
    onMutate: async ({ productId, price }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
      const previous = queryClient.getQueryData<Product[]>(queryKeys.products.list(queryFilters));

      if (previous) {
        queryClient.setQueryData<Product[]>(
          queryKeys.products.list(queryFilters),
          previous.map((p) => (p.id === productId ? { ...p, price } : p))
        );
      }
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.products.list(queryFilters), context.previous);
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert("Price Update Failed", err.message || "Failed to update price. Rolled back.");
    },
    onSuccess: () => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });

  const handleToggleStock = useCallback(
    (productId: string, inStock: boolean) => {
      stockMutation.mutate({ productId, inStock });
    },
    [stockMutation]
  );

  const handleQuickEditPrice = useCallback((prod: Product) => {
    setEditingProduct(prod);
    setNewPriceText(String(prod.price));
  }, []);

  const handleSavePrice = () => {
    if (!editingProduct) return;
    const numPrice = Number(newPriceText);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert("Invalid Input", "Price must be a positive number.");
      return;
    }
    priceMutation.mutate({ productId: editingProduct.id, price: numPrice });
    setEditingProduct(null);
  };

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductRowItem
        product={item}
        onToggleStock={handleToggleStock}
        onQuickEditPrice={handleQuickEditPrice}
      />
    ),
    [handleToggleStock, handleQuickEditPrice]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

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

      {/* Stale Cache Banner */}
      {isStale && !isLoading && products.length > 0 && (
        <View style={styles.staleBanner}>
          <Text style={styles.staleText}>⚡ Offline cache active (showing cached products)</Text>
        </View>
      )}

      {isLoading ? (
        <View style={{ gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }}>
          <Skeleton height={80} borderRadius={tokens.radii.md} />
          <Skeleton height={80} borderRadius={tokens.radii.md} />
          <Skeleton height={80} borderRadius={tokens.radii.md} />
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
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: tokens.spacing.xl }}
        />
      )}

      {/* Inline Quick Price Edit Modal */}
      {editingProduct && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setEditingProduct(null)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quick Price Edit</Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                {editingProduct.title}
              </Text>
              <Input
                label={`New Price (${editingProduct.currency})`}
                value={newPriceText}
                onChangeText={setNewPriceText}
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setEditingProduct(null)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Save Price"
                    loading={priceMutation.isPending}
                    onPress={handleSavePrice}
                  />
                </View>
              </View>
            </Card>
          </View>
        </Modal>
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
    alignItems: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.xs,
    marginVertical: tokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
    minHeight: 28,
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
  },
  staleBanner: {
    backgroundColor: tokens.colors.light.surfaceSubtle,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radii.sm,
    marginBottom: tokens.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.light.primary,
  },
  staleText: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: tokens.spacing.lg,
  },
  modalContent: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
  },
  modalButtons: {
    flexDirection: "row",
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
  },
});
