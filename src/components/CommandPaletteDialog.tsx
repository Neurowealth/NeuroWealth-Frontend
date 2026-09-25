"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Settings } from "lucide-react";
import { commandPaletteRoutes } from "@/lib/routeMetadata";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type Command = {
  id: string;
  name: string;
  icon: React.ElementType;
  action: () => void;
};

interface CommandPaletteDialogProps {
  onClose: () => void;
}

const mockActions = [
  {
    id: "action-logout",
    name: "Mock: Logout",
    action: () => alert("Logged Out"),
  },
  {
    id: "action-theme",
    name: "Mock: Toggle Theme",
    action: () => alert("Theme Toggled"),
  },
];

/**
 * The command palette UI. Loaded lazily by `CommandPalette` only after the
 * palette is first opened, so its routes/icons/markup stay out of the initial
 * bundle. Always mounted in the open state — open/close is owned by the parent.
 */
export function CommandPaletteDialog({ onClose }: CommandPaletteDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Always mounted open (the parent owns open/close), so the trap is always active.
  useFocusTrap(containerRef, true);

  const allCommands: Command[] = useMemo(
    () => [
      ...commandPaletteRoutes.map((route) => ({
        ...route,
        action: () => {
          router.push(route.path);
          onClose();
        },
      })),
      ...mockActions.map((action) => ({
        ...action,
        icon: Settings,
        action: () => {
          action.action();
          onClose();
        },
      })),
    ],
    [router, onClose],
  );

  const filteredCommands = useMemo(
    () =>
      allCommands.filter((command) =>
        command.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [allCommands, query],
  );

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
    // Announce result count change to screen readers
    if (liveRegionRef.current) {
      const count = filteredCommands.length;
      liveRegionRef.current.textContent =
        count === 0
          ? `No results found for "${query}"`
          : `${count} result${count === 1 ? "" : "s"} found`;
    }
  }, [query, filteredCommands.length]);

  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const activeElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, filteredCommands.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Escape regardless of results
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    // If no results, only Escape is handled (already returned above)
    if (filteredCommands.length === 0) {
      return;
    }

    // Ensure selectedIndex is valid (in case it got out of sync)
    const validSelectedIndex = Math.min(
      selectedIndex,
      filteredCommands.length - 1,
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + filteredCommands.length) % filteredCommands.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCommands[validSelectedIndex];
      if (selected) {
        selected.action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center px-0 pt-[10vh] sm:px-4 sm:pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity motion-reduce:transition-none"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="relative w-full max-w-full overflow-hidden border border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none motion-reduce:duration-0 motion-reduce:transform-none sm:max-w-[640px] sm:rounded-xl"
      >
        <div className="flex min-h-[56px] items-center border-b border-slate-800 px-4">
          <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search routes and actions... (Cmd+K)"
            className="flex-1 border-none bg-transparent pt-[1px] text-slate-200 outline-none placeholder:text-slate-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={
              filteredCommands[selectedIndex]
                ? filteredCommands[selectedIndex].id
                : undefined
            }
          />
        </div>

        <ul
          id="command-palette-results"
          ref={listRef}
          role="listbox"
          className="max-h-[300px] overflow-y-auto p-2 sm:max-h-[400px]"
        >
          {filteredCommands.length === 0 && (
            <li className="p-4 text-center text-sm text-slate-500">
              No results found for &quot;{query}&quot;
            </li>
          )}
          {filteredCommands.map((command, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={command.id}
                id={command.id}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "flex min-h-[44px] cursor-pointer items-center rounded-md px-4 py-2 text-sm transition-colors motion-reduce:transition-none",
                  isSelected
                    ? "bg-slate-800 text-sky-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                )}
                onClick={() => command.action()}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <command.icon className="mr-3 h-4 w-4 shrink-0" />
                <span>{command.name}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}
