import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StandingsView } from './StandingsView';
import { ActiveLeague, StandingRow } from '../types/league';

describe('StandingsView Component', () => {
  const mockLeague: ActiveLeague = {
    id: 'league-1',
    name: 'لیگ آزمایشی',
    mode: 'league',
    playerCount: 2,
    players: [
      { slot: 1, name: 'آرتا', team: 'رئال مادرید' },
      { slot: 2, name: 'پدرام', team: 'بارسلونا' },
    ],
    matches: [
      {
        id: 'm1',
        leg: 1,
        round: 1,
        player1Slot: 1,
        player2Slot: 2,
        score1: 2,
        score2: 1,
        isPlayed: true,
      },
    ],
    createdAt: '1403/01/01',
    isFinished: false,
    wheelCompleted: true,
  };

  const mockStandings: StandingRow[] = [
    {
      rank: 1,
      name: 'آرتا',
      team: 'رئال مادرید',
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 1,
      goalDiff: 1,
      points: 3,
    },
    {
      rank: 2,
      name: 'پدرام',
      team: 'بارسلونا',
      played: 1,
      won: 0,
      drawn: 0,
      lost: 1,
      goalsFor: 1,
      goalsAgainst: 2,
      goalDiff: -1,
      points: 0,
    },
  ];

  it('renders table and keeps progression chart collapsed by default', () => {
    render(<StandingsView activeLeague={mockLeague} standings={mockStandings} />);

    // Table rows exist
    expect(screen.getByText('آرتا')).toBeInTheDocument();
    expect(screen.getByText('پدرام')).toBeInTheDocument();

    // Toggle button exists with initial closed state
    const toggleBtn = screen.getByRole('button', { name: /نمودار تغییرات رتبه در طول فصل/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByText('مشاهده نمودار')).toBeInTheDocument();

    // Chart content should not be visible initially
    expect(screen.queryByText('روند رتبه‌ها در هفته‌ها')).not.toBeInTheDocument();

    // Click to open chart
    fireEvent.click(toggleBtn);
    expect(screen.getByText('بستن نمودار')).toBeInTheDocument();

    // Click again to close chart
    fireEvent.click(toggleBtn);
    expect(screen.getByText('مشاهده نمودار')).toBeInTheDocument();
  });
});
