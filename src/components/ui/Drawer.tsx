"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  preventClose?: boolean;
  side?: "left" | "right";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  preventClose = false,
  side = "right",
}: DrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, preventClose, onClose]);

  const slideClass = side === "right"
    ? isOpen ? "translate-x-0" : "translate-x-full"
    : isOpen ? "translate-x-0" : "-translate-x-full";

  const positionClass = side === "right" ? "right-0" : "left-0";

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex"
      aria-modal="true"
      role="dialog"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !preventClose && onClose()}
      />

      {/* Panel — 360px desktop, full mobile */}
      <div
        ref={containerRef}
        className={`absolute top-0 bottom-0 ${positionClass} z-10 w-full sm:w-[360px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${slideClass}`}
      >
        {/* Header — 16px padding */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-2ark:border-zinc-700">
          <h2 id="drawer-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          {!preventClose && (
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Body — 24px padding */}
        <div className="px-6 py-6 flex-1 overflow-y-auto text-zinc-700 dark:text-zinc-300">
          {children}
        </div>

        {/* Footer — 16px padding */}
        {footer && (
      <div className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
