'use client';

import { forwardRef } from 'react';
import { BugIcon } from './BugIcon';

export interface FloatingButtonProps {
  active: boolean;
  open: boolean;
  badgeCount: number;
  onToggleMenu: () => void;
  onCtrlClick: () => void;
  onCtrlAltClick: () => void;
}

export const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  function FloatingButton({ active, open, badgeCount, onToggleMenu, onCtrlClick, onCtrlAltClick }, ref) {
    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (e.ctrlKey && e.altKey) {
        e.preventDefault();
        onCtrlAltClick();
        return;
      }
      if (e.ctrlKey) {
        e.preventDefault();
        onCtrlClick();
        return;
      }
      onToggleMenu();
    }

    const badgeLabel = badgeCount > 9 ? '9+' : String(badgeCount);

    return (
      <button
        ref={ref}
        type="button"
        className="ia-fra-button"
        style={{ opacity: active ? 1 : 0.5 }}
        onClick={handleClick}
        aria-label="Ia Front Ref Assistant"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <BugIcon />
        {badgeCount > 0 && (
          <span className="ia-fra-badge" aria-label={`${badgeCount} prompts guardados`}>
            {badgeLabel}
          </span>
        )}
      </button>
    );
  }
);
