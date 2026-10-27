import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileButton } from './ProfileButton';

describe('ProfileButton Component', () => {
  it('renders circular button with admin avatar and online badge when admin', () => {
    render(<ProfileButton userName="مدیر لیگ" rating={1420} isAdmin={true} onAdminLogin={vi.fn()} onAdminLogout={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /پروفایل مدیر لیگ/i });
    expect(button).toBeInTheDocument();
    const avatar = screen.getByAltText('مدیر لیگ');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/admin-avatar.png');
  });

  it('renders initials when non-admin has no avatar image', () => {
    render(<ProfileButton userName="کاربر مهمان" rating={1200} isAdmin={false} onAdminLogin={vi.fn()} onAdminLogout={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /پروفایل کاربر مهمان/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('ک')).toBeInTheDocument();
  });

  it('opens profile drawer and shows admin badge if user is admin', () => {
    render(<ProfileButton userName="مدیر لیگ" rating={1420} isAdmin={true} onAdminLogin={vi.fn()} onAdminLogout={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /پروفایل مدیر لیگ/i });
    fireEvent.click(button);

    expect(screen.getByText('اطلاعات کاربری')).toBeInTheDocument();
    expect(screen.getByText(/دسترسی مدیر لیگ فعال است/i)).toBeInTheDocument();
  });

  it('allows entering admin PIN when viewer clicks admin login', () => {
    const handleLogin = vi.fn();
    render(<ProfileButton userName="کاربر مهمان" rating={1200} isAdmin={false} onAdminLogin={handleLogin} onAdminLogout={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /پروفایل کاربر مهمان/i });
    fireEvent.click(button);

    const pinInput = screen.getByPlaceholderText(/رمز عبور مدیر/i);
    expect(pinInput).toBeInTheDocument();

    fireEvent.change(pinInput, { target: { value: 'arta6996' } });
    fireEvent.click(screen.getByRole('button', { name: /ورود مدیر/i }));

    expect(handleLogin).toHaveBeenCalledWith('arta6996');
  });

  it('filters out Arta from regular player list and hides password box when player is selected', () => {
    const mockPlayers = [
      { id: '1', name: 'آرتا', isDefault: true, createdAt: '1403/01/01' },
      { id: '2', name: 'پدرام', isDefault: true, createdAt: '1403/01/01' },
      { id: '3', name: 'پیام', isDefault: true, createdAt: '1403/01/01' },
    ];

    // Case 1: Guest mode - Arta is filtered out, Pedram is shown, password box IS shown
    const { rerender } = render(
      <ProfileButton
        userName="کاربر مهمان"
        isAdmin={false}
        registeredPlayers={mockPlayers}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /پروفایل کاربر مهمان/i }));

    // Arta is not in regular player buttons list
    const playerBtns = screen.getAllByRole('button');
    const artaInList = playerBtns.find(b => b.textContent?.trim() === 'آرتا');
    expect(artaInList).toBeUndefined();

    // Pedram is shown
    expect(screen.getByText('پدرام')).toBeInTheDocument();
    // Password box is shown for Guest
    expect(screen.getByPlaceholderText(/رمز عبور مدیر/i)).toBeInTheDocument();

    // Close and rerender with Pedram selected
    rerender(
      <ProfileButton
        userName="پدرام"
        isAdmin={false}
        registeredPlayers={mockPlayers}
      />
    );

    // When Pedram is selected, password box is completely removed
    expect(screen.queryByPlaceholderText(/رمز عبور مدیر/i)).not.toBeInTheDocument();
  });
});
