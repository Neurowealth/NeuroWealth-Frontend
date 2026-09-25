/**
 * Route metadata: single source of truth for breadcrumbs and navigation labels.
 *
 * When adding a new route to the app (especially under /dashboard):
 * 1. Create the folder in src/app/<path>/
 * 2. Add a corresponding entry in appRouteDefinitions below
 * 3. Include a label so breadcrumbs and navigation stay in sync
 *
 * This ensures new routes don't silently lose their labels.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Blocks,
  BookOpenText,
  Gauge,
  HelpCircle,
  History,
  LayoutDashboard,
  LogIn,
  Newspaper,
  Settings,
  Shield,
  SlidersHorizontal,
  UserRound,
  Wallet,
} from "lucide-react";
import type { RouteMetadata } from "@/types/breadcrumb.types";

interface AppRouteDefinition {
  href: string;
  label: string;
  icon?: LucideIcon;
  dashboardNav?: {
    exact?: boolean;
    mobileLabel?: string;
  };
  commandPalette?: boolean;
  devOnly?: boolean;
}

interface DashboardNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
  mobileLabel: string;
}

interface CommandPaletteRoute {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
}

interface SiteNavigationLink {
  href: string;
  labelKey: "features" | "howItWorks" | "strategies" | "help";
  mobile?: boolean;
}

function renderRouteIcon(Icon?: LucideIcon): React.ReactNode | undefined {
  return Icon ? <Icon size={14} strokeWidth={2} /> : undefined;
}

const appRouteDefinitions: AppRouteDefinition[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Gauge,
    dashboardNav: { exact: true, mobileLabel: "Home" },
    commandPalette: true,
  },
  {
    href: "/dashboard/activity",
    label: "Activity",
    icon: Activity,
    dashboardNav: {},
  },
  {
    href: "/dashboard/async-states",
    label: "Async States",
    icon: Blocks,
    devOnly: true,
  },
  { href: "/dashboard/audit", label: "Audit Trail", icon: Newspaper },
  { href: "/dashboard/dev-errors", label: "Dev Errors", icon: AlertTriangle, devOnly: true },
  {
    href: "/dashboard/dev-errors/boundary-error",
    label: "Boundary Error",
    icon: AlertTriangle,
    devOnly: true,
  },
  {
    href: "/dashboard/dev-errors/route-error",
    label: "Route Error",
    icon: AlertTriangle,
    devOnly: true,
  },
  {
    href: "/dashboard/help",
    label: "Help",
    icon: HelpCircle,
    dashboardNav: {},
    commandPalette: true,
  },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  {
    href: "/dashboard/portfolio",
    label: "Portfolio",
    icon: Wallet,
    dashboardNav: {},
    commandPalette: true,
  },
  { href: "/dashboard/sandbox", label: "Sandbox", icon: SlidersHorizontal, devOnly: true },
  { href: "/dashboard/sandbox/ui-demo", label: "UI Demo", icon: Blocks, devOnly: true },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    dashboardNav: {},
    commandPalette: true,
  },
  {
    href: "/dashboard/settings/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/dashboard/settings/preferences",
    label: "Preferences",
    icon: SlidersHorizontal,
  },
  {
    href: "/dashboard/settings/privacy",
    label: "Privacy",
  },
  {
    href: "/dashboard/settings/security",
    label: "Security",
    icon: Shield,
  },
  {
    href: "/dashboard/strategy",
    label: "Strategy",
    icon: BookOpenText,
    dashboardNav: {},
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: History,
    dashboardNav: {},
  },
  { href: "/docs/charts", label: "Charts", icon: Activity },
  { href: "/docs/tokens", label: "Design Tokens", icon: Blocks },
  { href: "/login", label: "Login", icon: LogIn },
  { href: "/onboarding", label: "Onboarding", icon: BookOpenText },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
    commandPalette: true,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    commandPalette: true,
  },
  { href: "/server-error", label: "Server Error", icon: AlertTriangle },
  { href: "/signup", label: "Sign Up", icon: LogIn },
  { href: "/unauthorized", label: "Unauthorized", icon: Shield },
  { href: "/forbidden", label: "Forbidden", icon: Shield },
  { href: "/demo/avatar", label: "Avatar Demo", icon: UserRound, devOnly: true },
  { href: "/demo/datetime", label: "Date/Time Demo", icon: Activity, devOnly: true },
  { href: "/demo/notifications", label: "Notifications Demo", icon: Bell, devOnly: true },
  { href: "/demo/pagination-filters", label: "Pagination & Filters Demo", icon: SlidersHorizontal, devOnly: true },
  { href: "/demo/release-checklist", label: "Release Checklist Demo", icon: Newspaper, devOnly: true },
  { href: "/demo/table", label: "Table Demo", icon: Blocks, devOnly: true },
  { href: "/demo/wallet", label: "Wallet Demo", icon: Wallet, devOnly: true },
];

export const siteNavigationLinks: SiteNavigationLink[] = [
  { href: "#features", labelKey: "features" },
  { href: "#how-it-works", labelKey: "howItWorks" },
  { href: "#strategies", labelKey: "strategies" },
  { href: "/help", labelKey: "help", mobile: true },
];

function isDashboardNavigationRoute(
  definition: AppRouteDefinition,
): definition is AppRouteDefinition &
  Required<Pick<AppRouteDefinition, "icon" | "dashboardNav">> {
  return Boolean(definition.icon && definition.dashboardNav);
}

function isCommandPaletteRoute(
  definition: AppRouteDefinition,
): definition is AppRouteDefinition &
  Required<Pick<AppRouteDefinition, "icon">> {
  return Boolean(definition.icon && definition.commandPalette && !definition.devOnly);
}

export const routeMetadata: Record<string, RouteMetadata> = Object.fromEntries(
  appRouteDefinitions.map(({ href, label, icon }) => [
    href,
    {
      label,
      href,
      icon: renderRouteIcon(icon),
    },
  ]),
);

export const dashboardNavigation: DashboardNavigationItem[] = appRouteDefinitions
  .filter(isDashboardNavigationRoute)
  .filter((definition) => !definition.devOnly)
  .map(({ href, label, icon, dashboardNav }) => ({
    href,
    label,
    icon,
    exact: dashboardNav?.exact ?? false,
    mobileLabel: dashboardNav?.mobileLabel ?? label,
  }));

export const commandPaletteRoutes: CommandPaletteRoute[] = appRouteDefinitions
  .filter(isCommandPaletteRoute)
  .map(({ href, label, icon }) => ({
    id: `route-${href.replace(/\//g, "-").replace(/^-+/, "") || "home"}`,
    name: label,
    path: href,
    icon,
  }));

export function getRouteMetadata(pathname: string): RouteMetadata | undefined {
  return routeMetadata[pathname];
}

export function getRouteLabel(pathname: string, fallback = "Dashboard"): string {
  return getRouteMetadata(pathname)?.label ?? fallback;
}

export function buildBreadcrumbsFromPath(
  pathname: string,
): import("@/types/breadcrumb.types").BreadcrumbItem[] {
  const devOnlyHrefs = new Set(
    appRouteDefinitions.filter((d) => d.devOnly).map((d) => d.href),
  );

  const segments = pathname.split("/").filter(Boolean);
  const items: import("@/types/breadcrumb.types").BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: routeMetadata["/"]?.icon },
  ];

  let cumulative = "";
  segments.forEach((seg, idx) => {
    cumulative += `/${seg}`;

    if (devOnlyHrefs.has(cumulative)) {
      return;
    }

    const meta = routeMetadata[cumulative];
    items.push({
      label: meta?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      href: cumulative,
      icon: meta?.icon,
      isCurrentPage: idx === segments.length - 1,
    });
  });

  return items;
}

/** Verify all app routes are defined in routeMetadata. Call in tests or dev-time checks. */
export function validateRouteMetadataCompleteness(): {
  missingPaths: string[];
  valid: boolean;
} {
  const expectedPaths = appRouteDefinitions.map((def) => def.href);
  const missingPaths = expectedPaths.filter((path) => !routeMetadata[path]);

  return {
    missingPaths,
    valid: missingPaths.length === 0,
  };
}
