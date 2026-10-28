import { logger } from "@repo/ui";
import { create } from "zustand";
import { parseAndValidateDeepLink } from "../notifications/deepLinks";

export interface AuthState {
  isHydrated: boolean;
  vendorId: string | null;
  pendingDeepLink: string | null;
  setHydrated: (vendorId: string) => void;
  setPendingDeepLink: (link: string | null) => void;
  resolvePendingDeepLink: (navigate: (route: string) => void) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isHydrated: false,
  vendorId: null,
  pendingDeepLink: null,

  setHydrated: (vendorId: string) => {
    set({ isHydrated: true, vendorId });
  },

  setPendingDeepLink: (link: string | null) => {
    set({ pendingDeepLink: link });
  },

  resolvePendingDeepLink: (navigate: (route: string) => void): boolean => {
    const { isHydrated, pendingDeepLink } = get();
    if (!isHydrated || !pendingDeepLink) {
      return false;
    }

    const parsed = parseAndValidateDeepLink(pendingDeepLink);
    set({ pendingDeepLink: null });

    if (parsed.valid && parsed.targetRoute) {
      logger.info("Resolving cold-start deep link post-auth hydration", {
        route: parsed.targetRoute,
      });
      navigate(parsed.targetRoute);
      return true;
    }

    logger.warn("Disregarded invalid cold-start deep link", {
      pendingDeepLink,
      error: parsed.error,
    });
    return false;
  },
}));

/**
 * Simulates cold-start auth hydration from SecureStore.
 */
export async function hydrateAuthSession(): Promise<string> {
  // Simulate reading secure token from SecureStore
  await new Promise((res) => setTimeout(res, 50));
  const vendorId = "vdr_primary_store";
  useAuthStore.getState().setHydrated(vendorId);
  return vendorId;
}
