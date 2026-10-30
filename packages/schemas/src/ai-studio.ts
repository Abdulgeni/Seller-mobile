import { z } from "zod";

export const StudioBackdropStyleSchema = z.enum([
  "clean_studio",
  "marble_slab",
  "warm_velvet",
]);
export type StudioBackdropStyle = z.infer<typeof StudioBackdropStyleSchema>;

export const StudioLightingPresetSchema = z.enum([
  "soft_ambient",
  "dramatic_spot",
  "warm_golden",
]);
export type StudioLightingPreset = z.infer<typeof StudioLightingPresetSchema>;

export const AIStudioEnhanceRequestSchema = z.object({
  sourceUri: z.string().min(1),
  backdrop: StudioBackdropStyleSchema.default("clean_studio"),
  lighting: StudioLightingPresetSchema.default("soft_ambient"),
  autoCrop: z.boolean().default(true),
  shadowElevation: z.number().min(0).max(10).default(4),
});
export type AIStudioEnhanceRequest = z.infer<typeof AIStudioEnhanceRequestSchema>;

export const AIStudioEnhanceResultSchema = z.object({
  enhancedUri: z.string().min(1),
  originalUri: z.string().min(1),
  backdrop: StudioBackdropStyleSchema,
  lighting: StudioLightingPresetSchema,
  processingTimeMs: z.number().nonnegative(),
  estimatedQualityScore: z.number().min(0).max(100),
  appliedFilters: z.array(z.string()),
});
export type AIStudioEnhanceResult = z.infer<typeof AIStudioEnhanceResultSchema>;
