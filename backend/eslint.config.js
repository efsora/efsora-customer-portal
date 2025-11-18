// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

import { noDirectCoreImports } from "./eslint-local-rules.js";

export default tseslint.config(
  {
    ignores: [
      "**/*.js",
      "dist/**",
      "src/generated/**",
      "_docs/**",
      "src/infrastructure/config/env.ts",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Disable unified-signatures rule due to ESLint plugin bug
      // See: https://github.com/typescript-eslint/typescript-eslint/issues/9475
      "@typescript-eslint/unified-signatures": "off",
      // Prefer 'type' over 'interface' for DTOs and data shapes
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  {
    files: ["src/routes/**/*.ts"],
    plugins: {
      local: {
        rules: {
          "no-direct-core-imports": noDirectCoreImports,
        },
      },
    },
    rules: {
      "local/no-direct-core-imports": "error",
    },
  },
  // Relax type-checking rules for test files
  {
    files: ["tests/**/*.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/require-await": "off",
    },
  },
);
