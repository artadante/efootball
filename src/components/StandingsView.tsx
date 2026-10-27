import React, { useState } from 'react';
import { Medal, Trophy, Crown, TrendingUp, ChevronDown } from 'lucide-react';
import { ActiveLeague, StandingRow } from '../types/league';
import { TeamLogo } from './TeamLogo';
import { PositionProgressionChart } from './PositionProgressionChart';
import { soundEngine } from '../utils/soundEffects';

export interface StandingsViewProps {
  activeLeague: ActiveLeague | null;
  standings: StandingRow[];
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  activeLeague,
  standings,
}) => {
  const [isChartOpen, setIsChartOpen] = useState(false);

  return (
    <div className="space-y-3 animate-fadeIn my-auto w-full">
      <div className="rounded-2xl p-3 sm:p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between mb-2.5 px-1 flex-wrap gap-2">
          <h3 className="font-bold text-sm sm:text-base text-emerald-300 flex items-center gap-1.5 sm:gap-2">
            <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span>
              {activeLeague?.mode === 'cup'
                ? `مسابقات و نتایج ${activeLeague?.name || 'جام حذفی'}`
                : `جدول رده‌بندی ${activeLeague?.name || 'لیگ'}`}
            </span>
          </h3>
        </div>

        {standings.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-zinc-500" />
            <p className="text-sm text-zinc-300 font-medium">هنوز مسابقه‌ای در جدول ثبت نشده است.</p>
            <p className="text-xs text-zinc-400">
              برای شروع با زدن دکمه + در بالا، مسابقات را ایجاد و قرعه‌کشی کنید.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs sm:text-sm">
                <thead>
                  <tr className="text-zinc-300 border-b border-white/10 pb-1.5 text-xs font-bold">
                    <th className="py-2 text-start px-1.5">#</th>
                    <th className="py-2 text-start">بازیکن و تیم</th>
                    <th className="py-2">بازی</th>
                    <th className="py-2">برد</th>
                    <th className="py-2">مساوی</th>
                    <th className="py-2">باخت</th>
                    <th className="py-2">تفاضل</th>
                    <th className="py-2 font-black text-emerald-400">امتیاز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.map((row) => (
                    <tr
                      key={row.name}
                      className={`hover:bg-white/5 transition-colors ${
                        row.rank === 1 ? 'bg-amber-400/10' : ''
                      }`}
                    >
                      <td className="py-2 px-1 text-start font-bold">
                        {row.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/25 text-amber-300 text-[11px] font-black">
                            ۱
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs font-semibold">{row.rank}</span>
                        )}
                      </td>

                      {/* Player Name with Crown icon on the left side of the name & Team Logo */}
                      <td className="py-2 px-1 text-start font-bold text-white">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <TeamLogo teamName={row.team} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="block text-white font-extrabold text-xs sm:text-sm truncate">
                                {row.name}
                              </span>
                              {row.rank === 1 && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
                              )}
                            </div>
                            <span className="block text-[10px] sm:text-xs text-zinc-400 font-normal truncate">
                              {row.team}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 text-zinc-200 font-medium text-xs sm:text-sm">{row.played}</td>
                      <td className="py-2 text-zinc-200 font-medium text-xs sm:text-sm">{row.won}</td>
                      <td className="py-2 text-zinc-200 font-medium text-xs sm:text-sm">{row.drawn}</td>
                      <td className="py-2 text-zinc-200 font-medium text-xs sm:text-sm">{row.lost}</td>
                      <td className="py-2 font-mono text-xs sm:text-sm text-zinc-200 font-semibold dir-ltr">
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </td>
                      <td className="py-2 font-black text-sm sm:text-base text-emerald-400 font-mono">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Collapsible Position Progression Chart Across Season */}
            {activeLeague && (
              <div className="mt-3 pt-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setIsChartOpen((prev) => !prev);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between transition-all cursor-pointer text-xs font-bold text-zinc-300 hover:text-white group"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>نمودار تغییرات رتبه در طول فصل</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                    <span>{isChartOpen ? 'بستن نمودار' : 'مشاهده نمودار'}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isChartOpen ? 'rotate-180 text-emerald-400' : 'text-zinc-400'
                      }`}
                    />
                  </div>
                </button>

                {isChartOpen && (
                  <div className="mt-2.5 animate-fadeIn">
                    <PositionProgressionChart activeLeague={activeLeague} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
