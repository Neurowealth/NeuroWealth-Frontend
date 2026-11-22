/**
 * useTransactionAPI.ts
 *
 * Custom hook for transaction API operations.
 * Handles quote requests, submissions, error mapping, and in-flight request
 * cancellation. Results are returned as discriminated unions so callers can act
 * on success, mapped field errors, or an aborted request without inspecting
 * hook state (which updates asynchronously).
 */

import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { useI18n } from "@/contexts/I18nContext";
import {
    TransactionFieldErrors,
    TransactionFormValues,
    TransactionKind,
    TransactionQuote,
    PendingTransaction,
    getTransactionRecoveryUI,
    type TransactionRecoveryUI,
} from "@/lib/transactions";
import { ApiRequestError, apiRequest } from "@/lib/api-client";
import { getApiErrorPresentation, logger } from "@/lib/logger";
import { detailsToFieldErrors } from "../utils/transaction-utils";

export interface TransactionAPIState {
    isSubmitting: boolean;
    recovery: TransactionRecoveryUI | null;
    lastErrorReference: string | null;
    fieldErrors: TransactionFieldErrors;
}

export type QuoteResult =
    | { status: "success"; quote: TransactionQuote }
    | { status: "error"; fieldErrors: TransactionFieldErrors }
    | { status: "aborted" };

export type SubmitResult =
    | { status: "success"; pending: PendingTransaction }
    | { status: "error"; fieldErrors: TransactionFieldErrors }
    | { status: "aborted" };

const INITIAL_STATE: TransactionAPIState = {
    isSubmitting: false,
    recovery: null,
    lastErrorReference: null,
    fieldErrors: {},
};

const transactionKindSchema = z.enum(["deposit", "withdrawal"]);
const referenceSchema = z.string().regex(/\S/);
const quoteSchema = z.object({
    kind: transactionKindSchema,
    amount: z.number().finite(),
    fee: z.number().finite(),
    netAmount: z.number().finite(),
    totalDebit: z.number().finite(),
    reference: referenceSchema,
    walletAddress: z.string(),
    walletLabel: z.string(),
    strategyLabel: z.string(),
    estimatedSettlement: z.string(),
}) satisfies z.ZodType<TransactionQuote>;

const quoteResponseSchema = z.object({ quote: quoteSchema });
const submitResponseSchema = z.object({
    pending: z.object({
        kind: transactionKindSchema,
        reference: referenceSchema,
        quote: quoteSchema,
        statusLabel: z.string(),
        message: z.string(),
        completionDelayMs: z.number().int().nonnegative(),
        nextStatus: z.enum(["success", "failure"]),
        failureReason: z.string().nullable(),
    }) satisfies z.ZodType<PendingTransaction>,
});

function invalidTransactionResponse() {
    return new ApiRequestError("Service returned an unexpected transaction payload.", {
        code: "INVALID_ENVELOPE",
        status: 502,
    });
}

