import { CompetitionMode, ScheduledMatch } from '../types/league';

export function generateFixtures(playerCount: number, mode: CompetitionMode = 'league'): ScheduledMatch[] {
  const matches: ScheduledMatch[] = [];

  // Cup mode or League mode
  if (mode === 'cup') {
    // Knockout cup: pairings (1 vs 2, 3 vs 4, etc.)
    let matchId = 1;
    for (let i = 1; i <= playerCount; i += 2) {
      if (i + 1 <= playerCount) {
        matches.push({
          id: `cup_m_${matchId}`,
          leg: 1,
          round: 1,
          player1Slot: i,
          player2Slot: i + 1,
          isPlayed: false,
        });
        matchId++;
      }
    }
    return matches;
  }

  // League Mode: Two-legged Round Robin (نیم‌فصل اول رفت، نیم‌فصل دوم برگشت)
  // Ensure even count for polygon rotation
  const count = playerCount % 2 === 0 ? playerCount : playerCount + 1;
  const slots: (number | null)[] = Array.from({ length: count }, (_, i) => 
    i < playerCount ? i + 1 : null
  );

  const numRounds = count - 1;
  const half = count / 2;
  let matchCounter = 1;

  const leg1Matches: ScheduledMatch[] = [];

  // Generate Leg 1 (نیم‌فصل اول - بازی‌های رفت)
  for (let r = 0; r < numRounds; r++) {
    const roundNumber = r + 1;

    for (let i = 0; i < half; i++) {
      const p1 = slots[i];
      const p2 = slots[count - 1 - i];

      if (p1 !== null && p2 !== null) {
        // Alternate home/away for fair distribution
        const [home, away] = r % 2 === 0 ? [p1, p2] : [p2, p1];

        leg1Matches.push({
          id: `match_leg1_${matchCounter++}`,
          leg: 1,
          round: roundNumber,
          player1Slot: home,
          player2Slot: away,
          isPlayed: false,
        });
      }
    }

    // Rotate slots clockwise keeping slot[0] fixed
    const last = slots.pop()!;
    slots.splice(1, 0, last);
  }

  // Generate Leg 2 (نیم‌فصل دوم - بازی‌های برگشت: جابجایی میزبان و مهمان)
  const leg2Matches: ScheduledMatch[] = leg1Matches.map((m) => {
    return {
      id: `match_leg2_${matchCounter++}`,
      leg: 2,
      round: m.round + numRounds,
      player1Slot: m.player2Slot, // Inverted for away leg
      player2Slot: m.player1Slot,
      isPlayed: false,
    };
  });

  return [...leg1Matches, ...leg2Matches];
}
