import { describe, it, expect } from 'vitest';
import { generateFixtures, advanceCupTree } from './fixtureGenerator';

describe('Cup Knockout Tournament & Bracket', () => {
  it('generates multi-round knockout bracket for 4 players with final match', () => {
    const matches = generateFixtures(4, 'cup');
    expect(matches.length).toBe(3); // 2 semi-finals + 1 final

    const round1 = matches.filter((m) => m.round === 1);
    const round2 = matches.filter((m) => m.round === 2);

    expect(round1.length).toBe(2);
    expect(round2.length).toBe(1);
    expect(round2[0].id).toBe('cup_r2_final');
    expect(round2[0].player1Slot).toBe(0); // Pending winner
    expect(round2[0].player2Slot).toBe(0);
  });

  it('automatically advances winners to final when semi-finals are played', () => {
    const matches = generateFixtures(4, 'cup');

    // Simulate semi-final 1: Slot 1 vs Slot 2 (Slot 1 wins 3-1)
    matches[0].isPlayed = true;
    matches[0].score1 = 3;
    matches[0].score2 = 1;

    // Simulate semi-final 2: Slot 3 vs Slot 4 (Slot 4 wins 0-2)
    matches[1].isPlayed = true;
    matches[1].score1 = 0;
    matches[1].score2 = 2;

    const advanced = advanceCupTree(matches);
    const finalMatch = advanced.find((m) => m.id === 'cup_r2_final')!;

    expect(finalMatch.player1Slot).toBe(1); // Winner of SF 1
    expect(finalMatch.player2Slot).toBe(4); // Winner of SF 2
  });
});
