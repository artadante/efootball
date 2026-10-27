import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryView } from './HistoryView';
import { ArchivedLeague } from '../types/league';
import { RegisteredPlayer } from '../types/player';

describe('HistoryView Component', () => {
  const mockRegisteredPlayers: RegisteredPlayer[] = [
    { id: '1', name: 'پدرام', isDefault: true, createdAt: '1403/01/01' },
    { id: '2', name: 'آرتا', isDefault: true, createdAt: '1403/01/01' },
  ];

  const mockArchivedLeagues: ArchivedLeague[] = [
    {
      id: 'league-1',
      name: 'لیگ دوستانه ۱',
      mode: 'league',
      finishedAt: '1403/08/01',
      championName: 'پدرام',
      championTeam: 'منچسترسیتی',
      isManuallyPaused: true,
      standings: [
        {
          rank: 1,
          name: 'پدرام',
          team: 'منچسترسیتی',
          played: 3,
          won: 3,
          drawn: 0,
          lost: 0,
          goalsFor: 8,
          goalsAgainst: 2,
          goalDiff: 6,
          points: 9,
        },
        {
          rank: 2,
          name: 'آرتا',
          team: 'چلسی',
          played: 3,
          won: 1,
          drawn: 1,
          lost: 1,
          goalsFor: 4,
          goalsAgainst: 5,
          goalDiff: -1,
          points: 4,
        },
      ],
      matches: [
        {
          id: 'm1',
          leg: 1,
          round: 1,
          player1: 'پدرام',
          team1: 'منچسترسیتی',
          score1: 3,
          score2: 1,
          player2: 'آرتا',
          team2: 'چلسی',
        },
      ],
    },
  ];

  it('renders archived league with status badge, standings, and action buttons', () => {
    const handleResume = vi.fn();
    const handleCelebration = vi.fn();

    render(
      <HistoryView
        archivedLeagues={mockArchivedLeagues}
        registeredPlayers={mockRegisteredPlayers}
        onOpenCelebration={handleCelebration}
        onResumeLeague={handleResume}
      />
    );

    expect(screen.getByText('لیگ دوستانه ۱')).toBeInTheDocument();
    expect(screen.getByText(/متوقف‌شده \(آماده ادامه\)/i)).toBeInTheDocument();
    expect(screen.getByText(/پدرام \(منچسترسیتی\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ادامه این لیگ/i })).toBeInTheDocument();
  });

  it('triggers onResumeLeague when clicking "ادامه این لیگ"', () => {
    const handleResume = vi.fn();
    const handleCelebration = vi.fn();

    render(
      <HistoryView
        archivedLeagues={mockArchivedLeagues}
        registeredPlayers={mockRegisteredPlayers}
        onOpenCelebration={handleCelebration}
        onResumeLeague={handleResume}
      />
    );

    const resumeBtn = screen.getByRole('button', { name: /ادامه این لیگ/i });
    fireEvent.click(resumeBtn);

    expect(handleResume).toHaveBeenCalledWith('league-1');
  });

  it('shows empty message when no leagues are archived', () => {
    render(
      <HistoryView
        archivedLeagues={[]}
        registeredPlayers={mockRegisteredPlayers}
        onOpenCelebration={vi.fn()}
      />
    );

    expect(screen.getByText('هنوز هیچ لیگی در تاریخچه ثبت نشده است.')).toBeInTheDocument();
  });
});
