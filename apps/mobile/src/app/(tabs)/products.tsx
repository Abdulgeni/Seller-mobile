import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { Product, ProductCategory } from "@repo/schemas";
import { Button, hapticFeedback, Skeleton, tokens } from "@repo/ui";
import { ProductRowItem } from "../../features/products/ProductRowItem";
import { useAppTheme } from "../../features/theme/ThemeContext";

interface CategoryChipOption {
  label: string;
  value?: ProductCategory | undefined;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_CHIPS: CategoryChipOption[] = [
  { label: "All Items", icon: "sparkles-outline" },
  { label: "Apparel", value: "Apparel", icon: "shirt-outline" },
  { label: "Footwear", value: "Footwear", icon: "footsteps-outline" },
  { label: "Accessories", value: "Accessories", icon: "watch-outline" },
  { label: "Coffee", value: "Specialty Coffee", icon: "cafe-outline" },
  { label: "Jewelry", value: "Jewelry", icon: "diamond-outline" },
  { label: "Home", value: "Home & Living", icon: "home-outline" },
  { label: "Beauty", value: "Beauty & Personal Care", icon: "rose-outline" },
];

export default function ProductsScreen(): React.JSX.Element {
  const { isDark, colors } = useAppTheme();
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
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      {/* Top Search & Actions Row */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Ionicons name="search-outline" size={17} color={colors.gold} style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search catalogue items..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={6}>
              <Ionicons name="close-circle" size={15} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => {
            hapticFeedback.selection();
            setIsSelectMode(!isSelectMode);
            setSelectedIds([]);
          }}
          style={[
            styles.actionButton,
            {
              backgroundColor: isSelectMode ? (isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7") : colors.bgSurface,
              borderColor: isSelectMode ? colors.gold : colors.borderSubtle,
            },
          ]}
        >
          <Ionicons
            name={isSelectMode ? "checkmark-done" : "checkbox-outline"}
            size={16}
            color={isSelectMode ? colors.gold : colors.textSecondary}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            hapticFeedback.buttonPress();
            router.push("/products/create");
          }}
          style={[styles.createButton, { backgroundColor: colors.gold }]}
        >
          <Ionicons name="add" size={18} color={isDark ? "#0A0D14" : "#FFFFFF"} />
          <Text style={[styles.createButtonText, { color: isDark ? "#0A0D14" : "#FFFFFF" }]}>New</Text>
        </Pressable>
      </View>

