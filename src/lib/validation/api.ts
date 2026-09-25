import { z } from "zod";

export const portfolioScenarioSchema = z.enum([
  "live",
  "empty",
  "loading",
  "partial-failure",
  "timeout",
]);

export const portfolioQuerySchema = z.object({
  scenario: portfolioScenarioSchema.optional(),
});

export const strategyKindSchema = z.enum(["conservative", "balanced", "growth"]);

export const strategyUpdateSchema = z.object({
  strategy: strategyKindSchema,
});

export const transactionHistoryQuerySchema = z.object({
  kind: z.enum(["all", "deposit", "withdrawal", "rebalance"]).optional(),
  status: z.enum(["all", "pending", "confirmed", "failed"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export const transactionKindSchema = z.enum(["deposit", "withdrawal"]);

export const transactionFormValuesSchema = z.object({
  amount: z.string().max(32),
  walletAddress: z.string().max(56),
  walletConnected: z.boolean(),
});

export const transactionRequestSchema = z.object({
  intent: z.enum(["quote", "submit"]).optional(),
  kind: transactionKindSchema,
  values: transactionFormValuesSchema,
  simulation: z.enum(["auto", "success", "failure"]).optional(),
});

export function buildValidationDetails(
  issuePath: Array<PropertyKey>,
  message: string,
): [string, string] {
  const path =
    issuePath.length > 0
      ? issuePath
          .map((segment) =>
            typeof segment === "symbol" ? segment.toString() : String(segment),
          )
          .join(".")
      : "form";
  return [path, message];
}

export function zodErrorToDetails(
  error: z.ZodError,
): Record<string, string[]> {
  const grouped = new Map<string, string[]>();

  for (const issue of error.issues) {
    const [path, message] = buildValidationDetails(issue.path, issue.message);
    const current = grouped.get(path) ?? [];
    current.push(message);
    grouped.set(path, current);
  }

  return Object.fromEntries(grouped.entries());
}
