import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
