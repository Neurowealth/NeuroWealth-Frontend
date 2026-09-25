import fs from 'fs';
import path from 'path';

const messagesPath = path.join(process.cwd(), 'src/lib/i18n/messages.ts');
let content = fs.readFileSync(messagesPath, 'utf8');

// 1. Add domain interface to AppMessages.transactions
const domainInterface = `
    domain: {
      context: {
        withdrawFunds: string;
        withdrawIntro: string;
        reviewWithdrawal: string;
        confirmWithdrawal: string;
        withdrawalAmount: string;
        withdrawHint: string;
        destinationWallet: string;
        destinationHint: string;
        vaultReady: string;
        sameDay: string;
        treasuryReview: string;
        addCapital: string;
        depositIntro: string;
        reviewDeposit: string;
        confirmDeposit: string;
        depositAmount: string;
        depositHint: string;
        fundingWallet: string;
        fundingHint: string;
        freighterConnected: string;
        usuallyCompletes: string;
        networkFee: string;
      };
      validation: {
        connectFunding: string;
        reconnectVault: string;
        enterAmount: string;
        validAmount: string;
        minDeposit: (min: number) => string;
        minWithdrawal: (min: number) => string;
        fundingAvailable: (amt: string) => string;
        withdrawAvailable: (amt: string) => string;
        enterDestination: string;
        validStellarAddress: string;
      };
      pending: {
        statusLabel: string;
        submittingDeposit: string;
        submittingWithdrawal: string;
        feeExpired: string;
        liquidityChanged: string;
      };
      receipt: {
        depositConfirmed: string;
        withdrawalConfirmed: string;
        failed: string;
        explorerAvailable: string;
      };
      statusChips: {
        walletRequired: string;
        depositCapacity: (amt: string) => string;
        withdrawalCapacity: (amt: string) => string;
      };
      recovery: {
        networkErrorTitle: string;
        networkErrorDesc: string;
        timeoutTitle: string;
        timeoutDesc: string;
        serverErrorTitle: string;
        serverErrorDesc: string;
        validationErrorTitle: string;
        validationErrorDesc: string;
        quotaErrorTitle: string;
        quotaErrorDesc: string;
        stateConflictTitle: string;
        stateConflictDesc: string;
        unknownErrorTitle: string;
        unknownErrorDesc: string;
        actionRetry: string;
        actionEdit: string;
        actionSupport: string;
        actionBack: string;
        actionReview: string;
      };
    };`;

content = content.replace(
  /history: \{([^}]+|(?<=\{)[^}]+(?=\}))\n      loadingText: string;\n    \};\n  \};/,
  match => match + domainInterface
);

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
      },`;

const frDomain = enDomain.replace(/domain: \{/g, 'domain: { /* TO DO FR */'); // Keeping same for FR just to fix compilation, or pseudo translate

content = content.replace(
  /history: \{([^}]+|(?<=\{)[^}]+(?=\}))\n        loadingText: "Loading history...",\n      \},\n    \},/g,
  match => match.slice(0, -2) + enDomain + '\n    },'
);

content = content.replace(
  /history: \{([^}]+|(?<=\{)[^}]+(?=\}))\n        loadingText: "Chargement de l'historique...",\n      \},\n    \},/g,
  match => match.slice(0, -2) + enDomain + '\n    },'
);

fs.writeFileSync(messagesPath, content);
console.log('Modified messages.ts');
