import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileButton } from './ProfileButton';

describe('ProfileButton Component', () => {
  it('renders circular button with user initials and online badge', () => {
    render(<ProfileButton userName="علی رضایی" rating={1420} />);
    
    const button = screen.getByRole('button', { name: /پروفایل علی رضایی/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('ع')).toBeInTheDocument(); // Initial
  });

  it('opens profile drawer when clicked', () => {
    render(<ProfileButton userName="علی رضایی" rating={1420} />);
    
    const button = screen.getByRole('button', { name: /پروفایل علی رضایی/i });
    fireEvent.click(button);

    // Profile modal/drawer should open
    expect(screen.getByText('اطلاعات کاربری')).toBeInTheDocument();
    expect(screen.getByText('امتیاز eFootball: 1420')).toBeInTheDocument();
  });

  it('closes profile drawer when close button is clicked', () => {
    render(<ProfileButton userName="علی رضایی" rating={1420} />);
    
    const button = screen.getByRole('button', { name: /پروفایل علی رضایی/i });
    fireEvent.click(button);

    const closeButton = screen.getByRole('button', { name: /بستن پروفایل/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText('اطلاعات کاربری')).not.toBeInTheDocument();
  });
});