      {/* Bulk Selection Header */}
      {isSelectMode && (
        <View
          style={[
            styles.selectHeader,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.gold,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="layers-outline" size={16} color={colors.gold} />
            <Text style={[styles.selectCountText, { color: colors.gold }]}>
              {selectedIds.length} of {products.length} selected
            </Text>
          </View>

          <Pressable
            onPress={handleSelectAll}
            style={[styles.selectAllBtn, { borderColor: colors.borderSubtle }]}
          >
            <Text style={[styles.selectAllText, { color: colors.textPrimary }]}>
              {selectedIds.length === products.length ? "Deselect All" : "Select All"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Category Filter Chips Horizontal Scroll */}
      <View style={{ marginBottom: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORY_CHIPS.map((chip) => {
            const isSelected = selectedCategory === chip.value;
            return (
              <Pressable
                key={chip.label}
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedCategory(chip.value);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? colors.gold
                      : colors.bgSurface,
                    borderColor: isSelected ? colors.gold : colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={chip.icon}
                  size={13}
                  color={isSelected ? (isDark ? "#0A0D14" : "#FFFFFF") : colors.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isSelected ? (isDark ? "#0A0D14" : "#FFFFFF") : colors.textSecondary,
                      fontWeight: isSelected ? "700" : "500",
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Stale Cache Banner */}
      {isStale && !isLoading && products.length > 0 && (
        <View
          style={[
            styles.staleBanner,
            {
              backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB",
              borderColor: colors.gold,
            },
          ]}
        >
          <Ionicons name="cloud-offline-outline" size={14} color={colors.gold} style={{ marginRight: 6 }} />
          <Text style={[styles.staleText, { color: colors.gold }]}>
            Offline cache active (showing cached products)
          </Text>
        </View>
      )}

      {/* Main Product List */}
      {isLoading ? (
        <View style={{ gap: tokens.spacing.sm, marginTop: tokens.spacing.sm }}>
          <Skeleton height={88} borderRadius={16} />
          <Skeleton height={88} borderRadius={16} />
          <Skeleton height={88} borderRadius={16} />
        </View>
      ) : isError ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.bgSurface }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }]}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.critical} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Catalogue Sync Error</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {error instanceof Error ? error.message : "Failed to load products"}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: colors.gold }]}
          >
            <Text style={[styles.retryButtonText, { color: isDark ? "#0A0D14" : "#FFFFFF" }]}>
              Retry Connection
            </Text>
          </Pressable>
        </View>
      ) : products.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.bgSurface }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7" }]}>
            <Ionicons name="sparkles" size={36} color={colors.gold} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Atelier Catalogue Empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add handcrafted items, leatherwork, or luxury apparel to your collection.
          </Text>
          <Pressable
            onPress={() => router.push("/products/create")}
            style={[styles.retryButton, { backgroundColor: colors.gold }]}
          >
            <Text style={[styles.retryButtonText, { color: isDark ? "#0A0D14" : "#FFFFFF" }]}>
              + Add First Creation
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Batch Operations Floating Bar */}
      {isSelectMode && selectedIds.length > 0 && (
        <View
          style={[
            styles.batchBar,
            {
              backgroundColor: isDark ? "rgba(18, 22, 34, 0.95)" : "rgba(255, 255, 255, 0.96)",
              borderColor: colors.gold,
            },
          ]}
        >
          <Pressable
            onPress={() => handleBatchToggleStock(true)}
            style={[styles.batchActionButton, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.18)" : "#ECFDF5" }]}
          >
            <Ionicons name="checkmark-circle" size={15} color={colors.accent} />
            <Text style={[styles.batchActionText, { color: colors.accent }]}>In Stock</Text>
          </Pressable>

          <Pressable
            onPress={() => handleBatchToggleStock(false)}
            style={[styles.batchActionButton, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.18)" : "#FEF2F2" }]}
          >
            <Ionicons name="close-circle" size={15} color={colors.critical} />
            <Text style={[styles.batchActionText, { color: colors.critical }]}>Out Stock</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsBatchPriceModalVisible(true)}
            style={[styles.batchActionButton, { backgroundColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7" }]}
          >
            <Ionicons name="pricetag" size={15} color={colors.gold} />
            <Text style={[styles.batchActionText, { color: colors.gold }]}>Set Price</Text>
          </Pressable>
        </View>
      )}

      {/* Quick Edit Single Price Modal */}
      <Modal
        visible={!!editingProduct}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingProduct(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? "rgba(0, 0, 0, 0.75)" : "rgba(11, 14, 20, 0.5)" }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.bgSurface,
                borderColor: colors.gold,
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Ionicons name="pricetag-outline" size={20} color={colors.gold} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Price</Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {editingProduct?.title}
            </Text>

            <View style={[styles.modalInputWrap, { backgroundColor: colors.bgRaised, borderColor: colors.borderSubtle }]}>
              <Text style={{ color: colors.gold, fontWeight: "700", marginRight: 6 }}>ETB</Text>
              <TextInput
                value={newPriceText}
                onChangeText={setNewPriceText}
                keyboardType="numeric"
                placeholder="New price in ETB"
                placeholderTextColor={colors.textTertiary}
                style={[styles.modalInput, { color: colors.textPrimary }]}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setEditingProduct(null)}
                style={[styles.modalCancelBtn, { borderColor: colors.borderSubtle }]}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSavePrice}
                style={[styles.modalSaveBtn, { backgroundColor: colors.gold }]}
              >
                <Text style={{ color: isDark ? "#0A0D14" : "#FFFFFF", fontWeight: "700" }}>
                  Save Price
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Batch Price Adjustment Modal */}
      <Modal
        visible={isBatchPriceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBatchPriceModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? "rgba(0, 0, 0, 0.75)" : "rgba(11, 14, 20, 0.5)" }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.bgSurface,
                borderColor: colors.gold,
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Ionicons name="sparkles" size={20} color={colors.gold} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Batch Price Adjustment</Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Applying update across {selectedIds.length} selected atelier items
            </Text>

            <View style={[styles.modalInputWrap, { backgroundColor: colors.bgRaised, borderColor: colors.borderSubtle }]}>
              <Text style={{ color: colors.gold, fontWeight: "700", marginRight: 6 }}>ETB</Text>
              <TextInput
                value={batchPriceText}
                onChangeText={setBatchPriceText}
                keyboardType="numeric"
                placeholder="Unit price in ETB"
                placeholderTextColor={colors.textTertiary}
                style={[styles.modalInput, { color: colors.textPrimary }]}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setIsBatchPriceModalVisible(false)}
                style={[styles.modalCancelBtn, { borderColor: colors.borderSubtle }]}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleBatchAdjustPrice}
                style={[styles.modalSaveBtn, { backgroundColor: colors.gold }]}
              >
                <Text style={{ color: isDark ? "#0A0D14" : "#FFFFFF", fontWeight: "700" }}>
                  Apply to All
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: tokens.spacing.md,
    paddingTop: tokens.spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: tokens.spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.sm,
    height: 42,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    paddingHorizontal: 14,
    borderRadius: tokens.radii.full,
    gap: 4,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  selectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: tokens.spacing.xs,
  },
  selectCountText: {
    fontSize: 12,
    fontWeight: "700",
  },
  selectAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  selectAllText: {
    fontSize: 11,
    fontWeight: "600",
  },
  categoryScroll: {
    gap: tokens.spacing.xs,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  staleBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radii.sm,
    marginBottom: tokens.spacing.xs,
    borderLeftWidth: 3,
  },
  staleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  batchBar: {
    position: "absolute",
    bottom: 96,
    left: tokens.spacing.md,
    right: tokens.spacing.md,
    padding: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  batchActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 16,
    gap: 5,
  },
  batchActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: tokens.spacing.lg,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: tokens.spacing.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: tokens.spacing.md,
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.spacing.md,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: tokens.spacing.md,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 0,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
  },
  modalSaveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: tokens.radii.full,
  },
  emptyContainer: {
    marginTop: tokens.spacing.xl,
    padding: tokens.spacing.xl,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: tokens.spacing.md,
  },
  retryButton: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radii.full,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
