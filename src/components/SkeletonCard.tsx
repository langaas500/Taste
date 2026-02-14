export default function SkeletonCard({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-[var(--radius-lg)] p-4 flex gap-3">
          <div className="skeleton w-14 h-20 flex-shrink-0 rounded-[var(--radius-sm)]" />
          <div className="flex-1 space-y-2.5 py-1">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-[var(--radius-lg)] overflow-hidden">
          <div className="skeleton aspect-[2/3] w-full" />
          <div className="p-3 space-y-2">
            <div className="skeleton h-3.5 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
