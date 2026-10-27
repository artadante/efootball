import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileButton } from './ProfileButton';

describe('ProfileButton Component', () => {
  it('renders circular button with user initials and online badge', () => {
    render(<ProfileButton userName="مدیر لیگ" rating={1420} isAdmin={true} onAdminLogin={vi.fn()} onAdminLogout={vi.fn()} onAddPlayer={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /پروفایل مدیر لیگ/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('م')).toBeInTheDocument(); // Initial
  });

  it('opens profile drawer and shows admin badge if user is admin', () => {
    render(<ProfileButton userName="مدیر لیگ" rating={1420} isAdmin={true} onAdminLogin={vi.fn()} onAdminLogout={vi.fn()} onAddPlayer={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /پروفایل مدیر لیگ/i });
    fireEvent.click(button);

    expect(screen.getByText('اطلاعات کاربری')).toBeInTheDocument();
    expect(screen.getByText(/دسترسی مدیر لیگ فعال است/i)).toBeInTheDocument();
  });

  it('allows entering admin PIN when viewer clicks admin login', () => {
    const handleLogin = vi.fn();
    render(<ProfileButton userName="کاربر مهمان" rating={1200} isAdmin={false} onAdminLogin={handleLogin} onAdminLogout={vi.fn()} onAddPlayer={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /پروفایل کاربر مهمان/i });
    fireEvent.click(button);

    // Should show login form
    const pinInput = screen.getByPlaceholderText(/رمز ورود ادمین/i);
    expect(pinInput).toBeInTheDocument();

    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /ورود مدیر/i }));

    expect(handleLogin).toHaveBeenCalledWith('1234');
  });
});
