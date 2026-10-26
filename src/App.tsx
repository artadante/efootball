import React, { useState } from 'react';
import { PitchBackground } from './components/PitchBackground';
import { LiquidBottomNav, TabType } from './components/LiquidBottomNav';
import { ProfileButton } from './components/ProfileButton';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Calendar, 
  Sparkles, 
  Smartphone, 
  X, 
  Medal
} from 'lucide-react';

interface StandingRow {
  rank: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface MatchRecord {
  id: string;
  player1: string;
  team1: string;
  score1: number;
  score2: number;
  player2: string;
  team2: string;
  date: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('league');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPwaTip, setShowPwaTip] = useState(true);

  // Friendly league mock data
  const [standings, setStandings] = useState<StandingRow[]>([
    { rank: 1, name: 'علی', played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 14, goalsAgainst: 6, points: 15 },
    { rank: 2, name: 'رضا', played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 12, goalsAgainst: 7, points: 13 },
    { rank: 3, name: 'آرش', played: 6, won: 2, drawn: 2, lost: 2, goalsFor: 9, goalsAgainst: 9, points: 8 },
    { rank: 4, name: 'مهدی', played: 6, won: 1, drawn: 1, lost: 4, goalsFor: 6, goalsAgainst: 13, points: 4 },
    { rank: 5, name: 'سجاد', played: 6, won: 0, drawn: 2, lost: 4, goalsFor: 5, goalsAgainst: 11, points: 2 },
  ]);

  const [matches, setMatches] = useState<MatchRecord[]>([
    { id: '1', player1: 'علی', team1: 'رئال مادرید', score1: 3, score2: 1, player2: 'مهدی', team2: 'آرسنال', date: 'دیشب' },
    { id: '2', player1: 'رضا', team1: 'منچسترسیتی', score1: 2, score2: 2, player2: 'آرش', team2: 'بارسلونا', date: '۲ روز پیش' },
    { id: '3', player1: 'علی', team1: 'اینتر', score1: 4, score2: 0, player2: 'سجاد', team2: 'بایرن مونیخ', date: '۳ روز پیش' },
  ]);

