"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./transaction-flow.module.css";
import { formatCurrency, formatTimestamp } from "@/lib/formatters";
import {
  buildPreviewSnapshot,
  buildStatusChips,
  buildTransactionReceipt,
  getDefaultTransactionValues,
  getTransactionContext,
  parsePreviewState,
  parseTransactionKind,
  PendingTransaction,
  TransactionFieldErrors,
  TransactionFormValues,
  TransactionKind,
  TransactionPreviewState,
  TransactionQuote,
  TransactionReceipt,
  validateTransactionValues,
} from "@/lib/transactions";
import { useSandbox } from "@/contexts/SandboxContext";

type ThemeMode = "light" | "dark";

function getTheme(searchParams: Pick<URLSearchParams, "get">): ThemeMode {
  return searchParams.get("theme") === "dark" ? "dark" : "light";
}

function getToneClassName(tone: "error" | "success" | "warning"): string {
  if (tone === "error") {
    return styles.statusError;
  }

  if (tone === "warning") {
    return styles.statusWarning;
  }

  return styles.statusSuccess;
}

function getInputStateClassName(
  value: string,
  error?: string,
  isValidated?: boolean,
): string {
  if (error) {
    return styles.inputError;
  }

  if (isValidated && value) {
    return styles.inputSuccess;
  }

  return "";
}

function sanitizeAmount(value: string): string {
  return value.replace(/[^\d.]/g, "");
}

