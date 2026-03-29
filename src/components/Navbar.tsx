'use client';

import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationToggle } from "./notifications/NotificationToggle";
import { useAuth, useI18n, useWallet, useWalletConfig } from "@/contexts";
import { Button } from "./ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 md:px-8 md:py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-brand-400">&#x2B21;</span> NeuroWealth
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">{messages.navbar.features}</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">{messages.navbar.howItWorks}</Link>
          <Link href="#strategies" className="hover:text-white transition-colors">{messages.navbar.strategies}</Link>
          <Link href="/help" className="hover:text-white transition-colors">{messages.navbar.help}</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
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
          <WalletConnectButton />

          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase font-bold leading-none">{messages.navbar.account}</span>
                <span className="text-xs text-white font-medium">{user.name}</span>
              </div>
              <button
                onClick={signOut}
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
    </nav>
  );
}
