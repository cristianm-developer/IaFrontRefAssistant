import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MenuItem } from './MenuItem';

describe('MenuItem', () => {
  it('renders label', () => {
    render(<MenuItem label="Test Item" />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<MenuItem label="Test Item" onClick={onClick} />);

    fireEvent.click(screen.getByText('Test Item').parentElement!);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders chevron when hasChildren is true', () => {
    const { container } = render(<MenuItem label="Test Item" hasChildren={true} />);
    const chevron = container.querySelector('.ia-fra-chevron');
    expect(chevron).toBeInTheDocument();
  });

  it('does not render chevron when hasChildren is false', () => {
    const { container } = render(<MenuItem label="Test Item" hasChildren={false} />);
    const chevron = container.querySelector('.ia-fra-chevron');
    expect(chevron).not.toBeInTheDocument();
  });

  it('applies expanded class to chevron when expanded is true', () => {
    const { container } = render(<MenuItem label="Test Item" hasChildren={true} expanded={true} />);
    const chevron = container.querySelector('.ia-fra-chevron--open');
    expect(chevron).toBeInTheDocument();
  });

  it('renders right slot content', () => {
    render(<MenuItem label="Test Item" right={<span>Right Content</span>} />);
    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <MenuItem label="Test Item">
        <div>Child Content</div>
      </MenuItem>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('has role="button" when hasChildren is true', () => {
    const { container } = render(<MenuItem label="Test Item" hasChildren={true} />);
    const item = container.querySelector('.ia-fra-menu-item');
    expect(item).toHaveAttribute('role', 'button');
  });

  it('is keyboard accessible with Enter key', () => {
    const onClick = vi.fn();
    const { container } = render(<MenuItem label="Test Item" hasChildren={true} onClick={onClick} />);
    const item = container.querySelector('.ia-fra-menu-item') as HTMLElement;

    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('is keyboard accessible with Space key', () => {
    const onClick = vi.fn();
    const { container } = render(<MenuItem label="Test Item" hasChildren={true} onClick={onClick} />);
    const item = container.querySelector('.ia-fra-menu-item') as HTMLElement;

    fireEvent.keyDown(item, { key: ' ' });
    expect(onClick).toHaveBeenCalled();
  });

  it('does not trigger click on keyboard when hasChildren is false', () => {
    const onClick = vi.fn();
    const { container } = render(<MenuItem label="Test Item" hasChildren={false} onClick={onClick} />);
    const item = container.querySelector('.ia-fra-menu-item') as HTMLElement;

    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });
});
