'use client';

export interface ActionRowProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function ActionRow({ label, disabled, onClick }: ActionRowProps) {
  return (
    <button type="button" className="ia-fra-menu-item ia-fra-action-row" disabled={disabled} onClick={onClick}>
      <span className="ia-fra-menu-item__label">{label}</span>
    </button>
  );
}
