# Fase 3 — Submenús "Capturar" y "Modo prompt"

Depende de fase 2 (`Menu`, `MenuItem`, `ToggleRow`). Agrega los dos nodos
con hijos y el mecanismo de submenú lateral.

## Archivos a crear / modificar

```
src/components/Menu/SubMenu.tsx        (nuevo)
src/components/Menu/ActionRow.tsx      (nuevo)
```

`Menu.tsx` y `MenuItem.tsx` **no** se modifican en esta fase — ya soportan
todo lo necesario (`hasChildren`/`expanded`/`onClick`/`children`) desde el
código completo que dejó fase 2. Los dos `MenuItem` con hijos ("Capturar" y
"Modo prompt") no se arman acá, se arman en `AssistantRoot`
(`IaFrontRefAssistant.tsx`, fase 7), que es quien ya compone todo el
contenido real del menú — esta fase solo agrega las piezas (`SubMenu`,
`ActionRow`) que esa composición va a usar.

## Comportamiento general

- Solo un submenú abierto a la vez. Estado `openSubmenu: 'capturar' | 'modo-prompt' | null`
  vive en **`AssistantRoot`** (`IaFrontRefAssistant.tsx`, fase 7) — **no**
  dentro de `Menu.tsx` ni en el contexto global de fase 1. Motivo: `Menu.tsx`
  (fase 2) recibe `children` genéricos y solo los renderiza/posiciona, no
  los inspecciona ni les inyecta props — evitar el patrón
  `React.Children.map` + `cloneElement` para no depender de manipulación de
  children, que es frágil. En cambio, `AssistantRoot` ya arma cada
  `<MenuItem>` explícitamente (ver fase 7), así que le pasa `expanded` y
  `onClick` como props normales y directas, sin magia:

  ```tsx
  // dentro de AssistantRoot, junto al resto del estado de fase 7
  const [openSubmenu, setOpenSubmenu] = useState<'capturar' | 'modo-prompt' | null>(null);

  function toggleSubmenu(key: 'capturar' | 'modo-prompt') {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  }
  ```

  ```tsx
  <MenuItem label="Capturar" hasChildren expanded={openSubmenu === 'capturar'} onClick={() => toggleSubmenu('capturar')}>
    {openSubmenu === 'capturar' && <SubMenu>{/* ...5 ToggleRow */}</SubMenu>}
  </MenuItem>
  <MenuItem label="Modo prompt" hasChildren expanded={openSubmenu === 'modo-prompt'} onClick={() => toggleSubmenu('modo-prompt')}>
    {openSubmenu === 'modo-prompt' && <SubMenu>{/* ...2 ActionRow */}</SubMenu>}
  </MenuItem>
  ```

  Nota: el `SubMenu` se renderiza condicionalmente (`openSubmenu === 'x' && <SubMenu>`)
  en vez de estar siempre montado y ocultarlo con CSS — más simple, y ya
  cubre "cerrar el otro automáticamente" gratis (solo uno de los dos
  `openSubmenu === '...'` puede ser `true` a la vez).
- **Se abre con click** en el `MenuItem` padre (no hover). Click de nuevo
  sobre el mismo padre lo cierra. Click sobre el otro padre cierra el
  actual y abre el nuevo. Ambos casos ya cubiertos por `toggleSubmenu` de
  arriba (comparación `prev === key ? null : key`).
- El submenú se posiciona **al lado** del item padre: por defecto a la
  derecha (`left: 100%` relativo al item), con flip a la izquierda
  (`right: 100%`) si `parentRect.right + submenuWidth > window.innerWidth`.
  Mismo patrón de cálculo que el `Menu` principal en fase 2
  (`getBoundingClientRect` + clamp).
- El timer de 2s de auto-cierre (fase 2, `useHoverCloseTimer`) debe cubrir
  también el submenú abierto: el wrapper que agrupa botón+menú necesita
  ahora envolver también el submenú montado (o el hook necesita aceptar un
  ref adicional dinámico). Opción más simple: el submenú se renderiza
  **dentro** del mismo wrapper raíz que ya escucha `mouseEnter/mouseLeave`
  (aunque visualmente esté posicionado `fixed`/`absolute` fuera del flujo,
  sigue siendo hijo del DOM del wrapper), así el hook de fase 2 no necesita
  cambios.
