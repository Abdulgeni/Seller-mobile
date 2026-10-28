import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ApiClient } from "../client";
import { resetMockDb } from "../mocks/handlers";
import { server } from "../mocks/server";

const client = new ApiClient({ baseUrl: "https://mock-api.seller.internal" });

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  resetMockDb();
});
afterAll(() => server.close());

describe("ApiClient with MSW", () => {
  it("fetches pre-aggregated dashboard KPIs", async () => {
    const kpis = await client.getDashboardKpis("vdr_primary_store");
    expect(kpis.vendorId).toBe("vdr_primary_store");
    expect(kpis.revenueToday).toBeGreaterThan(0);
    expect(kpis.revenue7DaysSeries.length).toBe(7);
  });

  it("fetches seeded product catalogue", async () => {
    const products = await client.getProducts();
    expect(products.length).toBe(5000);
    expect(products[0]?.id).toBe("prod_1");
  });

  it("toggles product stock with idempotency", async () => {
    const idempotencyKey = "11111111-2222-3333-4444-555555555555";
    const res1 = await client.toggleProductStock({
      productId: "prod_1",
      inStock: false,
      idempotencyKey,
    });
    expect(res1.inStock).toBe(false);

    // Second call with same idempotency key returns cached response
    const res2 = await client.toggleProductStock({
      productId: "prod_1",
      inStock: true, // Attempt to flip back using same key
      idempotencyKey,
    });
    expect(res2.inStock).toBe(false); // Kept original cached response
  });

  it("filters orders by status", async () => {
    const newOrders = await client.getOrders({ status: "NEW" });
    expect(newOrders.length).toBeGreaterThan(0);
    for (const order of newOrders) {
      expect(order.status).toBe("NEW");
    }
  });

  it("fetches single order detail with customer and line items", async () => {
    const orders = await client.getOrders();
    expect(orders.length).toBeGreaterThan(0);
    const firstId = orders[0]!.id;

    const detail = await client.getOrder(firstId);
    expect(detail.id).toBe(firstId);
    expect(detail.customer.name).toBeDefined();
    expect(detail.items.length).toBeGreaterThan(0);
    expect(detail.timeline.length).toBeGreaterThan(0);
  });
});
