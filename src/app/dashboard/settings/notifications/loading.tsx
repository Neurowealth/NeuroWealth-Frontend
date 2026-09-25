import { Skeleton, SettingsSectionSkeleton } from "@/components/ui/Skeleton";

export default function SettingsNotificationsLoading() {
  return (
    <div
      className="max-w-2xl space-y-6 animate-fade-in"
      aria-busy="true"
      aria-label="Loading notification settings"
    >
      <div className="space-y-2">
        <Skeleton height={28} width={220} />
        <Skeleton height={14} width="60%" />
      </div>
      <SettingsSectionSkeleton rows={3} />
      <SettingsSectionSkeleton rows={3} />
      <SettingsSectionSkeleton rows={2} />
    </div>
  );
}
