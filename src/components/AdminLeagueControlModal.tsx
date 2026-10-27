import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Edit3, 
  Save, 
  RotateCcw, 
  AlertTriangle
} from 'lucide-react';
import { ActiveLeague } from '../types/league';
import { TEAMS_DATABASE } from '../data/teams';
import { TeamLogo } from './TeamLogo';

interface AdminLeagueControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLeague: ActiveLeague | null;
  onUpdatePlayer: (slot: number, name: string, team: string) => void;
  onUpdateMatchScore: (matchId: string, score1: number, score2: number) => void;
  onResetMatch: (matchId: string) => void;
  onEndLeagueEarly: () => void;
}

export const AdminLeagueControlModal: React.FC<AdminLeagueControlModalProps> = ({
  isOpen,
  onClose,
  activeLeague,
  onUpdatePlayer,
  onUpdateMatchScore,
  onResetMatch,
  onEndLeagueEarly,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'players' | 'matches' | 'finish'>('players');

  // Player editing state
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState('');

  // Match score editing state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editScore1, setEditScore1] = useState<number>(0);
  const [editScore2, setEditScore2] = useState<number>(0);

  if (!isOpen) return null;

  if (!activeLeague) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      >
        <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white text-center space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-amber-400" />
              <span>کنترل لیگ</span>
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-300 py-6">در حال حاضر هیچ لیگی در جریان نیست.</p>
        </div>
      </div>
    );
  }

  const handleStartEditPlayer = (slot: number, currentName?: string, currentTeam?: string) => {
    setEditingSlot(slot);
    setEditName(currentName || `بازیکن ${slot}`);
    setEditTeam(currentTeam || `تیم ${slot}`);
  };

  const handleSavePlayer = (slot: number) => {
    if (!editName.trim() || !editTeam.trim()) return;
    onUpdatePlayer(slot, editName.trim(), editTeam.trim());
    setEditingSlot(null);
  };

  const handleStartEditMatch = (matchId: string, s1?: number | null, s2?: number | null) => {
    setEditingMatchId(matchId);
    setEditScore1(s1 ?? 0);
    setEditScore2(s2 ?? 0);
  };

  const handleSaveMatchScore = (matchId: string) => {
    onUpdateMatchScore(matchId, Number(editScore1), Number(editScore2));
    setEditingMatchId(null);
  };

  const getPlayerName = (slot: number) => {
    const p = activeLeague.players.find((pl) => pl.slot === slot);
    return p?.name || `بازیکن ${slot}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl p-5 bg-emerald-950/95 border border-amber-500/30 backdrop-blur-2xl shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">کنترل و مدیریت لیگ جاری</h3>
              <span className="text-xs text-amber-400 font-bold">{activeLeague.name}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tabs: بازیکنان | ویرایش بازی‌ها | اتمام لیگ */}
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10 my-3 text-sm">
          <button
            type="button"
            onClick={() => setActiveSubTab('players')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'players'
                ? 'bg-amber-400 text-black font-extrabold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            اسامی و تیم‌ها
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('matches')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'matches'
                ? 'bg-amber-400 text-black font-extrabold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ویرایش بازی‌ها
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('finish')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'finish'
                ? 'bg-rose-500 text-white font-extrabold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            اتمام زودهنگام
          </button>
        </div>

        {/* Sub-Tab 1: Players & Teams Manual Editing */}
        {activeSubTab === 'players' && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            <p className="text-xs sm:text-sm text-zinc-300 mb-2">
              تغییرات دستی شما بلافاصله در کل برنامه، بازی‌ها، جدول و صفحه چرخونه اعمال می‌شود:
            </p>

            {activeLeague.players.map((p) => {
              const isCurrentlyEditing = editingSlot === p.slot;

              return (
                <div
                  key={p.slot}
                  className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-300">
                      اسلات {p.slot} ({p.name ? 'تخصیص‌یافته' : 'خالی'})
                    </span>
                    {!isCurrentlyEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEditPlayer(p.slot, p.name, p.team)}
                        className="p-1 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>
                    )}
                  </div>

                  {isCurrentlyEditing ? (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="نام بازیکن"
                          className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-400/40 text-sm text-white focus:outline-none"
                          autoFocus
                        />
                        <select
                          value={editTeam}
                          onChange={(e) => setEditTeam(e.target.value)}
                          className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-400/40 text-sm text-white focus:outline-none"
                        >
                          <option value="" disabled>انتخاب تیم از منو...</option>
                          {['انگلیس', 'اسپانیا', 'آلمان', 'ایتالیا', 'فرانسه'].map((lg) => (
                            <optgroup key={lg} label={`لیگ ${lg}`}>
                              {TEAMS_DATABASE.filter(t => t.league === lg).map((t) => (
                                <option key={t.id} value={t.name}>
                                  {t.name} ({t.stars} ⭐)
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSavePlayer(p.slot)}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-sm flex items-center justify-center gap-1 shadow"
                        >
                          <Save className="w-4 h-4" />
                          <span>ذخیره تغییرات</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSlot(null)}
                          className="py-2 px-3.5 rounded-xl bg-white/10 text-zinc-300 text-xs font-semibold"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-white">{p.name || 'نامشخص'}</span>
                      <div className="flex items-center gap-1.5">
                        <TeamLogo teamName={p.team} className="w-4 h-4" />
                        <span className="text-emerald-400 font-semibold">{p.team || 'تیم نامشخص'}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sub-Tab 2: Matches Score Editing / Reset */}
        {activeSubTab === 'matches' && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            <p className="text-xs sm:text-sm text-zinc-300 mb-2">
              ویرایش منویی نتایج مسابقات ثبت‌شده یا بازگرداندن به حالت انجام‌نشده:
            </p>

            {activeLeague.matches.filter(m => m.isPlayed).length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-400">
                هنوز هیچ مسابقه‌ای ثبت نشده است تا ویرایش شود.
              </div>
            ) : (
              activeLeague.matches.filter(m => m.isPlayed).map((m) => {
                const isEditing = editingMatchId === m.id;
                const p1 = activeLeague.players.find(pl => pl.slot === m.player1Slot);
                const p2 = activeLeague.players.find(pl => pl.slot === m.player2Slot);
                const p1Name = getPlayerName(m.player1Slot);
                const p2Name = getPlayerName(m.player2Slot);

                return (
                  <div key={m.id} className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-300">
                      <span>هفته {m.round} ({m.leg === 1 ? 'دور رفت' : 'دور برگشت'})</span>
                      <button
                        type="button"
                        onClick={() => onResetMatch(m.id)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium text-xs"
                        title="پاک کردن نتیجه بازی"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ریست بازی</span>
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <div className="flex-1 flex items-center gap-1 truncate text-start">
                            <TeamLogo teamName={p1?.team} className="w-4 h-4" />
                            <span className="truncate font-bold text-white">{p1Name}</span>
                          </div>

                          {/* Menu-based goal selector for Home team */}
                          <select
                            value={editScore1}
                            onChange={(e) => setEditScore1(Number(e.target.value))}
                            className="w-16 py-1.5 px-1 text-center rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono font-black text-base focus:outline-none"
                          >
                            {Array.from({ length: 21 }, (_, i) => (
                              <option key={i} value={i} className="bg-zinc-900 text-white font-mono">
                                {i}
                              </option>
                            ))}
                          </select>

                          <span className="font-mono text-zinc-400 font-bold">-</span>

                          {/* Menu-based goal selector for Away team */}
                          <select
                            value={editScore2}
                            onChange={(e) => setEditScore2(Number(e.target.value))}
                            className="w-16 py-1.5 px-1 text-center rounded-lg bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono font-black text-base focus:outline-none"
                          >
                            {Array.from({ length: 21 }, (_, i) => (
                              <option key={i} value={i} className="bg-zinc-900 text-white font-mono">
                                {i}
                              </option>
                            ))}
                          </select>

                          <div className="flex-1 flex items-center justify-end gap-1 truncate text-end">
                            <span className="truncate font-bold text-white">{p2Name}</span>
                            <TeamLogo teamName={p2?.team} className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveMatchScore(m.id)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs"
                          >
                            ذخیره نتیجه
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMatchId(null)}
                            className="py-1.5 px-3 rounded-lg bg-white/10 text-zinc-300 text-xs font-semibold"
                          >
                            انصراف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex-1 flex items-center gap-1.5 truncate text-start">
                          <TeamLogo teamName={p1?.team} className="w-4 h-4" />
                          <span className="truncate font-bold text-white">{p1Name}</span>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black text-base mx-2">
                          {m.score1} - {m.score2}
                        </div>
                        <div className="flex-1 flex items-center justify-end gap-1.5 truncate text-end">
                          <span className="truncate font-bold text-white">{p2Name}</span>
                          <TeamLogo teamName={p2?.team} className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartEditMatch(m.id, m.score1, m.score2)}
                          className="mr-2 p-1 text-emerald-400 hover:text-white"
                          title="ویرایش نتیجه منویی"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Sub-Tab 3: End League Early */}
        {activeSubTab === 'finish' && (
          <div className="flex-1 flex flex-col justify-center text-center p-3 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 mx-auto flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">اتمام زودهنگام و بایگانی لیگ</h4>
              <p className="text-sm text-zinc-300 mt-1 max-w-xs mx-auto">
                با زدن این دکمه، وضعیت کنونی جدول رده‌بندی به عنوان نتیجه نهایی ثبت شده و لیگ به همراه تمام نتایج به تالار افتخارات (تاریخچه) منتقل خواهد شد.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('آیا از اتمام زودهنگام و بایگانی این لیگ اطمینان دارید؟')) {
                  onEndLeagueEarly();
                  onClose();
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-base shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all"
            >
              🏁 اتمام رسمی لیگ و انتقال به تاریخچه
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
