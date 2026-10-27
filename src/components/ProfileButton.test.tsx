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
});
