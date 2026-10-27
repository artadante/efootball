import { CompetitionMode, ScheduledMatch } from '../types/league';

export function generateFixtures(playerCount: number, mode: CompetitionMode = 'league'): ScheduledMatch[] {
  const matches: ScheduledMatch[] = [];

  // Cup mode: Multi-round Knockout Tree
  if (mode === 'cup') {
    if (playerCount <= 4) {
      // 4 Players: 2 Semi-finals (Round 1) + 1 Grand Final (Round 2)
      matches.push({
        id: 'cup_r1_m1',
        leg: 1,
        round: 1,
        player1Slot: 1,
        player2Slot: 2,
        isPlayed: false,
      });
      matches.push({
        id: 'cup_r1_m2',
        leg: 1,
        round: 1,
        player1Slot: 3,
        player2Slot: 4,
        isPlayed: false,
      });
      matches.push({
        id: 'cup_r2_final',
        leg: 1,
        round: 2,
        player1Slot: 0, // Winner of Semi-final 1
        player2Slot: 0, // Winner of Semi-final 2
        isPlayed: false,
      });
      return matches;
    }

    if (playerCount <= 8) {
      // 8 Players: 4 Quarter-finals (Round 1), 2 Semi-finals (Round 2), 1 Grand Final (Round 3)
      matches.push({ id: 'cup_r1_m1', leg: 1, round: 1, player1Slot: 1, player2Slot: 2, isPlayed: false });
      matches.push({ id: 'cup_r1_m2', leg: 1, round: 1, player1Slot: 3, player2Slot: 4, isPlayed: false });
      matches.push({ id: 'cup_r1_m3', leg: 1, round: 1, player1Slot: 5, player2Slot: 6, isPlayed: false });
      matches.push({ id: 'cup_r1_m4', leg: 1, round: 1, player1Slot: 7, player2Slot: 8, isPlayed: false });

      matches.push({ id: 'cup_r2_m1', leg: 1, round: 2, player1Slot: 0, player2Slot: 0, isPlayed: false });
      matches.push({ id: 'cup_r2_m2', leg: 1, round: 2, player1Slot: 0, player2Slot: 0, isPlayed: false });

      matches.push({ id: 'cup_r3_final', leg: 1, round: 3, player1Slot: 0, player2Slot: 0, isPlayed: false });
      return matches;
    }

    // Default dynamic pairing for other counts
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

/**
 * Automatically advances winners to subsequent rounds in Cup Knockout tree
 */
export function advanceCupTree(matches: ScheduledMatch[]): ScheduledMatch[] {
  const updated = matches.map((m) => ({ ...m }));

  // Helper to find match winner
  const getWinnerSlot = (m?: ScheduledMatch) => {
    if (!m || !m.isPlayed || typeof m.score1 !== 'number' || typeof m.score2 !== 'number') {
      return 0;
    }
    return m.score1 >= m.score2 ? m.player1Slot : m.player2Slot;
  };

  // 4-player tree
  const r1m1 = updated.find((m) => m.id === 'cup_r1_m1');
  const r1m2 = updated.find((m) => m.id === 'cup_r1_m2');
  const r2Final = updated.find((m) => m.id === 'cup_r2_final');

  if (r2Final) {
    if (r1m1 && r1m1.isPlayed) {
      r2Final.player1Slot = getWinnerSlot(r1m1);
    }
    if (r1m2 && r1m2.isPlayed) {
      r2Final.player2Slot = getWinnerSlot(r1m2);
    }
  }

  // 8-player tree
  const qf1 = updated.find((m) => m.id === 'cup_r1_m1');
  const qf2 = updated.find((m) => m.id === 'cup_r1_m2');
  const qf3 = updated.find((m) => m.id === 'cup_r1_m3');
  const qf4 = updated.find((m) => m.id === 'cup_r1_m4');
  const sf1 = updated.find((m) => m.id === 'cup_r2_m1');
  const sf2 = updated.find((m) => m.id === 'cup_r2_m2');
  const final8 = updated.find((m) => m.id === 'cup_r3_final');

  if (sf1) {
    if (qf1 && qf1.isPlayed) sf1.player1Slot = getWinnerSlot(qf1);
    if (qf2 && qf2.isPlayed) sf1.player2Slot = getWinnerSlot(qf2);
  }
  if (sf2) {
    if (qf3 && qf3.isPlayed) sf2.player1Slot = getWinnerSlot(qf3);
    if (qf4 && qf4.isPlayed) sf2.player2Slot = getWinnerSlot(qf4);
  }
  if (final8) {
    if (sf1 && sf1.isPlayed) final8.player1Slot = getWinnerSlot(sf1);
    if (sf2 && sf2.isPlayed) final8.player2Slot = getWinnerSlot(sf2);
  }

  return updated;
}
