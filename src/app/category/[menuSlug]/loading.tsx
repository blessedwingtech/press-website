export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-grow w-full animate-pulse">
      {/* Fil d'ariane */}
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-16 bg-slate-800 rounded" />
        <div className="h-3.5 w-4 bg-slate-800 rounded" />
        <div className="h-3.5 w-28 bg-slate-800 rounded" />
      </div>

      {/* Header Catégorie */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="h-4 w-96 bg-slate-800/60 rounded" />
      </div>

      {/* Onglets Sous-catégories */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        <div className="h-9 w-24 bg-slate-800 rounded-xl" />
        <div className="h-9 w-28 bg-slate-800/60 rounded-xl" />
        <div className="h-9 w-32 bg-slate-800/60 rounded-xl" />
        <div className="h-9 w-24 bg-slate-800/60 rounded-xl" />
      </div>

      {/* Grille des Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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
  );
}
