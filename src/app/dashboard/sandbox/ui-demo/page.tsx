"use client";

import { useState } from "react";
import { WithdrawConfirmModal } from "@/components/ui/demos/WithdrawConfirmModal";
import { StrategyChangeDrawer } from "@/components/ui/demos/StrategyChangeDrawer";
import {
  ActivityDetailDrawer,
  type ActivityItem,
} from "@/components/ui/demos/ActivityDetailDrawer";
import { Button } from "@/components/ui/Button";

const MOCK_ACTIVITY: ActivityItem = {
  id: "tx-001",
  type: "withdrawal",
  asset: "USDC",
  amount: "250.00",
  status: "completed",
  timestamp: "Jun 23, 2026 · 14:32 UTC",
  from: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
  to: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
  txHash:
    "a9e6b5c4f3d2e1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7",
  notes: "Quarterly rebalance",
};

export default function UiDemoPage() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          UI Component Demo
        </h1>
        <p className="text-sm text-text-secondary">
          Modal and Drawer patterns used across the three core mock flows.
        </p>
      </div>

      {/* Flow 1 — Withdraw confirm (Modal) */}
      <section className="card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">
          Flow 1 · Withdraw confirm
        </h2>
        <p className="text-sm text-text-secondary">
          Uses <code className="text-sky-400">{"<Modal>"}</code> with{" "}
          <code className="text-sky-400">preventClose</code> while the mock
          transaction is processing. Keyboard Escape and backdrop click are
          blocked until the call resolves.
        </p>
        <Button variant="primary" onClick={() => setShowWithdraw(true)}>
          Open withdraw confirm
        </Button>
      </section>

      {/* Flow 2 — Strategy change (Drawer) */}
      <section className="card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">
          Flow 2 · Strategy change
        </h2>
        <p className="text-sm text-text-secondary">
          Uses <code className="text-sky-400">{"<Drawer>"}</code> (360 px
          desktop, full-width mobile) to present strategy options before the
          user confirms. Escape key closes; focus is trapped inside the panel.
        </p>
        <Button variant="primary" onClick={() => setShowStrategy(true)}>
          Open strategy drawer
        </Button>
      </section>

      {/* Flow 3 — Activity detail (Drawer) */}
      <section className="card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">
          Flow 3 · Activity detail
        </h2>
        <p className="text-sm text-text-secondary">
          Uses <code className="text-sky-400">{"<Drawer>"}</code> to surface
          full transaction metadata — hash, addresses, status — for a selected
          activity row. Includes copy-to-clipboard and Stellar Explorer link.
        </p>
        <Button variant="primary" onClick={() => setShowActivity(true)}>
          Open activity detail
        </Button>
      </section>

      {/* Modals / Drawers */}
      <WithdrawConfirmModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        amount="250.00"
        asset="USDC"
        destination="GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN"
      />
      <StrategyChangeDrawer
        isOpen={showStrategy}
        onClose={() => setShowStrategy(false)}
        currentStrategy="balanced"
      />
      <ActivityDetailDrawer
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
        activity={MOCK_ACTIVITY}
      />
    </div>
  );
}
