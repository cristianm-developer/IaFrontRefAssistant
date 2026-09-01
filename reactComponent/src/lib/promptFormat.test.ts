import { describe, expect, it } from 'vitest';
import { formatPrompt, formatPromptForModel, formatQueueForClipboard, formatQueueForClipboardHTML, formatTargetReferenceJSON } from './promptFormat';
import type { PromptEntry } from './types';

describe('formatPrompt', () => {
  it('arma el prompt base sin prePrompt', () => {
    expect(formatPrompt('hero/card[0]', 'https://x.com', 'hacelo más grande')).toBe(
      'About hero/card[0] on route /: hacelo más grande'
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
      'Usa la skill frontend-component y la skill frontend-context.\n\nAbout hero/card[0] on route /: hacelo más grande'
    );
  });

  it('ignora un prePrompt vacío o solo espacios', () => {
    expect(formatPrompt('id', 'url', 'texto', '')).toBe('About id on route /url: texto');
    expect(formatPrompt('id', 'url', 'texto', '   ')).toBe('About id on route /url: texto');
  });

  it('mantiene la captura fuera del texto y la convierte en parte multimodal', () => {
    const entry: PromptEntry = {
      id: '1', targetId: 'card', targetType: 'component', url: 'url',
      text: formatPrompt('card', 'url', 'ajustar', undefined, undefined, { width: 390, height: 844, devicePixelRatio: 2 }), createdAt: 1,
      viewport: { width: 390, height: 844, devicePixelRatio: 2 },
      attachments: [{ type: 'image', mimeType: 'image/png', dataUrl: 'data:image/png;base64,abc' }],
    };
    expect(entry.text).not.toContain('base64');
    expect(entry.text).toContain('Viewport: 390x844px (DPR 2)');
    expect(formatPromptForModel(entry)).toEqual([
      { type: 'text', text: entry.text },
      { type: 'image_url', image_url: { url: 'data:image/png;base64,abc' } },
    ]);
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

  it('incluye capturas en el formato HTML del portapapeles', () => {
    const entries: PromptEntry[] = [{
      id: '1', targetId: 'a', targetType: 'component', url: 'u', text: 'ajustar', createdAt: 1,
      attachments: [{ type: 'image', mimeType: 'image/png', dataUrl: 'data:image/png;base64,abc' }],
    }];
    expect(formatQueueForClipboardHTML(entries)).toContain('<img src="data:image/png;base64,abc"');
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
