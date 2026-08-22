# Fase 5 — Overlays: frames y labels

Depende de fase 4 (`useTrackedTargets`, `lib/dom.ts`). Esta fase dibuja
sobre la página lo que fase 4 detecta.

## Decisión de arquitectura clave: un solo "hovered target" compartido

`CaptureOverlay` (frame on-hover) y `ShowOverlay` (frames persistentes con
opacidad baja que suben a opacidad total on-hover) **comparten** la misma
noción de "qué elemento real está bajo el mouse ahora mismo", para evitar
dos sistemas de hit-testing distintos y para que el hover-to-full-opacity
de `ShowOverlay` funcione aunque el frame dibujado tenga
`pointer-events: none` (necesario para no bloquear clicks a la página real
por debajo).

```
src/components/Overlay/useHoveredTarget.ts   (nuevo, capa compartida)
src/components/Overlay/useRect.ts
src/components/Overlay/FrameLabel.tsx
src/components/Overlay/CaptureOverlay.tsx
src/components/Overlay/ShowOverlay.tsx
```

### `useHoveredTarget`

```ts
function useHoveredTarget(targets: TrackedTarget[]): TrackedTarget | null
```

- Un único listener `mousemove` en `document` (no por-elemento — más barato
  con muchos targets), con `document.elementFromPoint(e.clientX, e.clientY)`.
- Del elemento bajo el mouse, sube por `.closest()` buscando si coincide con
  alguno de los `el` en `targets` (comparación por igualdad de referencia
  del nodo, no por id — recorrer `targets` y usar `target.el.contains(hitEl)`
  o `hitEl.closest(...)`; más preciso: para cada `target`, chequear
  `target.el === hitEl || target.el.contains(hitEl)`, y quedarse con el que
  tenga el `el` **más específico** — es decir, si el punto cae dentro de un
  componente Y dentro de un elemento individual anidado en ese componente,
  gana el más profundo/específico en el DOM, no el primero de la lista).
- Throttle con `requestAnimationFrame` (no recalcular en cada evento crudo
  de `mousemove`, que dispara decenas de veces por segundo).
- Devuelve `null` cuando el mouse no está sobre ningún target trackeado.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import type { TrackedTarget } from '../../lib/dom';

export function useHoveredTarget(targets: TrackedTarget[]): TrackedTarget | null {
  const [hovered, setHovered] = useState<TrackedTarget | null>(null);
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const rafRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (targets.length === 0) {
      setHovered(null);
      return;
    }

    function resolveHover() {
      rafRef.current = null;
      const point = lastPointRef.current;
      if (!point) return;
      const hitEl = document.elementFromPoint(point.x, point.y);
      if (!hitEl) {
        setHovered((prev) => (prev === null ? prev : null));
        return;
      }
      // "Más específico gana": entre todos los targets cuyo el contiene (o
      // es) el elemento bajo el mouse, el que tiene más ancestros dentro
      // del propio target.el es el más profundo/anidado.
      let best: TrackedTarget | null = null;
      let bestDepth = -1;
      for (const target of targetsRef.current) {
        if (target.el === hitEl || target.el.contains(hitEl)) {
          let depth = 0;
          let node: Element | null = hitEl;
          while (node && node !== target.el) {
            depth += 1;
            node = node.parentElement;
          }
          if (depth > bestDepth) {
            bestDepth = depth;
            best = target;
          }
        }
      }
      setHovered((prev) => (prev === best ? prev : best));
    }

    function handleMouseMove(e: MouseEvent) {
      lastPointRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(resolveHover);
      }
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targets.length]);

  return hovered;
}
```

Nota sobre `setHovered((prev) => (prev === best ? prev : best))`: evita un
`setState` (y re-render) en cada frame si el target hovereado no cambió
— `best` puede ser un objeto distinto por referencia aunque represente el
mismo elemento (los arrays de `useTrackedTargets` son nuevos en cada
escaneo, fase 4), así que en rigor esta comparación por referencia **no**
siempre deduplica correctamente entre escaneos distintos — es una
optimización best-effort, no una garantía; el costo de un `setState` de
más cuando el DOM real no cambió es aceptable para v1 (React igual evita
volver a pintar si el resultado del render es idéntico).

### `useRect`

```ts
function useRect(el: Element | null): DOMRect | null
```

- Mientras `el` no sea `null`: loop con `requestAnimationFrame` que llama
  `el.getBoundingClientRect()` en cada frame y hace `setState` solo si
  cambió (comparar `top/left/width/height` con el valor previo antes de
  `setState`, para no re-renderizar en cada frame si el elemento está
  quieto). Se detiene (`cancelAnimationFrame`) cuando `el` pasa a `null` o
  al desmontar.
- Este approach (rAF loop en vez de solo `scroll`/`resize` listeners) cubre
  también animaciones CSS/transiciones del layout de la página anfitriona
  que muevan el elemento sin disparar `scroll`/`resize` — más robusto para
  un helper que vive dentro de una app arbitraria que no controlamos.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

function rectsEqual(a: DOMRect | null, b: DOMRect): boolean {
  return !!a && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

export function useRect(el: Element | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!el) {
      setRect(null);
      return;
    }
    function tick() {
      const next = el!.getBoundingClientRect();
      setRect((prev) => (rectsEqual(prev, next) ? prev : next));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [el]);

  return rect;
}
```

