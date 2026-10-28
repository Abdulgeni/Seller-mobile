import {
  generateSeedDashboardMetrics,
  generateSeedOrders,
  generateSeedProducts,
  generateSeedTransactions,
} from "./fixtures";
import { delay, http, HttpResponse } from "msw";
import type {
  Order,
  OrderStatus,
  PaymentTransaction,
  Product,
} from "@repo/schemas";

// In-memory mock database state
const mockDb = {
  products: generateSeedProducts(5000),
  orders: generateSeedOrders(),
  dashboard: generateSeedDashboardMetrics(),
  transactions: generateSeedTransactions(),
  idempotencyLog: new Map<string, { status: number; body: Record<string, unknown> | Array<unknown> }>(),
};

export function resetMockDb(): void {
  mockDb.products = generateSeedProducts(5000);
  mockDb.orders = generateSeedOrders();
  mockDb.dashboard = generateSeedDashboardMetrics();
  mockDb.transactions = generateSeedTransactions();
  mockDb.idempotencyLog.clear();
}

async function simulateNetworkConditions(): Promise<void> {
  const failureRate = Number(process.env["MOCK_FAILURE_RATE"] ?? "0");
  if (failureRate > 0 && Math.random() < failureRate) {
    throw new HttpResponse(JSON.stringify({ message: "Injected network fault", code: "FAULT_INJECTED" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  const latency = Math.floor(Math.random() * (600 - 150 + 1)) + 150;
  await delay(latency);
}

export const handlers = [
  // Dashboard
  http.get("*/dashboard/kpis", async () => {
    await simulateNetworkConditions();
    return HttpResponse.json(mockDb.dashboard);
  }),

  // Products List
  http.get("*/products", async ({ request }) => {
    await simulateNetworkConditions();
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search")?.toLowerCase();
    const inStock = url.searchParams.get("inStock");

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

    return HttpResponse.json(filtered);
  }),

  // Product Detail
  http.get("*/products/:id", async ({ params }) => {
    await simulateNetworkConditions();
    const { id } = params;
    const product = mockDb.products.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json({ message: "Product not found", code: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  // Toggle Stock (Optimistic mutation endpoint)
  http.patch("*/products/:id/stock", async ({ params, request }) => {
    await simulateNetworkConditions();
    const { id } = params;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (idempotencyKey && mockDb.idempotencyLog.has(idempotencyKey)) {
      const cached = mockDb.idempotencyLog.get(idempotencyKey)!;
      return HttpResponse.json(cached.body, { status: cached.status });
    }

    const product = mockDb.products.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json({ message: "Product not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const body = (await request.json()) as { inStock: boolean };
    product.inStock = body.inStock;
    product.updatedAt = new Date().toISOString();

    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 200,
        body: product as unknown as Record<string, unknown>,
      });
    }

    return HttpResponse.json(product);
  }),

  // Edit Price (Optimistic mutation endpoint)
  http.patch("*/products/:id/price", async ({ params, request }) => {
    await simulateNetworkConditions();
    const { id } = params;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (idempotencyKey && mockDb.idempotencyLog.has(idempotencyKey)) {
      const cached = mockDb.idempotencyLog.get(idempotencyKey)!;
      return HttpResponse.json(cached.body, { status: cached.status });
    }

    const product = mockDb.products.find((p) => p.id === id);
    if (!product) {
      return HttpResponse.json({ message: "Product not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const body = (await request.json()) as { price: number };
    product.price = body.price;
    product.updatedAt = new Date().toISOString();

    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 200,
        body: product as unknown as Record<string, unknown>,
      });
    }

    return HttpResponse.json(product);
  }),

  // Create Product
  http.post("*/products", async ({ request }) => {
    await simulateNetworkConditions();
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (idempotencyKey && mockDb.idempotencyLog.has(idempotencyKey)) {
      const cached = mockDb.idempotencyLog.get(idempotencyKey)!;
      return HttpResponse.json(cached.body, { status: cached.status });
    }

    const draft = (await request.json()) as Record<string, unknown>;
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
        body: newProduct as unknown as Record<string, unknown>,
      });
    }

    return HttpResponse.json(newProduct, { status: 201 });
  }),

  // AI Suggestions Stub (Deterministic based on image hash)
  http.post("*/products/ai-suggest", async ({ request }) => {
    await simulateNetworkConditions();
    const body = (await request.json()) as { imageHash?: string };
    const hash = body.imageHash ?? "default";
    const charCode = hash.charCodeAt(0) || 65;

    const suggestions = [
      { title: "Safari Canvas Backpack", category: "Accessories", tags: ["travel", "canvas", "vintage"] },
      { title: "Maasai Beaded Leather Sandals", category: "Footwear", tags: ["handmade", "leather", "traditional"] },
      { title: "Kitenge Print Casual Shirt", category: "Apparel", tags: ["cotton", "afrocentric", "casual"] },
      { title: "Handcrafted Soapstone Bowl", category: "Home & Living", tags: ["craft", "decor", "natural"] },
    ] as const;

    const chosen = suggestions[charCode % suggestions.length]!;

    return HttpResponse.json({
      suggestedTitle: chosen.title,
      suggestedCategory: chosen.category,
      suggestedTags: [...chosen.tags],
      confidence: 0.94,
    });
  }),

  // Orders List
  http.get("*/orders", async ({ request }) => {
    await simulateNetworkConditions();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase();

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

    return HttpResponse.json(filtered);
  }),

  // Order Detail
  http.get("*/orders/:id", async ({ params }) => {
    await simulateNetworkConditions();
    const { id } = params;
    const order = mockDb.orders.find((o) => o.id === id);
    if (!order) {
      return HttpResponse.json({ message: "Order not found", code: "NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json(order);
  }),

  // Transition Order Status
  http.post("*/orders/:id/transition", async ({ params, request }) => {
    await simulateNetworkConditions();
    const { id } = params;
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (idempotencyKey && mockDb.idempotencyLog.has(idempotencyKey)) {
      const cached = mockDb.idempotencyLog.get(idempotencyKey)!;
      return HttpResponse.json(cached.body, { status: cached.status });
    }

    const order = mockDb.orders.find((o) => o.id === id);
    if (!order) {
      return HttpResponse.json({ message: "Order not found", code: "NOT_FOUND" }, { status: 404 });
    }

    const body = (await request.json()) as { toStatus: OrderStatus; note?: string };
    const prevStatus = order.status;
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
        body: order as unknown as Record<string, unknown>,
      });
    }

    return HttpResponse.json(order);
  }),

  // Initiate M-Pesa STK Push Payment
  http.post("*/payments/stk-push", async ({ request }) => {
    await simulateNetworkConditions();
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (idempotencyKey && mockDb.idempotencyLog.has(idempotencyKey)) {
      const cached = mockDb.idempotencyLog.get(idempotencyKey)!;
      return HttpResponse.json(cached.body, { status: cached.status });
    }

    const body = (await request.json()) as {
      orderId: string;
      amount: number;
      customerPhone: string;
      idempotencyKey: string;
    };

    // Simulate terminal failure triggers based on phone number patterns for testing
    let simulatedState: PaymentTransaction["state"] = "PENDING";
    let failureReason: PaymentTransaction["failureReason"] | undefined;

    if (body.customerPhone.endsWith("0000")) {
      simulatedState = "FAILED";
      failureReason = "INSUFFICIENT_FUNDS";
    } else if (body.customerPhone.endsWith("9999")) {
      simulatedState = "CANCELLED";
      failureReason = "USER_CANCELLED";
    } else if (body.customerPhone.endsWith("8888")) {
      simulatedState = "TIMEOUT";
      failureReason = "TIMEOUT";
    }

    const transaction: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      orderId: body.orderId,
      vendorId: "vdr_primary_store",
      amount: body.amount,
      currency: "KES",
      customerPhone: body.customerPhone,
      state: simulatedState,
      ...(failureReason ? { failureReason } : {}),
      providerReference: undefined,
      idempotencyKey: body.idempotencyKey,
      checkoutRequestId: `ws_CO_${Date.now()}`,
      initiatedAt: new Date().toISOString(),
      ...(simulatedState !== "PENDING" ? { completedAt: new Date().toISOString() } : {}),
    };

    mockDb.transactions.unshift(transaction);

    if (idempotencyKey) {
      mockDb.idempotencyLog.set(idempotencyKey, {
        status: 200,
        body: transaction as unknown as Record<string, unknown>,
      });
    }

    return HttpResponse.json(transaction);
  }),

  // Get Payment Status
  http.get("*/payments/transactions/:id", async ({ params }) => {
    await simulateNetworkConditions();
    const { id } = params;
    const tx = mockDb.transactions.find((t) => t.id === id);
    if (!tx) {
      return HttpResponse.json({ message: "Transaction not found", code: "NOT_FOUND" }, { status: 404 });
    }

    // Auto-resolve pending to success after 2 seconds for simulator realism
    if (tx.state === "PENDING") {
      tx.state = "SUCCESS";
      tx.providerReference = `MPESA_${Date.now()}`;
      tx.receiptNumber = `REC-${Date.now()}`;
      tx.completedAt = new Date().toISOString();
    }

    return HttpResponse.json(tx);
  }),
];
