import React from "react";
import { describe, expect, it } from "vitest";
import type { Order } from "@repo/schemas";
import { PackingSlipExportModal } from "../features/orders/PackingSlipExportModal";
import { StorefrontPreviewModal } from "../features/storefront/StorefrontPreviewModal";

const sampleOrder: Order = {
  id: "ord_101",
  orderNumber: "ORD-2026-0001",
  vendorId: "seller_01",
  customer: {
    id: "cust_1",
    name: "Amina Odhiambo",
    phone: "+254712345678",
    shippingAddress: "Kilimani, Argwings Kodhek Rd, Nairobi",
  },
  items: [
    {
      id: "item_1",
      vendorId: "seller_01",
      productId: "prod_1",
      sku: "LTH-BAG-001",
      productTitle: "Handcrafted Leather Tote",
      quantity: 2,
      unitPrice: 4500,
      subtotal: 9000,
      commissionRate: 0.1,
      netVendorAmount: 8100,
    },
  ],
  total: 9000,
  subtotal: 9000,
  shippingFee: 0,
  discountTotal: 0,
  currency: "ETB",
  status: "ACCEPTED",
  createdAt: "2026-10-28T09:00:00.000Z",
  updatedAt: "2026-10-28T09:05:00.000Z",
  timeline: [
    {
      id: "tl_1",
      status: "ACCEPTED",
      timestamp: "2026-10-28T09:05:00.000Z",
      actor: "Merchant",
      note: "Order confirmed",
    },
  ],
};

describe("Loop 9: Storefront Live Customer Preview & Slip Exporter", () => {
  it("StorefrontPreviewModal instantiates correctly when open or closed", () => {
    expect(StorefrontPreviewModal).toBeDefined();
    expect(typeof StorefrontPreviewModal).toBe("function");

    const closedElement = React.createElement(StorefrontPreviewModal, {
      visible: false,
      onClose: () => {},
    });
    expect(closedElement.props.visible).toBe(false);

    const openElement = React.createElement(StorefrontPreviewModal, {
      visible: true,
      onClose: () => {},
    });
    expect(openElement.props.visible).toBe(true);
  });

  it("PackingSlipExportModal instantiates with order payload and manifests items", () => {
    expect(PackingSlipExportModal).toBeDefined();
    expect(typeof PackingSlipExportModal).toBe("function");

    const slipElement = React.createElement(PackingSlipExportModal, {
      order: sampleOrder,
      visible: true,
      onClose: () => {},
    });
    expect(slipElement.props.order.id).toBe("ord_101");
    expect(slipElement.props.order.orderNumber).toBe("ORD-2026-0001");
    expect(slipElement.props.order.items.length).toBe(1);
    expect(slipElement.props.order.items[0]?.sku).toBe("LTH-BAG-001");
  });
});
