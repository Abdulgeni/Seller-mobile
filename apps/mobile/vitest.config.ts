import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  define: {
    __DEV__: true,
  },
  test: {
    environment: "node",
    globals: true,
    testTimeout: 15000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^expo$/,
        replacement: path.resolve(__dirname, "src/__tests__/expo-shim.ts"),
      },
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
      {
        find: "expo-notifications",
        replacement: path.resolve(__dirname, "src/__tests__/notifications-shim.ts"),
      },
      {
        find: "expo-local-authentication",
        replacement: path.resolve(__dirname, "src/__tests__/security-shim.ts"),
      },
      {
        find: "expo-secure-store",
        replacement: path.resolve(__dirname, "src/__tests__/security-shim.ts"),
      },
    ],
  },
});
