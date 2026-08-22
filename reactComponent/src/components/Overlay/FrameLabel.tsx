'use client';

import { useState } from 'react';

export interface FrameLabelProps {
  rect: DOMRect;
  label: string;
  opacity?: number;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FrameLabel({ rect, label, opacity = 1, interactive = false, onClick, className }: FrameLabelProps) {
  // Congela la posición durante hover para evitar parpadeos
  const [frozen, setFrozen] = useState(false);
  const [frozenRect, setFrozenRect] = useState<DOMRect | null>(null);

  // Usa frozenRect si está frozen, sino usa rect normal
  const displayRect = frozen && frozenRect ? frozenRect : rect;
  const labelInside = displayRect.top < 22;

  return (
    <div
      className={`ia-fra-frame ${className || ''}`}
      style={{
        position: 'fixed',
        top: displayRect.top,
        left: displayRect.left,
        width: displayRect.width,
        height: displayRect.height,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <span
        className="ia-fra-frame__label"
        style={{
          position: 'absolute',
          top: labelInside ? 2 : -22,
          left: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
        }}
        onMouseEnter={() => {
          setFrozenRect(rect);
          setFrozen(true);
        }}
        onMouseLeave={() => setFrozen(false)}
        onClick={interactive ? onClick : undefined}
      >
        {label}
      </span>
    </div>
  );
}
