import { describe, expect, it, vi } from "vitest";
import { parseAndValidateDeepLink } from "../deepLinks";
import {
  ACTION_ACCEPT_ORDER,
  handleNotificationResponse,
} from "../notificationManager";
import { useNotificationStore } from "../notificationStore";

describe("Deep Link Parser & Validator", () => {
  it("parses valid order deep link without action", () => {
    const result = parseAndValidateDeepLink("seller://orders/ord_987");
    expect(result.valid).toBe(true);
    expect(result.orderId).toBe("ord_987");
    expect(result.action).toBeUndefined();
    expect(result.targetRoute).toBe("/orders/ord_987");
  });

  it("parses valid order deep link with action=accept", () => {
    const result = parseAndValidateDeepLink("seller://orders/ord_456?action=accept");
    expect(result.valid).toBe(true);
    expect(result.orderId).toBe("ord_456");
    expect(result.action).toBe("accept");
    expect(result.targetRoute).toBe("/orders/ord_456?action=accept");
  });

  it("rejects invalid path not matching /orders/:id", () => {
    const result = parseAndValidateDeepLink("seller://products/prod_123");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unrecognized route pattern");
  });

  it("rejects invalid action violating Zod schema", () => {
    const result = parseAndValidateDeepLink("seller://orders/ord_123?action=delete_all");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Deep link parameter schema violation");
  });

  it("handles malformed URLs gracefully without crashing", () => {
    const result = parseAndValidateDeepLink("not_a_valid_url:::://");
    expect(result.valid).toBe(false);
  });
});

describe("Notification Store & Response Handling", () => {
  it("adds valid notification and increments unread count", () => {
    useNotificationStore.getState().clearAll();

    const validPayload = {
      id: "notif_100",
      title: "New Order #100",
      body: "Kofi placed an order",
      category: "NEW_ORDER",
      data: {
        orderId: "ord_100",
        action: "VIEW_ORDER",
      },
      receivedAt: new Date().toISOString(),
      read: false,
    };

    const added = useNotificationStore.getState().addNotification(validPayload);
    expect(added).toBe(true);
    expect(useNotificationStore.getState().unreadCount).toBe(1);

    // Marking as read decrements count
    useNotificationStore.getState().markAsRead("notif_100");
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it("rejects malformed notification payloads failing Zod schema", () => {
    const invalidPayload = {
      id: "", // Invalid empty id
      title: "Bad notification",
    };

    const added = useNotificationStore.getState().addNotification(invalidPayload);
    expect(added).toBe(false);
  });

  it("routes notification response with ACCEPT_ORDER action to deep link", () => {
    const navigateMock = vi.fn();
    const fakeResponse = {
      actionIdentifier: ACTION_ACCEPT_ORDER,
      notification: {
        request: {
          content: {
            data: {
              orderId: "ord_accept_test",
            },
          },
        },
      },
    } as unknown as Parameters<typeof handleNotificationResponse>[0];

    const handled = handleNotificationResponse(fakeResponse, navigateMock);
    expect(handled).toBe(true);
    expect(navigateMock).toHaveBeenCalledWith("/orders/ord_accept_test?action=accept");
  });
});
