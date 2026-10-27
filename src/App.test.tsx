import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component Complete League & Dual Wheel Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 4 tabs in order: چرخونه, بازی‌ها, جدول, تاریخچه', () => {
    render(<App />);

    expect(screen.getByText('چرخونه')).toBeInTheDocument();
    expect(screen.getByText('بازی‌ها')).toBeInTheDocument();
    expect(screen.getByText('جدول')).toBeInTheDocument();
    expect(screen.getByText('تاریخچه')).toBeInTheDocument();
  });

  it('requires admin PIN arta6996 to create a league with + button', () => {
    render(<App />);

    const plusBtn = screen.getByRole('button', { name: /ثبت مسابقه/i });
    fireEvent.click(plusBtn);

    // Prompt for admin pin
    expect(screen.getByText(/دسترسی مدیر لازم است/i)).toBeInTheDocument();

    const pinInput = screen.getByPlaceholderText('رمز عبور مدیر');
    fireEvent.change(pinInput, { target: { value: 'arta6996' } });
    fireEvent.click(screen.getByRole('button', { name: /تایید رمز و ورود/i }));

    // Now click + again, it opens the create league wizard!
    fireEvent.click(plusBtn);
    expect(screen.getByText(/راه‌اندازی مسابقات جدید/i)).toBeInTheDocument();
    expect(screen.getByText(/۱. لیگ عادی فوتبال/i)).toBeInTheDocument();
    expect(screen.getByText(/۲. جام حذفی/i)).toBeInTheDocument();
  });

  it('switches between all 4 tabs smoothly', () => {
    render(<App />);

    fireEvent.click(screen.getByText('چرخونه'));
    expect(screen.getByText(/هنوز لیگی آغاز نشده است/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('بازی‌ها'));
    expect(screen.getByText(/برنامه و نتایج مسابقات/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('جدول'));
    expect(screen.getByText(/جدول رده‌بندی/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('تاریخچه'));
    expect(screen.getByText(/تاریخچه و تالار افتخارات/i)).toBeInTheDocument();
  });

  it('allows admin to open league control modal from profile drawer', () => {
    localStorage.setItem('efootball_is_admin', 'true');
    render(<App />);

    // Profile button for admin
    const profileBtn = screen.getByRole('button', { name: /پروفایل مدیر کل لیگ/i });
    fireEvent.click(profileBtn);

    // Click "کنترل لیگ در حال جریان"
    const controlBtn = screen.getByRole('button', { name: /کنترل لیگ در حال جریان/i });
    expect(controlBtn).toBeInTheDocument();
    fireEvent.click(controlBtn);

    // League control modal opens
    expect(screen.getByRole('dialog', { name: '' })).toBeInTheDocument();
  });
});
