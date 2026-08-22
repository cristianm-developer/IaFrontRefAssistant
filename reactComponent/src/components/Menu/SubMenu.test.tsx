import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { SubMenu } from './SubMenu';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={anchorRef} style={{ position: 'fixed', left: '100px', top: '100px', width: '100px', height: '40px' }}>
        Anchor
      </div>
      <SubMenu anchorRef={anchorRef}>{children}</SubMenu>
    </>
  );
}

describe('SubMenu', () => {
  beforeEach(() => {
    // Reset viewport for each test
    window.innerWidth = 1024;
    window.innerHeight = 768;
  });

  it('renders children', () => {
    render(
      <TestWrapper>
        <div>Test Content</div>
      </TestWrapper>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with role="menu"', () => {
    render(
      <TestWrapper>
        <div>Menu Item</div>
      </TestWrapper>
    );
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <TestWrapper>
        <div>Test</div>
      </TestWrapper>
    );
    const menu = container.querySelector('.ia-fra-menu.ia-fra-menu--sub');
    expect(menu).toBeInTheDocument();
  });

  it('positions as fixed element', () => {
    const { container } = render(
      <TestWrapper>
        <div>Test</div>
      </TestWrapper>
    );
    const menu = container.querySelector('.ia-fra-menu--sub');
    // After useLayoutEffect, visibility should be 'visible'
    expect(menu).toHaveStyle({ position: 'fixed' });
  });

  it('becomes visible after layout effects', () => {
    const { container } = render(
      <TestWrapper>
        <div>Test</div>
      </TestWrapper>
    );
    const menu = container.querySelector('.ia-fra-menu--sub') as HTMLElement;

    // After layout effects execute, visibility should be 'visible'
    expect(menu.style.visibility).toBe('visible');
  });
});
