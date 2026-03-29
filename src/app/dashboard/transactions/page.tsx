import { TransactionFlow } from "@/components/transactions/TransactionFlow";
import { Suspense } from "react";
import { TransactionFormSkeleton } from "@/components/ui/Skeleton";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionFormSkeleton />}>
      <TransactionFlow />
    </Suspense>
  );
}
