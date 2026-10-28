import { z } from "zod";
import { IsoDateTimeSchema } from "./common";

export const NotificationCategorySchema = z.enum(["NEW_ORDER", "PAYMENT_RECEIVED", "SYSTEM_ALERT"]);

export const NotificationActionSchema = z.enum(["ACCEPT_ORDER", "VIEW_ORDER", "DISMISS"]);

export const PushNotificationPayloadSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  category: NotificationCategorySchema,
  data: z.object({
    orderId: z.string().optional(),
    action: NotificationActionSchema.optional(),
    deepLink: z.string().optional(),
  }),
  receivedAt: IsoDateTimeSchema,
  read: z.boolean().default(false),
});

export const DeepLinkParamsSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["accept", "view"]).optional(),
});

export const RegisterFcmTokenRequestSchema = z.object({
  token: z.string().min(1),
  devicePlatform: z.enum(["android", "ios", "simulator"]),
  appVersion: z.string().min(1),
});

export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;
export type NotificationAction = z.infer<typeof NotificationActionSchema>;
export type PushNotificationPayload = z.infer<typeof PushNotificationPayloadSchema>;
export type DeepLinkParams = z.infer<typeof DeepLinkParamsSchema>;
export type RegisterFcmTokenRequest = z.infer<typeof RegisterFcmTokenRequestSchema>;
