import React, { useState } from 'react';
import { X, Target, Trophy, CheckCircle2 } from 'lucide-react';
import { ScheduledMatch, LeaguePlayer } from '../types/league';
import { TeamLogo } from './TeamLogo';
import { soundEngine } from '../utils/soundEffects';

interface MatchPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: ScheduledMatch[];
  players: LeaguePlayer[];
  currentUserName: string;
}

interface StoredPrediction {
  matchId: string;
  userName: string;
  predictedWinner: 'p1' | 'draw' | 'p2';
  score1: number;
  score2: number;
}

const STORAGE_PREDICTIONS_KEY = 'efootball_match_predictions';

export const MatchPredictionModal: React.FC<MatchPredictionModalProps> = ({
  isOpen,
  onClose,
  matches,
  players,
  currentUserName,
}) => {
  const [predictions, setPredictions] = useState<StoredPrediction[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PREDICTIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [predWinner, setPredWinner] = useState<'p1' | 'draw' | 'p2'>('p1');
  const [score1, setScore1] = useState(2);
  const [score2, setScore2] = useState(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Unplayed matches only
  const unplayedMatches = matches.filter((m) => !m.isPlayed);

  const getPlayer = (slot: number) => {
    const p = players.find((pl) => pl.slot === slot);
    return {
      name: p?.name || `بازیکن ${slot}`,
      team: p?.team || `تیم ${slot}`,
    };
  };

  const handleSetWinner = (winner: 'p1' | 'draw' | 'p2') => {
    setPredWinner(winner);
    if (winner === 'p1') {
      if (score1 <= score2) {
        setScore1(2);
        setScore2(1);
      }
    } else if (winner === 'draw') {
      setScore1(1);
      setScore2(1);
    } else if (winner === 'p2') {
      if (score2 <= score1) {
        setScore1(1);
        setScore2(2);
      }
    }
  };

  const handleSavePrediction = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMatchId = selectedMatchId || activeTargetMatch?.id;
    if (!targetMatchId) return;

    // Strict validation
    if (predWinner === 'p1' && score1 <= score2) return;
    if (predWinner === 'p2' && score2 <= score1) return;
    if (predWinner === 'draw' && score1 !== score2) return;

    soundEngine.playClick();

    const newPred: StoredPrediction = {
      matchId: targetMatchId,
      userName: currentUserName,
      predictedWinner: predWinner,
      score1,
      score2,
    };

    const updated = predictions.filter(
      (p) => !(p.matchId === targetMatchId && p.userName === currentUserName)
    );
    updated.push(newPred);

    setPredictions(updated);
    try {
      localStorage.setItem(STORAGE_PREDICTIONS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Calculate prediction leaderboard across played matches
  const leaderboardMap: Record<string, { points: number; correctExact: number; correctOutcome: number }> = {};

  predictions.forEach((pred) => {
    if (!leaderboardMap[pred.userName]) {
      leaderboardMap[pred.userName] = { points: 0, correctExact: 0, correctOutcome: 0 };
    }

    const actualMatch = matches.find((m) => m.id === pred.matchId);
    if (actualMatch && actualMatch.isPlayed && typeof actualMatch.score1 === 'number' && typeof actualMatch.score2 === 'number') {
      const actualS1 = actualMatch.score1;
      const actualS2 = actualMatch.score2;

      let actualWinner: 'p1' | 'draw' | 'p2' = 'draw';
      if (actualS1 > actualS2) actualWinner = 'p1';
      else if (actualS2 > actualS1) actualWinner = 'p2';

      // Exact score: 3 points
      if (pred.score1 === actualS1 && pred.score2 === actualS2) {
        leaderboardMap[pred.userName].points += 3;
        leaderboardMap[pred.userName].correctExact += 1;
      }
      // Correct outcome: 1 point
      else if (pred.predictedWinner === actualWinner) {
        leaderboardMap[pred.userName].points += 1;
        leaderboardMap[pred.userName].correctOutcome += 1;
      }
    }
  });

  const leaderboard = Object.keys(leaderboardMap)
    .map((name) => ({
      name,
      ...leaderboardMap[name],
    }))
    .sort((a, b) => b.points - a.points);

  const activeTargetMatch = unplayedMatches.find((m) => m.id === selectedMatchId) || unplayedMatches[0];
  const p1 = activeTargetMatch ? getPlayer(activeTargetMatch.player1Slot) : null;
  const p2 = activeTargetMatch ? getPlayer(activeTargetMatch.player2Slot) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="پیش‌بینی و کل‌کل مسابقات"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-emerald-950/90 border border-white/20 p-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-lg text-white">پیش‌بینی نتایج مسابقات</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prediction Form for Current User */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 mb-5">
          <span className="text-xs text-amber-300 font-bold block mb-2">
            پیش‌بینی مسابقه بعدی توسط «{currentUserName}»:
          </span>

          {unplayedMatches.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">همه بازی‌های این لیگ برگزار شده‌اند یا هنوز لیگی ایجاد نشده است.</p>
          ) : (
            <form onSubmit={handleSavePrediction} className="space-y-4">
              {/* Select Match */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1">انتخاب مسابقه برای پیش‌بینی:</label>
                <select
                  value={selectedMatchId || activeTargetMatch?.id}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                >
                  {unplayedMatches.map((m) => {
                    const pl1 = getPlayer(m.player1Slot);
                    const pl2 = getPlayer(m.player2Slot);
                    return (
                      <option key={m.id} value={m.id}>
                        هفته {m.round}: {pl1.name} ({pl1.team}) vs {pl2.name} ({pl2.team})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Match Visual & Winner selector */}
              {p1 && p2 && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-1 truncate">
                      <TeamLogo teamName={p1.team} className="w-4 h-4 shrink-0" />
                      <span className="font-bold truncate text-white">{p1.name}</span>
                    </div>
                    <span className="text-amber-400 font-mono font-black px-2">VS</span>
                    <div className="flex items-center justify-end gap-1.5 flex-1 truncate text-end">
                      <span className="font-bold truncate text-white">{p2.name}</span>
                      <TeamLogo teamName={p2.team} className="w-4 h-4 shrink-0" />
                    </div>
                  </div>

                  {/* Outcome choice buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetWinner('p1')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        predWinner === 'p1'
                          ? 'bg-emerald-500 text-black shadow-lg font-black'
                          : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                      }`}
                    >
                      برد {p1.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetWinner('draw')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        predWinner === 'draw'
                          ? 'bg-amber-400 text-black shadow-lg font-black'
                          : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                      }`}
                    >
                      نتیجه تساوی
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetWinner('p2')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        predWinner === 'p2'
                          ? 'bg-emerald-500 text-black shadow-lg font-black'
                          : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                      }`}
                    >
                      برد {p2.name}
                    </button>
                  </div>

                  {/* Menu-Based Exact Score Select */}
                  <div className="pt-3 border-t border-white/10 space-y-2.5">
                    <span className="text-xs text-zinc-300 font-bold block text-start">
                      انتخاب منویی نتیجه دقیق مسابقه:
                    </span>

                    {/* CASE 1: DRAW (ONLY equal scores selectable) */}
                    {predWinner === 'draw' && (
                      <div className="space-y-2.5 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-amber-300 font-bold shrink-0">
                            نتیجه تساوی (اعداد مساوی):
                          </label>
                          <select
                            value={score1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setScore1(val);
                              setScore2(val);
                            }}
                            className="flex-1 p-2 rounded-xl bg-black/60 border border-amber-400/50 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            {[0, 1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                تساوی {n} - {n}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quick pills for equal scores */}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {[0, 1, 2, 3, 4].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                setScore1(n);
                                setScore2(n);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                                score1 === n && score2 === n
                                  ? 'bg-amber-400 text-black shadow-lg font-black scale-105'
                                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                              }`}
                            >
                              {n} - {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CASE 2: TEAM 1 WIN (Team 1 score strictly higher than Team 2) */}
                    {predWinner === 'p1' && (
                      <div className="space-y-2.5 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-2 text-start">
                          <div>
                            <label className="text-[11px] text-emerald-400 font-bold block mb-1">
                              گل‌های {p1.name} (بالاتر):
                            </label>
                            <select
                              value={score1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setScore1(val);
                                if (score2 >= val) {
                                  setScore2(val - 1);
                                }
                              }}
                              className="w-full p-2 rounded-xl bg-black/60 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 font-bold block mb-1">
                              گل‌های {p2.name} (کمتر):
                            </label>
                            <select
                              value={score2}
                              onChange={(e) => setScore2(parseInt(e.target.value, 10))}
                              className="w-full p-2 rounded-xl bg-black/60 border border-white/20 text-zinc-200 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {Array.from({ length: score1 }, (_, i) => i).map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Quick pills for P1 win */}
                        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                          {[
                            [1, 0],
                            [2, 0],
                            [2, 1],
                            [3, 0],
                            [3, 1],
                            [3, 2],
                            [4, 1],
                            [4, 2],
                          ].map(([s1, s2]) => (
                            <button
                              key={`${s1}-${s2}`}
                              type="button"
                              onClick={() => {
                                setScore1(s1);
                                setScore2(s2);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                score1 === s1 && score2 === s2
                                  ? 'bg-emerald-500 text-black shadow-lg font-black scale-105'
                                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                              }`}
                            >
                              {s1} - {s2}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CASE 3: TEAM 2 WIN (Team 2 score strictly higher than Team 1) */}
                    {predWinner === 'p2' && (
                      <div className="space-y-2.5 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-2 text-start">
                          <div>
                            <label className="text-[11px] text-zinc-400 font-bold block mb-1">
                              گل‌های {p1.name} (کمتر):
                            </label>
                            <select
                              value={score1}
                              onChange={(e) => setScore1(parseInt(e.target.value, 10))}
                              className="w-full p-2 rounded-xl bg-black/60 border border-white/20 text-zinc-200 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {Array.from({ length: score2 }, (_, i) => i).map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-emerald-400 font-bold block mb-1">
                              گل‌های {p2.name} (بالاتر):
                            </label>
                            <select
                              value={score2}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setScore2(val);
                                if (score1 >= val) {
                                  setScore1(val - 1);
                                }
                              }}
                              className="w-full p-2 rounded-xl bg-black/60 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Quick pills for P2 win */}
                        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                          {[
                            [0, 1],
                            [0, 2],
                            [1, 2],
                            [0, 3],
                            [1, 3],
                            [2, 3],
                            [1, 4],
                            [2, 4],
                          ].map(([s1, s2]) => (
                            <button
                              key={`${s1}-${s2}`}
                              type="button"
                              onClick={() => {
                                setScore1(s1);
                                setScore2(s2);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                                score1 === s1 && score2 === s2
                                  ? 'bg-emerald-500 text-black shadow-lg font-black scale-105'
                                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                              }`}
                            >
                              {s1} - {s2}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 text-black font-black text-xs sm:text-sm shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>پیش‌بینی با موفقیت ثبت شد!</span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    <span>ثبت پیش‌بینی من</span>
                  </span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Prediction Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h4 className="font-black text-sm text-white">جدول پیش‌بینی‌کنندگان برتر دورهمی</h4>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-3">هنوز هیچ پیش‌بینی امتیازداری ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.name}
                  className={`p-3 rounded-2xl flex items-center justify-between text-xs ${
                    idx === 0
                      ? 'bg-amber-400/20 border border-amber-400/40 text-amber-200'
                      : 'bg-white/5 border border-white/5 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center font-mono font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-end">
                    <span className="text-[11px] text-zinc-400">
                      {item.correctExact} حدس دقیق • {item.correctOutcome} حدس برنده
                    </span>
                    <span className="font-mono font-black text-base text-amber-400">
                      {item.points} امتیاز
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
