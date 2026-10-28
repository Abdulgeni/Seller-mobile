import type {
  DashboardKpiMetrics,
  Order,
  OrderStatus,
  PaymentTransaction,
  Product,
} from "@repo/schemas";

const CATEGORIES = [
  "Apparel",
  "Footwear",
  "Accessories",
  "Electronics",
  "Home & Living",
  "Beauty & Personal Care",
  "General",
] as const;

export function generateSeedProducts(count = 5000): Product[] {
  const products: Product[] = [];
  const baseTimestamp = new Date("2026-10-01T08:00:00Z").getTime();

  for (let i = 1; i <= count; i++) {
    const id = `prod_${i}`;
    const category = CATEGORIES[(i - 1) % CATEGORIES.length] ?? "General";
    const price = 500 + ((i * 37) % 9500);
    const inStock = i % 11 !== 0; // ~90% in stock
    const stockCount = inStock ? 5 + (i % 85) : 0;
    const createdAt = new Date(baseTimestamp + i * 60000).toISOString();

    products.push({
      id,
      vendorId: "vdr_primary_store",
      title: `${category} Item #${i}`,
      description: `High-quality ${category.toLowerCase()} crafted for discerning merchants. SKU item ${i}.`,
      category,
      price,
      currency: "KES",
      inStock,
      stockCount,
      images: [
        {
          id: `img_${i}_1`,
          uri: `https://picsum.photos/seed/${i}/800/800`,
          thumbnailUri: `https://picsum.photos/seed/${i}/200/200`,
          isCover: true,
          order: 0,
          fileSizeBytes: 120 * 1024,
          width: 800,
          height: 800,
        },
      ],
      variants: [
        {
          id: `var_${i}_1`,
          sku: `SKU-${i}-S`,
          size: "S",
          color: "Standard",
          priceOffset: 0,
          stock: Math.floor(stockCount / 2),
        },
        {
          id: `var_${i}_2`,
          sku: `SKU-${i}-L`,
          size: "L",
          color: "Standard",
          priceOffset: 150,
          stock: Math.ceil(stockCount / 2),
        },
      ],
      tags: [category.toLowerCase(), "featured", `batch-${(i % 10) + 1}`],
      createdAt,
      updatedAt: createdAt,
    });
  }
  return products;
}

export function generateSeedOrders(): Order[] {
  const statuses: OrderStatus[] = ["NEW", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
  const orders: Order[] = [];
  const now = new Date("2026-10-27T10:00:00Z").getTime();

  for (let i = 1; i <= 30; i++) {
    const status = statuses[(i - 1) % statuses.length] ?? "NEW";
    const orderNumber = `ORD-${2026000 + i}`;
    const subtotal = 1200 + (i * 450);
    const shippingFee = 250;
    const total = subtotal + shippingFee;
    const createdDate = new Date(now - i * 3600 * 1000 * 4).toISOString();

    orders.push({
      id: `ord_${i}`,
      orderNumber,
      vendorId: "vdr_primary_store",
      customer: {
        id: `cust_${i}`,
        name: `Merchant Customer ${i}`,
        phone: `+254712${String(100000 + i).padStart(6, "0")}`,
        email: `customer${i}@example.com`,
        shippingAddress: `Plot ${i * 4}, Nairobi Central Business District`,
      },
      status,
      items: [
        {
          id: `item_${i}_1`,
          productId: `prod_${(i % 50) + 1}`,
          productTitle: `Apparel Item #${(i % 50) + 1}`,
          sku: `SKU-${(i % 50) + 1}-S`,
          vendorId: "vdr_primary_store",
          quantity: 2,
          unitPrice: Math.floor(subtotal / 2),
          subtotal,
          commissionRate: 0.0,
          netVendorAmount: subtotal,
        },
      ],
      currency: "KES",
      subtotal,
      shippingFee,
      discountTotal: 0,
      total,
      timeline: [
        {
          id: `tl_${i}_1`,
          status: "NEW",
          timestamp: createdDate,
          actor: "Customer Web Checkout",
          note: "Order placed online",
        },
        ...(status !== "NEW"
          ? [
              {
                id: `tl_${i}_2`,
                status,
                timestamp: new Date(now - i * 3600 * 1000 * 2).toISOString(),
                actor: "Merchant Store App",
                note: `Transitioned to ${status}`,
              },
            ]
          : []),
      ],
      createdAt: createdDate,
      updatedAt: createdDate,
    });
  }

  return orders;
}

export function generateSeedDashboardMetrics(): DashboardKpiMetrics {
  return {
    vendorId: "vdr_primary_store",
    revenueToday: 148500,
    revenueYesterday: 121000,
    revenueChangePercent: 22.7,
    ordersTodayCount: 24,
    ordersPendingAcceptanceCount: 5,
    lowStockItemsCount: 8,
    pendingPayoutAmount: 89400,
    currency: "KES",
    revenue7DaysSeries: [
      { date: "2026-10-21", label: "Wed", revenue: 95000, orderCount: 14 },
      { date: "2026-10-22", label: "Thu", revenue: 112000, orderCount: 18 },
      { date: "2026-10-23", label: "Fri", revenue: 135000, orderCount: 21 },
      { date: "2026-10-24", label: "Sat", revenue: 178000, orderCount: 29 },
      { date: "2026-10-25", label: "Sun", revenue: 142000, orderCount: 22 },
      { date: "2026-10-26", label: "Mon", revenue: 121000, orderCount: 19 },
      { date: "2026-10-27", label: "Tue", revenue: 148500, orderCount: 24 },
    ],
    lastAggregatedAt: new Date("2026-10-27T10:00:00Z").toISOString(),
  };
}

export function generateSeedTransactions(): PaymentTransaction[] {
  return [
    {
      id: "tx_1",
      orderId: "ord_1",
      vendorId: "vdr_primary_store",
      amount: 1900,
      currency: "KES",
      customerPhone: "+254712000001",
      state: "SUCCESS",
      providerReference: "QK789XYZ12",
      idempotencyKey: "8f5a6b12-9c34-4d67-8e9a-112233445566",
      checkoutRequestId: "ws_CO_27102026_1",
      initiatedAt: "2026-10-27T08:15:00Z",
      completedAt: "2026-10-27T08:15:32Z",
      receiptNumber: "QK789XYZ12",
    },
  ];
}
