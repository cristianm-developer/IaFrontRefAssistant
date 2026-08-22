import type { PromptEntry } from './types';

export function formatPrompt(
  targetId: string,
  url: string,
  userText: string,
  prePrompt?: string
): string {
  const base = `About ${targetId} in ${url}: ${userText}`;
  const trimmedPrePrompt = prePrompt?.trim();
  return trimmedPrePrompt ? `${trimmedPrePrompt}\n\n${base}` : base;
}

export function formatQueueForClipboard(entries: PromptEntry[]): string {
  return entries.map((e) => e.text).join('\n\n');
}
