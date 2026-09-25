import os

trans_path = "src/lib/transactions.ts"
with open(trans_path, "r") as f:
    trans = f.read()

import re

# ERROR_RECOVERY_COPY -> getRecoveryCopy(t)
trans = re.sub(
    r"const ERROR_RECOVERY_COPY[\s\S]+?supportEmail: \"support@neurowealth.com\",\n  \},\n\};",
    """function getRecoveryCopy(t: any): Record<ErrorMode, TransactionRecoveryUI> {
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
}""",
    trans
)

trans = re.sub(
    r"export function getTransactionRecoveryUI\(\n  codeOrMode: string,\n  reference\?: string,\n\): TransactionRecoveryUI \{([\s\S]+?)return \{\n    \.\.\.copy,\n    reference: reference \|\| undefined,\n  \};\n\}",
    """export function getTransactionRecoveryUI(
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
}""",
    trans
)

trans = trans.replace(
    "export function getTransactionContext(kind: TransactionKind): TransactionContext {",
    "export function getTransactionContext(kind: TransactionKind, t: any): TransactionContext {"
)

trans = re.sub(
    r"title: \"Withdraw funds\",\n      intro: \"Move settled capital out of NeuroWealth with clear validation and a traceable receipt\.\",\n      primaryActionLabel: \"Review withdrawal\",\n      confirmActionLabel: \"Confirm withdrawal\",\n      amountLabel: \"Withdrawal amount\",\n      amountHint: \"Minimum withdrawal is 10 USDC\. Amounts above 10,000 USDC may require an extra treasury check\.\",\n      walletLabel: \"Destination wallet\",\n      walletHint: \"Enter a Stellar public address that starts with G\. We validate before confirmation\.\",\n      connectedWalletLabel: \"Vault account ready\",\n      connectedWalletAddress: DEPOSIT_WALLET\.address,\n      minAmount: MINIMUM_AMOUNT\.withdrawal,\n      fee: NETWORK_FEE\.withdrawal,\n      availableAmount: AVAILABLE_AMOUNT\.withdrawal,\n      strategyLabel: STRATEGY_LABEL,\n      settlementLabel: \"Same-day settlement\",\n      reviewLabel: \"Treasury review may apply\",",
    """title: t.withdrawFunds,
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
      reviewLabel: t.treasuryReview,""",
    trans
)

trans = re.sub(
    r"title: \"Add capital\",\n    intro: \"Deposit USDC from your connected wallet and confirm the amount, fees, and request reference before submission\.\",\n    primaryActionLabel: \"Review deposit\",\n    confirmActionLabel: \"Confirm deposit\",\n    amountLabel: \"Deposit amount\",\n    amountHint: \"Minimum deposit is 10 USDC\. Stellar network fees stay separate from the credited deposit amount\.\",\n    walletLabel: \"Funding wallet\",\n    walletHint: \"Use the connected Freighter wallet for the funding step\. Disconnecting blocks submission until you reconnect\.\",\n    connectedWalletLabel: \"Freighter connected\",\n    connectedWalletAddress: DEPOSIT_WALLET\.address,\n    minAmount: MINIMUM_AMOUNT\.deposit,\n    fee: NETWORK_FEE\.deposit,\n    availableAmount: AVAILABLE_AMOUNT\.deposit,\n    strategyLabel: STRATEGY_LABEL,\n    settlementLabel: \"Usually completes in under 20 seconds\",\n    reviewLabel: \"Network fee shown at confirmation\",",
    """title: t.addCapital,
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
    reviewLabel: t.networkFee,""",
    trans
)

