import React, { useState } from 'react';
import { 
  X, 
  Users, 
  ArrowRight, 
  Swords, 
  Trophy,
  Scale,
  Award,
  Flame,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { RegisteredPlayer } from '../types/player';
import { ActiveLeague, ArchivedLeague } from '../types/league';
import { calculatePlayerCareerStats, calculateHeadToHead, calculatePlayerNickname } from '../utils/playerStats';
import { calculateAllPlayersElo } from '../utils/eloRating';
import { calculateGuinnessRecords } from '../utils/guinnessRecords';
import { PlayerFormBadge } from './PlayerFormBadge';
import { PlayerPerformanceGraph } from './PlayerPerformanceGraph';
import { FutCard } from './FutCard';
import { GuinnessRecordsModal } from './GuinnessRecordsModal';
import { PuskasPollModal } from './PuskasPollModal';
import { TeamLogo } from './TeamLogo';
import { soundEngine } from '../utils/soundEffects';

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
  const [viewMode, setViewMode] = useState<'list' | 'profile' | 'compare'>('list');
  const [selectedPlayer, setSelectedPlayer] = useState<RegisteredPlayer | null>(null);

  // Compare mode selection
  const [compareName1, setCompareName1] = useState<string>(registeredPlayers[0]?.name || '');
  const [compareName2, setCompareName2] = useState<string>(registeredPlayers[1]?.name || '');

  // Sub-modals for Guinness and Puskas Poll
  const [isGuinnessOpen, setIsGuinnessOpen] = useState(false);
  const [isPuskasOpen, setIsPuskasOpen] = useState(false);

  if (!isOpen) return null;

  // Build chronological match list for ELO
  const allMatchesChronological: { player1: string; player2: string; score1: number; score2: number }[] = [];
  archivedLeagues.forEach((arc) => {
    arc.matches.forEach((m) => {
      allMatchesChronological.push({ player1: m.player1, player2: m.player2, score1: m.score1, score2: m.score2 });
    });
  });
  if (activeLeague) {
    activeLeague.matches
      .filter((m) => m.isPlayed && typeof m.score1 === 'number' && typeof m.score2 === 'number')
      .forEach((m) => {
        const p1 = activeLeague.players.find((p) => p.slot === m.player1Slot)?.name || '';
        const p2 = activeLeague.players.find((p) => p.slot === m.player2Slot)?.name || '';
        allMatchesChronological.push({ player1: p1, player2: p2, score1: m.score1!, score2: m.score2! });
      });
  }

  const eloMap = calculateAllPlayersElo(
    registeredPlayers.map((p) => p.name),
    allMatchesChronological
  );

  const guinnessRecords = calculateGuinnessRecords(registeredPlayers, activeLeague, archivedLeagues);

  const activeStats = selectedPlayer
    ? calculatePlayerCareerStats(selectedPlayer, activeLeague, archivedLeagues)
    : null;

  const h2hStats = viewMode === 'compare' && compareName1 && compareName2 && compareName1 !== compareName2
    ? calculateHeadToHead(compareName1, compareName2, activeLeague, archivedLeagues)
    : null;

  const playerObj1 = registeredPlayers.find(p => p.name === compareName1);
  const playerObj2 = registeredPlayers.find(p => p.name === compareName2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="پروفایل بازیکنان"
      className="fixed inset-0 z-50 bg-[#041308] text-white flex flex-col p-3 sm:p-6 overflow-hidden animate-fadeIn"
      style={{
        paddingTop: 'max(0.75rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
      }}
    >
      {/* Top Main Navigation Bar */}
      <header className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 shrink-0 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          {viewMode !== 'list' ? (
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setSelectedPlayer(null);
              }}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به لیست بازیکنان</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">پروفایل بازیکنان</h2>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls: Guinness Records, Puskas, Compare button & Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {viewMode === 'list' && (
            <>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setIsGuinnessOpen(true);
                }}
                className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1 shadow active:scale-95 transition-all"
                title="تالار رکوردهای گینس مسابقات"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">رکوردهای گینس</span>
                <span className="sm:hidden">گینس</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setIsPuskasOpen(true);
                }}
                className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
                title="نظرسنجی جایزه پوشکاش"
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">جایزه پوشکاش</span>
                <span className="sm:hidden">پوشکاش</span>
              </button>

              {registeredPlayers.length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setCompareName1(registeredPlayers[0]?.name || '');
                    setCompareName2(registeredPlayers[1]?.name || '');
                    setViewMode('compare');
                  }}
                  className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>مقایسه ۲ بازیکن</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Full-Page Scrollable Body */}
      <main className="flex-1 overflow-y-auto no-scrollbar py-4 max-w-4xl mx-auto w-full">
        
        {/* VIEW 1: All Players Directory - 2-column vertical grid layout */}
        {viewMode === 'list' && (
          <div className="space-y-4 pb-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {registeredPlayers.map((player) => {
                const pStats = calculatePlayerCareerStats(player, activeLeague, archivedLeagues);
                const eloInfo = eloMap[player.name];
                const formResults = pStats.matches.map((m) => m.result);

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setViewMode('profile');
                    }}
                    className="relative overflow-hidden w-full p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-950/50 border border-white/15 hover:border-emerald-400/60 hover:bg-emerald-900/40 transition-all flex flex-col items-center text-center justify-between group active:scale-95 shadow-xl cursor-pointer"
                  >
                    {/* Top: Avatar */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 min-w-[4rem] min-h-[4rem] sm:min-w-[5rem] sm:min-h-[5rem] rounded-full p-0.5 sm:p-1 bg-gradient-to-tr from-emerald-400 via-green-300 to-emerald-500 shadow-[0_0_18px_rgba(34,197,94,0.35)] shrink-0 group-hover:scale-105 transition-all flex items-center justify-center overflow-hidden mb-2 sm:mb-2.5">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-black text-xl sm:text-2xl text-emerald-300">
                        {player.avatarUrl ? (
                          <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{player.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Name & Form Badge */}
                    <div className="w-full flex flex-col items-center">
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <span className="block text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors truncate">
                          {player.name}
                        </span>
                        <PlayerFormBadge results={formResults} />
                      </div>

                      <div className="flex items-center justify-center gap-1.5 mt-1 sm:mt-1.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${eloInfo?.tierBg || 'bg-white/10 text-white'}`}>
                          {eloInfo?.tierNameFa || 'عادی'}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                          ELO {eloInfo?.rating || 1200}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Action Hint */}
                    <span className="text-[11px] sm:text-xs text-emerald-400 font-semibold mt-2.5 sm:mt-3 flex items-center justify-center gap-1 group-hover:underline">
                      <span>مشاهده پروفایل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Individual Personal Profile - Full page */}
        {viewMode === 'profile' && selectedPlayer && activeStats && (
          <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
            
            {/* Player Hero Header */}
            <div className="p-5 rounded-3xl bg-emerald-950/50 border border-white/15 flex flex-col items-center text-center shadow-xl">
              <div className="w-24 h-24 sm:w-28 sm:h-28 min-w-[6rem] min-h-[6rem] rounded-full p-1 bg-gradient-to-tr from-emerald-400 via-green-300 to-amber-300 shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-3 shrink-0 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden font-black text-3xl sm:text-4xl text-emerald-300">
                  {selectedPlayer.avatarUrl ? (
                    <img src={selectedPlayer.avatarUrl} alt={selectedPlayer.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{selectedPlayer.name.charAt(0)}</span>
                  )}
                </div>
              </div>

              {/* Player Name & ELO Tier & Form */}
              <div className="flex items-center gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">{selectedPlayer.name}</h3>
                <PlayerFormBadge results={activeStats.matches.map(m => m.result)} showLabel />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${eloMap[selectedPlayer.name]?.tierBg || 'bg-white/10 text-white'}`}>
                  {eloMap[selectedPlayer.name]?.tierNameFa || 'رتبه نامشخص'}
                </span>
                <span className="text-xs font-mono text-zinc-300">
                  امتیاز ELO: {eloMap[selectedPlayer.name]?.rating || 1200}
                </span>
              </div>

              {activeStats.championships > 0 && (
                <div className="mt-2.5 inline-flex items-center gap-1 py-1 px-3 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{activeStats.championships} عنوان قهرمانی مسابقات</span>
                </div>
              )}
            </div>

            {/* 3D Flippable FUT / eFootball Ultimate Team Card */}
            <div className="py-2">
              <FutCard
                stats={activeStats}
                eloRating={eloMap[selectedPlayer.name]?.rating || 1200}
                nickname={calculatePlayerNickname(activeStats)}
              />
            </div>

            {/* Career Lifetime Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="p-3.5 rounded-2xl bg-black/45 border border-white/10 text-center">
                <span className="text-xs text-zinc-400 block mb-1">تعداد بازی کلی</span>
                <span className="text-2xl font-black font-mono text-white">{activeStats.totalMatches}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/45 border border-white/10 text-center">
                <span className="text-xs text-zinc-400 block mb-1">برد / مساوی / باخت</span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                  {activeStats.wins} - {activeStats.draws} - {activeStats.losses}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/45 border border-white/10 text-center">
                <span className="text-xs text-zinc-400 block mb-1">درصد پیروزی</span>
                <span className="text-2xl font-black font-mono text-amber-300">%{activeStats.winRate}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/45 border border-white/10 text-center">
                <span className="text-xs text-zinc-400 block mb-1">گل زده / خورده</span>
                <span className="text-base sm:text-lg font-black font-mono text-white">
                  {activeStats.goalsFor} / {activeStats.goalsAgainst}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/45 border border-white/10 text-center">
                <span className="text-xs text-zinc-400 block mb-1">تفاضل گل کل</span>
                <span className={`text-xl font-black font-mono dir-ltr ${
                  activeStats.goalDifference > 0 ? 'text-emerald-400' : activeStats.goalDifference < 0 ? 'text-rose-400' : 'text-zinc-300'
                }`}>
                  {activeStats.goalDifference > 0 ? `+${activeStats.goalDifference}` : activeStats.goalDifference}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/45 border border-white/10 text-center">
                <span className="text-xs text-zinc-400 block mb-1">میانگین گل در هر بازی</span>
                <span className="text-xl font-black font-mono text-emerald-300">
                  {activeStats.totalMatches > 0 ? (activeStats.goalsFor / activeStats.totalMatches).toFixed(1) : '0.0'}
                </span>
              </div>
            </div>

            {/* Teams Played With */}
            <div className="p-4 rounded-3xl bg-black/45 border border-white/10 space-y-2.5">
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
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-xs font-bold text-white shadow"
                    >
                      <TeamLogo teamName={teamName} className="w-4 h-4 shrink-0" />
                      <span>{teamName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Performance Graph with Mouse Hover Tooltip */}
            <PlayerPerformanceGraph performancePoints={activeStats.performancePoints} />

            {/* Complete Match History List */}
            <div className="p-4 rounded-3xl bg-black/45 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-emerald-400" />
                <span>سوابق تمام بازی‌های ثبت‌شده ({activeStats.matches.length}):</span>
              </span>

              {activeStats.matches.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">هنوز هیچ مسابقه‌ای برای این بازیکن ثبت نشده است.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-0.5">
                  {activeStats.matches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
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

                      <div className="text-end">
                        <span className="font-mono font-black text-base text-emerald-400 block tracking-wider">
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

        {/* VIEW 3: Head-to-Head Comparison Mode */}
        {viewMode === 'compare' && (
          <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
            
            {/* Player Selection Dropdowns */}
            <div className="p-4 rounded-3xl bg-emerald-950/50 border border-white/15 space-y-3">
              <span className="text-xs font-bold text-emerald-300 block text-center">
                دو بازیکن را برای مقایسه مستقیم انتخاب کنید:
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Player 1 Select */}
                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">بازیکن اول:</label>
                  <select
                    value={compareName1}
                    onChange={(e) => setCompareName1(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                  >
                    {registeredPlayers.map((p) => (
                      <option key={p.id} value={p.name} disabled={p.name === compareName2}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Player 2 Select */}
                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">بازیکن دوم:</label>
                  <select
                    value={compareName2}
                    onChange={(e) => setCompareName2(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                  >
                    {registeredPlayers.map((p) => (
                      <option key={p.id} value={p.name} disabled={p.name === compareName1}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Results Card */}
            {h2hStats && (
              <div className="space-y-4">
                {/* Visual Head-to-Head Hero */}
                <div className="p-5 rounded-3xl bg-black/50 border border-white/15 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between gap-3 text-center">
                    
                    {/* Player 1 Avatar & Name */}
                    <div className="flex-1 flex flex-col items-center min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 min-w-[4rem] min-h-[4rem] rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-green-300 shadow-lg mb-2 shrink-0 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-xl sm:text-2xl text-emerald-300 overflow-hidden">
                          {playerObj1?.avatarUrl ? (
                            <img src={playerObj1.avatarUrl} alt={compareName1} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{compareName1.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-black text-base sm:text-lg text-white truncate max-w-full">{compareName1}</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                        {h2hStats.player1Wins} برد
                      </span>
                    </div>

                    {/* VS Badge & Draws */}
                    <div className="shrink-0 px-2 flex flex-col items-center">
                      <span className="text-xs font-mono font-black py-1 px-3 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        VS
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-2 font-mono">
                        {h2hStats.draws} مساوی
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {h2hStats.totalMatches} بازی کلی
                      </span>
                    </div>

                    {/* Player 2 Avatar & Name */}
                    <div className="flex-1 flex flex-col items-center min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 min-w-[4rem] min-h-[4rem] rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-green-300 shadow-lg mb-2 shrink-0 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-xl sm:text-2xl text-emerald-300 overflow-hidden">
                          {playerObj2?.avatarUrl ? (
                            <img src={playerObj2.avatarUrl} alt={compareName2} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{compareName2.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-black text-base sm:text-lg text-white truncate max-w-full">{compareName2}</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                        {h2hStats.player2Wins} برد
                      </span>
                    </div>
                  </div>

                  {/* Verdict & Margin Banner */}
                  <div className="mt-4 pt-3 border-t border-white/10 text-center space-y-1">
                    {h2hStats.totalMatches === 0 ? (
                      <span className="text-xs text-zinc-400">این دو بازیکن هنوز هیچ مسابقه مستقیمی با یکدیگر نداشته‌اند.</span>
                    ) : h2hStats.leader ? (
                      <div>
                        <span className="text-sm font-black text-amber-300 flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>{h2hStats.leader} با اختلاف {h2hStats.winDiff} برد برتر است!</span>
                        </span>
                        <span className="text-xs text-zinc-300 font-mono block mt-1">
                          مجموع گل‌ها: {compareName1} {h2hStats.player1Goals} - {h2hStats.player2Goals} {compareName2} (تفاضل: {h2hStats.goalDiff > 0 ? `+${h2hStats.goalDiff}` : h2hStats.goalDiff})
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-black text-emerald-300 flex items-center justify-center gap-1.5">
                          <Scale className="w-4 h-4 text-emerald-400" />
                          <span>عملکرد هر دو بازیکن در نبردهای مستقیم کاملاً برابر است!</span>
                        </span>
                        <span className="text-xs text-zinc-300 font-mono block mt-1">
                          مجموع گل‌ها: {h2hStats.player1Goals} - {h2hStats.player2Goals}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Match History Between These 2 Players */}
                <div className="p-4 rounded-3xl bg-black/45 border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-emerald-400" />
                    <span>تاریخچه تقابل‌های رو در رو ({h2hStats.matches.length} بازی):</span>
                  </span>

                  {h2hStats.matches.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-3 text-center">هیچ بازی ثبت‌شده‌ای بین این دو نفر یافت نشد.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
                      {h2hStats.matches.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                        >
                          {/* Player 1 Team & Score */}
                          <div className="flex-1 flex items-center gap-1.5 truncate">
                            <TeamLogo teamName={m.player1Team} className="w-4 h-4 shrink-0" />
                            <span className={`font-bold truncate ${m.winner === compareName1 ? 'text-emerald-400' : 'text-white'}`}>
                              {compareName1}
                            </span>
                          </div>

                          {/* Match Score */}
                          <div className="px-3 py-1 rounded-xl bg-black/70 border border-white/10 font-mono font-black text-sm text-emerald-400 mx-2 tracking-wider">
                            {m.score1} - {m.score2}
                          </div>

                          {/* Player 2 Team & Score */}
                          <div className="flex-1 flex items-center justify-end gap-1.5 truncate text-end">
                            <span className={`font-bold truncate ${m.winner === compareName2 ? 'text-emerald-400' : 'text-white'}`}>
                              {compareName2}
                            </span>
                            <TeamLogo teamName={m.player2Team} className="w-4 h-4 shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sub Modals: Guinness Hall of Fame, Puskas Best Goal, Story Poster */}
      <GuinnessRecordsModal
        isOpen={isGuinnessOpen}
        onClose={() => setIsGuinnessOpen(false)}
        records={guinnessRecords}
      />

      <PuskasPollModal
        isOpen={isPuskasOpen}
        onClose={() => setIsPuskasOpen(false)}
        players={registeredPlayers.map((p) => p.name)}
        currentUserName={selectedPlayer?.name || registeredPlayers[0]?.name || 'کاربر مهمان'}
      />
    </div>
  );
};
