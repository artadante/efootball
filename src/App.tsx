import React, { useState, useEffect } from 'react';
import { PitchBackground } from './components/PitchBackground';
import { LiquidBottomNav, TabType } from './components/LiquidBottomNav';
import { HeaderBar } from './components/HeaderBar';
import { NewsTicker } from './components/NewsTicker';
import { MatchesView } from './components/MatchesView';
import { StandingsView } from './components/StandingsView';
import { HistoryView } from './components/HistoryView';
import { SkeletonLoader } from './components/SkeletonLoader';
import { DualWheel } from './components/DualWheel';
import { CreateLeagueModal } from './components/CreateLeagueModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ScoreEntryModal } from './components/ScoreEntryModal';
import { AdminLeagueControlModal } from './components/AdminLeagueControlModal';
import { PlayerProfilesModal } from './components/PlayerProfilesModal';
import { PickBanModal, PlayerPickBan } from './components/PickBanModal';
import { MatchPredictionModal } from './components/MatchPredictionModal';
import { ChampionshipCelebration } from './components/ChampionshipCelebration';
import {
  fetchRemoteLeagueState,
  syncSaveLeagueState,
  subscribeToRealtimeLeague,
  getLocalLeagueState,
} from './services/leagueStorage';
import { ActiveLeague, ArchivedLeague, StandingRow } from './types/league';
import { RegisteredPlayer, DEFAULT_FIXED_PLAYERS } from './types/player';
import { soundEngine } from './utils/soundEffects';
import { generateMatchdayNews } from './utils/newsGenerator';
import { advanceCupTree } from './utils/fixtureGenerator';

export interface AppProps {
  initialLoading?: boolean;
}

