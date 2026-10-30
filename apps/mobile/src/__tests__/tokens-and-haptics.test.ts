import {
  elevationTokens,
  hapticFeedback,
  isHapticsEnabled,
  motionTokens,
  radiiTokens,
  setHapticsEnabled,
  tokens,
  typeScale,
} from "@repo/ui";
import { describe, expect, it } from "vitest";

describe("Atelier Design System & Token Engine (Loop 1)", () => {
  it("exports valid semantic light and dark palettes conforming to the 5% accent rule", () => {
    expect(tokens.colors.light.accent).toBe("#059669"); // Viridian Emerald
    expect(tokens.colors.dark.accent).toBe("#10B981");

    expect(tokens.colors.light.gold).toBe("#D97706"); // Sovereign Gold
    expect(tokens.colors.dark.gold).toBe("#F59E0B");

    // Canvas must not be pure black (#000000) or pure white (#ffffff)
    expect(tokens.colors.dark.bgCanvas).not.toBe("#000000");
    expect(tokens.colors.dark.bgCanvas).toBe("#0A0D14");
    expect(tokens.colors.light.bgCanvas).toBe("#F8F9FC");
  });

  it("exports backward-compatible alias keys for Phase 1 components", () => {
    expect(tokens.colors.light.background).toBe(tokens.colors.light.bgCanvas);
    expect(tokens.colors.light.surface).toBe(tokens.colors.light.bgSurface);
    expect(tokens.colors.light.primary).toBe(tokens.colors.light.accent);
    expect(tokens.colors.light.border).toBe(tokens.colors.light.borderSubtle);
  });

  it("defines explicit typography scale with tabular numerals for financial figures", () => {
    expect(typeScale.numericLg.fontVariant).toContain("tabular-nums");
    expect(typeScale.numericMd.fontVariant).toContain("tabular-nums");
    expect(typeScale.numericSm.fontVariant).toContain("tabular-nums");
    expect(typeScale.displayHero.letterSpacing).toBeLessThan(0); // negative tracking
  });

  it("enforces role-based radii and layered elevation", () => {
    expect(radiiTokens.full).toBe(9999);
    expect(radiiTokens.lg).toBe(16);
    expect(radiiTokens.md).toBe(10);
    expect(radiiTokens.sm).toBe(6);

    // Dark mode elevation uses hairlines rather than black drop shadows
    expect(elevationTokens.dark.card.shadowColor).toBe("transparent");
    expect(elevationTokens.dark.card.borderWidth).toBe(0.5);
    expect(elevationTokens.light.card.elevation).toBe(2);
  });

  it("exports physical motion tokens with documented damping and stiffness", () => {
    expect(motionTokens.durations.instant).toBe(120);
    expect(motionTokens.durations.quick).toBe(200);
    expect(motionTokens.durations.base).toBe(320);
    expect(motionTokens.durations.dramatic).toBe(480);

    expect(motionTokens.springs.physical.damping).toBe(28);
    expect(motionTokens.springs.physical.stiffness).toBe(220);
  });

  it("hapticFeedback module provides safe non-throwing methods and respect toggle state", async () => {
    expect(isHapticsEnabled()).toBe(true);

    // Should not throw in node test environment
    await expect(hapticFeedback.selection()).resolves.toBeUndefined();
    await expect(hapticFeedback.buttonPress()).resolves.toBeUndefined();
    await expect(hapticFeedback.sheetOpen()).resolves.toBeUndefined();
    await expect(hapticFeedback.destructive()).resolves.toBeUndefined();
    await expect(hapticFeedback.success()).resolves.toBeUndefined();
    await expect(hapticFeedback.warning()).resolves.toBeUndefined();

    // Toggle off
    setHapticsEnabled(false);
    expect(isHapticsEnabled()).toBe(false);
    await expect(hapticFeedback.buttonPress()).resolves.toBeUndefined();

    // Reset toggle
    setHapticsEnabled(true);
    expect(isHapticsEnabled()).toBe(true);
  });
});