- Cerrar el `Menu` principal (por click afuera, Escape, o el timer) también
  debe cerrar cualquier submenú abierto. Como ambos estados (`menuOpen` y
  `openSubmenu`) viven en `AssistantRoot`, el `closeMenu` que ya se le pasa
  a `Menu.onRequestClose` y a `useHoverCloseTimer.onClose` (fase 7) debe
  resetear los dos, no solo `menuOpen`:

  ```tsx
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  }, []);
  ```

  (esto reemplaza el `closeMenu` más simple mostrado en la composición de
  fase 7 — fase 7 debe usar esta versión, que también limpia el submenú).

## `MenuItem` (extendido)

```ts
interface MenuItemProps {
  label: string;
  hasChildren?: boolean;
  expanded?: boolean;     // para mostrar el chevron rotado / resaltado
  onClick?: () => void;
  children?: React.ReactNode; // el SubMenu, renderizado condicionalmente
}
```

Cuando `hasChildren`, se muestra un chevron `›` a la derecha que rota 90°
cuando `expanded` (mismo trato visual que un acordeón).

## `SubMenu`

```ts
interface SubMenuProps {
  anchorRef: React.RefObject<HTMLElement>; // el MenuItem padre (su ref forwardeado, fase 2)
  children: React.ReactNode;
}
```

Mismo tratamiento visual que `Menu` (fondo negro, texto blanco,
`border-radius`, sombra), reutiliza clases `.ia-fra-menu` con un modificador
`.ia-fra-menu--sub` para el posicionamiento lateral en vez de hacia arriba.

```tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { clampMenuPosition } from '../../lib/position';

export interface SubMenuProps {
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}

export function SubMenu({ anchorRef, children }: SubMenuProps) {
  const subMenuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!anchorRef.current || !subMenuRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const subRect = subMenuRef.current.getBoundingClientRect();
    const gap = 8;
    // Por defecto a la derecha del item padre; flip a la izquierda si no entra.
    const fitsRight = anchorRect.right + gap + subRect.width <= window.innerWidth;
    const idealLeft = fitsRight ? anchorRect.right + gap : anchorRect.left - gap - subRect.width;
    const idealTop = anchorRect.top;
    const { left, top } = clampMenuPosition({
      idealLeft,
      idealTop,
      width: subRect.width,
      height: subRect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    setStyle({ position: 'fixed', left, top, visibility: 'visible' });
  }, [anchorRef]);

  return (
    <div ref={subMenuRef} className="ia-fra-menu ia-fra-menu--sub" style={style} role="menu">
      {children}
    </div>
  );
}
```

## `ActionRow`

```tsx
'use client';

export interface ActionRowProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function ActionRow({ label, disabled, onClick }: ActionRowProps) {
  return (
    <button type="button" className="ia-fra-menu-item ia-fra-action-row" disabled={disabled} onClick={onClick}>
      <span className="ia-fra-menu-item__label">{label}</span>
    </button>
  );
}
```

`ActionRow` es un `<button>` real (no un `div` con `onClick`) justamente
para que `disabled` bloquee el click también por teclado/accesibilidad sin
lógica extra — a diferencia de `MenuItem`, que sí es un `div` con
`role="button"` porque necesita anidar más contenido (`children` con el
`SubMenu` adentro, algo que un `<button>` no debería contener por HTML
válido).

## Nodo "Capturar"

Contiene 5 `ToggleRow`, todos leyendo/escribiendo `AssistantContext`. El
`MenuItem` padre necesita su propio `ref` (creado en `AssistantRoot`, fase
7) para poder pasárselo a `SubMenu` como `anchorRef`:

```tsx
// en AssistantRoot (fase 7)
const capturarRef = useRef<HTMLDivElement>(null);

<MenuItem ref={capturarRef} label="Capturar" hasChildren expanded={openSubmenu === 'capturar'} onClick={() => toggleSubmenu('capturar')}>
  {openSubmenu === 'capturar' && (
    <SubMenu anchorRef={capturarRef}>
      <ToggleRow label="Capturar secciones"    checked={config.capture.sections}   onChange={(v) => actions.setCaptureFlag('sections', v)} />
      <ToggleRow label="Capturar componentes"  checked={config.capture.components} onChange={(v) => actions.setCaptureFlag('components', v)} />
      <ToggleRow label="Capturar elementos individuales" checked={config.capture.elements} onChange={(v) => actions.setCaptureFlag('elements', v)} />
      <ToggleRow label="Mostrar todas las secciones"   checked={config.show.sections}   onChange={(v) => actions.setShowFlag('sections', v)} />
      <ToggleRow label="Mostrar todos los componentes" checked={config.show.components} onChange={(v) => actions.setShowFlag('components', v)} />
    </SubMenu>
  )}
</MenuItem>
```

