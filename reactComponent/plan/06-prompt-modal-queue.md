# Fase 6 — Modal de prompt, fila y copiado

Depende de fase 1 (provider/`addPrompt`/`clearPrompts`), fase 2/3
(`FloatingButton`, submenú "Modo prompt"), fase 5 (`CaptureOverlay.onSelect`).
Cierra el círculo funcional completo descrito en el pedido original.

## Archivos a crear / modificar

```
src/lib/clipboard.ts               (nuevo)
src/lib/promptFormat.ts            (nuevo)
src/components/PromptModal/PromptModal.tsx  (nuevo)
src/components/FloatingButton.tsx  (modificar: ctrl+alt+click ya funcional)
src/components/Menu/*              (modificar: ActionRow "Copiar" ya funcional)
src/IaFrontRefAssistant.tsx        (modificar: wiring onSelect -> abrir modal)
```

## `src/lib/promptFormat.ts`

```ts
export function formatPrompt(targetId: string, url: string, userText: string): string {
  return `About ${targetId} in ${url}: ${userText}`;
}

export function formatQueueForClipboard(entries: PromptEntry[]): string {
  return entries.map((e) => e.text).join('\n\n');
}
```

`text` en `PromptEntry` ya se guarda formateado (ver `PromptModal` abajo),
así que `formatQueueForClipboard` simplemente concatena — no vuelve a
aplicar el template.

## `src/lib/clipboard.ts`

```ts
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
```

## `PromptModal`

```ts
interface PromptModalProps {
  target: TrackedTarget;
  onClose: () => void;
  onSave: (text: string) => void;
}
```

- Overlay de fondo semitransparente (`position: fixed`, `inset: 0`,
  `background: rgba(0,0,0,.4)`) + panel centrado.
- Header: muestra el "template" de forma visible pero no editable, ej.:
  `About <code>{target.id}</code> in <code>{location.href}</code>:` — el
  usuario entiende que eso se antepone, pero no lo puede borrar ni editar
  desde ahí.
- `<textarea>` autofocus debajo, placeholder tipo "Describí qué querés
  pedirle a la IA sobre este elemento…".
- Teclado: `Enter` (sin `Shift`) → submit (equivalente a click en "Save");
  `Shift+Enter` → salto de línea normal; `Escape` → cierra sin guardar
  (`onClose`).
- Botones: "Cancelar" (`onClose`) y "Save" (submit). "Save" deshabilitado
  si el textarea está vacío/solo whitespace (`text.trim().length === 0`).
- Al hacer submit:
  ```ts
  const fullText = formatPrompt(target.id, window.location.href, text.trim());
  onSave(fullText); // el padre llama addPrompt({ targetId: target.id, targetType: target.type, url: location.href, text: fullText })
  ```
- Cierra el modal automáticamente después de guardar.
- Accesibilidad básica: `role="dialog"`, `aria-modal="true"`, trap de foco
  simple (foco inicial en el textarea; `Tab`/`Shift+Tab` entre textarea y
  los 2 botones, sin necesidad de librería — con 3 elementos focables el
  trap manual es trivial: si `Tab` en el último, volver al primero).

Código completo (versión de fase 6, sin `definitions`/pickers — fase 8
agrega esa parte encima sin tocar lo de acá):

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { TrackedTarget } from '../../lib/dom';
import { formatPrompt } from '../../lib/promptFormat';

export interface PromptModalProps {
  target: TrackedTarget;
  onClose: () => void;
  onSave: (text: string) => void;
}

