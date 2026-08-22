'use client';

import type { TrackedTarget } from '../../lib/dom';
import { useRect } from './useRect';
import { FrameLabel } from './FrameLabel';

export interface CaptureOverlayProps {
  targets: TrackedTarget[];
  hovered: TrackedTarget | null;
  onSelect: (target: TrackedTarget) => void;
}

export function CaptureOverlay({ targets, hovered, onSelect }: CaptureOverlayProps) {
  // Importante: `hovered` viene de un useHoveredTarget calculado sobre la
  // UNIÓN capture+show (fase 7) — puede ser un target que solo pertenece a
  // "mostrar", no a "capturar". Hay que confirmar que está en `targets`
  // (los de este overlay) antes de dibujar/permitir click.
  const isCaptureHover = hovered !== null && targets.some((t) => t.el === hovered.el);
  const rect = useRect(isCaptureHover ? hovered!.el : null);
  if (!isCaptureHover || !rect) return null;

  const frameClassName = hovered!.type === 'component'
    ? 'ia-fra-frame--component'
    : hovered!.type === 'element'
    ? 'ia-fra-frame--element'
    : undefined;

  return <FrameLabel rect={rect} label={hovered!.id} interactive onClick={() => onSelect(hovered!)} className={frameClassName} />;
}
