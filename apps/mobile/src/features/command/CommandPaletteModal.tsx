import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createSyncExecutor, defaultApiClient, queryKeys, syncQueue } from "@repo/api";
import { type Order, type Product } from "@repo/schemas";
import { Badge, hapticFeedback, tokens } from "@repo/ui";
import { useCommandPaletteStore } from "./commandStore";

export interface CommandItem {
  id: string;
  category: "ACTION" | "PRODUCT" | "ORDER";
  title: string;
  subtitle?: string;
  onSelect: () => void;
}

export function CommandPaletteModal(): React.JSX.Element | null {
  const { isOpen, close } = useCommandPaletteStore();
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  // Retrieve cached data from TanStack Query
  const cachedProducts =
    queryClient.getQueryData<Product[]>(queryKeys.products.list()) ?? [];
  const cachedOrders =
    queryClient.getQueryData<Order[]>(queryKeys.orders.list()) ?? [];

  const staticActions: CommandItem[] = useMemo(
    () => [
      {
        id: "act_add_product",
        category: "ACTION",
        title: "+ Add New Product",
        subtitle: "Capture photos and draft catalogue entry",
        onSelect: () => {
          close();
          router.push("/products/create");
        },
      },
      {
        id: "act_view_orders",
        category: "ACTION",
        title: "Track Customer Orders",
        subtitle: "View order queue and live fulfillment timeline",
        onSelect: () => {
          close();
          router.push("/(tabs)/orders");
        },
      },
      {
        id: "act_view_catalogue",
        category: "ACTION",
        title: "Browse Product Catalogue",
        subtitle: "Manage 5,000 inventory items and stock toggles",
        onSelect: () => {
          close();
          router.push("/(tabs)/products");
        },
      },
      {
        id: "act_payouts",
        category: "ACTION",
        title: "Financial Vault & Payouts",
        subtitle: "Biometric secured M-Pesa disbursement",
        onSelect: () => {
          close();
          router.push("/payouts");
        },
      },
      {
        id: "act_sync_now",
        category: "ACTION",
        title: "Flush Offline Mutations",
        subtitle: "Force settle queued offline synchronization jobs",
        onSelect: async () => {
          close();
          const executor = createSyncExecutor(defaultApiClient);
          await syncQueue.flushQueue(executor);
          syncQueue.clearSettled();
          void queryClient.invalidateQueries();
          hapticFeedback.success();
        },
      },
    ],
    [close, queryClient]
  );

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return staticActions;
    }

    const matchedActions = staticActions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(q))
    );

    const matchedProducts: CommandItem[] = cachedProducts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((p) => ({
        id: `prod_${p.id}`,
        category: "PRODUCT",
        title: p.title,
        subtitle: `${p.category} · KES ${p.price.toLocaleString()} · ${p.inStock ? "In Stock" : "Out of Stock"}`,
        onSelect: () => {
          close();
          router.push(`/products/${p.id}`);
        },
      }));

    const matchedOrders: CommandItem[] = cachedOrders
      .filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((o) => ({
        id: `ord_${o.id}`,
        category: "ORDER",
        title: `Order #${o.id.slice(0, 8)} - ${o.customerName}`,
        subtitle: `${o.status.toUpperCase()} · KES ${o.totalAmount.toLocaleString()}`,
        onSelect: () => {
          close();
          router.push(`/orders/${o.id}`);
        },
      }));

    return [...matchedActions, ...matchedProducts, ...matchedOrders];
  }, [query, staticActions, cachedProducts, cachedOrders, close]);

  if (!isOpen) {
    return null;
  }

  const handleSelectItem = (item: CommandItem) => {
    hapticFeedback.selection();
    item.onSelect();
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.paletteModal}>
          {/* Search Input Bar */}
          <View style={styles.searchHeader}>
            <Text style={styles.searchIcon}>⌘K</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Type a command, search products, or orders..."
              placeholderTextColor={tokens.colors.light.contentMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            <Pressable
              onPress={() => {
                hapticFeedback.selection();
                close();
              }}
              style={styles.escButton}
            >
              <Text style={styles.escText}>ESC</Text>
            </Pressable>
          </View>

          {/* Results List */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectItem(item)}
                style={({ pressed }) => [
                  styles.itemRow,
                  pressed && styles.itemRowPressed,
                ]}
              >
                <View style={styles.itemMeta}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                <Badge
                  label={item.category}
                  variant={
                    item.category === "ACTION"
                      ? "info"
                      : item.category === "PRODUCT"
                        ? "success"
                        : "warning"
                  }
                  size="sm"
                />
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No matching commands or items</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: tokens.colors.light.bgOverlay,
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacing.md,
  },
  paletteModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "75%",
    backgroundColor: tokens.colors.light.bgCanvas,
    borderRadius: tokens.radii.lg,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderStrong,
    shadowColor: tokens.colors.light.contentPrimary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: tokens.elevation.modal,
    overflow: "hidden",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    backgroundColor: tokens.colors.light.bgSurface,
    gap: tokens.spacing.sm,
  },
  searchIcon: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.accent,
    backgroundColor: tokens.colors.light.bgRaised,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: tokens.radii.sm,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.light.contentPrimary,
    paddingVertical: tokens.spacing.sm,
  },
  escButton: {
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: tokens.radii.sm,
    backgroundColor: tokens.colors.light.bgRaised,
    borderWidth: 1,
    borderColor: tokens.colors.light.borderSubtle,
  },
  escText: {
    fontSize: 10,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
  },
  listContent: {
    paddingVertical: tokens.spacing.xs,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.borderSubtle,
  },
  itemRowPressed: {
    backgroundColor: tokens.colors.light.bgRaised,
  },
  itemMeta: {
    flex: 1,
    marginRight: tokens.spacing.sm,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  itemSubtitle: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    padding: tokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
  },
});
