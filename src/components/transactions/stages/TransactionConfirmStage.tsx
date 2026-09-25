/**
 * TransactionConfirmStage.tsx
 *
 * Confirmation stage for transaction flow.
 * Displays quote details and fees before submission.
 */

import { useI18n } from "@/contexts/I18nContext";
import { formatCurrency } from "@/lib/formatters";
import { TransactionKind, TransactionQuote } from "@/lib/transactions";
import styles from "../transaction-flow.module.css";

interface TransactionConfirmStageProps {
  kind: TransactionKind;
  quote: TransactionQuote;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function TransactionConfirmStage({
  kind,
  quote,
  isSubmitting,
  onBack,
  onConfirm,
}: TransactionConfirmStageProps) {
  const { messages } = useI18n();
  const t = messages.transactions;
  const confirmLabel =
    kind === "deposit" ? t.confirm.confirmDeposit : t.confirm.confirmWithdrawal;

  return (
    <div
      className={styles.form}
      role="status"
      aria-live="polite"
    >
      <div className={styles.summaryCard}>
        <p className={styles.heroAmount}>{formatCurrency(quote.amount)}</p>
        <p className={styles.heroSubtext}>
          {kind === "deposit"
            ? t.confirm.depositAmount
            : t.confirm.withdrawalAmount}
        </p>
      </div>

      <div className={styles.detailList}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.shared.amount}</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(quote.amount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.shared.fees}</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(quote.fee)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            {kind === "deposit"
              ? t.confirm.totalDebit
              : t.confirm.netDestinationAmount}
          </span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(
              kind === "deposit" ? quote.totalDebit : quote.netAmount,
            )}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.shared.strategy}</span>
          <span className={styles.detailValue}>{quote.strategyLabel}</span>
        </div>
      </div>

      <div className={styles.referenceCard}>
        <p className={styles.referenceLabel}>{t.shared.transactionReference}</p>
        <p className={styles.referenceValue}>{quote.reference}</p>
        <p className={styles.supportingCopy}>
          {t.confirm.shareReference}
        </p>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionMeta}>
          {t.confirm.confirmAfterReview}
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onBack}
            type="button"
          >
            {t.confirm.back}
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={onConfirm}
            disabled={isSubmitting}
            type="button"
            data-qa="transaction-submit-button"
          >
            {isSubmitting ? t.confirm.submitting : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
