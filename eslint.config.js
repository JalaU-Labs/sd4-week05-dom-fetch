import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "src/css/output.css",
      "node_modules/**",
      ".pnpm-store/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["vite.config.js", "vitest.config.js", "playwright.config.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
  prettier,
];
