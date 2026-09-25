import { Suspense } from "react";
import ActivityLoading from "./loading";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity — NeuroWealth" };

export default function ActivityPage() {
  return (
    <Suspense fallback={<ActivityLoading />}>
      <TransactionHistory embedded />
    </Suspense>
  );
}
