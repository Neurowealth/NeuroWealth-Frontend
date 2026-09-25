import React, { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { NotificationItem } from "./NotificationItem";
import { NotificationPreferencesUI } from "./NotificationPreferences";
import { Button } from "@/components/ui/Button";
import { analytics } from "@/lib/analytics";

export function NotificationCenter() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [view, setView] = useState<"list" | "preferences">("list");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedNotifications = notifications.slice(0, page * itemsPerPage);
  const hasMore = paginatedNotifications.length < notifications.length;

  return (
    <div
      className="w-80 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
      role="region"
      aria-label="Notifications"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-dark-900/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">
            {view === "list" ? "Notifications" : "Preferences"}
          </h3>
          {view === "list" && unreadCount > 0 && (
            <span
              className="bg-brand-400 text-dark-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              aria-label={`${unreadCount} unread`}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView(view === "list" ? "preferences" : "list")}
            className="text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
            aria-label={view === "list" ? "Open notification preferences" : "Back to notification list"}
            title={view === "list" ? "Preferences" : "Back to List"}
          >
            <span aria-hidden="true">{view === "list" ? "⚙️" : "🔙"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "list" ? (
          <>
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-500 italic text-sm">
                No notifications yet.
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/5" role="list" aria-label="Notification list">
                  {paginatedNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-sky-400 border border-sky-500/20"
                      onClick={() => {
                        setPage(page + 1);
                        analytics.track("notification_load_more", { page: page + 1 });
                      }}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <NotificationPreferencesUI />
        )}
      </div>

      {view === "list" && notifications.length > 0 && (
        <div className="p-3 border-t border-white/5 bg-dark-900/30">
          <button
            onClick={() => {
              markAllAsRead();
              analytics.track("notification_mark_all_read");
            }}
            className="text-[10px] text-slate-500 hover:text-white transition-colors w-full text-center"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
