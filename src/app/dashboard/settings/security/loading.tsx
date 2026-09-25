import { Skeleton, SettingsSectionSkeleton } from "@/components/ui/Skeleton";

export default function SettingsSecurityLoading() {
  return (
    <div
      className="max-w-2xl space-y-6 animate-fade-in"
      aria-busy="true"
      aria-label="Loading security settings"
    >
      <div className="space-y-2">
        <Skeleton height={28} width={140} />
        <Skeleton height={14} width="62%" />
      </div>
      <SettingsSectionSkeleton rows={2} />
      <SettingsSectionSkeleton rows={3} />
      <SettingsSectionSkeleton rows={2} />
    </div>
  );
}
