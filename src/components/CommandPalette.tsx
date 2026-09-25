"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// The palette body (routes, icons, dialog markup) is split into its own chunk
// and only fetched once the palette is first opened — it lives in the global
// layout but is rarely used, so it should not ship in the initial bundle.
const CommandPaletteDialog = dynamic(
  () => import("./CommandPaletteDialog").then((mod) => mod.CommandPaletteDialog),
  { ssr: false },
);

/**
 * Lightweight launcher that owns the Cmd/Ctrl+K shortcut and open state, and
 * lazy-loads the heavy CommandPaletteDialog on demand.
 */
export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isOpen) return null;

  return <CommandPaletteDialog onClose={() => setIsOpen(false)} />;
}
