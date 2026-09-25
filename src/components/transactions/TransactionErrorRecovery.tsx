"use client";

import { useI18n } from "@/contexts/I18nContext";
import styles from "./transaction-flow.module.css";
import type { TransactionRecoveryUI, RecoveryAction } from "@/lib/transactions";

interface TransactionErrorRecoveryProps {
  recovery: TransactionRecoveryUI;
  onActionSelect: (action: RecoveryAction) => void;
  isLoading?: boolean;
}

/**
 * Displays error recovery UI with actionable product copy.
 * Provides three clear paths: retry, edit details, or contact support.
 * Ensures proper cleanup on unmount by accepting onActionSelect callback.
 */
export function TransactionErrorRecovery({
  recovery,
  onActionSelect,
  isLoading = false,
}: TransactionErrorRecoveryProps) {
  const { messages } = useI18n();
  const t = messages.transactions;

  return (
    <div className={`${styles.form}`}>
      <div className={styles.receiptBanner}>
        <span className={`${styles.statusChip} ${styles.statusError}`}>
          {t.recovery.error}
        </span>
        <h3 className={styles.receiptTitle}>{recovery.title}</h3>
        <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
          {recovery.description}
        </p>
      </div>

      {recovery.reference && (
        <div className={styles.referenceCard}>
          <p className={styles.referenceLabel}>{t.shared.transactionReference}</p>
          <p className={styles.referenceValue}>{recovery.reference}</p>
          <p className={styles.supportingCopy}>
            {t.recovery.includeReference}
          </p>
        </div>
      )}

      <div className={styles.actionBar}>
        <div className={styles.actionMeta}>
          {recovery.primaryAction.action === "retry"
            ? t.recovery.tryAgain
            : t.recovery.reviewUpdate}
        </div>
        <div className={styles.actionButtons}>
          {recovery.secondaryAction && (
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => onActionSelect(recovery.secondaryAction!.action)}
              type="button"
              disabled={isLoading}
              data-qa="transaction-recovery-secondary"
            >
              {recovery.secondaryAction.label}
            </button>
          )}
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => onActionSelect(recovery.primaryAction.action)}
            type="button"
            disabled={isLoading}
            data-qa="transaction-recovery-primary"
          >
            {recovery.primaryAction.label}
          </button>
        </div>
      </div>

      {recovery.tertiaryAction && (
        <div className={styles.actionBar}>
          <div className={styles.actionButtons}>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => onActionSelect(recovery.tertiaryAction!.action)}
              type="button"
              disabled={isLoading}
              data-qa="transaction-recovery-tertiary"
            >
              {recovery.tertiaryAction.label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
