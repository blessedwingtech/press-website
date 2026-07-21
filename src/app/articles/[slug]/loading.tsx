export default function ArticleDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full animate-pulse">
      {/* breadcrumbs skeleton */}
      <div className="flex justify-between items-center my-4">
        <div className="h-4 w-28 bg-slate-800 rounded-lg" />
        <div className="h-4 w-40 bg-slate-800 rounded-lg hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Body Column */}
        <div className="lg:col-span-3 bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 sm:p-8 space-y-6">
          {/* Main Media skeleton */}
          <div className="w-full h-64 sm:h-[400px] bg-slate-900 border border-slate-800/60 rounded-xl" />

          {/* Title and Metadata */}
          <div className="space-y-4 pb-6 border-b border-slate-800/80">
            <div className="h-8 w-3/4 bg-slate-800 rounded-lg" />
            <div className="h-6 w-1/2 bg-slate-800 rounded-lg" />
            <div className="flex items-center gap-3 pt-2">
              <div className="h-5 w-24 bg-slate-800 rounded-lg" />
              <div className="h-5 w-32 bg-slate-800 rounded-lg" />
              <div className="h-5 w-16 bg-slate-800 rounded-lg" />
            </div>
          </div>

          {/* Paragraphs skeleton */}
          <div className="space-y-3.5">
            <div className="h-4 w-full bg-slate-800/70 rounded-lg" />
            <div className="h-4 w-full bg-slate-800/70 rounded-lg" />
            <div className="h-4 w-5/6 bg-slate-800/70 rounded-lg" />
            <div className="h-4 w-11/12 bg-slate-800/70 rounded-lg" />
            <div className="h-4 w-3/4 bg-slate-800/70 rounded-lg" />
          </div>

          <div className="space-y-3.5 pt-4">
            <div className="h-4 w-full bg-slate-800/70 rounded-lg" />
            <div className="h-4 w-11/12 bg-slate-800/70 rounded-lg" />
            <div className="h-4 w-5/6 bg-slate-800/70 rounded-lg" />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="h-4 w-20 bg-slate-800 rounded-lg mx-auto" />
          <div className="w-full h-64 bg-slate-900 border border-slate-800/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
