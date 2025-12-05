/**
 * ESLint Flat Config
 */
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        Logger: "readonly",
        SpreadsheetApp: "readonly",
        DriveApp: "readonly",
        UrlFetchApp: "readonly",
        PropertiesService: "readonly",
        Utilities: "readonly",
        ScriptApp: "readonly",
        CalendarApp: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "no-console": "off",
    },
  },
  prettier,
];
