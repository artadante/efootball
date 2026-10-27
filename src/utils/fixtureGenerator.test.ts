import { describe, it, expect } from 'vitest';
import { generateFixtures } from './fixtureGenerator';

describe('fixtureGenerator', () => {
  it('generates two-legged round robin fixtures for 4 players', () => {
    const matches = generateFixtures(4, 'league');

    // For 4 players, total matches = 4 * 3 = 12 matches (6 in Leg 1, 6 in Leg 2)
    expect(matches.length).toBe(12);

    const leg1 = matches.filter(m => m.leg === 1);
    const leg2 = matches.filter(m => m.leg === 2);

    expect(leg1.length).toBe(6);
    expect(leg2.length).toBe(6);

    // Each match in leg 2 should be the reverse pairing of a match in leg 1
    leg1.forEach(m1 => {
      const reversedMatch = leg2.find(
        m2 => m2.player1Slot === m1.player2Slot && m2.player2Slot === m1.player1Slot
      );
      expect(reversedMatch).toBeDefined();
    });
  });

  it('assigns round numbers properly across legs', () => {
    const matches = generateFixtures(4, 'league');
    const leg1Rounds = new Set(matches.filter(m => m.leg === 1).map(m => m.round));
    const leg2Rounds = new Set(matches.filter(m => m.leg === 2).map(m => m.round));

    // For 4 players: 3 rounds in leg 1 (weeks 1..3), 3 rounds in leg 2 (weeks 4..6)
    expect(leg1Rounds.size).toBe(3);
    expect(leg2Rounds.size).toBe(3);
  });
});
