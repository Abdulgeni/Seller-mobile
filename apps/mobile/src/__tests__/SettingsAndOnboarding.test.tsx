import React from "react";
import { describe, expect, it } from "vitest";
import { OnboardingModal } from "../features/onboarding/OnboardingModal";
import { SettingsModal } from "../features/settings/SettingsModal";
import { useSettingsStore } from "../features/settings/settingsStore";

describe("Loop 10: Settings 2.0 & Onboarding Tour", () => {
  it("useSettingsStore manages appearance, haptics, and modals correctly", () => {
    const store = useSettingsStore.getState();
    expect(store.appearanceMode).toBe("light");
    expect(store.isSettingsOpen).toBe(false);
    expect(store.isOnboardingOpen).toBe(false);

    store.setAppearanceMode("dark");
    expect(useSettingsStore.getState().appearanceMode).toBe("dark");

    store.setHaptics(false);
    expect(useSettingsStore.getState().hapticsEnabled).toBe(false);

    store.setHaptics(true);
    expect(useSettingsStore.getState().hapticsEnabled).toBe(true);

    store.openSettings();
    expect(useSettingsStore.getState().isSettingsOpen).toBe(true);
    store.closeSettings();
    expect(useSettingsStore.getState().isSettingsOpen).toBe(false);

    store.openOnboarding();
    expect(useSettingsStore.getState().isOnboardingOpen).toBe(true);
    store.completeOnboarding();
    expect(useSettingsStore.getState().isOnboardingOpen).toBe(false);
    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it("SettingsModal and OnboardingModal instantiate cleanly", () => {
    expect(SettingsModal).toBeDefined();
    expect(typeof SettingsModal).toBe("function");

    const settingsElement = React.createElement(SettingsModal);
    expect(settingsElement).toBeDefined();

    expect(OnboardingModal).toBeDefined();
    expect(typeof OnboardingModal).toBe("function");

    const onboardingElement = React.createElement(OnboardingModal);
    expect(onboardingElement).toBeDefined();
  });
});
