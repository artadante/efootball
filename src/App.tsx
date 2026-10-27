import React, { useState, useEffect } from 'react';
import { PitchBackground } from './components/PitchBackground';
import { LiquidBottomNav, TabType } from './components/LiquidBottomNav';
import { ProfileButton } from './components/ProfileButton';
import { 
  Flame, 
  Calendar, 
  Sparkles, 
  Smartphone, 
  X, 
  Medal,
  Cloud,
  Database,
  UserPlus,
  ShieldAlert,
  Trash2,
  Users
} from 'lucide-react';
import { supabase, isSupabaseConfigured, DbStanding, DbPlayer } from './lib/supabase';

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

interface Player {
  id: string;
  name: string;
  favoriteTeam: string;
  rating: number;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('league');
  const [isAddMatchModalOpen, setIsAddMatchModalOpen] = useState(false);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [showPwaTip, setShowPwaTip] = useState(true);

  // Admin authentication state (saved in localStorage)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('efootball_is_admin') === 'true';
  });
  const [adminPin] = useState<string>(() => {
    return localStorage.getItem('efootball_admin_pin') || '1234';
  });
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Clean state (no hardcoded fake players or matches)
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('efootball_local_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>(() => {
    const saved = localStorage.getItem('efootball_local_matches');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate standings from matches and players
  useEffect(() => {
    if (players.length === 0) {
      setStandings([]);
      return;
    }

    const calculated: StandingRow[] = players.map(player => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;
      let points = 0;

      matches.forEach(m => {
        if (m.player1 === player.name) {
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
        } else if (m.player2 === player.name) {
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
        name: player.name,
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
  }, [players, matches]);

  // Load from Supabase if credentials are provided
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const fetchLiveSupabaseData = async () => {
      try {
        // Fetch players
        const { data: playersData } = await client.from('players').select('*');
        if (playersData && playersData.length > 0) {
          const mappedPlayers: Player[] = (playersData as DbPlayer[]).map(p => ({
            id: p.id,
            name: p.name,
            favoriteTeam: p.favorite_team,
            rating: p.rating,
          }));
          setPlayers(mappedPlayers);
        }

        // Fetch standings view
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

        // Fetch matches
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

    // Subscribe to realtime matches & players changes
    const channel = client
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchLiveSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        fetchLiveSupabaseData();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Admin login / logout handlers
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

  // Add new player form
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('رئال مادرید 🇪🇸');

  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('این بازیکن از قبل در لیست وجود دارد.');
      return;
    }

    const newP: Player = {
      id: Date.now().toString(),
      name: trimmed,
      favoriteTeam: newPlayerTeam,
      rating: 1200,
    };

    const updated = [...players, newP];
    setPlayers(updated);
    localStorage.setItem('efootball_local_players', JSON.stringify(updated));
    setNewPlayerName('');
    setIsAddPlayerModalOpen(false);

    // Write to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('players').insert([{
          name: trimmed,
          favorite_team: newPlayerTeam,
          rating: 1200,
        }]);
      } catch (err) {
        console.error('Failed to insert player to Supabase', err);
      }
    }
  };

  // New match form state
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);

  const handleOpenAddMatch = () => {
    if (!isAdmin) {
      // Prompt for admin pin
      setUnlockPinInput('');
      setUnlockError('');
      setIsAdminAuthModalOpen(true);
      return;
    }

    if (players.length < 2) {
      alert('برای ثبت مسابقه حداقل ۲ بازیکن باید در سیستم تعریف شده باشند.');
      setIsAddPlayerModalOpen(true);
      return;
    }

    setP1(players[0].name);
    setP2(players[1].name);
    setS1(0);
    setS2(0);
    setIsAddMatchModalOpen(true);
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
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

    const updatedMatches = [newRecord, ...matches];
    setMatches(updatedMatches);
    localStorage.setItem('efootball_local_matches', JSON.stringify(updatedMatches));
    setIsAddMatchModalOpen(false);

    // If Supabase is connected, write to Postgres
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: p1Data } = await supabase.from('players').select('id').eq('name', p1).single();
        const { data: p2Data } = await supabase.from('players').select('id').eq('name', p2).single();

        if (p1Data && p2Data) {
          await supabase.from('matches').insert([{
            player1_id: p1Data.id,
            player2_id: p2Data.id,
            team1: 'انتخابی',
            team2: 'انتخابی',
            score1: Number(s1),
            score2: Number(s2),
          }]);
        }
      } catch (err) {
        console.error('Error inserting match into Supabase', err);
      }
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!isAdmin) return;
    if (!confirm('آیا مطمئن هستید که می‌خواهید این نتیجه حذف شود؟')) return;

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
          {/* Circular Profile Button at corner */}
          <ProfileButton 
            userName={isAdmin ? 'مدیر کل لیگ' : 'کاربر مهمان'} 
            rating={isAdmin ? 1500 : 1200}
            isAdmin={isAdmin}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={handleAdminLogout}
            onAddPlayer={() => setIsAddPlayerModalOpen(true)}
          />

          {/* Center Title Badge */}
          <div className="text-center">
            <h1 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 drop-shadow-[0_2px_10px_rgba(34,197,94,0.3)]">
              لیگ eFootball
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/90 font-medium mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAdmin ? '👑 حالت مدیریت فعال' : 'فصل دوستانه ۱۴۰۵'}</span>
            </div>
          </div>

          {/* Cloud Database Status Indicator */}
          <div 
            title={isSupabaseConfigured ? 'متصل به پایگاه ابری Supabase' : 'حالت لوکال (آماده اتصال به Supabase)'}
            className={`w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center shadow-md transition-all ${
              isSupabaseConfigured 
                ? 'bg-emerald-950/80 border-emerald-400/40 text-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.25)]' 
                : 'bg-emerald-950/60 border-white/10 text-zinc-400'
            }`}
          >
            {isSupabaseConfigured ? (
              <Cloud className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <Database className="w-4 h-4 text-zinc-400" />
            )}
          </div>
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

        {/* Dynamic Views Content based on active tab */}
        <main className="mt-4 flex-1">
          {/* TAB 1: LEAGUE TABLE & STANDINGS */}
          {activeTab === 'league' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Standings Table Card */}
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <Medal className="w-4 h-4 text-emerald-400" />
                    <span>جدول رده‌بندی لیگ</span>
                  </h3>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddPlayerModalOpen(true)}
                      className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-lg transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>افزودن بازیکن</span>
                    </button>
                  )}
                </div>

                {standings.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-zinc-300 font-medium">هنوز بازیکنی به لیگ اضافه نشده است.</p>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => setIsAddPlayerModalOpen(true)}
                        className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        ➕ افزودن اولین بازیکن لیگ
                      </button>
                    ) : (
                      <p className="text-[11px] text-zinc-500">
                        برای شروع لیگ، مدیر باید بازیکنان را اضافه کند.
                      </p>
                    )}
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

          {/* TAB 3: MATCH HISTORY (تاریخچه) */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm text-emerald-300">
                  تاریخچه مسابقات ثبت‌شده ({matches.length})
                </h3>
                <span className="text-xs text-zinc-400">آخرین نتایج</span>
              </div>

              {matches.length === 0 ? (
                <div className="py-12 rounded-3xl bg-emerald-950/40 border border-white/10 text-center space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-zinc-500" />
                  <p className="text-xs text-zinc-400">هنوز هیچ مسابقه‌ای ثبت نشده است.</p>
                </div>
              ) : (
                matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-emerald-950/60 border border-white/10 backdrop-blur-xl shadow-lg flex items-center justify-between hover:border-emerald-500/30 transition-all relative group"
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

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMatch(m.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
                        title="حذف مسابقه"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal 1: Add New Player (Admin Only) */}
      {isAddPlayerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>افزودن بازیکن جدید</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPlayerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPlayerSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">نام بازیکن / دوست شما</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="مثال: آرش، سامان، علی..."
                  className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">تیم مورد علاقه</label>
                <input
                  type="text"
                  value={newPlayerTeam}
                  onChange={(e) => setNewPlayerTeam(e.target.value)}
                  placeholder="مثال: رئال مادرید 🇪🇸"
                  className="w-full py-2.5 px-3 rounded-xl bg-black/50 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:brightness-110 active:scale-95 transition-all"
                >
                  ثبت بازیکن در لیگ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Visitor Prompt to Enter Admin PIN */}
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
                  placeholder="رمز مدیر (پیش‌فرض: 1234)"
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
                  تایید رمز و باز شدن پنل
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: New Match Modal (Admin Only) */}
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
                  <label className="block text-xs text-zinc-300 mb-1 font-medium">میزبان (بازیکن ۱)</label>
                  <select
                    value={p1}
                    onChange={(e) => setP1(e.target.value)}
                    className="w-full py-2 px-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {players.map(p => <option key={p.id} value={p.name} className="bg-emerald-950">{p.name}</option>)}
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
                    {players.map(p => <option key={p.id} value={p.name} className="bg-emerald-950">{p.name}</option>)}
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
        onAddClick={handleOpenAddMatch}
      />
    </div>
  );
};

export default App;
