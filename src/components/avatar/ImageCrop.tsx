"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

export interface CropResult {
  x: number;       // 0–1 relative coords
  y: number;
  size: number;    // 0–1, always square
  dataUrl?: string;
}

export interface ImageCropProps {
  src: string;                          // image src to crop
  outputSize?: number;                  // canvas output px (default 256)
  onCropChange?: (crop: CropResult) => void;
  onConfirm?: (result: CropResult) => void;
  onCancel?: () => void;
}

const HANDLE_HIT = 12; // px hit area per spec (8–12px)

type Handle = "nw" | "ne" | "sw" | "se";

interface CropState {
  x: number; y: number; size: number;
}

export default function ImageCrop({
  src,
  outputSize = 256,
  onCropChange,
  onConfirm,
  onCancel,
}: ImageCropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0.1, y: 0.1, size: 0.8 });
  const [dragging, setDragging] = useState<Handle | "move" | null>(null);
  const dragStart = useRef<{ mx: number; my: number; crop: CropState } | null>(null);
  const [ready, setReady] = useState(false);

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const updateCrop = useCallback((next: CropState) => {
    const c = {
      x: clamp(next.x, 0, 1 - next.size),
      y: clamp(next.y, 0, 1 - next.size),
      size: clamp(next.size, 0.1, 1),
    };
    c.x = clamp(c.x, 0, 1 - c.size);
    c.y = clamp(c.y, 0, 1 - c.size);
    setCrop(c);
    onCropChange?.({ ...c });
  }, [onCropChange]);

  const getRelative = useCallback((e: MouseEvent | TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const pt = "touches" in e ? e.touches[0] : e as MouseEvent;
    return {
      rx: (pt.clientX - rect.left) / rect.width,
      ry: (pt.clientY - rect.top) / rect.height,
    };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, type: Handle | "move") => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current!.getBoundingClientRect();
    const pt = "touches" in e ? e.touches[0] : e as React.MouseEvent;
    dragStart.current = {
      mx: (pt.clientX - rect.left) / rect.width,
      my: (pt.clientY - rect.top) / rect.height,
      crop: { ...crop },
    };
    setDragging(type);
  }, [crop]);

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging || !dragStart.current) return;
      const { rx, ry } = getRelative(e);
      const ds = dragStart.current;
      const dx = rx - ds.mx;
      const dy = ry - ds.my;

      if (dragging === "move") {
        updateCrop({ ...ds.crop, x: ds.crop.x + dx, y: ds.crop.y + dy });
        return;
      }

      // Corner handles — resize
      let { x, y, size } = ds.crop;
      const delta = Math.max(dx, dy);

      if (dragging === "se") {
        updateCrop({ x, y, size: clamp(size + delta, 0.1, Math.min(1 - x, 1 - y)) });
      } else if (dragging === "nw") {
        const ns = clamp(size - delta, 0.1, 1);
        updateCrop({ x: x + (size - ns), y: y + (size - ns), size: ns });
      } else if (dragging === "ne") {
        const ns = clamp(size + dx, 0.1, Math.min(1 - x, 1));
        updateCrop({ x, y: y + (size - ns), size: ns });
      } else if (dragging === "sw") {
        const ns = clamp(size + dy, 0.1, Math.min(1, 1 - y));
        updateCrop({ x: x + (size - ns), y, size: ns });
      }
    };

    const up = () => { setDragging(null); dragStart.current = null; };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, getRelative, updateCrop]);

  const handleConfirm = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = outputSize;
    canvas.height = outputSize;
    ctx.drawImage(
      img,
      crop.x * img.naturalWidth,
      crop.y * img.naturalHeight,
      crop.size * img.naturalWidth,
      crop.size * img.naturalHeight,
      0, 0, outputSize, outputSize
    );
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onConfirm?.({ ...crop, dataUrl });
  };

  // Crop overlay CSS values (%)
  const left = `${crop.x * 100}%`;
  const top = `${crop.y * 100}%`;
  const size = `${crop.size * 100}%`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Crop canvas */}
      <div
        ref={containerRef}
        style={{ position: "relative", userSelect: "none", borderRadius: 8, overflow: "hidden", background: "#000" }}
      >
        <img
          ref={imgRef}
          src={src}
          alt="Crop preview"
          draggable={false}
          onLoad={() => setReady(true)}
          style={{ display: "block", width: "100%", height: "auto", opacity: 0.45, pointerEvents: "none" }}
        />

        {ready && (
          <>
            {/* Bright crop region */}
            <div
              style={{
                position: "absolute",
                left, top,
                width: size, height: size,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                borderRadius: 4,
                cursor: dragging === "move" ? "grabbing" : "grab",
                outline: "1.5px solid rgba(255,255,255,0.7)",
              }}
              onMouseDown={(e) => onMouseDown(e, "move")}
              onTouchStart={(e) => onMouseDown(e, "move")}
            >
              {/* Grid lines */}
              {[33, 66].map((p) => (
                <React.Fragment key={p}>
                  <div style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: "0.5px", background: "rgba(255,255,255,0.25)" }} />
                  <div style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: "0.5px", background: "rgba(255,255,255,0.25)" }} />
                </React.Fragment>
              ))}

              {/* Corner handles */}
              {(["nw", "ne", "sw", "se"] as Handle[]).map((h) => (
                <div
                  key={h}
                  onMouseDown={(e) => onMouseDown(e, h)}
                  onTouchStart={(e) => onMouseDown(e, h)}
                  aria-label={`${h} resize handle`}
                  style={{
                    position: "absolute",
                    width: HANDLE_HIT * 2,
                    height: HANDLE_HIT * 2,
                    ...(h.includes("n") ? { top: -HANDLE_HIT } : { bottom: -HANDLE_HIT }),
                    ...(h.includes("w") ? { left: -HANDLE_HIT } : { right: -HANDLE_HIT }),
                    cursor: h === "nw" || h === "se" ? "nwse-resize" : "nesw-resize",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <div style={{
                    width: 10, height: 10,
                    background: "#fff",
                    borderRadius: 2,
                    border: "1.5px solid #6366f1",
                  }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hidden canvas for output */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              fontFamily: "inherit", fontSize: 13, cursor: "pointer",
              border: "0.5px solid #374151", background: "transparent",
              color: "#9ca3af", borderRadius: 6, padding: "6px 14px",
              transition: "background 0.12s",
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleConfirm}
          disabled={!ready}
          style={{
            fontFamily: "inherit", fontSize: 13, cursor: ready ? "pointer" : "default",
            border: "none", background: "#6366f1",
            color: "#fff", borderRadius: 6, padding: "6px 16px",
            fontWeight: 500, opacity: ready ? 1 : 0.5,
            transition: "opacity 0.12s",
          }}
        >
          Apply crop
        </button>
      </div>
    </div>
  );
}