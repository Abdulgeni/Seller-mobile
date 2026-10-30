import { http, HttpResponse } from "msw";
import { handleMockRoute, mockDb, resetMockDb, simulateMockLatency } from "./mockDb";

export { mockDb, resetMockDb };

export const handlers = [
  http.all("https://mock-api.seller.internal/*", async ({ request }) => {
    await simulateMockLatency();
    const url = new URL(request.url);
    const endpoint = url.pathname + url.search;
    const method = request.method;

    let bodyStr: string | undefined;
    if (method !== "GET" && method !== "HEAD") {
      bodyStr = await request.text().catch(() => undefined);
    }

    const headersRecord: Record<string, string> = {};
    request.headers.forEach((val, key) => {
      headersRecord[key] = val;
    });

    const res = handleMockRoute(endpoint, {
      method,
      headers: headersRecord,
      ...(bodyStr ? { body: bodyStr } : {}),
    });

    return HttpResponse.json(res.body, { status: res.status });
  }),
  http.all("http://localhost:3000/api/*", async ({ request }) => {
    await simulateMockLatency();
    const url = new URL(request.url);
    const endpoint = url.pathname.replace(/^\/api/, "") + url.search;
    const method = request.method;

    let bodyStr: string | undefined;
    if (method !== "GET" && method !== "HEAD") {
      bodyStr = await request.text().catch(() => undefined);
    }

    const headersRecord: Record<string, string> = {};
    request.headers.forEach((val, key) => {
      headersRecord[key] = val;
    });

    const res = handleMockRoute(endpoint, {
      method,
      headers: headersRecord,
      ...(bodyStr ? { body: bodyStr } : {}),
    });

    return HttpResponse.json(res.body, { status: res.status });
  }),
];
