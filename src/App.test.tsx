import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Root Component', () => {
  it('renders header, pitch background, profile button and bottom navigation', () => {
    render(<App />);

    // Header title
    expect(screen.getByText(/لیگ eFootball/i)).toBeInTheDocument();

    // Bottom Navigation tabs
    expect(screen.getByText('لیگ')).toBeInTheDocument();
    expect(screen.getByText('چرخونه')).toBeInTheDocument();
    expect(screen.getByText('تاریخچه')).toBeInTheDocument();

    // Profile button
    expect(screen.getByRole('button', { name: /پروفایل/i })).toBeInTheDocument();
  });

  it('switches views when clicking different navigation tabs', () => {
    render(<App />);

    // Default tab is league
    expect(screen.getByText(/جدول رده‌بندی لیگ/i)).toBeInTheDocument();

    // Switch to wheel
    fireEvent.click(screen.getByText('چرخونه'));
    expect(screen.getByText(/چرخونه شانس و انتخاب تیم/i)).toBeInTheDocument();

    // Switch to history
    fireEvent.click(screen.getByText('تاریخچه'));
    expect(screen.getByText(/تاریخچه مسابقات ثبت‌شده/i)).toBeInTheDocument();
  });

  it('opens new match modal when clicking plus button', () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText('ثبت مسابقه'));
    expect(screen.getByText(/ثبت نتیجه مسابقه جدید/i)).toBeInTheDocument();
  });
});
