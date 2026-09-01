export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // sigue al fallback
  }
  // Fallback: textarea oculto + execCommand('copy'), para contextos sin
  // Clipboard API (http no seguro, navegadores viejos, iframes sin permiso)
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function copyPromptQueue(entries: PromptEntry[]): Promise<boolean> {
  const text = formatQueueForClipboard(entries);
  const html = formatQueueForClipboardHTML(entries);
  try {
    if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'text/html': new Blob([html], { type: 'text/html' }),
      })]);
      return true;
    }
  } catch {
    // fallback below keeps the text workflow available in restricted contexts
  }
  return copyText(text);
}
import type { PromptEntry } from './types';
import { formatQueueForClipboard, formatQueueForClipboardHTML } from './promptFormat';
