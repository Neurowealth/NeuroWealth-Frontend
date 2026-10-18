"use client";

import React, { useState } from "react";
import Avatar, { AvatarSize } from "./Avatar";
import FileUpload, { UploadFile } from "./FileUpload";
import ImageCrop, { CropResult } from "./ImageCrop";

type Step = "idle" | "upload" | "crop" | "done";

export interface AvatarUploaderProps {
  name?: string;
  size?: AvatarSize;
  onSave?: (dataUrl: string) => void;
}

export default function AvatarUploader({
  name,
  size = 64,
  onSave,
}: AvatarUploaderProps) {
  const [step, setStep] = useState<Step>("idle");
  const [previewSrc, setPreviewSrc] = useState<string | undefined>();
  const [croppedSrc, setCroppedSrc] = useState<string | undefined>();

  const handleUploadComplete = (file: UploadFile) => {
    if (file.previewUrl) {
      setPreviewSrc(file.previewUrl);
      setStep("crop");
    }
  };

  const handleCropConfirm = (result: CropResult) => {
    if (result.dataUrl) {
      setCroppedSrc(result.dataUrl);
      onSave?.(result.dataUrl);
    }
    setStep("done");
  };

  const reset = () => {
    setStep("idle");
    setPreviewSrc(undefined);
    setCroppedSrc(undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar preview row */}
      <div className="flex items-center gap-4">
        <Avatar
          size={size}
          src={croppedSrc}
          name={name}
          onClick={step === "idle" ? () => setStep("upload") : undefined}
        />
        <div>
          <p className="m-0 text-[13px] font-medium text-slate-800 dark:text-slate-200">
            {name ?? "Your avatar"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {step === "idle" && "Click avatar to upload"}
            {step === "upload" && "Choose or drop an image"}
            {step === "crop" && "Adjust the crop area"}
            {step === "done" && "Avatar saved"}
          </p>
        </div>
        {(step === "upload" || step === "done") && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-transparent px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {step === "done" ? "Change" : "Cancel"}
          </button>
        )}
      </div>

      {step === "upload" && (
        <FileUpload
          accept="image/*"
          maxSizeMB={5}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {step === "crop" && previewSrc && (
        <ImageCrop
          src={previewSrc}
          outputSize={256}
          onConfirm={handleCropConfirm}
          onCancel={() => setStep("upload")}
        />
      )}
    </div>
  );
}
