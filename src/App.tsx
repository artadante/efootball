import React, { useState, useEffect } from 'react';
import { PitchBackground } from './components/PitchBackground';
import { LiquidBottomNav, TabType } from './components/LiquidBottomNav';
import { ProfileButton } from './components/ProfileButton';
import { 
  Flame, 
  Sparkles, 
  Smartphone, 
  X, 
  Medal, 
  ShieldAlert, 
  Trash2, 
  Plus, 
  Swords, 
  History,
  Calendar
} from 'lucide-react';
import { supabase, isSupabaseConfigured, DbStanding } from './lib/supabase';

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
  const [activeTab, setActiveTab] = useState<TabType>('table');
  const [isAddMatchModalOpen, setIsAddMatchModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [showPwaTip, setShowPwaTip] = useState(true);

  // Admin authentication state (saved in localStorage)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('efootball_is_admin') === 'true';
  });
  const adminPin = 'arta6996';
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Standings & matches state
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>(() => {
    const saved = localStorage.getItem('efootball_local_matches');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate standings directly from matches
  useEffect(() => {
    if (matches.length === 0) {
      setStandings([]);
      return;
    }

    const playerNames = Array.from(
      new Set(matches.flatMap(m => [m.player1, m.player2]))
    );

    const calculated: StandingRow[] = playerNames.map(playerName => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;
      let points = 0;

      matches.forEach(m => {
        if (m.player1 === playerName) {
          played += 1;
          goalsFor += m.score1;
          goalsAgainst += m.score2;
          if (m.score1 > m.score2) {
            won += 1;
            points += 3;
          } else if (m.score1 === m.score2) {
            drawn += 1;
            points += 1;
          } else {
            lost += 1;
          }
        } else if (m.player2 === playerName) {
          played += 1;
          goalsFor += m.score2;
          goalsAgainst += m.score1;
          if (m.score2 > m.score1) {
            won += 1;
            points += 3;
          } else if (m.score1 === m.score2) {
            drawn += 1;
            points += 1;
          } else {
            lost += 1;
          }
        }
      });

      return {
        rank: 1,
        name: playerName,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        points,
      };
    });

    // Sort by points desc, then goal difference desc, then goalsFor desc
    calculated.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return b.goalsFor - a.goalsFor;
    });

    const ranked = calculated.map((row, idx) => ({ ...row, rank: idx + 1 }));
    setStandings(ranked);
  }, [matches]);

  // Load from Supabase if credentials are provided
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const fetchLiveSupabaseData = async () => {
      try {
        const { data: standingsData } = await client.from('league_standings').select('*');
        if (standingsData && standingsData.length > 0) {
          const mappedStandings: StandingRow[] = (standingsData as DbStanding[]).map((s, idx) => ({
            rank: idx + 1,
            name: s.player_name,
            played: s.played,
            won: s.won,
            drawn: s.drawn,
            lost: s.lost,
            goalsFor: s.goals_for,
            goalsAgainst: s.goals_against,
            points: s.points,
          }));
          setStandings(mappedStandings);
        }

        const { data: matchesData } = await client
          .from('matches')
          .select('id, team1, team2, score1, score2, played_at, p1:player1_id(name), p2:player2_id(name)')
          .order('played_at', { ascending: false });

        if (matchesData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedMatches: MatchRecord[] = matchesData.map((m: any) => ({
            id: m.id,
            player1: m.p1?.name || 'بازیکن ۱',
            team1: m.team1,
            score1: m.score1,
            score2: m.score2,
            player2: m.p2?.name || 'بازیکن ۲',
            team2: m.team2,
            date: new Date(m.played_at).toLocaleDateString('fa-IR'),
          }));
          setMatches(mappedMatches);
        }
      } catch (err) {
        console.warn('Supabase fetch error, fallback to local state', err);
      }
    };

    fetchLiveSupabaseData();

    const channel = client
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchLiveSupabaseData();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const handleAdminLogin = (pin: string) => {
    if (pin === adminPin) {
      setIsAdmin(true);
      localStorage.setItem('efootball_is_admin', 'true');
      setIsAdminAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('efootball_is_admin');
  };

  // Match form state
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [s1, setS1] = useState<number | string>('');
  const [s2, setS2] = useState<number | string>('');

  const handleOpenAddMatch = () => {
    if (!isAdmin) {
      setUnlockPinInput('');
      setUnlockError('');
      setIsAdminAuthModalOpen(true);
      return;
    }

    setP1('');
    setP2('');
    setS1('');
    setS2('');
    setIsAddMatchModalOpen(true);
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const p1Trimmed = p1.trim();
    const p2Trimmed = p2.trim();

    if (!p1Trimmed || !p2Trimmed) {
      alert('لطفاً نام هر دو بازیکن را وارد کنید.');
      return;
    }

    if (p1Trimmed.toLowerCase() === p2Trimmed.toLowerCase()) {
      alert('نام دو بازیکن نمی‌تواند یکسان باشد.');
      return;
    }

    const numScore1 = Number(s1) || 0;
    const numScore2 = Number(s2) || 0;

    const newRecord: MatchRecord = {
      id: Date.now().toString(),
      player1: p1Trimmed,
      team1: 'انتخابی',
      score1: numScore1,
      score2: numScore2,
      player2: p2Trimmed,
      team2: 'انتخابی',
      date: 'هم‌اکنون',
    };

    const updatedMatches = [newRecord, ...matches];
    setMatches(updatedMatches);
    localStorage.setItem('efootball_local_matches', JSON.stringify(updatedMatches));
    setIsAddMatchModalOpen(false);

    if (isSupabaseConfigured && supabase) {
      try {
        let { data: p1Data } = await supabase.from('players').select('id').eq('name', p1Trimmed).maybeSingle();
        if (!p1Data) {
          const { data: inserted1 } = await supabase.from('players').insert([{ name: p1Trimmed }]).select('id').single();
          p1Data = inserted1;
        }

        let { data: p2Data } = await supabase.from('players').select('id').eq('name', p2Trimmed).maybeSingle();
        if (!p2Data) {
          const { data: inserted2 } = await supabase.from('players').insert([{ name: p2Trimmed }]).select('id').single();
          p2Data = inserted2;
        }

        if (p1Data && p2Data) {
          await supabase.from('matches').insert([{
            player1_id: p1Data.id,
            player2_id: p2Data.id,
            team1: 'انتخابی',
            team2: 'انتخابی',
            score1: numScore1,
            score2: numScore2,
          }]);
        }
      } catch (err) {
        console.error('Error inserting match into Supabase', err);
      }
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!isAdmin) return;
    if (!confirm('آیا مطمئن هستید که می‌خواهید این مسابقه حذف شود؟')) return;

    const filtered = matches.filter(m => m.id !== matchId);
    setMatches(filtered);
    localStorage.setItem('efootball_local_matches', JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('matches').delete().eq('id', matchId);
      } catch (e) {
        console.error('Error deleting match from Supabase', e);
      }
    }
  };

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

  const handleSpinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedWheelPrize(null);

    const randomRotations = 5 + Math.floor(Math.random() * 5);
    const randomExtraDegrees = Math.floor(Math.random() * 360);
    const newAngle = wheelAngle + randomRotations * 360 + randomExtraDegrees;

    setWheelAngle(newAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      const normalizedDegree = (360 - (newAngle % 360)) % 360;
      const segmentSize = 360 / teamsWheel.length;
      const index = Math.floor(normalizedDegree / segmentSize);
      const chosen = teamsWheel[index];
      setSelectedWheelPrize(chosen);
    }, 3200);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#041308] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* 1. Football Pitch Visual Background */}
      <PitchBackground />

      {/* Main Container - Mobile Centered Shell */}
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col px-4 pt-4 pb-28">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2">
          {/* Top-Right: Circular Profile Button */}
          <ProfileButton 
            userName={isAdmin ? 'مدیر کل لیگ' : 'کاربر مهمان'} 
            rating={isAdmin ? 1500 : 1200}
            isAdmin={isAdmin}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
          />

          {/* Center: Admin status badge if logged in */}
          {isAdmin && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold shadow-sm">
              <span>👑 پنل مدیریت فعال</span>
            </div>
          )}

          {/* Top-Left: '+' Button for registering match */}
          <button
            type="button"
            onClick={handleOpenAddMatch}
            aria-label="ثبت مسابقه"
            className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 text-black flex items-center justify-center shadow-[0_0_18px_rgba(34,197,94,0.4)] active:scale-95 hover:scale-105 transition-all focus:outline-none"
            title="ثبت مسابقه جدید"
          >
            <Plus className="w-6 h-6 stroke-[2.75] text-slate-950" />
          </button>
        </header>

        {/* PWA Helper Banner */}
        {showPwaTip && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20 backdrop-blur-xl flex items-center justify-between text-xs text-emerald-200/90 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">نصب روی گوشی</p>
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

        {/* Dynamic Views Content based on active tab: چرخونه - بازی‌ها - جدول - تاریخچه */}
        <main className="mt-4 flex-1">
          {/* TAB 1: LUCKY WHEEL (چرخونه) */}
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

                {/* Rotating Wheel Circle */}
                <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
                  <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />

                  <div
                    className="relative w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_35px_rgba(34,197,94,0.4)] overflow-hidden transition-all duration-[3200ms] ease-out flex items-center justify-center"
                    style={{
                      transform: `rotate(${wheelAngle}deg)`,
                      background: 'conic-gradient(#064e3b 0deg 45deg, #022c22 45deg 90deg, #065f46 90deg 135deg, #047857 135deg 180deg, #064e3b 180deg 225deg, #022c22 225deg 270deg, #065f46 270deg 315deg, #047857 315deg 360deg)',
                    }}
                  >
                    <div className="absolute z-20 w-14 h-14 rounded-full bg-emerald-950 border-2 border-amber-400 flex items-center justify-center shadow-lg text-amber-400 font-black text-xs">
                      eFootball
                    </div>

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

                {selectedWheelPrize && (
                  <div className="p-3 mb-4 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 text-sm font-extrabold animate-bounce">
                    🎉 تیم انتخاب‌شده: {selectedWheelPrize}
                  </div>
                )}

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

          {/* TAB 2: MATCHES / FIXTURES (بازی‌ها) */}
          {activeTab === 'matches' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <Swords className="w-4 h-4 text-emerald-400" />
                    <span>برنامه و وضعیت مسابقات</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {matches.length} مسابقه ثبت‌شده
                  </span>
                </div>

                {matches.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-zinc-500" />
                    <p className="text-xs text-zinc-400 font-medium">
                      هنوز مسابقه‌ای ثبت نشده است.
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      برای ثبت مسابقه جدید، از دکمه + در بالای صفحه استفاده کنید.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Latest Featured Match */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md">
                      <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-2">
                        <span>آخرین بازی انجام‌شده</span>
                        <span className="text-zinc-400 font-normal">{matches[0].date}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="font-extrabold text-white text-sm">{matches[0].player1}</span>
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-black text-base">
                          {matches[0].score1} - {matches[0].score2}
                        </span>
                        <span className="font-extrabold text-white text-sm">{matches[0].player2}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LEAGUE TABLE & STANDINGS (جدول) */}
          {activeTab === 'table' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <Medal className="w-4 h-4 text-emerald-400" />
                    <span>جدول رده‌بندی لیگ</span>
                  </h3>
                </div>

                {standings.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Medal className="w-8 h-8 mx-auto text-zinc-500" />
                    <p className="text-xs text-zinc-400 font-medium">هنوز مسابقه‌ای در جدول ثبت نشده است.</p>
                  </div>
                ) : (
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
                              row.rank === 1 && row.points > 0 ? 'bg-emerald-500/10' : ''
                            }`}
                          >
                            <td className="py-3 px-2 text-start font-bold">
                              {row.rank === 1 && row.points > 0 ? (
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
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MATCH HISTORY (تاریخچه - با طراحی هماهنگ با باکس جدول لیگ) */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    <span>تاریخچه مسابقات</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    ({matches.length} بازی ثبت‌شده)
                  </span>
                </div>

                {matches.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <History className="w-8 h-8 mx-auto text-zinc-500" />
                    <p className="text-xs text-zinc-400 font-medium">هنوز هیچ مسابقه‌ای ثبت نشده است.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="text-zinc-400 border-b border-white/10 pb-2 font-medium">
                          <th className="py-2 text-start px-2">میزبان</th>
                          <th className="py-2">نتیجه</th>
                          <th className="py-2 text-end px-2">مهمان</th>
                          <th className="py-2 text-center">زمان</th>
                          {isAdmin && <th className="py-2 text-end">حذف</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {matches.map((m) => (
                          <tr key={m.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-2 text-start font-bold text-white">
                              {m.player1}
                            </td>
                            <td className="py-3 font-mono font-black text-sm text-emerald-400 whitespace-nowrap">
                              {m.score1} - {m.score2}
                            </td>
                            <td className="py-3 px-2 text-end font-bold text-white">
                              {m.player2}
                            </td>
                            <td className="py-3 text-[11px] text-zinc-400 font-medium whitespace-nowrap">
                              {m.date}
                            </td>
                            {isAdmin && (
                              <td className="py-3 text-end">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMatch(m.id)}
                                  className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                                  title="حذف مسابقه"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal 1: Visitor Prompt to Enter Admin PIN */}
      {isAdminAuthModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/95 border border-amber-500/30 backdrop-blur-2xl shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>دسترسی مدیر لازم است</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAdminAuthModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs text-zinc-300">
                فقط مدیر لیگ امکان ثبت نتیجه مسابقه را دارد. اگر شما مدیر هستید، رمز عبور را وارد کنید:
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!handleAdminLogin(unlockPinInput)) {
                    setUnlockError('رمز عبور مدیر اشتباه است.');
                  }
                }} 
                className="mt-4 space-y-3"
              >
                <input
                  type="password"
                  value={unlockPinInput}
                  onChange={(e) => {
                    setUnlockPinInput(e.target.value);
                    setUnlockError('');
                  }}
                  placeholder="رمز عبور مدیر"
                  className="w-full py-2.5 px-3 text-center rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  autoFocus
                />

                {unlockError && (
                  <p className="text-[11px] text-rose-400 font-medium">{unlockError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm shadow hover:brightness-110 active:scale-95 transition-all"
                >
                  تایید رمز و ورود
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: New Match Modal (Admin Only - Simple Freeform Player Entry) */}
      {isAddMatchModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>ثبت نتیجه مسابقه جدید</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddMatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Player 1 Selection */}
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">بازیکن ۱ (میزبان)</label>
                  <input
                    type="text"
                    value={p1}
                    onChange={(e) => setP1(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    placeholder="نام بازیکن ۱"
                    required
                    autoFocus
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={s1}
                    onChange={(e) => setS1(e.target.value)}
                    className="mt-2 w-full py-2 text-center rounded-xl bg-black/50 border border-white/15 font-mono text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                    placeholder="گل"
                    required
                  />
                </div>

                {/* Player 2 Selection */}
                <div>
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">بازیکن ۲ (مهمان)</label>
                  <input
                    type="text"
                    value={p2}
                    onChange={(e) => setP2(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    placeholder="نام بازیکن ۲"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={s2}
                    onChange={(e) => setS2(e.target.value)}
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

      {/* 2. Liquid Glass Bottom Navigation Bar (چرخونه - بازی‌ها - جدول - تاریخچه) */}
      <LiquidBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default App;
