import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="در حال بارگذاری..."
      className="relative min-h-screen w-full bg-[#041308] text-white flex flex-col justify-between overflow-hidden"
    >
      {/* Background ambient glow placeholders */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-green-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Main Container Shell with iOS PWA Safe Area insets */}
      <div 
        className="relative z-10 w-full max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen flex flex-col px-3.5 sm:px-6"
        style={{
          paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 1rem))',
          paddingBottom: 'max(6.5rem, calc(env(safe-area-inset-bottom, 0px) + 6.5rem))',
        }}
      >
        
        {/* 1. Header Bar Skeleton */}
        <header className="flex items-center justify-between py-2 gap-2">
          {/* Profile & Sound buttons */}
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-emerald-900/40 border border-white/10 animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-emerald-900/40 border border-white/10 animate-pulse" />
          </div>

          {/* Center: League title / status skeleton */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[200px]">
            <div className="h-4 w-28 rounded-md bg-emerald-800/40 animate-pulse" />
            <div className="h-3 w-16 rounded-md bg-emerald-950/60 animate-pulse" />
          </div>

          {/* Top-Left: Directory Button Skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-full bg-emerald-900/40 border border-white/10 animate-pulse" />
          </div>
        </header>

        {/* 2. News Ticker Skeleton */}
        <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="h-6 w-16 rounded-lg bg-rose-900/30 border border-rose-500/20 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-3/4 rounded bg-white/15" />
              <div className="h-2.5 w-1/2 rounded bg-white/10" />
            </div>
          </div>
          <div className="w-6 h-6 rounded-lg bg-white/10 shrink-0" />
        </div>

        {/* 3. Main Content Skeleton (Card & Table placeholders) */}
        <main className="mt-4 flex-1 flex flex-col justify-center">
          <div className="rounded-2xl p-3.5 sm:p-5 bg-emerald-950/40 border border-white/15 backdrop-blur-2xl shadow-xl space-y-4">
            
            {/* Title & badge skeleton */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-500/30 animate-pulse" />
                <div className="h-4 w-32 rounded bg-emerald-500/20 animate-pulse" />
              </div>
              <div className="h-7 w-20 rounded-xl bg-white/10 animate-pulse" />
            </div>

            {/* Sub-tabs / Filters skeleton */}
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 gap-2">
              <div className="flex-1 h-8 rounded-lg bg-emerald-500/30 animate-pulse" />
              <div className="flex-1 h-8 rounded-lg bg-white/5 animate-pulse" />
            </div>

            {/* List / Table row skeletons */}
            <div className="space-y-2.5 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-2 animate-pulse"
                >
                  {/* Team 1 */}
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 shrink-0" />
                    <div className="space-y-1">
                      <div className="h-3 w-16 sm:w-24 rounded bg-white/20" />
                      <div className="h-2 w-12 sm:w-16 rounded bg-emerald-400/30" />
                    </div>
                  </div>

                  {/* Middle Badge / Score */}
                  <div className="w-14 h-7 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                    <div className="h-3 w-6 rounded bg-emerald-400/40" />
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-end gap-2 flex-1">
                    <div className="space-y-1 text-right">
                      <div className="h-3 w-16 sm:w-24 rounded bg-white/20 mr-auto" />
                      <div className="h-2 w-12 sm:w-16 rounded bg-emerald-400/30 mr-auto" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* 4. Bottom Navigation Bar Skeleton */}
      <div 
        className="fixed inset-x-0 z-30 flex justify-center px-4 pointer-events-none"
        style={{
          bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
        }}
      >
        <div className="w-full max-w-md h-14 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-2xl flex items-center justify-around px-3 shadow-2xl animate-pulse">
          <div className="w-16 h-8 rounded-xl bg-white/10" />
          <div className="w-16 h-8 rounded-xl bg-emerald-500/20" />
          <div className="w-16 h-8 rounded-xl bg-white/10" />
          <div className="w-16 h-8 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
};
