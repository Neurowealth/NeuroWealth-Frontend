import fs from 'fs';
import path from 'path';

const messagesPath = path.join(process.cwd(), 'src/lib/i18n/messages.ts');
let msgContent = fs.readFileSync(messagesPath, 'utf8');

const enDomain = `
      domain: {
        context: {
          withdrawFunds: "Withdraw funds",
          withdrawIntro: "Move settled capital out of NeuroWealth with clear validation and a traceable receipt.",
          reviewWithdrawal: "Review withdrawal",
          confirmWithdrawal: "Confirm withdrawal",
          withdrawalAmount: "Withdrawal amount",
          withdrawHint: "Minimum withdrawal is 10 USDC. Amounts above 10,000 USDC may require an extra treasury check.",
          destinationWallet: "Destination wallet",
          destinationHint: "Enter a Stellar public address that starts with G. We validate before confirmation.",
          vaultReady: "Vault account ready",
          sameDay: "Same-day settlement",
          treasuryReview: "Treasury review may apply",
          addCapital: "Add capital",
          depositIntro: "Deposit USDC from your connected wallet and confirm the amount, fees, and request reference before submission.",
          reviewDeposit: "Review deposit",
          confirmDeposit: "Confirm deposit",
          depositAmount: "Deposit amount",
          depositHint: "Minimum deposit is 10 USDC. Stellar network fees stay separate from the credited deposit amount.",
          fundingWallet: "Funding wallet",
          fundingHint: "Use the connected Freighter wallet for the funding step. Disconnecting blocks submission until you reconnect.",
          freighterConnected: "Freighter connected",
          usuallyCompletes: "Usually completes in under 20 seconds",
          networkFee: "Network fee shown at confirmation",
        },
        validation: {
          connectFunding: "Connect a funding wallet before submitting a deposit.",
          reconnectVault: "Reconnect your vault wallet before withdrawing funds.",
          enterAmount: "Enter an amount to continue.",
          validAmount: "Enter a valid amount greater than 0.",
          minDeposit: (min) => \`Minimum deposit amount is \${min} USDC.\`,
          minWithdrawal: (min) => \`Minimum withdrawal amount is \${min} USDC.\`,
          fundingAvailable: (amt) => \`Funding wallet only has \${amt} USDC available.\`,
          withdrawAvailable: (amt) => \`Available to withdraw is \${amt} USDC.\`,
          enterDestination: "Enter a destination wallet address.",
          validStellarAddress: "Use a valid Stellar public address that starts with G.",
        },
        pending: {
          statusLabel: "Pending on Stellar",
          submittingDeposit: "Submitting your deposit and waiting for network confirmation.",
          submittingWithdrawal: "Submitting your withdrawal and waiting for liquidity settlement.",
          feeExpired: "Network fee estimate expired before submission. Refresh the quote and try again.",
          liquidityChanged: "Treasury liquidity changed mid-flight. Retry after reviewing the updated amount.",
        },
        receipt: {
          depositConfirmed: "Deposit confirmed and added to your active strategy.",
          withdrawalConfirmed: "Withdrawal confirmed and ready for your destination wallet.",
          failed: "Transaction failed before final settlement.",
          explorerAvailable: "Explorer reference available after backend wiring",
        },
        statusChips: {
          walletRequired: "Wallet required",
          depositCapacity: (amt) => \`Deposit capacity \${amt}\`,
          withdrawalCapacity: (amt) => \`Available \${amt}\`,
        },
        recovery: {
          networkErrorTitle: "Connection lost",
          networkErrorDesc: "Your connection to the service was interrupted. Please check your network and try again, or contact support if the problem persists.",
          timeoutTitle: "Request timed out",
          timeoutDesc: "The server took too long to respond. Your amount and wallet settings are still saved. Retry the request or adjust your amount and try again.",
          serverErrorTitle: "Service experiencing issues",
          serverErrorDesc: "Service is temporarily unavailable or experiencing issues. Your details are saved. Try again in a few moments, or contact support for assistance.",
          validationErrorTitle: "Validation failed",
          validationErrorDesc: "The amount or wallet details didn't pass validation. Review your entries and make corrections before retrying.",
          quotaErrorTitle: "Amount exceeds limit",
          quotaErrorDesc: "The amount exceeds your available balance or transaction limit. Adjust the amount to a lower value and try again.",
          stateConflictTitle: "Account state changed",
          stateConflictDesc: "Your account balance, wallet, or transaction status changed. Review your current balance and wallet settings, then retry.",
          unknownErrorTitle: "Something went wrong",
          unknownErrorDesc: "An unexpected error occurred while processing your transaction. Your details are saved. Please try again or contact support for help.",
          actionRetry: "Retry request",
          actionEdit: "Edit details",
          actionSupport: "Contact support",
          actionBack: "Go back",
          actionReview: "Review and retry",
        },
      },
`;

