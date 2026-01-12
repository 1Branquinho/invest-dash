export function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 rounded-xl">
            <div className="h-4 w-28 bg-white/10 rounded mb-3" />
            <div className="h-8 w-40 bg-white/10 rounded mb-2" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="h-5 w-56 bg-white/10 rounded mb-6" />
        <div className="h-[400px] w-full bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
