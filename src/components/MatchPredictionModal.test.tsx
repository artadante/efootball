import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchPredictionModal } from './MatchPredictionModal';
import { ScheduledMatch, LeaguePlayer } from '../types/league';

describe('MatchPredictionModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockMatches: ScheduledMatch[] = [
    {
      id: 'm-1',
      round: 1,
      leg: 1,
      player1Slot: 1,
      player2Slot: 2,
      isPlayed: false,
      score1: null,
      score2: null,
    },
  ];

  const mockPlayers: LeaguePlayer[] = [
    { slot: 1, name: 'آرتا', team: 'بارسلونا' },
    { slot: 2, name: 'پدرام', team: 'رئال مادرید' },
  ];

  it('renders prediction dialog with match details and team names', () => {
    render(
      <MatchPredictionModal
        isOpen={true}
        onClose={vi.fn()}
        matches={mockMatches}
        players={mockPlayers}
        currentUserName="آرتا"
      />
    );

    expect(screen.getByText('پیش‌بینی نتایج مسابقات')).toBeInTheDocument();
    expect(screen.getByText(/برد آرتا/i)).toBeInTheDocument();
    expect(screen.getByText(/نتیجه تساوی/i)).toBeInTheDocument();
    expect(screen.getByText(/برد پدرام/i)).toBeInTheDocument();
  });

  it('enforces equal scores when draw is selected', () => {
    render(
      <MatchPredictionModal
        isOpen={true}
        onClose={vi.fn()}
        matches={mockMatches}
        players={mockPlayers}
        currentUserName="آرتا"
      />
    );

    // Switch to Draw
    fireEvent.click(screen.getByText(/نتیجه تساوی/i));

    // Must show equal numbers menu
    expect(screen.getByText(/نتیجه تساوی \(اعداد مساوی\)/i)).toBeInTheDocument();

    // Click 2 - 2 pill
    const pill2 = screen.getByRole('button', { name: '2 - 2' });
    fireEvent.click(pill2);

    // Save prediction
    fireEvent.click(screen.getByRole('button', { name: /ثبت پیش‌بینی من/i }));

    const saved = JSON.parse(localStorage.getItem('efootball_match_predictions') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].predictedWinner).toBe('draw');
    expect(saved[0].score1).toBe(2);
    expect(saved[0].score2).toBe(2);
  });

  it('enforces player 1 score higher than player 2 when P1 win is selected', () => {
    render(
      <MatchPredictionModal
        isOpen={true}
        onClose={vi.fn()}
        matches={mockMatches}
        players={mockPlayers}
        currentUserName="آرتا"
      />
    );

    // Click P1 win
    fireEvent.click(screen.getByText(/برد آرتا/i));
    expect(screen.getByText(/گل‌های آرتا \(بالاتر\)/i)).toBeInTheDocument();
    expect(screen.getByText(/گل‌های پدرام \(کمتر\)/i)).toBeInTheDocument();

    // Click 3 - 1 pill
    const pill31 = screen.getByRole('button', { name: '3 - 1' });
    fireEvent.click(pill31);

    fireEvent.click(screen.getByRole('button', { name: /ثبت پیش‌بینی من/i }));

    const saved = JSON.parse(localStorage.getItem('efootball_match_predictions') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].predictedWinner).toBe('p1');
    expect(saved[0].score1).toBe(3);
    expect(saved[0].score2).toBe(1);
    expect(saved[0].score1).toBeGreaterThan(saved[0].score2);
  });

  it('enforces player 2 score higher than player 1 when P2 win is selected', () => {
    render(
      <MatchPredictionModal
        isOpen={true}
        onClose={vi.fn()}
        matches={mockMatches}
        players={mockPlayers}
        currentUserName="آرتا"
      />
    );

    // Click P2 win
    fireEvent.click(screen.getByText(/برد پدرام/i));
    expect(screen.getByText(/گل‌های پدرام \(بالاتر\)/i)).toBeInTheDocument();
    expect(screen.getByText(/گل‌های آرتا \(کمتر\)/i)).toBeInTheDocument();

    // Click 1 - 3 pill
    const pill13 = screen.getByRole('button', { name: '1 - 3' });
    fireEvent.click(pill13);

    fireEvent.click(screen.getByRole('button', { name: /ثبت پیش‌بینی من/i }));

    const saved = JSON.parse(localStorage.getItem('efootball_match_predictions') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].predictedWinner).toBe('p2');
    expect(saved[0].score1).toBe(1);
    expect(saved[0].score2).toBe(3);
    expect(saved[0].score2).toBeGreaterThan(saved[0].score1);
  });
});
