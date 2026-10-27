import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component with Top-Left Plus and 4-Tab Navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 4 tabs in bottom nav and top header elements', () => {
    render(<App />);

    // Bottom navigation tabs
    expect(screen.getByText('چرخونه')).toBeInTheDocument();
    expect(screen.getByText('بازی‌ها')).toBeInTheDocument();
    expect(screen.getByText('جدول')).toBeInTheDocument();
    expect(screen.getByText('تاریخچه')).toBeInTheDocument();

    // Top-left + button
    const plusButton = screen.getByRole('button', { name: /ثبت مسابقه/i });
    expect(plusButton).toBeInTheDocument();
  });

  it('switches views properly when clicking bottom tabs', () => {
    render(<App />);

    // Default tab is table (جدول)
    expect(screen.getByText(/جدول رده‌بندی لیگ/i)).toBeInTheDocument();

    // Switch to matches (بازی‌ها)
    fireEvent.click(screen.getByText('بازی‌ها'));
    expect(screen.getByText(/برنامه و وضعیت مسابقات/i)).toBeInTheDocument();

    // Switch to wheel (چرخونه)
    fireEvent.click(screen.getByText('چرخونه'));
    expect(screen.getByText(/چرخونه شانس و انتخاب تیم/i)).toBeInTheDocument();

    // Switch to history (تاریخچه)
    fireEvent.click(screen.getByText('تاریخچه'));
    expect(screen.getByText(/تاریخچه مسابقات/i)).toBeInTheDocument();
  });

  it('triggers admin PIN challenge when clicking top-left plus button as visitor', () => {
    render(<App />);

    const plusButton = screen.getByRole('button', { name: /ثبت مسابقه/i });
    fireEvent.click(plusButton);

    expect(screen.getByText(/فقط مدیر لیگ امکان ثبت نتیجه مسابقه را دارد/i)).toBeInTheDocument();
  });

  it('unlocks admin capabilities when entering correct password arta6996', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /پروفایل/i }));

    const pinInput = screen.getByPlaceholderText('رمز عبور مدیر');
    fireEvent.change(pinInput, { target: { value: 'arta6996' } });
    fireEvent.click(screen.getByRole('button', { name: /ورود مدیر/i }));

    expect(screen.getByText(/دسترسی مدیر لیگ فعال است/i)).toBeInTheDocument();
  });
});
