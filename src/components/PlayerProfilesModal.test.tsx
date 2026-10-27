import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerProfilesModal } from './PlayerProfilesModal';
import { DEFAULT_FIXED_PLAYERS } from '../types/player';
import { ActiveLeague, ArchivedLeague } from '../types/league';

describe('PlayerProfilesModal Component', () => {
  const mockActiveLeague: ActiveLeague = {
    id: 'active-1',
    name: 'لیگ جاری',
    mode: 'league',
    playerCount: 2,
    wheelCompleted: true,
    isFinished: false,
    createdAt: '1405/01/01',
    players: [
      { slot: 1, name: 'آرتا', team: 'چلسی' },
      { slot: 2, name: 'پدرام', team: 'بارسلونا' },
    ],
    matches: [
      {
        id: 'm1',
        leg: 1,
        round: 1,
        player1Slot: 1,
        player2Slot: 2,
        score1: 3,
        score2: 1,
        isPlayed: true,
        playedAt: '1405/01/02',
      },
    ],
  };

  const mockArchivedLeagues: ArchivedLeague[] = [
    {
      id: 'arch-1',
      name: 'لیگ فصل قبل',
      mode: 'league',
      finishedAt: '1404/12/28',
      championName: 'آرتا',
      championTeam: 'چلسی',
      standings: [
        { 
          rank: 1, 
          name: 'آرتا', 
          team: 'چلسی', 
          played: 1, 
          won: 1, 
          drawn: 0, 
          lost: 0, 
          goalsFor: 2, 
          goalsAgainst: 0, 
          goalDiff: 2, 
          points: 3 
        },
      ],
      matches: [
        { 
          id: 'am1', 
          leg: 1, 
          round: 1, 
          player1: 'آرتا', 
          team1: 'چلسی', 
          score1: 2, 
          score2: 0, 
          player2: 'پدرام', 
          team2: 'بارسلونا' 
        },
      ],
    },
  ];

  it('renders directory with all registered players', () => {
    render(
      <PlayerProfilesModal
        isOpen={true}
        onClose={vi.fn()}
        registeredPlayers={DEFAULT_FIXED_PLAYERS}
        activeLeague={mockActiveLeague}
        archivedLeagues={mockArchivedLeagues}
      />
    );

    expect(screen.getByText(/پروفایل بازیکنان/i)).toBeInTheDocument();
    expect(screen.getByText('آرتا')).toBeInTheDocument();
    expect(screen.getByText('پدرام')).toBeInTheDocument();
    expect(screen.getByText('پیام')).toBeInTheDocument();
    expect(screen.getByText('سهند')).toBeInTheDocument();
    expect(screen.getByText('بابک')).toBeInTheDocument();
    expect(screen.getByText('کارن')).toBeInTheDocument();
  });

  it('opens detailed personal profile when clicking on a player', () => {
    render(
      <PlayerProfilesModal
        isOpen={true}
        onClose={vi.fn()}
        registeredPlayers={DEFAULT_FIXED_PLAYERS}
        activeLeague={mockActiveLeague}
        archivedLeagues={mockArchivedLeagues}
      />
    );

    // Click on Arta
    const artaCard = screen.getByRole('button', { name: /آرتا/i });
    fireEvent.click(artaCard);

    // Detailed profile view elements
    expect(screen.queryByText(/عضو دائمی لیگ دوستانه/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ادمین/i)).not.toBeInTheDocument();
    expect(screen.getByText(/تعداد بازی کلی/i)).toBeInTheDocument();
    expect(screen.getByText(/برد \/ مساوی \/ باخت/i)).toBeInTheDocument();
    expect(screen.getByText(/درصد پیروزی/i)).toBeInTheDocument();
    expect(screen.getByText(/نمودار روند امتیازگیری و عملکرد/i)).toBeInTheDocument();
    expect(screen.getByText(/سوابق تمام بازی‌های ثبت‌شده/i)).toBeInTheDocument();

    // Back to directory button
    const backBtn = screen.getByRole('button', { name: /بازگشت به لیست بازیکنان/i });
    fireEvent.click(backBtn);
    expect(screen.getByText(/مقایسه ۲ بازیکن/i)).toBeInTheDocument();
  });
});
