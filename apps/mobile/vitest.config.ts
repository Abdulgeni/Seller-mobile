import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: /^react-native$/,
        replacement: path.resolve(__dirname, "../../packages/api/src/mocks/react-native-shim.ts"),
      },
      {
        find: /^react-native\/.*/,
        replacement: path.resolve(__dirname, "../../packages/api/src/mocks/react-native-shim.ts"),
      },
      {
        find: "expo-router",
        replacement: path.resolve(__dirname, "../../packages/api/src/mocks/react-native-shim.ts"),
      },
      {
        find: "@shopify/flash-list",
        replacement: path.resolve(__dirname, "../../packages/api/src/mocks/react-native-shim.ts"),
      },
    ],
  },
});
