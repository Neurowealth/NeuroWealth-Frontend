import {
  createElement,
  type ComponentType,
  type ReactNode,
} from "react";

type ProviderComponent =
  | ComponentType<{ children: ReactNode }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | [ComponentType<any>, Record<string, unknown>];

/**
 * Composes an array of providers into a single wrapper, eliminating deep nesting.
 *
 * Usage:
 * ```tsx
 * const AllProviders = composeProviders([
 *   ThemeProvider,
 *   [WalletProvider, { network, horizonUrl }],
 *   ToastProvider,
 * ]);
 *
 * return <AllProviders>{children}</AllProviders>;
 * ```
 *
 * Call once at module scope (or memoize) — invoking inside a component body
 * creates a new component type every render and remounts the provider tree.
 */
export function composeProviders(providers: ProviderComponent[]) {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight<ReactNode>((acc, entry) => {
      if (Array.isArray(entry)) {
        const [Provider, props] = entry;
        return createElement(Provider, props, acc);
      }
      const Provider = entry;
      return createElement(Provider, null, acc);
    }, children);
  };
}