trans = trans.replace(
    "export function validateTransactionValues(\n  kind: TransactionKind,\n  values: TransactionFormValues,\n): TransactionFieldErrors {",
    "export function validateTransactionValues(kind: TransactionKind, values: TransactionFormValues, t: any): TransactionFieldErrors {"
)
trans = trans.replace(
    "const context = getTransactionContext(kind);",
    "const context = getTransactionContext(kind, t.context);"
)
trans = re.sub(
    r'errors\.walletConnected =\n      kind === "deposit"\n        \? "Connect a funding wallet before submitting a deposit\."\n        : "Reconnect your vault wallet before withdrawing funds\.";',
    'errors.walletConnected = kind === "deposit" ? t.validation.connectFunding : t.validation.reconnectVault;',
    trans
)
trans = trans.replace('errors.amount = "Enter an amount to continue.";', 'errors.amount = t.validation.enterAmount;')
trans = trans.replace('errors.amount = "Enter a valid amount greater than 0.";', 'errors.amount = t.validation.validAmount;')
trans = trans.replace('errors.amount = `Minimum ${kind} amount is ${context.minAmount} USDC.`;', 'errors.amount = kind === "deposit" ? t.validation.minDeposit(context.minAmount) : t.validation.minWithdrawal(context.minAmount);')
trans = re.sub(
    r'errors\.amount =\n      kind === "deposit"\n        \? `Funding wallet only has \$\{context\.availableAmount\.toFixed\(2\)\} USDC available\.`\n        : `Available to withdraw is \$\{context\.availableAmount\.toFixed\(2\)\} USDC\.`;',
    'errors.amount = kind === "deposit" ? t.validation.fundingAvailable(context.availableAmount.toFixed(2)) : t.validation.withdrawAvailable(context.availableAmount.toFixed(2));',
    trans
)
trans = trans.replace('errors.walletAddress = "Enter a destination wallet address.";', 'errors.walletAddress = t.validation.enterDestination;')
trans = trans.replace('errors.walletAddress = "Use a valid Stellar public address that starts with G.";', 'errors.walletAddress = t.validation.validStellarAddress;')

trans = trans.replace(
    "export function buildTransactionQuote(\n  kind: TransactionKind,\n  values: TransactionFormValues,\n  reference = generateReference(kind),\n): TransactionQuote {",
    "export function buildTransactionQuote(kind: TransactionKind, values: TransactionFormValues, tContext: any, reference = generateReference(kind)): TransactionQuote {"
)
trans = trans.replace("const context = getTransactionContext(kind);", "const context = getTransactionContext(kind, tContext);")

trans = trans.replace(
    "export function buildPendingTransaction(\n  kind: TransactionKind,\n  values: TransactionFormValues,\n  nextStatus: \"success\" | \"failure\" = \"success\",\n): PendingTransaction {",
    "export function buildPendingTransaction(kind: TransactionKind, values: TransactionFormValues, tPending: any, tContext: any, nextStatus: \"success\" | \"failure\" = \"success\"): PendingTransaction {"
)
trans = trans.replace("const quote = buildTransactionQuote(kind, values);", "const quote = buildTransactionQuote(kind, values, tContext);")

trans = re.sub(
    r'statusLabel: "Pending on Stellar",\n    message:\n      kind === "deposit"\n        \? "Submitting your deposit and waiting for network confirmation\."\n        : "Submitting your withdrawal and waiting for liquidity settlement\.",\n    completionDelayMs: 1600,\n    nextStatus,\n    failureReason:\n      nextStatus === "failure"\n        \? kind === "deposit"\n          \? "Network fee estimate expired before submission\. Refresh the quote and try again\."\n          : "Treasury liquidity changed mid-flight\. Retry after reviewing the updated amount\."\n        : null,',
    """statusLabel: tPending.statusLabel,
    message: kind === "deposit" ? tPending.submittingDeposit : tPending.submittingWithdrawal,
    completionDelayMs: 1600,
    nextStatus,
    failureReason: nextStatus === "failure" ? (kind === "deposit" ? tPending.feeExpired : tPending.liquidityChanged) : null,""",
    trans
)

