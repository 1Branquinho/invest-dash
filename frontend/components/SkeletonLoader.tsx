export function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl glass-card" />
        ))}
      </div>

      <div className="p-6 rounded-xl glass-card">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-white/10 rounded" />
            <div className="h-4 w-48 bg-white/5 rounded" />
          </div>
          <div className="h-8 w-64 bg-white/5 rounded hidden md:block" />
        </div>
        <div className="h-[400px] w-full bg-white/5 rounded" />
      </div>
    </div>
  );
}