import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BugIcon } from './BugIcon';

describe('BugIcon', () => {
  it('renders SVG with correct viewBox', () => {
    const { container } = render(<BugIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('has correct stroke properties', () => {
    const { container } = render(<BugIcon />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('fill')).toBe('none');
    expect(svg?.getAttribute('stroke-width')).toBe('1.6');
  });

  it('has aria-hidden and is not focusable', () => {
    const { container } = render(<BugIcon />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
  });
});
