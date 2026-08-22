import { describe, expect, it } from 'vitest';
import { defineConfig } from './defineConfig';
import type { IaFraConfig } from './types';

describe('defineConfig', () => {
  it('devuelve el config tal cual (identidad)', () => {
    const config: IaFraConfig = {
      components: [
        {
          kind: 'Button',
          variants: [{ value: 'primary', label: 'Primario' }],
          sizes: [{ value: 'md', label: 'Mediano' }],
        },
      ],
      theme: [{ key: 'bg-color', label: 'Color de fondo' }],
    };

    const result = defineConfig(config);
    expect(result).toBe(config);
  });

  it('maneja config vacío', () => {
    const config: IaFraConfig = {};
    const result = defineConfig(config);
    expect(result).toBe(config);
  });
});