export function PromptModal({ target, onClose, onSave }: PromptModalProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    const fullText = formatPrompt(target.id, window.location.href, trimmed);
    onSave(fullText);
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      cancelRef.current?.focus();
    }
  }

  // Trap de foco manual con 3 elementos focables: textarea -> Cancelar -> Save -> (loop) textarea.
  function handleCancelKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.focus();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      saveRef.current?.focus();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  function handleSaveKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      cancelRef.current?.focus();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      textareaRef.current?.focus();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  const disabled = text.trim().length === 0;

  return (
    <div className="ia-fra-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ia-fra-modal" role="dialog" aria-modal="true" aria-label={`Prompt para ${target.id}`}>
        <p className="ia-fra-modal__template">
          About <code>{target.id}</code> in <code>{typeof window !== 'undefined' ? window.location.href : ''}</code>:
        </p>
        <textarea
          ref={textareaRef}
          className="ia-fra-modal__textarea"
          placeholder="Describí qué querés pedirle a la IA sobre este elemento…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
        />
        <div className="ia-fra-modal__actions">
          <button ref={cancelRef} type="button" className="ia-fra-modal__btn" onClick={onClose} onKeyDown={handleCancelKeyDown}>
            Cancelar
          </button>
          <button
            ref={saveRef}
            type="button"
            className="ia-fra-modal__btn ia-fra-modal__btn--primary"
            disabled={disabled}
            onClick={handleSubmit}
            onKeyDown={handleSaveKeyDown}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Estilos (agregar a `src/styles/index.css`, o `src/styles/modal.css`
en modo multi-agente — ver [10-parallel-execution-plan.md](10-parallel-execution-plan.md))

```css
.ia-fra-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: var(--ia-fra-z);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ia-fra-modal {
  background: var(--ia-fra-bg);
  color: var(--ia-fra-fg);
  border-radius: var(--ia-fra-radius);
  box-shadow: var(--ia-fra-shadow);
  padding: 16px;
  width: min(420px, calc(100vw - 32px));
  font: var(--ia-fra-font-size) var(--ia-fra-font);
}
.ia-fra-modal__template {
  font-size: 12px;
  opacity: 0.7;
  margin: 0 0 8px;
}
.ia-fra-modal__textarea {
  width: 100%;
  min-height: 100px;
  background: #1a1a1a;
  color: var(--ia-fra-fg);
  border: 1px solid var(--ia-fra-border);
  border-radius: var(--ia-fra-radius-sm);
  padding: 8px;
  font: inherit;
  resize: vertical;
}
.ia-fra-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.ia-fra-modal__btn {
  background: transparent;
  color: var(--ia-fra-fg);
  border: 1px solid var(--ia-fra-border);
  border-radius: var(--ia-fra-radius-sm);
  padding: 6px 12px;
  cursor: pointer;
}
.ia-fra-modal__btn--primary {
  background: var(--ia-fra-accent);
  border-color: var(--ia-fra-accent);
}
.ia-fra-modal__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

Nota: el `<div className="ia-fra-modal-overlay" onMouseDown={...}>` cierra
el modal al hacer click en el fondo (`e.target === e.currentTarget`
descarta clicks que empezaron dentro del panel y "burbujearon"), un
mecanismo estándar de modal — no estaba explícito en la descripción de
arriba pero es el comportamiento esperado de cualquier modal con overlay
de fondo. Este click en el fondo **no** cuenta como "Escape" (no importa
demasiado la distinción, ambos solo cierran sin guardar).

## Wiring en `IaFrontRefAssistant.tsx`

```tsx
const [modalTarget, setModalTarget] = useState<TrackedTarget | null>(null);

<CaptureOverlay ... onSelect={(t) => setModalTarget(t)} />

{modalTarget && (
  <PromptModal
    target={modalTarget}
    onClose={() => setModalTarget(null)}
    onSave={(text) => {
      addPrompt({ targetId: modalTarget.id, targetType: modalTarget.type, url: window.location.href, text });
      setModalTarget(null);
    }}
  />
)}
```

Nota: si mientras el modal está abierto el usuario desactiva el toggle de
`capture.*` correspondiente desde el menú, el modal **no se cierra
automáticamente** — el usuario ya inició la acción, se le deja terminarla.

Este bloque es un sketch ilustrativo de la idea general; el wiring real y
completo (con `handleSavePrompt` usando `useCallback`, y `modalTarget`
junto al resto del estado) queda en `AssistantRoot`
(`IaFrontRefAssistant.tsx`) — ver la composición final en
[07-integration-example.md](07-integration-example.md).

## `FloatingButton` — ctrl+alt+click ya real

```ts
async function handleCopyAndClear() {
  if (prompts.length === 0) return;
  const ok = await copyText(formatQueueForClipboard(prompts));
  if (ok) clearPrompts();
  // si falla el copiado, NO se vacía la fila (para no perder los prompts)
}
```

(Versión ilustrativa; la definitiva en fase 7 además incluye el feedback
visual "¡Copiado!" — ver [03-submenus.md](03-submenus.md).)

Esta misma función es la que usa tanto `onCtrlAltClick` del botón como el
`ActionRow` "Copiar fila de prompts" del submenú "Modo prompt" (fase 3
había dejado un stub ahí — se reemplaza acá).

## Badge

`FloatingButton` ya recibía `badgeCount` desde fase 2; en esta fase el
valor real es `prompts.length` (antes no había fila real que contar). Se
actualiza automáticamente porque `prompts` viene del contexto reactivo.

## Casos borde

- `copyText` falla (permiso de portapapeles denegado, ni Clipboard API ni
  `execCommand` disponibles) → la fila **no** se vacía, para que el usuario
  no pierda los prompts guardados; considerar un feedback visual de error
  (ej. el badge parpadea en rojo un instante) — opcional para v1, no
  bloqueante.
- Guardar un prompt cuando `target.id` viene de un elemento individual
  (fase 4, id tipo `comp:Header > button:nth-of-type(1)`) — el template
  igual funciona, es solo un string más largo.
- Abrir el modal, no escribir nada, y cerrar con `Escape` → no debe crear
  ninguna entrada en `prompts`.
- Ctrl+Alt+Click con la fila vacía → no debe intentar copiar nada al
  portapapeles (evitar copiar string vacío silenciosamente).

## Criterios de aceptación (tests)

- `promptFormat.test.ts`: `formatPrompt` arma el string esperado;
  `formatQueueForClipboard` junta 2+ entries con línea en blanco entre
  medio.
- `clipboard.test.ts`: mockear `navigator.clipboard.writeText` exitoso →
  `copyText` devuelve `true` sin tocar el DOM; mockear que
  `navigator.clipboard` no existe → cae al fallback de `execCommand`
  (mockeado también) y devuelve su resultado.
- `PromptModal.test.tsx`: `Enter` sin shift dispara `onSave` con el texto
  formateado con el template correcto; `Shift+Enter` no dispara submit y sí
  agrega un salto de línea; botón "Save" deshabilitado con textarea vacío;
  `Escape` dispara `onClose` sin llamar `onSave`.
- Test de integración: simular click en el label de `CaptureOverlay` →
  aparece el modal → escribir texto → submit → `prompts` en el contexto
  tiene 1 elemento y el badge del botón muestra "1".
- Con `prompts` de longitud 2, ejecutar el flujo de "Copiar": se llama
  `copyText` con el string de los 2 bloques separados por línea en blanco,
  y tras éxito `prompts` queda en `[]` y el badge desaparece.

> **Actualización (fase 8)**: `PromptModal` gana un prop opcional
> `definitions?: IaFraConfig`. Si viene y el target es un componente cuyo
> `kind` matchea, se agregan selectores de variante/size + una sección de
> theme que insertan oraciones en el textarea (no cambian `formatPrompt`).
> Sin `definitions`, el modal se comporta exactamente igual que acá. Ver
> [08-component-config.md](08-component-config.md).
