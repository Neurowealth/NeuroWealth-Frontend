/**
 * TransactionReceiptStage.tsx
 *
 * Receipt stage for transaction flow.
 * Displays success or failure results with transaction details.
 */

import { useI18n } from "@/contexts/I18nContext";
import { formatCurrency, formatTimestamp } from "@/lib/formatters";
import { TransactionKind, TransactionReceipt } from "@/lib/transactions";
import styles from "../transaction-flow.module.css";

interface TransactionReceiptStageProps {
  kind: TransactionKind;
  receipt: TransactionReceipt;
  onNewTransaction: () => void;
  onSwitchFlow: () => void;
}

export function TransactionReceiptStage({
  kind,
  receipt,
  onNewTransaction,
  onSwitchFlow,
}: TransactionReceiptStageProps) {
  const { messages } = useI18n();
  const t = messages.transactions;

  return (
    <div
      className={`${styles.receiptCard} ${styles.form}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.receiptBanner}>
        <span
          className={`${styles.statusChip} ${
            receipt.status === "success"
              ? styles.statusSuccess
              : styles.statusError
          }`}
        >
          {receipt.status === "success"
            ? t.receipt.success
            : t.receipt.failed}
        </span>
        <h3 className={styles.receiptTitle}>{receipt.message}</h3>
        {receipt.failureReason ? (
          <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
            {receipt.failureReason}
          </p>
        ) : (
          <p className={`${styles.fieldMessage} ${styles.successMessage}`}>
            {t.receipt.receiptIncludes}
          </p>
        )}
      </div>

      <div className={styles.referenceCard}>
        <p className={styles.referenceLabel}>{t.shared.transactionReference}</p>
        <p className={styles.referenceValue}>{receipt.reference}</p>
        <p className={styles.supportingCopy}>
          {receipt.explorerLabel ??
            t.receipt.retryAfterReview}
        </p>
      </div>

      <div className={styles.detailList}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.shared.amount}</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(receipt.quote.amount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.shared.fees}</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(receipt.quote.fee)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            {kind === "deposit"
              ? t.receipt.creditedAmount
              : t.receipt.destinationAmount}
          </span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(receipt.quote.netAmount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.receipt.settledAt}</span>
          <span className={styles.detailValue}>
            {formatTimestamp(receipt.settledAt)}
          </span>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionMeta}>
          {receipt.status === "success"
            ? t.receipt.startNew
            : t.receipt.retryUpdated}
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onNewTransaction}
            type="button"
          >
            {t.receipt.newTransaction}
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={onSwitchFlow}
            type="button"
          >
            {t.receipt.switchFlow}
          </button>
        </div>
      </div>
    </div>
  );
}
