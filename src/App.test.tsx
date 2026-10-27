import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component with Clean State & Admin Security', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders clean state without mock fake players initially', () => {
    render(<App />);

    // Should NOT have the old fake names hardcoded
    expect(screen.queryByText('علی رضایی')).not.toBeInTheDocument();
    expect(screen.getByText(/هنوز بازیکنی به لیگ اضافه نشده است/i)).toBeInTheDocument();
  });

  it('restricts match registration for visitors and prompts for admin PIN', () => {
    render(<App />);

    // Click plus button
    fireEvent.click(screen.getByLabelText('ثبت مسابقه'));

    // Should prompt for admin authentication
    expect(screen.getByText(/فقط مدیر لیگ امکان ثبت نتیجه/i)).toBeInTheDocument();
  });

  it('unlocks admin capabilities when entering correct admin PIN', () => {
    render(<App />);

    // Open profile
    fireEvent.click(screen.getByRole('button', { name: /پروفایل/i }));

    // Enter admin PIN
    const pinInput = screen.getByPlaceholderText(/رمز ورود ادمین/i);
    fireEvent.change(pinInput, { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /ورود مدیر/i }));

    // Should now show admin status
    expect(screen.getByText(/دسترسی مدیر لیگ فعال است/i)).toBeInTheDocument();
  });
});
