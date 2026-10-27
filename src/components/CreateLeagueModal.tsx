import React, { useState } from 'react';
import { Trophy, Swords, X, Shuffle, CheckCircle2, ChevronRight, ShieldAlert, Ban, Star, Dices, FastForward, Disc } from 'lucide-react';
import { CompetitionMode, ActiveLeague, LeaguePlayer } from '../types/league';
import { generateFixtures } from '../utils/fixtureGenerator';
import { soundEngine } from '../utils/soundEffects';
import { DEFAULT_FIXED_PLAYERS } from '../types/player';
import { TEAMS_DATABASE } from '../data/teams';
import { TeamLogo } from './TeamLogo';
import { PlayerPickBan } from './PickBanModal';

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [leagueName, setLeagueName] = useState('لیگ برتر دوستان');
  const [mode, setMode] = useState<CompetitionMode>('league');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawFinished, setDrawFinished] = useState(false);

  // Pick & Ban state for creation wizard
  const [picksBans, setPicksBans] = useState<Record<string, PlayerPickBan>>(() => {
    try {
      const raw = localStorage.getItem('efootball_pick_ban');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [selectedPlayerForPickBan, setSelectedPlayerForPickBan] = useState<string>(
    DEFAULT_FIXED_PLAYERS[0]?.name || 'آرتا'
  );
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('all');

  if (!isOpen) return null;

  const handleStartDraw = () => {
    soundEngine.playClick();
    setStep(4);
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
    // Generate initial placeholder slots
    const initialPlayers: LeaguePlayer[] = Array.from({ length: playerCount }, (_, i) => ({
      slot: i + 1,
      name: undefined, // Empty placeholder until spun on wheel
      team: undefined,
    }));

    const fixtures = generateFixtures(playerCount, mode);

    const newLeague: ActiveLeague = {
      id: Date.now().toString(),
      name: leagueName.trim() || (mode === 'cup' ? 'جام حذفی دوستان' : 'لیگ دوستانه'),
      mode,
      playerCount,
      players: initialPlayers,
      matches: fixtures,
      wheelCompleted: false,
      isFinished: false,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    // Save pick/ban configuration
    try {
      localStorage.setItem('efootball_pick_ban', JSON.stringify(picksBans));
    } catch {
      // ignore
    }

    onLeagueCreated(newLeague);
    onClose();
  };

  // Toggle ban for active player in wizard
  const handleToggleBan = (teamName: string) => {
    soundEngine.playClick();
    const current = picksBans[selectedPlayerForPickBan] || {
      playerName: selectedPlayerForPickBan,
      pickedTeams: [],
    };
    const nextBanned = current.bannedTeam === teamName ? undefined : teamName;
    const nextPicked = current.pickedTeams.filter((t) => t !== teamName);

    setPicksBans({
      ...picksBans,
      [selectedPlayerForPickBan]: {
        ...current,
        bannedTeam: nextBanned,
        pickedTeams: nextPicked,
      },
    });
  };

  // Toggle pick for active player in wizard
  const handleTogglePick = (teamName: string) => {
    soundEngine.playClick();
    const current = picksBans[selectedPlayerForPickBan] || {
      playerName: selectedPlayerForPickBan,
      pickedTeams: [],
    };
    const isPicked = current.pickedTeams.includes(teamName);
    let nextPicked = [...current.pickedTeams];

    if (isPicked) {
      nextPicked = nextPicked.filter((t) => t !== teamName);
    } else {
      if (nextPicked.length >= 2) {
        nextPicked.shift();
      }
      nextPicked.push(teamName);
    }

    const nextBanned = current.bannedTeam === teamName ? undefined : current.bannedTeam;

    setPicksBans({
      ...picksBans,
      [selectedPlayerForPickBan]: {
        ...current,
        bannedTeam: nextBanned,
        pickedTeams: nextPicked,
      },
    });
  };

  const currentPlayerPickBan = picksBans[selectedPlayerForPickBan] || {
    playerName: selectedPlayerForPickBan,
    pickedTeams: [],
  };

  const filteredTeams = TEAMS_DATABASE.filter((t) => {
    const q = teamSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.enName.toLowerCase().includes(q);
    const matchesLeague =
      selectedLeagueFilter === 'all' || t.league === selectedLeagueFilter;
    return matchesSearch && matchesLeague;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      style={{
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        paddingBottom: 'max(6rem, calc(env(safe-area-inset-bottom, 0px) + 6rem))',
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl p-6 bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">راه‌اندازی مسابقات جدید</h3>
              <span className="text-xs text-emerald-400 font-medium">مرحله {step} از ۴</span>
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
                placeholder="مثلاً: لیگ یا جام دوستانه"
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
                  <span className="text-xs text-zinc-300 block mt-0.5">مسابقات تک‌حذفی</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!leagueName.trim()}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm sm:text-base shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
              <label className="block text-sm text-zinc-200 mb-2 font-semibold">تعداد بازیکنان حاضر در رقابت</label>
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
                <span>ساختار مسابقات:</span>
                <span className="font-bold text-emerald-400 font-mono text-base">
                  {mode === 'league' ? `${playerCount * (playerCount - 1)} مسابقه رفت و برگشت` : 'مسابقات حذفی'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-bold text-sm cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm sm:text-base shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>مرحله بعد: پیک و بن تیم‌ها (اختیاری)</span>
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pick & Ban Stage (Before Wheel) */}
        {step === 3 && (
          <div className="mt-4 space-y-3.5 animate-fadeIn">
            <div className="text-start">
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>مرحله بن و پیک تیم‌ها (اختیاری)</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                هر بازیکن می‌تواند ۱ تیم را مسدود کند تا در چرخونه نیفتد و تا ۲ تیم را به عنوان انتخاب محبوب مشخص کند.
              </p>
            </div>

            {/* Players Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {DEFAULT_FIXED_PLAYERS.map((pl) => {
                const isSelected = selectedPlayerForPickBan === pl.name;
                const plData = picksBans[pl.name];
                const hasBan = !!plData?.bannedTeam;
                const hasPicks = (plData?.pickedTeams?.length || 0) > 0;

                return (
                  <button
                    key={pl.name}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedPlayerForPickBan(pl.name);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                        : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <span>{pl.name}</span>
                    {hasBan && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    {hasPicks && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Active Player Status Summary */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">بازیکن منتخب:</span>
                <span className="font-bold text-amber-300">{selectedPlayerForPickBan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-300">تیم بن شده (۱ تیم):</span>
                <span className="font-bold text-rose-400">
                  {currentPlayerPickBan.bannedTeam || 'بدون بن'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300">تیم‌های پیک محبوب (تا ۲ تیم):</span>
                <span className="font-bold text-emerald-400">
                  {currentPlayerPickBan.pickedTeams.length > 0
                    ? currentPlayerPickBan.pickedTeams.join('، ')
                    : 'بدون انتخاب'}
                </span>
              </div>
            </div>

            {/* Team Search & League Filters */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="جستجوی سریع تیم (مثلاً: رئال، بارسا، منچستر، بایرن...)"
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />

              {/* League Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: `همه تیم‌ها (${TEAMS_DATABASE.length})` },
                  { id: 'انگلیس', label: 'انگلیس' },
                  { id: 'اسپانیا', label: 'اسپانیا' },
                  { id: 'آلمان', label: 'آلمان' },
                  { id: 'ایتالیا', label: 'ایتالیا' },
                  { id: 'فرانسه', label: 'فرانسه' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedLeagueFilter(item.id);
                    }}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                      selectedLeagueFilter === item.id
                        ? 'bg-emerald-500 text-black shadow'
                        : 'bg-white/10 text-zinc-300 hover:bg-white/15'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {filteredTeams.map((t) => {
                const isBanned = currentPlayerPickBan.bannedTeam === t.name;
                const isPicked = currentPlayerPickBan.pickedTeams.includes(t.name);

                return (
                  <div
                    key={t.id}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-1 text-xs transition-all ${
                      isBanned
                        ? 'bg-rose-950/40 border-rose-500/50'
                        : isPicked
                        ? 'bg-emerald-950/40 border-emerald-400/50'
                        : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <TeamLogo teamName={t.name} className="w-5 h-5 shrink-0" />
                      <span className="truncate text-white font-medium">{t.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="بن کردن این تیم"
                        onClick={() => handleToggleBan(t.name)}
                        className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center ${
                          isBanned
                            ? 'bg-rose-500 text-white shadow'
                            : 'bg-white/5 hover:bg-rose-500/30 text-rose-300'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="پیک و اولویت این تیم"
                        onClick={() => handleTogglePick(t.name)}
                        className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center ${
                          isPicked
                            ? 'bg-emerald-500 text-black shadow'
                            : 'bg-white/5 hover:bg-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions for Step 3 */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-bold text-xs cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={handleStartDraw}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <span>رد شدن</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleStartDraw}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-xs sm:text-sm shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                <span>تأیید و شروع قرعه‌کشی</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Draw Animation & Finalize */}
        {step === 4 && (
          <div className="mt-4 space-y-4 text-center animate-fadeIn">
            {isDrawing ? (
              <div className="py-8 space-y-4">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                  <Shuffle className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">در حال قرعه‌کشی مسابقات...</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    {mode === 'cup'
                      ? 'چیدمان مسابقات در جام حذفی'
                      : 'تخصیص مسابقات رفت و برگشت به اسلات‌های بازیکنان'}
                  </p>
                </div>
              </div>
            ) : drawFinished ? (
              <div className="py-4 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">قرعه‌کشی با موفقیت انجام شد!</h4>
                  <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                    {mode === 'cup'
                      ? 'مسابقات جام حذفی تنظیم شد. اکنون وارد چرخونه شوید تا تیم‌ها و بازیکنان را مشخص کنید.'
                      : 'بازی‌های رفت و برگشت ثبت شدند. اکنون وارد چرخونه شوید تا اسامی و تیم‌ها را بچرخانید.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFinalize}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black font-extrabold text-sm sm:text-base shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Disc className="w-4 h-4" />
                  <span>تأیید و ورود به چرخونه انتخاب تیم‌ها</span>
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
