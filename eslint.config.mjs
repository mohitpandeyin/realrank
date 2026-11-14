import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["src/**/*.client.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server", "@/server/*", "@/server/**"],
              message: "Client Components must not import server-only modules.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "coverage/**", "dist/**", "docs/**", "db/**", "next-env.d.ts"]),
]);
