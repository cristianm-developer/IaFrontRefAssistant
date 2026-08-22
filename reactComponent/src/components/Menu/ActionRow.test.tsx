import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionRow } from './ActionRow';

describe('ActionRow', () => {
  it('renders with label', () => {
    render(<ActionRow label="Test Action" onClick={() => {}} />);
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('renders as a button', () => {
    render(<ActionRow label="Click Me" onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ActionRow label="Test" onClick={() => {}} />);
    const button = container.querySelector('.ia-fra-menu-item.ia-fra-action-row');
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ActionRow label="Click Me" onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is not disabled by default', () => {
    render(<ActionRow label="Test" onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('can be disabled', () => {
    render(<ActionRow label="Test" onClick={() => {}} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled and clicked', () => {
    const onClick = vi.fn();
    render(<ActionRow label="Test" onClick={onClick} disabled={true} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // HTMLButtonElement with disabled attribute prevents click events
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has type="button"', () => {
    render(<ActionRow label="Test" onClick={() => {}} />);
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.type).toBe('button');
  });
});
