import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles, Check, Trash2 } from 'lucide-react';
import { TEAMS_DATABASE, TeamInfo } from '../data/teams';
import { TeamLogo } from './TeamLogo';
import { soundEngine } from '../utils/soundEffects';

export interface PlayerPickBan {
  playerName: string;
  bannedTeam?: string; // 1 team banned
  pickedTeams: string[]; // up to 2 preferred teams
}

interface PickBanModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: string[];
  initialPicksBans?: Record<string, PlayerPickBan>;
  onSave: (picksBans: Record<string, PlayerPickBan>) => void;
}

export const PickBanModal: React.FC<PickBanModalProps> = ({
  isOpen,
  onClose,
  players,
  initialPicksBans = {},
  onSave,
}) => {
  const [data, setData] = useState<Record<string, PlayerPickBan>>(() => {
    const state: Record<string, PlayerPickBan> = { ...initialPicksBans };
    players.forEach((p) => {
      if (!state[p]) {
        state[p] = { playerName: p, pickedTeams: [] };
      }
    });
    return state;
  });

  const [activePlayer, setActivePlayer] = useState<string>(players[0] || '');

  if (!isOpen) return null;

  const currentSelection = data[activePlayer] || { playerName: activePlayer, pickedTeams: [] };

  const handleToggleBan = (teamName: string) => {
    soundEngine.playClick();
    const isCurrentlyBanned = currentSelection.bannedTeam === teamName;
    const nextBanned = isCurrentlyBanned ? undefined : teamName;
    // remove from picked if it was picked
    const nextPicked = currentSelection.pickedTeams.filter((t) => t !== teamName);

    setData({
      ...data,
      [activePlayer]: {
        ...currentSelection,
        bannedTeam: nextBanned,
        pickedTeams: nextPicked,
      },
    });
  };

  const handleTogglePick = (teamName: string) => {
    soundEngine.playClick();
    if (currentSelection.bannedTeam === teamName) return;

    let nextPicked = [...currentSelection.pickedTeams];
    if (nextPicked.includes(teamName)) {
      nextPicked = nextPicked.filter((t) => t !== teamName);
    } else {
      if (nextPicked.length >= 2) {
        nextPicked = [nextPicked[1], teamName]; // keep max 2
      } else {
        nextPicked.push(teamName);
      }
    }

    setData({
      ...data,
      [activePlayer]: {
        ...currentSelection,
        pickedTeams: nextPicked,
      },
    });
  };

  const handleSaveAndClose = () => {
    soundEngine.playClick();
    onSave(data);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="سیستم پیک و بن تیم‌ها"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-emerald-950/95 border border-white/20 p-5 sm:p-6 text-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white">فاز پیک و بن تیم‌ها (اختیاری) 🚫</h3>
              <p className="text-xs text-zinc-400">هر بازیکن: ۱ تیم بن (ممنوع) و تا ۲ تیم منتخب</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 border-b border-white/10 shrink-0">
          {players.map((p) => {
            const isAct = p === activePlayer;
            const pb = data[p];
            const hasBan = !!pb?.bannedTeam;
            const pickCount = pb?.pickedTeams?.length || 0;

            return (
              <button
                key={p}
                type="button"
                onClick={() => setActivePlayer(p)}
                className={`py-2 px-3.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 ${
                  isAct
                    ? 'bg-emerald-500 text-black shadow-lg scale-105'
                    : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                }`}
              >
                <span>{p}</span>
                {hasBan && <span className="w-2 h-2 rounded-full bg-rose-500" title="دارای بن" />}
                {pickCount > 0 && <span className="text-[10px] opacity-80">({pickCount} تیم)</span>}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
          {/* Active Player Status Banner */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-zinc-400 block">انتخاب‌های «{activePlayer}»:</span>
              <div className="flex items-center gap-3 mt-1 font-bold">
                <span className="text-rose-400">
                  تیم ممنوع (Ban): {currentSelection.bannedTeam || 'هیچ'}
                </span>
                <span className="text-emerald-400">
                  تیم‌های ترجیحی: {currentSelection.pickedTeams.join(' ، ') || 'هیچ'}
                </span>
              </div>
            </div>

            {/* Clear current player's selections */}
            {(currentSelection.bannedTeam || currentSelection.pickedTeams.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setData({
                    ...data,
                    [activePlayer]: { playerName: activePlayer, pickedTeams: [] },
                  });
                }}
                className="py-1 px-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-rose-300 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاک کردن</span>
              </button>
            )}
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {TEAMS_DATABASE.map((team: TeamInfo) => {
              const isBanned = currentSelection.bannedTeam === team.name;
              const isPicked = currentSelection.pickedTeams.includes(team.name);

              return (
                <div
                  key={team.name}
                  className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                    isBanned
                      ? 'bg-rose-950/40 border-rose-500/50 shadow-rose-900/20'
                      : isPicked
                      ? 'bg-emerald-950/50 border-emerald-400/50 shadow-emerald-900/20'
                      : 'bg-black/35 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <TeamLogo teamName={team.name} className="w-6 h-6 shrink-0" />
                    <div className="truncate">
                      <span className="block text-xs font-black text-white truncate">{team.name}</span>
                      <span className="text-[10px] text-zinc-400 block truncate">{team.league}</span>
                    </div>
                  </div>

                  {/* Actions for this team */}
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/5">
                    {/* Ban button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBan(team.name)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isBanned
                          ? 'bg-rose-500 text-white font-black'
                          : 'bg-white/10 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300'
                      }`}
                    >
                      {isBanned ? '🚫 بن شد' : 'بن تیم'}
                    </button>

                    {/* Pick button */}
                    <button
                      type="button"
                      disabled={isBanned}
                      onClick={() => handleTogglePick(team.name)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isPicked
                          ? 'bg-emerald-400 text-black font-black'
                          : 'bg-white/10 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 disabled:opacity-30'
                      }`}
                    >
                      {isPicked ? '⭐ انتخاب' : 'پیک'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تیم‌های بن‌شده از چرخونه حذف خواهند شد.</span>
          </span>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 text-black font-black text-sm shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>تأیید و ذخیره پیک/بن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
