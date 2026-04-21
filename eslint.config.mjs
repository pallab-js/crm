import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**"],
  },
  {
    rules: {
      "no-restricted-syntax": "off",
    },
  },
]);

export default eslintConfig;