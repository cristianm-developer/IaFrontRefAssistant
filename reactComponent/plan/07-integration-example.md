# Fase 7 — Integración final, ejemplo y QA manual

Cierra el v1. Compone todo lo de fases 1-6 en el componente público,
asegura que `config.active` sea un apagado total real, actualiza el
proyecto `example/` con markup que tenga los `data-*` attributes para
probar todo a mano, y deja una checklist de QA.

## Archivos a crear / modificar

```
src/IaFrontRefAssistant.tsx        (composición final)
src/index.ts                       (exports públicos finales)
src/styles/index.css               (consolidar todo lo de fases 2/3/5/6)
example/src/App.tsx                (markup de prueba con data-wrapper-id / data-component-id)
README.md                          (uso del paquete, props, atajos)
```

## `IaFrontRefAssistant` es un componente envolvente (wrapper)

Decisión (ver hilo de fase 8): el componente **no** se coloca como un
elemento más suelto dentro del árbol — se usa envolviendo el site (o el
layout raíz) completo, recibiendo el contenido real como `children`:

```tsx
// main.tsx / App.tsx / layout raíz del consumidor
<IaFrontRefAssistant definitions={config}>
  <App />
</IaFrontRefAssistant>
```

`children` es **requerido** (no opcional) — es la forma de uso soportada
para v1, no un extra. Motivo de este cambio de forma respecto a "botón
suelto al final del árbol": un único punto de montaje (envolver una vez el
layout raíz) en vez de tener que acordarse de dejar `<IaFrontRefAssistant />`
como último hijo de cada página/layout; deja además la puerta abierta a que
una fase futura necesite un nodo contenedor real alrededor de `children`
(hoy no lo usa: el escaneo de fase 4 sigue siendo `document`-global, no
está scopeado a este wrapper).

`children` se renderiza **tal cual, sin envolver en ningún `<div>` extra**
(no debe alterar el layout del site en absoluto) — el helper visual
(botón/menú/overlays/modal) se renderiza aparte, vía **Portal a
`document.body`** (ver sección siguiente), no como hermano inline.

## Portal a `document.body`

Como `<IaFrontRefAssistant>` envuelve el site completo, puede terminar
anidado en cualquier punto del árbol del consumidor — incluyendo dentro de
un ancestro con `transform`, `filter`, `overflow` o `contain`, cualquiera
de los cuales crea un nuevo "containing block" y **rompe** `position:
fixed` (deja de anclarse a la ventana, se ancla a ese ancestro en cambio).
Para que el botón/menú/overlays/modal siempre floten sobre toda la página
sin importar dónde se coloque el wrapper, se montan con
`createPortal(..., document.body)` en vez de como hijos inline. Es el
patrón estándar para floating UI en React (tooltips, modales, dropdowns).

Esto no cambia nada del comportamiento ya planeado en fases 2/3/5/6 — la
única diferencia es *dónde* cuelga esa porción del árbol en el DOM real, no
*cómo* se comporta.

## SSR / hidratación (Next.js, Remix, etc.)

`document.body` no existe en el render de servidor, y montar contenido
distinto en servidor vs. primer render de cliente genera un warning de
hidratación de React (o peor, un crash si se intenta usar `document`
directamente en el cuerpo del componente). Se resuelve con el patrón
"mounted on client" ya estándar en React:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
```

En el primer render (servidor **y** primer render de cliente antes de
hidratar) `mounted` es `false` y el Portal no se evalúa en absoluto — server
y cliente coinciden exactamente (ninguno de los dos monta el Portal), cero
mismatch. Recién en el `useEffect` (que solo corre en cliente, después de
hidratar) `mounted` pasa a `true` y el botón aparece. `children`, en
cambio, **no** pasa por este guard — se renderiza igual en servidor y
cliente desde el primer render, porque es contenido real del site que sí
necesita SSR normal (si se retrasara también, el consumidor perdería SSR
para todo su site, que no es el objetivo).

## Instancias anidadas (`<IaFrontRefAssistant>` dos veces)

Si el consumidor envuelve por error con `<IaFrontRefAssistant>` más de una
vez en el mismo árbol (ej. una vez en el layout raíz y de nuevo en una
página), la segunda instancia detecta que ya existe un `AssistantContext`
más arriba (`useContext(AssistantContext)` — el chequeo crudo, no el hook
`useAssistant()` que tira error) y, en ese caso, **no** monta su propio
`AssistantProvider` ni su propia UI — solo renderiza `children` tal cual,
evitando 2 botones/2 badges compitiendo por el mismo `localStorage`. En
dev, emite un `console.warn` una sola vez para que el consumidor note el
uso duplicado.

## Composición final de `IaFrontRefAssistant.tsx`

```tsx
export interface IaFrontRefAssistantProps {
  children: React.ReactNode;
  definitions?: IaFraConfig; // ver fase 8
}

