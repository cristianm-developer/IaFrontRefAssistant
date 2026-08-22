# Fase 1 — Fundaciones (tipos, storage, provider)

Sin UI todavía. El objetivo es tener el "cerebro" del componente testeado
antes de dibujar nada.

## Archivos a crear

```
src/lib/types.ts
src/lib/constants.ts
src/lib/storage.ts
src/context/AssistantContext.tsx
src/context/AssistantProvider.tsx
```

## `src/lib/types.ts`

```ts
export type TargetType = 'section' | 'component' | 'element';

export interface AssistantConfig {
  active: boolean;
  capture: {
    sections: boolean;
    components: boolean;
    elements: boolean;
  };
  show: {
    sections: boolean;
    components: boolean;
  };
}

export interface PromptEntry {
  id: string;          // uuid o `${Date.now()}-${random}`
  targetId: string;    // valor de data-wrapper-id / data-component-id / id runtime
  targetType: TargetType;
  url: string;
  text: string;         // texto final ya formateado, ver fase 6
  createdAt: number;
}

export const DEFAULT_CONFIG: AssistantConfig = {
  active: true,
  capture: { sections: false, components: false, elements: false },
  show: { sections: false, components: false },
};
```

## `src/lib/constants.ts`

```ts
export const ATTR_WRAPPER = 'data-wrapper-id';
export const ATTR_COMPONENT = 'data-component-id';

export const STORAGE_KEY_CONFIG = 'ia-fra:config';
export const STORAGE_KEY_PROMPTS = 'ia-fra:prompts';
export const STORAGE_VERSION = 1; // para futuras migraciones

// Heurística de "elemento individual" (fase 4 la consume)
export const LEAF_TAGS = [
  'button', 'a', 'input', 'select', 'textarea', 'img',
  'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
] as const;

export const TEXT_CONTAINER_TAGS = ['span', 'p', 'li'] as const;

export const HOVER_CLOSE_DELAY_MS = 2000;
```

## `src/lib/storage.ts`

Wrapper seguro sobre `localStorage`: nunca debe tirar la app abajo si
`localStorage` no existe (SSR) o está deshabilitado (modo privado en algunos
navegadores lanza al primer `setItem`).

```ts
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed }; // merge shallow, tolera campos nuevos
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage lleno o deshabilitado: seguimos en memoria, no rompemos la UI
  }
}
```

Nota: `readJSON` con merge shallow alcanza para `AssistantConfig` (objeto
plano de 1 nivel + 2 sub-objetos `capture`/`show` — el merge shallow no
alcanza para esos dos sub-objetos si el usuario tenía una versión vieja sin
alguna key nueva). Por eso en `AssistantProvider` el merge real de config se
hace campo por campo contra `DEFAULT_CONFIG` (no confiar solo en el spread
de `storage.ts`). Para `prompts` (array), fallback es `[]` y no hace falta
merge.

## `src/context/AssistantContext.tsx`

```tsx
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
```

`AssistantContext` (el objeto de `createContext`, no el hook) se exporta
también, sin ser parte de la API pública del paquete (no va en
`src/index.ts`) — fase 7 lo necesita importar directamente para el chequeo
crudo `useContext(AssistantContext)` de detección de instancias anidadas
(no puede usar `useAssistant()` ahí porque ese hook tira si no hay
provider, y justamente hay que soportar el caso "no hay provider todavía").

## `src/context/AssistantProvider.tsx`

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { AssistantContext, type AssistantContextValue } from './AssistantContext';
import { readJSON, writeJSON } from '../lib/storage';
import { STORAGE_KEY_CONFIG, STORAGE_KEY_PROMPTS } from '../lib/constants';
import { DEFAULT_CONFIG, type AssistantConfig, type PromptEntry } from '../lib/types';

