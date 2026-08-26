'use client';

import type { TrackedTarget } from '../../lib/dom';
import { useRect } from './useRect';
import { FrameLabel } from './FrameLabel';

export interface ShowOverlayProps {
  targets: TrackedTarget[];
  hovered: TrackedTarget | null;
}

export function ShowOverlay({ targets, hovered }: ShowOverlayProps) {
  return (
    <>
      {targets.map((target, index) => (
        // key por índice, no por target.id: data-wrapper-id/data-component-id
        // pueden repetirse entre elementos distintos (fase 4, "casos borde"),
        // así que id no es una key confiable acá.
        <ShowOverlayFrame key={index} target={target} isHovered={hovered?.el === target.el} />
      ))}
    </>
  );
}

function ShowOverlayFrame({ target, isHovered }: { target: TrackedTarget; isHovered: boolean }) {
  const rect = useRect(target.el);
  if (!rect) return null;
  const frameClassName = target.type === 'section'
    ? 'ia-fra-frame--section'
    : target.type === 'wrapper'
    ? 'ia-fra-frame--wrapper'
    : target.type === 'component'
    ? 'ia-fra-frame--component'
    : 'ia-fra-frame--element';
  return <FrameLabel rect={rect} label={target.id} opacity={isHovered ? 1 : 0.35} className={frameClassName} />;
}
