import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FrameLabel } from './FrameLabel';

describe('FrameLabel', () => {
  it('renders a frame with the correct position and size from DOMRect', () => {
    const rect = new DOMRect(10, 20, 100, 50);
    const { container } = render(
      <FrameLabel rect={rect} label="test-label" />
    );

    const frame = container.querySelector('.ia-fra-frame') as HTMLElement;
    expect(frame).toBeTruthy();
    expect(frame.style.position).toBe('fixed');
    expect(frame.style.top).toBe('20px');
    expect(frame.style.left).toBe('10px');
    expect(frame.style.width).toBe('100px');
    expect(frame.style.height).toBe('50px');
  });

  it('applies correct opacity when provided', () => {
    const rect = new DOMRect(0, 0, 100, 100);
    const { container } = render(
      <FrameLabel rect={rect} label="test" opacity={0.5} />
    );

    const frame = container.querySelector('.ia-fra-frame') as HTMLElement;
    expect(frame.style.opacity).toBe('0.5');
  });

  it('defaults to opacity 1 when not provided', () => {
    const rect = new DOMRect(0, 0, 100, 100);
    const { container } = render(
      <FrameLabel rect={rect} label="test" />
    );

    const frame = container.querySelector('.ia-fra-frame') as HTMLElement;
    expect(frame.style.opacity).toBe('1');
  });

  it('renders label above frame when rect.top >= 22', () => {
    const rect = new DOMRect(0, 50, 100, 100);
    const { container } = render(
      <FrameLabel rect={rect} label="above" />
    );

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label.style.top).toBe('-22px');
  });

  it('renders label inside frame when rect.top < 22', () => {
    const rect = new DOMRect(0, 10, 100, 100);
    const { container } = render(
      <FrameLabel rect={rect} label="inside" />
    );

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label.style.top).toBe('2px');
  });

  it('displays correct label text', () => {
    const rect = new DOMRect(0, 0, 100, 100);
    const { container } = render(
      <FrameLabel rect={rect} label="my-label" />
    );

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label.textContent).toBe('my-label');
  });

  it('makes label clickable when interactive is true', () => {
    const rect = new DOMRect(0, 0, 100, 100);
    const onClick = vi.fn();
    const { container } = render(
      <FrameLabel rect={rect} label="click" interactive onClick={onClick} />
    );

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label.style.pointerEvents).toBe('auto');
    expect(label.style.cursor).toBe('pointer');

    label.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('makes label non-clickable when interactive is false', () => {
    const rect = new DOMRect(0, 0, 100, 100);
    const onClick = vi.fn();
    const { container } = render(
      <FrameLabel rect={rect} label="no-click" interactive={false} onClick={onClick} />
    );

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label.style.pointerEvents).toBe('none');
    expect(label.style.cursor).toBe('default');

    label.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('frame has pointer-events: none to not block page clicks', () => {
    const rect = new DOMRect(0, 0, 100, 100);
    const { container } = render(
      <FrameLabel rect={rect} label="test" />
    );

    const frame = container.querySelector('.ia-fra-frame') as HTMLElement;
    expect(frame.style.pointerEvents).toBe('none');
  });
});
