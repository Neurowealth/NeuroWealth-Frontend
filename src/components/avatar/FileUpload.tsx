"use client";

import React, { useRef, useState, useCallback, useId } from "react";

export interface UploadFile {
  id: string;
  file: File;
  progress: number;        // 0–100
  status: "pending" | "uploading" | "done" | "cancelled" | "error";
  previewUrl?: string;
}

export interface FileUploadProps {
  accept?: string;         // e.g. "image/*"
  maxSizeMB?: number;
  onUploadComplete?: (file: UploadFile) => void;
  onCancel?: (fileId: string) => void;
}

// Mock upload: increments progress over ~2s
function mockUpload(
  fileId: string,
  onProgress: (id: string, pct: number) => void,
  onDone: (id: string) => void,
  signal: AbortSignal
) {
  let pct = 0;
  const tick = () => {
    if (signal.aborted) return;
    pct = Math.min(100, pct + Math.random() * 18 + 4);
    onProgress(fileId, Math.round(pct));
    if (pct < 100) setTimeout(tick, 120);
    else onDone(fileId);
  };
  setTimeout(tick, 80);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function FileUpload({
  accept = "image/*",
  maxSizeMB = 5,
  onUploadComplete,
  onCancel,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const abortMap = useRef<Map<string, AbortController>>(new Map());

  const startUpload = useCallback((file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    const id = crypto.randomUUID();
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    const entry: UploadFile = { id, file, progress: 0, status: "uploading", previewUrl };

    setFiles((prev) => [...prev, entry]);

    const ac = new AbortController();
    abortMap.current.set(id, ac);

    mockUpload(
      id,
      (fid, pct) => setFiles((prev) => prev.map((f) => f.id === fid ? { ...f, progress: pct } : f)),
      (fid) => {
        setFiles((prev) => prev.map((f) => f.id === fid ? { ...f, status: "done", progress: 100 } : f));
        abortMap.current.delete(fid);
        const done = files.find((f) => f.id === fid) ?? entry;
        onUploadComplete?.({ ...done, status: "done", progress: 100 });
      },
      ac.signal
    );
  }, [files, maxSizeMB, onUploadComplete]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(startUpload);
  };

  const cancel = (id: string) => {
    abortMap.current.get(id)?.abort();
    abortMap.current.delete(id);
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status: "cancelled" } : f));
    onCancel?.(id);
  };

  const remove = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file — click or drop here"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `1.5px dashed ${dragOver ? "#6366f1" : "#374151"}`,
          borderRadius: 10,
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          background: dragOver ? "rgba(99,102,241,0.06)" : "transparent",
          transition: "border-color 0.15s, background 0.15s",
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #6366f1")}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      >
        <span style={{ color: dragOver ? "#6366f1" : "#6b7280" }}>
          <UploadIcon />
        </span>
        <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>
          Drop files here or click to browse
        </span>
        <span style={{ fontSize: 11, color: "#6b7280" }}>
          {accept.replace("image/*", "Images")} · max {maxSizeMB}MB
        </span>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
      />

      {/* File list */}
      {files.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map((f) => (
            <li
              key={f.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#161b22",
                border: "0.5px solid #21262d",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: 36, height: 36, borderRadius: 6, overflow: "hidden",
                background: "#1f2937", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {f.previewUrl
                  ? <img src={f.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth={1.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                }
              </div>

              {/* Info + bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#e5e7eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                    {f.file.name}
                  </span>
                  <span style={{ fontSize: 11, color: "#6b7280", flexShrink: 0 }}>
                    {formatBytes(f.file.size)}
                  </span>
                </div>

                {f.status === "uploading" && (
                  <div style={{ height: 3, background: "#374151", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${f.progress}%`,
                      background: "#6366f1", borderRadius: 2,
                      transition: "width 0.1s linear",
                    }} role="progressbar" aria-valuenow={f.progress} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                )}

                {f.status === "done" && (
                  <span style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckIcon /> uploaded
                  </span>
                )}
                {f.status === "cancelled" && (
                  <span style={{ fontSize: 11, color: "#6b7280" }}>cancelled</span>
                )}
                {f.status === "error" && (
                  <span style={{ fontSize: 11, color: "#ef4444" }}>upload failed</span>
                )}
              </div>

              {/* Action */}
              {f.status === "uploading" ? (
                <button
                  onClick={() => cancel(f.id)}
                  aria-label={`Cancel upload of ${f.file.name}`}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#6b7280", padding: 4, flexShrink: 0,
                    borderRadius: 4, display: "flex", alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                >
                  <XIcon size={14} />
                </button>
              ) : (
                <button
                  onClick={() => remove(f.id)}
                  aria-label={`Remove ${f.file.name}`}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#4b5563", padding: 4, flexShrink: 0,
                    borderRadius: 4, display: "flex", alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
                >
                  <XIcon size={12} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}