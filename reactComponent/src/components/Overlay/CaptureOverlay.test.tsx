import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { CaptureOverlay } from './CaptureOverlay';
import type { TrackedTarget } from '../../lib/dom';

describe('CaptureOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when hovered is null', () => {
    const div = document.createElement('div');
    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    const { container } = render(
      <CaptureOverlay targets={[target]} hovered={null} onSelect={vi.fn()} />
    );

    expect(container.querySelector('.ia-fra-frame')).toBeFalsy();
  });

  it('renders nothing when hovered is not in targets array', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');

    const target1: TrackedTarget = {
      el: div1,
      id: 'target-1',
      type: 'section',
    };

    const hovered: TrackedTarget = {
      el: div2,
      id: 'hovered-id',
      type: 'component',
    };

    const { container } = render(
      <CaptureOverlay targets={[target1]} hovered={hovered} onSelect={vi.fn()} />
    );

    expect(container.querySelector('.ia-fra-frame')).toBeFalsy();
  });

  it('renders frame when hovered is in targets array', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);

    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    const { container } = render(
      <CaptureOverlay targets={[target]} hovered={target} onSelect={vi.fn()} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(container.querySelector('.ia-fra-frame')).toBeTruthy();
  });

  it('calls onSelect when label is clicked', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);

    const target: TrackedTarget = {
      el: div,
      id: 'clickable-id',
      type: 'section',
    };

    const onSelect = vi.fn();

    const { container } = render(
      <CaptureOverlay targets={[target]} hovered={target} onSelect={onSelect} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label).toBeTruthy();

    act(() => {
      label.click();
    });

    expect(onSelect).toHaveBeenCalledWith(target);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('displays correct label text', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);

    const target: TrackedTarget = {
      el: div,
      id: 'my-element-id',
      type: 'section',
    };

    const { container } = render(
      <CaptureOverlay targets={[target]} hovered={target} onSelect={vi.fn()} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label.textContent).toBe('my-element-id');
  });

  it('label is interactive (clickable)', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);

    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    const { container } = render(
      <CaptureOverlay targets={[target]} hovered={target} onSelect={vi.fn()} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label.style.pointerEvents).toBe('auto');
    expect(label.style.cursor).toBe('pointer');
  });

  it('handles multiple targets and only shows frame for hovered one', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    div1.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
    div2.getBoundingClientRect = () => new DOMRect(150, 150, 100, 100);

    const target1: TrackedTarget = {
      el: div1,
      id: 'target-1',
      type: 'section',
    };

    const target2: TrackedTarget = {
      el: div2,
      id: 'target-2',
      type: 'section',
    };

    const { container } = render(
      <CaptureOverlay targets={[target1, target2]} hovered={target1} onSelect={vi.fn()} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const frames = container.querySelectorAll('.ia-fra-frame');
    expect(frames.length).toBe(1);
    expect(frames[0].querySelector('.ia-fra-frame__label')?.textContent).toBe('target-1');
  });
});
