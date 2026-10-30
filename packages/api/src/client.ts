import {
  AiSuggestionResponseSchema,
  DashboardKpiMetricsSchema,
  OrderFilterParamsSchema,
  OrderSchema,
  OrderTransitionMutationSchema,
  PaymentInitiationRequestSchema,
  PaymentTransactionSchema,
  PriceEditMutationSchema,
  ProductDraftSchema,
  ProductSchema,
  RegisterFcmTokenRequestSchema,
  StockToggleMutationSchema,
  type AiSuggestionResponse,
  type DashboardKpiMetrics,
  type Order,
  type OrderFilterParams,
  type OrderTransitionMutation,
  type PaymentInitiationRequest,
  type PaymentTransaction,
  type PriceEditMutation,
  type Product,
  type ProductDraft,
  type RegisterFcmTokenRequest,
  type StockToggleMutation,
} from "@repo/schemas";
import { logger } from "@repo/ui";
import { z } from "zod";
import { handleMockRoute, simulateMockLatency } from "./mocks/mockDb";

export interface ApiClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  mockNetwork?: boolean;
  failureRate?: number;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;
  private mockNetwork: boolean;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? "https://mock-api.seller.internal";
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.mockNetwork =
      config.mockNetwork ??
      (typeof process !== "undefined"
        ? process.env["EXPO_PUBLIC_MOCK_NETWORK"] !== "false"
        : true);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodType<T, z.ZodTypeDef, unknown>
  ): Promise<T> {
    if (this.mockNetwork) {
      await simulateMockLatency();
      const res = handleMockRoute(endpoint, options);
      if (res.status >= 400) {
        const errorBody = (res.body ?? {}) as Record<string, unknown>;
        const message = typeof errorBody["message"] === "string" ? errorBody["message"] : "Mock request failed";
        const code = typeof errorBody["code"] === "string" ? errorBody["code"] : undefined;
        throw new ApiError(res.status, message, code, errorBody);
      }
      if (schema) {
        const parseResult = schema.safeParse(res.body);
        if (!parseResult.success) {
          logger.error("API response validation failed", parseResult.error, { endpoint });
          throw new ApiError(500, "Response schema mismatch", "SCHEMA_VALIDATION_ERROR", parseResult.error.format());
        }
        return parseResult.data;
      }
      return res.body as T;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Vendor-ID": "vdr_primary_store",
          ...(options.headers ?? {}),
        },
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
        const message = typeof errorBody["message"] === "string" ? errorBody["message"] : response.statusText;
        const code = typeof errorBody["code"] === "string" ? errorBody["code"] : undefined;
        throw new ApiError(response.status, message, code, errorBody);
      }

      const json: unknown = await response.json();
      if (schema) {
        const parseResult = schema.safeParse(json);
        if (!parseResult.success) {
          logger.error("API response validation failed", parseResult.error, { endpoint });
          throw new ApiError(500, "Response schema mismatch", "SCHEMA_VALIDATION_ERROR", parseResult.error.format());
        }
        return parseResult.data;
      }
      return json as T;
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      const errorMsg = err instanceof Error ? err.message : "Network request failed";
      logger.error(`Network error requesting ${endpoint}`, err);
      throw new ApiError(0, errorMsg, "NETWORK_ERROR");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Dashboard
  async getDashboardKpis(vendorId = "vdr_primary_store"): Promise<DashboardKpiMetrics> {
    return this.request(`/dashboard/kpis?vendorId=${vendorId}`, { method: "GET" }, DashboardKpiMetricsSchema);
  }

  // Products
  async getProducts(params?: { category?: string | undefined; search?: string | undefined; inStock?: boolean | undefined }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.search) query.append("search", params.search);
    if (typeof params?.inStock === "boolean") query.append("inStock", String(params.inStock));
    const endpoint = `/products${query.toString() ? `?${query.toString()}` : ""}`;
    return this.request(endpoint, { method: "GET" }, z.array(ProductSchema));
  }

  async getProduct(id: string): Promise<Product> {
    return this.request(`/products/${id}`, { method: "GET" }, ProductSchema);
  }

  async toggleProductStock(mutation: StockToggleMutation): Promise<Product> {
    StockToggleMutationSchema.parse(mutation);
    return this.request(
      `/products/${mutation.productId}/stock`,
      {
        method: "PATCH",
        body: JSON.stringify({ inStock: mutation.inStock }),
        headers: { "Idempotency-Key": mutation.idempotencyKey },
      },
      ProductSchema
    );
  }

  async editProductPrice(mutation: PriceEditMutation): Promise<Product> {
    PriceEditMutationSchema.parse(mutation);
    return this.request(
      `/products/${mutation.productId}/price`,
      {
        method: "PATCH",
        body: JSON.stringify({ price: mutation.price }),
        headers: { "Idempotency-Key": mutation.idempotencyKey },
      },
      ProductSchema
    );
  }

  async createProduct(draft: ProductDraft, idempotencyKey: string): Promise<Product> {
    ProductDraftSchema.parse(draft);
    return this.request(
      "/products",
      {
        method: "POST",
        body: JSON.stringify(draft),
        headers: { "Idempotency-Key": idempotencyKey },
      },
      ProductSchema
    );
  }

  async getAiSuggestions(imageHash: string): Promise<AiSuggestionResponse> {
    return this.request(
      "/products/ai-suggest",
      {
        method: "POST",
        body: JSON.stringify({ imageHash }),
      },
      AiSuggestionResponseSchema
    );
  }

  // Orders
  async getOrders(params?: OrderFilterParams): Promise<Order[]> {
    if (params) OrderFilterParamsSchema.parse(params);
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const endpoint = `/orders${query.toString() ? `?${query.toString()}` : ""}`;
    return this.request(endpoint, { method: "GET" }, z.array(OrderSchema));
  }

  async getOrder(id: string): Promise<Order> {
    return this.request(`/orders/${id}`, { method: "GET" }, OrderSchema);
  }

  async transitionOrderStatus(mutation: OrderTransitionMutation): Promise<Order> {
    OrderTransitionMutationSchema.parse(mutation);
    return this.request(
      `/orders/${mutation.orderId}/transition`,
      {
        method: "POST",
        body: JSON.stringify(mutation),
        headers: { "Idempotency-Key": mutation.idempotencyKey },
      },
      OrderSchema
    );
  }

  // Payments
  async initiatePayment(req: PaymentInitiationRequest): Promise<PaymentTransaction> {
    PaymentInitiationRequestSchema.parse(req);
    return this.request(
      "/payments/stk-push",
      {
        method: "POST",
        body: JSON.stringify(req),
        headers: { "Idempotency-Key": req.idempotencyKey },
      },
      PaymentTransactionSchema
    );
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentTransaction> {
    return this.request(`/payments/transactions/${transactionId}`, { method: "GET" }, PaymentTransactionSchema);
  }

  // Push Notifications
  async registerPushToken(req: RegisterFcmTokenRequest): Promise<{ success: boolean }> {
    RegisterFcmTokenRequestSchema.parse(req);
    return this.request(
      "/notifications/fcm-token",
      {
        method: "POST",
        body: JSON.stringify(req),
      },
      z.object({ success: z.boolean() })
    );
  }
}

export const defaultApiClient = new ApiClient();
