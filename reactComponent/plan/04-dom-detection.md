# Fase 4 — Motor de detección DOM

Sin UI. Funciones puras + un hook que las orquesta con `MutationObserver`.
Es el módulo con más lógica no trivial del proyecto — se testea a fondo
antes de que fase 5 dibuje nada sobre estos resultados.

## Archivos a crear

```
src/lib/dom.ts
src/hooks/useTrackedTargets.ts
```

## `src/lib/dom.ts`

```ts
export interface TrackedTarget {
  el: Element;
  id: string;         // valor real (wrapper/component) o id runtime (elemento)
  type: TargetType;    // 'section' | 'component' | 'element'
}

export function getWrapperElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(`[${ATTR_WRAPPER}]`));
}

export function getComponentElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(`[${ATTR_COMPONENT}]`));
}

export function hasDirectText(el: Element): boolean {
  // true si el elemento tiene al menos un childNode de tipo TEXT_NODE
  // con contenido no vacío luego de trim() — no cuenta texto que venga
  // solo de descendientes (ese texto pertenece al hijo, no a este nodo).
  return Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0
  );
}

export function isLeafCandidate(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if ((LEAF_TAGS as readonly string[]).includes(tag)) return true;
  if ((TEXT_CONTAINER_TAGS as readonly string[]).includes(tag)) {
    return hasDirectText(el);
  }
  return false;
}

export function findIndividualElements(scopeRoot: Element): Element[] {
  // recorre descendientes de scopeRoot (un wrapper o componente capturado),
  // sin entrar a subtrees que sean a su vez [data-wrapper-id] o
  // [data-component-id] anidados (esos elementos pertenecen a SU PROPIO
  // scope, no al del padre) — se listan aparte cuando se procesa ese scope.
  const results: Element[] = [];
  const walker = document.createTreeWalker(scopeRoot, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const el = node as Element;
      if (el !== scopeRoot && (el.hasAttribute(ATTR_WRAPPER) || el.hasAttribute(ATTR_COMPONENT))) {
        return NodeFilter.FILTER_REJECT; // no entra a este subtree
      }
      return NodeFilter.FILTER_SKIP; // sigue bajando, pero no lo acepta él mismo todavía
    },
  });
  let current = walker.nextNode();
  while (current) {
    const el = current as Element;
    if (isLeafCandidate(el)) results.push(el);
    current = walker.nextNode();
  }
  return results;
}

export function buildRelativeId(el: Element, scopeRoot: Element, scopeId: string): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== scopeRoot) {
    const tag = node.tagName.toLowerCase();
    const parent = node.parentElement;
    const index = parent
      ? Array.from(parent.children).filter((c) => c.tagName === node!.tagName).indexOf(node) + 1
      : 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    node = node.parentElement;
  }
  const prefix = scopeRoot.hasAttribute(ATTR_COMPONENT) ? 'comp' : 'wrap';
  return [`${prefix}:${scopeId}`, ...parts].join(' > ');
}
```

Nota sobre `findIndividualElements`: con `FILTER_REJECT`/`FILTER_SKIP` el
`TreeWalker` nunca "acepta" un nodo vía el filtro (siempre se recorre
manualmente con `nextNode()` y se decide `isLeafCandidate` afuera) — esto es
intencional, el filtro solo se usa para **podar** subtrees anidados, no para
seleccionar hojas (eso lo hace `isLeafCandidate` por fuera, porque un mismo
nodo puede no ser "hoja" pero sí tener que seguir recorriéndose).

## `src/hooks/useTrackedTargets.ts`

```ts
export interface TrackedTargetFlags {
  sections: boolean;
  components: boolean;
  elements?: boolean; // opcional: config.show (fase 1) no tiene este campo
}

function useTrackedTargets(flags: TrackedTargetFlags): TrackedTarget[]
```

`elements` es **opcional** en el tipo (no `boolean` estricto) a propósito:
este mismo hook se llama tanto con `config.capture` (fase 1, tiene las 3
flags) como con `config.show` (fase 1, solo tiene `sections`/`components`)
— si `elements` fuera obligatorio, `useTrackedTargets(config.show)` no
compilaría. Adentro del hook, `flags.elements` ausente se trata como
`false` (`const elements = flags.elements ?? false`).

- Si las 3 flags son `false`, devuelve `[]` inmediatamente y **no** monta
  ningún `MutationObserver` (evita costo cuando el usuario no tiene nada
  activado).
- Escaneo:
  1. Si `sections`: `getWrapperElements()` → `{el, id: el.getAttribute(ATTR_WRAPPER)!, type: 'section'}`.
  2. Si `components`: `getComponentElements()` → igual con `type: 'component'`.
  3. Si `elements`: para cada wrapper/componente encontrado arriba (sección
     o componente, según cuál de esas dos flags también esté activa — si
     `elements` está activo pero `sections`/`components` no, igual hay que
     escanear TODOS los wrappers y componentes del documento como scope
     raíz para poder derivar elementos individuales dentro de ellos, aunque
     esos wrappers/componentes en sí no se agreguen a la lista final si su
     propia flag está apagada), correr `findIndividualElements(scopeEl)` y
     `buildRelativeId` por cada resultado, `type: 'element'`.
- `MutationObserver` sobre `document.body`:
  `{ childList: true, subtree: true, attributes: true, attributeFilter: [ATTR_WRAPPER, ATTR_COMPONENT] }`.
  Callback debounced (~120ms, `setTimeout` + clear en cada llamada nueva)
  que vuelve a correr el escaneo completo y hace `setState` con el resultado
  nuevo.
- Cleanup: `observer.disconnect()` + `clearTimeout` pendiente al desmontar o
  cuando las 3 flags pasan a `false`.
