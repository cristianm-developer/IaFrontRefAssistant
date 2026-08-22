# Fase 2 — Botón flotante + menú principal (shell)

Depende de fase 1 (`AssistantProvider`). Entrega el botón circular, el ícono
bug, el badge, y el menú principal desplegándose hacia arriba con **solo**
el toggle "Activo" (los nodos "Capturar" y "Modo prompt" se agregan en fase
3, para no mezclar la mecánica del menú con la de los submenús).

## Archivos a crear

```
src/components/BugIcon.tsx
src/components/FloatingButton.tsx
src/components/Menu/Menu.tsx
src/components/Menu/MenuItem.tsx
src/components/Menu/ToggleRow.tsx
src/hooks/useHoverCloseTimer.ts
src/styles/index.css
```

`BugIcon.tsx` es el SVG definido en [00-overview.md](00-overview.md#convenciones-globales-leer-antes-de-implementar-cualquier-fase)
("Convenciones globales" → "Ícono bug") — copiarlo tal cual de ahí, con
`'use client';` como primera línea.

## `useHoverCloseTimer`

```ts
function useHoverCloseTimer(opts: {
  active: boolean;              // solo corre si el menú está abierto
  refs: React.RefObject<HTMLElement>[]; // botón + menú (+ submenús en fase 3)
  onClose: () => void;
  delayMs?: number;              // default HOVER_CLOSE_DELAY_MS = 2000
}): { onMouseEnter: () => void; onMouseLeave: () => void };
```

Implementación: al `mouseleave` de cualquiera de los elementos vigilados, se
arma un `setTimeout(onClose, delayMs)`. Al `mouseenter` de cualquiera de
ellos (incluido re-entrar a otro de los refs), se cancela el timeout
pendiente. Debe soportar **múltiples elementos** porque el mouse viaja del
botón al menú (o al submenú) y no deben ambos disparar cierres
independientes que se pisen — un solo timer activo por vez, referenciado
con `useRef<number | null>`.

Nota de implementación: en vez de atar `onMouseEnter/Leave` manualmente a
cada ref, el hook expone un solo par de handlers que se pasan al contenedor
raíz que envuelve botón+menú (wrapper `<div>` con `position: relative`,
sin estilos visuales, solo agrupador de eventos). Esto es más simple que
adjuntar listeners a N refs sueltos y cubre el caso "mouse sale del botón
pero entra al menú" sin disparar el timer, porque nunca sale del wrapper.
El parámetro `refs` de la firma de arriba queda sin uso real en esta
implementación (el wrapper único los reemplaza) — se mantiene en la firma
solo por si una fase futura necesita granularidad por elemento; **no
implementar** lógica que itere `refs` en v1.

```ts
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { HOVER_CLOSE_DELAY_MS } from '../lib/constants';

export function useHoverCloseTimer(opts: {
  active: boolean;
  onClose: () => void;
  delayMs?: number;
}): { onMouseEnter: () => void; onMouseLeave: () => void } {
  const { active, onClose, delayMs = HOVER_CLOSE_DELAY_MS } = opts;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    clear();
  }, [clear]);

  const onMouseLeave = useCallback(() => {
    clear();
    timerRef.current = setTimeout(() => {
      onClose();
    }, delayMs);
  }, [clear, onClose, delayMs]);

  // Si el menú se cierra por otra vía (click afuera, Escape), limpiar el
  // timer pendiente para no disparar un onClose extra sobre un menú que ya
  // está cerrado.
  useEffect(() => {
    if (!active) clear();
    return clear;
  }, [active, clear]);

  return { onMouseEnter, onMouseLeave };
}
```

## Dónde se conecta `useHoverCloseTimer` (importante — no queda dentro de `Menu.tsx`)

El wrapper único que agrupa botón+menú (+submenú en fase 3) **no** vive
dentro de `Menu.tsx` ni de `FloatingButton.tsx` — vive en el componente que
los compone a ambos como hermanos, es decir `AssistantRoot` dentro de
`IaFrontRefAssistant.tsx` (fase 7). Ese wrapper es quien le pasa
`onMouseEnter`/`onMouseLeave` de `useHoverCloseTimer` y quien decide
`onClose` (cierra el menú Y, en fase 3, resetea el submenú abierto).
Fase 7 ya debe incluir esto en su composición final — se referencia acá
para dejar explícito el contrato, ya que `Menu`/`FloatingButton` en sí
**no** manejan el timer de 2s, solo lo reciben "gratis" por estar dentro
del wrapper:

```tsx
// dentro de AssistantRoot (fase 7), reemplaza al <div className="ia-fra-root"> suelto
const hoverHandlers = useHoverCloseTimer({
  active: menuOpen,
  onClose: () => setMenuOpen(false),
});

<div className="ia-fra-root" onMouseEnter={hoverHandlers.onMouseEnter} onMouseLeave={hoverHandlers.onMouseLeave}>
  <FloatingButton ... />
  <Menu ... />
</div>
```

## `FloatingButton`

```ts
interface FloatingButtonProps {
  active: boolean;
  open: boolean;
  badgeCount: number;
  onToggleMenu: () => void;
  onCtrlClick: () => void;      // toggle active, fase 1 ya tiene la acción
  onCtrlAltClick: () => void;   // copiar+vaciar, implementado recién en fase 6
}
```

- Botón circular negro (`background: #111` o similar, `border-radius: 50%`,
  tamaño ~52px), ícono bug en SVG inline blanco centrado (no depender de una
  librería de íconos externa — cero dependencias extra en el paquete).
- Badge: círculo pequeño arriba-derecha del botón, solo se renderiza si
  `badgeCount > 0`, muestra el número (cap visual en "9+" si `> 9`).
- Handler de click único que decide la rama según los modifiers del evento,
  en este orden de prioridad (un click con ambos ctrl+alt no debe *también*
  disparar el toggle de active):

```ts
function handleClick(e: React.MouseEvent) {
  if (e.ctrlKey && e.altKey) {
    e.preventDefault();
    onCtrlAltClick();
    return;
  }
  if (e.ctrlKey) {
    e.preventDefault();
    onCtrlClick();
    return;
  }
  onToggleMenu();
}
```

- Si `active === false`, el botón se muestra con opacidad reducida (ej.
  `0.5`) como indicador visual pasivo, pero sigue siendo clickeable (para
  poder reactivarlo abriendo el menú y prendiendo el toggle, o vía
  ctrl+click).

```tsx
'use client';

import { forwardRef } from 'react';
import { BugIcon } from './BugIcon';

export interface FloatingButtonProps {
  active: boolean;
  open: boolean;
  badgeCount: number;
  onToggleMenu: () => void;
  onCtrlClick: () => void;
  onCtrlAltClick: () => void;
}

export const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  function FloatingButton({ active, open, badgeCount, onToggleMenu, onCtrlClick, onCtrlAltClick }, ref) {
    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (e.ctrlKey && e.altKey) {
        e.preventDefault();
        onCtrlAltClick();
        return;
      }
      if (e.ctrlKey) {
        e.preventDefault();
        onCtrlClick();
        return;
      }
      onToggleMenu();
    }

    const badgeLabel = badgeCount > 9 ? '9+' : String(badgeCount);

    return (
      <button
        ref={ref}
        type="button"
        className="ia-fra-button"
        style={{ opacity: active ? 1 : 0.5 }}
        onClick={handleClick}
        aria-label="Ia Front Ref Assistant"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <BugIcon />
        {badgeCount > 0 && (
          <span className="ia-fra-badge" aria-label={`${badgeCount} prompts guardados`}>
            {badgeLabel}
          </span>
        )}
      </button>
    );
  }
);
```

## `Menu`

```ts
interface MenuProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>; // el botón, para posicionar
  children: React.ReactNode;
}
```

- `position: fixed`, calculado a partir del `getBoundingClientRect()` del
  `anchorRef`: `bottom = window.innerHeight - anchorRect.top + 8` (8px de
  gap), `right = window.innerWidth - anchorRect.right`. Esto lo hace
  desplegar **hacia arriba** siempre, anclado al borde derecho del botón.
- Fondo negro, texto blanco, `border-radius` chico, `min-width` ~220px,
  sombra sutil (`box-shadow`) para separarlo del contenido de la página.
- Animación de entrada simple (opacity + translateY, ~120ms) — no es
  crítico, pero mejora la sensación de "desplegable".
- Cierre por:
  1. Timer de 2s sin mouse encima (via `useHoverCloseTimer`, fase 2).
  2. Click afuera del wrapper botón+menú (`useEffect` con listener
     `mousedown` en `document`, chequeando `!wrapperRef.current.contains(e.target)`).
  3. Tecla `Escape` (listener `keydown` en `document` mientras `open`).
- **No** se cierra solo porque el mouse esté momentáneamente fuera si va
  camino al menú — de ahí la importancia del wrapper único en
  `useHoverCloseTimer`.

`clampMenuPosition` (usar en `Menu` y en `SubMenu`, fase 3, para no
desbordar el viewport):

```ts
// src/lib/position.ts ('use client' no hace falta, no exporta componente/hook)
export function clampMenuPosition(opts: {
  idealLeft: number;
  idealTop: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  margin?: number;
}): { left: number; top: number } {
  const { idealLeft, idealTop, width, height, viewportWidth, viewportHeight, margin = 16 } = opts;
  const left = Math.min(Math.max(idealLeft, margin), viewportWidth - width - margin);
  const top = Math.min(Math.max(idealTop, margin), viewportHeight - height - margin);
  return { left, top };
}
```

Vive en `src/lib/position.ts` (archivo nuevo, agregar a la lista de arriba).
`Menu` la usa así: calcula la posición "ideal" (ancla hacia arriba-derecha
del botón como se describe arriba), mide su propio `min-width`/altura
estimada con un `ref` + `getBoundingClientRect()` tras el primer render (o
usa un tamaño fijo conocido si se prefiere evitar el doble-render), y pasa
todo por `clampMenuPosition` antes de aplicar `left`/`top` finales — en vez
de fijar por separado `bottom`/`right` como en la descripción de arriba,
conviene resolver todo en términos de `left`/`top` absolutos ya clampeados
para reutilizar la misma función en fase 3.

```tsx
'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clampMenuPosition } from '../../lib/position';

export interface MenuProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  onRequestClose: () => void;
  children: React.ReactNode;
}

export function Menu({ open, anchorRef, onRequestClose, children }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !menuRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const idealLeft = anchorRect.right - menuRect.width;
    const idealTop = anchorRect.top - menuRect.height - 8;
    const { left, top } = clampMenuPosition({
      idealLeft,
      idealTop,
      width: menuRect.width,
      height: menuRect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    setStyle({ position: 'fixed', left, top, visibility: 'visible' });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) {
        onRequestClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onRequestClose();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, anchorRef, onRequestClose]);

  if (!open) return null;

  return (
    <div ref={menuRef} className="ia-fra-menu" style={style} role="menu">
      {children}
    </div>
  );
}
```

## `MenuItem` / `ToggleRow`

- `MenuItem`: fila genérica, `label` + slot derecho opcional (para el
  chevron ">" que se agrega en fase 3 en los nodos con hijos). En fase 2
  solo se usa como contenedor de layout para `ToggleRow`.
- `ToggleRow`: fila con `label` a la izquierda y un slide toggle (switch)
  a la derecha, controlado (`checked`, `onChange`). El switch es un botón
  propio (no `<input type="checkbox">` desnudo) estilizado como cápsula con
  un círculo que se desliza — accesible: `role="switch"`,
  `aria-checked={checked}`, focable con teclado (`Enter`/`Space` togglea).

`MenuItem` expone vía `forwardRef` el `div` raíz (`.ia-fra-menu-item-wrap`)
— fase 3 lo necesita como `anchorRef` de `SubMenu`, para posicionar el
submenú al lado de ESTE item puntual (no del botón principal):

```tsx
'use client';

import { forwardRef } from 'react';

export interface MenuItemProps {
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  right?: React.ReactNode; // slot derecho, p.ej. un ToggleRow's switch
  children?: React.ReactNode;
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { label, hasChildren, expanded, onClick, right, children },
  ref
) {
  return (
    <div ref={ref} className="ia-fra-menu-item-wrap">
      <div
        className="ia-fra-menu-item"
        role={hasChildren ? 'button' : undefined}
        tabIndex={hasChildren ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (hasChildren && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <span className="ia-fra-menu-item__label">{label}</span>
        {right}
        {hasChildren && (
          <span className={`ia-fra-chevron${expanded ? ' ia-fra-chevron--open' : ''}`} aria-hidden="true">
            &rsaquo;
          </span>
        )}
      </div>
      {children}
    </div>
  );
});
```

```tsx
'use client';

export interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="ia-fra-menu-item">
      <span className="ia-fra-menu-item__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`ia-fra-toggle${checked ? ' ia-fra-toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ia-fra-toggle__thumb" />
      </button>
    </div>
  );
}
```

Primer nodo del menú en esta fase (dentro de `Menu` en `IaFrontRefAssistant.tsx`
o directamente en `Menu.tsx` según convenga en fase 7 — de momento alcanza
con saber que se renderiza así):

```tsx
<ToggleRow
  label="Activo"
  checked={config.active}
  onChange={toggleActive}
