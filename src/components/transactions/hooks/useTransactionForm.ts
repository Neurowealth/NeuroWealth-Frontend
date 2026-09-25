/**
 * useTransactionForm.ts
 *
 * Custom hook for managing transaction form state and validation.
 * Separates form logic from UI rendering.
 */

import { useState, useCallback } from "react";
import {
    TransactionFieldErrors,
    TransactionFormValues,
    TransactionKind,
    getDefaultTransactionValues,
    validateTransactionValues,
} from "@/lib/transactions";

export function useTransactionForm(kind: TransactionKind, tDomain: any) {
    const [formValues, setFormValues] = useState<TransactionFormValues>(() =>
        getDefaultTransactionValues(kind),
    );
    const [fieldErrors, setFieldErrors] = useState<TransactionFieldErrors>({});

    const updateField = useCallback(
        <K extends keyof TransactionFormValues>(
            field: K,
            value: TransactionFormValues[K],
        ) => {
            setFormValues((current) => ({
                ...current,
                [field]: value,
            }));

            setFieldErrors((current) => ({
                ...current,
                [field]: undefined,
                form: undefined,
            }));
        },
        [],
    );

    const validate = useCallback((): boolean => {
        const localErrors = validateTransactionValues(kind, formValues, tDomain);

        if (Object.keys(localErrors).length > 0) {
            setFieldErrors(localErrors);
            return false;
        }

        setFieldErrors({});
        return true;
    }, [kind, formValues]);

    const reset = useCallback(() => {
        setFormValues(getDefaultTransactionValues(kind));
        setFieldErrors({});
    }, [kind]);

    const setErrors = useCallback((errors: TransactionFieldErrors) => {
        setFieldErrors(errors);
    }, []);

    // Needed to hydrate the form from a preview snapshot, which supplies a full
    // set of arbitrary values rather than resetting to per-kind defaults.
    const setValues = useCallback((values: TransactionFormValues) => {
        setFormValues(values);
    }, []);

    return {
        formValues,
        fieldErrors,
        updateField,
        validate,
        reset,
        setErrors,
        setValues,
    };
}
