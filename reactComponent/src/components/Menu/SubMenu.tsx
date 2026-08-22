'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { clampMenuPosition } from '../../lib/position';

export interface SubMenuProps {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}

export function SubMenu({ anchorRef, children }: SubMenuProps) {
  const subMenuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!anchorRef.current || !subMenuRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const subRect = subMenuRef.current.getBoundingClientRect();
    const gap = 8;
    // Por defecto a la derecha del item padre; flip a la izquierda si no entra.
    const fitsRight = anchorRect.right + gap + subRect.width <= window.innerWidth;
    const idealLeft = fitsRight ? anchorRect.right + gap : anchorRect.left - gap - subRect.width;
    const idealTop = anchorRect.top;
    const { left, top } = clampMenuPosition({
      idealLeft,
      idealTop,
      width: subRect.width,
      height: subRect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    setStyle({ position: 'fixed', left, top, visibility: 'visible' });
  }, [anchorRef]);

  return (
    <div ref={subMenuRef} className="ia-fra-menu ia-fra-menu--sub" style={style} role="menu">
      {children}
    </div>
  );
}
