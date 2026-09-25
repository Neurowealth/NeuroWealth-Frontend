"use client";

import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts";
import { DASHBOARD_ROUTE_TITLE_ID } from "@/lib/app-landmarks";
import { usePathname } from "next/navigation";
import { getRouteLabel } from "@/lib/routeMetadata";
import { getUserInitials } from "@/lib/user";
import { useNotifications } from "@/hooks/useNotifications";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export default function TopHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = getRouteLabel(pathname);
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(notificationsRef, () => setIsNotificationsOpen(false));

  return (
    <header
      className="
        fixed top-0 right-0 left-0
        sm:left-14 lg:left-64
        h-16 z-20
        bg-app-bg/80 backdrop-blur-sm
        border-b border-surface-border
        flex items-center justify-between
        px-4 md:px-6
      "
      role="banner"
    >
      {/* Left: Logo (mobile only) + page title */}
      <div className="flex items-center gap-3">
        {/* Page title */}
        <h1
          id={DASHBOARD_ROUTE_TITLE_ID}
          className="text-base font-semibold text-text-primary leading-none"
        >
          {title}
        </h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={notificationsRef}>
          <button
            className="btn-ghost relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={isNotificationsOpen}
            onClick={() => setIsNotificationsOpen((open) => !open)}
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            {/* Notification badge */}
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"
                aria-hidden="true"
              />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
              <NotificationCenter />
            </div>
          )}
        </div>

        {/* Avatar (mobile) */}
        <div
          className="md:hidden w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary"
          aria-hidden="true"
        >
          {user?.avatarInitials ?? getUserInitials(user?.displayName ?? "")}
        </div>
      </div>
    </header>
  );
}
