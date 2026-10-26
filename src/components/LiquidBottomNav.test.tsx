import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiquidBottomNav } from './LiquidBottomNav';

describe('LiquidBottomNav Component', () => {
  it('renders all required buttons: چرخونه, +, لیگ, تاریخچه', () => {
    const handleTabChange = vi.fn();
    const handleAddClick = vi.fn();

    render(
      <LiquidBottomNav
        activeTab="league"
        onTabChange={handleTabChange}
        onAddClick={handleAddClick}
      />
    );

    // Verify all tabs exist
    expect(screen.getByText('چرخونه')).toBeInTheDocument();
    expect(screen.getByText('لیگ')).toBeInTheDocument();
    expect(screen.getByText('تاریخچه')).toBeInTheDocument();
    expect(screen.getByLabelText('ثبت مسابقه')).toBeInTheDocument();
  });

  it('triggers onTabChange when clicking a tab', () => {
    const handleTabChange = vi.fn();
    const handleAddClick = vi.fn();

    render(
      <LiquidBottomNav
        activeTab="league"
        onTabChange={handleTabChange}
        onAddClick={handleAddClick}
      />
    );

    fireEvent.click(screen.getByText('چرخونه'));
    expect(handleTabChange).toHaveBeenCalledWith('wheel');

    fireEvent.click(screen.getByText('تاریخچه'));
    expect(handleTabChange).toHaveBeenCalledWith('history');
  });

  it('triggers onAddClick when clicking the plus button', () => {
    const handleTabChange = vi.fn();
    const handleAddClick = vi.fn();

    render(
      <LiquidBottomNav
        activeTab="league"
        onTabChange={handleTabChange}
        onAddClick={handleAddClick}
      />
    );

    fireEvent.click(screen.getByLabelText('ثبت مسابقه'));
    expect(handleAddClick).toHaveBeenCalled();
  });
});
