export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-grow w-full animate-pulse">
      {/* Skeleton Bannière Pub / Annonce */}
      <div className="w-full h-24 bg-slate-900/60 border border-slate-800/60 rounded-xl" />

      {/* Skeleton Section Hero / À la une */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grand article principal */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="w-full h-64 sm:h-80 bg-slate-800/60 rounded-xl" />
          <div className="flex gap-2 pt-2">
            <div className="h-4 w-20 bg-slate-800 rounded-md" />
            <div className="h-4 w-24 bg-slate-800 rounded-md" />
          </div>
          <div className="h-7 w-5/6 bg-slate-800 rounded-lg" />
          <div className="h-4 w-full bg-slate-800/50 rounded-md" />
          <div className="h-4 w-2/3 bg-slate-800/50 rounded-md" />
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <div className="h-5 w-32 bg-slate-800 rounded-md mb-2" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-3.5 flex gap-3">
              <div className="w-20 h-20 bg-slate-800/70 rounded-lg flex-shrink-0" />
              <div className="flex-grow space-y-2 py-1">
                <div className="h-3 w-16 bg-slate-800 rounded" />
                <div className="h-4 w-full bg-slate-800 rounded" />
                <div className="h-3 w-24 bg-slate-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton Grille des Articles */}
      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="h-6 w-44 bg-slate-800 rounded-lg" />
          <div className="h-4 w-24 bg-slate-800 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="pt-2 flex items-center gap-2 border-t border-slate-800/60">
                <div className="w-6 h-6 rounded-full bg-slate-800" />
                <div className="h-3 w-28 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
