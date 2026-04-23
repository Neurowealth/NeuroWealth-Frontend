"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: BarChart2, exact: false },
  { href: "/dashboard/activity", label: "Activity", icon: History, exact: false },
  { href: "/dashboard/strategy", label: "Strategy", icon: TrendingUp, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
] as const;

// ── Sidebar component ─────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside
      className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-surface border-r border-surface-border z-30"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-surface-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
        </div>
        <span className="text-base font-bold text-text-primary">NeuroWealth</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation">
        <p className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "nav-link",
              isActive(href, exact) && "nav-link-active"
            )}
            aria-current={isActive(href, exact) ? "page" : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-surface-border shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0"
            aria-hidden="true"
          >
            {user?.avatarInitials ?? "??"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.displayName ?? "User"}
            </p>
            <p className="text-xs text-text-muted truncate">{user?.address}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="nav-link w-full"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
