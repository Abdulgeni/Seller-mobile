import { z } from "zod";
import { CurrencyCodeSchema, IsoDateTimeSchema, VendorScopeSchema } from "./common";

export const ProductCategorySchema = z.enum([
  "Apparel",
  "Footwear",
  "Accessories",
  "Electronics",
  "Home & Living",
  "Beauty & Personal Care",
  "General",
]);

export const ProductVariantSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
  priceOffset: z.number().default(0),
  stock: z.number().int().nonnegative().default(0),
  barcode: z.string().optional(),
});

export const ProductImageSchema = z.object({
  id: z.string().min(1),
  uri: z.string().url().or(z.string().startsWith("file://")).or(z.string().startsWith("/")),
  thumbnailUri: z.string().url().or(z.string().startsWith("file://")).or(z.string().startsWith("/")),
  isCover: z.boolean().default(false),
  order: z.number().int().nonnegative(),
  fileSizeBytes: z.number().int().max(200 * 1024), // Max 200 KB
  width: z.number().int().max(1600),
  height: z.number().int().max(1600),
});

export const ProductSchema = VendorScopeSchema.extend({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  category: ProductCategorySchema,
  price: z.number().positive(),
  currency: CurrencyCodeSchema.default("KES"),
  inStock: z.boolean().default(true),
  stockCount: z.number().int().nonnegative().default(0),
  images: z.array(ProductImageSchema).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});

export const ProductDraftSchema = z.object({
  draftId: z.string().min(1),
  title: z.string().default(""),
  description: z.string().default(""),
  category: ProductCategorySchema.default("General"),
  price: z.number().nonnegative().default(0),
  currency: CurrencyCodeSchema.default("KES"),
  stockCount: z.number().int().nonnegative().default(0),
  images: z.array(ProductImageSchema).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  tags: z.array(z.string()).default([]),
  lastSavedAt: IsoDateTimeSchema,
});

export const StockToggleMutationSchema = z.object({
  productId: z.string().min(1),
  inStock: z.boolean(),
  idempotencyKey: z.string().uuid(),
});

export const PriceEditMutationSchema = z.object({
  productId: z.string().min(1),
  price: z.number().positive(),
  idempotencyKey: z.string().uuid(),
});

export const AiSuggestionRequestSchema = z.object({
  imageHash: z.string().min(1),
});

export const AiSuggestionResponseSchema = z.object({
  suggestedTitle: z.string(),
  suggestedCategory: ProductCategorySchema,
  suggestedTags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductDraft = z.infer<typeof ProductDraftSchema>;
export type StockToggleMutation = z.infer<typeof StockToggleMutationSchema>;
export type PriceEditMutation = z.infer<typeof PriceEditMutationSchema>;
export type AiSuggestionResponse = z.infer<typeof AiSuggestionResponseSchema>;
