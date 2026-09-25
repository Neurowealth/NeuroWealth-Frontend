export type TransactionKind = "deposit" | "withdrawal";
export type TransactionStage = "form" | "confirm" | "pending" | "success" | "failure";
export type TransactionPreviewState =
  | "interactive"
  | "validation"
  | "confirm"
  | "pending"
  | "success"
  | "failure";
export type ValidationTone = "error" | "success" | "warning";

import { random } from "./seeded-rng";

// Error recovery types
export type RecoveryAction = "retry" | "edit" | "support";
export type ErrorMode =
  | "network_error"
  | "timeout"
  | "server_error"
  | "validation_error"
  | "quota_error"
  | "state_conflict"
  | "unknown_error";

export interface TransactionRecoveryUI {
  title: string;
  description: string;
  primaryAction: {
    label: string;
    action: RecoveryAction;
  };
  secondaryAction?: {
    label: string;
    action: RecoveryAction;
  };
  tertiaryAction?: {
    label: string;
    action: RecoveryAction;
  };
  reference?: string;
  supportEmail?: string;
}

export interface TransactionFormValues {
  amount: string;
  walletAddress: string;
  walletConnected: boolean;
}

export interface TransactionFieldErrors {
  amount?: string;
  walletAddress?: string;
  walletConnected?: string;
  form?: string;
}

export interface TransactionQuote {
  kind: TransactionKind;
  amount: number;
  fee: number;
  netAmount: number;
  totalDebit: number;
  reference: string;
  walletAddress: string;
  walletLabel: string;
  strategyLabel: string;
  estimatedSettlement: string;
}

export interface PendingTransaction {
  kind: TransactionKind;
  reference: string;
  quote: TransactionQuote;
  statusLabel: string;
  message: string;
  completionDelayMs: number;
  nextStatus: "success" | "failure";
  failureReason: string | null;
}

export interface TransactionReceipt {
  kind: TransactionKind;
  status: "success" | "failure";
  reference: string;
  quote: TransactionQuote;
  message: string;
  failureReason: string | null;
  explorerLabel: string | null;
  settledAt: string;
}

export interface TransactionContext {
  kind: TransactionKind;
  title: string;
  intro: string;
  primaryActionLabel: string;
  confirmActionLabel: string;
  amountLabel: string;
  amountHint: string;
  walletLabel: string;
  walletHint: string;
  connectedWalletLabel: string;
  connectedWalletAddress: string;
  minAmount: number;
  fee: number;
  availableAmount: number;
  strategyLabel: string;
  settlementLabel: string;
  reviewLabel: string;
}

export interface TransactionPreviewSnapshot {
  stage: TransactionStage;
  form: TransactionFormValues;
  fieldErrors: TransactionFieldErrors;
  quote: TransactionQuote | null;
  pending: PendingTransaction | null;
  receipt: TransactionReceipt | null;
}

export interface TransactionRequestPayload {
  intent: "quote" | "submit";
  kind: TransactionKind;
  values: TransactionFormValues;
  simulation?: "auto" | "success" | "failure";
}

export interface TransactionQuoteResponse {
  quote: TransactionQuote;
}

export interface TransactionSubmitResponse {
  pending: PendingTransaction;
}

const DEPOSIT_WALLET = {
  label: "Freighter funding wallet",
  address: "GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G",
};

const DESTINATION_WALLET =
  "GCFXJ4K7R2UTJHI4B74ZLGIBSAWZSA3O76UR3X5IYK6YG33BZINM2F3B";

const NETWORK_FEE = {
  deposit: 0.06,
  withdrawal: 0.38,
} as const;

const AVAILABLE_AMOUNT = {
  deposit: 18540.22,
  withdrawal: 12480.54,
} as const;

const MINIMUM_AMOUNT = {
  deposit: 10,
  withdrawal: 10,
} as const;

const STRATEGY_LABEL = "Balanced";

const STELLAR_ADDRESS_PATTERN = /^G[A-Z2-7]{55}$/;

