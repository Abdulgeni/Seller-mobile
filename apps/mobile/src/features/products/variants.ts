import { ProductVariantSchema, type ProductVariant } from "@repo/schemas";

export interface VariantMatrixOptions {
  baseSku: string;
  sizes: string[];
  colors: string[];
  defaultStock?: number;
  defaultPriceOffset?: number;
}

function sanitizeCode(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

/**
 * Computes cartesian product of sizes x colors into a strictly typed ProductVariant array.
 */
export function generateVariantMatrix(options: VariantMatrixOptions): ProductVariant[] {
  const { baseSku, sizes, colors, defaultStock = 10, defaultPriceOffset = 0 } = options;

  if (sizes.length === 0 && colors.length === 0) {
    return [];
  }

  const effectiveSizes = sizes.length > 0 ? sizes : ["Standard"];
  const effectiveColors = colors.length > 0 ? colors : ["Default"];

  const variants: ProductVariant[] = [];

  for (const color of effectiveColors) {
    for (const size of effectiveSizes) {
      const colorCode = sanitizeCode(color);
      const sizeCode = sanitizeCode(size);
      const sku = `${baseSku.toUpperCase()}-${colorCode}-${sizeCode}`;
      const id = `var_${sku.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      const variant: ProductVariant = {
        id,
        sku,
        size: size !== "Standard" ? size : undefined,
        color: color !== "Default" ? color : undefined,
        priceOffset: defaultPriceOffset,
        stock: defaultStock,
      };

      // Ensure every generated variant passes strict schema
      ProductVariantSchema.parse(variant);
      variants.push(variant);
    }
  }

  return variants;
}
