'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import WalletConnectButton from "./WalletConnectButton";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationToggle } from "./notifications/NotificationToggle";
import { useAuth, useI18n, useWallet, useWalletConfig } from "@/contexts";
import { Button } from "./ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { GlobalSearch } from "./search/GlobalSearch";

function truncateAddress(address: string) {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNetworkLabel(network?: string) {
  if (!network) return "UNKNOWN";
  const normalized = network.toLowerCase();
  if (normalized.includes("test")) return "TESTNET";
  if (normalized.includes("public")) return "PUBLIC";
  return network;
}

export function Navbar() {
  const { user, signOut } = useAuth();
  const { messages } = useI18n();
  const { connected, isRestoring, publicKey } = useWallet();
  const config = useWalletConfig();
  const networkLabel = formatNetworkLabel(config?.network);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSearchOpen]);

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 md:gap-4 md:px-8 md:py-5">
        <Link href="/" aria-label="NeuroWealth home" className="flex items-center gap-2 text-lg font-bold text-white">
          <span aria-hidden="true" className="text-brand-400">&#x2B21;</span> NeuroWealth
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">{messages.navbar.features}</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">{messages.navbar.howItWorks}</Link>
          <Link href="#strategies" className="hover:text-white transition-colors">{messages.navbar.strategies}</Link>
          <Link href="/help" className="hover:text-white transition-colors">{messages.navbar.help}</Link>
        </div>

        <div className="hidden md:block md:flex-1 md:max-w-xl">
          <GlobalSearch placeholder="Search pages, actions, or records" />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
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

          <LocaleSwitcher />

          <Link href="/help" className="md:hidden text-sm text-slate-400 hover:text-white transition-colors">
            {messages.navbar.help}
          </Link>

          {!isRestoring && connected && publicKey && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-cyan-300">
                {networkLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {truncateAddress(publicKey)}
              </span>
            </div>
          )}

          <NotificationToggle />
          <ThemeToggle />
          <WalletConnectButton />

          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase font-bold leading-none">{messages.navbar.account}</span>
                <span className="text-xs text-white font-medium">{user.name}</span>
              </div>
              <button
                onClick={signOut}
                aria-label={`Sign out of ${user.name}'s account`}
                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase font-bold"
              >
                {messages.navbar.signOut}
              </button>
            </div>
          ) : (
            <Link href="/signin">
              <Button variant="secondary" size="sm" className="text-xs h-9">
                {messages.navbar.signIn}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isMobileSearchOpen && (
        <div
          className="fixed inset-0 z-[80] bg-slate-950/90 backdrop-blur-md md:hidden"
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
              className="z-[81]"
            />

            <p className="mt-3 text-xs text-slate-400">
              Tip: Use arrow keys to move through results and Enter to navigate.
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
