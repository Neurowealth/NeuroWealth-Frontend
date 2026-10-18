"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export interface CropResult {
  x: number; // 0–1 relative coords
  y: number;
  size: number; // 0–1, always square
  dataUrl?: string;
}

export interface ImageCropProps {
  src: string; // image src to crop
  outputSize?: number; // canvas output px (default 256)
  onCropChange?: (crop: CropResult) => void;
  onConfirm?: (result: CropResult) => void;
  onCancel?: () => void;
}

const HANDLE_HIT = 12; // px hit area per spec (8–12px)
const KEY_STEP = 0.02;
const KEY_STEP_SHIFT = 0.08;

type Handle = "nw" | "ne" | "sw" | "se";

const HANDLE_LABELS: Record<Handle, string> = {
  nw: "North-west corner, resize crop with arrow keys",
  ne: "North-east corner, resize crop with arrow keys",
  sw: "South-west corner, resize crop with arrow keys",
  se: "South-east corner, resize crop with arrow keys",
};

function cropStep(shiftKey: boolean): number {
  return shiftKey ? KEY_STEP_SHIFT : KEY_STEP;
}

function moveCropByKey(
  key: string,
  crop: CropState,
  step: number,
): CropState | null {
  switch (key) {
    case "ArrowLeft":
      return { ...crop, x: crop.x - step };
    case "ArrowRight":
      return { ...crop, x: crop.x + step };
    case "ArrowUp":
      return { ...crop, y: crop.y - step };
    case "ArrowDown":
      return { ...crop, y: crop.y + step };
    default:
      return null;
  }
}

function resizeCropByKey(
  handle: Handle,
  key: string,
  crop: CropState,
  step: number,
  clamp: (v: number, lo: number, hi: number) => number,
): CropState | null {
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key))
    return null;

  let { x, y, size } = crop;
  // Mirror the pointer-drag math: se/nw follow both axes, ne only follows
  // the x axis (dx) and sw only follows the y axis (dy).
  let delta: number;
  if (handle === "se" || handle === "nw") {
    const growKeys =
      handle === "se" ? ["ArrowRight", "ArrowDown"] : ["ArrowLeft", "ArrowUp"];
    delta = growKeys.includes(key) ? -step : step;
  } else if (handle === "ne") {
    if (key !== "ArrowLeft" && key !== "ArrowRight") return null;
    delta = key === "ArrowRight" ? -step : step;
  } else {
    if (key !== "ArrowUp" && key !== "ArrowDown") return null;
    delta = key === "ArrowDown" ? -step : step;
  }

  if (handle === "se") {
    const ns = clamp(size - delta, 0.1, Math.min(1 - x, 1 - y));
    return { x, y, size: ns };
  }
  if (handle === "nw") {
    const ns = clamp(size - delta, 0.1, 1);
    return { x: x + (size - ns), y: y + (size - ns), size: ns };
  }
  if (handle === "ne") {
    const ns = clamp(size - delta, 0.1, Math.min(1 - x, 1));
    return { x, y: y + (size - ns), size: ns };
  }
  if (handle === "sw") {
    const ns = clamp(size - delta, 0.1, Math.min(1, 1 - y));
    return { x: x + (size - ns), y, size: ns };
  }
  return null;
}

function isCropArrowKey(key: string): boolean {
  return (
    key === "ArrowUp" ||
    key === "ArrowDown" ||
    key === "ArrowLeft" ||
    key === "ArrowRight"
  );
}

function handleMaxSizePercent(h: Handle, crop: CropState): number {
  return Math.round(
    Math.min(
      h.includes("w") ? crop.x + crop.size : 1 - crop.x,
      h.includes("n") ? crop.y + crop.size : 1 - crop.y,
    ) * 100,
  );
}

interface CropState {
  x: number;
  y: number;
  size: number;
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
  const dragStart = useRef<{ mx: number; my: number; crop: CropState } | null>(
    null,
  );
  const [ready, setReady] = useState(false);

  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const updateCrop = useCallback(
    (next: CropState) => {
      const c = {
        x: clamp(next.x, 0, 1 - next.size),
        y: clamp(next.y, 0, 1 - next.size),
        size: clamp(next.size, 0.1, 1),
      };
      c.x = clamp(c.x, 0, 1 - c.size);
      c.y = clamp(c.y, 0, 1 - c.size);
      setCrop(c);
      onCropChange?.({ ...c });
    },
    [onCropChange],
  );

