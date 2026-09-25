/**
 * TransactionFormStage.tsx
 *
 * Form input stage for transaction flow.
 * Handles amount and wallet address input with validation.
 */

import { useI18n } from "@/contexts/I18nContext";
import { formatCurrency } from "@/lib/formatters";
import { joinDescribedBy } from "@/lib/form-validation";
import {
  TransactionFormValues,
  TransactionKind,
  getTransactionContext,
} from "@/lib/transactions";
import styles from "../transaction-flow.module.css";
import { sanitizeAmount } from "../utils/transaction-utils";
import { getInputStateClassName } from "../utils/transaction-style-utils";
import type { TransactionFieldErrors } from "@/lib/transactions";

interface TransactionFormStageProps {
  kind: TransactionKind;
  formValues: TransactionFormValues;
  fieldErrors: TransactionFieldErrors;
  isSubmitting: boolean;
  requestMessage: string | null;
  onFieldChange: <K extends keyof TransactionFormValues>(
    field: K,
    value: TransactionFormValues[K],
  ) => void;
  onMaxAmount: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function TransactionFormStage({
  kind,
  formValues,
  fieldErrors,
  isSubmitting,
  requestMessage,
  onFieldChange,
  onMaxAmount,
  onSubmit,
}: TransactionFormStageProps) {
  const { messages } = useI18n();
  const t = messages.transactions;
  const context = getTransactionContext(kind, messages.transactions.domain.context);

  const amountInputClassName = [
    styles.input,
    getInputStateClassName(
      formValues.amount,
      fieldErrors.amount,
      Boolean(formValues.amount) && !fieldErrors.amount,
    ),
  ].join(" ");

  const walletInputClassName = [
    styles.input,
    getInputStateClassName(
      formValues.walletAddress,
      fieldErrors.walletAddress,
      kind === "withdrawal" &&
        Boolean(formValues.walletAddress) &&
        !fieldErrors.walletAddress,
    ),
  ].join(" ");

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label className={styles.fieldLabel} htmlFor="amount">
            {context.amountLabel}
          </label>
          <span className={styles.fieldHint}>
            {t.form.available.replace(
              "{amount}",
              formatCurrency(context.availableAmount),
            )}
          </span>
        </div>

        <div className={styles.amountRow}>
          <input
            className={amountInputClassName}
            id="amount"
            inputMode="decimal"
            onChange={(event) =>
              onFieldChange("amount", sanitizeAmount(event.target.value))
            }
            placeholder="0.00"
            value={formValues.amount}
            aria-invalid={Boolean(fieldErrors.amount)}
            aria-describedby={joinDescribedBy(
              "amount-supporting-copy",
              fieldErrors.amount ? "amount-error" : undefined,
              formValues.amount && !fieldErrors.amount
                ? "amount-success"
                : undefined,
            )}
          />
          <button
            className={styles.inlineButton}
            onClick={onMaxAmount}
            type="button"
          >
            {t.form.max}
          </button>
        </div>

        <p id="amount-supporting-copy" className={styles.supportingCopy}>
          {context.amountHint}
        </p>
        {fieldErrors.amount ? (
          <p
            id="amount-error"
            className={`${styles.fieldMessage} ${styles.errorMessage}`}
            role="alert"
          >
            {fieldErrors.amount}
          </p>
        ) : formValues.amount ? (
          <p
            id="amount-success"
            className={`${styles.fieldMessage} ${styles.successMessage}`}
          >
            {t.form.amountValid}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label className={styles.fieldLabel} htmlFor="wallet">
            {context.walletLabel}
          </label>
          <span className={styles.fieldHint}>{context.reviewLabel}</span>
        </div>

        {kind === "deposit" ? (
          <>
            <div className={styles.walletDisplay}>
              <div>
                <div className={styles.fieldLabel}>
                  {context.connectedWalletLabel}
                </div>
                <div className={styles.walletAddress}>
                  {context.connectedWalletAddress}
                </div>
              </div>
              <button
                className={styles.walletToggle}
                onClick={() =>
                  onFieldChange("walletConnected", !formValues.walletConnected)
                }
                type="button"
              >
                {formValues.walletConnected
                  ? t.form.disconnect
                  : t.form.reconnect}
              </button>
            </div>
            <p className={styles.supportingCopy}>{context.walletHint}</p>
            {fieldErrors.walletConnected ? (
              <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
                {fieldErrors.walletConnected}
              </p>
            ) : (
              <p className={`${styles.fieldMessage} ${styles.successMessage}`}>
                {t.form.depositUsesWallet}
              </p>
            )}
          </>
        ) : (
          <>
            <input
              className={walletInputClassName}
              id="wallet"
              onChange={(event) =>
                onFieldChange(
                  "walletAddress",
                  event.target.value.toUpperCase().trim(),
                )
              }
              placeholder="G..."
              value={formValues.walletAddress}
              aria-invalid={Boolean(fieldErrors.walletAddress)}
              aria-describedby={joinDescribedBy(
                "wallet-hint",
                fieldErrors.walletAddress ? "wallet-error" : undefined,
                formValues.walletAddress && !fieldErrors.walletAddress
                  ? "wallet-success"
                  : undefined,
              )}
            />
            <div className={styles.connectRow}>
              <button
                className={styles.walletToggle}
                onClick={() =>
                  onFieldChange("walletConnected", !formValues.walletConnected)
                }
                type="button"
              >
                {formValues.walletConnected
                  ? t.form.disconnectVault
                  : t.form.reconnectVault}
              </button>
              <span id="wallet-hint" className={styles.fieldHint}>
                {context.walletHint}
              </span>
            </div>
            {fieldErrors.walletAddress ? (
              <p
                id="wallet-error"
                className={`${styles.fieldMessage} ${styles.errorMessage}`}
                role="alert"
              >
                {fieldErrors.walletAddress}
              </p>
            ) : (
              <p
                id="wallet-success"
                className={`${styles.fieldMessage} ${styles.successMessage}`}
              >
                {t.form.destinationValid}
              </p>
            )}
            {fieldErrors.walletConnected ? (
              <p
                className={`${styles.fieldMessage} ${styles.errorMessage}`}
                role="alert"
              >
                {fieldErrors.walletConnected}
              </p>
            ) : null}
          </>
        )}
      </div>

      {requestMessage ? (
        <p className={`${styles.fieldMessage} ${styles.warningMessage}`}>
          {requestMessage}
        </p>
      ) : null}

      <div className={styles.actionBar}>
        <div className={styles.actionMeta}>
          {t.form.anchoredNote}
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={isSubmitting}
            type="submit"
            data-qa="transaction-review-button"
          >
            {isSubmitting ? t.form.preparing : context.primaryActionLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
