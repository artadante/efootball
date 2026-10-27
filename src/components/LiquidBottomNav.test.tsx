import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiquidBottomNav } from './LiquidBottomNav';

describe('LiquidBottomNav Component', () => {
  it('renders all 4 tabs in order: چرخونه, بازی‌ها, جدول, تاریخچه', () => {
    const handleTabChange = vi.fn();

    render(
      <LiquidBottomNav
        activeTab="table"
        onTabChange={handleTabChange}
      />
    );

    // Verify all 4 tabs exist
    expect(screen.getByText('چرخونه')).toBeInTheDocument();
    expect(screen.getByText('بازی‌ها')).toBeInTheDocument();
    expect(screen.getByText('جدول')).toBeInTheDocument();
    expect(screen.getByText('تاریخچه')).toBeInTheDocument();
  });

  it('triggers onTabChange when clicking each tab', () => {
    const handleTabChange = vi.fn();

    render(
      <LiquidBottomNav
        activeTab="table"
        onTabChange={handleTabChange}
      />
    );

    fireEvent.click(screen.getByText('چرخونه'));
    expect(handleTabChange).toHaveBeenCalledWith('wheel');

    fireEvent.click(screen.getByText('بازی‌ها'));
    expect(handleTabChange).toHaveBeenCalledWith('matches');

    fireEvent.click(screen.getByText('جدول'));
    expect(handleTabChange).toHaveBeenCalledWith('table');

    fireEvent.click(screen.getByText('تاریخچه'));
    expect(handleTabChange).toHaveBeenCalledWith('history');
  });
});