### `FrameLabel`

```ts
interface FrameLabelProps {
  rect: DOMRect;
  label: string;
  opacity?: number;     // default 1
  interactive?: boolean; // si true, el label (no el frame completo) es clickeable
  onClick?: () => void;
}
```

- `position: fixed`, `top/left/width/height` desde `rect`, `border: 2px
  solid <color-de-acento>`, `pointer-events: none` en el frame en sí.
- El label (chip con el `id`) se renderiza como hijo posicionado
  `top: -22px` (arriba del frame, pegado al borde superior izquierdo) con
  `pointer-events: auto` **solo si** `interactive` — es el único punto
  clickeable de todo el overlay, así nunca tapa clicks reales de la página
  por debajo excepto en esa franja chica del label.
- Si el label se saldría del viewport por arriba (`rect.top < 22`), flip:
  se dibuja **adentro** del frame, pegado al borde superior, en vez de
  arriba de él.

```tsx
'use client';

export interface FrameLabelProps {
  rect: DOMRect;
  label: string;
  opacity?: number;
  interactive?: boolean;
  onClick?: () => void;
}

export function FrameLabel({ rect, label, opacity = 1, interactive = false, onClick }: FrameLabelProps) {
  const labelInside = rect.top < 22;
  return (
    <div
      className="ia-fra-frame"
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <span
        className="ia-fra-frame__label"
        style={{
          position: 'absolute',
          top: labelInside ? 2 : -22,
          left: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
        }}
        onClick={interactive ? onClick : undefined}
      >
        {label}
      </span>
    </div>
  );
}
```

### `CaptureOverlay`

```ts
interface CaptureOverlayProps {
  onSelect: (target: TrackedTarget) => void; // abre el modal, fase 6
}
```

- Usa `useTrackedTargets(config.capture)` (las 3 flags de capturar, no las
  de mostrar) y `useHoveredTarget(targets)`.
- Si `hovered` no es `null`, renderiza **un solo** `FrameLabel` con
  `interactive: true` y `onClick={() => onSelect(hovered)}`.
- Si `config.active === false` o las 3 flags de `capture` están en
  `false`, el componente devuelve `null` sin correr ningún hook de tracking
  costoso (los early-return de `useTrackedTargets`/`useHoveredTarget` ya lo
  cubren, pero además el componente padre en fase 7 ni siquiera monta este
  componente si `!config.active`).

### `ShowOverlay`

```ts
// sin props propias más allá de leer el contexto
```

- Usa `useTrackedTargets(config.show)` — importante: son las flags de
  **mostrar**, no las de capturar; si el usuario tiene "mostrar secciones"
  activo pero "capturar secciones" apagado, igual debe ver los frames (mera
  visualización), simplemente no van a ser clickeables para abrir el modal.
- También necesita `useHoveredTarget`, pero sobre la **unión** de targets
  de mostrar Y captura (para que si el mouse está sobre un elemento que
  además está siendo trackeado por "mostrar", ese frame en particular suba
  su opacidad) — en la práctica: `ShowOverlay` recibe como prop opcional el
  `hovered` ya calculado por un hook compartido más arriba (ver nota de
  composición abajo) en vez de recalcularlo de cero.
- Renderiza **un `FrameLabel` por cada target**, todos con
  `interactive: false` (mostrar es puramente visual, no abre modal), y
  `opacity = target.el === hovered?.el ? 1 : 0.35`.

### Nota de composición (evita doble hit-testing)

En fase 7, el componente que monta ambos overlays calcula **un solo**
`useHoveredTarget` sobre la unión `[...captureTargets, ...showTargets]` y
lo pasa como prop a ambos, en vez de que cada overlay corra su propio
`mousemove` listener por separado. Documentado acá para que fase 7 no lo
pase por alto — `CaptureOverlay`/`ShowOverlay` deben aceptar `hovered` como
prop en vez de calcularlo ellos mismos con el hook directamente (el hook
`useHoveredTarget` vive en `Overlay/`, pero se invoca una sola vez, arriba).

Ajuste a las firmas de arriba (código completo, ya con el ajuste
aplicado):

