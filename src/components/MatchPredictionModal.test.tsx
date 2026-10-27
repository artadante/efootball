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

  it('provides score options up to 20 goals for win and up to 10 for draw', () => {
    render(
      <MatchPredictionModal
        isOpen={true}
        onClose={vi.fn()}
        matches={mockMatches}
        players={mockPlayers}
        currentUserName="آرتا"
      />
    );

    // Test Win options up to 20 goals
    fireEvent.click(screen.getByText(/برد آرتا/i));
    expect(screen.getByRole('option', { name: '20 گل' })).toBeInTheDocument();

    // Test Draw options up to 10 goals
    fireEvent.click(screen.getByText(/نتیجه تساوی/i));
    expect(screen.getByRole('option', { name: 'تساوی 10 - 10' })).toBeInTheDocument();
  });

  it('shows error and blocks prediction if user is not logged in', () => {
    const handleSelect = vi.fn();
    render(
      <MatchPredictionModal
        isOpen={true}
        onClose={vi.fn()}
        matches={mockMatches}
        players={mockPlayers}
        currentUserName="کاربر مهمان"
        registeredPlayers={[
          { id: '1', name: 'پدرام', isDefault: true, createdAt: '1403/01/01' },
        ]}
        onSelectActiveUser={handleSelect}
      />
    );

    // Shows login required error
    expect(screen.getByText(/خطا: ورود به حساب کاربری الزامی است!/i)).toBeInTheDocument();
    expect(screen.getByText(/برای پیش‌بینی وارد حساب خود شوید/i)).toBeInTheDocument();

    // Click quick login to Pedram
    const pedramBtn = screen.getByRole('button', { name: 'پدرام' });
    fireEvent.click(pedramBtn);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'پدرام' })
    );
  });
});
