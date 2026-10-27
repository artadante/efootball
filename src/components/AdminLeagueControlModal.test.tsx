import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLeagueControlModal } from './AdminLeagueControlModal';
import { ActiveLeague } from '../types/league';

describe('AdminLeagueControlModal Component', () => {
  const mockActiveLeague: ActiveLeague = {
    id: 'test-league-1',
    name: 'لیگ آزمایشی',
    mode: 'league',
    playerCount: 2,
    wheelCompleted: true,
    isFinished: false,
    createdAt: '1405/01/01',
    players: [
      { slot: 1, name: 'آرتا', team: 'چلسی' },
      { slot: 2, name: 'سامان', team: 'بارسلونا' },
    ],
    matches: [
      {
        id: 'm-1',
        leg: 1,
        round: 1,
        player1Slot: 1,
        player2Slot: 2,
        score1: 2,
        score2: 1,
        isPlayed: true,
        playedAt: '1405/01/01',
      },
      {
        id: 'm-2',
        leg: 2,
        round: 2,
        player1Slot: 2,
        player2Slot: 1,
        score1: null,
        score2: null,
        isPlayed: false,
      },
    ],
  };

  it('renders all 3 sub-tabs: اسامی و تیم‌ها, ویرایش بازی‌ها, اتمام زودهنگام', () => {
    render(
      <AdminLeagueControlModal
        isOpen={true}
        onClose={vi.fn()}
        activeLeague={mockActiveLeague}
        onUpdatePlayer={vi.fn()}
        onUpdateMatchScore={vi.fn()}
        onResetMatch={vi.fn()}
        onEndLeagueEarly={vi.fn()}
      />
    );

    expect(screen.getByText('اسامی و تیم‌ها')).toBeInTheDocument();
    expect(screen.getByText('ویرایش بازی‌ها')).toBeInTheDocument();
    expect(screen.getByText('اتمام زودهنگام')).toBeInTheDocument();
  });

  it('allows editing player and team names in slot tab', () => {
    const handleUpdatePlayer = vi.fn();
    render(
      <AdminLeagueControlModal
        isOpen={true}
        onClose={vi.fn()}
        activeLeague={mockActiveLeague}
        onUpdatePlayer={handleUpdatePlayer}
        onUpdateMatchScore={vi.fn()}
        onResetMatch={vi.fn()}
        onEndLeagueEarly={vi.fn()}
      />
    );

    // Target the specific edit button for player slot
    const editBtns = screen.getAllByRole('button', { name: /^ویرایش$/i });
    fireEvent.click(editBtns[0]);

    const nameInput = screen.getByPlaceholderText('نام بازیکن');
    const teamSelect = screen.getByRole('combobox');

    fireEvent.change(nameInput, { target: { value: 'آرتا نوین' } });
    fireEvent.change(teamSelect, { target: { value: 'رئال مادرید' } });

    fireEvent.click(screen.getByRole('button', { name: /ذخیره تغییرات/i }));

    expect(handleUpdatePlayer).toHaveBeenCalledWith(1, 'آرتا نوین', 'رئال مادرید');
  });

  it('switches to matches sub-tab and allows editing scores and resetting a match', () => {
    const handleResetMatch = vi.fn();
    render(
      <AdminLeagueControlModal
        isOpen={true}
        onClose={vi.fn()}
        activeLeague={mockActiveLeague}
        onUpdatePlayer={vi.fn()}
        onUpdateMatchScore={vi.fn()}
        onResetMatch={handleResetMatch}
        onEndLeagueEarly={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('ویرایش بازی‌ها'));
    expect(screen.getByText(/نتایج مسابقات ثبت‌شده/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /ریست بازی/i });
    fireEvent.click(resetBtn);

    expect(handleResetMatch).toHaveBeenCalledWith('m-1');
  });

  it('switches to finish tab and triggers early end of league', () => {
    const handleEndLeagueEarly = vi.fn();
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <AdminLeagueControlModal
        isOpen={true}
        onClose={vi.fn()}
        activeLeague={mockActiveLeague}
        onUpdatePlayer={vi.fn()}
        onUpdateMatchScore={vi.fn()}
        onResetMatch={vi.fn()}
        onEndLeagueEarly={handleEndLeagueEarly}
      />
    );

    fireEvent.click(screen.getByText('اتمام زودهنگام'));
    expect(screen.getByText(/اتمام زودهنگام و بایگانی لیگ/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /اتمام رسمی لیگ و انتقال به تاریخچه/i }));
    expect(handleEndLeagueEarly).toHaveBeenCalled();
  });
});
