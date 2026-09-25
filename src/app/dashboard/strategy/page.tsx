import { Suspense } from "react";
import StrategyLoading from "./loading";
import { StrategySelector } from "@/components/strategies/StrategySelector";

export const dynamic = "force-dynamic";
export const metadata = { title: "Strategy — NeuroWealth" };

export default function StrategyPage() {
  return (
    <Suspense fallback={<StrategyLoading />}>
      <StrategySelector />
    </Suspense>
  );
}
