"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";

interface WithdrawConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  onConfirm: () => Promise<void>;
}

export function WithdrawConfirmModal({
  isOpen,
  onClose,
  amount,
  onConfirm,
}: WithdrawConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Withdrawal"
      preventClose={loading}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {loading ? "Processing..." : "Confirm Withdrawal"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠ This action cannot be undone</p>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          You are about to withdraw{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{amount}</span>{" "}
          from your NeuroWealth account.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Funds will be transferred to your linked bank account within 1–3 business days.
        </p>
      </div>
    </Modal>
  );
}