/>
```

## Estilos (`src/styles/index.css`, o `src/styles/tokens.css` +
`src/styles/button-menu.css` si se ejecuta en modo multi-agente — ver
[10-parallel-execution-plan.md](10-parallel-execution-plan.md))

Se define acá la paleta base (variables, ya dadas en
[00-overview.md](00-overview.md#convenciones-globales-leer-antes-de-implementar-cualquier-fase))
y las clases de botón/badge/menú/toggle que reutilizan las fases
siguientes. Contenido completo del archivo para esta fase (fases
posteriores solo **agregan** bloques nuevos al final, nunca redefinen lo de
acá):

```css
.ia-fra-root {
  --ia-fra-bg: #0d0d0d;
  --ia-fra-fg: #ffffff;
  --ia-fra-border: #2a2a2a;
  --ia-fra-accent: #3b82f6;
  --ia-fra-danger: #ef4444;
  --ia-fra-radius: 10px;
  --ia-fra-radius-sm: 6px;
  --ia-fra-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  --ia-fra-gap: 8px;
  --ia-fra-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --ia-fra-font-size: 13px;
  --ia-fra-z: 2147483000;
  --ia-fra-button-size: 52px;

  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: var(--ia-fra-z);
  font-family: var(--ia-fra-font);
  font-size: var(--ia-fra-font-size);
}