export function IaFrontRefAssistant({ children, definitions }: IaFrontRefAssistantProps) {
  // Chequeo crudo (no useAssistant(), que tira si no hay provider): si ya
  // hay una instancia más arriba, esta es anidada — no duplicar provider/UI.
  const existing = useContext(AssistantContext);
  if (existing) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[ia-front-ref-assistant] <IaFrontRefAssistant> ya está montado más ' +
        'arriba en el árbol; esta instancia anidada no vuelve a montar el ' +
        'botón/menú, solo renderiza sus children.'
      );
    }
    return <>{children}</>;
  }

  return (
    <AssistantProvider>
      <AssistantRoot definitions={definitions}>{children}</AssistantRoot>
    </AssistantProvider>
  );
}

function AssistantRoot({ children, definitions }: { children: React.ReactNode; definitions?: IaFraConfig }) {
  const { config, prompts, ...actions } = useAssistant();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const capturarRef = useRef<HTMLDivElement>(null);
  const modoPromptRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<'capturar' | 'modo-prompt' | null>(null);
  const [modalTarget, setModalTarget] = useState<TrackedTarget | null>(null);
  const [justCopied, setJustCopied] = useState(false);

  // Client-only: en servidor / primer render de cliente no existe
  // document.body, y hay que coincidir exactamente con el server render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cierra menú Y submenú juntos (fase 3): click afuera, Escape, o el timer
  // de 2s deben resetear ambos estados, no solo menuOpen.
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  }, []);

  function toggleSubmenu(key: 'capturar' | 'modo-prompt') {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  }

  // Wrapper único botón+menú(+submenú) para el timer de cierre de 2s — ver
  // fase 2, sección "Dónde se conecta useHoverCloseTimer".
  const hoverHandlers = useHoverCloseTimer({ active: menuOpen, onClose: closeMenu });

  // Apagado total: si !config.active, no se monta NINGÚN overlay ni se
  // corre NINGÚN useTrackedTargets/useHoveredTarget de fondo. El único
  // elemento que sigue vivo es el botón (para poder reactivar).
  const captureTargets = useTrackedTargets(config.active ? config.capture : NOOP_CAPTURE_FLAGS);
  const showTargets = useTrackedTargets(config.active ? config.show : NOOP_SHOW_FLAGS);
  const hovered = useHoveredTarget(config.active ? [...captureTargets, ...showTargets] : []);

  // Compartida entre FloatingButton.onCtrlAltClick y el ActionRow "Copiar
  // fila de prompts" del submenú "Modo prompt" (fase 3/6). No vacía la fila
  // si copyText falla, para no perder prompts guardados. Incluye el
  // feedback visual "¡Copiado!" (fase 3).
  const handleCopyAndClear = useCallback(async () => {
    if (prompts.length === 0) return;
    const ok = await copyText(formatQueueForClipboard(prompts));
    if (ok) {
      actions.clearPrompts();
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1200);
    }
  }, [prompts, actions]);

  const handleSavePrompt = useCallback(
    (text: string) => {
      if (!modalTarget) return;
      actions.addPrompt({
        targetId: modalTarget.id,
        targetType: modalTarget.type,
        url: window.location.href,
        text,
      });
      setModalTarget(null);
    },
    [modalTarget, actions]
  );

  const floatingUI = (
    <div
      className="ia-fra-root"
      onMouseEnter={hoverHandlers.onMouseEnter}
      onMouseLeave={hoverHandlers.onMouseLeave}
    >
      <FloatingButton
        ref={buttonRef}
        active={config.active}
        open={menuOpen}
        badgeCount={prompts.length}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onCtrlClick={actions.toggleActive}
        onCtrlAltClick={handleCopyAndClear}
      />
      <Menu open={menuOpen} anchorRef={buttonRef} onRequestClose={closeMenu}>
        <ToggleRow label="Activo" checked={config.active} onChange={actions.setActive} />
        <MenuItem
          ref={capturarRef}
          label="Capturar"
          hasChildren
          expanded={openSubmenu === 'capturar'}
          onClick={() => toggleSubmenu('capturar')}
        >
          {openSubmenu === 'capturar' && (
            <SubMenu anchorRef={capturarRef}>
              <ToggleRow label="Capturar secciones" checked={config.capture.sections} onChange={(v) => actions.setCaptureFlag('sections', v)} />
              <ToggleRow label="Capturar componentes" checked={config.capture.components} onChange={(v) => actions.setCaptureFlag('components', v)} />
              <ToggleRow label="Capturar elementos individuales" checked={config.capture.elements} onChange={(v) => actions.setCaptureFlag('elements', v)} />
              <ToggleRow label="Mostrar todas las secciones" checked={config.show.sections} onChange={(v) => actions.setShowFlag('sections', v)} />
              <ToggleRow label="Mostrar todos los componentes" checked={config.show.components} onChange={(v) => actions.setShowFlag('components', v)} />
            </SubMenu>
          )}
        </MenuItem>
        <MenuItem
          ref={modoPromptRef}
          label="Modo prompt"
          hasChildren
          expanded={openSubmenu === 'modo-prompt'}
          onClick={() => toggleSubmenu('modo-prompt')}
        >
          {openSubmenu === 'modo-prompt' && (
            <SubMenu anchorRef={modoPromptRef}>
              <ActionRow label="Vaciar fila de prompts" disabled={prompts.length === 0} onClick={actions.clearPrompts} />
              <ActionRow
                label={justCopied ? '¡Copiado!' : 'Copiar fila de prompts'}
                disabled={prompts.length === 0}
                onClick={handleCopyAndClear}
              />
            </SubMenu>
          )}
        </MenuItem>
      </Menu>
      {config.active && (
        <>
          <CaptureOverlay targets={captureTargets} hovered={hovered} onSelect={setModalTarget} />
          <ShowOverlay targets={showTargets} hovered={hovered} />
        </>
      )}
      {modalTarget && (
        <PromptModal
          target={modalTarget}
          definitions={definitions}
          onClose={() => setModalTarget(null)}
          onSave={handleSavePrompt}
        />
      )}
    </div>
  );

  return (
    <>
      {children}
      {mounted && createPortal(floatingUI, document.body)}
    </>
  );
}
```

Imports que `IaFrontRefAssistant.tsx` necesita (lista completa, para no
tener que deducirlos): `useCallback`, `useContext`, `useEffect`, `useRef`,
`useState` de `'react'`; `createPortal` de `'react-dom'`;
`AssistantContext` de `'./context/AssistantContext'`; `AssistantProvider`
de `'./context/AssistantProvider'`; `useAssistant` de
`'./context/AssistantContext'`; `useHoverCloseTimer` de
`'./hooks/useHoverCloseTimer'`; `useTrackedTargets` de
`'./hooks/useTrackedTargets'`; `useHoveredTarget` de
`'./components/Overlay/useHoveredTarget'`; `copyText` de
`'./lib/clipboard'`; `formatQueueForClipboard` de `'./lib/promptFormat'`;
`FloatingButton` de `'./components/FloatingButton'`; `Menu`, `MenuItem`,
`ToggleRow`, `SubMenu`, `ActionRow` de `'./components/Menu/*'`;
`CaptureOverlay`, `ShowOverlay` de `'./components/Overlay/*'`;
`PromptModal` de `'./components/PromptModal/PromptModal'`; tipos
`TrackedTarget` de `'./lib/dom'`, `IaFraConfig` de `'./config/types'`;
`NOOP_CAPTURE_FLAGS`, `NOOP_SHOW_FLAGS` de `'./lib/constants'` (ver nota
abajo).

`NOOP_CAPTURE_FLAGS`/`NOOP_SHOW_FLAGS` = objetos con todas las flags en
`false`, constantes compartidas para no crear un objeto nuevo en cada
render (evita loops de efectos en `useTrackedTargets` si sus deps comparan
por referencia — revisar en fase 4 que las deps del `useEffect` interno
usen los valores primitivos de las flags, no el objeto completo,
justamente para que esto sea seguro). Se agregan en `src/lib/constants.ts`:

```ts
export const NOOP_CAPTURE_FLAGS = { sections: false, components: false, elements: false };
export const NOOP_SHOW_FLAGS = { sections: false, components: false };
```

(dos constantes separadas porque `capture` y `show` tienen formas
distintas — `config.capture`/`config.show` no comparten tipo).

Nota importante: **incluso con `config.active === false`**, el botón sigue
montado, sigue reaccionando a `ctrl+click` (para reactivar) y sigue
mostrando el badge (los prompts guardados no desaparecen solo porque se
desactivó el helper). Lo único que se apaga es la detección DOM y los
overlays.

Nota de layout: como `children` se renderiza primero, sin wrapper propio, y
la UI flotante cuelga aparte vía Portal directo de `document.body`,
envolver el site con `<IaFrontRefAssistant>` es un cambio de **cero**
impacto visual/estructural sobre el site en sí y **cero** dependencia de
dónde en el árbol se coloque el wrapper.

## `src/index.ts` (exports públicos)

```ts
export { IaFrontRefAssistant } from './IaFrontRefAssistant';
// Se exporta solo el componente raíz. Los subcomponentes (FloatingButton,
// Menu, overlays, etc.) son detalle de implementación, NO se exportan —
// mantiene la superficie pública mínima para v1.
```

Revisar que `package.json` (`exports["./style.css"]`, ya configurado en el
scaffold inicial) siga apuntando a `dist/style.css` — el consumidor debe
poder hacer:

```ts
import { IaFrontRefAssistant } from '@cristianmpx/aiui-assistant';
import 'ia-front-ref-assistant/style.css';
```

## `example/src/App.tsx` — markup de prueba

Necesita al menos:

- 2 secciones con `data-wrapper-id` distintos (ej. `"hero"`, `"footer"`).
- Dentro de una de ellas, 1 "componente" con `data-component-id` (ej.
  `"cta-card"`) que contenga: un `<button>`, un `<p>` con texto, y un
  `<div>` contenedor puro (para verificar que la heurística de fase 4 no
  lo cuenta como elemento individual).
- Suficiente contenido/alto para poder probar overlays con scroll.

```tsx
function App() {
  return (
    <IaFrontRefAssistant>
      <section data-wrapper-id="hero">
        <h1>Hero de ejemplo</h1>
        <div data-component-id="cta-card">
          <p>Probá el asistente con este componente.</p>
          <div className="wrapper-only">
            <button>Click me</button>
          </div>
        </div>
      </section>
      <section data-wrapper-id="footer">
        <p>Footer de ejemplo</p>
      </section>
    </IaFrontRefAssistant>
  );
}
```

`IaFrontRefAssistant` envuelve todo el contenido de `App` en vez de
colocarse como un elemento más al final — es la forma de uso real que va a
tener cualquier consumidor (típicamente envolviendo el layout raíz, no cada
página suelta).

## Checklist de QA manual (correr antes de dar la v1 por cerrada)

1. `npm run example:dev`, abrir en el navegador.
2. Click en el botón → menú se despliega hacia arriba, se ve "Activo" en
   verde/on.
3. Mover el mouse fuera del botón/menú y esperar 2s sin tocar nada → el
   menú se cierra solo.
4. Abrir menú → click en "Capturar" → se ve el submenú lateral con los 5
   toggles → activar "Capturar componentes".
5. Cerrar el menú, hacer hover sobre el `cta-card` → aparece el frame +
   label `"cta-card"` arriba del componente.
6. Click sobre el frame → se abre el modal, con el template
   `About cta-card in http://localhost:.../:` visible y el textarea vacío
   enfocado.
