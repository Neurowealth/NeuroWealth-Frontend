import { NextRequest, NextResponse } from "next/server";
import {
  filterAndPaginateHistory,
  parseHistoryKind,
  parseHistoryStatus,
  TransactionHistoryFilter,
} from "@/lib/transaction-history";
import {
  ERROR_CODE,
  HTTP_STATUS,
  errorResponse,
  successResponse,
} from "@/lib/api-response";
import { transactionHistoryQuerySchema, zodErrorToDetails } from "@/lib/validation/api";
import { requireAuth } from "@/lib/api-auth";

export function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const params = req.nextUrl.searchParams;

  const rawQuery = {
    kind: params.get("kind") ?? undefined,
    status: params.get("status") ?? undefined,
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
    page: params.get("page") ?? undefined,
    pageSize: params.get("pageSize") ?? undefined,
  };

  const parsedQuery = transactionHistoryQuerySchema.safeParse(rawQuery);

  if (!parsedQuery.success) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Query parameter validation failed.",
        zodErrorToDetails(parsedQuery.error),
      ),
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const { kind, status, dateFrom, dateTo, page, pageSize } = parsedQuery.data;

  const filter: TransactionHistoryFilter = {
    kind: parseHistoryKind(kind ?? null),
    status: parseHistoryStatus(status ?? null),
    dateFrom: dateFrom ?? "",
    dateTo: dateTo ?? "",
    page: page ?? 1,
    pageSize: Math.min(50, Math.max(1, pageSize ?? 10)),
  };

  const result = filterAndPaginateHistory(filter);

  return NextResponse.json(successResponse(result));
}
