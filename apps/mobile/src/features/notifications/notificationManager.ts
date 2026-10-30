import { defaultApiClient } from "@repo/api";
import { logger } from "@repo/ui";
import type * as NotificationsType from "expo-notifications";
import { Platform } from "react-native";
import { parseAndValidateDeepLink } from "./deepLinks";
import { useNotificationStore } from "./notificationStore";

function getExpoNotifications(): typeof NotificationsType | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as typeof NotificationsType;
  } catch {
    return null;
  }
}

export const NOTIFICATION_CATEGORY_NEW_ORDER = "NEW_ORDER";
export const ACTION_ACCEPT_ORDER = "ACCEPT_ORDER";
export const ACTION_VIEW_ORDER = "VIEW_ORDER";

/**
 * Initializes notification handlers, action categories, and FCM token registration.
 */
export async function initializeNotifications(): Promise<void> {
  try {
    const Notifications = getExpoNotifications();
    if (!Notifications) {
      logger.info("Expo notifications native module not available (e.g. running in Expo Go). Falling back to in-app notification harness.");
      return;
    }

    // 1. Configure foreground notification presentation behavior
    if (typeof Notifications.setNotificationHandler === "function") {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }

    // 2. Register interactive action categories
    if (typeof Notifications.setNotificationCategoryAsync === "function") {
      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY_NEW_ORDER, [
        {
          identifier: ACTION_ACCEPT_ORDER,
          buttonTitle: "Accept Order",
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: ACTION_VIEW_ORDER,
          buttonTitle: "View Order",
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    }

    // 3. Register push token if available
    await registerDeviceToken();
  } catch (err: unknown) {
    logger.warn("Notification initialization fallback or error", { err });
  }
}

/**
 * Requests permissions and registers FCM token with the backend.
 */
export async function registerDeviceToken(): Promise<string | null> {
  try {
    const Notifications = getExpoNotifications();
    const platform = Platform.OS === "android" ? "android" : Platform.OS === "ios" ? "ios" : "simulator";

    if (!Notifications || typeof Notifications.getPermissionsAsync !== "function") {
      logger.info("Push notification native module not available; registering mock dev token", { platform });
      await defaultApiClient.registerPushToken({
        token: "mock_fcm_token_dev_simulator",
        devicePlatform: platform,
        appVersion: "1.0.0",
      });
      return "mock_fcm_token_dev_simulator";
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted" && typeof Notifications.requestPermissionsAsync === "function") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      logger.info("Push notification permission not granted");
      return null;
    }

    let token = "mock_fcm_token_dev_simulator";
    if (typeof Notifications.getExpoPushTokenAsync === "function") {
      const tokenResponse = await Notifications.getExpoPushTokenAsync().catch(() => null);
      if (tokenResponse?.data) {
        token = tokenResponse.data;
      }
    }

    await defaultApiClient.registerPushToken({
      token,
      devicePlatform: platform,
      appVersion: "1.0.0",
    });

    logger.info("Push token successfully registered with backend", { platform });
    return token;
  } catch (err: unknown) {
    logger.warn("Failed to register push token", { err });
    return null;
  }
}

/**
 * Handles notification response (action click or banner tap) with strict deep-link validation.
 */
export function handleNotificationResponse(
  response: NotificationsType.NotificationResponse,
  navigateFn: (route: string) => void
): boolean {
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  const actionIdentifier = response.actionIdentifier;

  const orderId = typeof data?.["orderId"] === "string" ? data["orderId"] : undefined;
  if (!orderId) {
    logger.warn("Notification response missing orderId", { data });
    return false;
  }

  // Map notification action to deep link action
  let actionParam = "view";
  if (actionIdentifier === ACTION_ACCEPT_ORDER || data?.["action"] === "ACCEPT_ORDER") {
    actionParam = "accept";
  }

  const rawDeepLink = `seller://orders/${orderId}?action=${actionParam}`;
  const parsed = parseAndValidateDeepLink(rawDeepLink);

  if (!parsed.valid || !parsed.targetRoute) {
    logger.error("Failed to route notification response via deep link", parsed.error);
    return false;
  }

  navigateFn(parsed.targetRoute);
  return true;
}

/**
 * Simulates an incoming new order push notification for development and testing.
 */
export async function simulateIncomingNewOrder(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
}): Promise<void> {
  const payload = {
    id: `notif_${Date.now()}`,
    title: `New Order #${order.orderNumber}`,
    body: `${order.customerName} placed an order for KES ${order.total.toLocaleString()}`,
    category: "NEW_ORDER" as const,
    data: {
      orderId: order.id,
      action: "VIEW_ORDER" as const,
      deepLink: `seller://orders/${order.id}`,
    },
    receivedAt: new Date().toISOString(),
    read: false,
  };

  useNotificationStore.getState().addNotification(payload);

  const Notifications = getExpoNotifications();
  if (Notifications && typeof Notifications.scheduleNotificationAsync === "function") {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          categoryIdentifier: NOTIFICATION_CATEGORY_NEW_ORDER,
          data: payload.data,
        },
        trigger: null, // deliver immediately
      });
    } catch (err: unknown) {
      logger.info("Local notification simulation dispatched to in-memory store", { err });
    }
  }
}