7. Escribir un texto, `Enter` → modal se cierra, badge del botón pasa a
   mostrar "1".
8. Repetir con "Capturar secciones" activo sobre `hero` → guardar un
   segundo prompt → badge "2".
9. Abrir menú → "Modo prompt" → click "Copiar fila de prompts" → pegar en
   un editor de texto y verificar el formato de 2 bloques separados por
   línea en blanco, con `About <id> in <url>:` al inicio de cada uno.
10. Verificar que tras copiar, el badge desapareció (fila vacía).
11. Activar "Mostrar todas las secciones" → sin necesidad de hover, se ven
    los frames de `hero` y `footer` con opacidad reducida; al pasar el
    mouse por encima de uno, sube a opacidad completa; click sobre un frame
    de "mostrar" (sin capturar activo para ese tipo) **no** abre el modal.
12. Ctrl+Click sobre el botón (menú cerrado) → togglea "Activo" a off →
    todos los frames desaparecen inmediatamente, el botón baja de opacidad,
    pero sigue siendo clickeable.
13. Ctrl+Click de nuevo → vuelve a "Activo" on, los overlays reaparecen si
    los toggles de capturar/mostrar seguían encendidos.
14. Guardar un par de prompts de nuevo, y usar Ctrl+Alt+Click directo sobre
    el botón (sin pasar por el menú) → copia y vacía igual que el paso 9-10.
