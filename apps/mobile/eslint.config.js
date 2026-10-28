const expo = require("eslint-config-expo/flat");

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/android/**",
      "**/ios/**",
      "**/.expo/**",
      "**/dist/**",
      "**/.turbo/**",
    ],
  },
  ...expo,
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