```tsx
'use client';

import type { TrackedTarget } from '../../lib/dom';
import { useRect } from './useRect';
import { FrameLabel } from './FrameLabel';

export interface CaptureOverlayProps {
  targets: TrackedTarget[];
  hovered: TrackedTarget | null;
  onSelect: (target: TrackedTarget) => void;
}

export function CaptureOverlay({ targets, hovered, onSelect }: CaptureOverlayProps) {
  // Importante: `hovered` viene de un useHoveredTarget calculado sobre la
  // UNIÓN capture+show (fase 7) — puede ser un target que solo pertenece a
  // "mostrar", no a "capturar". Hay que confirmar que está en `targets`
  // (los de este overlay) antes de dibujar/permitir click.
  const isCaptureHover = hovered !== null && targets.some((t) => t.el === hovered.el);
  const rect = useRect(isCaptureHover ? hovered!.el : null);
  if (!isCaptureHover || !rect) return null;
  return <FrameLabel rect={rect} label={hovered!.id} interactive onClick={() => onSelect(hovered!)} />;
}
```

```tsx
'use client';

import type { TrackedTarget } from '../../lib/dom';
import { useRect } from './useRect';
import { FrameLabel } from './FrameLabel';

export interface ShowOverlayProps {
  targets: TrackedTarget[];
  hovered: TrackedTarget | null;
}

export function ShowOverlay({ targets, hovered }: ShowOverlayProps) {
  return (
    <>
      {targets.map((target, index) => (
        // key por índice, no por target.id: data-wrapper-id/data-component-id
        // pueden repetirse entre elementos distintos (fase 4, "casos borde"),
        // así que id no es una key confiable acá.
        <ShowOverlayFrame key={index} target={target} isHovered={hovered?.el === target.el} />
      ))}
    </>
  );
}

function ShowOverlayFrame({ target, isHovered }: { target: TrackedTarget; isHovered: boolean }) {
  const rect = useRect(target.el);
  if (!rect) return null;
  return <FrameLabel rect={rect} label={target.id} opacity={isHovered ? 1 : 0.35} />;
}
```

## Estilos (agregar a `src/styles/index.css`, o `src/styles/overlays.css`
en modo multi-agente — ver [10-parallel-execution-plan.md](10-parallel-execution-plan.md))

```css
.ia-fra-frame__label {
  background: var(--ia-fra-accent);
  color: #ffffff;
  font: 500 11px/1.4 var(--ia-fra-font);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: var(--ia-fra-shadow);
}
```

El `.ia-fra-frame` en sí (el rectángulo) no necesita clase con estilos de
color propios más allá del `border` — se resuelve inline en `FrameLabel`
salvo el borde, que sí conviene sacar a CSS para reusar el token:

```css
.ia-fra-frame {
  border: 2px solid var(--ia-fra-accent);
  border-radius: 2px;
  box-sizing: border-box;
}
```

## Casos borde

- Elemento capturado que se sale del viewport por scroll (rect con
  `top`/`left` negativos o mayores al viewport) — se sigue renderizando el
  frame (puede quedar parcialmente cortado, es aceptable) en vez de
  ocultarlo condicionalmente; ocultarlo agregaría flicker al bordear el
  límite. Simplifica la fase 5; revisar en fase 7 si hace falta recortar.
- Dos targets superpuestos exactamente (ej. un componente que ocupa el
  100% de su wrapper) con ambas flags de mostrar activas → se dibujan dos
  frames casi idénticos, uno encima del otro. Aceptado como limitación
  visual conocida para v1 (no hay lógica de "fusionar" frames solapados).
- `elementFromPoint` puede devolver `null` si el cursor está fuera del
  documento (ej. sobre una barra de scroll nativa) — `useHoveredTarget`
  debe manejar ese `null` devolviendo `null` sin tirar.

## Criterios de aceptación (tests)

- `FrameLabel.test.tsx`: renderiza con el `rect` dado, aplica `opacity`
  correctamente, `onClick` del label solo dispara si `interactive`.
- `useHoveredTarget` es difícil de testear con jsdom real (no hay layout);
  testear con `document.elementFromPoint` mockeado (`vi.spyOn`) devolviendo
  un nodo fijo, y verificar que el hook resuelve el `TrackedTarget`
  correcto (incluyendo el caso "más específico gana" con dos targets
  anidados donde uno `contains` al otro).
- Test de integración liviano: montar `CaptureOverlay` con 1 target y
  `hovered` igual a ese target vía prop — se ve el frame y clickear el
  label llama `onSelect` con el target correcto.
- `ShowOverlay` con 2 targets y `hovered = targets[0]`: el frame de
  `targets[0]` tiene opacidad 1 y el de `targets[1]` tiene opacidad 0.35.