15. Recargar la página (F5) → los toggles de capturar/mostrar y el estado
    de "Activo" persisten (localStorage); la fila de prompts también
    persiste si quedó algo sin copiar.
16. Inspeccionar el DOM con devtools → el `<div class="ia-fra-root">`
    aparece como **hijo directo de `<body>`**, fuera del árbol de `<App>`
    (confirma el Portal), aunque en `example/src/App.tsx` el wrapper esté
    en el punto de montaje normal de React.
17. Envolver momentáneamente `<App>` de ejemplo en un `<div style={{
    transform: 'scale(1)' }}>` (crea containing block) → el botón sigue
    anclado correctamente a la esquina de la ventana, no se desplaza ni
    se corta (confirma que el Portal soluciona el caso que motivó la
    decisión).
18. Anidar `<IaFrontRefAssistant>` dos veces (temporalmente, para probar) →
    solo aparece **un** botón/badge, y la consola muestra el
    `console.warn` de instancia anidada (en dev).

## Regresión

- Correr `npm test` (todas las fases) y `npm run build` en la raíz del
  paquete — deben pasar sin errores antes de considerar v1 terminada.
- `npm run build --prefix example` debe compilar importando el paquete real
  desde `dist/` (vía el `file:..` symlink).
- `AssistantRoot.test.tsx`: con `document.body` disponible en jsdom (ya lo
  está por defecto), montar `IaFrontRefAssistant` y, tras
  `act(() => {})`/`await waitFor`, verificar que el nodo con clase
  `ia-fra-root` es hijo directo de `document.body`, no del contenedor de
  testing-library. Antes del primer efecto (render síncrono inicial), ese
  nodo **no** debe existir todavía (verifica el guard `mounted`).
