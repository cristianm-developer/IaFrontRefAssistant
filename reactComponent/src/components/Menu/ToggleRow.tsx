'use client';

export interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="ia-fra-menu-item">
      <span className="ia-fra-menu-item__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`ia-fra-toggle${checked ? ' ia-fra-toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ia-fra-toggle__thumb" />
      </button>
    </div>
  );
}
