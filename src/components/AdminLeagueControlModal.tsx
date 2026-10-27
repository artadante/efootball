import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Edit3, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  UserPlus,
  Trash2,
  Plus,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { ActiveLeague } from '../types/league';
import { RegisteredPlayer, DEFAULT_FIXED_PLAYERS } from '../types/player';
import { TEAMS_DATABASE } from '../data/teams';
import { TeamLogo } from './TeamLogo';

interface AdminLeagueControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLeague: ActiveLeague | null;
  registeredPlayers?: RegisteredPlayer[];
  onUpdatePlayer: (slot: number, name: string, team: string) => void;
  onUpdateMatchScore: (matchId: string, score1: number, score2: number) => void;
  onResetMatch: (matchId: string) => void;
  onEndLeagueEarly: () => void;
  onAddPlayer?: (name: string) => void;
  onDeletePlayer?: (id: string) => void;
  onUpdatePlayerAvatar?: (playerId: string, avatarUrl: string) => void;
  onCreateLeague?: () => void;
}

export const AdminLeagueControlModal: React.FC<AdminLeagueControlModalProps> = ({
  isOpen,
  onClose,
  activeLeague,
  registeredPlayers = DEFAULT_FIXED_PLAYERS,
  onUpdatePlayer,
  onUpdateMatchScore,
  onResetMatch,
  onEndLeagueEarly,
  onAddPlayer,
  onDeletePlayer,
  onUpdatePlayerAvatar,
  onCreateLeague,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'players' | 'matches' | 'manage-players' | 'finish'>('players');

  // Player slot editing state
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState('');

  // Match score editing state
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editScore1, setEditScore1] = useState<number>(0);
  const [editScore2, setEditScore2] = useState<number>(0);

  // New player registration state
  const [newPlayerName, setNewPlayerName] = useState('');

  // Player Avatar editing modal state
  const [avatarPlayer, setAvatarPlayer] = useState<RegisteredPlayer | null>(null);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  if (!isOpen) return null;

  if (!activeLeague) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      >
        <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl text-white text-center space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-amber-400" />
              <span>پنل ادمین</span>
            </h3>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 py-2">در حال حاضر هیچ لیگی در جریان نیست.</p>

          {onCreateLeague && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateLeague();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm shadow flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ایجاد مسابقات جدید و قرعه‌کشی</span>
            </button>
          )}
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

  const handleAddNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (onAddPlayer) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const getPlayerName = (slot: number) => {
    const p = activeLeague.players.find((pl) => pl.slot === slot);
    return p?.name || `بازیکن ${slot}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom, 0px) + 6rem))',
      }}
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

        {/* Sub-Tabs: اسامی و تیم‌ها | ویرایش بازی‌ها | مدیریت بازیکنان | اتمام لیگ */}
        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10 my-3 text-xs sm:text-sm">
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
            onClick={() => setActiveSubTab('manage-players')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeSubTab === 'manage-players'
                ? 'bg-amber-400 text-black font-extrabold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            مدیریت بازیکنان
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

        {/* Sub-Tab 1: Players & Teams Menu-Based Editing */}
        {activeSubTab === 'players' && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            <p className="text-xs sm:text-sm text-zinc-300 mb-2">
              تغییرات منویی شما بلافاصله در کل برنامه، بازی‌ها، جدول و صفحه چرخونه اعمال می‌شود:
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
                        {/* Player Name Dropdown Selector */}
                        <select
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-400/40 text-sm text-white focus:outline-none"
                        >
                          <option value="" disabled>انتخاب نام بازیکن...</option>
                          {registeredPlayers.map((rp) => (
                            <option key={rp.id} value={rp.name}>
                              {rp.name}
                            </option>
                          ))}
                          {editName && !registeredPlayers.some(rp => rp.name === editName) && (
                            <option value={editName}>{editName}</option>
                          )}
                        </select>

                        {/* Team Dropdown Selector */}
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
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>هفته {m.round} ({m.leg === 1 ? 'رفت' : 'برگشت'})</span>
                      <button
                        type="button"
                        onClick={() => onResetMatch(m.id)}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>ریست بازی</span>
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between gap-2 text-center">
                          {/* Player 1 Dropdown */}
                          <div className="flex-1">
                            <span className="block text-xs font-bold text-white mb-1 truncate">{p1Name}</span>
                            <select
                              value={editScore1}
                              onChange={(e) => setEditScore1(Number(e.target.value))}
                              className="w-full py-2 px-2 text-center rounded-xl bg-emerald-950 border border-emerald-400/40 text-base font-black text-emerald-400 focus:outline-none"
                            >
                              {Array.from({ length: 21 }, (_, i) => (
                                <option key={i} value={i} className="bg-slate-900 text-white font-mono">
                                  {i} گل
                                </option>
                              ))}
                            </select>
                          </div>

                          <span className="font-bold text-zinc-500 font-mono mt-4">-</span>

                          {/* Player 2 Dropdown */}
                          <div className="flex-1">
                            <span className="block text-xs font-bold text-white mb-1 truncate">{p2Name}</span>
                            <select
                              value={editScore2}
                              onChange={(e) => setEditScore2(Number(e.target.value))}
                              className="w-full py-2 px-2 text-center rounded-xl bg-emerald-950 border border-emerald-400/40 text-base font-black text-emerald-400 focus:outline-none"
                            >
                              {Array.from({ length: 21 }, (_, i) => (
                                <option key={i} value={i} className="bg-slate-900 text-white font-mono">
                                  {i} گل
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveMatchScore(m.id)}
                            className="flex-1 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow"
                          >
                            ذخیره نتیجه
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMatchId(null)}
                            className="py-1.5 px-3 rounded-xl bg-white/10 text-zinc-300 text-xs"
                          >
                            انصراف
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm py-1">
                        <div className="flex-1 flex items-center gap-1.5 truncate">
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

        {/* Sub-Tab 3: Manage Registered Players */}
        {activeSubTab === 'manage-players' && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            <p className="text-xs text-zinc-300">
              مدیریت و افزودن بازیکنان جدید به منوی گردونه و پروفایل‌ها:
            </p>

            {/* Add new player form */}
            <form onSubmit={handleAddNewPlayer} className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="نام بازیکن جدید..."
                className="flex-1 py-2 px-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!newPlayerName.trim()}
                className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-extrabold text-xs shadow flex items-center gap-1 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>افزودن</span>
              </button>
            </form>

            {/* Registered players list */}
            <div className="space-y-1.5 pt-1">
              {registeredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-white/20 flex items-center justify-center font-bold text-xs text-emerald-300 overflow-hidden shrink-0">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{player.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-bold text-white text-sm">{player.name}</span>
                    {player.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                        ثابت
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Change Avatar Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarPlayer(player);
                        setAvatarUrlInput(player.avatarUrl || '');
                      }}
                      className="py-1 px-2 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 text-xs font-medium flex items-center gap-1 transition-all"
                      title="تنظیم عکس پروفایل بازیکن"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>عکس</span>
                    </button>

                    {!player.isDefault && onDeletePlayer && (
                      <button
                        type="button"
                        onClick={() => onDeletePlayer(player.id)}
                        className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="حذف بازیکن"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action: Create New League */}
            {onCreateLeague && (
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCreateLeague();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>ایجاد مسابقات جدید و قرعه‌کشی</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal: Edit Player Avatar */}
        {avatarPlayer && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          >
            <div className="relative w-full max-w-xs rounded-3xl p-5 bg-emerald-950 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>عکس پروفایل {avatarPlayer.name}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setAvatarPlayer(null)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Current Preview */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-green-300 shadow-lg">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-bold text-2xl text-emerald-300">
                    {avatarPlayer.avatarUrl ? (
                      <img src={avatarPlayer.avatarUrl} alt={avatarPlayer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{avatarPlayer.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-zinc-300 font-bold">{avatarPlayer.name}</span>
              </div>

              {/* Upload file directly from phone or PC */}
              <label className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-xs shadow flex items-center justify-center gap-2 cursor-pointer hover:brightness-105 active:scale-95 transition-all">
                <Upload className="w-4 h-4" />
                <span>انتخاب عکس از گالری / کامپیوتر</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const base64 = ev.target?.result as string;
                      if (base64 && onUpdatePlayerAvatar) {
                        onUpdatePlayerAvatar(avatarPlayer.id, base64);
                        setAvatarPlayer(null);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {/* Or paste direct URL */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-zinc-400 block">یا وارد کردن لینک مستقیم تصویر:</span>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdatePlayerAvatar) {
                        onUpdatePlayerAvatar(avatarPlayer.id, avatarUrlInput.trim());
                        setAvatarPlayer(null);
                      }
                    }}
                    className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                  >
                    ذخیره
                  </button>
                </div>
              </div>

              {/* Remove photo option if custom avatar exists */}
              {avatarPlayer.avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdatePlayerAvatar) {
                      onUpdatePlayerAvatar(avatarPlayer.id, '');
                      setAvatarPlayer(null);
                    }
                  }}
                  className="w-full py-1.5 text-center text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  حذف عکس و بازگشت به حالت پیش‌فرض
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sub-Tab 4: Early Finish & Archive League */}
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
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>اتمام رسمی لیگ و انتقال به تاریخچه</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