.ia-fra-button {
  position: relative;
  width: var(--ia-fra-button-size);
  height: var(--ia-fra-button-size);
  border-radius: 50%;
  background: var(--ia-fra-bg);
  color: var(--ia-fra-fg);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--ia-fra-shadow);
  transition: opacity 0.15s ease;
}

.ia-fra-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--ia-fra-danger);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.ia-fra-menu {
  min-width: 220px;
  background: var(--ia-fra-bg);
  color: var(--ia-fra-fg);
  border-radius: var(--ia-fra-radius);
  box-shadow: var(--ia-fra-shadow);
  padding: 6px;
  opacity: 0;
  transform: translateY(4px);
  animation: ia-fra-menu-in 120ms ease forwards;
}

.ia-fra-menu--sub {
  min-width: 200px;
}

@keyframes ia-fra-menu-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ia-fra-menu-item-wrap {
  display: flex;
  flex-direction: column;
}

.ia-fra-menu-item {
  display: flex;
  align-items: center;
  gap: var(--ia-fra-gap);
  padding: 8px 10px;
  border-radius: var(--ia-fra-radius-sm);
  cursor: default;
}

.ia-fra-menu-item[role="button"] {
  cursor: pointer;
}

.ia-fra-menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.ia-fra-menu-item__label {
  flex: 1;
  white-space: nowrap;
}

