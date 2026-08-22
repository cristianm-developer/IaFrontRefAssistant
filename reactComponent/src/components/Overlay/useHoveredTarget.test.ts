import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHoveredTarget } from './useHoveredTarget';
import type { TrackedTarget } from '../../lib/dom';

describe('useHoveredTarget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock elementFromPoint on document since jsdom doesn't implement it
    if (!document.elementFromPoint) {
      (document.elementFromPoint as any) = vi.fn().mockReturnValue(null);
    }
  });

  afterEach(() => {
    if ((document.elementFromPoint as any)?.mockRestore) {
      (document.elementFromPoint as any).mockRestore();
    }
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns null when targets array is empty', () => {
    const { result } = renderHook(() => useHoveredTarget([]));
    expect(result.current).toBe(null);
  });

  it('returns null when mouse is not over any target', () => {
    const div = document.createElement('div');
    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    vi.mocked(document.elementFromPoint).mockReturnValue(null);

    const { result } = renderHook(() => useHoveredTarget([target]));

    act(() => {
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
      document.dispatchEvent(event);
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBe(null);
  });

  it('returns the target when mouse is over it', () => {
    const div = document.createElement('div');
    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    vi.mocked(document.elementFromPoint).mockReturnValue(div);

    const { result } = renderHook(() => useHoveredTarget([target]));

    act(() => {
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
      document.dispatchEvent(event);
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBe(target);
  });

  it('handles multiple targets correctly', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);

    const parentTarget: TrackedTarget = {
      el: parent,
      id: 'parent-id',
      type: 'section',
    };

    const childTarget: TrackedTarget = {
      el: child,
      id: 'child-id',
      type: 'component',
    };

    vi.mocked(document.elementFromPoint).mockReturnValue(parent);

    const { result } = renderHook(() => useHoveredTarget([parentTarget, childTarget]));

    act(() => {
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
      document.dispatchEvent(event);
      vi.advanceTimersByTime(16);
    });

    // Should return one of the targets
    expect(result.current).toBeTruthy();
    expect([parentTarget, childTarget]).toContain(result.current);
  });

  it('clears hovered state when empty targets array is passed', () => {
    const div = document.createElement('div');
    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    vi.mocked(document.elementFromPoint).mockReturnValue(div);

    const { result, rerender } = renderHook(
      ({ targets }) => useHoveredTarget(targets),
      { initialProps: { targets: [target] } }
    );

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBe(target);

    act(() => {
      rerender({ targets: [] });
    });

    expect(result.current).toBe(null);
  });

  it('removes event listeners on unmount', () => {
    const div = document.createElement('div');
    const target: TrackedTarget = {
      el: div,
      id: 'test-id',
      type: 'section',
    };

    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useHoveredTarget([target]));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
