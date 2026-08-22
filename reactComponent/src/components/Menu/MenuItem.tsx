'use client';

import { forwardRef } from 'react';

export interface MenuItemProps {
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { label, hasChildren, expanded, onClick, right, children },
  ref
) {
  return (
    <div ref={ref} className="ia-fra-menu-item-wrap">
      <div
        className="ia-fra-menu-item"
        role={hasChildren ? 'button' : undefined}
        tabIndex={hasChildren ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (hasChildren && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <span className="ia-fra-menu-item__label">{label}</span>
        {right}
        {hasChildren && (
          <span className={`ia-fra-chevron${expanded ? ' ia-fra-chevron--open' : ''}`} aria-hidden="true">
            &rsaquo;
          </span>
        )}
      </div>
      {children}
    </div>
  );
});
