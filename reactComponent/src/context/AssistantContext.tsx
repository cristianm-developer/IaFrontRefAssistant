'use client';

import { createContext, useContext } from 'react';
import type { AssistantConfig, PromptEntry } from '../lib/types';

export interface AssistantContextValue {
  config: AssistantConfig;
  prompts: PromptEntry[];
  toggleActive: () => void;
  setActive: (value: boolean) => void;
  setCaptureFlag: (key: keyof AssistantConfig['capture'], value: boolean) => void;
  setShowFlag: (key: keyof AssistantConfig['show'], value: boolean) => void;
  addPrompt: (entry: Omit<PromptEntry, 'id' | 'createdAt'>) => void;
  clearPrompts: () => void;
}

export const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error('useAssistant debe usarse dentro de <AssistantProvider>.');
  }
  return ctx;
}
