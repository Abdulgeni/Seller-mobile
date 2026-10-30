export type HapticRole =
  | "selection"
  | "buttonPress"
  | "sheetOpen"
  | "destructive"
  | "success"
  | "warning";

interface NativeHapticsModule {
  selectionAsync?: () => Promise<void>;
  impactAsync?: (style: unknown) => Promise<void>;
  notificationAsync?: (type: unknown) => Promise<void>;
  ImpactFeedbackStyle?: {
    Light: unknown;
    Medium: unknown;
    Heavy: unknown;
    Soft?: unknown;
    Rigid?: unknown;
  };
  NotificationFeedbackType?: {
    Success: unknown;
    Warning: unknown;
    Error: unknown;
  };
}

function getNativeHaptics(): NativeHapticsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-haptics") as NativeHapticsModule;
  } catch {
    return null;
  }
}

let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

export const hapticFeedback = {
  selection: async (): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      const mod = getNativeHaptics();
      if (typeof mod?.selectionAsync === "function") {
        await mod.selectionAsync();
      }
    } catch {}
  },

  buttonPress: async (): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      const mod = getNativeHaptics();
      if (typeof mod?.impactAsync === "function" && mod.ImpactFeedbackStyle) {
        await mod.impactAsync(mod.ImpactFeedbackStyle.Light);
      }
    } catch {}
  },

  sheetOpen: async (): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      const mod = getNativeHaptics();
      if (typeof mod?.impactAsync === "function" && mod.ImpactFeedbackStyle) {
        await mod.impactAsync(mod.ImpactFeedbackStyle.Medium);
      }
    } catch {}
  },

  destructive: async (): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      const mod = getNativeHaptics();
      if (typeof mod?.impactAsync === "function" && mod.ImpactFeedbackStyle) {
        await mod.impactAsync(mod.ImpactFeedbackStyle.Heavy);
      }
    } catch {}
  },

  success: async (): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      const mod = getNativeHaptics();
      if (typeof mod?.notificationAsync === "function" && mod.NotificationFeedbackType) {
        await mod.notificationAsync(mod.NotificationFeedbackType.Success);
      }
    } catch {}
  },

  warning: async (): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      const mod = getNativeHaptics();
      if (typeof mod?.notificationAsync === "function" && mod.NotificationFeedbackType) {
        await mod.notificationAsync(mod.NotificationFeedbackType.Warning);
      }
    } catch {}
  },
};
