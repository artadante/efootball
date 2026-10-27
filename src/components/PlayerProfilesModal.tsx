import React, { useState } from 'react';
import { 
  X, 
  Users, 
  ChevronLeft, 
  ArrowRight, 
  Swords 
} from 'lucide-react';
import { RegisteredPlayer } from '../types/player';
import { ActiveLeague, ArchivedLeague } from '../types/league';
import { calculatePlayerCareerStats } from '../utils/playerStats';
import { PlayerPerformanceGraph } from './PlayerPerformanceGraph';
import { TeamLogo } from './TeamLogo';

interface PlayerProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredPlayers: RegisteredPlayer[];
  activeLeague: ActiveLeague | null;
  archivedLeagues: ArchivedLeague[];
}

export const PlayerProfilesModal: React.FC<PlayerProfilesModalProps> = ({
  isOpen,
  onClose,
  registeredPlayers,
  activeLeague,
  archivedLeagues,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<RegisteredPlayer | null>(null);

  if (!isOpen) return null;

  const activeStats = selectedPlayer
    ? calculatePlayerCareerStats(selectedPlayer, activeLeague, archivedLeagues)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="پروفایل بازیکنان"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {selectedPlayer ? (
              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center gap-1 text-xs font-bold transition-all"
                title="بازگشت به لیست"
              >
                <ArrowRight className="w-4 h-4" />
                <span>لیست بازیکنان</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">پروفایل و آمار بازیکنان</h3>
                  <span className="text-xs text-zinc-400 font-medium">
                    {registeredPlayers.length} بازیکن ثبت‌شده
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          
          {/* VIEW 1: All Players Directory List */}
          {!selectedPlayer && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300">
                برای مشاهده سوابق، تاریخچه بازی‌ها و نمودار عملکرد، بازیکن مورد نظر را انتخاب کنید:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {registeredPlayers.map((player) => {
                  const stats = calculatePlayerCareerStats(player, activeLeague, archivedLeagues);
                  const isArta = player.name === 'آرتا';

                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedPlayer(player)}
                      className="p-3 rounded-2xl bg-black/45 border border-white/10 hover:border-emerald-400/50 hover:bg-white/5 text-start transition-all flex items-center justify-between group active:scale-95"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 to-green-300 shrink-0 shadow">
                          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-bold text-emerald-300 text-lg">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{player.name.charAt(0)}</span>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-sm group-hover:text-emerald-300 transition-colors">
                              {player.name}
                            </span>
                            {isArta && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
                                ادمین
                              </span>
                            )}
                            {stats.championships > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center gap-0.5">
                                🏆 {stats.championships}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                            <span>{stats.totalMatches} بازی</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-mono font-bold">{stats.wins} برد ({stats.winRate}%)</span>
                          </div>
                        </div>
                      </div>

                      <ChevronLeft className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-all group-hover:-translate-x-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: Individual Player Profile & Career Stats */}
          {selectedPlayer && activeStats && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Profile Hero Header */}
              <div className="p-4 rounded-3xl bg-black/50 border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-400 via-green-300 to-amber-300 shadow-[0_0_25px_rgba(34,197,94,0.3)] mb-2">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-black text-2xl text-emerald-300">
                    {selectedPlayer.avatarUrl ? (
                      <img src={selectedPlayer.avatarUrl} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedPlayer.name.charAt(0)}</span>
                    )}
                  </div>
                </div>

                <h4 className="text-xl font-black text-white">{selectedPlayer.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-emerald-400 font-medium">عضو دائمی لیگ دوستانه</span>
                  {activeStats.championships > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold">
                      🏆 {activeStats.championships} عنوان قهرمانی
                    </span>
                  )}
                </div>
              </div>

              {/* Career Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">تعداد بازی کلی</span>
                  <span className="text-xl font-black font-mono text-white">{activeStats.totalMatches}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">برد / مساوی / باخت</span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {activeStats.wins} - {activeStats.draws} - {activeStats.losses}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">درصد پیروزی</span>
                  <span className="text-xl font-black font-mono text-amber-300">%{activeStats.winRate}</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">گل زده / خورده</span>
                  <span className="text-sm font-black font-mono text-white">
                    {activeStats.goalsFor} / {activeStats.goalsAgainst}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">تفاضل گل کل</span>
                  <span className={`text-base font-black font-mono dir-ltr ${
                    activeStats.goalDifference > 0 ? 'text-emerald-400' : activeStats.goalDifference < 0 ? 'text-rose-400' : 'text-zinc-300'
                  }`}>
                    {activeStats.goalDifference > 0 ? `+${activeStats.goalDifference}` : activeStats.goalDifference}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                  <span className="text-[11px] text-zinc-400 block mb-1">میانگین گل در بازی</span>
                  <span className="text-base font-black font-mono text-emerald-300">
                    {activeStats.totalMatches > 0 ? (activeStats.goalsFor / activeStats.totalMatches).toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>

              {/* Teams Played With */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-zinc-300 block">
                  تیم‌هایی که تا حالا با آن‌ها بازی کرده:
                </span>
                {activeStats.teamsPlayed.length === 0 ? (
                  <span className="text-xs text-zinc-500">هنوز تیمی تخصیص نیافته است.</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeStats.teamsPlayed.map((teamName) => (
                      <div
                        key={teamName}
                        className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/25 text-xs font-semibold text-white"
                      >
                        <TeamLogo teamName={teamName} className="w-4 h-4 shrink-0" />
                        <span>{teamName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Performance Graph */}
              <PlayerPerformanceGraph performancePoints={activeStats.performancePoints} />

              {/* Match History List */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-emerald-400" />
                    <span>تاریخچه تمامی بازی‌های ثبت‌شده ({activeStats.matches.length}):</span>
                  </span>
                </div>

                {activeStats.matches.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3 text-center">هنوز هیچ مسابقه‌ای برای این بازیکن ثبت نشده است.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                    {activeStats.matches.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                      >
                        {/* Result badge */}
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            m.result === 'W'
                              ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-400/40'
                              : m.result === 'D'
                              ? 'bg-amber-400/25 text-amber-300 border border-amber-400/40'
                              : 'bg-rose-500/25 text-rose-400 border border-rose-400/40'
                          }`}>
                            {m.result === 'W' ? 'برد' : m.result === 'D' ? 'مساوی' : 'باخت'}
                          </span>

                          <div className="text-start">
                            <span className="font-bold text-white block">
                              مقابل {m.opponentName}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                              <TeamLogo teamName={m.myTeam} className="w-3.5 h-3.5" />
                              <span>{m.myTeam}</span>
                              <span className="text-zinc-600">vs</span>
                              <TeamLogo teamName={m.opponentTeam} className="w-3.5 h-3.5" />
                              <span>{m.opponentTeam}</span>
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-end">
                          <span className="font-mono font-black text-sm text-emerald-400 block tracking-wider">
                            {m.myScore} - {m.opponentScore}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            {m.leagueName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
