import {
  parsePreviewState,
  parseTransactionKind,
  type TransactionKind,
  type TransactionPreviewState,
} from "@/lib/transactions";

export type PreviewThemeMode = "light" | "dark";

export interface TransactionPreviewSearchParams {
  theme: PreviewThemeMode;
  kind: TransactionKind;
  preview: TransactionPreviewState;
}

export interface WidgetPreviewSearchParams {
  theme: PreviewThemeMode;
}

export function parseTransactionPreviewSearchParams(
  searchParams: URLSearchParams,
): TransactionPreviewSearchParams {
  return {
    theme: searchParams.get("theme") === "dark" ? "dark" : "light",
    kind: parseTransactionKind(searchParams.get("kind")),
    preview: parsePreviewState(searchParams.get("preview")),
  };
}

export function parseWidgetPreviewSearchParams(
  searchParams: URLSearchParams,
): WidgetPreviewSearchParams {
  return {
    theme: searchParams.get("theme") === "dark" ? "dark" : "light",
  };
}
