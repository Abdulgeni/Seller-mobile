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
  {
    files: ["src/**/*.tsx", "src/features/**/*.ts", "src/app/**/*.ts"],
    ignores: ["**/__tests__/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3,4}){1,2}$/]",
          message:
            "Literal hex colors are strictly forbidden in components. Use semantic design tokens from @repo/ui instead.",
        },
      ],
    },
  },
];
