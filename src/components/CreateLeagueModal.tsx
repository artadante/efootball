import React, { useState } from 'react';
import { Trophy, Swords, X, Shuffle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { CompetitionMode, ActiveLeague, LeaguePlayer } from '../types/league';
import { generateFixtures } from '../utils/fixtureGenerator';
import { soundEngine } from '../utils/soundEffects';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeagueCreated: (league: ActiveLeague) => void;
}

export const CreateLeagueModal: React.FC<CreateLeagueModalProps> = ({
  isOpen,
  onClose,
  onLeagueCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [leagueName, setLeagueName] = useState('لیگ برتر دوستان');
  const [mode, setMode] = useState<CompetitionMode>('league');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawFinished, setDrawFinished] = useState(false);

  if (!isOpen) return null;

  const handleStartDraw = () => {
    soundEngine.playClick();
    setStep(3);
    setIsDrawing(true);
    setDrawFinished(false);

    let tick = 0;
    const interval = setInterval(() => {
      soundEngine.playWheelTick(1);
      tick++;
      if (tick > 15) clearInterval(interval);
    }, 140);

    // Simulate exciting animated draw
    setTimeout(() => {
      setIsDrawing(false);
      setDrawFinished(true);
      soundEngine.playWheelWin();
    }, 2400);
  };

  const handleFinalize = () => {
    // Generate initial placeholder slots: بازیکن ۱, بازیکن ۲...
    const initialPlayers: LeaguePlayer[] = Array.from({ length: playerCount }, (_, i) => ({
      slot: i + 1,
      name: undefined, // Empty placeholder until spun on wheel
      team: undefined,
    }));

    const fixtures = generateFixtures(playerCount, mode);

    const newLeague: ActiveLeague = {
      id: Date.now().toString(),
      name: leagueName.trim() || 'لیگ دوستانه',
      mode,
      playerCount,
      players: initialPlayers,
      matches: fixtures,
      wheelCompleted: false,
      isFinished: false,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    onLeagueCreated(newLeague);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">راه‌اندازی مسابقات جدید</h3>
              <span className="text-xs text-emerald-400 font-medium">مرحله {step} از ۳</span>
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

        {/* STEP 1: Name & Mode */}
        {step === 1 && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm text-zinc-200 mb-1.5 font-semibold">نام لیگ یا مسابقات</label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="مثلاً: لیگ تابستانه دوستان"
                className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/15 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-200 mb-2 font-semibold">حالت برگزاری (Mode)</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMode('league')}
                  className={`p-3 rounded-2xl border text-start transition-all ${
                    mode === 'league'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Trophy className={`w-5 h-5 mb-1.5 ${mode === 'league' ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span className="block text-sm font-bold text-white">۱. لیگ عادی فوتبال</span>
                  <span className="text-xs text-zinc-300 block mt-0.5">دو نیم‌فصل رفت و برگشت</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('cup')}
                  className={`p-3 rounded-2xl border text-start transition-all ${
                    mode === 'cup'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Swords className={`w-5 h-5 mb-1.5 ${mode === 'cup' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="block text-sm font-bold text-white">۲. جام حذفی</span>
                  <span className="text-xs text-zinc-300 block mt-0.5">تک‌حذفی و صعود مرحله‌ای</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!leagueName.trim()}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm sm:text-base shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>مرحله بعد: تعداد بازیکنان</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* STEP 2: Number of players */}
        {step === 2 && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm text-zinc-200 mb-2 font-semibold">تعداد بازیکنان حاضر در لیگ</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[4, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPlayerCount(num)}
                    className={`py-3 rounded-xl font-bold text-base border transition-all ${
                      playerCount === num
                        ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                        : 'bg-black/40 border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    {num} نفر
                  </button>
                ))}
              </div>

              {/* Custom count input */}
              <div className="mt-3">
                <span className="text-xs text-zinc-300 mb-1 block font-medium">یا تعداد دلخواه وارد کنید:</span>
                <input
                  type="number"
                  min="2"
                  max="32"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Math.max(2, Number(e.target.value)))}
                  className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/15 text-base text-center font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-zinc-200 space-y-1.5">
              <div className="flex justify-between">
                <span>تعداد کل بازی‌های لیگ:</span>
                <span className="font-bold text-emerald-400 font-mono text-base">
                  {mode === 'league' ? playerCount * (playerCount - 1) : playerCount - 1} مسابقه
                </span>
              </div>
              {mode === 'league' && (
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>ساختار:</span>
                  <span>نیم‌فصل اول (رفت) + نیم‌فصل دوم (برگشت)</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-bold text-sm"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={handleStartDraw}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm sm:text-base shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Shuffle className="w-4 h-4" />
                <span>شروع قرعه‌کشی با انیمیشن 🎲</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Draw Animation */}
        {step === 3 && (
          <div className="mt-4 space-y-4 text-center animate-fadeIn">
            {isDrawing ? (
              <div className="py-8 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                  <Shuffle className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">در حال قرعه‌کشی مسابقات...</h4>
                  <p className="text-xs text-zinc-400 mt-1">تخصیص مسابقات رفت و برگشت به اسلات‌های بازیکنان</p>
                </div>
              </div>
            ) : drawFinished ? (
              <div className="py-4 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">قرعه‌کشی با موفقیت انجام شد! 🎉</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    بازی‌های نیم‌فصل اول و دوم مشخص شدند. حالا به صفحه چرخونه بروید تا اسامی و تیم‌ها را بچرخانید!
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs sm:text-sm text-start space-y-1.5 max-h-36 overflow-y-auto no-scrollbar font-mono">
                  <div className="text-xs text-amber-300 font-bold font-sans">پیش‌نمایش قرعه‌کشی (اسلات‌های خالی):</div>
                  {Array.from({ length: Math.min(3, playerCount / 2) }).map((_, i) => (
                    <div key={i} className="text-zinc-200 flex justify-between border-b border-white/5 py-1">
                      <span>بازیکن {i + 1} (تیم نامشخص)</span>
                      <span className="text-emerald-400 font-bold">VS</span>
                      <span>بازیکن {playerCount - i} (تیم نامشخص)</span>
                    </div>
                  ))}
                  <div className="text-xs text-zinc-400 text-center font-sans">
                    + و تمام بازی‌های رفت و برگشت لیگ
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinalize}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black font-extrabold text-sm sm:text-base shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تایید و رفتن به چرخونه انتخاب تیم‌ها 🎡</span>
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
