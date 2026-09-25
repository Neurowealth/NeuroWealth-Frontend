import { Skeleton, SettingsSectionSkeleton } from "@/components/ui/Skeleton";

export default function SettingsPreferencesLoading() {
  return (
    <div
      className="max-w-2xl space-y-6 animate-fade-in"
      aria-busy="true"
      aria-label="Loading preferences"
    >
      <div className="space-y-2">
        <Skeleton height={28} width={160} />
        <Skeleton height={14} width="58%" />
      </div>
      <SettingsSectionSkeleton rows={2} />
      <SettingsSectionSkeleton rows={3} />
      <SettingsSectionSkeleton rows={2} />
    </div>
  );
}
