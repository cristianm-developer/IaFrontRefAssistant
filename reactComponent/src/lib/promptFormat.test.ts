import { describe, expect, it } from 'vitest';
import { formatPrompt, formatQueueForClipboard, formatTargetReferenceJSON } from './promptFormat';
import type { PromptEntry } from './types';

describe('formatPrompt', () => {
  it('arma el prompt base sin prePrompt', () => {
    expect(formatPrompt('hero/card[0]', 'https://x.com', 'hacelo más grande')).toBe(
      'About hero/card[0] in https://x.com: hacelo más grande'
    );
  });

  it('antepone el prePrompt cuando viene definido', () => {
    const result = formatPrompt(
      'hero/card[0]',
      'https://x.com',
      'hacelo más grande',
      'Usa la skill frontend-component y la skill frontend-context.'
    );
    expect(result).toBe(
      'Usa la skill frontend-component y la skill frontend-context.\n\nAbout hero/card[0] in https://x.com: hacelo más grande'
    );
  });

  it('ignora un prePrompt vacío o solo espacios', () => {
    expect(formatPrompt('id', 'url', 'texto', '')).toBe('About id in url: texto');
    expect(formatPrompt('id', 'url', 'texto', '   ')).toBe('About id in url: texto');
  });
});

describe('formatQueueForClipboard', () => {
  it('junta los textos de la cola con doble salto de línea', () => {
    const entries: PromptEntry[] = [
      { id: '1', targetId: 'a', targetType: 'element', url: 'u', text: 'uno', createdAt: 1 },
      { id: '2', targetId: 'b', targetType: 'element', url: 'u', text: 'dos', createdAt: 2 },
    ];
    expect(formatQueueForClipboard(entries)).toBe('uno\n\ndos');
  });
});

describe('formatTargetReferenceJSON', () => {
  it('serializa tipo lógico y contexto para agentes', () => {
    const result = JSON.parse(formatTargetReferenceJSON('hero-title', 'component', {
      route: '/home',
      tagName: 'h1',
      text: 'Hello',
      classes: ['title'],
      attributes: { 'data-component-id': 'hero-title' },
      styles: { color: 'red' },
      semantic: { accessibleName: 'Hello', states: {} },
    }, 'https://example.com/home'));
    expect(result).toMatchObject({ reference: 'hero-title', targetType: 'component', context: { route: '/home' } });
  });
});
