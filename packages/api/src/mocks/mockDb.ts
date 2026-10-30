import {
  generateSeedDashboardMetrics,
  generateSeedOrders,
  generateSeedProducts,
  generateSeedTransactions,
} from "./fixtures";
import {
  canTransitionOrder,
  type CustomerMessage,
  type Order,
  type OrderStatus,
  type PaymentInitiationRequest,
  type PaymentTransaction,
  type Product,
} from "@repo/schemas";

export interface MockDbState {
  products: Product[];
  orders: Order[];
  dashboard: ReturnType<typeof generateSeedDashboardMetrics>;
  transactions: PaymentTransaction[];
  messages: Record<string, CustomerMessage[]>;
  idempotencyLog: Map<string, { status: number; body: Record<string, unknown> | Array<unknown> }>;
}

export const mockDb: MockDbState = {
  products: generateSeedProducts(5000),
  orders: generateSeedOrders(),
  dashboard: generateSeedDashboardMetrics(),
  transactions: generateSeedTransactions(),
  messages: {
    ord_1: [
      {
        id: "msg_1",
        orderId: "ord_1",
        sender: "customer",
        text: "Jambo! Could you please let me know if this order can be dispatched today?",
        timestamp: "2026-10-28T09:30:00.000Z",
        status: "delivered",
      },
    ],
  },
  idempotencyLog: new Map(),
};

export function resetMockDb(): void {
  mockDb.products = generateSeedProducts(5000);
  mockDb.orders = generateSeedOrders();
  mockDb.dashboard = generateSeedDashboardMetrics();
  mockDb.transactions = generateSeedTransactions();
  mockDb.messages = {
    ord_1: [
      {
        id: "msg_1",
        orderId: "ord_1",
        sender: "customer",
        text: "Jambo! Could you please let me know if this order can be dispatched today?",
        timestamp: "2026-10-28T09:30:00.000Z",
        status: "delivered",
      },
    ],
  };
  mockDb.idempotencyLog.clear();
}

export async function simulateMockLatency(): Promise<void> {
  const failureRate = Number(process.env["MOCK_FAILURE_RATE"] ?? "0");
  if (failureRate > 0 && Math.random() < failureRate) {
    throw new Error("Simulated network fault (FAULT_INJECTED)");
  }
  const latency = Math.floor(Math.random() * (400 - 150 + 1)) + 150;
  await new Promise((resolve) => setTimeout(resolve, latency));
}

