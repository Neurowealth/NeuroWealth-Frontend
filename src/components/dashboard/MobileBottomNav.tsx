"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  History,
  LayoutDashboard,
  Settings,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: BarChart2, exact: false },
  { href: "/dashboard/activity", label: "Activity", icon: History, exact: false },
  { href: "/dashboard/strategy", label: "Strategy", icon: TrendingUp, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-surface-border"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center justify-around h-16" role="list">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 w-full h-full text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-text-muted hover:text-text-secondary"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn("w-5 h-5", active && "stroke-[2.25]")}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
