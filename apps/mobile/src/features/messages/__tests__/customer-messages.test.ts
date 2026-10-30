import React from "react";
import { describe, expect, it } from "vitest";
import { defaultApiClient } from "@repo/api";
import { CustomerMessageSchema } from "@repo/schemas";
import { CustomerMessagesModal } from "../CustomerMessagesModal";

describe("Loop 7: Customer Messages & Inquiry Thread", () => {
  it("fetches order messages matching schema", async () => {
    const msgs = await defaultApiClient.getOrderMessages("ord_1");
    expect(msgs.length).toBeGreaterThan(0);
    const parsed = CustomerMessageSchema.parse(msgs[0]);
    expect(parsed.orderId).toBe("ord_1");
    expect(parsed.sender).toBe("customer");
  });

  it("sends seller message and receives delivered confirmation", async () => {
    const sent = await defaultApiClient.sendMessage({
      orderId: "ord_1",
      text: "We have securely packed your items and will dispatch shortly.",
      idempotencyKey: "test_msg_key_1",
    });

    expect(sent.orderId).toBe("ord_1");
    expect(sent.sender).toBe("seller");
    expect(sent.status).toBe("delivered");
    expect(sent.text).toContain("securely packed");

    const all = await defaultApiClient.getOrderMessages("ord_1");
    expect(all.some((m) => m.id === sent.id)).toBe(true);
  });

  it("CustomerMessagesModal exports valid component definition", () => {
    expect(CustomerMessagesModal).toBeDefined();
    expect(typeof CustomerMessagesModal).toBe("function");

    const element = React.createElement(CustomerMessagesModal, {
      visible: true,
      order: null,
      onClose: () => {},
    });
    expect(element).toBeDefined();
  });
});