- Test de instancia anidada: renderizar `<IaFrontRefAssistant><IaFrontRefAssistant><p>x</p></IaFrontRefAssistant></IaFrontRefAssistant>`
  y verificar que solo hay **un** elemento con clase `ia-fra-floating-button`
  en el DOM resultante (`querySelectorAll` length === 1).

## Fuera de alcance de v1 (anotado para el futuro)

- Sincronización multi-pestaña vía evento `storage`.
- Recorte/ocultamiento de frames cuando el elemento sale completamente del
  viewport.
- Fusión visual de frames superpuestos.
- Temas/colores configurables por prop.
- Exportar subcomponentes individuales en `src/index.ts` para uso avanzado.
- Detalles adicionales que el usuario agregue en una siguiente ronda de
  requerimientos.

> **Actualización (fase 8)**: `IaFrontRefAssistant` gana un prop opcional
> `definitions?: IaFraConfig` (prop-drilled hasta `PromptModal`, ya
> reflejado arriba junto con `children`), y `src/index.ts` amplía sus
> exports para incluir `defineConfig` + los tipos de config (`IaFraConfig`,
> `ComponentDefinition`, `ThemeTokenDefinition`, `ConfigOption`) — la regla
> de "solo se exporta el componente raíz" de arriba queda actualizada por
> esto. Ver [08-component-config.md](08-component-config.md).
