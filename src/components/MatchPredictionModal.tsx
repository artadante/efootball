import React, { useState } from 'react';
import { X, Target, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { ScheduledMatch, LeaguePlayer } from '../types/league';
import { RegisteredPlayer } from '../types/player';
import { TeamLogo } from './TeamLogo';
import { soundEngine } from '../utils/soundEffects';

export interface MatchPredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: ScheduledMatch[];
  players: LeaguePlayer[];
  currentUserName?: string;
  activeUser?: RegisteredPlayer | null;
  registeredPlayers?: RegisteredPlayer[];
  onSelectActiveUser?: (player: RegisteredPlayer | null) => void;
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
  activeUser,
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
  const [authError, setAuthError] = useState<string>('');

  if (!isOpen) return null;

  // Determine if logged in: must have a chosen activeUser or a designated non-guest name
  const isLoggedIn = Boolean(
    (activeUser && activeUser.name) ||
    (currentUserName && currentUserName !== 'کاربر مهمان')
  );
  const effectiveUserName = activeUser?.name || (currentUserName !== 'کاربر مهمان' ? currentUserName : '') || '';

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

    if (!isLoggedIn || !effectiveUserName) {
      soundEngine.playWhistle();
      setAuthError('خطا: برای ثبت پیش‌بینی، ابتدا از بالای صفحه اصلی وارد حساب کاربری خود شوید.');
      return;
    }

    setAuthError('');
    const targetMatchId = selectedMatchId || activeTargetMatch?.id;
    if (!targetMatchId) return;

    // Strict validation
    if (predWinner === 'p1' && score1 <= score2) return;
    if (predWinner === 'p2' && score2 <= score1) return;
    if (predWinner === 'draw' && score1 !== score2) return;

    soundEngine.playClick();

    const newPred: StoredPrediction = {
      matchId: targetMatchId,
      userName: effectiveUserName,
      predictedWinner: predWinner,
      score1,
      score2,
    };

    const updated = predictions.filter(
      (p) => !(p.matchId === targetMatchId && p.userName === effectiveUserName)
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-6 bg-black/75 backdrop-blur-md animate-fadeIn overflow-hidden"
    >
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto rounded-2xl sm:rounded-3xl bg-[#061f0e]/95 border border-white/20 p-3.5 sm:p-5 text-white shadow-2xl max-h-[74vh] sm:max-h-[80vh] overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-black text-sm sm:text-base text-white truncate">پیش‌بینی نتایج مسابقات</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prediction Form for Current User */}
        <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/10 mb-4">
          {!isLoggedIn ? (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs font-bold flex flex-col gap-1.5 mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-black text-white">خطا: ورود به حساب کاربری الزامی است!</span>
              </div>
              <p className="text-[11px] text-rose-200/90 font-normal leading-relaxed">
                برای ثبت پیش‌بینی مسابقات، ابتدا باید وارد حساب کاربری خود شوید. لطفاً از بالای صفحه اصلی روی آیکون پروفایل بزنید و نام خود را انتخاب کنید.
              </p>
            </div>
          ) : (
            <span className="text-xs text-amber-300 font-bold block mb-2 truncate">
              پیش‌بینی مسابقه بعدی توسط «{effectiveUserName}»:
            </span>
          )}

          {authError && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{authError}</span>
            </div>
          )}

          {unplayedMatches.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">همه بازی‌های این لیگ برگزار شده‌اند یا هنوز لیگی ایجاد نشده است.</p>
          ) : (
            <form onSubmit={handleSavePrediction} className="space-y-3">
              {/* Select Match */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">انتخاب مسابقه برای پیش‌بینی:</label>
                <select
                  value={selectedMatchId || activeTargetMatch?.id}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full max-w-full p-2 rounded-xl bg-black/60 border border-white/15 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 cursor-pointer truncate"
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
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-2.5">
                  <div className="flex items-center justify-between text-xs gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                      <TeamLogo teamName={p1.team} className="w-4 h-4 shrink-0" />
                      <span className="font-bold truncate text-white text-[11px] sm:text-xs">{p1.name}</span>
                    </div>
                    <span className="text-amber-400 font-mono font-black px-1.5 text-xs shrink-0">VS</span>
                    <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 truncate text-end">
                      <span className="font-bold truncate text-white text-[11px] sm:text-xs">{p2.name}</span>
                      <TeamLogo teamName={p2.team} className="w-4 h-4 shrink-0" />
                    </div>
                  </div>

                  {/* Outcome choice buttons */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetWinner('p1')}
                      className={`py-1.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
                        predWinner === 'p1'
                          ? 'bg-emerald-500 text-black shadow-md font-black'
                          : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                      }`}
                    >
                      برد {p1.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetWinner('draw')}
                      className={`py-1.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
                        predWinner === 'draw'
                          ? 'bg-amber-400 text-black shadow-md font-black'
                          : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                      }`}
                    >
                      نتیجه تساوی
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetWinner('p2')}
                      className={`py-1.5 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
                        predWinner === 'p2'
                          ? 'bg-emerald-500 text-black shadow-md font-black'
                          : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                      }`}
                    >
                      برد {p2.name}
                    </button>
                  </div>

                  {/* Menu-Based Exact Score Select */}
                  <div className="pt-2.5 border-t border-white/10 space-y-2">
                    <span className="text-[11px] text-zinc-300 font-bold block text-start">
                      انتخاب منویی نتیجه دقیق مسابقه:
                    </span>

                    {/* CASE 1: DRAW (Up to 10-10) */}
                    {predWinner === 'draw' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] sm:text-xs text-amber-300 font-bold shrink-0">
                            نتیجه تساوی (۱-۱، ۲-۲، ۳-۳):
                          </label>
                          <select
                            value={score1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setScore1(val);
                              setScore2(val);
                            }}
                            className="w-28 sm:w-32 p-1.5 rounded-xl bg-black/60 border border-amber-400/50 text-amber-300 font-mono font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                              <option key={n} value={n}>
                                تساوی {n} - {n}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quick pills for equal scores up to 10 */}
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                setScore1(n);
                                setScore2(n);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                score1 === n && score2 === n
                                  ? 'bg-amber-400 text-black shadow font-black scale-105'
                                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                              }`}
                            >
                              {n} - {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CASE 2: TEAM 1 WIN (Both sides up to 10 goals) */}
                    {predWinner === 'p1' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-2 text-start">
                          <div>
                            <label className="text-[11px] text-emerald-400 font-bold block mb-1 truncate">
                              گل‌های {p1.name} (بالاتر):
                            </label>
                            <select
                              value={score1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setScore1(val);
                                if (score2 >= val) {
                                  setScore2(Math.max(0, val - 1));
                                }
                              }}
                              className="w-full p-1.5 rounded-xl bg-black/60 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-zinc-400 font-bold block mb-1 truncate">
                              گل‌های {p2.name} (کمتر):
                            </label>
                            <select
                              value={score2}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setScore2(val);
                                if (val >= score1) {
                                  setScore1(Math.min(10, val + 1));
                                }
                              }}
                              className="w-full p-1.5 rounded-xl bg-black/60 border border-white/20 text-zinc-200 font-mono font-bold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Quick pills for P1 win */}
                        <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
                          {[
                            [1, 0],
                            [2, 0],
                            [2, 1],
                            [3, 0],
                            [3, 1],
                            [3, 2],
                            [4, 1],
                            [4, 2],
                            [5, 1],
                            [5, 2],
                          ].map(([s1, s2]) => (
                            <button
                              key={`${s1}-${s2}`}
                              type="button"
                              onClick={() => {
                                setScore1(s1);
                                setScore2(s2);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                score1 === s1 && score2 === s2
                                  ? 'bg-emerald-500 text-black shadow font-black scale-105'
                                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                              }`}
                            >
                              {s1} - {s2}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CASE 3: TEAM 2 WIN (Both sides up to 10 goals) */}
                    {predWinner === 'p2' && (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-2 text-start">
                          <div>
                            <label className="text-[11px] text-zinc-400 font-bold block mb-1 truncate">
                              گل‌های {p1.name} (کمتر):
                            </label>
                            <select
                              value={score1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setScore1(val);
                                if (val >= score2) {
                                  setScore2(Math.min(10, val + 1));
                                }
                              }}
                              className="w-full p-1.5 rounded-xl bg-black/60 border border-white/20 text-zinc-200 font-mono font-bold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-emerald-400 font-bold block mb-1 truncate">
                              گل‌های {p2.name} (بالاتر):
                            </label>
                            <select
                              value={score2}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setScore2(val);
                                if (score1 >= val) {
                                  setScore1(Math.max(0, val - 1));
                                }
                              }}
                              className="w-full p-1.5 rounded-xl bg-black/60 border border-emerald-400/50 text-emerald-300 font-mono font-bold text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                            >
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                  {n} گل
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Quick pills for P2 win */}
                        <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
                          {[
                            [0, 1],
                            [0, 2],
                            [1, 2],
                            [0, 3],
                            [1, 3],
                            [2, 3],
                            [1, 4],
                            [2, 4],
                            [1, 5],
                            [2, 5],
                          ].map(([s1, s2]) => (
                            <button
                              key={`${s1}-${s2}`}
                              type="button"
                              onClick={() => {
                                setScore1(s1);
                                setScore2(s2);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                score1 === s1 && score2 === s2
                                  ? 'bg-emerald-500 text-black shadow font-black scale-105'
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
                disabled={!isLoggedIn}
                className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm shadow transition-all flex items-center justify-center gap-1.5 ${
                  !isLoggedIn
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-emerald-500 to-green-400 text-black hover:brightness-110 active:scale-95 cursor-pointer'
                }`}
              >
                {!isLoggedIn ? (
                  <span className="flex items-center gap-1.5 text-rose-400 text-[11px] sm:text-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>برای پیش‌بینی، ابتدا از صفحه اصلی وارد حساب خود شوید</span>
                  </span>
                ) : savedSuccess ? (
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
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="font-black text-xs sm:text-sm text-white">جدول پیش‌بینی‌کنندگان برتر دورهمی</h4>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-2.5">هنوز هیچ پیش‌بینی امتیازداری ثبت نشده است.</p>
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.name}
                  className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-between text-xs gap-2 ${
                    idx === 0
                      ? 'bg-amber-400/20 border border-amber-400/40 text-amber-200'
                      : 'bg-white/5 border border-white/5 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-xs truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-end shrink-0">
                    <span className="text-[10px] text-zinc-400 hidden xs:inline">
                      {item.correctExact} دقیق • {item.correctOutcome} برنده
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-amber-400 shrink-0">
                      {item.points} امت
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
