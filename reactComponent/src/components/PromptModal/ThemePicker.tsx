'use client';

import { useState } from 'react';
import type { ThemeTokenDefinition } from '../../config/types';

export interface ThemePickerProps {
  tokens: ThemeTokenDefinition[];
  onPick: (sentence: string) => void;
}

export function ThemePicker({ tokens, onPick }: ThemePickerProps) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>('');

  if (tokens.length === 0) return null;

  const selectedToken = selectedProperty
    ? tokens.find(t => t.key === selectedProperty)
    : null;

  const handleValueSelect = (selectedValue: string) => {
    if (!selectedToken) return;
    const valueObj = selectedToken.values?.find(v => v.value === selectedValue);
    if (valueObj) {
      onPick(`Cambiá \`${selectedToken.key}\` a \`${valueObj.label}\`.`);
    }
  };

  const handleCustomValue = (text: string) => {
    if (!selectedToken || !text.trim()) return;
    onPick(`Cambiá \`${selectedToken.key}\` a \`${text}\`.`);
  };

  return (
    <div className="ia-fra-theme-picker">
      <div className="ia-fra-theme-picker__select-row">
        <label className="ia-fra-theme-picker__label">Propiedad</label>
        <select
          className="ia-fra-theme-picker__select"
          value={selectedProperty || ''}
          onChange={(e) => setSelectedProperty(e.target.value || null)}
        >
          <option value="">Elegí una propiedad…</option>
          {tokens.map((token) => (
            <option key={token.key} value={token.key}>
              {token.key}
            </option>
          ))}
        </select>
      </div>

      {selectedToken && (
        <div className="ia-fra-theme-picker__select-row">
          <label className="ia-fra-theme-picker__label">Valor</label>
          {selectedToken.values && selectedToken.values.length > 0 ? (
            <select
              className="ia-fra-theme-picker__select"
              value={selectedValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  handleValueSelect(val);
                  setSelectedValue('');
                }
              }}
            >
              <option value="">Elegí un valor…</option>
              {selectedToken.values.map((value) => (
                <option key={value.value} value={value.value}>
                  {value.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="ia-fra-theme-picker__input"
              placeholder="Escribí el valor…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleCustomValue(input.value);
                  input.value = '';
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
