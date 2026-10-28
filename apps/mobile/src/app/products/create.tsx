import React, { useState } from "react";
import { defaultApiClient, defaultStorageClient, queryKeys } from "@repo/api";
import type { ProductCategory, ProductDraft, ProductImage } from "@repo/schemas";
import { Button, Card, Input, tokens } from "@repo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { compressProductPhoto } from "../../features/camera/compression";

export default function CreateProductScreen(): React.JSX.Element {
  const [photos, setPhotos] = useState<ProductImage[]>([]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Apparel");
  const [priceInput, setPriceInput] = useState("1500");
  const [stockInput, setStockInput] = useState("10");
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  const handlePickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) return;
      await processAndUploadAsset(result.assets[0]);
    } catch {
      Alert.alert("Permission Required", "Unable to open photo library.");
    }
  };

  const handleCaptureCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera Permission", "Camera permission is required to capture photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) return;
      await processAndUploadAsset(result.assets[0]);
    } catch {
      Alert.alert("Error", "Unable to launch camera.");
    }
  };

  const processAndUploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsProcessingPhoto(true);
    try {
      // 1. Off-thread compression down to <= 1600 px and <= 200 KB
      const compressed = await compressProductPhoto({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSizeBytes: asset.fileSize,
      });

      const photoId = `img_${Date.now()}`;
      const storagePath = `products/${photoId}.jpg`;

      // 2. Upload to mock storage
      const uploadRes = await defaultStorageClient
        .from("product-photos")
        .upload(storagePath, compressed.uri, {
          contentType: "image/jpeg",
        });

      if (uploadRes.error) {
        Alert.alert("Upload Error", uploadRes.error.message);
        return;
      }

      const publicUrl = uploadRes.data?.publicUrl ?? compressed.uri;
      const isFirst = photos.length === 0;

      const newPhoto: ProductImage = {
        id: photoId,
        uri: publicUrl,
        thumbnailUri: compressed.thumbnailUri,
        isCover: isFirst,
        order: photos.length,
        fileSizeBytes: compressed.fileSizeBytes,
        width: compressed.width,
        height: compressed.height,
      };

      setPhotos((prev) => [...prev, newPhoto]);
    } catch (err: unknown) {
      Alert.alert("Processing Error", err instanceof Error ? err.message : "Failed to process photo");
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSetCover = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isCover: p.id === id,
      }))
    );
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (filtered.length > 0 && !filtered.some((p) => p.isCover)) {
        // assign first as cover if removed one was cover
        filtered[0] = { ...filtered[0]!, isCover: true };
      }
      return filtered;
    });
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const coverPhoto = photos.find((p) => p.isCover) ?? photos[0];
      const imageHash = coverPhoto ? `hash_${coverPhoto.id}` : "img_mock_hash_123";
      const suggestion = await defaultApiClient.getAiSuggestions(imageHash);
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

    const finalPhotos = photos.length > 0 ? photos : [
      {
        id: `img_${Date.now()}`,
        uri: "https://picsum.photos/seed/default/800/800",
        thumbnailUri: "https://picsum.photos/seed/default/200/200",
        isCover: true,
        order: 0,
        fileSizeBytes: 140 * 1024,
        width: 800,
        height: 800,
      },
    ];

    const draft: ProductDraft = {
      draftId: `draft_${Date.now()}`,
      title,
      description,
      category,
      price,
      currency: "KES",
      stockCount,
      images: finalPhotos,
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
          Photos are compressed off-thread to ≤ 200 KB and ≤ 1600 px before upload.
        </Text>

        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {photos.map((item) => (
              <View key={item.id} style={styles.photoCard}>
                <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
                {item.isCover && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>COVER</Text>
                  </View>
                )}
                <View style={styles.photoMeta}>
                  <Text style={styles.photoMetaText}>
                    {Math.round(item.fileSizeBytes / 1024)} KB · {item.width}x{item.height}
                  </Text>
                </View>
                <View style={styles.photoActions}>
                  {!item.isCover && (
                    <TouchableOpacity
                      onPress={() => handleSetCover(item.id)}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionBtnText}>Set Cover</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(item.id)}
                    style={[styles.actionBtn, styles.deleteBtn]}
                  >
                    <Text style={styles.deleteBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={{ fontSize: 36 }}>📸</Text>
            <Text style={styles.photoPlaceholderText}>No photos attached yet</Text>
          </View>
        )}

        {isProcessingPhoto && (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color={tokens.colors.light.primary} />
            <Text style={styles.processingText}>Compressing off-thread & uploading...</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <View style={styles.flexBtn}>
            <Button
              title="Camera"
              variant="outline"
              disabled={isProcessingPhoto}
              onPress={handleCaptureCamera}
            />
          </View>
          <View style={styles.flexBtn}>
            <Button
              title="Pick Library"
              variant="outline"
              disabled={isProcessingPhoto}
              onPress={handlePickFromLibrary}
            />
          </View>
        </View>

        <Button
          title={aiLoading ? "Generating Suggestions..." : "✨ AI Suggestions for Details"}
          variant="secondary"
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
    height: 110,
    backgroundColor: tokens.colors.light.surfaceSubtle,
    borderRadius: tokens.radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacing.sm,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
    borderStyle: "dashed",
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: tokens.colors.light.contentSecondary,
    marginTop: tokens.spacing.xs,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  photoCard: {
    width: "48%",
    borderRadius: tokens.radii.md,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
    overflow: "hidden",
    backgroundColor: tokens.colors.light.surface,
  },
  thumbnail: {
    width: "100%",
    height: 120,
    backgroundColor: tokens.colors.light.surfaceSubtle,
  },
  coverBadge: {
    position: "absolute",
    top: tokens.spacing.xs,
    left: tokens.spacing.xs,
    backgroundColor: tokens.colors.light.primary,
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 2,
    borderRadius: tokens.radii.sm,
  },
  coverBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  photoMeta: {
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: 3,
  },
  photoMetaText: {
    fontSize: 10,
    color: tokens.colors.light.contentMuted,
  },
  photoActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: tokens.colors.light.border,
    padding: 4,
    justifyContent: "space-between",
  },
  actionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  actionBtnText: {
    fontSize: 11,
    color: tokens.colors.light.primary,
    fontWeight: "600",
  },
  deleteBtn: {},
  deleteBtnText: {
    fontSize: 11,
    color: tokens.colors.light.danger,
    fontWeight: "600",
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing.xs,
    marginVertical: tokens.spacing.xs,
  },
  processingText: {
    fontSize: 12,
    color: tokens.colors.light.primary,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
});
