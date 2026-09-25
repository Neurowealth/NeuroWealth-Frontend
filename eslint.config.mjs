// @ts-check
import next from "eslint-config-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**"] },
  ...next,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // Catch new unsafe any at lint time (#654). Warn so existing call sites can be triaged gradually.
      "@typescript-eslint/no-explicit-any": "warn",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/context/AuthContext",
              message:
                "Use the single public auth/wallet surface from '@/contexts' instead.",
            },
            {
              name: "@/contexts/AuthContext",
              message:
                "Import useAuth/AuthProvider from '@/contexts' to keep one public surface.",
            },
            {
              name: "@/contexts/WalletProvider",
              message:
                "Import useWallet/useWalletConfig/WalletProvider from '@/contexts' to keep one public surface.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
