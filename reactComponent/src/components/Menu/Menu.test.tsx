import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRef } from 'react';
import { Menu } from './Menu';

function MenuWrapper({ open, onRequestClose }: { open: boolean; onRequestClose: () => void }) {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={anchorRef}>Button</button>
      <Menu open={open} anchorRef={anchorRef} onRequestClose={onRequestClose}>
        <div>Menu Item</div>
      </Menu>
    </>
  );
}

describe('Menu', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when open is false', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={false} onRequestClose={onRequestClose} />);

    expect(screen.queryByText('Menu Item')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    expect(screen.getByText('Menu Item')).toBeInTheDocument();
  });

  it('calls onRequestClose on click outside', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    fireEvent.mouseDown(document.body);
    expect(onRequestClose).toHaveBeenCalled();
  });

  it('does not call onRequestClose on click inside menu', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    const menuItem = screen.getByText('Menu Item');
    fireEvent.mouseDown(menuItem);
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('does not call onRequestClose on click on anchor button', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    const button = screen.getByRole('button');
    fireEvent.mouseDown(button);
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('calls onRequestClose on Escape key', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalled();
  });

  it('does not call onRequestClose on other keys', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('removes event listeners when closed', () => {
    const onRequestClose = vi.fn();
    const { rerender } = render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    rerender(<MenuWrapper open={false} onRequestClose={onRequestClose} />);

    fireEvent.mouseDown(document.body);
    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('has role="menu"', () => {
    const onRequestClose = vi.fn();
    render(<MenuWrapper open={true} onRequestClose={onRequestClose} />);

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
  });
});
