"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DASHBOARD_ROUTE_TITLE_ID, MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileBottomNav from "./MobileBottomNav";

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Client-side shell for the persistent dashboard layout chrome
 * (sidebar, header, mobile nav).
 *
 * Auth is provided by {@link ClientProviders} at the root — this
 * component does NOT wrap its own AuthProvider.
 *
 * Layout — Desktop (≥ 1024px):
 *   ┌────────────┬────────────────────────┐
 *   │  Sidebar   │   Top Header           │
 *   │  (256px)   ├────────────────────────┤
 *   │            │   <children>           │
 *   └────────────┴────────────────────────┘
 *
 * Layout — Tablet (640–1023px):
 *   ┌──────┬─────────────────────────────┐
 *   │ Rail │   Top Header                │
 *   │ 56px ├─────────────────────────────┤
 *   │      │   <children>                │
 *   └──────┴─────────────────────────────┘
 *   Rail expands to 256px on user toggle.
 *
 * Layout — Mobile (< 640px):
 *   ┌────────────────────────┐
 *   │   Compact Top Header   │
 *   ├────────────────────────┤
 *   │   <children>           │
 *   ├────────────────────────┤
 *   │   Bottom Nav           │
 *   └────────────────────────┘
 */
export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.getElementById(MAIN_CONTENT_LANDMARK_ID);
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <>
      {/* Sidebar: hidden on mobile, icon-rail on tablet, full on desktop */}
      <Sidebar />

      {/* Top header — spans full width minus sidebar */}
      <TopHeader />

      {/* Main content area */}
      <main
        className="
          pt-16          /* clear fixed header (64px) */
          sm:pl-14       /* clear collapsed tablet sidebar (56px) */
          lg:pl-64       /* clear full desktop sidebar (256px) */
          min-h-screen
          bg-app-bg
        "
        style={{
          // On mobile (<640px): clear fixed bottom nav (80px) plus home indicator.
          // On sm+: bottom nav is hidden so no extra clearance needed.
          paddingBottom: "max(5rem, calc(5rem + var(--sai-bottom, 0px)))",
        }}
        id={MAIN_CONTENT_LANDMARK_ID}
        tabIndex={-1}
        aria-labelledby={DASHBOARD_ROUTE_TITLE_ID}
      >
        <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation — visible below 640px only */}
      <MobileBottomNav />
    </>
  );
}
