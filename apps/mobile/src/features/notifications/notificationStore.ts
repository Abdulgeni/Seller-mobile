import {
  PushNotificationPayloadSchema,
  type PushNotificationPayload,
} from "@repo/schemas";
import { create } from "zustand";

export interface NotificationState {
  notifications: PushNotificationPayload[];
  unreadCount: number;
  addNotification: (payload: unknown) => boolean;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (rawPayload: unknown): boolean => {
    const parseResult = PushNotificationPayloadSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      return false;
    }

    const payload = parseResult.data;
    set((state) => ({
      notifications: [payload, ...state.notifications],
      unreadCount: state.unreadCount + (payload.read ? 0 : 1),
    }));
    return true;
  },

  markAsRead: (id: string) => {
    set((state) => {
      let decrement = 0;
      const updated = state.notifications.map((n) => {
        if (n.id === id && !n.read) {
          decrement = 1;
          return { ...n, read: true };
        }
        return n;
      });

      return {
        notifications: updated,
        unreadCount: Math.max(0, state.unreadCount - decrement),
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
