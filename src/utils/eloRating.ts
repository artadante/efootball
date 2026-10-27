// ELO / MMR Rating System for eFootball Friends League

export type EloTier = 'Master' | 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

export interface PlayerEloInfo {
  playerName: string;
  rating: number; // starts at 1200
  tier: EloTier;
  tierNameFa: string;
  tierColor: string; // Tailwind color class or hex
  tierBg: string;
  matchesRated: number;
  recentDelta: number; // change from last match
}

export function getTierInfo(rating: number): { tier: EloTier; tierNameFa: string; tierColor: string; tierBg: string } {
  if (rating >= 1550) {
    return {
      tier: 'Master',
      tierNameFa: 'مسترز افسانه‌ای 👑',
      tierColor: 'text-amber-300',
      tierBg: 'bg-amber-400/20 border-amber-400/40 text-amber-300',
    };
  }
  if (rating >= 1400) {
    return {
      tier: 'Diamond',
      tierNameFa: 'دیاموند 💎',
      tierColor: 'text-cyan-300',
      tierBg: 'bg-cyan-400/20 border-cyan-400/40 text-cyan-300',
    };
  }
  if (rating >= 1300) {
    return {
      tier: 'Platinum',
      tierNameFa: 'پلاتینیوم ⚔️',
      tierColor: 'text-emerald-300',
      tierBg: 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300',
    };
  }
  if (rating >= 1200) {
    return {
      tier: 'Gold',
      tierNameFa: 'طلایی 🌟',
      tierColor: 'text-yellow-400',
      tierBg: 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300',
    };
  }
  if (rating >= 1100) {
    return {
      tier: 'Silver',
      tierNameFa: 'نقره‌ای 🛡️',
      tierColor: 'text-slate-300',
      tierBg: 'bg-slate-400/20 border-slate-400/40 text-slate-300',
    };
  }
  return {
    tier: 'Bronze',
    tierNameFa: 'برنزی 🥉',
    tierColor: 'text-orange-400',
    tierBg: 'bg-orange-500/20 border-orange-400/40 text-orange-300',
  };
}

/**
 * Calculates current ELO for all registered players based on chronologically ordered match history
 */
export function calculateAllPlayersElo(
  playerNames: string[],
  allMatchesChronological: {
    player1: string;
    player2: string;
    score1: number;
    score2: number;
  }[]
): Record<string, PlayerEloInfo> {
  const ratings: Record<string, number> = {};
  const matchCounts: Record<string, number> = {};
  const recentDeltas: Record<string, number> = {};

  // Default rating = 1200
  playerNames.forEach((name) => {
    ratings[name] = 1200;
    matchCounts[name] = 0;
    recentDeltas[name] = 0;
  });

  const K_FACTOR = 32;

  for (const m of allMatchesChronological) {
    const p1 = m.player1.trim();
    const p2 = m.player2.trim();

    if (!ratings[p1]) ratings[p1] = 1200;
    if (!ratings[p2]) ratings[p2] = 1200;

    const r1 = ratings[p1];
    const r2 = ratings[p2];

    // Expected probability
    const exp1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
    const exp2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

    // Actual score (1 for win, 0.5 for draw, 0 for loss)
    let act1 = 0.5;
    let act2 = 0.5;
    if (m.score1 > m.score2) {
      act1 = 1;
      act2 = 0;
    } else if (m.score1 < m.score2) {
      act1 = 0;
      act2 = 1;
    }

    const delta1 = Math.round(K_FACTOR * (act1 - exp1));
    const delta2 = Math.round(K_FACTOR * (act2 - exp2));

    ratings[p1] = Math.max(800, r1 + delta1);
    ratings[p2] = Math.max(800, r2 + delta2);

    matchCounts[p1] = (matchCounts[p1] || 0) + 1;
    matchCounts[p2] = (matchCounts[p2] || 0) + 1;

    recentDeltas[p1] = delta1;
    recentDeltas[p2] = delta2;
  }

  const result: Record<string, PlayerEloInfo> = {};
  Object.keys(ratings).forEach((name) => {
    const rating = ratings[name];
    const tierInfo = getTierInfo(rating);
    result[name] = {
      playerName: name,
      rating,
      ...tierInfo,
      matchesRated: matchCounts[name] || 0,
      recentDelta: recentDeltas[name] || 0,
    };
  });

  return result;
}
