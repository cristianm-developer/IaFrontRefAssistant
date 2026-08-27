import type { PromptEntry } from './types';
import type { TargetContext } from './dom';

export function formatPrompt(
  targetId: string,
  url: string,
  userText: string,
  prePrompt?: string,
  reference?: string
): string {
  const base = `${reference ? `${reference}\n\n` : ''}About ${targetId} in ${url}: ${userText}`;
  const trimmedPrePrompt = prePrompt?.trim();
  return trimmedPrePrompt ? `${trimmedPrePrompt}\n\n${base}` : base;
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
