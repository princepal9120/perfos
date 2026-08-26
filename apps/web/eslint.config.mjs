import { flatConfig } from "@next/eslint-plugin-next";

export default [
  ...flatConfig.recommended,
  ...flatConfig["core-web-vitals"],
  { ignores: [".next/**", "node_modules/**", "out/**"] },
];
