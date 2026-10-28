import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { defaultApiClient, queryKeys } from "@repo/api";
import type { ProductCategory, ProductDraft } from "@repo/schemas";
import { Button, Card, Input, tokens } from "@repo/ui";

export default function CreateProductScreen(): React.JSX.Element {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Apparel");
  const [priceInput, setPriceInput] = useState("1500");
  const [stockInput, setStockInput] = useState("10");
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const suggestion = await defaultApiClient.getAiSuggestions("img_mock_hash_123");
      setTitle(suggestion.suggestedTitle);
      setCategory(suggestion.suggestedCategory);
      Alert.alert(
        "AI Suggestions Applied",
        `Suggested title: ${suggestion.suggestedTitle}\nCategory: ${suggestion.suggestedCategory}`
      );
    } catch {
      Alert.alert("Notice", "Could not fetch AI suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (draft: ProductDraft) =>
      defaultApiClient.createProduct(draft, `create_prod_${Date.now()}`),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      Alert.alert("Product Created", `${newProduct.title} added to catalogue!`);
      router.back();
    },
    onError: (err) => {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to create product");
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Product title cannot be empty");
      return;
    }
    const price = Number(priceInput);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Validation Error", "Price must be a positive number");
      return;
    }
    const stockCount = Number(stockInput) || 0;

    const draft: ProductDraft = {
      draftId: `draft_${Date.now()}`,
      title,
      description,
      category,
      price,
      currency: "KES",
      stockCount,
      images: [
        {
          id: `img_${Date.now()}`,
          uri: "https://picsum.photos/seed/new/800/800",
          thumbnailUri: "https://picsum.photos/seed/new/200/200",
          isCover: true,
          order: 0,
          fileSizeBytes: 150 * 1024,
          width: 800,
          height: 800,
        },
      ],
      variants: [],
      tags: [category.toLowerCase()],
      lastSavedAt: new Date().toISOString(),
    };

    createMutation.mutate(draft);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.cardHeading}>Product Photos</Text>
        <Text style={styles.photoHint}>
          Photos are automatically compressed to ≤ 200 KB and ≤ 1600 px off the main thread.
        </Text>
        <View style={styles.photoPlaceholder}>
          <Text style={{ fontSize: 36 }}>📸</Text>
          <Text style={styles.photoPlaceholderText}>Photo ready (1 cover image selected)</Text>
        </View>

        <Button
          title={aiLoading ? "Generating Suggestions..." : "✨ AI Suggestions for Details"}
          variant="outline"
          loading={aiLoading}
          onPress={handleAiSuggest}
        />
      </Card>

      <Card>
        <Text style={styles.cardHeading}>Details</Text>
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Handmade Leather Sandals"
        />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter item description..."
          multiline
        />
        <Input
          label="Price (KES)"
          value={priceInput}
          onChangeText={setPriceInput}
          keyboardType="numeric"
        />
        <Input
          label="Initial Stock Quantity"
          value={stockInput}
          onChangeText={setStockInput}
          keyboardType="numeric"
        />
      </Card>

      <Button
        title="Create Product"
        loading={createMutation.isPending}
        onPress={handleSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.light.contentPrimary,
    marginBottom: tokens.spacing.xs,
  },
  photoHint: {
    fontSize: 12,
    color: tokens.colors.light.contentMuted,
    marginBottom: tokens.spacing.sm,
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: tokens.colors.light.surfaceSubtle,
    borderRadius: tokens.radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.md,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
    borderStyle: "dashed",
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    marginTop: tokens.spacing.xs,
  },
});
