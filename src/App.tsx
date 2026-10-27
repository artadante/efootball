import React, { useState, useEffect } from 'react';
import { PitchBackground } from './components/PitchBackground';
import { LiquidBottomNav, TabType } from './components/LiquidBottomNav';
import { ProfileButton } from './components/ProfileButton';
import { CreateLeagueModal } from './components/CreateLeagueModal';
import { DualWheel } from './components/DualWheel';
import { AdminLeagueControlModal } from './components/AdminLeagueControlModal';
import { PlayerProfilesModal } from './components/PlayerProfilesModal';
import { TeamLogo } from './components/TeamLogo';
import { 
  fetchRemoteLeagueState, 
  syncSaveLeagueState, 
  subscribeToRealtimeLeague,
  getLocalLeagueState
} from './services/leagueStorage';
import { 
  Crown, 
  Medal, 
  ShieldAlert, 
  X, 
  Swords, 
  Calendar, 
  History, 
  CheckCircle2, 
  Archive,
  Trophy,
  Flame,
  Smartphone,
  Users
} from 'lucide-react';
import { ActiveLeague, ArchivedLeague, StandingRow, ScheduledMatch } from './types/league';
import { RegisteredPlayer, DEFAULT_FIXED_PLAYERS } from './types/player';
import { SoundToggle } from './components/SoundToggle';
import { soundEngine } from './utils/soundEffects';
import { KnockoutBracket } from './components/KnockoutBracket';
import { StoryPosterModal } from './components/StoryPosterModal';
import { MatchPredictionModal } from './components/MatchPredictionModal';
import { PositionProgressionChart } from './components/PositionProgressionChart';
import { PickBanModal, PlayerPickBan } from './components/PickBanModal';
import { ChampionshipCelebration } from './components/ChampionshipCelebration';
import { PlayerFormBadge } from './components/PlayerFormBadge';
import { generateMatchdayNews } from './utils/newsGenerator';
import { calculatePlayerCareerStats } from './utils/playerStats';
import { advanceCupTree } from './utils/fixtureGenerator';
import { Radio, Share2, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminLeagueControlOpen, setIsAdminLeagueControlOpen] = useState(false);
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);
  const [scoreEditMatchId, setScoreEditMatchId] = useState<string | null>(null);
  const [scoreInput1, setScoreInput1] = useState<number | string>(0);
  const [scoreInput2, setScoreInput2] = useState<number | string>(0);
  const [legFilter, setLegFilter] = useState<1 | 2>(1);
  const [showPwaTip, setShowPwaTip] = useState(true);

  // Active User switcher state (Guest or one of registered players)
  const [activeUser, setActiveUser] = useState<RegisteredPlayer | null>(() => {
    try {
      const raw = localStorage.getItem('efootball_active_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const handleSelectActiveUser = (player: RegisteredPlayer | null) => {
    setActiveUser(player);
    try {
      if (player) {
        localStorage.setItem('efootball_active_user', JSON.stringify(player));
      } else {
        localStorage.removeItem('efootball_active_user');
      }
    } catch {
      // ignore
    }
  };

  // Matches view mode: list vs knockout bracket
  const [matchesViewMode, setMatchesViewMode] = useState<'list' | 'bracket'>('list');

  // Prediction modal
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);

  // Pick and ban modal
  const [isPickBanOpen, setIsPickBanOpen] = useState(false);
  const [picksBans, setPicksBans] = useState<Record<string, PlayerPickBan>>({});

  // Celebration modal
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    championName: string;
    championTeam: string;
    leagueName: string;
    avatarUrl?: string;
  } | null>(null);

  // Story poster modal
  const [isStoryPosterOpen, setIsStoryPosterOpen] = useState(false);
  const [storyPosterParams, setStoryPosterParams] = useState<{
    posterType?: 'match' | 'table';
    title?: string;
    player1Name?: string;
    player1Team?: string;
    player2Name?: string;
    player2Team?: string;
    score1?: number | null;
    score2?: number | null;
    isPlayed?: boolean;
    leagueName?: string;
    standings?: StandingRow[];
  } | null>(null);

  // Dismissed news persistence (single view per user/device)
  const DISMISSED_NEWS_KEY = 'efootball_dismissed_news';
  const [dismissedNewsIds, setDismissedNewsIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_NEWS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleDismissNews = (newsId: string) => {
    const updated = [...dismissedNewsIds, newsId];
    setDismissedNewsIds(updated);
    try {
      localStorage.setItem(DISMISSED_NEWS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Admin authentication (persisted)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('efootball_is_admin') === 'true';
  });
  const adminPin = 'arta6996';
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Active League state (saved locally and synced to Supabase)
  const [activeLeague, setActiveLeague] = useState<ActiveLeague | null>(() => {
    return getLocalLeagueState().activeLeague;
  });

  // Archived Leagues in History (saved locally and synced to Supabase)
  const [archivedLeagues, setArchivedLeagues] = useState<ArchivedLeague[]>(() => {
    return getLocalLeagueState().archivedLeagues;
  });

  // Registered Players list (fixed default players + admin additions)
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>(() => {
    return getLocalLeagueState().registeredPlayers || DEFAULT_FIXED_PLAYERS;
  });

  // Fetch initial remote state and subscribe to live changes across all devices
  useEffect(() => {
    fetchRemoteLeagueState().then((remote) => {
      if (remote) {
        if (remote.activeLeague !== undefined) setActiveLeague(remote.activeLeague);
        if (remote.archivedLeagues !== undefined) setArchivedLeagues(remote.archivedLeagues);
        if (remote.registeredPlayers && remote.registeredPlayers.length > 0) {
          setRegisteredPlayers(remote.registeredPlayers);
        }
      }
    });

    const unsubscribe = subscribeToRealtimeLeague((remoteState) => {
      setActiveLeague(remoteState.activeLeague);
      setArchivedLeagues(remoteState.archivedLeagues || []);
      if (remoteState.registeredPlayers && remoteState.registeredPlayers.length > 0) {
        setRegisteredPlayers(remoteState.registeredPlayers);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Standings table calculation
  const [standings, setStandings] = useState<StandingRow[]>([]);

  // Update standings whenever active league or match scores change
  useEffect(() => {
    if (!activeLeague || activeLeague.players.length === 0) {
      setStandings([]);
      return;
    }

    const calculated: StandingRow[] = activeLeague.players.map((player) => {
      const pName = player.name || `بازیکن ${player.slot}`;
      const pTeam = player.team || `تیم ${player.slot}`;

      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;
      let points = 0;

      activeLeague.matches.forEach((m) => {
        if (!m.isPlayed || m.score1 === null || m.score2 === null) return;

        if (m.player1Slot === player.slot) {
          played += 1;
          goalsFor += m.score1!;
          goalsAgainst += m.score2!;
          if (m.score1! > m.score2!) {
            won += 1;
            points += 3;
          } else if (m.score1! === m.score2!) {
            drawn += 1;
            points += 1;
          } else {
            lost += 1;
          }
        } else if (m.player2Slot === player.slot) {
          played += 1;
          goalsFor += m.score2!;
          goalsAgainst += m.score1!;
          if (m.score2! > m.score1!) {
            won += 1;
            points += 3;
          } else if (m.score1! === m.score2!) {
            drawn += 1;
            points += 1;
          } else {
            lost += 1;
          }
        }
      });

      return {
        rank: 1,
        name: pName,
        team: pTeam,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDiff: goalsFor - goalsAgainst,
        points,
      };
    });

    // Sort by points desc, then goal difference desc, then goalsFor desc
    calculated.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });

    const ranked = calculated.map((row, idx) => ({ ...row, rank: idx + 1 }));
    setStandings(ranked);
  }, [activeLeague]);

  // Save active league to local cache and Supabase Cloud
  const saveActiveLeague = (league: ActiveLeague | null) => {
    setActiveLeague(league);
    syncSaveLeagueState(league, archivedLeagues, registeredPlayers);
  };

  // Save archived leagues to local cache and Supabase Cloud
  const saveArchivedLeagues = (list: ArchivedLeague[]) => {
    setArchivedLeagues(list);
    syncSaveLeagueState(activeLeague, list, registeredPlayers);
  };

  // Add new player to registered players list
  const handleAddPlayer = (name: string) => {
    if (!name.trim()) return;
    const newPlayer: RegisteredPlayer = {
      id: 'p-' + Date.now(),
      name: name.trim(),
      isDefault: false,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    const updated = [...registeredPlayers, newPlayer];
    setRegisteredPlayers(updated);
    syncSaveLeagueState(activeLeague, archivedLeagues, updated);
  };

  // Delete custom player
  const handleDeletePlayer = (id: string) => {
    const updated = registeredPlayers.filter((p) => p.id !== id);
    setRegisteredPlayers(updated);
    syncSaveLeagueState(activeLeague, archivedLeagues, updated);
  };

  // Update avatar of a player
  const handleUpdatePlayerAvatar = (playerId: string, avatarUrl: string) => {
    const updated = registeredPlayers.map((p) => {
      if (p.id === playerId) {
        return { ...p, avatarUrl };
      }
      return p;
    });
    setRegisteredPlayers(updated);
    syncSaveLeagueState(activeLeague, archivedLeagues, updated);
  };

  // Admin login handlers
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

  // Handle open create league from admin panel
  const handleOpenCreateLeague = () => {
    if (!isAdmin) {
      setUnlockPinInput('');
      setUnlockError('');
      setIsAdminAuthModalOpen(true);
      return;
    }

    if (activeLeague && !activeLeague.isFinished) {
      if (!confirm(`لیگ «${activeLeague.name}» هم‌اکنون در حال برگزاری است. آیا می‌خواهید لیگ جدیدی ایجاد کرده و این لیگ را جایگزین کنید؟`)) {
        return;
      }
    }

    setIsCreateModalOpen(true);
  };

  // Handle new league created from modal
  const handleLeagueCreated = (newLeague: ActiveLeague) => {
    saveActiveLeague(newLeague);
    if (newLeague.mode === 'cup') {
      setMatchesViewMode('bracket');
    }
    setActiveTab('wheel'); // Redirect immediately to wheel to spin players and teams!
  };

  // Handle slot assignment from DualWheel
  const handleSlotAssigned = (slotNumber: number, playerName: string, teamName: string) => {
    if (!activeLeague) return;

    const updatedPlayers = activeLeague.players.map((p) => {
      if (p.slot === slotNumber) {
        return { ...p, name: playerName, team: teamName };
      }
      return p;
    });

    const allCompleted = updatedPlayers.every((p) => p.name && p.team);

    const updatedLeague: ActiveLeague = {
      ...activeLeague,
      players: updatedPlayers,
      wheelCompleted: allCompleted,
    };

    saveActiveLeague(updatedLeague);
  };

  // Helper to get player/team label by slot
  const getPlayerLabel = (slot: number) => {
    const p = activeLeague?.players.find((pl) => pl.slot === slot);
    return {
      name: p?.name || `بازیکن ${slot}`,
      team: p?.team || `تیم ${slot}`,
      isAssigned: Boolean(p?.name && p?.team),
    };
  };

  // Handle submitting match score
  const handleSaveScore = (matchId: string) => {
    if (!activeLeague || !isAdmin) return;

    const s1 = Number(scoreInput1);
    const s2 = Number(scoreInput2);

    soundEngine.playWhistle();
    soundEngine.playStadiumCheer();

    const updatedMatches = activeLeague.matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          score1: s1,
          score2: s2,
          isPlayed: true,
          playedAt: new Date().toLocaleDateString('fa-IR'),
        };
      }
      return m;
    });

    let finalMatches = updatedMatches;
    if (activeLeague.mode === 'cup') {
      finalMatches = advanceCupTree(updatedMatches);
    }

    const allMatchesFinished =
      activeLeague.mode === 'cup'
        ? finalMatches[finalMatches.length - 1]?.isPlayed || false
        : finalMatches.every((m) => m.isPlayed);

    const updatedLeague: ActiveLeague = {
      ...activeLeague,
      matches: finalMatches,
      isFinished: allMatchesFinished,
    };

    saveActiveLeague(updatedLeague);
    setScoreEditMatchId(null);
  };

  // Handle admin manual update of player slot (name & team)
  const handleAdminUpdatePlayer = (slot: number, name: string, team: string) => {
    if (!activeLeague) return;

    const updatedPlayers = activeLeague.players.map((p) => {
      if (p.slot === slot) {
        return { ...p, name, team };
      }
      return p;
    });

    const allCompleted = updatedPlayers.every((p) => p.name && p.team);

    const updatedLeague: ActiveLeague = {
      ...activeLeague,
      players: updatedPlayers,
      wheelCompleted: allCompleted,
    };

    saveActiveLeague(updatedLeague);
  };

  // Handle admin update match score
  const handleAdminUpdateMatchScore = (matchId: string, score1: number, score2: number) => {
    if (!activeLeague) return;

    const updatedMatches = activeLeague.matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          score1,
          score2,
          isPlayed: true,
          playedAt: new Date().toLocaleDateString('fa-IR'),
        };
      }
      return m;
    });

    let finalMatches = updatedMatches;
    if (activeLeague.mode === 'cup') {
      finalMatches = advanceCupTree(updatedMatches);
    }

    const allMatchesFinished =
      activeLeague.mode === 'cup'
        ? finalMatches[finalMatches.length - 1]?.isPlayed || false
        : finalMatches.every((m) => m.isPlayed);

    const updatedLeague: ActiveLeague = {
      ...activeLeague,
      matches: finalMatches,
      isFinished: allMatchesFinished,
    };

    saveActiveLeague(updatedLeague);
  };

  // Handle admin reset match back to unplayed
  const handleAdminResetMatch = (matchId: string) => {
    if (!activeLeague) return;

    const updatedMatches = activeLeague.matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          score1: null,
          score2: null,
          isPlayed: false,
          playedAt: undefined,
        };
      }
      return m;
    });

    const updatedLeague: ActiveLeague = {
      ...activeLeague,
      matches: updatedMatches,
      isFinished: false,
    };

    saveActiveLeague(updatedLeague);
  };

  // Finalize & Archive League to History
  const handleFinishAndArchiveLeague = () => {
    if (!activeLeague) return;

    soundEngine.playFanfare();

    let championName = standings[0]?.name || 'نامشخص';
    let championTeam = standings[0]?.team || 'نامشخص';

    if (activeLeague.mode === 'cup') {
      const finalM = activeLeague.matches[activeLeague.matches.length - 1];
      if (finalM && finalM.isPlayed && typeof finalM.score1 === 'number' && typeof finalM.score2 === 'number') {
        const champSlot = finalM.score1 >= finalM.score2 ? finalM.player1Slot : finalM.player2Slot;
        const champP = activeLeague.players.find((p) => p.slot === champSlot);
        if (champP && champP.name) {
          championName = champP.name;
          championTeam = champP.team || 'نامشخص';
        }
      }
    }

    const completedMatches = activeLeague.matches.map((m) => {
      const p1 = getPlayerLabel(m.player1Slot);
      const p2 = getPlayerLabel(m.player2Slot);
      return {
        id: m.id,
        leg: m.leg,
        round: m.round,
        player1: p1.name,
        team1: p1.team,
        score1: m.score1 ?? 0,
        score2: m.score2 ?? 0,
        player2: p2.name,
        team2: p2.team,
      };
    });

    const newArchived: ArchivedLeague = {
      id: activeLeague.id,
      name: activeLeague.name,
      mode: activeLeague.mode,
      finishedAt: new Date().toLocaleDateString('fa-IR'),
      championName,
      championTeam,
      standings: [...standings],
      matches: completedMatches,
    };

    const updatedArchive = [newArchived, ...archivedLeagues];
    saveArchivedLeagues(updatedArchive);

    // Trigger celebration modal
    setCelebrationData({
      championName,
      championTeam,
      leagueName: activeLeague.name,
      avatarUrl: registeredPlayers.find((p) => p.name === championName)?.avatarUrl,
    });
    setIsCelebrationOpen(true);

    // Clear active league to unlock wheel and allow starting a fresh league
    saveActiveLeague(null);
    setActiveTab('history');
  };

  const handleOpenMatchStory = (m: ScheduledMatch) => {
    soundEngine.playClick();
    const p1 = getPlayerLabel(m.player1Slot);
    const p2 = getPlayerLabel(m.player2Slot);
    setStoryPosterParams({
      title: m.isPlayed ? 'MATCH RESULT' : 'MATCHDAY',
      player1Name: p1.name,
      player1Team: p1.team,
      player2Name: p2.name,
      player2Team: p2.team,
      score1: m.score1,
      score2: m.score2,
      isPlayed: m.isPlayed,
      leagueName: activeLeague?.name || 'مسابقات دوستانه eFootball',
    });
    setIsStoryPosterOpen(true);
  };

  // Filtered matches for "بازی‌ها" tab (نیم‌فصل ۱ یا ۲)
  const displayedMatches = activeLeague
    ? activeLeague.matches.filter((m) => m.leg === legFilter)
    : [];

  const newsHeadlines = generateMatchdayNews(activeLeague);
  const visibleHeadlines = newsHeadlines.filter((n) => !dismissedNewsIds.includes(n.id));
  const latestNews = visibleHeadlines[0] || null;

  return (
    <div className="relative min-h-screen w-full bg-[#041308] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* 1. Football Pitch Visual Background */}
      <PitchBackground />

      {/* Main Container - Responsive Centered Shell */}
      <div className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto min-h-screen flex flex-col px-3.5 sm:px-6 pt-4 pb-28">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between py-2 gap-2">
          {/* Top-Right: Circular Profile Button & Sound Toggle */}
          <div className="flex items-center gap-2">
            <ProfileButton 
              userName={activeUser ? activeUser.name : (isAdmin ? 'مدیر کل لیگ' : 'کاربر مهمان')} 
              rating={isAdmin ? 1500 : (activeUser ? 1350 : 1200)}
              avatarUrl={activeUser ? activeUser.avatarUrl : (isAdmin ? '/admin-avatar.png' : undefined)}
              isAdmin={isAdmin}
              registeredPlayers={registeredPlayers}
              onAdminLogin={handleAdminLogin}
              onAdminLogout={handleAdminLogout}
              onOpenLeagueControl={() => setIsAdminLeagueControlOpen(true)}
              onCreateLeague={handleOpenCreateLeague}
              onSelectActiveUser={handleSelectActiveUser}
              onOpenPlayerProfile={() => setIsProfilesModalOpen(true)}
            />
            <SoundToggle />
          </div>

          {/* Center: Admin status / Active League Name */}
          <div className="text-center truncate flex-1 min-w-0">
            {activeLeague ? (
              <span className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 truncate block">
                {activeLeague.name}
              </span>
            ) : null}
            {isAdmin && (
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-300 font-bold mt-0.5">
                <span>👑 پنل مدیریت فعال</span>
              </div>
            )}
          </div>

          {/* Top-Left: Player Profiles Directory Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProfilesModalOpen(true)}
              aria-label="پروفایل و آمار بازیکنان"
              className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-emerald-600 via-green-500 to-emerald-400 text-black flex items-center justify-center shadow-[0_0_18px_rgba(34,197,94,0.4)] active:scale-95 hover:scale-105 transition-all focus:outline-none cursor-pointer"
              title="پروفایل و آمار بازیکنان"
            >
              <Users className="w-5.5 h-5.5 stroke-[2.2] text-slate-950" />
            </button>
          </div>
        </header>

        {/* Dynamic Sports News Ticker with Dismiss Button */}
        {activeLeague && latestNews && (
          <div className="mt-2 p-2.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md flex items-center justify-between gap-2.5 text-xs shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="py-1 px-2.5 rounded-xl bg-rose-500/20 text-rose-300 font-black shrink-0 border border-rose-500/30 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>{latestNews.category}</span>
              </div>
              <div className="flex-1 min-w-0 truncate">
                <span className="font-extrabold text-white truncate block">{latestNews.headline}</span>
                <span className="text-[10px] text-zinc-400 truncate block">{latestNews.subtitle}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                handleDismissNews(latestNews.id);
              }}
              title="حذف و عدم نمایش مجدد این خبر"
              aria-label="حذف خبر"
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PWA Helper Banner */}
        {showPwaTip && (
          <div className="mt-2.5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/20 backdrop-blur-xl flex items-center justify-between text-sm text-emerald-200/90 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">نصب روی گوشی</p>
                <p className="text-xs text-emerald-300/80">در مرورگر گزینه Add to Home Screen را بزنید</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPwaTip(false)}
              aria-label="بستن راهنما"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Views Content based on active tab: چرخونه - بازی‌ها - جدول - تاریخچه */}
        <main className="mt-3 flex-1 flex flex-col justify-center">
          
          {/* TAB 1: DUAL WHEEL (چرخونه) */}
          {activeTab === 'wheel' && (
            <DualWheel
              activeLeague={activeLeague}
              registeredPlayers={registeredPlayers}
              onSlotAssigned={handleSlotAssigned}
            />
          )}

          {/* TAB 2: MATCHES / FIXTURES (بازی‌ها - تقسیم به نیم‌فصل اول و دوم) */}
          {activeTab === 'matches' && (
            <div className="space-y-3 animate-fadeIn my-auto w-full">
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                
                {/* Header with Title and Mode Actions */}
                <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
                  <h3 className="font-bold text-base text-emerald-300 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-emerald-400" />
                    <span>برنامه و نتایج مسابقات</span>
                  </h3>
                  {activeLeague && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPredictionModalOpen(true)}
                        className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-1 shadow active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>پیش‌بینی 🎯</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPickBanOpen(true)}
                        className="py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-bold border border-white/10 transition-all"
                      >
                        <span>پیک/بن 🚫</span>
                      </button>

                      <span className="text-xs text-zinc-300 font-mono font-medium">
                        {activeLeague.matches.filter(m => m.isPlayed).length} / {activeLeague.matches.length} بازی
                      </span>
                    </div>
                  )}
                </div>

                {!activeLeague ? (
                  <div className="py-12 text-center space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-zinc-500" />
                    <p className="text-sm text-zinc-300 font-medium">هنوز لیگی تعریف نشده است.</p>
                    <p className="text-xs text-zinc-400">برای ایجاد لیگ و قرعه‌کشی، دکمه + بالا را بزنید.</p>
                  </div>
                ) : (
                  <>
                    {/* View Switcher: List vs Knockout Bracket */}
                    <div className="flex p-1 bg-black/50 rounded-2xl border border-white/10 mb-3 text-xs sm:text-sm">
                      <button
                        type="button"
                        onClick={() => setMatchesViewMode('list')}
                        className={`flex-1 py-1.5 sm:py-2 rounded-xl font-extrabold transition-all ${
                          matchesViewMode === 'list'
                            ? 'bg-emerald-500 text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        لیست مسابقات 📋
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchesViewMode('bracket')}
                        className={`flex-1 py-1.5 sm:py-2 rounded-xl font-extrabold transition-all ${
                          matchesViewMode === 'bracket'
                            ? 'bg-emerald-500 text-black shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        نمودار درختی جام 🌳
                      </button>
                    </div>

                    {matchesViewMode === 'bracket' ? (
                      <KnockoutBracket
                        activeLeague={activeLeague}
                        isAdmin={isAdmin}
                        onEditMatch={(mId) => {
                          setScoreEditMatchId(mId);
                          setScoreInput1(0);
                          setScoreInput2(0);
                        }}
                      />
                    ) : (
                      <>
                        {/* Leg Filter Tabs (نیم‌فصل اول / دوم) */}
                        <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10 mb-3 text-sm">
                          <button
                            type="button"
                            onClick={() => setLegFilter(1)}
                            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                              legFilter === 1
                                ? 'bg-emerald-500 text-black font-extrabold shadow'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            نیم‌فصل ۱ (رفت)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLegFilter(2)}
                            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                              legFilter === 2
                                ? 'bg-emerald-500 text-black font-extrabold shadow'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            نیم‌فصل ۲ (برگشت)
                          </button>
                        </div>

                        {/* All Matches Completed Celebration Banner */}
                        {activeLeague.matches.every(m => m.isPlayed) && !activeLeague.isFinished && (
                          <div className="p-3 mb-3 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-center space-y-2 animate-bounce">
                            <span className="text-sm font-black text-amber-300 block">
                              🎉 تمام مسابقات این لیگ با موفقیت به پایان رسید!
                            </span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={handleFinishAndArchiveLeague}
                                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow hover:scale-105 active:scale-95 transition-all"
                              >
                                ثبت نهایی و جشن قهرمانی 🏆
                              </button>
                            )}
                          </div>
                        )}

                        {/* Match Cards List */}
                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
                          {displayedMatches.map((m) => {
                            const p1 = getPlayerLabel(m.player1Slot);
                            const p2 = getPlayerLabel(m.player2Slot);
                            const p1Stats = calculatePlayerCareerStats(
                              registeredPlayers.find((p) => p.name === p1.name) || { id: p1.name, name: p1.name },
                              activeLeague,
                              archivedLeagues
                            );
                            const p2Stats = calculatePlayerCareerStats(
                              registeredPlayers.find((p) => p.name === p2.name) || { id: p2.name, name: p2.name },
                              activeLeague,
                              archivedLeagues
                            );

                            return (
                              <div
                                key={m.id}
                                className={`p-3 rounded-2xl border transition-all ${
                                  m.isPlayed
                                    ? 'bg-black/35 border-white/10'
                                    : 'bg-emerald-950/40 border-emerald-500/20 hover:border-emerald-400/40'
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                                  <span className="font-medium">
                                    هفته {m.round} • {m.leg === 1 ? 'دور رفت' : 'دور برگشت'}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMatchStory(m)}
                                      className="py-0.5 px-2 rounded-lg bg-white/10 hover:bg-amber-400/20 hover:text-amber-300 text-[10px] text-zinc-400 flex items-center gap-1 transition-colors"
                                      title="ساخت استوری این مسابقه"
                                    >
                                      <Share2 className="w-3 h-3" />
                                      <span>استوری 📸</span>
                                    </button>

                                    {m.isPlayed ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>انجام شده</span>
                                      </span>
                                    ) : (
                                      <span className="text-amber-400 font-medium text-xs">در انتظار</span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  {/* Player 1 (Home) */}
                                  <div className="flex-1 flex items-center gap-2 text-start">
                                    <TeamLogo teamName={p1.team} className="w-8 h-8 shrink-0" />
                                    <div className="truncate">
                                      <div className="flex items-center gap-1">
                                        <span className="block font-bold text-sm text-white truncate max-w-[95px]">
                                          {p1.name}
                                        </span>
                                        <PlayerFormBadge results={p1Stats.matches.map((x) => x.result)} />
                                      </div>
                                      <span className="text-xs text-emerald-400/90 font-medium block truncate max-w-[105px]">
                                        {p1.team}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Score or Action Button */}
                                  <div className="px-3 text-center">
                                    {m.isPlayed ? (
                                      <div className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/10 font-mono font-black text-lg text-emerald-400 tracking-wider">
                                        {m.score1} - {m.score2}
                                      </div>
                                    ) : (
                                      isAdmin ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setScoreEditMatchId(m.id);
                                            setScoreInput1(0);
                                            setScoreInput2(0);
                                          }}
                                          className="py-1.5 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all"
                                        >
                                          ثبت نتیجه
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setIsPredictionModalOpen(true)}
                                          className="py-1 px-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-[11px] font-bold flex items-center gap-1"
                                        >
                                          <Sparkles className="w-3 h-3" />
                                          <span>پیش‌بینی</span>
                                        </button>
                                      )
                                    )}
                                  </div>

                                  {/* Player 2 (Away) */}
                                  <div className="flex-1 flex items-center justify-end gap-2 text-end">
                                    <div className="truncate">
                                      <div className="flex items-center justify-end gap-1">
                                        <PlayerFormBadge results={p2Stats.matches.map((x) => x.result)} />
                                        <span className="font-bold text-sm text-white truncate max-w-[95px]">
                                          {p2.name}
                                        </span>
                                      </div>
                                      <span className="text-xs text-emerald-400/90 font-medium block truncate max-w-[105px]">
                                        {p2.team}
                                      </span>
                                    </div>
                                    <TeamLogo teamName={p2.team} className="w-8 h-8 shrink-0" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LEAGUE TABLE & STANDINGS (جدول با آیکون تاج 👑 برای نفر اول) */}
          {activeTab === 'table' && (
            <div className="space-y-4 animate-fadeIn my-auto w-full">
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
                  <h3 className="font-bold text-base text-emerald-300 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-emerald-400" />
                    <span>
                      {activeLeague?.mode === 'cup'
                        ? 'نمودار درختی مسابقات جام حذفی 🏆'
                        : `جدول رده‌بندی ${activeLeague?.name || 'لیگ'}`}
                    </span>
                  </h3>

                  {activeLeague?.mode !== 'cup' && standings.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setStoryPosterParams({
                          posterType: 'table',
                          title: 'LEAGUE STANDINGS',
                          leagueName: activeLeague?.name,
                          standings: standings,
                        });
                        setIsStoryPosterOpen(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>پوستر استوری جدول 📸</span>
                    </button>
                  )}
                </div>

                {activeLeague?.mode === 'cup' ? (
                  <div className="space-y-4 animate-fadeIn">
                    <KnockoutBracket
                      activeLeague={activeLeague}
                      isAdmin={isAdmin}
                      onEditMatch={(mId) => {
                        setScoreEditMatchId(mId);
                        setScoreInput1(0);
                        setScoreInput2(0);
                      }}
                    />
                  </div>
                ) : standings.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Trophy className="w-8 h-8 mx-auto text-zinc-500" />
                    <p className="text-sm text-zinc-300 font-medium">هنوز مسابقه‌ای در جدول ثبت نشده است.</p>
                    <p className="text-xs text-zinc-400">
                      برای شروع با زدن دکمه + در بالا، لیگ را ایجاد و قرعه‌کشی کنید.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-sm">
                        <thead>
                          <tr className="text-zinc-300 border-b border-white/10 pb-2 text-xs font-bold">
                            <th className="py-2.5 text-start px-2">#</th>
                            <th className="py-2.5 text-start">بازیکن و تیم</th>
                            <th className="py-2.5">بازی</th>
                            <th className="py-2.5">برد</th>
                            <th className="py-2.5">مساوی</th>
                            <th className="py-2.5">باخت</th>
                            <th className="py-2.5">تفاضل</th>
                            <th className="py-2.5 font-black text-emerald-400">امتیاز</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {standings.map((row) => {
                            const pObj = registeredPlayers.find((p) => p.name === row.name) || { id: row.name, name: row.name };
                            const pStats = calculatePlayerCareerStats(pObj, activeLeague, archivedLeagues);

                            return (
                              <tr
                                key={row.name}
                                className={`hover:bg-white/5 transition-colors ${
                                  row.rank === 1 ? 'bg-amber-400/10' : ''
                                }`}
                              >
                                <td className="py-3 px-2 text-start font-bold">
                                  {row.rank === 1 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/25 text-amber-300 text-xs font-black">
                                      ۱
                                    </span>
                                  ) : (
                                    <span className="text-zinc-400 text-xs font-semibold">{row.rank}</span>
                                  )}
                                </td>

                                {/* Player Name with Crown 👑 on the left side of the name, Form Arrow & Team Logo */}
                                <td className="py-3 text-start font-bold text-white">
                                  <div className="flex items-center gap-2">
                                    <TeamLogo teamName={row.team} className="w-6 h-6 shrink-0" />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="block text-white font-extrabold text-sm">{row.name}</span>
                                        {row.rank === 1 && (
                                          <Crown className="w-4.5 h-4.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
                                        )}
                                        <PlayerFormBadge results={pStats.matches.map((x) => x.result)} />
                                      </div>
                                      <span className="block text-xs text-zinc-400 font-normal">{row.team}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 text-zinc-200 font-medium text-xs sm:text-sm">{row.played}</td>
                                <td className="py-3 text-zinc-200 font-medium text-xs sm:text-sm">{row.won}</td>
                                <td className="py-3 text-zinc-200 font-medium text-xs sm:text-sm">{row.drawn}</td>
                                <td className="py-3 text-zinc-200 font-medium text-xs sm:text-sm">{row.lost}</td>
                                <td className="py-3 font-mono text-xs sm:text-sm text-zinc-200 font-semibold dir-ltr">
                                  {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                                </td>
                                <td className="py-3 font-black text-base text-emerald-400 font-mono">
                                  {row.points}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Position Progression Chart Across Season */}
                    {activeLeague && (
                      <div className="mt-5 pt-4 border-t border-white/10">
                        <PositionProgressionChart activeLeague={activeLeague} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ARCHIVED HISTORY (تاریخچه با ذخیره لیگ‌های پایان‌یافته و نتایج) */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn my-auto w-full">
              <div className="rounded-3xl p-4 bg-emerald-950/50 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-bold text-base text-emerald-300 flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-400" />
                    <span>تاریخچه و تالار افتخارات لیگ‌ها</span>
                  </h3>
                </div>

                {archivedLeagues.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Archive className="w-8 h-8 mx-auto text-zinc-500" />
                    <p className="text-sm text-zinc-300 font-medium">هنوز هیچ لیگی به اتمام نرسیده است.</p>
                    <p className="text-xs text-zinc-400">
                      وقتی تمام بازی‌های یک لیگ انجام شود، نتایج کامل و جدول رده‌بندی به اینجا منتقل می‌شود.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {archivedLeagues.map((archived) => (
                      <div
                        key={archived.id}
                        className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3"
                      >
                        {/* League Title & Date */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <h4 className="font-bold text-base text-white">{archived.name}</h4>
                          <span className="text-xs text-zinc-300">{archived.finishedAt}</span>
                        </div>

                        {/* Champion Spotlight Badge with Crown 👑, Team Logo & Celebration */}
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-400/30 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
                              <Crown className="w-6 h-6 drop-shadow-[0_0_8px_#fbbf24]" />
                            </div>
                            <div>
                              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                                قهرمان مسابقات
                              </span>
                              <span className="text-base font-black text-white">
                                {archived.championName} ({archived.championTeam})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setCelebrationData({
                                  championName: archived.championName,
                                  championTeam: archived.championTeam,
                                  leagueName: archived.name,
                                  avatarUrl: registeredPlayers.find((p) => p.name === archived.championName)?.avatarUrl,
                                });
                                setIsCelebrationOpen(true);
                              }}
                              className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs flex items-center gap-1 shadow active:scale-95 transition-all"
                            >
                              <Trophy className="w-3.5 h-3.5" />
                              <span>جشن قهرمانی 🏆</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setStoryPosterParams({
                                  title: 'CHAMPION OF LEAGUE',
                                  player1Name: archived.championName,
                                  player1Team: archived.championTeam,
                                  player2Name: 'WINNER',
                                  player2Team: 'GOLD TROPHY',
                                  isPlayed: true,
                                  leagueName: archived.name,
                                });
                                setIsStoryPosterOpen(true);
                              }}
                              className="py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>استوری 📸</span>
                            </button>

                            <TeamLogo teamName={archived.championTeam} className="w-9 h-9 shrink-0" />
                          </div>
                        </div>

                        {/* Final Standings Table in History */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-center text-xs sm:text-sm">
                            <thead>
                              <tr className="text-zinc-300 border-b border-white/10 pb-1 text-xs font-bold">
                                <th className="py-1.5 text-start">#</th>
                                <th className="py-1.5 text-start">بازیکن</th>
                                <th className="py-1.5">بازی</th>
                                <th className="py-1.5">برد</th>
                                <th className="py-1.5">تفاضل</th>
                                <th className="py-1.5 font-bold text-emerald-400">امتیاز</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {archived.standings.map((s) => (
                                <tr key={s.name}>
                                  <td className="py-2 text-start font-bold text-zinc-300 text-xs sm:text-sm">{s.rank}</td>
                                  <td className="py-2 text-start font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
                                    <TeamLogo teamName={s.team} className="w-4 h-4 shrink-0" />
                                    <span>{s.name}</span>
                                    {s.rank === 1 && <Crown className="w-4 h-4 text-amber-400" />}
                                  </td>
                                  <td className="py-2 text-zinc-200">{s.played}</td>
                                  <td className="py-2 text-zinc-200">{s.won}</td>
                                  <td className="py-2 text-zinc-200 font-mono dir-ltr">{s.goalDiff}</td>
                                  <td className="py-2 font-black text-emerald-400 font-mono text-sm sm:text-base">{s.points}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Collapsible/List of Match Results under the table */}
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-xs text-zinc-300 font-bold mb-2 block">
                            نتایج مسابقات ثبت‌شده ({archived.matches.length} بازی):
                          </span>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                            {archived.matches.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/5 text-xs font-medium"
                              >
                                <span className="text-white truncate max-w-[100px]">{m.player1}</span>
                                <span className="font-mono font-black text-emerald-400 text-sm">
                                  {m.score1} - {m.score2}
                                </span>
                                <span className="text-white truncate max-w-[100px]">{m.player2}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal 1: Create League Wizard (Triggered by '+') */}
      <CreateLeagueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLeagueCreated={handleLeagueCreated}
      />

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
              <p className="text-sm text-zinc-200">
                فقط مدیر لیگ امکان ساخت لیگ و ثبت نتایج را دارد. اگر شما مدیر هستید، رمز عبور را وارد کنید:
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
                  <p className="text-xs text-rose-400 font-medium">{unlockError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm shadow hover:brightness-110 active:scale-95 transition-all"
                >
                  تایید رمز و ورود
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Enter Match Score with Dropdown Menu (0-20 goals) */}
      {scoreEditMatchId && (() => {
        const curMatch = activeLeague?.matches.find(m => m.id === scoreEditMatchId);
        const p1 = getPlayerLabel(curMatch?.player1Slot || 1);
        const p2 = getPlayerLabel(curMatch?.player2Slot || 2);

        return (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          >
            <div className="relative w-full max-w-sm rounded-3xl p-5 bg-emerald-950/95 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-white">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                  <Flame className="w-4.5 h-4.5 text-amber-400" />
                  <span>ثبت منویی نتیجه مسابقه</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setScoreEditMatchId(null)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveScore(scoreEditMatchId);
                }}
                className="mt-4 space-y-4"
              >
                <div className="flex items-center justify-between gap-3 text-center">
                  {/* Player 1 Dropdown */}
                  <div className="flex-1 flex flex-col items-center">
                    <TeamLogo teamName={p1.team} className="w-10 h-10 mb-2" />
                    <span className="block text-sm font-bold text-white mb-0.5 truncate max-w-[100px]">
                      {p1.name}
                    </span>
                    <span className="text-xs text-zinc-400 mb-2 truncate max-w-[100px]">
                      {p1.team}
                    </span>
                    <label className="text-[11px] text-zinc-400 mb-1 font-medium block">تعداد گل:</label>
                    <select
                      value={scoreInput1}
                      onChange={(e) => setScoreInput1(Number(e.target.value))}
                      className="w-full py-2.5 px-3 text-center rounded-xl bg-black/60 border border-white/15 font-mono text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      {Array.from({ length: 21 }, (_, i) => (
                        <option key={i} value={i} className="bg-slate-900 text-white font-mono text-base">
                          {i} گل
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-lg font-black text-zinc-500 font-mono mt-8">-</span>

                  {/* Player 2 Dropdown */}
                  <div className="flex-1 flex flex-col items-center">
                    <TeamLogo teamName={p2.team} className="w-10 h-10 mb-2" />
                    <span className="block text-sm font-bold text-white mb-0.5 truncate max-w-[100px]">
                      {p2.name}
                    </span>
                    <span className="text-xs text-zinc-400 mb-2 truncate max-w-[100px]">
                      {p2.team}
                    </span>
                    <label className="text-[11px] text-zinc-400 mb-1 font-medium block">تعداد گل:</label>
                    <select
                      value={scoreInput2}
                      onChange={(e) => setScoreInput2(Number(e.target.value))}
                      className="w-full py-2.5 px-3 text-center rounded-xl bg-black/60 border border-white/15 font-mono text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      {Array.from({ length: 21 }, (_, i) => (
                        <option key={i} value={i} className="bg-slate-900 text-white font-mono text-base">
                          {i} گل
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-extrabold text-sm shadow hover:brightness-110 active:scale-95 transition-all"
                >
                  ثبت قطعی در جدول
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal 4: Admin League Control (End early, edit players/teams, edit match scores, manage players) */}
      <AdminLeagueControlModal
        isOpen={isAdminLeagueControlOpen}
        onClose={() => setIsAdminLeagueControlOpen(false)}
        activeLeague={activeLeague}
        registeredPlayers={registeredPlayers}
        onUpdatePlayer={handleAdminUpdatePlayer}
        onUpdateMatchScore={handleAdminUpdateMatchScore}
        onResetMatch={handleAdminResetMatch}
        onEndLeagueEarly={handleFinishAndArchiveLeague}
        onAddPlayer={handleAddPlayer}
        onDeletePlayer={handleDeletePlayer}
        onUpdatePlayerAvatar={handleUpdatePlayerAvatar}
        onCreateLeague={handleOpenCreateLeague}
      />

      {/* Modal 5: Player Profiles & Career Statistics */}
      <PlayerProfilesModal
        isOpen={isProfilesModalOpen}
        onClose={() => setIsProfilesModalOpen(false)}
        registeredPlayers={registeredPlayers}
        activeLeague={activeLeague}
        archivedLeagues={archivedLeagues}
      />

      {/* Modal 6: Team Pick & Ban System */}
      <PickBanModal
        isOpen={isPickBanOpen}
        onClose={() => setIsPickBanOpen(false)}
        players={registeredPlayers.map((p) => p.name)}
        initialPicksBans={picksBans}
        onSave={(data) => setPicksBans(data)}
      />

      {/* Modal 7: Match Predictions & Leaderboard */}
      {activeLeague && (
        <MatchPredictionModal
          isOpen={isPredictionModalOpen}
          onClose={() => setIsPredictionModalOpen(false)}
          matches={activeLeague.matches}
          players={activeLeague.players}
          currentUserName={activeUser ? activeUser.name : (isAdmin ? 'آرتا' : 'کاربر مهمان')}
        />
      )}

      {/* Modal 8: Instagram / Telegram Story Poster Generator */}
      {storyPosterParams && (
        <StoryPosterModal
          isOpen={isStoryPosterOpen}
          onClose={() => setIsStoryPosterOpen(false)}
          posterType={storyPosterParams.posterType}
          standings={storyPosterParams.standings}
          title={storyPosterParams.title}
          player1Name={storyPosterParams.player1Name}
          player1Team={storyPosterParams.player1Team}
          player2Name={storyPosterParams.player2Name}
          player2Team={storyPosterParams.player2Team}
          score1={storyPosterParams.score1}
          score2={storyPosterParams.score2}
          isPlayed={storyPosterParams.isPlayed}
          leagueName={storyPosterParams.leagueName}
        />
      )}

      {/* Modal 9: Championship Confetti Celebration & 3D Trophy */}
      {celebrationData && (
        <ChampionshipCelebration
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          championName={celebrationData.championName}
          championTeam={celebrationData.championTeam}
          leagueName={celebrationData.leagueName}
          avatarUrl={celebrationData.avatarUrl}
          onOpenStoryPoster={() => {
            setStoryPosterParams({
              title: 'CHAMPION OF LEAGUE',
              player1Name: celebrationData.championName,
              player1Team: celebrationData.championTeam,
              player2Name: 'GOLD TROPHY',
              player2Team: 'CHAMPION',
              isPlayed: true,
              leagueName: celebrationData.leagueName,
            });
            setIsStoryPosterOpen(true);
          }}
        />
      )}

      {/* 2. Liquid Glass Bottom Navigation Bar (چرخونه - بازی‌ها - جدول - تاریخچه) */}
      {!isProfilesModalOpen && (
        <LiquidBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mode={activeLeague?.mode}
        />
      )}
    </div>
  );
};

export default App;
