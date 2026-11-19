// @ts-check

// Import the Next.js ESLint configuration.
import next from "eslint-config-next";

// Import TypeScript-specific ESLint plugin and parser.
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/**
 * ESLint configuration for the NeuroWealth frontend.
 *
 * Uses ESLint's flat config format and applies TypeScript-specific
 * rules only to files inside the src directory.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const eslintConfig = [
  // Ignore generated Next.js files and installed dependencies.
  {
    ignores: [".next/**", "node_modules/**"],
  },

  // Extend the recommended ESLint configuration provided by Next.js.
  ...next,

  // TypeScript-specific configuration for source files.
  {
    files: ["src/**/*.{ts,tsx}"],

    languageOptions: {
      // Use the TypeScript parser so ESLint can understand .ts and .tsx files.
      parser: tsParser,
    },

    plugins: {
      // Enable TypeScript-specific ESLint rules.
      "@typescript-eslint": tsPlugin,
    },

    rules: {
      // Warn when new explicit `any` types are introduced.
      // This allows existing usages to be addressed gradually without
      // immediately breaking the lint process.
      // See: #654
      "@typescript-eslint/no-explicit-any": "warn",

      // Restrict imports from internal auth and wallet context files.
      // Consumers should use the public API exposed through '@/contexts'
      // instead of importing individual context implementations directly.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              // Prevent direct imports from the legacy AuthContext path.
              name: "@/context/AuthContext",
              message:
                "Use the single public auth/wallet surface from '@/contexts' instead.",
            },
            {
              // Prevent direct imports from the AuthContext implementation.
              name: "@/contexts/AuthContext",
              message:
                "Import useAuth/AuthProvider from '@/contexts' to keep one public surface.",
            },
            {
              // Prevent direct imports from the WalletProvider implementation.
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

// Export the ESLint configuration for use by the project.
export default eslintConfig;