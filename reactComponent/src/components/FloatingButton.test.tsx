import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FloatingButton } from './FloatingButton';

describe('FloatingButton', () => {
  it('calls onToggleMenu on simple click', () => {
    const onToggleMenu = vi.fn();
    const onCtrlClick = vi.fn();
    const onCtrlAltClick = vi.fn();

    render(
      <FloatingButton
        active={true}
        open={false}
        badgeCount={0}
        onToggleMenu={onToggleMenu}
        onCtrlClick={onCtrlClick}
        onCtrlAltClick={onCtrlAltClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onToggleMenu).toHaveBeenCalled();
    expect(onCtrlClick).not.toHaveBeenCalled();
    expect(onCtrlAltClick).not.toHaveBeenCalled();
  });

  it('calls onCtrlClick on ctrl+click', () => {
    const onToggleMenu = vi.fn();
    const onCtrlClick = vi.fn();
    const onCtrlAltClick = vi.fn();

    render(
      <FloatingButton
        active={true}
        open={false}
        badgeCount={0}
        onToggleMenu={onToggleMenu}
        onCtrlClick={onCtrlClick}
        onCtrlAltClick={onCtrlAltClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button, { ctrlKey: true });
    expect(onCtrlClick).toHaveBeenCalled();
    expect(onToggleMenu).not.toHaveBeenCalled();
    expect(onCtrlAltClick).not.toHaveBeenCalled();
  });

  it('calls onCtrlAltClick on ctrl+alt+click', () => {
    const onToggleMenu = vi.fn();
    const onCtrlClick = vi.fn();
    const onCtrlAltClick = vi.fn();

    render(
      <FloatingButton
        active={true}
        open={false}
        badgeCount={0}
        onToggleMenu={onToggleMenu}
        onCtrlClick={onCtrlClick}
        onCtrlAltClick={onCtrlAltClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button, { ctrlKey: true, altKey: true });
    expect(onCtrlAltClick).toHaveBeenCalled();
    expect(onCtrlClick).not.toHaveBeenCalled();
    expect(onToggleMenu).not.toHaveBeenCalled();
  });

  it('does not render badge when badgeCount is 0', () => {
    render(
      <FloatingButton
        active={true}
        open={false}
        badgeCount={0}
        onToggleMenu={vi.fn()}
        onCtrlClick={vi.fn()}
        onCtrlAltClick={vi.fn()}
      />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders badge with count when badgeCount > 0', () => {
    render(
      <FloatingButton
        active={true}
        open={false}
        badgeCount={3}
        onToggleMenu={vi.fn()}
        onCtrlClick={vi.fn()}
        onCtrlAltClick={vi.fn()}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders 9+ when badgeCount > 9', () => {
    render(
      <FloatingButton
        active={true}
        open={false}
        badgeCount={15}
        onToggleMenu={vi.fn()}
        onCtrlClick={vi.fn()}
        onCtrlAltClick={vi.fn()}
      />
    );

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('shows reduced opacity when inactive', () => {
    const { container } = render(
      <FloatingButton
        active={false}
        open={false}
        badgeCount={0}
        onToggleMenu={vi.fn()}
        onCtrlClick={vi.fn()}
        onCtrlAltClick={vi.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button?.style.opacity).toBe('0.5');
  });

  it('shows full opacity when active', () => {
    const { container } = render(
      <FloatingButton
        active={true}
        open={false}
        badgeCount={0}
        onToggleMenu={vi.fn()}
        onCtrlClick={vi.fn()}
        onCtrlAltClick={vi.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button?.style.opacity).toBe('1');
  });

  it('has correct aria attributes', () => {
    render(
      <FloatingButton
        active={true}
        open={true}
        badgeCount={0}
        onToggleMenu={vi.fn()}
        onCtrlClick={vi.fn()}
        onCtrlAltClick={vi.fn()}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });
});