function mergeConfig(stored: Partial<AssistantConfig> | null | undefined): AssistantConfig {
  // Merge campo por campo (no shallow spread) para tolerar configs viejas
  // guardadas antes de agregar un campo nuevo a capture/show — el campo
  // faltante debe tomar el default, no quedar undefined.
  return {
    active: stored?.active ?? DEFAULT_CONFIG.active,
    capture: {
      sections: stored?.capture?.sections ?? DEFAULT_CONFIG.capture.sections,
      components: stored?.capture?.components ?? DEFAULT_CONFIG.capture.components,
      elements: stored?.capture?.elements ?? DEFAULT_CONFIG.capture.elements,
    },
    show: {
      sections: stored?.show?.sections ?? DEFAULT_CONFIG.show.sections,
      components: stored?.show?.components ?? DEFAULT_CONFIG.show.components,
    },
  };
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AssistantConfig>(() =>
    mergeConfig(readJSON<AssistantConfig>(STORAGE_KEY_CONFIG, DEFAULT_CONFIG))
  );
  const [prompts, setPrompts] = useState<PromptEntry[]>(() =>
    readJSON<PromptEntry[]>(STORAGE_KEY_PROMPTS, [])
  );

  useEffect(() => {
    writeJSON(STORAGE_KEY_CONFIG, config);
  }, [config]);

  useEffect(() => {
    writeJSON(STORAGE_KEY_PROMPTS, prompts);
  }, [prompts]);

  const toggleActive = useCallback(() => {
    setConfig((prev) => ({ ...prev, active: !prev.active }));
  }, []);

  const setActive = useCallback((value: boolean) => {
    setConfig((prev) => ({ ...prev, active: value }));
  }, []);

  const setCaptureFlag = useCallback((key: keyof AssistantConfig['capture'], value: boolean) => {
    setConfig((prev) => ({ ...prev, capture: { ...prev.capture, [key]: value } }));
  }, []);

  const setShowFlag = useCallback((key: keyof AssistantConfig['show'], value: boolean) => {
    setConfig((prev) => ({ ...prev, show: { ...prev.show, [key]: value } }));
  }, []);

  const addPrompt = useCallback((entry: Omit<PromptEntry, 'id' | 'createdAt'>) => {
    setPrompts((prev) => [...prev, { ...entry, id: generateId(), createdAt: Date.now() }]);
  }, []);

  const clearPrompts = useCallback(() => {
    setPrompts([]);
  }, []);

  const value: AssistantContextValue = {
    config,
    prompts,
    toggleActive,
    setActive,
    setCaptureFlag,
    setShowFlag,
    addPrompt,
    clearPrompts,
  };

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
```

Notas sobre el código de arriba:

- `mergeConfig` recibe `Partial<AssistantConfig> | null | undefined` (no
  `AssistantConfig` estricto) porque lo que viene de `readJSON` puede tener
  cualquier forma si el usuario editó `localStorage` a mano o venía de una
  versión vieja del paquete — de ahí el uso de `?.` encadenado en cada
  campo.
- `AssistantProvider` **no** hace el chequeo de "instancia anidada" — eso
  vive en `IaFrontRefAssistant.tsx` (fase 7), un nivel arriba. Este archivo
  siempre crea su propio estado y su propio `<AssistantContext.Provider>`;
  quien decide si vale la pena montarlo es el llamador.

## Casos borde

- `localStorage` con JSON corrupto (`"{"` truncado) → `JSON.parse` tira,
  `readJSON` cae al `catch` y devuelve `fallback`. No debe crashear.
- Config guardada en una versión anterior sin `capture.elements` (agregado
  después) → al mergear campo por campo contra `DEFAULT_CONFIG`, el campo
  faltante toma el default (`false`), no `undefined`.
- Multi-pestaña: **fuera de alcance v1** (no hay listener de evento
  `storage` para sincronizar entre pestañas). Anotar como pendiente futuro.

## Criterios de aceptación (tests con Vitest)

- `storage.test.ts`: `readJSON` devuelve fallback si no hay nada guardado,
  si el JSON es inválido, y si `localStorage.getItem` tira. `writeJSON` no
  tira si `localStorage.setItem` tira (mockear para forzar el throw).
- `AssistantProvider.test.tsx`: montar el provider con un componente de
  prueba que consuma `useAssistant()`; verificar que `config` arranca en
  `DEFAULT_CONFIG` cuando no hay nada en storage; que `toggleActive()`
  invierte `active` y persiste (`localStorage.getItem('ia-fra:config')`
  refleja el cambio tras el toggle); que `addPrompt` incrementa
  `prompts.length` y `clearPrompts` lo vuelve a 0.
