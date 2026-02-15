export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass p-4 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 bg-surface-elevated rounded" />
              <div>
                <div className="h-4 bg-surface-elevated rounded w-32 mb-1" />
                <div className="h-3 bg-surface-elevated rounded w-24" />
              </div>
            </div>
            <div className="h-6 bg-surface-elevated rounded w-20" />
          </div>
          <div className="h-4 bg-surface-elevated rounded w-full mt-3" />
          <div className="h-4 bg-surface-elevated rounded w-2/3 mt-2" />
        </div>
      ))}
    </div>
  );
}