  const onCropKeyDown = useCallback(
    (e: React.KeyboardEvent, mode: Handle | "move") => {
      if (!isCropArrowKey(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      const step = cropStep(e.shiftKey);
      const next =
        mode === "move"
          ? moveCropByKey(e.key, crop, step)
          : resizeCropByKey(mode, e.key, crop, step, clamp);
      if (next) updateCrop(next);
    },
    [crop, updateCrop],
  );

  const getRelative = useCallback((e: MouseEvent | TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const pt = "touches" in e ? e.touches[0] : (e as MouseEvent);
    return {
      rx: (pt.clientX - rect.left) / rect.width,
      ry: (pt.clientY - rect.top) / rect.height,
    };
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, type: Handle | "move") => {
      e.preventDefault();
      e.stopPropagation();
      const rect = containerRef.current!.getBoundingClientRect();
      const pt = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
      dragStart.current = {
        mx: (pt.clientX - rect.left) / rect.width,
        my: (pt.clientY - rect.top) / rect.height,
        crop: { ...crop },
      };
      setDragging(type);
    },
    [crop],
  );

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
        updateCrop({
          x,
          y,
          size: clamp(size + delta, 0.1, Math.min(1 - x, 1 - y)),
        });
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

    const up = () => {
      setDragging(null);
      dragStart.current = null;
    };

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
      0,
      0,
      outputSize,
      outputSize,
    );
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onConfirm?.({ ...crop, dataUrl });
  };

  // Crop overlay CSS values (%)
  const left = `${crop.x * 100}%`;
  const top = `${crop.y * 100}%`;
  const size = `${crop.size * 100}%`;

  return (
    <div className="flex flex-col gap-3">
      {/* Crop canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-black select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 
            Exception: Raw <img> required for canvas-based cropping logic (drawImage) 
            where naturalWidth/Height and direct ref access are essential. */}
        <img
          ref={imgRef}
          src={src}
          alt="Crop preview"
          draggable={false}
          onLoad={() => setReady(true)}
          className="block h-auto w-full opacity-45 pointer-events-none"
        />

        {ready && (
          <>
            {/* Visually-hidden instructions for screen readers */}
            <div id="crop-move-instructions" className="sr-only">
              Use the arrow keys to move the crop area. Hold Shift to move
              farther.
            </div>

            {/* Bright crop region */}
            <div
              role="group"
              tabIndex={0}
              aria-label="Move crop area"
              aria-describedby="crop-move-instructions"
              className={`absolute rounded outline-[1.5px] outline-white/70 ${
                dragging === "move" ? "cursor-grabbing" : "cursor-grab"
              } focus:outline-2 focus:outline-sky-500 dark:focus:outline-sky-400 focus:-outline-offset-1`}
              style={{
                left,
                top,
                width: size,
                height: size,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              }}
              onMouseDown={(e) => onMouseDown(e, "move")}
              onTouchStart={(e) => onMouseDown(e, "move")}
              onKeyDown={(e) => onCropKeyDown(e, "move")}
            >
              {/* Grid lines */}
              {[33, 66].map((p) => (
                <React.Fragment key={p}>
                  <div
                    className="absolute top-0 bottom-0 w-[0.5px] bg-white/25"
                    style={{ left: `${p}%` }}
                  />
                  <div
                    className="absolute left-0 right-0 h-[0.5px] bg-white/25"
                    style={{ top: `${p}%` }}
                  />
                </React.Fragment>
              ))}

              {/* Corner handles */}
              {(["nw", "ne", "sw", "se"] as Handle[]).map((h) => (
                <div
                  key={h}
                  role="slider"
                  tabIndex={0}
                  aria-label={HANDLE_LABELS[h]}
                  aria-valuemin={10}
                  aria-valuemax={handleMaxSizePercent(h, crop)}
                  aria-valuenow={Math.round(crop.size * 100)}
                  aria-valuetext={`${Math.round(crop.size * 100)}% crop size`}
                  aria-orientation="horizontal"
                  onMouseDown={(e) => onMouseDown(e, h)}
                  onTouchStart={(e) => onMouseDown(e, h)}
                  onKeyDown={(e) => onCropKeyDown(e, h)}
                  className={`absolute z-[2] flex items-center justify-center focus:outline-none focus-visible:outline-2 focus-visible:outline-sky-500 dark:focus-visible:outline-sky-400 focus-visible:outline-offset-2 ${
                    h === "nw" || h === "se"
                      ? "cursor-nwse-resize"
                      : "cursor-nesw-resize"
                  }`}
                  style={{
                    width: HANDLE_HIT * 2,
                    height: HANDLE_HIT * 2,
                    ...(h.includes("n")
                      ? { top: -HANDLE_HIT }
                      : { bottom: -HANDLE_HIT }),
                    ...(h.includes("w")
                      ? { left: -HANDLE_HIT }
                      : { right: -HANDLE_HIT }),
                  }}
                >
                  <div className="h-2.5 w-2.5 rounded-[2px] border-[1.5px] border-sky-500 bg-white dark:border-sky-400 dark:bg-slate-900" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hidden canvas for output */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          disabled={!ready}
        >
          Apply crop
        </Button>
      </div>
    </div>
  );
}
