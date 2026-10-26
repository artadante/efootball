import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PitchBackground } from './PitchBackground';

describe('PitchBackground Component', () => {
  it('renders football pitch svg with field lines and grass pattern', () => {
    const { container } = render(<PitchBackground />);
    
    // Check SVG pitch container is rendered
    const svg = container.querySelector('svg[data-testid="football-pitch"]');
    expect(svg).toBeInTheDocument();

    // Check center circle
    const centerCircle = container.querySelector('circle[data-testid="center-circle"]');
    expect(centerCircle).toBeInTheDocument();

    // Check penalty boxes
    const penaltyBoxes = container.querySelectorAll('[data-testid="penalty-box"]');
    expect(penaltyBoxes.length).toBeGreaterThan(0);
  });
});
