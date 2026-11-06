import React, { useCallback, useEffect, useRef, useState } from "react";
import { defaultApiClient, defaultStorageClient, queryKeys } from "@repo/api";
import {
  ProductCategorySchema,
  type ProductCategory,
  type ProductDraft,
  type ProductImage,
  type ProductVariant,
} from "@repo/schemas";
import { Button, Card, Input, tokens } from "@repo/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { z } from "zod";
import { AIStudioLightboxModal } from "../../features/camera/AIStudioLightboxModal";
import { compressProductPhoto } from "../../features/camera/compression";
import { defaultDraftStorage } from "../../features/products/draftStorage";
import { generateVariantMatrix } from "../../features/products/variants";

const FormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).default(""),
  category: ProductCategorySchema,
  price: z.coerce.number().positive("Price must be greater than 0"),
  stockCount: z.coerce.number().int().nonnegative("Stock cannot be negative").default(0),
});

type FormData = z.infer<typeof FormSchema>;

const AVAILABLE_SIZES = ["S", "M", "L", "XL"];
const AVAILABLE_COLORS = ["Black", "White", "Navy", "Brown"];
const CATEGORIES: ProductCategory[] = [
  "Apparel",
  "Footwear",
  "Accessories",
  "Specialty Coffee",
  "Home & Living",
  "Jewelry",
  "Beauty & Personal Care",
  "General",
];

