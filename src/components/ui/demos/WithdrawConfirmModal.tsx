"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface WithdrawConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  asset: string;
  destination: string;
}

type WithdrawState = "confirm" | "pending" | "success";

export function WithdrawConfirmModal({
  isOpen,
  onClose,
  amount,
  asset,
  destination,
}: WithdrawConfirmModalProps) {
  const [step, setStep] = useState<WithdrawState>("confirm");

  const handleConfirm = async () => {
    setStep("pending");
    // Mock async withdrawal
    await new Promise((r) => setTimeout(r, 1500));
    setStep("success");
  };

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const isPending = step === "pending";
  const isSuccess = step === "success";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "Withdrawal submitted" : "Confirm withdrawal"}
      preventClose={isPending}
      footer={
        isSuccess ? (
          <Button onClick={handleClose} variant="primary">
            Done
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} variant="ghost" disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="primary"
              disabled={isPending}
              aria-label="Confirm withdrawal"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </>
        )
      }
    >
      {isSuccess ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400" aria-hidden="true" />
          <p className="text-text-secondary text-sm">
            Your withdrawal of{" "}
            <span className="font-semibold text-text-primary">
              {amount} {asset}
            </span>{" "}
            has been submitted and will arrive within 1–3 business days.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex gap-3">
            <AlertTriangle
              className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm text-amber-300">
              This action cannot be undone once processing begins.
            </p>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Amount</dt>
              <dd className="font-semibold text-text-primary">
                {amount} {asset}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Destination</dt>
              <dd className="font-mono text-text-primary text-xs truncate max-w-[220px]">
                {destination}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Network fee</dt>
              <dd className="text-text-primary">~0.001 XLM</dd>
            </div>
          </dl>
        </div>
      )}
    </Modal>
  );
}
