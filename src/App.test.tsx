import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component with Clean State, Minimal Header & arta6996 Admin Security', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders clean state without old titles or fake players initially', () => {
    render(<App />);

    // Should NOT have the old titles
    expect(screen.queryByText(/لیگ eFootball/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/فصل دوستانه ۱۴۰۵/i)).not.toBeInTheDocument();

    // Standings should show clean empty state without add player button
    expect(screen.getByText(/هنوز مسابقه‌ای در جدول ثبت نشده است/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /افزودن بازیکن/i })).not.toBeInTheDocument();
  });

  it('restricts match registration for visitors and prompts for admin PIN with hidden placeholder', () => {
    render(<App />);

    // Click plus button
    fireEvent.click(screen.getByLabelText('ثبت مسابقه'));

    // Should prompt for admin authentication
    expect(screen.getByText(/فقط مدیر لیگ امکان ثبت نتیجه مسابقه را دارد/i)).toBeInTheDocument();

    // Verify placeholder does NOT reveal the password
    const pinInput = screen.getByPlaceholderText('رمز عبور مدیر');
    expect(pinInput).toBeInTheDocument();
    expect(pinInput).not.toHaveAttribute('placeholder', expect.stringContaining('1234'));
    expect(pinInput).not.toHaveAttribute('placeholder', expect.stringContaining('arta6996'));
  });

  it('unlocks admin capabilities when entering correct password arta6996', () => {
    render(<App />);

    // Open profile
    fireEvent.click(screen.getByRole('button', { name: /پروفایل/i }));

    // Enter admin PIN arta6996
    const pinInput = screen.getByPlaceholderText('رمز عبور مدیر');
    fireEvent.change(pinInput, { target: { value: 'arta6996' } });
    fireEvent.click(screen.getByRole('button', { name: /ورود مدیر/i }));

    // Should now show admin status
    expect(screen.getByText(/دسترسی مدیر لیگ فعال است/i)).toBeInTheDocument();
  });
});
