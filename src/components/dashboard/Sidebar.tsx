"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Zap, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth, useI18n } from "@/contexts";
import { dashboardNavigation } from "@/lib/routeMetadata";
import { getUserAddressLabel, getUserInitials } from "@/lib/user";
import { cn } from "@/lib/utils";

// ── Sidebar component ──────────────────────────────────────────────────────────
// Responsive breakpoint behaviour (issue #76):
//   < 640px  (mobile)  → hidden; MobileBottomNav is used instead
//   640–1023px (tablet) → collapsed icon-only rail (56px wide), toggle to expand
//   ≥ 1024px (desktop)  → always full sidebar (256px wide)
//
// Design spec compliance:
//   • Touch targets   min-h-[44px] on all interactive elements
//   • Pointer targets min-h-[36px] on toggle button (mouse-only control)
//   • Active state    distinct bg + left border accent + bold text + aria-current="page"

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { messages } = useI18n();
  const [tabletExpanded, setTabletExpanded] = useState(false);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const initials =
    user?.avatarInitials ?? getUserInitials(user?.displayName ?? "");

  return (
    <aside
      id="dashboard-sidebar"
      className={cn(
        "hidden sm:flex flex-col fixed inset-y-0 left-0 bg-surface border-r border-surface-border z-30",
        "transition-[width] duration-200 ease-in-out overflow-hidden",
        tabletExpanded ? "w-64" : "w-14 lg:w-64",
      )}
      aria-label="Dashboard sidebar"
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-surface-border shrink-0",
          tabletExpanded
            ? "gap-2.5 px-4"
            : "justify-center px-0 lg:gap-2.5 lg:px-4",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
        </div>
        <span
          className={cn(
            "text-base font-bold text-text-primary whitespace-nowrap transition-opacity duration-150",
            tabletExpanded
              ? "opacity-100"
              : "opacity-0 w-0 lg:opacity-100 lg:w-auto",
          )}
        >
          NeuroWealth
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 px-1.5 py-4 space-y-1 overflow-y-auto overflow-x-hidden"
        aria-label="Sidebar navigation"
      >
        <h2
          className={cn(
            "px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap transition-opacity duration-150",
            tabletExpanded ? "opacity-100" : "opacity-0 lg:opacity-100",
          )}
        >
          Menu
        </h2>

        {dashboardNavigation.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg text-sm font-medium",
                // 44px min touch target height
                "min-h-[44px] transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                // Active: left border accent + tinted background + bold text
                active
                  ? "bg-primary/15 text-primary font-semibold border-l-[3px] border-primary pl-[9px] pr-3"
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary border-l-[3px] border-transparent pl-[9px] pr-3",
                !tabletExpanded && "justify-center lg:justify-start",
              )}
            >
              <Icon
                className={cn("w-5 h-5 shrink-0", active && "stroke-[2.25]")}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "whitespace-nowrap transition-opacity duration-150 truncate",
                  tabletExpanded
                    ? "opacity-100"
                    : "opacity-0 w-0 lg:opacity-100 lg:w-auto",
                )}
                aria-hidden={!tabletExpanded || undefined}
              >
                {label}
              </span>

              {/* Tooltip shown on hover when sidebar is collapsed on tablet */}
              {!tabletExpanded && (
                <span
                  className={cn(
                    "pointer-events-none absolute left-full ml-2 px-2 py-1 rounded-md text-xs z-50",
                    "bg-slate-800 text-slate-100 shadow-lg whitespace-nowrap",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150 lg:hidden",
                  )}
                  role="tooltip"
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User section ── */}
      <div className="px-1.5 py-3 border-t border-surface-border shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 mb-1 overflow-hidden",
            !tabletExpanded && "justify-center lg:justify-start",
          )}
        >
          <div
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 transition-opacity duration-150",
              tabletExpanded
                ? "opacity-100"
                : "opacity-0 w-0 lg:opacity-100 lg:w-auto",
            )}
          >
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.displayName ?? "User"}
            </p>
            <p className="text-xs text-text-muted truncate">
              {getUserAddressLabel(user ?? {})}
            </p>
          </div>
        </div>

        {/* Sign out — 44px min touch target */}
        <button
          onClick={signOut}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 w-full text-sm font-medium",
            "min-h-[44px] text-text-muted hover:bg-white/5 hover:text-red-400 transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
            !tabletExpanded && "justify-center lg:justify-start",
          )}
          aria-label={
            user
              ? `Sign out of ${user.displayName}'s account`
              : messages.navbar.signOut
          }
        >
          <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span
            className={cn(
              "whitespace-nowrap transition-opacity duration-150",
              tabletExpanded
                ? "opacity-100"
                : "opacity-0 w-0 lg:opacity-100 lg:w-auto",
            )}
          >
            {messages.navbar.signOut}
          </span>
          {!tabletExpanded && (
            <span
              className="pointer-events-none absolute left-full ml-2 px-2 py-1 rounded-md text-xs bg-slate-800 text-slate-100 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 lg:hidden z-50"
              role="tooltip"
            >
              {messages.navbar.signOut}
            </span>
          )}
        </button>

        {/* Expand / collapse toggle — tablet only; 36px pointer target is sufficient here */}
        <button
          onClick={() => setTabletExpanded((v) => !v)}
          className={cn(
            "mt-2 flex items-center justify-center w-full rounded-lg min-h-[36px] text-text-muted",
            "hover:bg-white/5 hover:text-text-primary transition-colors duration-150 lg:hidden",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          )}
          aria-label={tabletExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={tabletExpanded}
          aria-controls="dashboard-sidebar"
        >
          {tabletExpanded ? (
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </aside>
  );
}
