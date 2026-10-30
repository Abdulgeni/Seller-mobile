import { z } from "zod";

export const MessageSenderSchema = z.enum(["seller", "customer"]);
export type MessageSender = z.infer<typeof MessageSenderSchema>;

export const MessageDeliveryStatusSchema = z.enum([
  "sending",
  "sent",
  "delivered",
]);
export type MessageDeliveryStatus = z.infer<typeof MessageDeliveryStatusSchema>;

export const CustomerMessageSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  sender: MessageSenderSchema,
  text: z.string().min(1),
  timestamp: z.string(),
  status: MessageDeliveryStatusSchema.default("delivered"),
});
export type CustomerMessage = z.infer<typeof CustomerMessageSchema>;

export const SendMessageRequestSchema = z.object({
  orderId: z.string(),
  text: z.string().min(1),
  idempotencyKey: z.string(),
});
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const CannedResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  template: z.string(),
});
export type CannedResponse = z.infer<typeof CannedResponseSchema>;
