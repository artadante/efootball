import React from 'react';
import { Trophy, Swords } from 'lucide-react';
import { ActiveLeague } from '../types/league';
import { TeamLogo } from './TeamLogo';

interface KnockoutBracketProps {
  activeLeague: ActiveLeague;
  isAdmin?: boolean;
  onEditMatch?: (matchId: string) => void;
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({
  activeLeague,
  isAdmin = false,
  onEditMatch,
}) => {
  // If not in cup mode, we can still generate or adapt a knockout representation
  // Divide matches into rounds: Round 1 (یک‌چهارم یا دور اول), Round 2 (نیمه‌نهایی), Round 3 (فینال)
  const allMatches = activeLeague.matches;
  
  // Group matches by round or generate rounds
  const roundsMap = new Map<number, typeof allMatches>();
  allMatches.forEach((m) => {
    const list = roundsMap.get(m.round) || [];
    list.push(m);
    roundsMap.set(m.round, list);
  });

  const roundNumbers = Array.from(roundsMap.keys()).sort((a, b) => a - b);
  const totalRounds = roundNumbers.length;

  const getRoundTitle = (roundIdx: number, total: number) => {
    if (roundIdx === total - 1) return 'فینال بزرگ 🏆';
    if (roundIdx === total - 2) return 'نیمه‌نهایی ⚔️';
    if (roundIdx === total - 3) return 'یک‌چهارم نهایی 🛡️';
    return `دور ${roundIdx + 1}`;
  };

  const getPlayerInfo = (slotNum: number) => {
    const p = activeLeague.players.find((pl) => pl.slot === slotNum);
    return {
      name: p?.name || `بازیکن ${slotNum}`,
      team: p?.team || `تیم ${slotNum}`,
    };
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-6 px-2">
      <div className="min-w-[650px] sm:min-w-[850px] flex items-center justify-between gap-6 relative">
        {roundNumbers.map((rNum, idx) => {
          const matches = roundsMap.get(rNum) || [];
          const isFinal = idx === totalRounds - 1;

          return (
            <div key={rNum} className="flex-1 flex flex-col justify-around gap-6 relative z-10">
              {/* Round Header */}
              <div className="text-center mb-2">
                <span className={`inline-block py-1.5 px-3.5 rounded-full text-xs font-black border shadow-lg ${
                  isFinal
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-amber-400/20 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {getRoundTitle(idx, totalRounds)}
                </span>
              </div>

              {/* Matches in this Round */}
              <div className="flex flex-col justify-around gap-6 h-full py-2">
                {matches.map((m) => {
                  const p1 = getPlayerInfo(m.player1Slot);
                  const p2 = getPlayerInfo(m.player2Slot);
                  const isP1Winner = m.isPlayed && typeof m.score1 === 'number' && typeof m.score2 === 'number' && m.score1 > m.score2;
                  const isP2Winner = m.isPlayed && typeof m.score1 === 'number' && typeof m.score2 === 'number' && m.score2 > m.score1;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (isAdmin && onEditMatch) onEditMatch(m.id);
                      }}
                      className={`relative p-3 rounded-2xl border transition-all shadow-xl group ${
                        isFinal
                          ? 'bg-amber-950/40 border-amber-400/50 hover:border-amber-300'
                          : 'bg-emerald-950/45 border-white/15 hover:border-emerald-400/50'
                      } ${isAdmin ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                    >
                      {/* Match Meta Badge */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-zinc-400">
                        <span className="font-mono">بازی #{m.round}</span>
                        {m.isPlayed ? (
                          <span className="text-emerald-400 font-bold">پایان یافته</span>
                        ) : (
                          <span className="text-amber-300/80 font-bold">در انتظار برگزاری</span>
                        )}
                      </div>

                      {/* Team 1 / Player 1 */}
                      <div className={`flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                        isP1Winner ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-white/5'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <TeamLogo teamName={p1.team} className="w-5 h-5 shrink-0" />
                          <div className="truncate text-start">
                            <span className={`block text-xs font-black truncate ${
                              isP1Winner ? 'text-emerald-300' : 'text-white'
                            }`}>
                              {p1.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate">{p1.team}</span>
                          </div>
                        </div>
                        <span className="font-mono font-black text-sm px-2 text-white">
                          {m.score1 !== null && m.score1 !== undefined ? m.score1 : '-'}
                        </span>
                      </div>

                      {/* VS Divider */}
                      <div className="flex items-center justify-center my-1">
                        <Swords className="w-3.5 h-3.5 text-zinc-500" />
                      </div>

                      {/* Team 2 / Player 2 */}
                      <div className={`flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                        isP2Winner ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-white/5'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <TeamLogo teamName={p2.team} className="w-5 h-5 shrink-0" />
                          <div className="truncate text-start">
                            <span className={`block text-xs font-black truncate ${
                              isP2Winner ? 'text-emerald-300' : 'text-white'
                            }`}>
                              {p2.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate">{p2.team}</span>
                          </div>
                        </div>
                        <span className="font-mono font-black text-sm px-2 text-white">
                          {m.score2 !== null && m.score2 !== undefined ? m.score2 : '-'}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="mt-2 text-center text-[10px] text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          ✏️ برای ثبت یا ویرایش نتیجه کلیک کنید
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bracket Footer Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>تیم صعودکننده / برنده</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>مسیر قهرمانی جام حذفی</span>
        </span>
      </div>
    </div>
  );
};