trans = trans.replace(
    "export function buildTransactionReceipt(\n  pending: PendingTransaction,\n  status: \"success\" | \"failure\",\n): TransactionReceipt {",
    "export function buildTransactionReceipt(pending: PendingTransaction, status: \"success\" | \"failure\", tReceipt: any): TransactionReceipt {"
)

trans = re.sub(
    r'message:\n      status === "success"\n        \? pending\.kind === "deposit"\n          \? "Deposit confirmed and added to your active strategy\."\n          : "Withdrawal confirmed and ready for your destination wallet\."\n        : "Transaction failed before final settlement\.",\n    failureReason: status === "failure" \? pending\.failureReason : null,\n    explorerLabel: status === "success" \? "Explorer reference available after backend wiring" : null,',
    """message: status === "success" ? (pending.kind === "deposit" ? tReceipt.depositConfirmed : tReceipt.withdrawalConfirmed) : tReceipt.failed,
    failureReason: status === "failure" ? pending.failureReason : null,
    explorerLabel: status === "success" ? tReceipt.explorerAvailable : null,""",
    trans
)

trans = trans.replace(
    "export function buildPreviewSnapshot(\n  kind: TransactionKind,\n  preview: TransactionPreviewState,\n): TransactionPreviewSnapshot {",
    "export function buildPreviewSnapshot(kind: TransactionKind, preview: TransactionPreviewState, t: any): TransactionPreviewSnapshot {"
)
trans = trans.replace(
    'amount: "Available to withdraw is 12480.54 USDC.",\n              walletAddress: "Use a valid Stellar public address that starts with G.",',
    'amount: t.validation.withdrawAvailable("12480.54"),\n              walletAddress: t.validation.validStellarAddress,'
)
trans = trans.replace(
    'amount: "Enter an amount to continue.",\n              walletConnected: "Connect a funding wallet before submitting a deposit.",',
    'amount: t.validation.enterAmount,\n              walletConnected: t.validation.connectFunding,'
)
trans = trans.replace(
    'quote: buildTransactionQuote(kind, form, `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-CNFRM`),',
    'quote: buildTransactionQuote(kind, form, t.context, `${kind === "deposit" ? "NW-DEP" : "NW-WDR"}-PREVIEW-CNFRM`),'
)
trans = trans.replace("const pending = buildPendingTransaction(kind, form);", "const pending = buildPendingTransaction(kind, form, t.pending, t.context);")
trans = trans.replace(
    'const pending = buildPendingTransaction(\n      kind,\n      form,\n      preview === "success" ? "success" : "failure",\n    );',
    'const pending = buildPendingTransaction(kind, form, t.pending, t.context, preview === "success" ? "success" : "failure");'
)
trans = trans.replace("receipt: buildTransactionReceipt(pending, preview),", "receipt: buildTransactionReceipt(pending, preview, t.receipt),")

trans = trans.replace(
    "export function buildStatusChips(\n  kind: TransactionKind,\n  values: TransactionFormValues,\n): Array<{ label: string; tone: ValidationTone }> {",
    "export function buildStatusChips(kind: TransactionKind, values: TransactionFormValues, t: any): Array<{ label: string; tone: ValidationTone }> {"
)

trans = re.sub(
    r'label: values\.walletConnected \? context\.connectedWalletLabel : "Wallet required",',
    'label: values.walletConnected ? context.connectedWalletLabel : t.statusChips.walletRequired,',
    trans
)
trans = re.sub(
    r'label:\n        kind === "deposit"\n          \? `\$\{titleCase\(kind\)\} capacity \$\{context\.availableAmount\.toFixed\(0\)\}`\n          : `Available \$\{context\.availableAmount\.toFixed\(0\)\}`,',
    'label: kind === "deposit" ? t.statusChips.depositCapacity(context.availableAmount.toFixed(0)) : t.statusChips.withdrawalCapacity(context.availableAmount.toFixed(0)),',
    trans
)

with open(trans_path, "w") as f:
    f.write(trans)

print("Modified transactions.ts")