- Memoización: el array devuelto es nuevo en cada escaneo (no hay forma
  barata de diffear elementos del DOM real), así que los consumidores
  (fase 5) no deben asumir referencia estable — deben re-derivar lo que
  necesiten con `useMemo` a partir del array completo, no depender de
  identidad de objetos individuales entre renders.

Código completo:

```tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ATTR_COMPONENT, ATTR_WRAPPER } from '../lib/constants';
import { findIndividualElements, getComponentElements, getWrapperElements, buildRelativeId, type TrackedTarget } from '../lib/dom';

export interface TrackedTargetFlags {
  sections: boolean;
  components: boolean;
  elements?: boolean;
}

export function useTrackedTargets(flags: TrackedTargetFlags): TrackedTarget[] {
  const { sections, components } = flags;
  const elements = flags.elements ?? false;
  const [targets, setTargets] = useState<TrackedTarget[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scan = useCallback(() => {
    const result: TrackedTarget[] = [];
    const wrapperEls = getWrapperElements();
    const componentEls = getComponentElements();

    if (sections) {
      for (const el of wrapperEls) {
        result.push({ el, id: el.getAttribute(ATTR_WRAPPER)!, type: 'section' });
      }
    }
    if (components) {
      for (const el of componentEls) {
        result.push({ el, id: el.getAttribute(ATTR_COMPONENT)!, type: 'component' });
      }
    }
    if (elements) {
      const scopeEls = [...wrapperEls, ...componentEls];
      for (const scopeEl of scopeEls) {
        const scopeId = scopeEl.hasAttribute(ATTR_COMPONENT)
          ? scopeEl.getAttribute(ATTR_COMPONENT)!
          : scopeEl.getAttribute(ATTR_WRAPPER)!;
        for (const leafEl of findIndividualElements(scopeEl)) {
          result.push({ el: leafEl, id: buildRelativeId(leafEl, scopeEl, scopeId), type: 'element' });
        }
      }
    }
    setTargets(result);
  }, [sections, components, elements]);

  useEffect(() => {
    if (!sections && !components && !elements) {
      setTargets([]);
      return;
    }
    scan();
    const observer = new MutationObserver(() => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        scan();
        timeoutRef.current = null;
      }, 120);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [ATTR_WRAPPER, ATTR_COMPONENT],
    });
    return () => {
      observer.disconnect();
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [sections, components, elements, scan]);

  return targets;
}
```

Nota: esta versión de `useTrackedTargets`/`TrackedTarget` es la de fase 4.
Fase 8 la modifica (agrega el campo `kind` al construir los targets de
`type: 'component'`, y agrega `ATTR_COMPONENT_KIND` al `attributeFilter`
del `MutationObserver`) — ver
[08-component-config.md](08-component-config.md), sección `TrackedTarget`.
No implementar `kind` en esta fase, se agrega recién en fase 8.

## Casos borde

- Wrapper/componente sin descendientes hoja (ej. un `<div>` vacío o que
  solo contiene otro wrapper anidado) → `findIndividualElements` devuelve
  `[]` para ese scope, correcto, no debe crashear.
- Dos elementos hermanos del mismo tag (`<button>` y otro `<button>`) dentro
  del mismo padre → `nth-of-type` los distingue correctamente porque cuenta
  solo hijos con el mismo `tagName`.
- Atributo `data-wrapper-id` con valor duplicado en dos elementos distintos
  del documento (error del generador de la IA) → no es responsabilidad de
  este módulo deduplicar; se listan ambos tal cual, cada uno con su propio
  `el` — la fase 6 al guardar el prompt usa el `id` como texto, no como key
  única de React (las keys de listado en overlays se arman con el `el`
  mismo o un índice, no con `id`, justamente por este caso).
- DOM muy grande (miles de nodos) con `elements` activo: el
  `TreeWalker` por cada scope es O(n) por scope; si hay muchos wrappers
  anidados podría ser costoso — aceptable para v1, el debounce del
  `MutationObserver` mitiga recomputar en cada micro-cambio. Optimización
  (memoizar por scope que no cambió) queda fuera de v1.

## Criterios de aceptación (tests, jsdom)

- Fixture HTML con: 2 `[data-wrapper-id]`, uno de ellos con 1
  `[data-component-id]` anidado adentro, y dentro del componente un
  `<button>`, un `<div>` contenedor puro (sin texto directo) con un `<span>`
  de texto adentro, y otro `<span>` vacío.
- `getWrapperElements` devuelve los 2 wrappers (no el componente).
- `getComponentElements` devuelve el componente anidado.
- `findIndividualElements(componentEl)` devuelve `button` y el `span` con
  texto, **no** el `div` contenedor puro ni el `span` vacío, y **no** baja a
  buscar dentro de otro wrapper/componente anidado más profundo si lo
  hubiera.
- `buildRelativeId` devuelve el mismo string dos veces para la misma
  estructura (determinismo) y strings distintos para el `button` vs el
  `span`.
- `useTrackedTargets({sections:false, components:false, elements:false})`
  devuelve `[]` y no crea `MutationObserver` (spy sobre `window.MutationObserver`
  con `vi.fn()` — assert `not.toHaveBeenCalled`).
- Insertar dinámicamente un nuevo `[data-wrapper-id]` en el fixture tras el
  montaje del hook (con `sections: true`) y, luego de `vi.advanceTimersByTime(150)`
  (o `await vi.waitFor`), el resultado del hook incluye el nuevo target.

> **Actualización (fase 8)**: `TrackedTarget` gana un campo opcional
> `kind?: string`, poblado desde `data-component-kind` solo para
> `type: 'component'`. Ver [08-component-config.md](08-component-config.md).