export default function CreateProductScreen(): React.JSX.Element {
  const [photos, setPhotos] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [aiStudioPhoto, setAiStudioPhoto] = useState<{ uri: string; id: string } | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Apparel",
      price: 3500,
      stockCount: 10,
    },
  });

  const formValues = useWatch({ control });

  // Check and restore draft on mount
  useEffect(() => {
    let isMounted = true;
    void defaultDraftStorage.loadDraft().then((saved) => {
      if (saved && isMounted && !hasRestoredDraft) {
        setValue("title", saved.title);
        setValue("description", saved.description);
        setValue("category", saved.category);
        setValue("price", saved.price);
        setValue("stockCount", saved.stockCount);
        setPhotos(saved.images);
        setVariants(saved.variants);
        setHasRestoredDraft(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [hasRestoredDraft, setValue]);

  // Debounced auto-save draft to MMKV/disk
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const draftCategory = formValues?.category ?? "Apparel";
      const draft: ProductDraft = {
        draftId: "current_active_draft",
        title: formValues?.title ?? "",
        description: formValues?.description ?? "",
        category: draftCategory,
        price: Number(formValues?.price) || 0,
        currency: "ETB",
        stockCount: Number(formValues?.stockCount) || 0,
        images: photos,
        variants,
        tags: [draftCategory.toLowerCase()],
        lastSavedAt: new Date().toISOString(),
      };
      void defaultDraftStorage.saveDraft(draft);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formValues, photos, variants]);

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
      const compressed = await compressProductPhoto({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSizeBytes: asset.fileSize,
      });

      const photoId = `img_${Date.now()}`;
      const storagePath = `products/${photoId}.jpg`;

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
      setValue("title", suggestion.suggestedTitle);
      setValue("category", suggestion.suggestedCategory);
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

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleGenerateVariants = () => {
    const baseSku = formValues?.title ? formValues.title.slice(0, 6) : "PROD";
    const generated = generateVariantMatrix({
      baseSku,
      sizes: selectedSizes,
      colors: selectedColors,
      defaultStock: Number(formValues?.stockCount) || 10,
      defaultPriceOffset: 0,
    });
    setVariants(generated);
  };

  const createMutation = useMutation({
    mutationFn: (draft: ProductDraft) =>
      defaultApiClient.createProduct(draft, `create_prod_${Date.now()}`),
    onSuccess: async (newProduct) => {
      await defaultDraftStorage.clearDraft();
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      Alert.alert("Product Created", `${newProduct.title} added to catalogue!`);
      router.back();
    },
    onError: (err) => {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to create product");
    },
  });

  const onSubmit = useCallback(
    (data: FormData) => {
      const now = Date.now();
      const finalPhotos = photos.length > 0 ? photos : [
        {
          id: `img_${now}`,
          uri: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
          thumbnailUri: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80",
          isCover: true,
          order: 0,
          fileSizeBytes: 140 * 1024,
          width: 800,
          height: 800,
        },
      ];

      const draft: ProductDraft = {
        draftId: `draft_${now}`,
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        currency: "ETB",
        stockCount: data.stockCount,
        images: finalPhotos,
        variants,
        tags: [data.category.toLowerCase()],
        lastSavedAt: new Date(now).toISOString(),
      };

      createMutation.mutate(draft);
    },
    [photos, variants, createMutation]
  );

  const handlePressSubmit = useCallback(() => {
    void handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

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
                  <TouchableOpacity
                    onPress={() => setAiStudioPhoto({ uri: item.uri, id: item.id })}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>✨ AI Studio</Text>
                  </TouchableOpacity>
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
        <Text style={styles.cardHeading}>Product Details</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Title *"
              value={value}
              onChangeText={onChange}
              placeholder="e.g. Pure Cotton Oxford Shirt"
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Description"
              value={value}
              onChangeText={onChange}
              placeholder="Enter item description..."
              multiline
              error={errors.description?.message}
            />
          )}
        />

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setValue("category", cat)}
              style={[
                styles.chip,
                formValues?.category === cat && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  formValues?.category === cat && styles.chipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputPair}>
          <View style={styles.flexBtn}>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Price (ETB) *"
                  value={String(value || "")}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.price?.message}
                />
              )}
            />
          </View>
          <View style={styles.flexBtn}>
            <Controller
              control={control}
              name="stockCount"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Initial Stock *"
                  value={String(value || "")}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.stockCount?.message}
                />
              )}
            />
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardHeading}>Variant Matrix (Size & Color)</Text>
        <Text style={styles.photoHint}>Select sizes and colors to generate variant SKUs</Text>

        <Text style={styles.sectionLabel}>Sizes</Text>
        <View style={styles.chipsRow}>
          {AVAILABLE_SIZES.map((sz) => (
            <TouchableOpacity
              key={sz}
              onPress={() => toggleSize(sz)}
              style={[styles.chip, selectedSizes.includes(sz) && styles.chipSelected]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSizes.includes(sz) && styles.chipTextSelected,
                ]}
              >
                {sz}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Colors</Text>
        <View style={styles.chipsRow}>
          {AVAILABLE_COLORS.map((col) => (
            <TouchableOpacity
              key={col}
              onPress={() => toggleColor(col)}
              style={[styles.chip, selectedColors.includes(col) && styles.chipSelected]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedColors.includes(col) && styles.chipTextSelected,
                ]}
              >
                {col}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={`Generate Variants (${selectedSizes.length * (selectedColors.length || 1)} SKUs)`}
          variant="outline"
          disabled={selectedSizes.length === 0 && selectedColors.length === 0}
          onPress={handleGenerateVariants}
        />

        {variants.length > 0 && (
          <View style={styles.variantList}>
            <Text style={styles.variantListHeader}>Active Variants ({variants.length})</Text>
            {variants.map((v) => (
              <View key={v.id} style={styles.variantRow}>
                <View style={styles.variantMeta}>
                  <Text style={styles.variantSku}>{v.sku}</Text>
                  <Text style={styles.variantAttr}>
                    {v.color ?? "No Color"} · {v.size ?? "Standard"}
                  </Text>
                </View>
                <Text style={styles.variantStock}>Qty: {v.stock}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Button
        title="Create Product"
        loading={createMutation.isPending}
        onPress={handlePressSubmit}
      />

      <AIStudioLightboxModal
        visible={!!aiStudioPhoto}
        imageUri={aiStudioPhoto?.uri ?? null}
        onClose={() => setAiStudioPhoto(null)}
        onApply={(enhancedUri) => {
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === aiStudioPhoto?.id
                ? { ...p, uri: enhancedUri, thumbnailUri: enhancedUri }
                : p
            )
          );
        }}
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.light.contentSecondary,
    marginTop: tokens.spacing.xs,
    marginBottom: 6,
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
    color: tokens.colors.light.textInverse,
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
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: tokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 6,
    borderRadius: tokens.radii.full,
    borderWidth: 1,
    borderColor: tokens.colors.light.border,
    backgroundColor: tokens.colors.light.surface,
  },
  chipSelected: {
    backgroundColor: tokens.colors.light.primary,
    borderColor: tokens.colors.light.primary,
  },
  chipText: {
    fontSize: 12,
    color: tokens.colors.light.contentSecondary,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: tokens.colors.light.textInverse,
    fontWeight: "600",
  },
  inputPair: {
    flexDirection: "row",
    gap: tokens.spacing.sm,
  },
  variantList: {
    marginTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.light.border,
    paddingTop: tokens.spacing.xs,
  },
  variantListHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.light.contentSecondary,
    marginBottom: 6,
  },
  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.light.border,
  },
  variantMeta: {
    flex: 1,
  },
  variantSku: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.light.contentPrimary,
  },
  variantAttr: {
    fontSize: 11,
    color: tokens.colors.light.contentMuted,
  },
  variantStock: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.light.contentSecondary,
  },
});
