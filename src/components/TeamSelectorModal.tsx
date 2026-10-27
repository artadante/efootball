import React, { useState } from 'react';
import { X, Search, Check, Shield, Star, Sparkles } from 'lucide-react';
import { TEAMS_DATABASE, TeamInfo } from '../data/teams';
import { TeamLogo } from './TeamLogo';

interface TeamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeamNames: string[];
  onConfirm: (selectedNames: string[]) => void;
}

export const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTeamNames,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<string[]>(selectedTeamNames);
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const leagues = ['all', 'انگلیس', 'اسپانیا', 'آلمان', 'ایتالیا', 'فرانسه'] as const;

  const filteredTeams = TEAMS_DATABASE.filter((t) => {
    if (leagueFilter !== 'all' && t.league !== leagueFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return t.name.toLowerCase().includes(q) || t.enName.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleTeam = (teamName: string) => {
    if (selected.includes(teamName)) {
      setSelected(selected.filter((n) => n !== teamName));
    } else {
      setSelected([...selected, teamName]);
    }
  };

  const selectAllFiveStars = () => {
    const fiveStarNames = TEAMS_DATABASE.filter((t) => t.stars === 5).map((t) => t.name);
    const combined = Array.from(new Set([...selected, ...fiveStarNames]));
    setSelected(combined);
  };

  const selectCurrentLeague = () => {
    const currentLeagueNames = filteredTeams.map((t) => t.name);
    const combined = Array.from(new Set([...selected, ...currentLeagueNames]));
    setSelected(combined);
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const handleSave = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl p-4 sm:p-5 bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">انتخاب تیم‌های ۴ و ۵ ستاره</h3>
              <span className="text-xs text-emerald-400 font-medium">
                {selected.length} تیم انتخاب‌شده
              </span>
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

        {/* Search input */}
        <div className="relative my-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام تیم (مثلاً: رئال، سیتی، بایرن...)"
            className="w-full py-2.5 px-3 pr-9 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
        </div>

        {/* League Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 text-xs mb-2">
          {leagues.map((lg) => (
            <button
              key={lg}
              type="button"
              onClick={() => setLeagueFilter(lg)}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                leagueFilter === lg
                  ? 'bg-emerald-500 text-black shadow'
                  : 'bg-black/40 text-zinc-300 hover:bg-white/10'
              }`}
            >
              {lg === 'all' ? 'همه لیگ‌ها' : lg}
            </button>
          ))}
        </div>

        {/* Quick selection helpers */}
        <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400 pb-2 border-b border-white/10">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={selectAllFiveStars}
              className="py-1 px-2 rounded-lg bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>همه ۵ ستاره‌ها</span>
            </button>
            <button
              type="button"
              onClick={selectCurrentLeague}
              className="py-1 px-2 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 font-semibold"
            >
              انتخاب این دسته
            </button>
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Teams Grid / List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1.5 max-h-[360px] pr-0.5">
          {filteredTeams.map((team: TeamInfo) => {
            const isChecked = selected.includes(team.name);

            return (
              <div
                key={team.id}
                onClick={() => toggleTeam(team.name)}
                className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                  isChecked
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.25)]'
                    : 'bg-black/35 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center p-0.5">
                    <TeamLogo teamName={team.name} className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">{team.name}</span>
                    <span className="text-[11px] text-zinc-400">{team.league} • {team.enName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400 text-xs font-mono font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 ml-0.5" />
                    <span>{team.stars}</span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-white/30 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Confirm Button */}
        <div className="pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleSave}
            disabled={selected.length === 0}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black font-extrabold text-sm shadow hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>تایید {selected.length} تیم و افزودن به چرخونه</span>
          </button>
        </div>
      </div>
    </div>
  );
};
