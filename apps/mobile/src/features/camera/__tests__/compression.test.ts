import { ProductImageSchema } from "@repo/schemas";
import { describe, expect, it } from "vitest";
import {
  calculateTargetDimensions,
  compressProductPhoto,
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGE_DIMENSION,
} from "../compression";

describe("Photo Compression Pipeline", () => {
  it("calculates downscaled dimensions within 1600 px budget preserving aspect ratio", () => {
    // 3200 x 2400 (4:3) -> 1600 x 1200
    const dims1 = calculateTargetDimensions(3200, 2400, MAX_IMAGE_DIMENSION);
    expect(dims1.width).toBe(1600);
    expect(dims1.height).toBe(1200);

    // 2400 x 4800 (1:2) -> 800 x 1600
    const dims2 = calculateTargetDimensions(2400, 4800, MAX_IMAGE_DIMENSION);
    expect(dims2.width).toBe(800);
    expect(dims2.height).toBe(1600);
  });

  it("does not upscale images that are already below 1600 px", () => {
    const dims = calculateTargetDimensions(1200, 900, MAX_IMAGE_DIMENSION);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(900);
  });

  it("compresses photo and enforces <= 1600 px and <= 200 KB byte size", async () => {
    const input = {
      uri: "file:///mock/high_res_photo.jpg",
      width: 4000,
      height: 3000,
      fileSizeBytes: 4 * 1024 * 1024, // 4 MB raw
    };

    const result = await compressProductPhoto(input);

    expect(result.width).toBeLessThanOrEqual(MAX_IMAGE_DIMENSION);
    expect(result.height).toBeLessThanOrEqual(MAX_IMAGE_DIMENSION);
    expect(result.fileSizeBytes).toBeLessThanOrEqual(MAX_FILE_SIZE_BYTES);

    // Verify it satisfies the strict ProductImageSchema
    const validatedImage = ProductImageSchema.parse({
      id: "img_test_1",
      uri: result.uri,
      thumbnailUri: result.thumbnailUri,
      isCover: true,
      order: 0,
      fileSizeBytes: result.fileSizeBytes,
      width: result.width,
      height: result.height,
    });

    expect(validatedImage.id).toBe("img_test_1");
    expect(validatedImage.fileSizeBytes).toBeLessThanOrEqual(204800);
  });
});