// Error recovery product copy mapping for each failure mode
function getRecoveryCopy(t: any): Record<ErrorMode, TransactionRecoveryUI> {
  return {
    network_error: {
      title: t.networkErrorTitle,
      description: t.networkErrorDesc,
      primaryAction: { label: t.actionRetry, action: "retry" },
      secondaryAction: { label: t.actionEdit, action: "edit" },
      tertiaryAction: { label: t.actionSupport, action: "support" },
      supportEmail: "support@neurowealth.com",
    },
    timeout: {
      title: t.timeoutTitle,
      description: t.timeoutDesc,
      primaryAction: { label: t.actionRetry, action: "retry" },
      secondaryAction: { label: t.actionEdit, action: "edit" },
      tertiaryAction: { label: t.actionSupport, action: "support" },
      supportEmail: "support@neurowealth.com",
    },
    server_error: {
      title: t.serverErrorTitle,
      description: t.serverErrorDesc,
      primaryAction: { label: t.actionRetry, action: "retry" },
      secondaryAction: { label: t.actionEdit, action: "edit" },
      tertiaryAction: { label: t.actionSupport, action: "support" },
      supportEmail: "support@neurowealth.com",
    },
    validation_error: {
      title: t.validationErrorTitle,
      description: t.validationErrorDesc,
      primaryAction: { label: t.actionEdit, action: "edit" },
      secondaryAction: { label: t.actionBack, action: "edit" },
      supportEmail: "support@neurowealth.com",
    },
    quota_error: {
      title: t.quotaErrorTitle,
      description: t.quotaErrorDesc,
      primaryAction: { label: t.actionEdit, action: "edit" },
      supportEmail: "support@neurowealth.com",
    },
    state_conflict: {
      title: t.stateConflictTitle,
      description: t.stateConflictDesc,
      primaryAction: { label: t.actionReview, action: "edit" },
      tertiaryAction: { label: t.actionSupport, action: "support" },
      supportEmail: "support@neurowealth.com",
    },
    unknown_error: {
      title: t.unknownErrorTitle,
      description: t.unknownErrorDesc,
      primaryAction: { label: t.actionRetry, action: "retry" },
      secondaryAction: { label: t.actionEdit, action: "edit" },
      tertiaryAction: { label: t.actionSupport, action: "support" },
      supportEmail: "support@neurowealth.com",
    },
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function generateReference(kind: TransactionKind): string {
  const prefix = kind === "deposit" ? "DEP" : "WDR";
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const suffix = random().toString(36).slice(2, 8).toUpperCase();

  return `NW-${prefix}-${stamp}-${suffix}`;
}

export function parseTransactionKind(value: string | null): TransactionKind {
  return value === "withdrawal" ? "withdrawal" : "deposit";
}

export function parsePreviewState(value: string | null): TransactionPreviewState {
  if (
    value === "validation" ||
    value === "confirm" ||
    value === "pending" ||
    value === "success" ||
    value === "failure"
  ) {
    return value;
  }

  return "interactive";
}

export function getTransactionContext(kind: TransactionKind, t: any): TransactionContext {
  if (kind === "withdrawal") {
    return {
      kind,
      title: t.withdrawFunds,
      intro: t.withdrawIntro,
      primaryActionLabel: t.reviewWithdrawal,
      confirmActionLabel: t.confirmWithdrawal,
      amountLabel: t.withdrawalAmount,
      amountHint: t.withdrawHint,
      walletLabel: t.destinationWallet,
      walletHint: t.destinationHint,
      connectedWalletLabel: t.vaultReady,
      connectedWalletAddress: DEPOSIT_WALLET.address,
      minAmount: MINIMUM_AMOUNT.withdrawal,
      fee: NETWORK_FEE.withdrawal,
      availableAmount: AVAILABLE_AMOUNT.withdrawal,
      strategyLabel: STRATEGY_LABEL,
      settlementLabel: t.sameDay,
      reviewLabel: t.treasuryReview,
    };
  }

  return {
    kind,
    title: t.addCapital,
    intro: t.depositIntro,
    primaryActionLabel: t.reviewDeposit,
    confirmActionLabel: t.confirmDeposit,
    amountLabel: t.depositAmount,
    amountHint: t.depositHint,
    walletLabel: t.fundingWallet,
    walletHint: t.fundingHint,
    connectedWalletLabel: t.freighterConnected,
    connectedWalletAddress: DEPOSIT_WALLET.address,
    minAmount: MINIMUM_AMOUNT.deposit,
    fee: NETWORK_FEE.deposit,
    availableAmount: AVAILABLE_AMOUNT.deposit,
    strategyLabel: STRATEGY_LABEL,
    settlementLabel: t.usuallyCompletes,
    reviewLabel: t.networkFee,
  };
}

export function getDefaultTransactionValues(kind: TransactionKind): TransactionFormValues {
  if (kind === "withdrawal") {
    return {
      amount: "",
      walletAddress: DESTINATION_WALLET,
      walletConnected: true,
    };
  }

  return {
    amount: "",
    walletAddress: DEPOSIT_WALLET.address,
    walletConnected: true,
  };
}

export function parseAmount(value: string): number {
  const normalized = value.replace(/,/g, "").trim();

  // Only a plain decimal number (optional leading "-", digits, optional "."):
  // this alone rejects hexadecimal (0x...) and scientific notation (e/E)
  // input, since neither can match a string made only of digits and ".".
  if (!/^-?\d*\.?\d+$/.test(normalized)) {
    return Number.NaN;
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount)) {
    return Number.NaN;
  }

  return amount;
}

export function validateTransactionValues(kind: TransactionKind, values: TransactionFormValues, t: any): TransactionFieldErrors {
  const context = getTransactionContext(kind, t.context);
  const amount = parseAmount(values.amount);
  const errors: TransactionFieldErrors = {};

  if (!values.walletConnected) {
    errors.walletConnected = kind === "deposit" ? t.validation.connectFunding : t.validation.reconnectVault;
  }

  if (!values.amount.trim()) {
    errors.amount = t.validation.enterAmount;
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = t.validation.validAmount;
  } else if (amount < context.minAmount) {
    errors.amount = kind === "deposit" ? t.validation.minDeposit(context.minAmount) : t.validation.minWithdrawal(context.minAmount);
  } else if (amount > context.availableAmount) {
    errors.amount = kind === "deposit" ? t.validation.fundingAvailable(context.availableAmount.toFixed(2)) : t.validation.withdrawAvailable(context.availableAmount.toFixed(2));
  }

  if (kind === "withdrawal") {
    if (!values.walletAddress.trim()) {
      errors.walletAddress = t.validation.enterDestination;
    } else if (!STELLAR_ADDRESS_PATTERN.test(values.walletAddress.trim())) {
      errors.walletAddress = t.validation.validStellarAddress;
    }
  }

  return errors;
}

export function buildTransactionQuote(kind: TransactionKind, values: TransactionFormValues, tContext: any, reference = generateReference(kind)): TransactionQuote {
  const context = getTransactionContext(kind, t.context);
  const amount = roundCurrency(parseAmount(values.amount));
  const fee = NETWORK_FEE[kind];
  const totalDebit = roundCurrency(kind === "deposit" ? amount + fee : amount);
  const netAmount = roundCurrency(kind === "deposit" ? amount : amount - fee);

  return {
    kind,
    amount,
    fee,
    netAmount,
    totalDebit,
    reference,
    walletAddress: values.walletAddress.trim(),
    walletLabel: context.walletLabel,
    strategyLabel: context.strategyLabel,
    estimatedSettlement: context.settlementLabel,
  };
}

export function buildPendingTransaction(kind: TransactionKind, values: TransactionFormValues, tPending: any, tContext: any, nextStatus: "success" | "failure" = "success"): PendingTransaction {
  const quote = buildTransactionQuote(kind, values, tContext);

  return {
    kind,
    reference: quote.reference,
    quote,
    statusLabel: tPending.statusLabel,
    message: kind === "deposit" ? tPending.submittingDeposit : tPending.submittingWithdrawal,
    completionDelayMs: 1600,
    nextStatus,
    failureReason: nextStatus === "failure" ? (kind === "deposit" ? tPending.feeExpired : tPending.liquidityChanged) : null,
  };
}

export function buildTransactionReceipt(pending: PendingTransaction, status: "success" | "failure", tReceipt: any): TransactionReceipt {
  return {
    kind: pending.kind,
    status,
    reference: pending.reference,
    quote: pending.quote,
    message: status === "success" ? (pending.kind === "deposit" ? tReceipt.depositConfirmed : tReceipt.withdrawalConfirmed) : tReceipt.failed,
    failureReason: status === "failure" ? pending.failureReason : null,
    explorerLabel: status === "success" ? tReceipt.explorerAvailable : null,
    settledAt: new Date().toISOString(),
  };
}

export function buildPreviewSnapshot(kind: TransactionKind, preview: TransactionPreviewState, t: any): TransactionPreviewSnapshot {
  const baseValues = getDefaultTransactionValues(kind);

  if (preview === "validation") {
    return {
      stage: "form",
      form:
        kind === "withdrawal"
          ? { amount: "15000", walletAddress: "BAD-ADDRESS", walletConnected: true }
          : { amount: "", walletAddress: DEPOSIT_WALLET.address, walletConnected: false },
      fieldErrors:
        kind === "withdrawal"
          ? {
              amount: t.validation.withdrawAvailable("12480.54"),
              walletAddress: t.validation.validStellarAddress,
            }
          : {
              amount: t.validation.enterAmount,
              walletConnected: t.validation.connectFunding,
            },
      quote: null,
      pending: null,
      receipt: null,
    };
  }

  if (preview === "confirm") {
    const form =
      kind === "withdrawal"
        ? { ...baseValues, amount: "4200" }
        : { ...baseValues, amount: "2500" };

    return {
      stage: "confirm",
      form,
      fieldErrors: {},
      quote: buildTransactionQuote(kind, form, t.context, `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-CNFRM`),
      pending: null,
      receipt: null,
    };
  }

  if (preview === "pending") {
    const form =
      kind === "withdrawal"
        ? { ...baseValues, amount: "4200" }
        : { ...baseValues, amount: "2500" };
    const pending = buildPendingTransaction(kind, form, t.pending, t.context);

    pending.reference = `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-PEND`;
    pending.quote.reference = pending.reference;

    return {
      stage: "pending",
      form,
      fieldErrors: {},
      quote: pending.quote,
      pending,
      receipt: null,
    };
  }

  if (preview === "success" || preview === "failure") {
    const form =
      kind === "withdrawal"
        ? { ...baseValues, amount: "4200" }
        : { ...baseValues, amount: "2500" };
    const pending = buildPendingTransaction(kind, form, t.pending, t.context, preview === "success" ? "success" : "failure");

    pending.reference = `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-${preview.toUpperCase()}`;
    pending.quote.reference = pending.reference;

    return {
      stage: preview,
      form,
      fieldErrors: {},
      quote: pending.quote,
      pending,
      receipt: buildTransactionReceipt(pending, preview, t.receipt),
    };
  }

  return {
    stage: "form",
    form: baseValues,
    fieldErrors: {},
    quote: null,
    pending: null,
    receipt: null,
  };
}

export function buildStatusChips(kind: TransactionKind, values: TransactionFormValues, t: any): Array<{ label: string; tone: ValidationTone }> {
  const context = getTransactionContext(kind, t.context);

  return [
    {
      label: values.walletConnected ? context.connectedWalletLabel : t.statusChips.walletRequired,
      tone: values.walletConnected ? "success" : "error",
    },
    {
      label: context.settlementLabel,
      tone: "warning",
    },
    {
      label: kind === "deposit" ? t.statusChips.depositCapacity(context.availableAmount.toFixed(0)) : t.statusChips.withdrawalCapacity(context.availableAmount.toFixed(0)),
      tone: "success",
    },
  ];
}

/**
 * Maps API error codes to ErrorMode for product copy and recovery actions.
 * This ensures network and server errors are actionable: retry, edit amount, or contact support.
 */
export function mapErrorCodeToErrorMode(code: string): ErrorMode {
  switch (code) {
    case "NETWORK_ERROR":
      return "network_error";
    case "REQUEST_TIMEOUT":
      return "timeout";
    case "VALIDATION_FAILED":
    case "INVALID_AMOUNT":
    case "INVALID_WALLET":
      return "validation_error";
    case "INSUFFICIENT_BALANCE":
    case "QUOTA_EXCEEDED":
    case "RATE_LIMITED":
      return "quota_error";
    case "STATE_CONFLICT":
    case "CONCURRENT_UPDATE":
      return "state_conflict";
    case "INVALID_JSON":
    case "INVALID_ENVELOPE":
    case "SERVICE_UNAVAILABLE":
    case "INTERNAL_SERVER_ERROR":
      return "server_error";
    default:
      return "unknown_error";
  }
}

/**
 * Builds the recovery UI instructions for a given error.
 * Accepts error code or error mode, returns actionable product copy with retry/edit/support options.
 */
export function getTransactionRecoveryUI(
  codeOrMode: string,
  t: any,
  reference?: string,
): TransactionRecoveryUI {
  const normalized = codeOrMode.toLowerCase() as ErrorMode;
  const copyMap = getRecoveryCopy(t);
  const mode: ErrorMode =
    normalized in copyMap
      ? normalized
      : mapErrorCodeToErrorMode(codeOrMode);

  const copy = copyMap[mode] || copyMap.unknown_error;

  return {
    ...copy,
    reference: reference || undefined,
  };
}

