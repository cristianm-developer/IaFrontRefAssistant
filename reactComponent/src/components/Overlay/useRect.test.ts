import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRect } from './useRect';

describe('useRect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when element is null', () => {
    const { result } = renderHook(() => useRect(null));
    expect(result.current).toBe(null);
  });

  it('gets bounding rect from element', () => {
    const div = document.createElement('div');
    const mockRect = new DOMRect(10, 20, 100, 50);
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue(mockRect);

    const { result } = renderHook(() => useRect(div));

    act(() => {
      vi.advanceTimersByTime(16); // One frame
    });

    expect(result.current).toBeTruthy();
    expect(result.current?.top).toBe(20);
    expect(result.current?.left).toBe(10);
    expect(result.current?.width).toBe(100);
    expect(result.current?.height).toBe(50);
  });

  it('clears rect when element becomes null', () => {
    const div = document.createElement('div');
    const mockRect = new DOMRect(0, 0, 100, 100);
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue(mockRect);

    const { result, rerender } = renderHook(
      ({ el }) => useRect(el),
      { initialProps: { el: div as HTMLDivElement | null } }
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBeTruthy();

    act(() => {
      rerender({ el: null });
    });

    expect(result.current).toBe(null);
  });

  it('cancels animation frame on unmount', () => {
    const div = document.createElement('div');
    const mockRect = new DOMRect(0, 0, 100, 100);
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue(mockRect);

    const cancelAnimationFrameSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useRect(div));

    act(() => {
      vi.advanceTimersByTime(16);
    });

    unmount();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });
});
