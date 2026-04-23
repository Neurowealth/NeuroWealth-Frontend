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

export default function AvatarUploader({ name, size = 64, onSave }: AvatarUploaderProps) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Avatar preview row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar
          size={size}
          src={croppedSrc}
          name={name}
          onClick={step === "idle" ? () => setStep("upload") : undefined}
        />
        <div>
          <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, margin: 0 }}>
            {name ?? "Your avatar"}
          </p>
          <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>
            {step === "idle" && "Click avatar to upload"}
            {step === "upload" && "Choose or drop an image"}
            {step === "crop" && "Adjust the crop area"}
            {step === "done" && "Avatar saved"}
          </p>
        </div>
        {(step === "upload" || step === "done") && (
          <button
            onClick={reset}
            style={{
              marginLeft: "auto", fontFamily: "inherit", fontSize: 11,
              cursor: "pointer", border: "0.5px solid #374151",
              background: "transparent", color: "#9ca3af",
              borderRadius: 5, padding: "4px 10px",
            }}
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