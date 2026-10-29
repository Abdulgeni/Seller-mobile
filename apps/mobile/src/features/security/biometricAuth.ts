import { logger } from "@repo/ui";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import type { AppStateStatus } from "react-native";
import { create } from "zustand";

export const FIVE_MINUTES_MS = 5 * 60 * 1000;

export interface BiometricSecurityState {
  isAuthenticated: boolean;
  lastAuthenticatedAt: number | null;
  backgroundedAt: number | null;
  authenticate: (promptMessage?: string) => Promise<boolean>;
  lock: () => void;
  handleAppStateChange: (nextState: AppStateStatus) => void;
}

export const useBiometricSecurityStore = create<BiometricSecurityState>((set, get) => ({
  isAuthenticated: false,
  lastAuthenticatedAt: null,
  backgroundedAt: null,

  authenticate: async (promptMessage = "Authenticate to access financial details"): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        logger.info("Biometrics not enrolled/supported, falling back to session unlock");
        const now = Date.now();
        set({ isAuthenticated: true, lastAuthenticatedAt: now, backgroundedAt: null });
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: "Use Device Passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const now = Date.now();
        set({ isAuthenticated: true, lastAuthenticatedAt: now, backgroundedAt: null });
        logger.info("Biometric authentication successful");
        return true;
      }

      logger.warn("Biometric authentication failed or canceled", { error: result.warning });
      return false;
    } catch (err: unknown) {
      logger.error("Biometric authentication exception", err);
      return false;
    }
  },

  lock: () => {
    set({ isAuthenticated: false, lastAuthenticatedAt: null, backgroundedAt: null });
  },

  handleAppStateChange: (nextState: AppStateStatus) => {
    const { isAuthenticated, backgroundedAt } = get();

    if (nextState.match(/inactive|background/)) {
      if (isAuthenticated && !backgroundedAt) {
        set({ backgroundedAt: Date.now() });
      }
    } else if (nextState === "active") {
      if (backgroundedAt) {
        const timeInBackground = Date.now() - backgroundedAt;
        if (timeInBackground >= FIVE_MINUTES_MS) {
          logger.info("Exceeded 5-minute background threshold; locking financial screens", {
            timeInBackground,
          });
          set({ isAuthenticated: false, lastAuthenticatedAt: null, backgroundedAt: null });
        } else {
          set({ backgroundedAt: null });
        }
      }
    }
  },
}));

// Secure Token Persistence (never in AsyncStorage)
export async function saveSecureToken(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getSecureToken(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function deleteSecureToken(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
