import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { Product, ProductCategory } from "@repo/schemas";
import { Button, Card, EmptyState, hapticFeedback, Input, Skeleton, t, tokens } from "@repo/ui";
import { ProductRowItem } from "../../features/products/ProductRowItem";

const CATEGORY_CHIPS: { label: string; value?: ProductCategory | undefined }[] = [
  { label: "All" },
  { label: "Apparel", value: "Apparel" },
  { label: "Footwear", value: "Footwear" },
  { label: "Accessories", value: "Accessories" },
  { label: "Coffee", value: "Specialty Coffee" },
  { label: "Jewelry", value: "Jewelry" },
  { label: "Home", value: "Home & Living" },
  { label: "Beauty", value: "Beauty & Personal Care" },
];

export default function ProductsScreen(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newPriceText, setNewPriceText] = useState("");

  // Bulk Multi-Select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchPriceModalVisible, setIsBatchPriceModalVisible] = useState(false);
  const [batchPriceText, setBatchPriceText] = useState("");

  const queryClient = useQueryClient();

  const queryFilters = useMemo(
    () => ({
      category: selectedCategory,
      search: search || undefined,
    }),
    [selectedCategory, search]
  );

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
        err.message || "Failed to update stock status. Rolled back."
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

  const handleToggleSelectId = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    hapticFeedback.selection();
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  }, [selectedIds.length, products]);

  const handleBatchToggleStock = useCallback(
    async (inStock: boolean) => {
      if (selectedIds.length === 0) return;
      hapticFeedback.buttonPress();

      const previous = queryClient.getQueryData<Product[]>(queryKeys.products.list(queryFilters));
      if (previous) {
        queryClient.setQueryData<Product[]>(
          queryKeys.products.list(queryFilters),
          previous.map((p) => (selectedIds.includes(p.id) ? { ...p, inStock } : p))
        );
      }

      try {
        await Promise.all(
          selectedIds.map((id) =>
            defaultApiClient.toggleProductStock({
              productId: id,
              inStock,
              idempotencyKey: `batch_stock_${id}_${Date.now()}`,
            })
          )
        );
        hapticFeedback.success();
        setIsSelectMode(false);
        setSelectedIds([]);
      } catch {
        if (previous) {
          queryClient.setQueryData(queryKeys.products.list(queryFilters), previous);
        }
        hapticFeedback.warning();
        Alert.alert("Batch Update Failed", "Failed to update selected items. Rolled back.");
      } finally {
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      }
    },
    [selectedIds, queryClient, queryFilters]
  );

  const handleBatchAdjustPrice = useCallback(async () => {
    const numPrice = Number(batchPriceText);
    if (isNaN(numPrice) || numPrice <= 0 || selectedIds.length === 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive price.");
      return;
    }
    hapticFeedback.buttonPress();
    setIsBatchPriceModalVisible(false);

    const previous = queryClient.getQueryData<Product[]>(queryKeys.products.list(queryFilters));
    if (previous) {
      queryClient.setQueryData<Product[]>(
        queryKeys.products.list(queryFilters),
        previous.map((p) => (selectedIds.includes(p.id) ? { ...p, price: numPrice } : p))
      );
    }

    try {
      await Promise.all(
        selectedIds.map((id) =>
          defaultApiClient.editProductPrice({
            productId: id,
            price: numPrice,
            idempotencyKey: `batch_price_${id}_${Date.now()}`,
          })
        )
      );
      hapticFeedback.success();
      setIsSelectMode(false);
      setSelectedIds([]);
      setBatchPriceText("");
    } catch {
      if (previous) {
        queryClient.setQueryData(queryKeys.products.list(queryFilters), previous);
      }
      hapticFeedback.warning();
      Alert.alert("Batch Price Failed", "Failed to update prices. Rolled back.");
    } finally {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    }
  }, [batchPriceText, selectedIds, queryClient, queryFilters]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductRowItem
        product={item}
        onToggleStock={handleToggleStock}
        onQuickEditPrice={handleQuickEditPrice}
        isSelectMode={isSelectMode}
        isSelected={selectedIds.includes(item.id)}
        onSelect={handleToggleSelectId}
        onLongPress={() => {
          setIsSelectMode(true);
          setSelectedIds([item.id]);
        }}
      />
    ),
    [handleToggleStock, handleQuickEditPrice, isSelectMode, selectedIds, handleToggleSelectId]
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
        <View style={{ width: tokens.spacing.xs }} />
        <Button
          title={isSelectMode ? "Done" : "Select"}
          variant={isSelectMode ? "secondary" : "outline"}
          onPress={() => {
            hapticFeedback.selection();
            setIsSelectMode(!isSelectMode);
            setSelectedIds([]);
          }}
        />
        <View style={{ width: tokens.spacing.xs }} />
        <Button
          title="+ New"
          onPress={() => router.push("/products/create")}
        />
      </View>

      {/* Bulk Selection Header */}
      {isSelectMode && (
        <View style={styles.selectHeader}>
          <Text style={styles.selectCountText}>
            {selectedIds.length} of {products.length} selected
          </Text>
          <Button
            title={selectedIds.length === products.length ? "Deselect All" : "Select All"}
            variant="outline"
            size="sm"
            onPress={handleSelectAll}
          />
        </View>
      )}

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
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Batch Operations Floating Bar */}
      {isSelectMode && selectedIds.length > 0 && (
        <View style={styles.batchBar}>
          <Button
            title="In Stock"
            variant="secondary"
            size="sm"
            onPress={() => handleBatchToggleStock(true)}
          />
          <Button
            title="Out Stock"
            variant="secondary"
            size="sm"
            onPress={() => handleBatchToggleStock(false)}
          />
          <Button
            title="Set Price"
            variant="primary"
            size="sm"
            onPress={() => setIsBatchPriceModalVisible(true)}
          />
        </View>
      )}

      {/* Quick Edit Single Price Modal */}
      <Modal visible={!!editingProduct} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Price</Text>
            <Text style={styles.modalSubtitle}>{editingProduct?.title}</Text>
            <Input
              value={newPriceText}
              onChangeText={setNewPriceText}
              keyboardType="numeric"
              placeholder="Enter new price in ETB"
            />
            <View style={styles.modalButtons}>
              <Button
                title={t("common.cancel")}
                variant="secondary"
                onPress={() => setEditingProduct(null)}
              />
              <View style={{ width: tokens.spacing.sm }} />
              <Button
                title={t("common.save")}
                loading={priceMutation.isPending}
                onPress={handleSavePrice}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Batch Price Adjustment Modal */}
      <Modal visible={isBatchPriceModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Batch Adjust Price</Text>
            <Text style={styles.modalSubtitle}>
              Applying to {selectedIds.length} selected items
            </Text>
            <Input
              value={batchPriceText}
              onChangeText={setBatchPriceText}
              keyboardType="numeric"
              placeholder="New unit price in ETB"
            />
            <View style={styles.modalButtons}>
              <Button
                title={t("common.cancel")}
                variant="secondary"
                onPress={() => setIsBatchPriceModalVisible(false)}
              />
              <View style={{ width: tokens.spacing.sm }} />
              <Button
                title="Apply to All"
                onPress={handleBatchAdjustPrice}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgCanvas,
    padding: tokens.spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: tokens.spacing.sm,
  },
  selectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: tokens.colors.light.bgSurface,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
    marginBottom: tokens.spacing.xs,
  },
  selectCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.accent,
  },
  chipRow: {
    flexDirection: "row",
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radii.full,
    backgroundColor: tokens.colors.light.bgRaised,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
  },
  staleBanner: {
    backgroundColor: tokens.colors.light.bgRaised,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radii.sm,
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  staleText: {
    fontSize: 11,
    color: tokens.colors.light.contentSecondary,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: tokens.spacing.xl,
  },
  batchBar: {
    position: "absolute",
    bottom: tokens.spacing.lg,
    left: tokens.spacing.md,
    right: tokens.spacing.md,
    backgroundColor: tokens.colors.light.bgSurface,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderStrong,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: tokens.colors.light.contentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: tokens.elevation.light.card.elevation,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgOverlay,
    justifyContent: "center",
    padding: tokens.spacing.lg,
  },
  modalCard: {
    backgroundColor: tokens.colors.light.bgCanvas,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.xs,
  },
  modalSubtitle: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    marginBottom: tokens.spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: tokens.spacing.md,
  },
});
