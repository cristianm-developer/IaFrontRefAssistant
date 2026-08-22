'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clampMenuPosition } from '../../lib/position';

export interface MenuProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  onRequestClose: () => void;
  children: React.ReactNode;
}

export function Menu({ open, anchorRef, onRequestClose, children }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useEffect(() => {
    if (!open || !anchorRef.current || !menuRef.current) return;

    // Usa setTimeout para garantizar que React ha commitado los cambios al DOM.
    // Muestra el menú en posición temporal (0, 0) para poder medirlo.
    setStyle({ position: 'fixed', left: 0, top: 0, visibility: 'visible' });

    const timerId = setTimeout(() => {
      if (!anchorRef.current || !menuRef.current) return;
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      // Calcula posición ideal basada en el tamaño medido
      const idealLeft = anchorRect.right - menuRect.width;
      const idealTop = anchorRect.top - menuRect.height - 8;
      const { left, top } = clampMenuPosition({
        idealLeft,
        idealTop,
        width: menuRect.width,
        height: menuRect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });

      // Reposiciona el menú a su ubicación ideal
      setStyle({ position: 'fixed', left, top, visibility: 'visible' });
    }, 0);

    return () => clearTimeout(timerId);
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) {
        onRequestClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onRequestClose();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, anchorRef, onRequestClose]);

  if (!open) return null;

  return (
    <div ref={menuRef} className="ia-fra-menu" style={style} role="menu">
      {children}
    </div>
  );
}
