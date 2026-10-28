import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "react-native": path.resolve(__dirname, "src/mocks/react-native-shim.ts"),
    },
  },
});
