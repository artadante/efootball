import { ActiveLeague, ArchivedLeague } from '../types/league';
import { RegisteredPlayer } from '../types/player';
import { calculatePlayerCareerStats } from './playerStats';

export interface GuinnessRecordItem {
  id: string;
  title: string;
  emoji: string;
  holderName: string;
  recordValue: string;
  description: string;
  badgeColor: string;
}

export function calculateGuinnessRecords(
  registeredPlayers: RegisteredPlayer[],
  activeLeague: ActiveLeague | null,
  archivedLeagues: ArchivedLeague[]
): GuinnessRecordItem[] {
  const records: GuinnessRecordItem[] = [];

  // Gather all completed matches across active and archived
  interface UnifiedMatch {
    leagueName: string;
    p1: string;
    p2: string;
    t1: string;
    t2: string;
    s1: number;
    s2: number;
    totalGoals: number;
    diff: number;
  }

  const allMatches: UnifiedMatch[] = [];

  for (const arc of archivedLeagues) {
    for (const m of arc.matches) {
      const s1 = m.score1;
      const s2 = m.score2;
      allMatches.push({
        leagueName: arc.name,
        p1: m.player1,
        p2: m.player2,
        t1: m.team1,
        t2: m.team2,
        s1,
        s2,
        totalGoals: s1 + s2,
        diff: Math.abs(s1 - s2),
      });
    }
  }

  if (activeLeague) {
    for (const m of activeLeague.matches) {
      if (!m.isPlayed || m.score1 === null || m.score2 === null || m.score1 === undefined || m.score2 === undefined) continue;
      const slot1 = activeLeague.players.find((p) => p.slot === m.player1Slot);
      const slot2 = activeLeague.players.find((p) => p.slot === m.player2Slot);
      const p1 = slot1?.name || `بازیکن ${m.player1Slot}`;
      const p2 = slot2?.name || `بازیکن ${m.player2Slot}`;
      const t1 = slot1?.team || `تیم ${m.player1Slot}`;
      const t2 = slot2?.team || `تیم ${m.player2Slot}`;
      const s1 = m.score1;
      const s2 = m.score2;
      allMatches.push({
        leagueName: activeLeague.name,
        p1,
        p2,
        t1,
        t2,
        s1,
        s2,
        totalGoals: s1 + s2,
        diff: Math.abs(s1 - s2),
      });
    }
  }

  // 1. پرگل‌ترین مسابقه تاریخ
  if (allMatches.length > 0) {
    const highestScoring = [...allMatches].sort((a, b) => b.totalGoals - a.totalGoals)[0];
    records.push({
      id: 'highest-scoring-match',
      title: 'پرگل‌ترین مسابقه تاریخ',
      emoji: '⚽🔥',
      holderName: `${highestScoring.p1} & ${highestScoring.p2}`,
      recordValue: `${highestScoring.totalGoals} گل (${highestScoring.s1} - ${highestScoring.s2})`,
      description: `در تقابل ${highestScoring.t1} و ${highestScoring.t2} (${highestScoring.leagueName})`,
      badgeColor: 'from-amber-500 to-yellow-400',
    });

    // 2. سنگین‌ترین شکست / تحقیرآمیزترین برد
    const biggestMargin = [...allMatches].sort((a, b) => b.diff - a.diff)[0];
    const winnerName = biggestMargin.s1 > biggestMargin.s2 ? biggestMargin.p1 : biggestMargin.p2;
    const loserName = biggestMargin.s1 > biggestMargin.s2 ? biggestMargin.p2 : biggestMargin.p1;
    const maxScore = Math.max(biggestMargin.s1, biggestMargin.s2);
    const minScore = Math.min(biggestMargin.s1, biggestMargin.s2);
    records.push({
      id: 'biggest-margin-win',
      title: 'سنگین‌ترین اختلاف گل',
      emoji: '🌪️',
      holderName: winnerName,
      recordValue: `${biggestMargin.diff}+ تفاضل (${maxScore} - ${minScore})`,
      description: `پیروزی قاطع ${winnerName} مقابل ${loserName} (${biggestMargin.leagueName})`,
      badgeColor: 'from-rose-500 to-red-400',
    });
  }

  // 3. پرافتخارترین بازیکن (بیشترین قهرمانی)
  const playerStatsList = registeredPlayers.map((player) =>
    calculatePlayerCareerStats(player, activeLeague, archivedLeagues)
  );

  const mostChampionships = [...playerStatsList].sort((a, b) => b.championships - a.championships)[0];
  if (mostChampionships && mostChampionships.championships > 0) {
    records.push({
      id: 'most-championships',
      title: 'پرافتخارترین قهرمان تاریخ',
      emoji: '👑',
      holderName: mostChampionships.playerName,
      recordValue: `${mostChampionships.championships} جام قهرمانی`,
      description: 'بیشترین عنوان قهرمانی در ادوار مختلف مسابقات لیگ دوستانه',
      badgeColor: 'from-yellow-400 to-amber-500',
    });
  }

  // 4. ماشین گلزنی تاریخ (بیشترین مجموع گل زده)
  const topScorer = [...playerStatsList].sort((a, b) => b.goalsFor - a.goalsFor)[0];
  if (topScorer && topScorer.goalsFor > 0) {
    records.push({
      id: 'all-time-top-scorer',
      title: 'آقای گل ادوار مسابقات',
      emoji: '🎯',
      holderName: topScorer.playerName,
      recordValue: `${topScorer.goalsFor} گل زده`,
      description: `میانگین ${(topScorer.goalsFor / Math.max(1, topScorer.totalMatches)).toFixed(1)} گل در هر مسابقه در ${topScorer.totalMatches} بازی`,
      badgeColor: 'from-emerald-400 to-green-500',
    });
  }

  // 5. بتن آرمه / مستحکم‌ترین خط دفاعی (کمترین میانگین گل خورده با حداقل ۲ بازی)
  const qualifiedDefenders = playerStatsList.filter((p) => p.totalMatches >= 2);
  if (qualifiedDefenders.length > 0) {
    const bestDefense = [...qualifiedDefenders].sort(
      (a, b) => a.goalsAgainst / a.totalMatches - b.goalsAgainst / b.totalMatches
    )[0];
    records.push({
      id: 'best-defense-wall',
      title: 'صخره بتنی / نفوذناپذیرترین خط دفاع',
      emoji: '🧱',
      holderName: bestDefense.playerName,
      recordValue: `${(bestDefense.goalsAgainst / bestDefense.totalMatches).toFixed(1)} میانگین گل خورده`,
      description: `کمترین دریافت گل در هر مسابقه (${bestDefense.goalsAgainst} گل خورده در ${bestDefense.totalMatches} بازی)`,
      badgeColor: 'from-cyan-400 to-blue-500',
    });
  }

  // 6. بالاترین درصد پیروزی (Win Rate)
  if (qualifiedDefenders.length > 0) {
    const bestWinRate = [...qualifiedDefenders].sort((a, b) => b.winRate - a.winRate)[0];
    records.push({
      id: 'highest-win-rate',
      title: 'بالاترین درصد پیروزی',
      emoji: '⚡',
      holderName: bestWinRate.playerName,
      recordValue: `%${bestWinRate.winRate} نرخ پیروزی`,
      description: `${bestWinRate.wins} برد از ${bestWinRate.totalMatches} مسابقه رسمی`,
      badgeColor: 'from-purple-400 to-pink-500',
    });
  }

  return records;
}
