import SkeletonBlock from "@/components/skeletons/SkeletonBlock";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading settings">
      {[1, 2, 3].map((section) => (
        <div key={section} className="card space-y-4">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-px w-full" />
          {[1, 2].map((row) => (
            <div key={row} className="flex items-center justify-between">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-3 w-32" />
                <SkeletonBlock className="h-2.5 w-52" />
              </div>
              <SkeletonBlock className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
