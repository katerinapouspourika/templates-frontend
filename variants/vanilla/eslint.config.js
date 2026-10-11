import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist",
    "coverage",
    "playwright-report",
    "test-results",
    "src/api/schema.d.ts",
  ]),
  {
    files: ["**/*.{ts,js,mjs}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["*.{ts,js,mjs}", "scripts/**", "e2e/**"],
    languageOptions: { globals: globals.node },
  },
  {
    // Plain JavaScript files (configs, scripts) are not part of a tsconfig.
    files: ["**/*.{js,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // Must stay last: turns off rules that conflict with Prettier.
  prettier,
]);
