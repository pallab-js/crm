import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**", "src-tauri/**", "node_modules/**"],
  },
  {
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]);

export default eslintConfig;