export const App: React.FC<AppProps> = ({ initialLoading }) => {
  // Skeleton Screen Loading State: In tests it starts as false; in browser it starts as true for smooth loading
  const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (initialLoading !== undefined) return initialLoading;
    return !isTestEnv;
  });

  const [activeTab, setActiveTab] = useState<TabType>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminLeagueControlOpen, setIsAdminLeagueControlOpen] = useState(false);
  const [isProfilesModalOpen, setIsProfilesModalOpen] = useState(false);
  const [scoreEditMatchId, setScoreEditMatchId] = useState<string | null>(null);
  const [legFilter, setLegFilter] = useState<1 | 2>(1);

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

  // Standings table calculation
  const [standings, setStandings] = useState<StandingRow[]>([]);

  // Fetch initial remote state and subscribe to live changes across all devices
  useEffect(() => {
    const minLoadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 450);

    fetchRemoteLeagueState().then((remote) => {
      if (remote) {
        if (remote.activeLeague !== undefined) setActiveLeague(remote.activeLeague);
        if (remote.archivedLeagues !== undefined) setArchivedLeagues(remote.archivedLeagues);
        if (remote.registeredPlayers && remote.registeredPlayers.length > 0) {
          setRegisteredPlayers(remote.registeredPlayers);
        }
      }
      setIsLoading(false);
    });

    const unsubscribe = subscribeToRealtimeLeague((remoteState) => {
      setActiveLeague(remoteState.activeLeague);
      setArchivedLeagues(remoteState.archivedLeagues || []);
      if (remoteState.registeredPlayers && remoteState.registeredPlayers.length > 0) {
        setRegisteredPlayers(remoteState.registeredPlayers);
      }
    });

    return () => {
      clearTimeout(minLoadTimer);
      unsubscribe();
    };
  }, []);

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
    setActiveTab('wheel');
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
  const handleSaveScore = (matchId: string, s1: number, s2: number) => {
    if (!activeLeague || !isAdmin) return;

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

    setCelebrationData({
      championName,
      championTeam,
      leagueName: activeLeague.name,
      avatarUrl: registeredPlayers.find((p) => p.name === championName)?.avatarUrl,
    });
    setIsCelebrationOpen(true);

    saveActiveLeague(null);
    setActiveTab('history');
  };

  // News ticker data
  const newsHeadlines = generateMatchdayNews(activeLeague);
  const visibleHeadlines = newsHeadlines.filter((n) => !dismissedNewsIds.includes(n.id));
  const latestNews = visibleHeadlines[0] || null;

  // Selected match for score entry modal
  const curScoreMatch = activeLeague?.matches.find((m) => m.id === scoreEditMatchId);
  const curP1 = curScoreMatch ? getPlayerLabel(curScoreMatch.player1Slot) : { name: '', team: '' };
  const curP2 = curScoreMatch ? getPlayerLabel(curScoreMatch.player2Slot) : { name: '', team: '' };

  // If skeleton loading is active, render SkeletonLoader
  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#041308] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* 1. Football Pitch Background */}
      <PitchBackground />

      {/* Main Container Shell */}
      <div className="relative z-10 w-full max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen flex flex-col px-3.5 sm:px-6 pt-4 pb-28">
        {/* Header Bar */}
        <HeaderBar
          activeLeague={activeLeague}
          isAdmin={isAdmin}
          activeUser={activeUser}
          registeredPlayers={registeredPlayers}
          onAdminLogin={handleAdminLogin}
          onAdminLogout={handleAdminLogout}
          onOpenLeagueControl={() => setIsAdminLeagueControlOpen(true)}
          onCreateLeague={handleOpenCreateLeague}
          onSelectActiveUser={handleSelectActiveUser}
          onOpenProfilesModal={() => setIsProfilesModalOpen(true)}
        />

        {/* Dynamic Sports News Ticker with Dismiss Button */}
        {activeLeague && latestNews && (
          <NewsTicker
            latestNews={latestNews}
            onDismissNews={handleDismissNews}
          />
        )}

        {/* Dynamic Views Content based on active tab */}
        <main className="mt-3 flex-1 flex flex-col justify-center">
          {activeTab === 'wheel' && (
            <DualWheel
              activeLeague={activeLeague}
              registeredPlayers={registeredPlayers}
              onSlotAssigned={handleSlotAssigned}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesView
              activeLeague={activeLeague}
              isAdmin={isAdmin}
              legFilter={legFilter}
              onSetLegFilter={setLegFilter}
              onOpenPrediction={() => setIsPredictionModalOpen(true)}
              onStartScoreEdit={(matchId) => setScoreEditMatchId(matchId)}
              onFinishAndArchiveLeague={handleFinishAndArchiveLeague}
              getPlayerLabel={getPlayerLabel}
            />
          )}

          {activeTab === 'table' && (
            <StandingsView
              activeLeague={activeLeague}
              standings={standings}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              archivedLeagues={archivedLeagues}
              registeredPlayers={registeredPlayers}
              onOpenCelebration={(data) => {
                setCelebrationData(data);
                setIsCelebrationOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Modal 1: Create League Wizard */}
      <CreateLeagueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLeagueCreated={handleLeagueCreated}
      />

      {/* Modal 2: Visitor Prompt to Enter Admin PIN */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAdminLogin={handleAdminLogin}
      />

      {/* Modal 3: Score Entry Modal */}
      <ScoreEntryModal
        isOpen={Boolean(scoreEditMatchId)}
        onClose={() => setScoreEditMatchId(null)}
        onSaveScore={(s1, s2) => {
          if (scoreEditMatchId) {
            handleSaveScore(scoreEditMatchId, s1, s2);
          }
        }}
        p1={curP1}
        p2={curP2}
      />

      {/* Modal 4: Admin League Control */}
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
          activeUser={activeUser}
          registeredPlayers={registeredPlayers}
          onSelectActiveUser={handleSelectActiveUser}
          currentUserName={activeUser ? activeUser.name : (isAdmin ? 'آرتا' : '')}
        />
      )}

      {/* Modal 8: Championship Confetti Celebration & 3D Trophy */}
      {celebrationData && (
        <ChampionshipCelebration
          isOpen={isCelebrationOpen}
          onClose={() => setIsCelebrationOpen(false)}
          championName={celebrationData.championName}
          championTeam={celebrationData.championTeam}
          leagueName={celebrationData.leagueName}
          avatarUrl={celebrationData.avatarUrl}
        />
      )}

      {/* Bottom Navigation Bar */}
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
