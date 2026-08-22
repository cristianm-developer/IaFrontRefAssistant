import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHoverCloseTimer } from './useHoverCloseTimer';

describe('useHoverCloseTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns onMouseEnter and onMouseLeave handlers', () => {
    const { result } = renderHook(() =>
      useHoverCloseTimer({
        active: true,
        onClose: vi.fn(),
      })
    );

    expect(result.current.onMouseEnter).toBeDefined();
    expect(result.current.onMouseLeave).toBeDefined();
  });

  it('calls onClose after delayMs on mouseLeave', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useHoverCloseTimer({
        active: true,
        onClose,
        delayMs: 2000,
      })
    );

    act(() => {
      result.current.onMouseLeave();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('cancels timeout on mouseEnter', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useHoverCloseTimer({
        active: true,
        onClose,
        delayMs: 2000,
      })
    );

    act(() => {
      result.current.onMouseLeave();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.onMouseEnter();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('clears timer when active becomes false', () => {
    const onClose = vi.fn();
    const { result, rerender } = renderHook(
      (active: boolean) =>
        useHoverCloseTimer({
          active,
          onClose,
          delayMs: 2000,
        }),
      { initialProps: true }
    );

    act(() => {
      result.current.onMouseLeave();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    rerender(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('respects custom delayMs', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useHoverCloseTimer({
        active: true,
        onClose,
        delayMs: 500,
      })
    );

    act(() => {
      result.current.onMouseLeave();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onClose).toHaveBeenCalled();
  });
});
