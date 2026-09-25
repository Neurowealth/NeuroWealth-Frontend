import { NotificationListSkeleton } from "@/components/ui/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="px-6 py-8" aria-busy="true" aria-label="Loading notifications">
      <NotificationListSkeleton items={4} />
    </div>
  );
}
