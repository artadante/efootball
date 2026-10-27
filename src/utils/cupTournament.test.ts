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

  it('generates direct grand final for 2 players', () => {
    const matches = generateFixtures(2, 'cup');
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe('cup_r1_final');
    expect(matches[0].round).toBe(1);
    expect(matches[0].player1Slot).toBe(1);
    expect(matches[0].player2Slot).toBe(2);
  });

  it('generates knockout bracket for 8 players and advances winners', () => {
    const matches = generateFixtures(8, 'cup');
    expect(matches.length).toBe(7); // 4 QFs + 2 SFs + 1 Final

    // Simulate QF 1 and QF 2
    matches[0].isPlayed = true; // QF 1: slot 1 vs slot 2 -> slot 1 wins
    matches[0].score1 = 2;
    matches[0].score2 = 0;

    matches[1].isPlayed = true; // QF 2: slot 3 vs slot 4 -> slot 3 wins
    matches[1].score1 = 1;
    matches[1].score2 = 0;

    const advanced = advanceCupTree(matches);
    const sf1 = advanced.find((m) => m.id === 'cup_r2_m1')!;
    expect(sf1.player1Slot).toBe(1);
    expect(sf1.player2Slot).toBe(3);
  });

  it('generates knockout bracket for 16 players and advances winners', () => {
    const matches = generateFixtures(16, 'cup');
    expect(matches.length).toBe(15); // 8 R16 + 4 QF + 2 SF + 1 Final

    // Simulate R16 Match 1 (slot 1 vs 2) and Match 2 (slot 3 vs 4)
    matches[0].isPlayed = true;
    matches[0].score1 = 4;
    matches[0].score2 = 1;

    matches[1].isPlayed = true;
    matches[1].score1 = 0;
    matches[1].score2 = 3;

    const advanced = advanceCupTree(matches);
    const qf1 = advanced.find((m) => m.id === 'cup_r2_m1')!;
    expect(qf1.player1Slot).toBe(1);
    expect(qf1.player2Slot).toBe(4);
  });
});
