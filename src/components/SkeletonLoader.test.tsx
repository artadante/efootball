import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonLoader } from './SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('renders skeleton screen with role status and loading label', () => {
    render(<SkeletonLoader />);

    const statusEl = screen.getByRole('status', { name: /در حال بارگذاری/i });
    expect(statusEl).toBeInTheDocument();
  });
});
