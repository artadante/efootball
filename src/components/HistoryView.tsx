import React from 'react';
import { History, Archive, Crown, Trophy, Play, Trash2 } from 'lucide-react';
import { ArchivedLeague } from '../types/league';
import { RegisteredPlayer } from '../types/player';
import { TeamLogo } from './TeamLogo';
import { soundEngine } from '../utils/soundEffects';

export interface HistoryViewProps {
  archivedLeagues: ArchivedLeague[];
  registeredPlayers: RegisteredPlayer[];
  isAdmin?: boolean;
  onOpenCelebration: (data: {
    championName: string;
    championTeam: string;
    leagueName: string;
    avatarUrl?: string;
  }) => void;
  onResumeLeague?: (archivedId: string) => void;
  onDeleteLeague?: (archivedId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  archivedLeagues,
  registeredPlayers,
  isAdmin = false,
  onOpenCelebration,
  onResumeLeague,
  onDeleteLeague,
}) => {
  return (
    <div className="space-y-3 animate-fadeIn my-auto w-full">
      <div className="rounded-2xl p-3 sm:p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="font-bold text-sm sm:text-base text-emerald-300 flex items-center gap-1.5 sm:gap-2">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span>تاریخچه و تالار افتخارات لیگ‌ها</span>
          </h3>
        </div>

        {archivedLeagues.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Archive className="w-8 h-8 mx-auto text-zinc-500" />
            <p className="text-sm text-zinc-300 font-medium">هنوز هیچ لیگی در تاریخچه ثبت نشده است.</p>
            <p className="text-xs text-zinc-400">
              وقتی لیگی را بایگانی یا تمام کنید، نتایج کامل و جدول رده‌بندی به اینجا منتقل شده و هر زمان بخواهید می‌توانید دوباره آن را فعال و ادامه دهید.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {archivedLeagues.map((archived) => (
              <div
                key={archived.id}
                className="p-3 sm:p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5"
              >
                {/* League Title, Status Badge & Date */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-white">{archived.name}</h4>
                    {archived.isManuallyPaused ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        متوقف‌شده (آماده ادامه)
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        تکمیل‌شده
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs text-zinc-400 font-mono">{archived.finishedAt}</span>
                </div>

                {/* Champion / Leader Spotlight Badge with Action Buttons */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-400/30 flex items-center justify-between gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                      <Crown className="w-5 h-5 drop-shadow-[0_0_8px_#fbbf24]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
                        {archived.isManuallyPaused ? 'صدرنشین موقت' : 'قهرمان مسابقات'}
                      </span>
                      <span className="text-sm sm:text-base font-black text-white">
                        {archived.championName} ({archived.championTeam})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary Action: Resume League (Admin only & Only for manually paused leagues) */}
                    {isAdmin && archived.isManuallyPaused && onResumeLeague && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playWhistle();
                          onResumeLeague(archived.id);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:brightness-110 text-black font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                        title="فعال‌سازی این لیگ برای ادامه مسابقات"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>ادامه این لیگ</span>
                      </button>
                    )}

                    {/* Delete League Action (Admin only with confirmation) */}
                    {isAdmin && onDeleteLeague && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`آیا از حذف لیگ «${archived.name}» از تاریخچه اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`)) {
                            soundEngine.playClick();
                            onDeleteLeague(archived.id);
                          }
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
                        title="حذف این لیگ از تاریخچه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onOpenCelebration({
                          championName: archived.championName,
                          championTeam: archived.championTeam,
                          leagueName: archived.name,
                          avatarUrl: registeredPlayers.find((p) => p.name === archived.championName)?.avatarUrl,
                        });
                      }}
                      className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>جشن</span>
                    </button>

                    <TeamLogo teamName={archived.championTeam} className="w-8 h-8 shrink-0" />
                  </div>
                </div>

                {/* Final Standings Table in History */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs sm:text-sm">
                    <thead>
                      <tr className="text-zinc-300 border-b border-white/10 pb-1 text-xs font-bold">
                        <th className="py-1.5 text-start">#</th>
                        <th className="py-1.5 text-start">بازیکن</th>
                        <th className="py-1.5">بازی</th>
                        <th className="py-1.5">برد</th>
                        <th className="py-1.5">تفاضل</th>
                        <th className="py-1.5 font-bold text-emerald-400">امتیاز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {archived.standings.map((s) => (
                        <tr key={s.name}>
                          <td className="py-2 text-start font-bold text-zinc-300 text-xs sm:text-sm">{s.rank}</td>
                          <td className="py-2 text-start font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                            <TeamLogo teamName={s.team} className="w-4 h-4 shrink-0" />
                            <span>{s.name}</span>
                            {s.rank === 1 && <Crown className="w-4 h-4 text-amber-400" />}
                          </td>
                          <td className="py-2 text-zinc-200">{s.played}</td>
                          <td className="py-2 text-zinc-200">{s.won}</td>
                          <td className="py-2 text-zinc-200 font-mono dir-ltr">{s.goalDiff}</td>
                          <td className="py-2 font-black text-emerald-400 font-mono text-sm sm:text-base">{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Collapsible/List of Match Results under the table */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-xs text-zinc-300 font-bold mb-2 block">
                    نتایج مسابقات ثبت‌شده ({archived.matches.length} بازی):
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                    {archived.matches.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/5 text-xs font-medium"
                      >
                        <span className="text-white truncate max-w-[100px]">{m.player1}</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          {m.score1} - {m.score2}
                        </span>
                        <span className="text-white truncate max-w-[100px]">{m.player2}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