const frDomain = enDomain;

const parts = msgContent.split('loadingText: "Loading history...",\\n      },');
if (parts.length === 2) {
  msgContent = parts[0] + 'loadingText: "Loading history...",\\n      },\\n' + enDomain + parts[1];
}

const partsFr = msgContent.split('loadingText: "Chargement de l\\'historique...",\\n      },');
if (partsFr.length === 2) {
  msgContent = partsFr[0] + 'loadingText: "Chargement de l\\'historique...",\\n      },\\n' + frDomain + partsFr[1];
}

fs.writeFileSync(messagesPath, msgContent);

const transPath = path.join(process.cwd(), 'src/lib/transactions.ts');
let trans = fs.readFileSync(transPath, 'utf8');

trans = trans.replace(/const ERROR_RECOVERY_COPY[\\s\\S]+?supportEmail: "support@neurowealth.com",\\n  \\},\\n\\};/g, 
\`function getRecoveryCopy(t: any): Record<ErrorMode, TransactionRecoveryUI> {
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
}\`);

trans = trans.replace(
  /export function getTransactionRecoveryUI\\(\\n  codeOrMode: string,\\n  reference\\?: string,\\n\\): TransactionRecoveryUI \\{([\\s\\S]+?)return \\{\\n    \\.\\.\\.copy,\\n    reference: reference \\|\\| undefined,\\n  \\};\\n\\}/,
  \`export function getTransactionRecoveryUI(
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
}\`
);

trans = trans.replace(/export function getTransactionContext\\(kind: TransactionKind\\): TransactionContext \\{/g, 
  "export function getTransactionContext(kind: TransactionKind, t: any): TransactionContext {");
trans = trans.replace(/title: "Withdraw funds",\\n      intro: "Move settled capital out of NeuroWealth with clear validation and a traceable receipt\\.",\\n      primaryActionLabel: "Review withdrawal",\\n      confirmActionLabel: "Confirm withdrawal",\\n      amountLabel: "Withdrawal amount",\\n      amountHint: "Minimum withdrawal is 10 USDC\\. Amounts above 10,000 USDC may require an extra treasury check\\.",\\n      walletLabel: "Destination wallet",\\n      walletHint: "Enter a Stellar public address that starts with G\\. We validate before confirmation\\.",\\n      connectedWalletLabel: "Vault account ready",\\n      connectedWalletAddress: DEPOSIT_WALLET\\.address,\\n      minAmount: MINIMUM_AMOUNT\\.withdrawal,\\n      fee: NETWORK_FEE\\.withdrawal,\\n      availableAmount: AVAILABLE_AMOUNT\\.withdrawal,\\n      strategyLabel: STRATEGY_LABEL,\\n      settlementLabel: "Same-day settlement",\\n      reviewLabel: "Treasury review may apply",/, 
\`title: t.withdrawFunds,
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
      reviewLabel: t.treasuryReview,\`);
trans = trans.replace(/title: "Add capital",\\n    intro: "Deposit USDC from your connected wallet and confirm the amount, fees, and request reference before submission\\.",\\n    primaryActionLabel: "Review deposit",\\n    confirmActionLabel: "Confirm deposit",\\n    amountLabel: "Deposit amount",\\n    amountHint: "Minimum deposit is 10 USDC\\. Stellar network fees stay separate from the credited deposit amount\\.",\\n    walletLabel: "Funding wallet",\\n    walletHint: "Use the connected Freighter wallet for the funding step\\. Disconnecting blocks submission until you reconnect\\.",\\n    connectedWalletLabel: "Freighter connected",\\n    connectedWalletAddress: DEPOSIT_WALLET\\.address,\\n    minAmount: MINIMUM_AMOUNT\\.deposit,\\n    fee: NETWORK_FEE\\.deposit,\\n    availableAmount: AVAILABLE_AMOUNT\\.deposit,\\n    strategyLabel: STRATEGY_LABEL,\\n    settlementLabel: "Usually completes in under 20 seconds",\\n    reviewLabel: "Network fee shown at confirmation",/,
\`title: t.addCapital,
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
    reviewLabel: t.networkFee,\`);

trans = trans.replace(/export function validateTransactionValues\\(\\n  kind: TransactionKind,\\n  values: TransactionFormValues,\\n\\): TransactionFieldErrors \\{/g, 
  "export function validateTransactionValues(kind: TransactionKind, values: TransactionFormValues, t: any): TransactionFieldErrors {");
trans = trans.replace(/const context = getTransactionContext\\(kind\\);/g, "const context = getTransactionContext(kind, t.context);");
trans = trans.replace(/errors\\.walletConnected =\\n      kind === "deposit"\\n        \\? "Connect a funding wallet before submitting a deposit\\."\\n        : "Reconnect your vault wallet before withdrawing funds\\.";/,
  "errors.walletConnected = kind === \\"deposit\\" ? t.validation.connectFunding : t.validation.reconnectVault;");
trans = trans.replace(/errors\\.amount = "Enter an amount to continue\\.";/g, "errors.amount = t.validation.enterAmount;");
trans = trans.replace(/errors\\.amount = "Enter a valid amount greater than 0\\.";/g, "errors.amount = t.validation.validAmount;");
trans = trans.replace(/errors\\.amount = \\`Minimum \\$\\{kind\\} amount is \\$\\{context\\.minAmount\\} USDC\\.\\`;/g, 
  "errors.amount = kind === \\"deposit\\" ? t.validation.minDeposit(context.minAmount) : t.validation.minWithdrawal(context.minAmount);");
trans = trans.replace(/errors\\.amount =\\n      kind === "deposit"\\n        \\? \\`Funding wallet only has \\$\\{context\\.availableAmount\\.toFixed\\(2\\)\\} USDC available\\.\\`\\n        : \\`Available to withdraw is \\$\\{context\\.availableAmount\\.toFixed\\(2\\)\\} USDC\\.\\`;/,
  "errors.amount = kind === \\"deposit\\" ? t.validation.fundingAvailable(context.availableAmount.toFixed(2)) : t.validation.withdrawAvailable(context.availableAmount.toFixed(2));");
trans = trans.replace(/errors\\.walletAddress = "Enter a destination wallet address\\.";/g, "errors.walletAddress = t.validation.enterDestination;");
trans = trans.replace(/errors\\.walletAddress = "Use a valid Stellar public address that starts with G\\.";/g, "errors.walletAddress = t.validation.validStellarAddress;");

trans = trans.replace(/export function buildTransactionQuote\\(\\n  kind: TransactionKind,\\n  values: TransactionFormValues,\\n  reference = generateReference\\(kind\\),\\n\\): TransactionQuote \\{/g,
  "export function buildTransactionQuote(kind: TransactionKind, values: TransactionFormValues, tContext: any, reference = generateReference(kind)): TransactionQuote {");
trans = trans.replace(/const context = getTransactionContext\\(kind\\);/g, "const context = getTransactionContext(kind, tContext);");

trans = trans.replace(/export function buildPendingTransaction\\(\\n  kind: TransactionKind,\\n  values: TransactionFormValues,\\n  nextStatus: "success" \\| "failure" = "success",\\n\\): PendingTransaction \\{/g,
  "export function buildPendingTransaction(kind: TransactionKind, values: TransactionFormValues, tPending: any, tContext: any, nextStatus: \\"success\\" | \\"failure\\" = \\"success\\"): PendingTransaction {");
trans = trans.replace(/const quote = buildTransactionQuote\\(kind, values\\);/g, "const quote = buildTransactionQuote(kind, values, tContext);");
trans = trans.replace(/statusLabel: "Pending on Stellar",\\n    message:\\n      kind === "deposit"\\n        \\? "Submitting your deposit and waiting for network confirmation\\."\\n        : "Submitting your withdrawal and waiting for liquidity settlement\\.",\\n    completionDelayMs: 1600,\\n    nextStatus,\\n    failureReason:\\n      nextStatus === "failure"\\n        \\? kind === "deposit"\\n          \\? "Network fee estimate expired before submission\\. Refresh the quote and try again\\."\\n          : "Treasury liquidity changed mid-flight\\. Retry after reviewing the updated amount\\."\\n        : null,/,
\`statusLabel: tPending.statusLabel,
    message: kind === "deposit" ? tPending.submittingDeposit : tPending.submittingWithdrawal,
    completionDelayMs: 1600,
    nextStatus,
    failureReason: nextStatus === "failure" ? (kind === "deposit" ? tPending.feeExpired : tPending.liquidityChanged) : null,\`);

trans = trans.replace(/export function buildTransactionReceipt\\(\\n  pending: PendingTransaction,\\n  status: "success" \\| "failure",\\n\\): TransactionReceipt \\{/g,
  "export function buildTransactionReceipt(pending: PendingTransaction, status: \\"success\\" | \\"failure\\", tReceipt: any): TransactionReceipt {");
trans = trans.replace(/message:\\n      status === "success"\\n        \\? pending\\.kind === "deposit"\\n          \\? "Deposit confirmed and added to your active strategy\\."\\n          : "Withdrawal confirmed and ready for your destination wallet\\."\\n        : "Transaction failed before final settlement\\.",\\n    failureReason: status === "failure" \\? pending\\.failureReason : null,\\n    explorerLabel: status === "success" \\? "Explorer reference available after backend wiring" : null,/,
\`message: status === "success" ? (pending.kind === "deposit" ? tReceipt.depositConfirmed : tReceipt.withdrawalConfirmed) : tReceipt.failed,
    failureReason: status === "failure" ? pending.failureReason : null,
    explorerLabel: status === "success" ? tReceipt.explorerAvailable : null,\`);

trans = trans.replace(/export function buildPreviewSnapshot\\(\\n  kind: TransactionKind,\\n  preview: TransactionPreviewState,\\n\\): TransactionPreviewSnapshot \\{/g,
  "export function buildPreviewSnapshot(kind: TransactionKind, preview: TransactionPreviewState, t: any): TransactionPreviewSnapshot {");
trans = trans.replace(/amount: "Available to withdraw is 12480\\.54 USDC\\.",\\n              walletAddress: "Use a valid Stellar public address that starts with G\\.",/g,
  \`amount: t.validation.withdrawAvailable("12480.54"),
              walletAddress: t.validation.validStellarAddress,\`);
trans = trans.replace(/amount: "Enter an amount to continue\\.",\\n              walletConnected: "Connect a funding wallet before submitting a deposit\\.",/g,
  \`amount: t.validation.enterAmount,
              walletConnected: t.validation.connectFunding,\`);
trans = trans.replace(/quote: buildTransactionQuote\\(kind, form, \\`\\$\\{kind === "deposit" \\? "NW-DEP" : "NW-WDR"\\}-PREVIEW-CNFRM\\`\\),/g,
  'quote: buildTransactionQuote(kind, form, t.context, `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-CNFRM`),');
trans = trans.replace(/const pending = buildPendingTransaction\\(kind, form\\);/g, "const pending = buildPendingTransaction(kind, form, t.pending, t.context);");
trans = trans.replace(/const pending = buildPendingTransaction\\(\\n      kind,\\n      form,\\n      preview === "success" \\? "success" : "failure",\\n    \\);/g, 
  'const pending = buildPendingTransaction(kind, form, t.pending, t.context, preview === "success" ? "success" : "failure");');
trans = trans.replace(/receipt: buildTransactionReceipt\\(pending, preview\\),/g,
  "receipt: buildTransactionReceipt(pending, preview, t.receipt),");

trans = trans.replace(/export function buildStatusChips\\(\\n  kind: TransactionKind,\\n  values: TransactionFormValues,\\n\\): Array<\\{ label: string; tone: ValidationTone \\}> \\{/g,
  "export function buildStatusChips(kind: TransactionKind, values: TransactionFormValues, t: any): Array<{ label: string; tone: ValidationTone }> {");
trans = trans.replace(/const context = getTransactionContext\\(kind\\);/g, "const context = getTransactionContext(kind, t.context);");
trans = trans.replace(/label: values\\.walletConnected \\? context\\.connectedWalletLabel : "Wallet required",/g,
  "label: values.walletConnected ? context.connectedWalletLabel : t.statusChips.walletRequired,");
trans = trans.replace(/label:\\n        kind === "deposit"\\n          \\? \\`\\$\\{titleCase\\(kind\\)\\} capacity \\$\\{context\\.availableAmount\\.toFixed\\(0\\)\\}\\`\\n          : \\`Available \\$\\{context\\.availableAmount\\.toFixed\\(0\\)\\}\\`,/g,
  \`label: kind === "deposit" ? t.statusChips.depositCapacity(context.availableAmount.toFixed(0)) : t.statusChips.withdrawalCapacity(context.availableAmount.toFixed(0)),\`);

fs.writeFileSync(transPath, trans);
console.log('Modified transactions.ts');
