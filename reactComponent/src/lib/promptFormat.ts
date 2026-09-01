import type { PromptEntry, ViewportInfo } from './types';
import type { TargetContext } from './dom';

export function getPromptRoute(url: string): string {
  try {
    const parsed = new URL(url, 'http://aiui-assistant.local');
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return url;
  }
}

export function formatPrompt(
  targetId: string,
  url: string,
  userText: string,
  prePrompt?: string,
  reference?: string,
  viewport?: ViewportInfo,
): string {
  const route = getPromptRoute(url);
  const viewportLine = viewport ? `Viewport: ${viewport.width}x${viewport.height}px (DPR ${viewport.devicePixelRatio})\n` : '';
  const base = `${reference ? `${reference}\n\n` : ''}${viewportLine}About ${targetId} on route ${route}: ${userText}`;
  const trimmedPrePrompt = prePrompt?.trim();
  return trimmedPrePrompt ? `${trimmedPrePrompt}\n\n${base}` : base;
}

export type ModelPromptPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

/** Converts a queued prompt into multimodal content for a vision-capable model. */
export function formatPromptForModel(entry: PromptEntry): ModelPromptPart[] {
  return [
    { type: 'text', text: entry.text },
    ...(entry.attachments ?? []).map((attachment) => ({
      type: 'image_url' as const,
      image_url: { url: attachment.dataUrl },
    })),
  ];
}

export function formatTargetReference(
  targetId: string,
  context: TargetContext,
  url: string,
  targetType?: string,
): string {
  const lines = [
    `Frontend reference: ${targetId}`,
    ...(targetType ? [`Target type: ${targetType}`] : []),
    `HTML element: ${context.tagName}`,
    `Route: ${context.route || new URL(url).pathname}`,
  ];
  if (context.componentName) lines.push(`Component: ${context.componentName}`);
  if (context.sourceFile) lines.push(`Source: ${context.sourceFile}${context.sourceLine ? `:${context.sourceLine}` : ''}`);
  if (context.text) lines.push(`Text: ${context.text}`);
  if (context.classes.length) lines.push(`Classes: ${context.classes.join(' ')}`);
  const semantic = Object.entries(context.semantic)
    .filter(([key, value]) => key !== 'states' && value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  if (semantic) lines.push(`Semantic: ${semantic}`);
  const states = Object.entries(context.semantic.states).filter(([, value]) => value).map(([key]) => key).join(', ');
  if (states) lines.push(`States: ${states}`);
  if (context.parent) {
    const parentId = context.parent.targetId ?? context.parent.id ?? context.parent.tagName;
    lines.push(`Visual parent: ${parentId}${context.parent.type ? ` (${context.parent.type})` : ''}`);
    if (context.parent.componentKind) lines.push(`Parent component: ${context.parent.componentKind}`);
    if (context.parent.classes.length) lines.push(`Parent classes: ${context.parent.classes.join(' ')}`);
  }
  const attrs = Object.entries(context.attributes).map(([key, value]) => `${key}="${value}"`).join(' ');
  if (attrs) lines.push(`Attributes: ${attrs}`);
  const styles = Object.entries(context.styles).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`).join('; ');
  if (styles) lines.push(`Styles: ${styles}`);
  return lines.join('\n');
}

export function formatTargetReferenceJSON(targetId: string, targetType: string, context: TargetContext, url: string): string {
  return JSON.stringify({
    reference: targetId,
    targetType,
    url,
    context,
  }, null, 2);
}

export function formatQueueForClipboard(entries: PromptEntry[]): string {
  return entries.map((e) => e.text).join('\n\n');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character] ?? character));
}

/** Rich clipboard representation so pasted prompts retain visual captures. */
export function formatQueueForClipboardHTML(entries: PromptEntry[]): string {
  return entries.map((entry) => {
    const text = escapeHtml(entry.text).replace(/\n/g, '<br>');
    const images = (entry.attachments ?? [])
      .map((attachment) => `<p><img src="${escapeHtml(attachment.dataUrl)}" alt="Visual capture"></p>`)
      .join('');
    return `<div>${text}${images}</div>`;
  }).join('<hr>');
}
