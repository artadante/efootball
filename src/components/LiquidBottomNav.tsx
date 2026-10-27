import React from 'react';
import { Trophy, History, Disc, Swords } from 'lucide-react';

export type TabType = 'wheel' | 'matches' | 'table' | 'history';

interface LiquidBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const LiquidBottomNav: React.FC<LiquidBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: 'wheel' as TabType,
      label: 'چرخونه',
      icon: Disc,
      aria: 'چرخونه شانس و انتخاب تیم',
    },
    {
      id: 'matches' as TabType,
      label: 'بازی‌ها',
      icon: Swords,
      aria: 'مسابقات و بازی‌ها',
    },
    {
      id: 'table' as TabType,
      label: 'جدول',
      icon: Trophy,
      aria: 'جدول رده‌بندی لیگ',
    },
    {
      id: 'history' as TabType,
      label: 'تاریخچه',
      icon: History,
      aria: 'تاریخچه بازی‌های انجام‌شده',
    },
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="منوی اصلی ناوبری"
        className="pointer-events-auto relative w-full max-w-md h-16 px-2 rounded-full bg-emerald-950/50 backdrop-blur-2xl border border-white/15 flex items-center justify-between transition-all duration-300"
        style={{
          boxShadow: '0 16px 36px -10px rgba(0,0,0,0.8), inset 0 1px 1px 0 rgba(255,255,255,0.25), 0 0 20px rgba(34, 197, 94, 0.15)',
        }}
      >
        {/* Subtle glass liquid gloss highlight line */}
        <div className="absolute inset-x-6 top-0.5 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.aria}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 rounded-2xl group ${
                isActive
                  ? 'text-emerald-400 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive
                      ? 'scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                      : 'group-hover:scale-105'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                )}
              </div>
              <span className="text-xs font-bold mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
