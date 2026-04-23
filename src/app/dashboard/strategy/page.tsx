import { Suspense } from "react";
import { CheckCircle, Shield, TrendingUp, Zap } from "lucide-react";
import StrategyLoading from "./loading";
import { cn } from "@/lib/utils";
import type { Strategy } from "@/types";

export const metadata = { title: "Strategy — NeuroWealth" };

// ── Static strategy definitions ───────────────────────────────────────────────

const STRATEGIES: (Strategy & { icon: React.ElementType; accentClass: string })[] = [
  {
    id: "conservative",
    name: "Conservative",
    description:
      "Stablecoin lending on Blend Protocol. Lowest volatility, steady and predictable returns.",
    apyRange: [3, 6],
    riskLevel: "low",
    icon: Shield,
    accentClass: "text-success",
  },
  {
    id: "balanced",
    name: "Balanced",
    description:
      "Mix of stablecoin lending and DEX liquidity provision. Moderate risk with better upside.",
    apyRange: [6, 10],
    riskLevel: "medium",
    icon: TrendingUp,
    accentClass: "text-primary",
  },
  {
    id: "growth",
    name: "Growth",
    description:
      "Aggressive multi-protocol deployment. Highest potential returns with elevated risk.",
    apyRange: [10, 15],
    riskLevel: "high",
    icon: Zap,
    accentClass: "text-warning",
  },
];

const RISK_BADGE: Record<string, string> = {
  low: "bg-success/10 text-success",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning",
};

// ── Strategy card ─────────────────────────────────────────────────────────────

function StrategyCard({
  strategy,
  isActive,
}: {
  strategy: (typeof STRATEGIES)[number];
  isActive: boolean;
}) {
  const { icon: Icon, name, description, apyRange, riskLevel, accentClass } = strategy;

  return (
    <div
      className={cn(
        "card relative transition-all duration-150 cursor-pointer hover:border-primary/50",
        isActive && "border-primary ring-1 ring-primary"
      )}
      role="radio"
      aria-checked={isActive}
      tabIndex={0}
    >
      {isActive && (
        <span className="absolute top-4 right-4">
          <CheckCircle className="w-5 h-5 text-primary" aria-label="Currently active" />
        </span>
      )}

      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          "bg-surface-elevated"
        )}
        aria-hidden="true"
      >
        <Icon className={cn("w-5 h-5", accentClass)} />
      </div>

      <h3 className="font-semibold text-text-primary mb-1">{name}</h3>
      <p className="text-xs text-text-secondary mb-3 leading-relaxed">{description}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary">
          {apyRange[0]}–{apyRange[1]}% APY
        </span>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
            RISK_BADGE[riskLevel]
          )}
        >
          {riskLevel} risk
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function StrategyContent() {
  const activeStrategy = "balanced"; // Will come from API (Issue 7)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Strategy</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Choose how the AI agent deploys your funds. You can change at any time.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        role="radiogroup"
        aria-label="Investment strategy"
      >
        {STRATEGIES.map((s) => (
          <StrategyCard
            key={s.id}
            strategy={s}
            isActive={s.id === activeStrategy}
          />
        ))}
      </div>

      <div className="card max-w-sm">
        <p className="text-xs text-text-muted leading-relaxed">
          Strategy changes are applied at the next AI rebalancing cycle (~1 hour).
          Wallet connection required to save changes. (Issue 9)
        </p>
      </div>
    </div>
  );
}

export default function StrategyPage() {
  return (
    <Suspense fallback={<StrategyLoading />}>
      <StrategyContent />
    </Suspense>
  );
}
