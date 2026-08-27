'use client';

import { useEffect, useRef, useState } from 'react';
import type { TrackedTarget } from '../../lib/dom';

export function useHoveredTarget(targets: TrackedTarget[]): TrackedTarget | null {
  const [hovered, setHovered] = useState<TrackedTarget | null>(null);
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const rafRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastHitRef = useRef<Element | null>(null);

  useEffect(() => {
    if (targets.length === 0) {
      setHovered(null);
      return;
    }

    function resolveHover() {
      rafRef.current = null;
      const point = lastPointRef.current;
      if (!point) return;
      // Preferimos el target real del evento: con portales, elementFromPoint
      // puede devolver el overlay del asistente en lugar de la página.
      const hitEl = lastHitRef.current ?? document.elementFromPoint(point.x, point.y);
      if (!hitEl) {
        setHovered((prev) => (prev === null ? prev : null));
        return;
      }
      // "Más específico gana": entre todos los targets cuyo el contiene (o
      // es) el elemento bajo el mouse, `depth` mide cuántos saltos hay desde
      // hitEl hasta target.el — a menor depth, más cerca/anidado (más
      // específico) es ese target. Nos quedamos con el depth MENOR.
      let best: TrackedTarget | null = null;
      let bestDepth = Infinity;
      for (const target of targetsRef.current) {
        if (target.el === hitEl || target.el.contains(hitEl)) {
          let depth = 0;
          let node: Element | null = hitEl;
          while (node && node !== target.el) {
            depth += 1;
            node = node.parentElement;
          }
          if (depth < bestDepth) {
            bestDepth = depth;
            best = target;
          }
        }
      }
      setHovered((prev) => (prev === best ? prev : best));
    }

    function handleMouseMove(e: MouseEvent) {
      lastPointRef.current = { x: e.clientX, y: e.clientY };
      lastHitRef.current = e.target instanceof Element ? e.target : null;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(resolveHover);
      }
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targets.length]);

  return hovered;
}
