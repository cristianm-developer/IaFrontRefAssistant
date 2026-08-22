'use client';

import type { ComponentDefinition } from '../../config/types';

export interface VariantSizePickerProps {
  definition: ComponentDefinition;
  onPick: (sentence: string) => void;
}

export function VariantSizePicker({ definition, onPick }: VariantSizePickerProps) {
  const hasVariants = !!definition.variants && definition.variants.length > 0;
  const hasSizes = !!definition.sizes && definition.sizes.length > 0;
  if (!hasVariants && !hasSizes) return null;

  return (
    <div className="ia-fra-picker">
      {hasVariants && (
        <div className="ia-fra-picker__row">
          <span className="ia-fra-picker__row-label">Variante</span>
          {definition.variants!.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="ia-fra-pill"
              onClick={() => onPick(`Usa la variante "${opt.label}".`)}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className="ia-fra-pill ia-fra-pill--ghost"
            onClick={() => onPick('Agregá una nueva variante para este componente: ')}
          >
            + Nueva variante
          </button>
        </div>
      )}
      {hasSizes && (
        <div className="ia-fra-picker__row">
          <span className="ia-fra-picker__row-label">Tamaño</span>
          {definition.sizes!.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="ia-fra-pill"
              onClick={() => onPick(`Usa el tamaño "${opt.label}".`)}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className="ia-fra-pill ia-fra-pill--ghost"
            onClick={() => onPick('Agregá un nuevo tamaño para este componente: ')}
          >
            + Nuevo tamaño
          </button>
        </div>
      )}
    </div>
  );
}
