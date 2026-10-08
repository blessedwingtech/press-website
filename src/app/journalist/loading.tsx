export default function JournalistLoading() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-slate-800 rounded-lg" />
          <div className="h-3.5 w-80 bg-slate-800/60 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-800 rounded-lg" />
      </div>

      <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl overflow-hidden p-6 space-y-4">
        <div className="h-4 w-full bg-slate-800/60 rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-t border-slate-800/40">
            <div className="w-14 h-10 bg-slate-800 rounded-md flex-shrink-0" />
            <div className="flex-grow space-y-2">
              <div className="h-4 w-3/4 bg-slate-800 rounded" />
              <div className="h-3 w-1/3 bg-slate-800/50 rounded" />
            </div>
            <div className="h-6 w-20 bg-slate-800 rounded hidden sm:block" />
            <div className="h-8 w-24 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