Sin lógica de detección DOM todavía (eso es fase 4) — en esta fase los
toggles ya persisten en `localStorage` vía el provider de fase 1, solo que
todavía no producen ningún efecto visual en la página.

## Nodo "Modo prompt"

Contiene 2 acciones (no toggles). Mismo patrón de `ref` propio +
`anchorRef` que el nodo "Capturar":

```tsx
// en AssistantRoot (fase 7)
const modoPromptRef = useRef<HTMLDivElement>(null);

<MenuItem ref={modoPromptRef} label="Modo prompt" hasChildren expanded={openSubmenu === 'modo-prompt'} onClick={() => toggleSubmenu('modo-prompt')}>
  {openSubmenu === 'modo-prompt' && (
    <SubMenu anchorRef={modoPromptRef}>
      <ActionRow label="Vaciar fila de prompts" disabled={prompts.length === 0} onClick={actions.clearPrompts} />
      <ActionRow label="Copiar fila de prompts" disabled={prompts.length === 0} onClick={handleCopyAndClear} />
    </SubMenu>
  )}
</MenuItem>
```

`handleCopyAndClear` (copiar formateado + vaciar la fila) recién existe de
verdad en fase 7, porque necesita `lib/clipboard.ts`/`lib/promptFormat.ts`
de fase 6 — acá en fase 3 alcanza con testear `ActionRow`/`SubMenu` de
forma aislada, pasándoles un `onClick` mock en el test (ver "Criterios de
aceptación" abajo); no hace falta una app completa corriendo para probar
estos dos componentes nuevos.

**Feedback visual de "Copiado"**: al ejecutar `handleCopyAndClear` con éxito,
el label del `ActionRow` cambia brevemente a "¡Copiado!" (~1.2s) antes de
volver a "Copiar fila de prompts". `ActionRow` en sí **no** tiene este
estado (recibe `label` como prop simple, no sabe nada de async/éxito) — el
estado `justCopied` vive en `AssistantRoot` (fase 7, junto al resto del
estado de UI) porque es quien sabe si `copyText` tuvo éxito:

```tsx
// en AssistantRoot (fase 7)
const [justCopied, setJustCopied] = useState(false);

const handleCopyAndClear = useCallback(async () => {
  if (prompts.length === 0) return;
  const ok = await copyText(formatQueueForClipboard(prompts));
  if (ok) {
    actions.clearPrompts();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1200);
  }
}, [prompts, actions]);
```

```tsx
<ActionRow
  label={justCopied ? '¡Copiado!' : 'Copiar fila de prompts'}
  disabled={prompts.length === 0}
  onClick={handleCopyAndClear}
/>
```

(Esta versión de `handleCopyAndClear` reemplaza a la mostrada más arriba en
la sección "Nodo Modo prompt" y a la de fase 7 — es la definitiva, ya
incluye el feedback visual.)

## Casos borde

- Togglear "Capturar secciones" y "Mostrar todas las secciones" al mismo
  tiempo es válido y esperado (no son mutuamente excluyentes) — ambos
  afectan capas distintas (hover vs. persistente), ver fase 5.
- Click en "Vaciar"/"Copiar" mientras están `disabled` (`prompts.length === 0`)
  no debe hacer nada — el botón real HTML debe tener el atributo `disabled`,
  no solo estilo visual, para que tampoco dispare `onClick` por accesibilidad
  de teclado.
- Abrir "Capturar", después abrir "Modo prompt" sin cerrar antes: el
  submenú de "Capturar" debe desmontarse (no quedar superpuesto).

## Criterios de aceptación (tests)

- `Menu.submenus.test.tsx`: click en "Capturar" muestra los 5 toggles; click
  en "Modo prompt" oculta el submenú de "Capturar" y muestra las 2 acciones;
  click de nuevo sobre "Capturar" (estando abierto) lo cierra.
- Togglear cada `ToggleRow` del submenú "Capturar" actualiza
  `config.capture.*` / `config.show.*` en el contexto y en
  `localStorage['ia-fra:config']`.
- Con `prompts` vacío, "Vaciar" y "Copiar" están `disabled`; con
  `prompts.length > 0`, "Vaciar" llama `clearPrompts` y deja `prompts` en `[]`.
