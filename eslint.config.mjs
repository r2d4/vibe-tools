import removeComments from "./packages/eslint-plugin-remove-comments/index.mjs";

export default [
  {
    ignores: ["node_modules/**", "**/dist/**", "**/coverage/**", "**/*.d.ts"],
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.tsx", "**/*.jsx"],
    plugins: {
      "remove-comments": removeComments,
    },
    rules: {
      "remove-comments/remove-all": "error",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
];