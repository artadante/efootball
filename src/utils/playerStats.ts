import { ActiveLeague, ArchivedLeague } from '../types/league';
import { PlayerCareerStats, PlayerMatchRecord, RegisteredPlayer } from '../types/player';

export function calculatePlayerCareerStats(
  player: RegisteredPlayer,
  activeLeague: ActiveLeague | null,
  archivedLeagues: ArchivedLeague[]
): PlayerCareerStats {
  const targetName = player.name.trim();
  const matches: PlayerMatchRecord[] = [];
  const teamsSet = new Set<string>();
  let championships = 0;

  // 1. Process Archived Leagues (Historical Completed Tournaments)
  for (const archived of archivedLeagues) {
    if (archived.championName && archived.championName.trim() === targetName) {
      championships += 1;
    }

    // Map player name to team in this archived league
    const playerStanding = archived.standings.find(
      (s) => s.name && s.name.trim() === targetName
    );
    if (playerStanding && playerStanding.team) {
      teamsSet.add(playerStanding.team);
    }

    // Process each match in this archived tournament
    for (const m of archived.matches) {
      const p1 = m.player1 ? m.player1.trim() : '';
      const p2 = m.player2 ? m.player2.trim() : '';

      if (p1 !== targetName && p2 !== targetName) continue;

      const isPlayer1 = p1 === targetName;
      const myScore = isPlayer1 ? m.score1 : m.score2;
      const opponentScore = isPlayer1 ? m.score2 : m.score1;
      const opponentName = isPlayer1 ? p2 : p1;

      // Find teams
      const myStanding = archived.standings.find((s) => s.name.trim() === targetName);
      const oppStanding = archived.standings.find((s) => s.name.trim() === opponentName);
      const myTeam = myStanding?.team || 'تیم مشخص‌نشده';
      const opponentTeam = oppStanding?.team || 'تیم مشخص‌نشده';

      if (myTeam && myTeam !== 'تیم مشخص‌نشده') {
        teamsSet.add(myTeam);
      }

      let result: 'W' | 'D' | 'L' = 'D';
      let points = 1;

      if (myScore > opponentScore) {
        result = 'W';
        points = 3;
      } else if (myScore < opponentScore) {
        result = 'L';
        points = 0;
      }

      matches.push({
        id: m.id,
        leagueId: archived.id,
        leagueName: archived.name,
        date: archived.finishedAt,
        isArchived: true,
        myTeam,
        opponentName,
        opponentTeam,
        myScore,
        opponentScore,
        result,
        points,
      });
    }
  }

  // 2. Process Active League (Ongoing Tournament)
  if (activeLeague) {
    const activeSlot = activeLeague.players.find(
      (p) => p.name && p.name.trim() === targetName
    );

    if (activeSlot && activeSlot.team) {
      teamsSet.add(activeSlot.team);
    }

    if (activeSlot) {
      for (const m of activeLeague.matches) {
        if (!m.isPlayed || typeof m.score1 !== 'number' || typeof m.score2 !== 'number') continue;
        if (m.player1Slot !== activeSlot.slot && m.player2Slot !== activeSlot.slot) continue;

        const isPlayer1 = m.player1Slot === activeSlot.slot;
        const s1 = m.score1;
        const s2 = m.score2;
        const myScore = isPlayer1 ? s1 : s2;
        const opponentScore = isPlayer1 ? s2 : s1;

        const oppSlotNum = isPlayer1 ? m.player2Slot : m.player1Slot;
        const oppSlot = activeLeague.players.find((p) => p.slot === oppSlotNum);
        const opponentName = oppSlot?.name || `بازیکن ${oppSlotNum}`;
        const opponentTeam = oppSlot?.team || `تیم ${oppSlotNum}`;
        const myTeam = activeSlot.team || `تیم ${activeSlot.slot}`;

        let result: 'W' | 'D' | 'L' = 'D';
        let points = 1;

        if (myScore > opponentScore) {
          result = 'W';
          points = 3;
        } else if (myScore < opponentScore) {
          result = 'L';
          points = 0;
        }

        matches.push({
          id: m.id,
          leagueId: activeLeague.id,
          leagueName: activeLeague.name,
          date: m.playedAt,
          isArchived: false,
          myTeam,
          opponentName,
          opponentTeam,
          myScore,
          opponentScore,
          result,
          points,
        });
      }
    }
  }

  // Calculate career aggregates
  const totalMatches = matches.length;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of matches) {
    if (m.result === 'W') wins += 1;
    else if (m.result === 'D') draws += 1;
    else if (m.result === 'L') losses += 1;

    goalsFor += m.myScore;
    goalsAgainst += m.opponentScore;
  }

  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const goalDifference = goalsFor - goalsAgainst;

  // Performance points trend (running cumulative points or match points)
  const performancePoints = matches.map((m) => m.points);

  return {
    playerName: player.name,
    avatarUrl: player.avatarUrl,
    totalMatches,
    wins,
    draws,
    losses,
    winRate,
    goalsFor,
    goalsAgainst,
    goalDifference,
    championships,
    teamsPlayed: Array.from(teamsSet),
    matches: matches.reverse(), // latest matches first
    performancePoints,
  };
}
