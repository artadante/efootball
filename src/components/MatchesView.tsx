import React from 'react';
import { Swords, Target, Calendar, Trophy, Sparkles } from 'lucide-react';
import { ActiveLeague } from '../types/league';
import { TeamLogo } from './TeamLogo';

export interface MatchesViewProps {
  activeLeague: ActiveLeague | null;
  isAdmin: boolean;
  legFilter: 1 | 2;
  onSetLegFilter: (leg: 1 | 2) => void;
  onOpenPrediction: () => void;
  onStartScoreEdit: (matchId: string) => void;
  onFinishAndArchiveLeague: () => void;
  getPlayerLabel: (slot: number) => { name: string; team: string; isAssigned: boolean };
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  activeLeague,
  isAdmin,
  legFilter,
  onSetLegFilter,
  onOpenPrediction,
  onStartScoreEdit,
  onFinishAndArchiveLeague,
  getPlayerLabel,
}) => {
  const displayedMatches = activeLeague
    ? (activeLeague.mode === 'cup'
        ? activeLeague.matches
        : activeLeague.matches.filter((m) => m.leg === legFilter))
    : [];

  const getMatchRoundLabel = (m: (typeof displayedMatches)[0]) => {
    if (!activeLeague || activeLeague.mode !== 'cup') {
      return `هفته ${m.round}`;
    }
    const maxRound = Math.max(...activeLeague.matches.map((match) => match.round), 1);
    if (m.id.includes('final') || m.round === maxRound) {
      return 'فینال بزرگ مسابقات';
    }
    if (m.round === maxRound - 1) {
      return 'مرحله نیمه‌نهایی';
    }
    if (m.round === maxRound - 2) {
      return 'مرحله یک‌چهارم نهایی';
    }
    if (m.round === maxRound - 3) {
      return 'مرحله یک‌هشتم نهایی';
    }
    return `مرحله ${m.round}`;
  };

  return (
    <div className="space-y-2.5 animate-fadeIn my-auto w-full">
      <div className="rounded-2xl p-3 sm:p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
        
        {/* Header with Title and Mode Actions */}
        <div className="flex items-center justify-between mb-2.5 px-1 flex-wrap gap-2">
          <h3 className="font-bold text-sm sm:text-base text-emerald-300 flex items-center gap-1.5 sm:gap-2">
            <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span>برنامه و نتایج مسابقات</span>
          </h3>
          {activeLeague && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenPrediction}
                className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-black" />
                <span>پیش‌بینی</span>
              </button>

              <span className="text-xs text-zinc-300 font-mono font-medium">
                {activeLeague.matches.filter((m) => m.isPlayed).length} / {activeLeague.matches.length} بازی
              </span>
            </div>
          )}
        </div>

        {!activeLeague ? (
          <div className="py-10 text-center space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-zinc-500" />
            <p className="text-sm text-zinc-300 font-medium">هنوز لیگی تعریف نشده است.</p>
            <p className="text-xs text-zinc-400">برای ایجاد لیگ و قرعه‌کشی، دکمه + بالا را بزنید.</p>
          </div>
        ) : (
          <>
            {/* Leg Filter Tabs (نیم‌فصل ۱ / نیم‌فصل ۲) - only for round-robin league */}
            {activeLeague.mode !== 'cup' ? (
              <div className="flex p-0.5 bg-black/40 rounded-xl border border-white/10 mb-2.5 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => onSetLegFilter(1)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    legFilter === 1
                      ? 'bg-emerald-500 text-black font-extrabold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  نیم‌فصل ۱
                </button>
                <button
                  type="button"
                  onClick={() => onSetLegFilter(2)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    legFilter === 2
                      ? 'bg-emerald-500 text-black font-extrabold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  نیم‌فصل ۲
                </button>
              </div>
            ) : (
              <div className="mb-2.5 px-2 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs text-zinc-300">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Swords className="w-3.5 h-3.5" />
                  <span>جدول مراحل حذفی جام</span>
                </span>
                <span className="text-[11px] text-zinc-400">مسابقات تک‌حذفی (برنده صعود می‌کند)</span>
              </div>
            )}

            {/* All Matches Completed Celebration Banner */}
            {activeLeague.matches.every((m) => m.isPlayed) && !activeLeague.isFinished && (
              <div className="p-2.5 mb-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-center space-y-1.5 animate-bounce">
                <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center justify-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>تمام مسابقات این لیگ با موفقیت به پایان رسید!</span>
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onFinishAndArchiveLeague}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>ثبت نهایی و جشن قهرمانی</span>
                  </button>
                )}
              </div>
            )}

            {/* Match Cards List (Compact & Responsive for Mobile) */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto no-scrollbar pr-0.5">
              {displayedMatches.map((m) => {
                const p1 = getPlayerLabel(m.player1Slot);
                const p2 = getPlayerLabel(m.player2Slot);
                const isMatchReady = m.player1Slot > 0 && m.player2Slot > 0;
                const isFinal = activeLeague.mode === 'cup' && (m.id.includes('final') || m.round === Math.max(...activeLeague.matches.map((x) => x.round)));

                return (
                  <div
                    key={m.id}
                    className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                      m.isPlayed
                        ? 'bg-black/35 border-white/10'
                        : isFinal
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-emerald-950/40 border-emerald-500/20 hover:border-emerald-400/40'
                    }`}
                  >
                    {/* Round Label */}
                    <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                      <span className={isFinal ? 'text-amber-400 font-bold flex items-center gap-1' : 'text-zinc-400'}>
                        {isFinal && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{getMatchRoundLabel(m)}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      {/* Player 1 (Home) */}
                      <div className="flex-1 flex items-center gap-1.5 sm:gap-2 text-start min-w-0">
                        <TeamLogo teamName={p1.team} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                        <div className="truncate min-w-0">
                          <span className="block font-bold text-xs sm:text-sm text-white truncate">
                            {p1.name}
                          </span>
                          <span className="text-[10px] sm:text-xs text-emerald-400/90 font-medium block truncate">
                            {p1.team}
                          </span>
                        </div>
                      </div>

                      {/* Score or Action Button */}
                      <div className="px-2 text-center shrink-0">
                        {m.isPlayed ? (
                          <div className="px-2.5 sm:px-3 py-1 rounded-xl bg-black/60 border border-white/10 font-mono font-black text-base sm:text-lg text-emerald-400 tracking-wider">
                            {m.score1} - {m.score2}
                          </div>
                        ) : !isMatchReady ? (
                          <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] sm:text-[11px] text-zinc-400 font-medium block">
                            در انتظار صعود
                          </span>
                        ) : (
                          isAdmin ? (
                            <button
                              type="button"
                              onClick={() => onStartScoreEdit(m.id)}
                              className="py-1 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all cursor-pointer"
                            >
                              ثبت نتیجه
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={onOpenPrediction}
                              className="py-1 px-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>پیش‌بینی</span>
                            </button>
                          )
                        )}
                      </div>

                      {/* Player 2 (Away) */}
                      <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2 text-end min-w-0">
                        <div className="truncate min-w-0">
                          <span className="block font-bold text-xs sm:text-sm text-white truncate">
                            {p2.name}
                          </span>
                          <span className="text-[10px] sm:text-xs text-emerald-400/90 font-medium block truncate">
                            {p2.team}
                          </span>
                        </div>
                        <TeamLogo teamName={p2.team} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