export function handleMockRoute(
  endpoint: string,
  options: RequestInit = {}
): { status: number; body: Record<string, unknown> | Array<unknown> } {
  const method = (options.method ?? "GET").toUpperCase();
  const urlObj = new URL(`http://localhost${endpoint}`);
  const pathname = urlObj.pathname;
  const headers = (options.headers ?? {}) as Record<string, string>;
  const idempotencyKey =
    headers["Idempotency-Key"] ??
    headers["idempotency-key"] ??
    headers["IDEMPOTENCY-KEY"];

  if (idempotencyKey && mockDb.idempotencyLog.has(idempotencyKey)) {
    const cached = mockDb.idempotencyLog.get(idempotencyKey)!;
    return {
      status: cached.status,
      body: JSON.parse(JSON.stringify(cached.body)) as Record<string, unknown> | Array<unknown>,
    };
  }

  // 1. Dashboard KPIs
  if (pathname === "/dashboard/kpis" && method === "GET") {
    return { status: 200, body: mockDb.dashboard };
  }

  // 2. Products List
  if (pathname === "/products" && method === "GET") {
    const category = urlObj.searchParams.get("category");
    const search = urlObj.searchParams.get("search")?.toLowerCase();
    const inStock = urlObj.searchParams.get("inStock");

    let filtered = mockDb.products;
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(search));
    }
    if (inStock !== null && inStock !== undefined) {
      filtered = filtered.filter((p) => String(p.inStock) === inStock);
    }
    return { status: 200, body: filtered };
  }

  // 3. Products Create
  if (pathname === "/products" && method === "POST") {
    const draft = JSON.parse((options.body as string) || "{}") as Record<string, unknown>;
    const title = typeof draft["title"] === "string" ? draft["title"] : "Untitled Product";
    const description = typeof draft["description"] === "string" ? draft["description"] : "";
    const category = typeof draft["category"] === "string" ? (draft["category"] as Product["category"]) : "General";
    const price = typeof draft["price"] === "number" ? draft["price"] : 100;
    const stockCount = typeof draft["stockCount"] === "number" ? draft["stockCount"] : 0;
    const images = Array.isArray(draft["images"]) ? (draft["images"] as Product["images"]) : [];
    const variants = Array.isArray(draft["variants"]) ? (draft["variants"] as Product["variants"]) : [];
    const tags = Array.isArray(draft["tags"]) ? (draft["tags"] as string[]) : [];

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      vendorId: "vdr_primary_store",
      title,
      description,
      category,
      price,
      currency: "KES",
      inStock: stockCount > 0,
      stockCount,
      images,
      variants,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDb.products.unshift(newProduct);
    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 201,
        body: JSON.parse(JSON.stringify(newProduct)) as Record<string, unknown>,
      });
    }
    return { status: 201, body: newProduct };
  }

  // 4. Product Stock Toggle
  const stockMatch = pathname.match(/^\/products\/([^/]+)\/stock$/);
  if (stockMatch && method === "PATCH") {
    const productId = stockMatch[1]!;
    const product = mockDb.products.find((p) => p.id === productId);
    if (!product) return { status: 404, body: { message: "Product not found" } };

    const body = JSON.parse((options.body as string) || "{}") as { inStock: boolean };
    product.inStock = body.inStock;
    product.updatedAt = new Date().toISOString();

    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 200,
        body: JSON.parse(JSON.stringify(product)) as Record<string, unknown>,
      });
    }
    return { status: 200, body: product };
  }

  // 5. Product Price Edit
  const priceMatch = pathname.match(/^\/products\/([^/]+)\/price$/);
  if (priceMatch && method === "PATCH") {
    const productId = priceMatch[1]!;
    const product = mockDb.products.find((p) => p.id === productId);
    if (!product) return { status: 404, body: { message: "Product not found" } };

    const body = JSON.parse((options.body as string) || "{}") as { price: number };
    product.price = body.price;
    product.updatedAt = new Date().toISOString();

    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 200,
        body: JSON.parse(JSON.stringify(product)) as Record<string, unknown>,
      });
    }
    return { status: 200, body: product };
  }

  // 6. Product Detail
  const productDetailMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productDetailMatch && method === "GET") {
    const productId = productDetailMatch[1]!;
    const product = mockDb.products.find((p) => p.id === productId);
    if (!product) return { status: 404, body: { message: "Product not found" } };
    return { status: 200, body: product };
  }

  // 7. AI Suggest
  if (pathname === "/products/ai-suggest" && method === "POST") {
    const body = JSON.parse((options.body as string) || "{}") as { imageHash?: string };
    const hash = body.imageHash ?? "default";
    const charCode = hash.charCodeAt(0) || 65;

    const suggestions = [
      { title: "Safari Canvas Backpack", category: "Accessories", tags: ["travel", "canvas", "vintage"] },
      { title: "Maasai Beaded Leather Sandals", category: "Footwear", tags: ["handmade", "leather", "traditional"] },
      { title: "Kitenge Print Casual Shirt", category: "Apparel", tags: ["cotton", "afrocentric", "casual"] },
      { title: "Handcrafted Soapstone Bowl", category: "Home & Living", tags: ["craft", "decor", "natural"] },
    ] as const;

    const chosen = suggestions[charCode % suggestions.length]!;
    return {
      status: 200,
      body: {
        suggestedTitle: chosen.title,
        suggestedCategory: chosen.category,
        suggestedTags: [...chosen.tags],
        confidence: 0.94,
      },
    };
  }

  // 8. Orders List
  if (pathname === "/orders" && method === "GET") {
    const status = urlObj.searchParams.get("status");
    const search = urlObj.searchParams.get("search")?.toLowerCase();
    const startDate = urlObj.searchParams.get("startDate");

    let filtered = mockDb.orders;
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customer.name.toLowerCase().includes(search)
      );
    }
    if (startDate) {
      filtered = filtered.filter((o) => new Date(o.createdAt) >= new Date(startDate));
    }
    return { status: 200, body: filtered };
  }

  // 9. Order Transition
  const orderTransMatch = pathname.match(/^\/orders\/([^/]+)\/transition$/);
  if (orderTransMatch && method === "POST") {
    const orderId = orderTransMatch[1]!;
    const order = mockDb.orders.find((o) => o.id === orderId);
    if (!order) return { status: 404, body: { message: "Order not found" } };

    const body = JSON.parse((options.body as string) || "{}") as { toStatus: OrderStatus; note?: string };
    const prevStatus = order.status;

    if (!canTransitionOrder(prevStatus, body.toStatus)) {
      return {
        status: 400,
        body: {
          message: `Cannot transition order from ${prevStatus} to ${body.toStatus}`,
          code: "INVALID_TRANSITION",
        },
      };
    }

    order.status = body.toStatus;
    order.updatedAt = new Date().toISOString();
    order.timeline.push({
      id: `tl_${Date.now()}`,
      status: body.toStatus,
      timestamp: new Date().toISOString(),
      actor: "Merchant Store App",
      note: body.note ?? `Transitioned from ${prevStatus} to ${body.toStatus}`,
    });

    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 200,
        body: JSON.parse(JSON.stringify(order)) as Record<string, unknown>,
      });
    }
    return { status: 200, body: order };
  }

  // 10. Order Detail
  const orderDetailMatch = pathname.match(/^\/orders\/([^/]+)$/);
  if (orderDetailMatch && method === "GET") {
    const orderId = orderDetailMatch[1]!;
    const order = mockDb.orders.find((o) => o.id === orderId);
    if (!order) return { status: 404, body: { message: "Order not found" } };
    return { status: 200, body: order };
  }

  // 11. Payments STK Push
  if (pathname === "/payments/stk-push" && method === "POST") {
    const req = JSON.parse((options.body as string) || "{}") as PaymentInitiationRequest;

    let simulatedState: PaymentTransaction["state"] = "PENDING";
    let failureReason: PaymentTransaction["failureReason"] | undefined;

    if (req.customerPhone.endsWith("0000")) {
      simulatedState = "FAILED";
      failureReason = "INSUFFICIENT_FUNDS";
    } else if (req.customerPhone.endsWith("9999")) {
      simulatedState = "CANCELLED";
      failureReason = "USER_CANCELLED";
    } else if (req.customerPhone.endsWith("8888")) {
      simulatedState = "TIMEOUT";
      failureReason = "TIMEOUT";
    }

    const transaction: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      orderId: req.orderId,
      vendorId: req.vendorId,
      amount: req.amount,
      currency: "KES",
      customerPhone: req.customerPhone,
      state: simulatedState,
      ...(failureReason ? { failureReason } : {}),
      providerReference: undefined,
      idempotencyKey: req.idempotencyKey,
      checkoutRequestId: `ws_CO_${Date.now()}`,
      initiatedAt: new Date().toISOString(),
      ...(simulatedState !== "PENDING" ? { completedAt: new Date().toISOString() } : {}),
    };

    mockDb.transactions.unshift(transaction);
    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 200,
        body: JSON.parse(JSON.stringify(transaction)) as Record<string, unknown>,
      });
    }
    return { status: 200, body: transaction };
  }

  // 12. Payment Status
  const paymentStatusMatch = pathname.match(/^\/payments\/transactions\/([^/]+)$/);
  if (paymentStatusMatch && method === "GET") {
    const txId = paymentStatusMatch[1]!;
    const tx = mockDb.transactions.find((t) => t.id === txId);
    if (!tx) return { status: 404, body: { message: "Transaction not found" } };

    if (tx.state === "PENDING") {
      tx.state = "SUCCESS";
      tx.providerReference = `MPESA_${Date.now()}`;
      tx.receiptNumber = `REC-${Date.now()}`;
      tx.completedAt = new Date().toISOString();
    }
    return { status: 200, body: tx };
  }

  // 13. FCM Token
  if (pathname === "/notifications/fcm-token" && method === "POST") {
    return { status: 200, body: { success: true } };
  }

  // 14. Insights 2.0 Pre-aggregated Overview
  if (pathname === "/insights/overview" && method === "GET") {
    return {
      status: 200,
      body: {
        depletionForecasts: [
          {
            productId: "prod_1",
            title: "Maasai Beaded Leather Sandals",
            category: "Footwear",
            currentStock: 6,
            dailyVelocity: 2.1,
            daysUntilStockout: 3,
            urgency: "critical",
          },
          {
            productId: "prod_2",
            title: "Hand-Woven Sisal Kiondo Bag",
            category: "Accessories",
            currentStock: 14,
            dailyVelocity: 1.8,
            daysUntilStockout: 8,
            urgency: "warning",
          },
          {
            productId: "prod_3",
            title: "Pure Raw Acacia Honey 500g",
            category: "General",
            currentStock: 45,
            dailyVelocity: 1.2,
            daysUntilStockout: 38,
            urgency: "healthy",
          },
        ],
        revenueMargin: {
          grossRevenue: 428500,
          estimatedFees: 6428,
          netPayout: 422072,
          currency: "KES",
          marginPercent: 98.5,
        },
        sparklineData: [
          { date: "2026-10-22", label: "Wed", value: 38000 },
          { date: "2026-10-23", label: "Thu", value: 54000 },
          { date: "2026-10-24", label: "Fri", value: 72000 },
          { date: "2026-10-25", label: "Sat", value: 91000 },
          { date: "2026-10-26", label: "Sun", value: 43000 },
          { date: "2026-10-27", label: "Mon", value: 65000 },
          { date: "2026-10-28", label: "Tue", value: 65500 },
        ],
      },
    };
  }

  // 15. Order Messages GET
  const orderMessagesGetMatch = pathname.match(/^\/orders\/([^/]+)\/messages$/);
  if (orderMessagesGetMatch && method === "GET") {
    const orderId = orderMessagesGetMatch[1]!;
    const msgs = mockDb.messages[orderId] ?? [];
    return { status: 200, body: msgs };
  }

  // 16. Order Messages POST
  if (orderMessagesGetMatch && method === "POST") {
    const orderId = orderMessagesGetMatch[1]!;
    const body = JSON.parse((options.body as string) || "{}") as { text: string };
    const newMsg: CustomerMessage = {
      id: `msg_${Date.now()}`,
      orderId,
      sender: "seller",
      text: body.text,
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    if (!mockDb.messages[orderId]) {
      mockDb.messages[orderId] = [];
    }
    mockDb.messages[orderId].push(newMsg);
    return { status: 200, body: newMsg };
  }

  return { status: 404, body: { message: `Not Found: ${endpoint}` } };
}
