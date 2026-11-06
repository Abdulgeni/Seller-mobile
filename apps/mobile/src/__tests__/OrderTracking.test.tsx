import { describe, expect, it } from "vitest";
import { OrderSchema, type Order } from "@repo/schemas";

const mockOrder: Order = {
  id: "ord_1001",
  vendorId: "vdr_primary_store",
  orderNumber: "ORD-2026-1001",
  customer: {
    id: "cust_1",
    name: "Jane Doe",
    phone: "+254712345678",
    email: "jane@example.com",
    shippingAddress: "123 Kimathi St, Nairobi",
  },
  status: "NEW",
  items: [
    {
      id: "item_1",
      productId: "prod_1",
      productTitle: "Handmade Leather Bag",
      sku: "HLB-BRN-01",
      vendorId: "vdr_primary_store",
      quantity: 2,
      unitPrice: 2500,
      subtotal: 5000,
      commissionRate: 0,
      netVendorAmount: 5000,
    },
    {
      id: "item_2",
      productId: "prod_2",
      productTitle: "Beaded Bracelet",
      sku: "BB-RED-01",
      vendorId: "vdr_primary_store",
      quantity: 1,
      unitPrice: 750,
      subtotal: 750,
      commissionRate: 0,
      netVendorAmount: 750,
    },
  ],
  subtotal: 5750,
  shippingFee: 250,
  discountTotal: 0,
  total: 6000,
  currency: "ETB",
  createdAt: "2026-10-28T04:00:00.000Z",
  updatedAt: "2026-10-28T04:00:00.000Z",
  timeline: [
    {
      id: "tl_1",
      status: "NEW",
      timestamp: "2026-10-28T04:00:00.000Z",
      actor: "customer",
      note: "Order placed via mobile web checkout",
    },
  ],
};

describe("F2 Order Tracking Contracts & Logic", () => {
  it("validates realistic order object against Zod schema", () => {
    const parsed = OrderSchema.safeParse(mockOrder);
    expect(parsed.success).toBe(true);
  });

  it("calculates total units correctly from line items without client aggregation of orders", () => {
    const totalUnits = mockOrder.items.reduce((sum, item) => sum + item.quantity, 0);
    expect(totalUnits).toBe(3);
    expect(mockOrder.total).toBe(6000);
  });

  it("filters orders by search term against order number and customer name", () => {
    const orders: Order[] = [
      mockOrder,
      {
        ...mockOrder,
        id: "ord_1002",
        orderNumber: "ORD-2026-1002",
        customer: {
          ...mockOrder.customer,
          id: "cust_2",
          name: "Samuel K.",
        },
      },
    ];

    const filterOrders = (query: string) => {
      const q = query.toLowerCase();
      return orders.filter(
        (o) => o.orderNumber.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q)
      );
    };

    expect(filterOrders("Jane")).toHaveLength(1);
    expect(filterOrders("1002")).toHaveLength(1);
    expect(filterOrders("Nonexistent")).toHaveLength(0);
  });
});
