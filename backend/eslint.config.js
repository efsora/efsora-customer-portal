// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

import { noDirectCoreImports } from "./eslint-local-rules.js";

export default tseslint.config(
    {
        ignores: ["**/*.js", "dist/**"],
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
);