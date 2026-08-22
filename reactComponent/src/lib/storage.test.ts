import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readJSON, writeJSON } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('readJSON', () => {
    it('devuelve fallback si no hay nada guardado', () => {
      const fallback = { key: 'value' };
      const result = readJSON('nonexistent', fallback);
      expect(result).toEqual(fallback);
    });

    it('devuelve fallback si el JSON es inválido', () => {
      localStorage.setItem('test-key', '{invalid json');
      const fallback = { key: 'value' };
      const result = readJSON('test-key', fallback);
      expect(result).toEqual(fallback);
    });

    it('devuelve fallback si localStorage.getItem tira error', () => {
      const fallback = { key: 'value' };
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = readJSON('test-key', fallback);
      expect(result).toEqual(fallback);

      vi.restoreAllMocks();
    });

    it('devuelve valor parseado si está guardado correctamente', () => {
      const data = { key: 'value', nested: { prop: 'data' } };
      localStorage.setItem('test-key', JSON.stringify(data));
      const result = readJSON('test-key', {});
      expect(result).toEqual(data);
    });

    it('hace merge shallow entre fallback y stored', () => {
      const fallback = { key: 'default', extra: 'field' };
      const stored = { key: 'stored' };
      localStorage.setItem('test-key', JSON.stringify(stored));
      const result = readJSON('test-key', fallback);
      expect(result).toEqual({ key: 'stored', extra: 'field' });
    });
  });

  describe('writeJSON', () => {
    it('guarda datos en localStorage', () => {
      const data = { key: 'value' };
      writeJSON('test-key', data);
      const stored = localStorage.getItem('test-key');
      expect(stored).toEqual(JSON.stringify(data));
    });

    it('no tira si localStorage.setItem falla', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const data = { key: 'value' };
      expect(() => writeJSON('test-key', data)).not.toThrow();

      vi.restoreAllMocks();
    });

    it('maneja undefined en window', () => {
      const originalWindow = globalThis.window;
      // @ts-ignore - test only
      globalThis.window = undefined;

      const data = { key: 'value' };
      expect(() => writeJSON('test-key', data)).not.toThrow();

      globalThis.window = originalWindow;
    });
  });

  describe('readJSON con window undefined', () => {
    it('devuelve fallback si window es undefined', () => {
      const originalWindow = globalThis.window;
      // @ts-ignore - test only
      globalThis.window = undefined;

      const fallback = { key: 'value' };
      const result = readJSON('test-key', fallback);
      expect(result).toEqual(fallback);

      globalThis.window = originalWindow;
    });
  });
});
