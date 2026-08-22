import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToggleRow } from './ToggleRow';

describe('ToggleRow', () => {
  it('renders label', () => {
    render(<ToggleRow label="Test Toggle" checked={false} onChange={vi.fn()} />);
    expect(screen.getByText('Test Toggle')).toBeInTheDocument();
  });

  it('renders switch button with role="switch"', () => {
    render(<ToggleRow label="Test Toggle" checked={false} onChange={vi.fn()} />);
    const switchButton = screen.getByRole('switch');
    expect(switchButton).toBeInTheDocument();
  });

  it('sets aria-checked to true when checked', () => {
    render(<ToggleRow label="Test Toggle" checked={true} onChange={vi.fn()} />);
    const switchButton = screen.getByRole('switch');
    expect(switchButton).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-checked to false when not checked', () => {
    render(<ToggleRow label="Test Toggle" checked={false} onChange={vi.fn()} />);
    const switchButton = screen.getByRole('switch');
    expect(switchButton).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with true when clicked and currently checked is false', () => {
    const onChange = vi.fn();
    render(<ToggleRow label="Test Toggle" checked={false} onChange={onChange} />);
    const switchButton = screen.getByRole('switch');

    fireEvent.click(switchButton);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when clicked and currently checked is true', () => {
    const onChange = vi.fn();
    render(<ToggleRow label="Test Toggle" checked={true} onChange={onChange} />);
    const switchButton = screen.getByRole('switch');

    fireEvent.click(switchButton);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('applies ia-fra-toggle--on class when checked', () => {
    const { container } = render(<ToggleRow label="Test Toggle" checked={true} onChange={vi.fn()} />);
    const switchButton = container.querySelector('button');
    expect(switchButton).toHaveClass('ia-fra-toggle--on');
  });

  it('does not apply ia-fra-toggle--on class when not checked', () => {
    const { container } = render(<ToggleRow label="Test Toggle" checked={false} onChange={vi.fn()} />);
    const switchButton = container.querySelector('button');
    expect(switchButton).not.toHaveClass('ia-fra-toggle--on');
  });

  it('sets aria-label to label prop', () => {
    render(<ToggleRow label="My Toggle Label" checked={false} onChange={vi.fn()} />);
    const switchButton = screen.getByRole('switch');
    expect(switchButton).toHaveAttribute('aria-label', 'My Toggle Label');
  });

  it('renders toggle thumb element', () => {
    const { container } = render(<ToggleRow label="Test Toggle" checked={false} onChange={vi.fn()} />);
    const thumb = container.querySelector('.ia-fra-toggle__thumb');
    expect(thumb).toBeInTheDocument();
  });
});
