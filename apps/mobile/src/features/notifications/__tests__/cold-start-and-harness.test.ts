import { describe, expect, it, vi } from "vitest";
import { hydrateAuthSession, useAuthStore } from "../../auth/authCoordinator";
import { parseAndValidateDeepLink } from "../deepLinks";
import { useNotificationStore } from "../notificationStore";

describe("Cold Start Link Resolution & Auth Hydration", () => {
  it("delays deep link resolution until auth is fully hydrated", () => {
    const navigateMock = vi.fn();

    // 1. App cold start: unhydrated state
    useAuthStore.setState({ isHydrated: false, pendingDeepLink: "seller://orders/ord_cold_1" });

    const attemptBeforeHydration = useAuthStore.getState().resolvePendingDeepLink(navigateMock);
    expect(attemptBeforeHydration).toBe(false);
    expect(navigateMock).not.toHaveBeenCalled();

    // 2. Auth hydration completes
    useAuthStore.getState().setHydrated("vdr_primary_store");

    const attemptAfterHydration = useAuthStore.getState().resolvePendingDeepLink(navigateMock);
    expect(attemptAfterHydration).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith("/orders/ord_cold_1");
    expect(useAuthStore.getState().pendingDeepLink).toBeNull();
  });

  it("hydrateAuthSession sets store to hydrated state", async () => {
    useAuthStore.setState({ isHydrated: false, vendorId: null });
    const vendorId = await hydrateAuthSession();

    expect(vendorId).toBe("vdr_primary_store");
    expect(useAuthStore.getState().isHydrated).toBe(true);
    expect(useAuthStore.getState().vendorId).toBe("vdr_primary_store");
  });

  it("handles empty state routing for deleted or non-existent order IDs", () => {
    const parsed = parseAndValidateDeepLink("seller://orders/non_existent_ord_999");
    expect(parsed.valid).toBe(true);
    expect(parsed.targetRoute).toBe("/orders/non_existent_ord_999");
  });

  it("notification store drives unread badge state", () => {
    useNotificationStore.getState().clearAll();
    expect(useNotificationStore.getState().unreadCount).toBe(0);

    useNotificationStore.getState().addNotification({
      id: "notif_cold_1",
      title: "Order Alert",
      body: "New order received",
      category: "NEW_ORDER",
      data: { orderId: "ord_10" },
      receivedAt: new Date().toISOString(),
      read: false,
    });

    expect(useNotificationStore.getState().unreadCount).toBe(1);
  });
});
