import { create } from "zustand";
import { isHapticsEnabled, setHapticsEnabled } from "@repo/ui";

export type AppearanceMode = "system" | "light" | "dark";

export interface SettingsState {
  appearanceMode: AppearanceMode;
  hapticsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  isSettingsOpen: boolean;
  isOnboardingOpen: boolean;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setHaptics: (enabled: boolean) => void;
  completeOnboarding: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  appearanceMode: "light",
  hapticsEnabled: isHapticsEnabled(),
  hasCompletedOnboarding: false,
  isSettingsOpen: false,
  isOnboardingOpen: false,
  setAppearanceMode: (appearanceMode) => set({ appearanceMode }),
  setHaptics: (hapticsEnabled) => {
    setHapticsEnabled(hapticsEnabled);
    set({ hapticsEnabled });
  },
  completeOnboarding: () =>
    set({ hasCompletedOnboarding: true, isOnboardingOpen: false }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),
}));