export function TransactionFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCurrentScenario, isSandboxMode } = useSandbox();
  const timeoutRef = useRef<number | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(() => getTheme(searchParams));
  const [kind, setKind] = useState<TransactionKind>(() =>
    parseTransactionKind(searchParams.get("kind")),
  );
  const [preview, setPreview] = useState<TransactionPreviewState>(() =>
    parsePreviewState(searchParams.get("preview")),
  );
  const [stage, setStage] = useState<
    "form" | "confirm" | "pending" | "success" | "failure"
  >("form");
  const [formValues, setFormValues] = useState<TransactionFormValues>(() =>
    getDefaultTransactionValues(kind),
  );
  const [fieldErrors, setFieldErrors] = useState<TransactionFieldErrors>({});
  const [quote, setQuote] = useState<TransactionQuote | null>(null);
  const [pending, setPending] = useState<PendingTransaction | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const context = getTransactionContext(kind);
  const statusChips = buildStatusChips(kind, formValues);
  const scenario = getCurrentScenario("transactions");

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const snapshot = buildPreviewSnapshot(kind, preview);

    if (preview === "interactive") {
      setStage("form");
      setFormValues(getDefaultTransactionValues(kind));
      setFieldErrors({});
      setQuote(null);
      setPending(null);
      setReceipt(null);
      setRequestMessage(null);
      setIsSubmitting(false);
      return;
    }

    setStage(snapshot.stage);
    setFormValues(snapshot.form);
    setFieldErrors(snapshot.fieldErrors);
    setQuote(snapshot.quote);
    setPending(snapshot.pending);
    setReceipt(snapshot.receipt);
    setRequestMessage(null);
    setIsSubmitting(false);
  }, [kind, preview]);

  // Handle sandbox scenarios
  useEffect(() => {
    if (isSandboxMode && scenario !== "success") {
      if (scenario === "loading") {
        setIsSubmitting(true);
        setRequestMessage("Loading transaction data...");
        const timer = setTimeout(() => {
          setIsSubmitting(false);
          setRequestMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (scenario === "timeout") {
        setIsSubmitting(true);
        setRequestMessage("Request timed out. Please try again.");
        const timer = setTimeout(() => {
          setIsSubmitting(false);
          setRequestMessage("Connection timeout. Please check your network and retry.");
        }, 5000);
        return () => clearTimeout(timer);
      } else if (scenario === "partial-failure") {
        setRequestMessage("Partial service degradation. Some features may be unavailable.");
        setStage("form");
      } else if (scenario === "empty") {
        setStage("form");
        setFormValues(getDefaultTransactionValues(kind));
        setFieldErrors({});
        setQuote(null);
        setPending(null);
        setReceipt(null);
        setRequestMessage("No transaction data available.");
      }
    }
  }, [scenario, isSandboxMode, kind]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function syncRoute(
    nextTheme: ThemeMode,
    nextKind: TransactionKind,
    nextPreview: TransactionPreviewState,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", nextTheme);
    params.set("kind", nextKind);

    if (nextPreview === "interactive") {
      params.delete("preview");
    } else {
      params.set("preview", nextPreview);
    }

    startTransition(() => {
      router.replace(`/dashboard/transactions?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  function handleThemeChange(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    syncRoute(nextTheme, kind, preview);
  }

  function handleKindChange(nextKind: TransactionKind) {
    setKind(nextKind);
    syncRoute(theme, nextKind, preview);
  }

  function handlePreviewChange(nextPreview: TransactionPreviewState) {
    setPreview(nextPreview);
    syncRoute(theme, kind, nextPreview);
  }

  function updateField<K extends keyof TransactionFormValues>(
    field: K,
    value: TransactionFormValues[K],
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  }

  function handleMaxAmount() {
    updateField("amount", context.availableAmount.toFixed(2));
  }

  async function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (preview !== "interactive") {
      return;
    }

    const localErrors = validateTransactionValues(kind, formValues);

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setIsSubmitting(true);
    setRequestMessage(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "quote",
          kind,
          values: formValues,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const errorPayload = payload as {
          message?: string;
          fieldErrors?: TransactionFieldErrors;
        };
        setFieldErrors(errorPayload.fieldErrors ?? {});
        setRequestMessage(
          errorPayload.message ?? "Unable to prepare the confirmation step.",
        );
        return;
      }

      const successPayload = payload as { quote: TransactionQuote };
      setFieldErrors({});
      setQuote(successPayload.quote);
      setStage("confirm");
    } catch {
      setRequestMessage(
        "Quote request failed. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirm() {
    if (preview !== "interactive") {
      return;
    }

    setIsSubmitting(true);
    setRequestMessage(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "submit",
          kind,
          values: formValues,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const errorPayload = payload as {
          message?: string;
          fieldErrors?: TransactionFieldErrors;
        };
        setFieldErrors(errorPayload.fieldErrors ?? {});
        setRequestMessage(
          errorPayload.message ??
            "Submission failed before reaching the network.",
        );
        setStage("form");
        return;
      }

      const successPayload = payload as { pending: PendingTransaction };
      setPending(successPayload.pending);
      setQuote(successPayload.pending.quote);
      setStage("pending");

      timeoutRef.current = window.setTimeout(() => {
        const nextReceipt = buildTransactionReceipt(
          successPayload.pending,
          successPayload.pending.nextStatus === "failure"
            ? "failure"
            : "success",
        );

        setReceipt(nextReceipt);
        setStage(nextReceipt.status);
        setIsSubmitting(false);
      }, successPayload.pending.completionDelayMs);
    } catch {
      setRequestMessage("Submission failed before reaching the network.");
      setStage("form");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetFlow() {
    handlePreviewChange("interactive");
  }

  function currentStepIndex(): number {
    if (stage === "form") {
      return 0;
    }

    if (stage === "confirm") {
      return 1;
    }

    return 2;
  }

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
    <main className={styles.page}>
      <section className={styles.shell} data-theme={theme}>
        <div className={styles.content}>
          <div className={styles.topbar}>
            <div>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Transaction flows
              </span>
              <h1 className={styles.heading}>Deposit and withdrawal flow</h1>
              <p className={styles.intro}>
                Validate amounts and wallet conditions, confirm fees and request
                references, then review pending, success, and failure states
                from one mobile-friendly surface.
              </p>
              {isSandboxMode && (
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Sandbox: {scenario}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.topControls}>
              <div className={styles.controlPanel}>
                <p className={styles.controlLabel}>Theme preview</p>
                <div className={styles.segmentRow}>
                  {(["light", "dark"] as const).map((option) => (
                    <button
                      className={[
                        styles.segmentButton,
                        theme === option ? styles.segmentButtonActive : "",
                      ].join(" ")}
                      key={option}
                      onClick={() => handleThemeChange(option)}
                      type="button"
                    >
                      {option === "light" ? "Light mode" : "Dark mode"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlPanel}>
                <p className={styles.controlLabel}>Screenshot states</p>
                <div className={styles.segmentRow}>
                  {(
                    [
                      "interactive",
                      "validation",
                      "confirm",
                      "pending",
                      "success",
                      "failure",
                    ] as const
                  ).map((option) => (
                    <button
                      className={[
                        styles.segmentButton,
                        preview === option ? styles.segmentButtonActive : "",
                      ].join(" ")}
                      key={option}
                      onClick={() => handlePreviewChange(option)}
                      type="button"
                    >
                      {option === "interactive" ? "Live flow" : option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            <section className={`${styles.card} ${styles.mainCard}`}>
              <div className={styles.kindTabs}>
                {(["deposit", "withdrawal"] as const).map((option) => (
                  <button
                    className={[
                      styles.kindButton,
                      kind === option ? styles.kindButtonActive : "",
                    ].join(" ")}
                    key={option}
                    onClick={() => handleKindChange(option)}
                    type="button"
                  >
                    {option === "deposit" ? "Deposit" : "Withdraw"}
                  </button>
                ))}
              </div>

              <div className={styles.sectionHeading}>
                <h2 className={styles.sectionTitle}>{context.title}</h2>
                <p className={styles.sectionCopy}>{context.intro}</p>
              </div>

              <div className={styles.statusRow}>
                {statusChips.map((chip) => (
                  <span
                    className={`${styles.statusChip} ${getToneClassName(chip.tone)}`}
                    key={chip.label}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>

              <div className={styles.stepper}>
                {[
                  { label: "Step 1", value: "Enter details" },
                  { label: "Step 2", value: "Confirm" },
                  { label: "Step 3", value: "Track result" },
                ].map((step, index) => (
                  <div
                    className={[
                      styles.step,
                      currentStepIndex() === index ? styles.stepActive : "",
                    ].join(" ")}
                    key={step.label}
                  >
                    <p className={styles.stepLabel}>{step.label}</p>
                    <p className={styles.stepValue}>{step.value}</p>
                  </div>
                ))}
              </div>

              {stage === "form" ? (
                <form className={styles.form} onSubmit={handleReview}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.fieldLabel} htmlFor="amount">
                        {context.amountLabel}
                      </label>
                      <span className={styles.fieldHint}>
                        Available {formatCurrency(context.availableAmount)}
                      </span>
                    </div>

                    <div className={styles.amountRow}>
                      <input
                        className={amountInputClassName}
                        id="amount"
                        inputMode="decimal"
                        onChange={(event) =>
                          updateField(
                            "amount",
                            sanitizeAmount(event.target.value),
                          )
                        }
                        placeholder="0.00"
                        value={formValues.amount}
                      />
                      <button
                        className={styles.inlineButton}
                        onClick={handleMaxAmount}
                        type="button"
                      >
                        Max
                      </button>
                    </div>

                    <p className={styles.supportingCopy}>
                      {context.amountHint}
                    </p>
                    {fieldErrors.amount ? (
                      <p
                        className={`${styles.fieldMessage} ${styles.errorMessage}`}
                      >
                        {fieldErrors.amount}
                      </p>
                    ) : formValues.amount ? (
                      <p
                        className={`${styles.fieldMessage} ${styles.successMessage}`}
                      >
                        Amount looks valid for the next confirmation step.
                      </p>
                    ) : null}
                  </div>

                  <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.fieldLabel} htmlFor="wallet">
                        {context.walletLabel}
                      </label>
                      <span className={styles.fieldHint}>
                        {context.reviewLabel}
                      </span>
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
                              updateField(
                                "walletConnected",
                                !formValues.walletConnected,
                              )
                            }
                            type="button"
                          >
                            {formValues.walletConnected
                              ? "Disconnect"
                              : "Reconnect"}
                          </button>
                        </div>
                        <p className={styles.supportingCopy}>
                          {context.walletHint}
                        </p>
                        {fieldErrors.walletConnected ? (
                          <p
                            className={`${styles.fieldMessage} ${styles.errorMessage}`}
                          >
                            {fieldErrors.walletConnected}
                          </p>
                        ) : (
                          <p
                            className={`${styles.fieldMessage} ${styles.successMessage}`}
                          >
                            Deposit uses the connected funding wallet shown
                            above.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <input
                          className={walletInputClassName}
                          id="wallet"
                          onChange={(event) =>
                            updateField(
                              "walletAddress",
                              event.target.value.toUpperCase().trim(),
                            )
                          }
                          placeholder="G..."
                          value={formValues.walletAddress}
                        />
                        <div className={styles.connectRow}>
                          <button
                            className={styles.walletToggle}
                            onClick={() =>
                              updateField(
                                "walletConnected",
                                !formValues.walletConnected,
                              )
                            }
                            type="button"
                          >
                            {formValues.walletConnected
                              ? "Disconnect vault"
                              : "Reconnect vault"}
                          </button>
                          <span className={styles.fieldHint}>
                            {context.walletHint}
                          </span>
                        </div>
                        {fieldErrors.walletAddress ? (
                          <p
                            className={`${styles.fieldMessage} ${styles.errorMessage}`}
                          >
                            {fieldErrors.walletAddress}
                          </p>
                        ) : (
                          <p
                            className={`${styles.fieldMessage} ${styles.successMessage}`}
                          >
                            Destination address passes the Stellar public key
                            format check.
                          </p>
                        )}
                        {fieldErrors.walletConnected ? (
                          <p
                            className={`${styles.fieldMessage} ${styles.errorMessage}`}
                          >
                            {fieldErrors.walletConnected}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>

                  {requestMessage ? (
                    <p
                      className={`${styles.fieldMessage} ${styles.warningMessage}`}
                    >
                      {requestMessage}
                    </p>
                  ) : null}

                  <div className={styles.actionBar}>
                    <div className={styles.actionMeta}>
                      Primary action stays anchored at the bottom on mobile for
                      longer forms.
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        disabled={isSubmitting}
                        type="submit"
                      >
                        {isSubmitting
                          ? "Preparing..."
                          : context.primaryActionLabel}
                      </button>
                    </div>
                  </div>
                </form>
              ) : null}

              {stage === "confirm" && quote ? (
                <div className={styles.form}>
                  <div className={styles.summaryCard}>
                    <p className={styles.heroAmount}>
                      {formatCurrency(quote.amount)}
                    </p>
                    <p className={styles.heroSubtext}>
                      {kind === "deposit"
                        ? "Deposit amount"
                        : "Withdrawal amount"}
                    </p>
                  </div>

                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Amount</span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(quote.amount)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Fees</span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(quote.fee)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        {kind === "deposit"
                          ? "Total debit"
                          : "Net destination amount"}
                      </span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(
                          kind === "deposit"
                            ? quote.totalDebit
                            : quote.netAmount,
                        )}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Strategy</span>
                      <span className={styles.detailValue}>
                        {quote.strategyLabel}
                      </span>
                    </div>
                  </div>

                  <div className={styles.referenceCard}>
                    <p className={styles.referenceLabel}>
                      Transaction reference
                    </p>
                    <p className={styles.referenceValue}>{quote.reference}</p>
                    <p className={styles.supportingCopy}>
                      Share this reference with support if you need help tracing
                      the request.
                    </p>
                  </div>

                  <div className={styles.actionBar}>
                    <div className={styles.actionMeta}>
                      Confirm after reviewing amount, fees, and reference.
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => setStage("form")}
                        type="button"
                      >
                        Back
                      </button>
                      <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={handleConfirm}
                        type="button"
                      >
                        {context.confirmActionLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {stage === "pending" && pending ? (
                <div className={`${styles.pendingCard} ${styles.form}`}>
                  <div className={styles.pendingLayout}>
                    <div className={styles.pendingSpinner} />
                    <div className={styles.sectionHeading}>
                      <h3 className={styles.sectionTitle}>
                        {pending.statusLabel}
                      </h3>
                      <p className={styles.sectionCopy}>{pending.message}</p>
                    </div>
                  </div>

                  <div className={styles.referenceCard}>
                    <p className={styles.referenceLabel}>
                      Transaction reference
                    </p>
                    <p className={styles.referenceValue}>{pending.reference}</p>
                    <p className={styles.supportingCopy}>
                      Keep this reference visible while the transaction is
                      moving through the network.
                    </p>
                  </div>

                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        Requested amount
                      </span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(pending.quote.amount)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Fees</span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(pending.quote.fee)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        Settlement target
                      </span>
                      <span className={styles.detailValue}>
                        {pending.quote.estimatedSettlement}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {(stage === "success" || stage === "failure") && receipt ? (
                <div className={`${styles.receiptCard} ${styles.form}`}>
                  <div className={styles.receiptBanner}>
                    <span
                      className={`${styles.statusChip} ${
                        receipt.status === "success"
                          ? styles.statusSuccess
                          : styles.statusError
                      }`}
                    >
                      {receipt.status === "success" ? "Success" : "Failed"}
                    </span>
                    <h3 className={styles.receiptTitle}>{receipt.message}</h3>
                    {receipt.failureReason ? (
                      <p
                        className={`${styles.fieldMessage} ${styles.errorMessage}`}
                      >
                        {receipt.failureReason}
                      </p>
                    ) : (
                      <p
                        className={`${styles.fieldMessage} ${styles.successMessage}`}
                      >
                        Receipt includes the amount, fees, and reference for
                        follow-up.
                      </p>
                    )}
                  </div>

                  <div className={styles.referenceCard}>
                    <p className={styles.referenceLabel}>
                      Transaction reference
                    </p>
                    <p className={styles.referenceValue}>{receipt.reference}</p>
                    <p className={styles.supportingCopy}>
                      {receipt.explorerLabel ??
                        "Retry after reviewing the validation state and updated quote."}
                    </p>
                  </div>

                  <div className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Amount</span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(receipt.quote.amount)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Fees</span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(receipt.quote.fee)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        {kind === "deposit"
                          ? "Credited amount"
                          : "Destination amount"}
                      </span>
                      <span
                        className={`${styles.detailValue} ${styles.detailValueMono}`}
                      >
                        {formatCurrency(receipt.quote.netAmount)}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Settled at</span>
                      <span className={styles.detailValue}>
                        {formatTimestamp(receipt.settledAt)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.actionBar}>
                    <div className={styles.actionMeta}>
                      {receipt.status === "success"
                        ? "Start a new transaction or switch flows."
                        : "Retry after reviewing the updated validation details."}
                    </div>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={resetFlow}
                        type="button"
                      >
                        New transaction
                      </button>
                      <button
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={() =>
                          handleKindChange(
                            kind === "deposit" ? "withdrawal" : "deposit",
                          )
                        }
                        type="button"
                      >
                        Switch flow
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            <aside className={`${styles.card} ${styles.asideCard}`}>
              <div className={styles.asideSection}>
                <h3 className={styles.asideTitle}>Wallet conditions</h3>
                <div className={styles.asideList}>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Connected wallet</span>
                    <span className={styles.asideValue}>
                      {context.connectedWalletLabel}
                    </span>
                    <span
                      className={`${styles.asideValue} ${styles.asideValueMono}`}
                    >
                      {context.connectedWalletAddress}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Available balance</span>
                    <span
                      className={`${styles.asideValue} ${styles.asideValueMono}`}
                    >
                      {formatCurrency(context.availableAmount)}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Strategy</span>
                    <span className={styles.asideValue}>
                      {context.strategyLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.asideSection}>
                <h3 className={styles.asideTitle}>Validation rules</h3>
                <div className={styles.asideList}>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Minimum</span>
                    <span className={styles.asideValue}>
                      {formatCurrency(context.minAmount)}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Fees</span>
                    <span className={styles.asideValue}>
                      {formatCurrency(context.fee)}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Lifecycle</span>
                    <span className={styles.asideValue}>
                      Pending, success, and failure states included
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.asideSection}>
                <h3 className={styles.asideTitle}>Routes</h3>
                <div className={styles.linkRow}>
                  <Link
                    className={styles.inlineLink}
                    href={`/dashboard?theme=${theme}`}
                  >
                    Portfolio overview
                  </Link>
                  <Link
                    className={styles.inlineLink}
                    href={`/dashboard/transactions?theme=${theme}`}
                  >
                    Transaction flow
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
