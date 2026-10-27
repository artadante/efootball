import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CreateLeagueModal } from './CreateLeagueModal';

describe('CreateLeagueModal Component', () => {
  it('renders default league setup and switches to cup mode with player count options', () => {
    const handleClose = vi.fn();
    const handleLeagueCreated = vi.fn();

    render(
      <CreateLeagueModal
        isOpen={true}
        onClose={handleClose}
        onLeagueCreated={handleLeagueCreated}
      />
    );

    // Default title is لیگ برتر دوستان
    const nameInput = screen.getByRole('textbox');
    expect(nameInput).toHaveValue('لیگ برتر دوستان');

    // Switch to Cup mode
    const cupBtn = screen.getByRole('button', { name: /۲\. جام حذفی/i });
    fireEvent.click(cupBtn);

    // Title updates automatically
    expect(nameInput).toHaveValue('جام حذفی دوستان');

    // Player count buttons for cup: 2, 4, 8, 16
    expect(screen.getByRole('button', { name: /۲ نفر/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /۴ نفر/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /۸ نفر/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /۱۶ نفر/i })).toBeInTheDocument();

    // Select 8 players
    const eightPlayerBtn = screen.getByRole('button', { name: /۸ نفر/i });
    fireEvent.click(eightPlayerBtn);

    // Structure summary should display 7 matches
    expect(screen.getAllByText(/۷ مسابقه/i).length).toBeGreaterThanOrEqual(1);

    // Click start draw
    const drawBtn = screen.getByRole('button', { name: /شروع قرعه‌کشی مسابقات/i });
    fireEvent.click(drawBtn);

    // Now in Step 2 (drawing)
    expect(screen.getByText(/در حال قرعه‌کشی مسابقات/i)).toBeInTheDocument();
  });

  it('finalizes cup league creation and sends active league payload', async () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    const handleLeagueCreated = vi.fn();

    render(
      <CreateLeagueModal
        isOpen={true}
        onClose={handleClose}
        onLeagueCreated={handleLeagueCreated}
      />
    );

    // Switch to Cup
    fireEvent.click(screen.getByRole('button', { name: /۲\. جام حذفی/i }));

    // Start draw
    fireEvent.click(screen.getByRole('button', { name: /شروع قرعه‌کشی مسابقات/i }));

    // Advance fake timers for draw animation
    act(() => {
      vi.advanceTimersByTime(2600);
    });

    // Check finished screen
    expect(screen.getByText(/قرعه‌کشی با موفقیت انجام شد/i)).toBeInTheDocument();

    // Click finalize
    const finalizeBtn = screen.getByRole('button', { name: /تأیید و ورود به چرخونه/i });
    fireEvent.click(finalizeBtn);

    expect(handleLeagueCreated).toHaveBeenCalledTimes(1);
    const createdLeague = handleLeagueCreated.mock.calls[0][0];
    expect(createdLeague.mode).toBe('cup');
    expect(createdLeague.playerCount).toBe(4);
    expect(createdLeague.players.length).toBe(4);
    expect(createdLeague.matches.length).toBe(3); // 2 SF + 1 Final
    expect(handleClose).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
