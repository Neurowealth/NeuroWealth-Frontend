import os


# ============================================================
# 1. Load the i18n messages file
# ============================================================
# Read the existing messages.ts file so the transaction domain
# translations and their TypeScript type definitions can be added.
messages_path = "src/lib/i18n/messages.ts"

with open(messages_path, "r") as f:
    msg_content = f.read()


# ============================================================
# 2. Define the English transaction domain translations
# ============================================================
# Contains all user-facing transaction messages grouped by purpose:
# - context: titles, descriptions, hints, and transaction information
# - validation: input and wallet validation messages
# - pending: messages shown while a transaction is processing
# - receipt: final transaction status messages
# - statusChips: short transaction status indicators
# - recovery: messages and actions for recoverable transaction errors
#
# Dynamic messages use functions so values such as amounts can be
# inserted at runtime.
en_domain = """
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

        // Validation messages displayed when transaction input,
        // wallet state, or destination details are invalid.
        validation: {
          connectFunding: "Connect a funding wallet before submitting a deposit.",
          reconnectVault: "Reconnect your vault wallet before withdrawing funds.",
          enterAmount: "Enter an amount to continue.",
          validAmount: "Enter a valid amount greater than 0.",
          minDeposit: (min: number) => `Minimum deposit amount is ${min} USDC.`,
          minWithdrawal: (min: number) => `Minimum withdrawal amount is ${min} USDC.`,
          fundingAvailable: (amt: string) => `Funding wallet only has ${amt} USDC available.`,
          withdrawAvailable: (amt: string) => `Available to withdraw is ${amt} USDC.`,
          enterDestination: "Enter a destination wallet address.",
          validStellarAddress: "Use a valid Stellar public address that starts with G.",
        },

        // Messages shown while deposits or withdrawals are still
        // being processed and have not reached a final state.
        pending: {
          statusLabel: "Pending on Stellar",
          submittingDeposit: "Submitting your deposit and waiting for network confirmation.",
          submittingWithdrawal: "Submitting your withdrawal and waiting for liquidity settlement.",
          feeExpired: "Network fee estimate expired before submission. Refresh the quote and try again.",
          liquidityChanged: "Treasury liquidity changed mid-flight. Retry after reviewing the updated amount.",
        },

        // Final messages displayed on the transaction receipt after
        // a deposit or withdrawal succeeds or fails.
        receipt: {
          depositConfirmed: "Deposit confirmed and added to your active strategy.",
          withdrawalConfirmed: "Withdrawal confirmed and ready for your destination wallet.",
          failed: "Transaction failed before final settlement.",
          explorerAvailable: "Explorer reference available after backend wiring",
        },

        // Short labels used in transaction status indicators.
        statusChips: {
          walletRequired: "Wallet required",
          depositCapacity: (amt: string) => `Deposit capacity ${amt}`,
          withdrawalCapacity: (amt: string) => `Available ${amt}`,
        },

        // User-facing recovery messages for network, validation,
        // timeout, server, quota, and transaction state errors.
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
"""


# ============================================================
# 3. Add the transaction domain to the English messages
# ============================================================
# Locate the existing English transaction history section and
# append the new domain translations after the history messages.
msg_content = msg_content.replace(
    'loadingText: "Loading history...",\n      },\n    },',
    'loadingText: "Loading history...",\n      },\n' + en_domain + '    },'
)


# ============================================================
# 4. Add the transaction domain to the French messages
# ============================================================
# The same transaction domain structure is currently reused for
# the French message object so both locales satisfy the same
# TypeScript shape.
#
# The values can be translated into French separately without
# changing the structure of the message object.
msg_content = msg_content.replace(
    'loadingText: "Chargement de l\'historique...",\n      },\n    },',
    'loadingText: "Chargement de l\'historique...",\n      },\n' + en_domain + '    },'
)


# ============================================================
# 5. Define the AppMessages transaction domain type
# ============================================================
# This mirrors the structure of en_domain above but contains
# TypeScript types instead of actual translated strings.
#
# Keeping this type aligned with the translation objects allows
# transaction helpers and React components to access the new
# translation keys safely.
app_messages_domain = """
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
    };
"""


# ============================================================
# 6. Add the domain type to AppMessages if it is missing
# ============================================================
# Only insert the domain interface when the file does not already
# contain a "domain" property. This prevents the script from
# creating duplicate TypeScript definitions if it is run again.
if 'domain: {' not in msg_content:
    msg_content = msg_content.replace(
        'loadingText: string;\n    };\n  };\n  audit: {',
        'loadingText: string;\n    };\n' + app_messages_domain + '  };\n  audit: {'
    )


# ============================================================
# 7. Save the updated messages file
# ============================================================
# Write the modified content back to messages.ts so the new
# transaction translations and AppMessages type are persisted.
with open(messages_path, "w") as f:
    f.write(msg_content)

print("Modified messages.ts")