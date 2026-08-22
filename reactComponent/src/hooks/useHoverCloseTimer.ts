'use client';

import { useCallback, useEffect, useRef } from 'react';
import { HOVER_CLOSE_DELAY_MS } from '../lib/constants';

export function useHoverCloseTimer(opts: {
  active: boolean;
  onClose: () => void;
  delayMs?: number;
}): { onMouseEnter: () => void; onMouseLeave: () => void } {
  const { active, onClose, delayMs = HOVER_CLOSE_DELAY_MS } = opts;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    clear();
  }, [clear]);

  const onMouseLeave = useCallback(() => {
    clear();
    timerRef.current = setTimeout(() => {
      onClose();
    }, delayMs);
  }, [clear, onClose, delayMs]);

  // Si el menú se cierra por otra vía (click afuera, Escape), limpiar el
  // timer pendiente para no disparar un onClose extra sobre un menú que ya
  // está cerrado.
  useEffect(() => {
    if (!active) clear();
    return clear;
  }, [active, clear]);

  return { onMouseEnter, onMouseLeave };
}
