import os
import re

# 1. TransactionFlow.tsx
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


# 2. TransactionFormStage.tsx
path = "src/components/transactions/stages/TransactionFormStage.tsx"
with open(path, "r") as f:
    c = f.read()
c = c.replace(
    "const context = getTransactionContext(kind);",
    "const context = getTransactionContext(kind, messages.transactions.domain.context);"
)
with open(path, "w") as f:
    f.write(c)


# 3. useTransactionAPI.ts
path = "src/components/transactions/hooks/useTransactionAPI.ts"
with open(path, "r") as f:
    c = f.read()
c = c.replace(
    "export function useTransactionAPI() {",
    "import { useI18n } from \"@/contexts/I18nContext\";\nexport function useTransactionAPI() {"
)
c = c.replace(
    "const [lastErrorReference, setLastErrorReference] = useState<string | null>(null);",
    "const [lastErrorReference, setLastErrorReference] = useState<string | null>(null);\n  const { messages } = useI18n();\n  const tDomain = (messages as any).transactions.domain;"
)
c = c.replace(
    "const recovery = getTransactionRecoveryUI(copy.code, quoteReference);",
    "const recovery = getTransactionRecoveryUI(copy.code, tDomain, quoteReference);"
)
with open(path, "w") as f:
    f.write(c)


# 4. useTransactionForm.ts
path = "src/components/transactions/hooks/useTransactionForm.ts"
with open(path, "r") as f:
    c = f.read()
c = c.replace(
    "export function useTransactionForm(kind: TransactionKind) {",
    "export function useTransactionForm(kind: TransactionKind, tDomain: any) {"
)
c = c.replace(
    "const localErrors = validateTransactionValues(kind, formValues);",
    "const localErrors = validateTransactionValues(kind, formValues, tDomain);"
)
with open(path, "w") as f:
    f.write(c)


# 5. useTransactionFlow.ts
path = "src/components/transactions/hooks/useTransactionFlow.ts"
with open(path, "r") as f:
    c = f.read()
c = c.replace(
    "  scenario: ScenarioType;\n}",
    "  scenario: ScenarioType;\n  tDomain: any;\n}"
)
c = c.replace(
    "  scenario,\n}: UseTransactionFlowArgs) {",
    "  scenario,\n  tDomain,\n}: UseTransactionFlowArgs) {"
)
c = c.replace(
    "useTransactionForm(kind);",
    "useTransactionForm(kind, tDomain);"
)
c = c.replace(
    "const context = getTransactionContext(kind);",
    "const context = getTransactionContext(kind, tDomain.context);"
)
c = c.replace(
    "const snapshot = buildPreviewSnapshot(kind, preview);",
    "const snapshot = buildPreviewSnapshot(kind, preview, tDomain);"
)
c = c.replace(
    "const nextReceipt = buildTransactionReceipt(\n          result.pending,\n          result.pending.nextStatus === \"failure\" ? \"failure\" : \"success\",\n        );",
    "const nextReceipt = buildTransactionReceipt(\n          result.pending,\n          result.pending.nextStatus === \"failure\" ? \"failure\" : \"success\",\n          tDomain.receipt\n        );"
)
with open(path, "w") as f:
    f.write(c)
