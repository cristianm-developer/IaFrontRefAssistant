'use client';

import { useEffect, useRef, useState } from 'react';

function rectsEqual(a: DOMRect | null, b: DOMRect): boolean {
  return !!a && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

export function useRect(el: Element | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!el) {
      setRect(null);
      return;
    }
    let lastUpdate = Date.now();
    function tick() {
      const now = Date.now();
      // Throttle: solo actualizar cada 100ms para evitar parpadeos durante hover
      if (now - lastUpdate >= 100) {
        const next = el!.getBoundingClientRect();
        setRect((prev) => (rectsEqual(prev, next) ? prev : next));
        lastUpdate = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [el]);

  return rect;
}
