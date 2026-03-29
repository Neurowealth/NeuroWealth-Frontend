"use client";

import { Modal } from "@/components/ui";

interface StrategyChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromStrategy: string;
  toStrategy: string;
  onConfirm: () => void;
}

export function StrategyChangeConfirmModal({
  isOpen,
  onClose,
  fromStrategy,
  toStrategy,
  onConfirm,
}: StrategyChangeConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Investment Strategy"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Keep Current
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Switch Strategy
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          You are switching your active investment strategy:
        </p>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-center px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100">
            {fromStrategy}
          </span>
          <span className="text-zinc-400">→</span>
          <span className="flex-1 text-center px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 font-medium text-blue-700 dark:text-blue-300">
            {toStrategy}
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Your portfolio will be gradually rebalanced over the next 24–48 hours. Existing positions may be adjd.
        </p>
      </div>
    </Modal>
  );
}
