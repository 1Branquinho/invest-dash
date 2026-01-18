export function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-6 w-40 bg-white/10 rounded" />
            <div className="h-4 w-64 bg-white/10 rounded" />
          </div>
          <div className="h-12 w-12 bg-white/10 rounded-2xl" />
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="h-3 w-28 bg-white/10 rounded mb-4" />
              <div className="h-7 w-44 bg-white/10 rounded mb-2" />
              <div className="h-4 w-56 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="h-4 w-40 bg-white/10 rounded mb-4" />
        <div className="h-[420px] w-full bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}
