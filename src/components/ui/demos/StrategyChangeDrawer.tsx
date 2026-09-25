"use client";

import { useState } from "react";
import { TrendingUp, ShieldCheck, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

type StrategyKey = "conservative" | "balanced" | "aggressive";

interface Strategy {
  key: StrategyKey;
  label: string;
  apy: string;
  risk: string;
  description: string;
  Icon: React.ElementType;
}

const STRATEGIES: Strategy[] = [
  {
    key: "conservative",
    label: "Conservative",
    apy: "3–5%",
    risk: "Low",
    description: "Stable yields with minimal exposure. Suitable for capital preservation.",
    Icon: ShieldCheck,
  },
  {
    key: "balanced",
    label: "Balanced",
    apy: "8–12%",
    risk: "Medium",
    description: "Diversified across lending and liquidity pools for steady growth.",
    Icon: TrendingUp,
  },
  {
    key: "aggressive",
    label: "Aggressive",
    apy: "18–30%",
    risk: "High",
    description: "High-yield DeFi positions. Suitable for risk-tolerant investors.",
    Icon: Zap,
  },
];

interface StrategyChangeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStrategy?: StrategyKey;
}

type SaveState = "idle" | "saving" | "success";

export function StrategyChangeDrawer({
  isOpen,
  onClose,
  currentStrategy = "balanced",
}: StrategyChangeDrawerProps) {
  const [selected, setSelected] = useState<StrategyKey>(currentStrategy);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const handleSave = async () => {
    setSaveState("saving");
    await new Promise((r) => setTimeout(r, 1200));
    setSaveState("success");
    setTimeout(() => {
      setSaveState("idle");
      onClose();
    }, 1000);
  };

  const hasChanged = selected !== currentStrategy;
  const isSaving = saveState === "saving";
  const isSuccess = saveState === "success";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Change strategy"
      footer={
        <Button
          onClick={handleSave}
          variant="primary"
          disabled={!hasChanged || isSaving || isSuccess}
          aria-label="Save strategy change"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
              Saving…
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
              Saved!
            </>
          ) : (
            "Apply strategy"
          )}
        </Button>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-text-secondary mb-4">
          Select a yield strategy. Changes take effect on the next rebalancing cycle.
        </p>

        {STRATEGIES.map((s) => {
          const isActive = selected === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelected(s.key)}
              aria-pressed={isActive}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${
                isActive
                  ? "border-sky-500/60 bg-sky-500/10"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <s.Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-sky-400" : "text-zinc-400"}`}
                  aria-hidden="true"
                />
                <span
                  className={`font-semibold text-sm ${
                    isActive ? "text-sky-300" : "text-text-primary"
                  }`}
                >
                  {s.label}
                </span>
                <span className="ml-auto text-xs text-text-muted">{s.risk} risk</span>
              </div>
              <p className="text-xs text-text-secondary pl-8">{s.description}</p>
              <p className={`text-xs font-medium mt-2 pl-8 ${isActive ? "text-sky-400" : "text-text-muted"}`}>
                Expected APY: {s.apy}
              </p>
            </button>
          );
        })}
      </div>
    </Drawer>
  );
}