  // Lucky wheel state
  const teamsWheel = [
    'رئال مادرید 🇪🇸',
    'منچسترسیتی 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'بارسلونا 🇪🇸',
    'بایرن مونیخ 🇩🇪',
    'آرسنال 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'اینتر میلان 🇮🇹',
    'پاری سن ژرمن 🇫🇷',
    'لیورپول 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ];
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [selectedWheelPrize, setSelectedWheelPrize] = useState<string | null>(null);

  // New match form state
  const [p1, setP1] = useState('علی');
  const [p2, setP2] = useState('رضا');
  const [s1, setS1] = useState(2);
  const [s2, setS2] = useState(1);

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedWheelPrize(null);

    const randomRotations = 5 + Math.floor(Math.random() * 5); // 5 to 9 rotations
    const randomExtraDegrees = Math.floor(Math.random() * 360);
    const newAngle = wheelAngle + randomRotations * 360 + randomExtraDegrees;

    setWheelAngle(newAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedDegree = (360 - (newAngle % 360)) % 360;
      const segmentSize = 360 / teamsWheel.length;
      const index = Math.floor(normalizedDegree / segmentSize);
      setSelectedWheelPrize(teamsWheel[index]);
    }, 3200);
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1 === p2) {
      alert('لطفاً دو بازیکن متفاوت انتخاب کنید.');
      return;
    }

    const newRecord: MatchRecord = {
      id: Date.now().toString(),
      player1: p1,
      team1: 'انتخابی',
      score1: Number(s1),
      score2: Number(s2),
      player2: p2,
      team2: 'انتخابی',
      date: 'هم‌اکنون',
    };

    setMatches([newRecord, ...matches]);

    // Update standings simply
    setStandings(prev => {
      return prev.map(row => {
        if (row.name === p1) {
          const won = s1 > s2 ? 1 : 0;
          const drawn = s1 === s2 ? 1 : 0;
          const lost = s1 < s2 ? 1 : 0;
          const points = won ? 3 : drawn ? 1 : 0;
          return {
            ...row,
            played: row.played + 1,
            won: row.won + won,
            drawn: row.drawn + drawn,
            lost: row.lost + lost,
            goalsFor: row.goalsFor + s1,
            goalsAgainst: row.goalsAgainst + s2,
            points: row.points + points,
          };
        }
        if (row.name === p2) {
          const won = s2 > s1 ? 1 : 0;
          const drawn = s1 === s2 ? 1 : 0;
          const lost = s2 < s1 ? 1 : 0;
          const points = won ? 3 : drawn ? 1 : 0;
          return {
            ...row,
            played: row.played + 1,
            won: row.won + won,
            drawn: row.drawn + drawn,
            lost: row.lost + lost,
            goalsFor: row.goalsFor + s2,
            goalsAgainst: row.goalsAgainst + s1,
            points: row.points + points,
          };
        }
        return row;
      }).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#041308] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* 1. Football Pitch Visual Background */}
      <PitchBackground />

      {/* Main Container - Mobile Centered Shell */}
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col px-4 pt-4 pb-28">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2">
          {/* Circular Profile Button at corner */}
          <ProfileButton userName="علی رضایی" rating={1420} favoriteTeam="رئال مادرید" />

          {/* Center Title Badge */}
          <div className="text-center">
            <h1 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 drop-shadow-[0_2px_10px_rgba(34,197,94,0.3)]">
              لیگ eFootball
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/90 font-medium mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>فصل دوستانه ۱۴۰۵</span>
            </div>
          </div>

          {/* League Icon Tag */}
          <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.15)]">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
        </header>

        {/* PWA "Add to Home Screen" Helper Banner */}
        {showPwaTip && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20 backdrop-blur-xl flex items-center justify-between text-xs text-emerald-200/90 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">نصب مثل اپلیکیشن موبایل</p>
                <p className="text-[11px] text-emerald-300/70">در مرورگر گزینه Add to Home Screen را بزنید</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPwaTip(false)}
              aria-label="بستن راهنما"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Views Content based on active tab */}
        <main className="mt-4 flex-1">
          {/* TAB 1: LEAGUE TABLE & STANDINGS */}
          {activeTab === 'league' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Leader Highlight Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-black/60 border border-emerald-500/25 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.15)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      <Crown className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">صدرنشین فعلی</span>
                      <h2 className="text-lg font-extrabold text-white">{standings[0]?.name}</h2>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-2xl font-black text-emerald-400">{standings[0]?.points}</span>
                    <span className="text-xs text-zinc-400 block font-medium">امتیاز</span>
                  </div>
                </div>

                {/* Quick League Stats Bar */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">تعداد دوستان</span>
                    <span className="font-bold text-white text-sm">۵ نفر</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">بازی انجام‌شده</span>
                    <span className="font-bold text-white text-sm">{matches.length} بازی</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">مجموع گل‌ها</span>
                    <span className="font-bold text-emerald-400 text-sm">۴۶ گل</span>
                  </div>
                </div>
              </div>

              {/* Standings Table Card */}
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <Medal className="w-4 h-4 text-emerald-400" />
                    <span>جدول رده‌بندی لیگ</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400">فصل اول</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="text-zinc-400 border-b border-white/10 pb-2 font-medium">
                        <th className="py-2 text-start px-2">#</th>
                        <th className="py-2 text-start">بازیکن</th>
                        <th className="py-2">بازی</th>
                        <th className="py-2">برد</th>
                        <th className="py-2">تفاضل</th>
                        <th className="py-2 font-bold text-emerald-400">امتیاز</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {standings.map((row) => (
                        <tr
                          key={row.name}
                          className={`hover:bg-white/5 transition-colors ${
                            row.rank === 1 ? 'bg-emerald-500/10' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-start font-bold">
                            {row.rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[11px]">
                                ۱
                              </span>
                            ) : (
                              <span className="text-zinc-400">{row.rank}</span>
                            )}
                          </td>
                          <td className="py-3 text-start font-bold text-white flex items-center gap-2">
                            <span>{row.name}</span>
                          </td>
                          <td className="py-3 text-zinc-300">{row.played}</td>
                          <td className="py-3 text-zinc-300">{row.won}</td>
                          <td className="py-3 font-mono text-[11px] text-zinc-300 dir-ltr">
                            {row.goalsFor - row.goalsAgainst > 0 ? `+${row.goalsFor - row.goalsAgainst}` : row.goalsFor - row.goalsAgainst}
                          </td>
                          <td className="py-3 font-extrabold text-sm text-emerald-400">
                            {row.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upcoming Feature Match Announcement */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white">بازی حساس بعدی:</span>
                    <span className="text-zinc-300 mr-1.5">علی مقابل رضا</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  امشب ساعت ۲۲:۳۰
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: LUCKY WHEEL (چرخونه) */}
          {activeTab === 'wheel' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl bg-emerald-950/60 border border-white/15 backdrop-blur-2xl shadow-xl text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">چرخونه شانس و انتخاب تیم</h3>
                </div>
                <p className="text-xs text-zinc-300">
                  قبل از شروع هر بازی برای انتخاب رندوم تیم یا جریمه چرخونه رو بچرخونید!
                </p>

                {/* Graphical Wheel Canvas Simulation */}
                <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
                  {/* Top Pointer Indicator */}
                  <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />

                  {/* Rotating Wheel Circle */}
                  <div
                    className="relative w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_35px_rgba(34,197,94,0.4)] overflow-hidden transition-all duration-[3200ms] ease-out flex items-center justify-center"
                    style={{
                      transform: `rotate(${wheelAngle}deg)`,
                      background: 'conic-gradient(#064e3b 0deg 45deg, #022c22 45deg 90deg, #065f46 90deg 135deg, #047857 135deg 180deg, #064e3b 180deg 225deg, #022c22 225deg 270deg, #065f46 270deg 315deg, #047857 315deg 360deg)',
                    }}
                  >
                    {/* Wheel Center Button */}
                    <div className="absolute z-20 w-14 h-14 rounded-full bg-emerald-950 border-2 border-amber-400 flex items-center justify-center shadow-lg text-amber-400 font-black text-xs">
                      eFootball
                    </div>

                    {/* Team labels placed radially */}
                    {teamsWheel.map((team, idx) => {
                      const angle = idx * 45 + 22.5;
                      return (
                        <div
                          key={team}
                          className="absolute text-[10px] font-bold text-emerald-100 select-none text-center truncate max-w-[85px]"
                          style={{
                            transform: `rotate(${angle}deg) translate(80px) rotate(90deg)`,
                          }}
                        >
                          {team.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Result Announcement */}
                {selectedWheelPrize && (
                  <div className="p-3 mb-4 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 text-sm font-extrabold animate-bounce">
                    🎉 تیم انتخاب‌شده: {selectedWheelPrize}
                  </div>
                )}

                {/* Spin Button */}
                <button
                  type="button"
                  onClick={handleSpinWheel}
                  disabled={isSpinning}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black font-extrabold text-sm shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isSpinning ? 'در حال چرخیدن...' : 'بچرخون! 🎡'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MATCH HISTORY (تاریخچه) */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm text-emerald-300">
                  تاریخچه مسابقات ثبت‌شده ({matches.length})
                </h3>
                <span className="text-xs text-zinc-400">آخرین نتایج</span>
              </div>

              {matches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-emerald-950/60 border border-white/10 backdrop-blur-xl shadow-lg flex items-center justify-between hover:border-emerald-500/30 transition-all"
                >
                  {/* Player 1 */}
                  <div className="flex-1 text-center">
                    <span className="block font-bold text-sm text-white">{m.player1}</span>
                    <span className="text-[10px] text-zinc-400">{m.team1}</span>
                  </div>

                  {/* Score Badge */}
                  <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 mx-2 text-center min-w-[70px]">
                    <span className="text-base font-black text-emerald-400 font-mono tracking-wider">
                      {m.score1} - {m.score2}
                    </span>
                    <span className="block text-[9px] text-zinc-400 mt-0.5">{m.date}</span>
                  </div>

                  {/* Player 2 */}
                  <div className="flex-1 text-center">
                    <span className="block font-bold text-sm text-white">{m.player2}</span>
                    <span className="text-[10px] text-zinc-400">{m.team2}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Match Modal triggered by '+' button */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/90 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>ثبت نتیجه مسابقه جدید</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Player 1 Selection */}
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">میزبان (بازیکن ۱)</label>
                  <select
                    value={p1}
                    onChange={(e) => setP1(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {standings.map(s => <option key={s.name} value={s.name} className="bg-emerald-950">{s.name}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={s1}
                    onChange={(e) => setS1(Number(e.target.value))}
                    className="mt-2 w-full py-2 text-center rounded-xl bg-black/50 border border-white/15 font-mono text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                    placeholder="گل"
                    required
                  />
                </div>

                {/* Player 2 Selection */}
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">مهمان (بازیکن ۲)</label>
                  <select
                    value={p2}
                    onChange={(e) => setP2(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {standings.map(s => <option key={s.name} value={s.name} className="bg-emerald-950">{s.name}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={s2}
                    onChange={(e) => setS2(Number(e.target.value))}
                    className="mt-2 w-full py-2 text-center rounded-xl bg-black/50 border border-white/15 font-mono text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                    placeholder="گل"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:brightness-110 active:scale-95 transition-all"
                >
                  ثبت رسمی در جدول لیگ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Liquid Glass Bottom Navigation Bar */}
      <LiquidBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => setIsAddModalOpen(true)}
      />
    </div>
  );
};

export default App;