.ia-fra-chevron {
  display: inline-block;
  transition: transform 0.15s ease;
  opacity: 0.6;
}

.ia-fra-chevron--open {
  transform: rotate(90deg);
}

.ia-fra-action-row {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--ia-fra-fg);
  font: inherit;
  cursor: pointer;
}

.ia-fra-action-row:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ia-fra-toggle {
  position: relative;
  width: 34px;
  height: 20px;
  border-radius: 999px;
  border: none;
  background: #333333;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.ia-fra-toggle--on {
  background: var(--ia-fra-accent);
}

.ia-fra-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.15s ease;
}

.ia-fra-toggle--on .ia-fra-toggle__thumb {
  transform: translateX(14px);
}
```

Nota: `.ia-fra-root` es a la vez el contenedor de tokens CSS (variables) Y
el `position: fixed` que ancla el botón esquina inferior-derecha — como en
fase 7 este `<div>` cuelga directo de `document.body` vía Portal, sus
descendientes con su propio `position: fixed` (menú, submenús, overlays,
modal) se posicionan respecto al **viewport**, no respecto a
`.ia-fra-root` (ambos usan el mismo containing block: la ventana), así que
no hay conflicto entre "el botón ancla abajo-derecha" y "el menú se ancla
arriba del botón con sus propias coordenadas absolutas".

## Casos borde

- Viewport muy angosto (mobile): el menú con `right` fijo puede desbordar
  por la izquierda si `min-width` > espacio disponible — clamp con
  `Math.min` contra `window.innerWidth - 16`. No es crítico para v1 pero
  dejar el cálculo preparado (función `clampMenuPosition`) para no romper
  layout en pantallas chicas.
- Doble click rápido en el botón: el segundo click debe togglear
  correctamente (abre→cierra→abre), no quedar en un estado intermedio por
  el timer de 2s corriendo de fondo — al abrir, cancelar cualquier timer
  pendiente de un cierre previo.

## Criterios de aceptación (tests)

- `FloatingButton.test.tsx`: click simple llama `onToggleMenu` y no llama
  las otras dos; click con `ctrlKey` llama solo `onCtrlClick`; click con
  `ctrlKey+altKey` llama solo `onCtrlAltClick`; badge no se renderiza con
  `badgeCount={0}`, sí con `badgeCount={3}` mostrando "3".
- `Menu.test.tsx`: con `open=true` se ve el toggle "Activo"; click afuera
  (`fireEvent.mouseDown(document.body)`) dispara cierre; con
  `vi.useFakeTimers()`, `mouseLeave` del wrapper + `vi.advanceTimersByTime(2000)`
  dispara cierre, pero si antes de los 2s hay un `mouseEnter`, no se cierra.
