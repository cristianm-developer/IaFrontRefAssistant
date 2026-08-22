import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { ShowOverlay } from './ShowOverlay';
import type { TrackedTarget } from '../../lib/dom';

describe('ShowOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when targets array is empty', () => {
    const { container } = render(
      <ShowOverlay targets={[]} hovered={null} />
    );

    expect(container.querySelector('.ia-fra-frame')).toBeFalsy();
  });

  it('renders one frame per target', () => {
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
      <ShowOverlay targets={[target1, target2]} hovered={null} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const frames = container.querySelectorAll<HTMLElement>('.ia-fra-frame');
    expect(frames.length).toBe(2);
  });

  it('renders frames with correct labels', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    div1.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
    div2.getBoundingClientRect = () => new DOMRect(150, 150, 100, 100);

    const target1: TrackedTarget = {
      el: div1,
      id: 'element-a',
      type: 'section',
    };

    const target2: TrackedTarget = {
      el: div2,
      id: 'element-b',
      type: 'component',
    };

    const { container } = render(
      <ShowOverlay targets={[target1, target2]} hovered={null} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const labels = container.querySelectorAll('.ia-fra-frame__label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toBe('element-a');
    expect(labels[1].textContent).toBe('element-b');
  });

  it('sets opacity to 1 for hovered target', () => {
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
      <ShowOverlay targets={[target1, target2]} hovered={target1} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const frames = container.querySelectorAll<HTMLElement>('.ia-fra-frame');
    expect(frames.length).toBe(2);
    expect(frames[0].style.opacity).toBe('1');
    expect(frames[1].style.opacity).toBe('0.35');
  });

  it('sets opacity to 0.35 for non-hovered targets', () => {
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
      <ShowOverlay targets={[target1, target2]} hovered={null} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const frames = container.querySelectorAll<HTMLElement>('.ia-fra-frame');
    expect(frames.length).toBe(2);
    expect(frames[0].style.opacity).toBe('0.35');
    expect(frames[1].style.opacity).toBe('0.35');
  });

  it('labels are non-interactive (not clickable)', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);

    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    const { container } = render(
      <ShowOverlay targets={[target]} hovered={null} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const label = container.querySelector('.ia-fra-frame__label') as HTMLElement;
    expect(label).toBeTruthy();
    expect(label.style.pointerEvents).toBe('none');
    expect(label.style.cursor).toBe('default');
  });

  it('uses index as key, not id (for repeated ids)', () => {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    div1.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
    div2.getBoundingClientRect = () => new DOMRect(150, 150, 100, 100);

    const target1: TrackedTarget = {
      el: div1,
      id: 'duplicate-id',
      type: 'section',
    };

    const target2: TrackedTarget = {
      el: div2,
      id: 'duplicate-id',
      type: 'section',
    };

    const { container } = render(
      <ShowOverlay targets={[target1, target2]} hovered={null} />
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    const frames = container.querySelectorAll<HTMLElement>('.ia-fra-frame');
    expect(frames.length).toBe(2);
  });
});
