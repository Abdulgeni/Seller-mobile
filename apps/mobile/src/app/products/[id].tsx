import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { defaultApiClient, queryKeys } from "@repo/api";
import { Button, Card, EmptyState, Input, Skeleton, t, tokens } from "@repo/ui";

export default function EditProductScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const productId = params.id ?? "";
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => defaultApiClient.getProduct(productId),
    enabled: Boolean(productId),
  });

  const [priceInput, setPriceInput] = useState<string | null>(null);
  const [inStock, setInStock] = useState<boolean | null>(null);

  const currentPrice = priceInput ?? (product ? String(product.price) : "");
  const currentInStock = inStock ?? (product ? product.inStock : true);

  const priceMutation = useMutation({
    mutationFn: (newPrice: number) =>
      defaultApiClient.editProductPrice({
        productId,
        price: newPrice,
        idempotencyKey: `price_${productId}_${Date.now()}`,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.products.detail(productId), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      Alert.alert("Success", "Price updated successfully!");
      router.back();
    },
    onError: (err) => {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update price");
    },
  });

  if (!productId) {
    return (
      <View style={styles.container}>
        <EmptyState title="Invalid Product" description="No product ID provided" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={120} borderRadius={tokens.radii.md} />
        <View style={{ height: tokens.spacing.md }} />
        <Skeleton height={200} borderRadius={tokens.radii.md} />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Product Not Found"
          description={error instanceof Error ? error.message : "Could not load product"}
          actionTitle={t("common.retry")}
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const handleSave = () => {
    const numPrice = Number(currentPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert("Invalid Input", "Price must be a positive number.");
      return;
    }
    priceMutation.mutate(numPrice);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productDesc}>{product.description}</Text>
      </Card>

      <Card>
        <Text style={styles.cardHeading}>Pricing & Availability</Text>
        <Input
          label={`Price (${product.currency})`}
          value={currentPrice}
          onChangeText={setPriceInput}
          keyboardType="numeric"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>In Stock</Text>
          <Switch
            value={currentInStock}
            onValueChange={setInStock}
            trackColor={{
              false: tokens.colors.light.border,
              true: tokens.colors.light.success,
            }}
          />
        </View>
      </Card>

      {product.variants.length > 0 && (
        <Card>
          <Text style={styles.cardHeading}>Variant Matrix ({product.variants.length})</Text>
          {product.variants.map((v) => (
            <View key={v.id} style={styles.variantRow}>
              <View>
                <Text style={styles.variantSku}>{v.sku}</Text>
                <Text style={styles.variantSpecs}>
                  {v.size ? `Size: ${v.size} ` : ""}{v.color ? `Color: ${v.color}` : ""}
                </Text>
              </View>
              <Text style={styles.variantStock}>{v.stock} in stock</Text>
            </View>
          ))}
        </Card>
      )}

      <Button
        title={t("common.save")}
        loading={priceMutation.isPending}
        onPress={handleSave}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
  },
  productCategory: {
    fontSize: 13,
    color: tokens.colors.light.contentMuted,
    marginTop: 2,
  },
  productDesc: {
    fontSize: 14,
    color: tokens.colors.light.contentSecondary,
    marginTop: tokens.spacing.sm,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: tokens.spacing.sm,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: tokens.colors.light.contentPrimary,
  },
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: tokens.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.light.border,
  },
  variantSku: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  variantSpecs: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
  },
  variantStock: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
  },
});
