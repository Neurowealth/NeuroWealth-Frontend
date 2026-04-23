"use client";

import React from "react";
import { RouteMetadata } from "./breadcrumb.types";

// Mock icons as simple SVG components
export const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const DashboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const WalletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4a2 2 0 01-2-2V6a2 2 0 012-2h16v4" />
    <path d="M22 12a2 2 0 00-2-2h-2a2 2 0 00-2 2v0a2 2 0 002 2h2a2 2 0 002-2z" />
  </svg>
);

export const AuditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);

export const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    <path d="M12 2a10 10 0 010 20" />
  </svg>
);

export const TransactionsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);

// Mock route metadata registry
export const routeMetadata: Record<string, RouteMetadata> = {
  "/": { label: "Home", icon: <HomeIcon />, href: "/" },
  "/dashboard": { label: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  "/wallet": { label: "Wallet", icon: <WalletIcon />, href: "/wallet" },
  "/wallet/connect": { label: "Connect Wallet", href: "/wallet/connect" },
  "/wallet/transactions": { label: "Transactions", icon: <TransactionsIcon />, href: "/wallet/transactions" },
  "/wallet/transactions/detail": { label: "Transaction Detail", href: "/wallet/transactions/detail" },
  "/audit": { label: "Audit", icon: <AuditIcon />, href: "/audit" },
  "/audit/reports": { label: "Reports", href: "/audit/reports" },
  "/audit/reports/2024": { label: "2024 Report", href: "/audit/reports/2024" },
  "/settings": { label: "Settings", icon: <SettingsIcon />, href: "/settings" },
  "/settings/profile": { label: "Profile", href: "/settings/profile" },
};

// Helper: build breadcrumb items from a pathname string
export function buildBreadcrumbsFromPath(pathname: string): import("./breadcrumb.types").BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: import("./breadcrumb.types").BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: <HomeIcon /> },
  ];

  let cumulative = "";
  segments.forEach((seg, idx) => {
    cumulative += `/${seg}`;
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