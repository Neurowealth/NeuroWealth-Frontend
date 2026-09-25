'use client';

import { useRef } from "react";
import { Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import type { NavbarSearchState } from "./useNavbarSearch";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const GlobalSearch = dynamic(
  () => import("../search/GlobalSearch").then((mod) => mod.GlobalSearch),
  { ssr: false }
);

export function NavbarSearchBox({
  isDesktopSearchActive,
  setIsDesktopSearchActive,
}: Pick<NavbarSearchState, "isDesktopSearchActive" | "setIsDesktopSearchActive">) {
  return (
    <search className="hidden md:block md:flex-1 md:max-w-xl">
      {isDesktopSearchActive ? (
        <GlobalSearch
          placeholder="Search pages, actions, or records"
          autoFocus
          onRequestClose={() => setIsDesktopSearchActive(false)}
        />
      ) : (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search pages, actions, or records"
            onFocus={() => setIsDesktopSearchActive(true)}
            onClick={() => setIsDesktopSearchActive(true)}
            className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 pl-10 pr-10 text-sm text-white shadow-inner shadow-black/20 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
            readOnly
          />
        </div>
      )}
    </search>
  );
}

export function NavbarSearchTrigger({
  isMobileSearchOpen,
  setIsMobileSearchOpen,
}: Pick<NavbarSearchState, "isMobileSearchOpen" | "setIsMobileSearchOpen">) {
  return (
    <button
      type="button"
      onClick={() => setIsMobileSearchOpen(true)}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:text-white hover:bg-white/10 md:hidden"
      aria-label="Open global search"
      aria-haspopup="dialog"
      aria-expanded={isMobileSearchOpen}
    >
      <Search size={18} aria-hidden="true" />
    </button>
  );
}

export function NavbarSearchModal({
  isMobileSearchOpen,
  setIsMobileSearchOpen,
}: Pick<NavbarSearchState, "isMobileSearchOpen" | "setIsMobileSearchOpen">) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isMobileSearchOpen);

  if (!isMobileSearchOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-modal bg-slate-950/90 backdrop-blur-md md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 pb-4 pt-5 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-200">Search</p>
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close search"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <GlobalSearch
          autoFocus
          onRequestClose={() => setIsMobileSearchOpen(false)}
          className="z-dropdown"
        />

        <p className="mt-3 text-xs text-slate-400">
          Tip: Use arrow keys to move through results and Enter to navigate.
        </p>
      </div>
    </div>
  );
}
