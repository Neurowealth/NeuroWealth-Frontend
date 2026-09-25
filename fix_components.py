import os
import re


# ============================================================
# 1. TransactionFlow.tsx
# ============================================================
# Pass the transaction domain translations into the transaction
# status chips and transaction flow hook so these UI elements
# can use the localized transaction messages.
path = "src/components/transactions/TransactionFlow.tsx"

with open(path, "r") as f:
    c = f.read()

c = c.replace(
    "const statusChips = buildStatusChips(kind, formValues);",
    "const statusChips = buildStatusChips(kind, formValues, t.domain);"
)

c = c.replace(
    "useTransactionFlow({ searchParams, router, isSandboxMode, scenario });",
    "useTransactionFlow({ searchParams, router, isSandboxMode, scenario, tDomain: t.domain });"
)

with open(path, "w") as f:
    f.write(c)


# ============================================================
# 2. TransactionFormStage.tsx
# ============================================================
# Pass the localized transaction context messages into
# getTransactionContext so the form stage displays translated
# transaction-specific context instead of hardcoded text.
path = "src/components/transactions/stages/TransactionFormStage.tsx"

with open(path, "r") as f:
    c = f.read()

c = c.replace(
    "const context = getTransactionContext(kind);",
    "const context = getTransactionContext(kind, messages.transactions.domain.context);"
)

with open(path, "w") as f:
    f.write(c)


# ============================================================
# 3. useTransactionAPI.ts
# ============================================================
# Add access to the application's i18n context so transaction
# API errors and recovery UI can use the current translations.
path = "src/components/transactions/hooks/useTransactionAPI.ts"

with open(path, "r") as f:
    c = f.read()

# Import the i18n hook so the transaction API hook can access
# localized transaction domain messages.
c = c.replace(
    "export function useTransactionAPI() {",
    'import { useI18n } from "@/contexts/I18nContext";\nexport function useTransactionAPI() {'
)

# Retrieve the transaction domain translations from the i18n
# context for use when building recovery UI.
c = c.replace(
    "const [lastErrorReference, setLastErrorReference] = useState<string | null>(null);",
    "const [lastErrorReference, setLastErrorReference] = useState<string | null>(null);\n"
    "  const { messages } = useI18n();\n"
    "  const tDomain = (messages as any).transactions.domain;"
)

# Pass the localized transaction domain into the recovery UI
# builder so recovery messages can be translated.
c = c.replace(
    "const recovery = getTransactionRecoveryUI(copy.code, quoteReference);",
    "const recovery = getTransactionRecoveryUI(copy.code, tDomain, quoteReference);"
)

with open(path, "w") as f:
    f.write(c)


# ============================================================
# 4. useTransactionForm.ts
# ============================================================
# Update the transaction form hook to receive the localized
# transaction domain. This allows validation messages to be
# generated using the active language.
path = "src/components/transactions/hooks/useTransactionForm.ts"

with open(path, "r") as f:
    c = f.read()

# Accept transaction domain translations as an argument so
# validation can produce localized error messages.
c = c.replace(
    "export function useTransactionForm(kind: TransactionKind) {",
    "export function useTransactionForm(kind: TransactionKind, tDomain: any) {"
)

# Pass the translations into transaction validation so local
# validation errors are localized.
c = c.replace(
    "const localErrors = validateTransactionValues(kind, formValues);",
    "const localErrors = validateTransactionValues(kind, formValues, tDomain);"
)

with open(path, "w") as f:
    f.write(c)


# ============================================================
# 5. useTransactionFlow.ts
# ============================================================
# Extend the transaction flow hook with the localized transaction
# domain so all transaction-related helpers used by the flow can
# generate localized content.
path = "src/components/transactions/hooks/useTransactionFlow.ts"

with open(path, "r") as f:
    c = f.read()

# Add the transaction domain translations to the hook arguments.
c = c.replace(
    "  scenario: ScenarioType;\n}",
    "  scenario: ScenarioType;\n  tDomain: any;\n}"
)

# Destructure the transaction domain translations inside the hook.
c = c.replace(
    "  scenario,\n}: UseTransactionFlowArgs) {",
    "  scenario,\n  tDomain,\n}: UseTransactionFlowArgs) {"
)

# Pass translations into the transaction form hook so validation
# messages are localized.
c = c.replace(
    "useTransactionForm(kind);",
    "useTransactionForm(kind, tDomain);"
)

# Pass localized context messages into the transaction context
# builder.
c = c.replace(
    "const context = getTransactionContext(kind);",
    "const context = getTransactionContext(kind, tDomain.context);"
)

# Pass the transaction domain translations into the preview
# snapshot builder so preview content can be localized.
c = c.replace(
    "const snapshot = buildPreviewSnapshot(kind, preview);",
    "const snapshot = buildPreviewSnapshot(kind, preview, tDomain);"
)

# Pass localized receipt messages into the receipt builder so
# success/failure receipts use the active language.
c = c.replace(
    """const nextReceipt = buildTransactionReceipt(
          result.pending,
          result.pending.nextStatus === "failure" ? "failure" : "success",
        );""",
    """const nextReceipt = buildTransactionReceipt(
          result.pending,
          result.pending.nextStatus === "failure" ? "failure" : "success",
          tDomain.receipt
        );"""
)

with open(path, "w") as f:
    f.write(c)
