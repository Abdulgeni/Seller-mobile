import React from "react";
import { describe, expect, it } from "vitest";
import { AIStudioService } from "@repo/api";
import { StudioBackdropStyleSchema, StudioLightingPresetSchema } from "@repo/schemas";
import { AIStudioLightboxModal } from "../AIStudioLightboxModal";

describe("Loop 3: AI Photo Studio", () => {
  it("enhances a product photo with requested backdrop and lighting", async () => {
    const rawUri = "file:///data/user/0/com.seller.app/cache/photo_test.jpg";
    const result = await AIStudioService.enhancePhoto({
      sourceUri: rawUri,
      backdrop: "clean_studio",
      lighting: "soft_ambient",
      autoCrop: true,
      shadowElevation: 4,
    });

    expect(result.originalUri).toBe(rawUri);
    expect(result.backdrop).toBe("clean_studio");
    expect(result.lighting).toBe("soft_ambient");
    expect(result.enhancedUri).toContain("#studio_clean_studio_soft_ambient");
    expect(result.estimatedQualityScore).toBeGreaterThanOrEqual(90);
    expect(result.appliedFilters).toContain("subject_isolation_v2");
  });

  it("validates backdrop and lighting preset schemas", () => {
    expect(() => StudioBackdropStyleSchema.parse("clean_studio")).not.toThrow();
    expect(() => StudioBackdropStyleSchema.parse("invalid_backdrop")).toThrow();

    expect(() => StudioLightingPresetSchema.parse("warm_golden")).not.toThrow();
    expect(() => StudioLightingPresetSchema.parse("neon_disco")).toThrow();
  });

  it("AIStudioLightboxModal exports valid component definition", () => {
    expect(AIStudioLightboxModal).toBeDefined();
    expect(typeof AIStudioLightboxModal).toBe("function");

    const element = React.createElement(AIStudioLightboxModal, {
      visible: true,
      imageUri: "file:///test.jpg",
      onClose: () => {},
      onApply: () => {},
    });
    expect(element.props.visible).toBe(true);
    expect(element.props.imageUri).toBe("file:///test.jpg");
  });
});
