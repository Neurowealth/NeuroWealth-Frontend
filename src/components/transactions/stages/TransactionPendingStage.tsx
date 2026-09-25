/**
 * TransactionPendingStage.tsx
 *
 * Pending stage for transaction flow.
 * Shows loading state while transaction is processing.
 */

import { useI18n } from "@/contexts/I18nContext";
import { formatCurrency } from "@/lib/formatters";
import { PendingTransaction } from "@/lib/transactions";
import styles from "../transaction-flow.module.css";

interface TransactionPendingStageProps {
  pending: PendingTransaction;
}

export function TransactionPendingStage({
  pending,
}: TransactionPendingStageProps) {
  const { messages } = useI18n();
  const t = messages.transactions;

  return (
    <div
      className={`${styles.pendingCard} ${styles.form}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.pendingLayout}>
        <div
          className={styles.pendingSpinner}
          role="progressbar"
          aria-label={t.pending.processing}
        />
        <div className={styles.sectionHeading}>
          <h3 className={styles.sectionTitle}>{pending.statusLabel}</h3>
          <p className={styles.sectionCopy}>{pending.message}</p>
        </div>
      </div>

      <div className={styles.referenceCard}>
        <p className={styles.referenceLabel}>{t.shared.transactionReference}</p>
        <p className={styles.referenceValue}>{pending.reference}</p>
        <p className={styles.supportingCopy}>
          {t.pending.keepReference}
        </p>
      </div>

      <div className={styles.detailList}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.pending.requestedAmount}</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(pending.quote.amount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.shared.fees}</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(pending.quote.fee)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>{t.pending.settlementTarget}</span>
          <span className={styles.detailValue}>
            {pending.quote.estimatedSettlement}
          </span>
        </div>
      </div>
    </div>
  );
}
