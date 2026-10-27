// ELO / MMR Rating System for eFootball Friends League

export type EloTier = 'Master' | 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

export interface PlayerEloInfo {
  playerName: string;
  rating: number; // starts at 1200
  tier: EloTier;
  tierNameFa: string;
  tierColor: string;
  tierBg: string;
  matchesRated: number;
  recentDelta: number; // change from last match
}

export function getTierInfo(rating: number): { tier: EloTier; tierNameFa: string; tierColor: string; tierBg: string } {
  if (rating >= 1550) {
    return {
      tier: 'Master',
      tierNameFa: 'مسترز افسانه‌ای',
      tierColor: 'text-amber-300',
      tierBg: 'bg-amber-400/20 border-amber-400/40 text-amber-300',
    };
  }
  if (rating >= 1400) {
    return {
      tier: 'Diamond',
      tierNameFa: 'دیاموند',
      tierColor: 'text-cyan-300',
      tierBg: 'bg-cyan-400/20 border-cyan-400/40 text-cyan-300',
    };
  }
  if (rating >= 1300) {
    return {
      tier: 'Platinum',
      tierNameFa: 'پلاتینیوم',
      tierColor: 'text-emerald-300',
      tierBg: 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300',
    };
  }
  if (rating >= 1200) {
    return {
      tier: 'Gold',
      tierNameFa: 'طلا',
      tierColor: 'text-yellow-400',
      tierBg: 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300',
    };
  }
  if (rating >= 1100) {
    return {
      tier: 'Silver',
      tierNameFa: 'نقره',
      tierColor: 'text-slate-300',
      tierBg: 'bg-slate-400/20 border-slate-400/40 text-slate-300',
    };
  }
  return {
    tier: 'Bronze',
    tierNameFa: 'برنز',
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
    const expected1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
    const expected2 = 1 - expected1;

    // Actual outcome
    let actual1 = 0.5;
    let actual2 = 0.5;
    if (m.score1 > m.score2) {
      actual1 = 1;
      actual2 = 0;
    } else if (m.score2 > m.score1) {
      actual1 = 0;
      actual2 = 1;
    }

    // Goal margin multiplier
    const margin = Math.abs(m.score1 - m.score2);
    const marginMultiplier = margin <= 1 ? 1 : Math.log(margin + 1);

    const delta1 = Math.round(K_FACTOR * marginMultiplier * (actual1 - expected1));
    const delta2 = Math.round(K_FACTOR * marginMultiplier * (actual2 - expected2));

    ratings[p1] = Math.max(600, ratings[p1] + delta1);
    ratings[p2] = Math.max(600, ratings[p2] + delta2);

    matchCounts[p1] = (matchCounts[p1] || 0) + 1;
    matchCounts[p2] = (matchCounts[p2] || 0) + 1;

    recentDeltas[p1] = delta1;
    recentDeltas[p2] = delta2;
  }

  const result: Record<string, PlayerEloInfo> = {};
  playerNames.forEach((name) => {
    const r = ratings[name] || 1200;
    const tierData = getTierInfo(r);
    result[name] = {
      playerName: name,
      rating: r,
      tier: tierData.tier,
      tierNameFa: tierData.tierNameFa,
      tierColor: tierData.tierColor,
      tierBg: tierData.tierBg,
      matchesRated: matchCounts[name] || 0,
      recentDelta: recentDeltas[name] || 0,
    };
  });

  return result;
}
