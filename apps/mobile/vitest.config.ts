import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  define: {
    __DEV__: true,
  },
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
      {
        find: "expo-image-manipulator",
        replacement: path.resolve(__dirname, "src/__tests__/image-shim.ts"),
      },
      {
        find: "react-native-compressor",
        replacement: path.resolve(__dirname, "src/__tests__/image-shim.ts"),
      },
    ],
  },
});
