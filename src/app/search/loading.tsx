export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-grow w-full animate-pulse">
      {/* Header recherche */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="h-7 w-64 bg-slate-800 rounded-lg" />
        <div className="h-4 w-40 bg-slate-800/60 rounded" />
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden p-4 space-y-3.5"
          >
            <div className="w-full h-44 bg-slate-800/70 rounded-lg" />
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-20 bg-slate-800 rounded" />
              <div className="h-3.5 w-16 bg-slate-800/50 rounded" />
            </div>
            <div className="h-5 w-5/6 bg-slate-800 rounded" />
            <div className="h-3.5 w-full bg-slate-800/50 rounded" />
            <div className="h-3.5 w-2/3 bg-slate-800/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
