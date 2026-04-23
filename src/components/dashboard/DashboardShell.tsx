"use client";

import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileBottomNav from "./MobileBottomNav";

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Client-side shell that provides auth context and the persistent
 * layout chrome (sidebar, header, mobile nav).
 *
 * Layout — Desktop:
 *   ┌────────────┬────────────────────────┐
 *   │  Sidebar   │   Top Header           │
 *   │  (256px)   ├────────────────────────┤
 *   │            │   <children>           │
 *   └────────────┴────────────────────────┘
 *
 * Layout — Mobile:
 *   ┌────────────────────────┐
 *   │   Compact Header       │
 *   ├────────────────────────┤
 *   │   <children>           │
 *   ├────────────────────────┤
 *   │   Bottom Nav           │
 *   └────────────────────────┘
 */
export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <AuthProvider>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Top header — spans full width minus sidebar on desktop */}
      <TopHeader />

      {/* Main content area */}
      <main
        className="
          pt-16        /* clear fixed header */
          md:pl-64     /* clear fixed sidebar */
          pb-20 md:pb-0 /* clear mobile bottom nav */
          min-h-screen
          bg-app-bg
        "
        id="main-content"
      >
        <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </AuthProvider>
  );
}
