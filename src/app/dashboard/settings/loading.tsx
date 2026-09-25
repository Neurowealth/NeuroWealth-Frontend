import { Skeleton, SettingsSectionSkeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div
      className="max-w-2xl space-y-6 animate-fade-in"
      aria-busy="true"
      aria-label="Loading settings"
    >
      <div className="space-y-2">
        <Skeleton height={28} width={132} />
        <Skeleton height={14} width="64%" />
      </div>

      <SettingsSectionSkeleton rows={1} />
      <SettingsSectionSkeleton rows={2} />
      <SettingsSectionSkeleton rows={2} />
      <SettingsSectionSkeleton rows={2} />
      <SettingsSectionSkeleton rows={2} />
      <SettingsSectionSkeleton rows={1} />
    </div>
  );
}
