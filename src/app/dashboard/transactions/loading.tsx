export default function TransactionsLoading() {
  return (
    <div
      className="min-h-screen bg-dark-900 p-6"
      aria-label="Loading transactions"
      aria-busy="true"
    >
      <div className="mx-auto max-w-2xl">
        {/* Title skeleton */}
        <div className="mb-8 h-8 w-40 animate-pulse rounded-lg bg-white/5" />

        {/* Form card skeleton */}
        <div className="rounded-2xl border border-white/5 bg-dark-800/50 p-8">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
                <div className="h-11 animate-pulse rounded-xl bg-white/5" />
              </div>
            ))}
            <div className="h-12 animate-pulse rounded-lg bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
