import React from 'react';
import { Trophy, History, Disc, Plus } from 'lucide-react';

export type TabType = 'wheel' | 'league' | 'history';

interface LiquidBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddClick: () => void;
}

export const LiquidBottomNav: React.FC<LiquidBottomNavProps> = ({
  activeTab,
  onTabChange,
  onAddClick,
}) => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="منوی اصلی ناوبری"
        className="pointer-events-auto relative w-full max-w-md h-18 px-3 rounded-full bg-emerald-950/45 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(34,197,94,0.18)] flex items-center justify-around transition-all duration-300"
        style={{
          boxShadow: '0 16px 36px -10px rgba(0,0,0,0.8), inset 0 1px 1px 0 rgba(255,255,255,0.25), 0 0 18px rgba(34, 197, 94, 0.15)',
        }}
      >
        {/* Subtle glass liquid gloss overlay */}
        <div className="absolute inset-x-4 top-0.5 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {/* Tab 1: چرخونه (Wheel) */}
        <button
          type="button"
          onClick={() => onTabChange('wheel')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-300 rounded-2xl group ${
            activeTab === 'wheel'
              ? 'text-emerald-400 scale-105'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="چرخونه شانس و قرعه‌کشی"
        >
          <div className="relative">
            <Disc
              className={`w-6 h-6 transition-transform duration-500 ${
                activeTab === 'wheel' ? 'rotate-180 text-emerald-400' : 'group-hover:rotate-45'
              }`}
            />
            {activeTab === 'wheel' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
          <span className="text-[11px] font-medium mt-1 tracking-tight">چرخونه</span>
        </button>

        {/* Tab 2: لیگ (League) */}
        <button
          type="button"
          onClick={() => onTabChange('league')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-300 rounded-2xl group ${
            activeTab === 'league'
              ? 'text-emerald-400 scale-105'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="جدول و بازی‌های لیگ"
        >
          <div className="relative">
            <Trophy
              className={`w-6 h-6 transition-transform duration-300 ${
                activeTab === 'league' ? 'scale-110 text-emerald-400' : 'group-hover:scale-105'
              }`}
            />
            {activeTab === 'league' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
          <span className="text-[11px] font-medium mt-1 tracking-tight">لیگ</span>
        </button>

        {/* Center Action Button: + (ثبت مسابقه) */}
        <div className="relative -top-5 flex items-center justify-center px-1">
          <button
            type="button"
            onClick={onAddClick}
            aria-label="ثبت مسابقه"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 text-black flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.5),0_8px_16px_rgba(0,0,0,0.4)] active:scale-95 hover:scale-105 transition-all duration-300 border-2 border-emerald-300/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <Plus className="w-7 h-7 stroke-[2.75] text-slate-950" />
            <span className="sr-only">ثبت مسابقه</span>
          </button>
        </div>

        {/* Tab 3: تاریخچه (History) */}
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-300 rounded-2xl group ${
            activeTab === 'history'
              ? 'text-emerald-400 scale-105'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="تاریخچه مسابقات"
        >
          <div className="relative">
            <History
              className={`w-6 h-6 transition-transform duration-300 ${
                activeTab === 'history' ? 'scale-110 text-emerald-400' : 'group-hover:-rotate-45'
              }`}
            />
            {activeTab === 'history' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
          <span className="text-[11px] font-medium mt-1 tracking-tight">تاریخچه</span>
        </button>
      </nav>
    </div>
  );
};
