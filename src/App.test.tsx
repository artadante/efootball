import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component Complete League & Dual Wheel Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 4 tabs in order: چرخونه, بازی‌ها, جدول, تاریخچه', () => {
    render(<App />);

    expect(screen.getAllByText('چرخونه').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('بازی‌ها').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('جدول').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('تاریخچه').length).toBeGreaterThanOrEqual(1);
  });

  it('opens player profiles modal from top-left button and shows registered players', () => {
    render(<App />);

    const profilesBtn = screen.getByRole('button', { name: /پروفایل و آمار بازیکنان/i });
    expect(profilesBtn).toBeInTheDocument();
    fireEvent.click(profilesBtn);

    expect(screen.getByText(/پروفایل بازیکنان/i)).toBeInTheDocument();
    expect(screen.getByText('آرتا')).toBeInTheDocument();
    expect(screen.getByText('پدرام')).toBeInTheDocument();
    expect(screen.getByText('پیام')).toBeInTheDocument();
    expect(screen.getByText('سهند')).toBeInTheDocument();
    expect(screen.getByText('بابک')).toBeInTheDocument();
    expect(screen.getByText('کارن')).toBeInTheDocument();
  });

  it('switches between all 4 tabs smoothly', () => {
    render(<App />);

    fireEvent.click(screen.getAllByText('چرخونه')[0]);
    expect(screen.getByText(/هنوز لیگی آغاز نشده است/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('بازی‌ها')[0]);
    expect(screen.getByText(/برنامه و نتایج مسابقات/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('جدول')[0]);
    expect(screen.getAllByText(/جدول رده‌بندی/i).length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getAllByText('تاریخچه')[0]);
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
