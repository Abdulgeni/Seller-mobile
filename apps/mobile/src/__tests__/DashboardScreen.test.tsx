import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import DashboardScreen from "../app/(tabs)/index";

describe("DashboardScreen Component", () => {
  it("creates component definition without syntax or export errors", () => {
    expect(DashboardScreen).toBeDefined();
    expect(typeof DashboardScreen).toBe("function");
  });

  it("can instantiate QueryClient with valid default options", () => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 2,
        },
      },
    });
    expect(qc).toBeDefined();
    expect(qc.getDefaultOptions().queries?.retry).toBe(2);
  });
});