export function useTransactionAPI() {
    const { messages } = useI18n();
    const tDomain = messages.transactions.domain;
    const [state, setState] = useState<TransactionAPIState>(INITIAL_STATE);
    const requestControllerRef = useRef<AbortController | null>(null);

    const beginApiRequest = useCallback(() => {
        requestControllerRef.current?.abort();
        const controller = new AbortController();
        requestControllerRef.current = controller;
        return controller;
    }, []);

    const endApiRequest = useCallback((controller: AbortController) => {
        if (requestControllerRef.current === controller) {
            requestControllerRef.current = null;
        }
    }, []);

    const requestQuote = useCallback(
        async (
            kind: TransactionKind,
            formValues: TransactionFormValues,
            quoteReference?: string,
        ): Promise<QuoteResult> => {
            const controller = beginApiRequest();
            setState((prev) => ({
                ...prev,
                isSubmitting: true,
                recovery: null,
                fieldErrors: {},
            }));

            try {
                const payload = await apiRequest<unknown>(
                    "/api/transactions",
                    {
                        method: "POST",
                        body: {
                            intent: "quote",
                            kind,
                            values: formValues,
                        },
                        timeoutMs: 12000,
                        signal: controller.signal,
                    },
                );

                const parsed = quoteResponseSchema.safeParse(payload);
                if (!parsed.success) {
                    throw invalidTransactionResponse();
                }

                setState((prev) => ({ ...prev, isSubmitting: false }));
                return { status: "success", quote: parsed.data.quote };
            } catch (error) {
                if (controller.signal.aborted) {
                    setState((prev) => ({ ...prev, isSubmitting: false }));
                    return { status: "aborted" };
                }

                const copy = getApiErrorPresentation(error);
                const recovery = getTransactionRecoveryUI(copy.code, tDomain.recovery, quoteReference);
                logger.error("transaction_quote_failed", {
                    code: copy.code,
                    status: copy.status,
                    retryable: copy.retryable,
                    reference: quoteReference ?? null,
                });

                // Surface server-side field errors to the caller instead of
                // discarding them, so the form can highlight the offending inputs.
                const fieldErrors =
                    error instanceof ApiRequestError
                        ? detailsToFieldErrors(error.details)
                        : {};

                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    recovery,
                    lastErrorReference: quoteReference ?? null,
                    fieldErrors,
                }));

                return { status: "error", fieldErrors };
            } finally {
                endApiRequest(controller);
            }
        },
        [beginApiRequest, endApiRequest, tDomain],
    );

    const submitTransaction = useCallback(
        async (
            kind: TransactionKind,
            formValues: TransactionFormValues,
            quoteReference?: string,
        ): Promise<SubmitResult> => {
            const controller = beginApiRequest();
            setState((prev) => ({
                ...prev,
                isSubmitting: true,
                recovery: null,
                fieldErrors: {},
            }));

            try {
                const payload = await apiRequest<unknown>(
                    "/api/transactions",
                    {
                        method: "POST",
                        body: {
                            intent: "submit",
                            kind,
                            values: formValues,
                        },
                        timeoutMs: 12000,
                        signal: controller.signal,
                    },
                );

                const parsed = submitResponseSchema.safeParse(payload);
                if (!parsed.success) {
                    throw invalidTransactionResponse();
                }

                const { pending } = parsed.data;
                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    lastErrorReference: pending.reference,
                }));

                return { status: "success", pending };
            } catch (error) {
                if (controller.signal.aborted) {
                    setState((prev) => ({ ...prev, isSubmitting: false }));
                    return { status: "aborted" };
                }

                const copy = getApiErrorPresentation(error);
                const recovery = getTransactionRecoveryUI(copy.code, tDomain.recovery, quoteReference);
                logger.error("transaction_submit_failed", {
                    code: copy.code,
                    status: copy.status,
                    retryable: copy.retryable,
                    reference: quoteReference ?? null,
                });

                // Surface server-side field errors to the caller instead of
                // discarding them, so the form can highlight the offending inputs.
                const fieldErrors =
                    error instanceof ApiRequestError
                        ? detailsToFieldErrors(error.details)
                        : {};

                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    recovery,
                    lastErrorReference: quoteReference ?? null,
                    fieldErrors,
                }));

                return { status: "error", fieldErrors };
            } finally {
                endApiRequest(controller);
            }
        },
        [beginApiRequest, endApiRequest, tDomain],
    );

    const clearRecovery = useCallback(() => {
        setState((prev) => ({ ...prev, recovery: null }));
    }, []);

    const setSubmitting = useCallback((value: boolean) => {
        setState((prev) => ({ ...prev, isSubmitting: value }));
    }, []);

    const cancelRequest = useCallback(() => {
        requestControllerRef.current?.abort();
        requestControllerRef.current = null;
    }, []);

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    return {
        ...state,
        requestQuote,
        submitTransaction,
        clearRecovery,
        setSubmitting,
        cancelRequest,
        reset,
    };
}
