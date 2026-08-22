# Plan de ejecución paralela (multi-agente)

Este documento **no agrega funcionalidad nueva** — reorganiza el trabajo ya
descrito en `01-...md` a `09-...md` por **dependencia real de archivos**
(qué necesita qué para poder compilar/tipar), no por el número de fase en
el que quedó documentado. Varias fases comparten "oleada" porque, mirado a
nivel de archivo, no dependen entre sí — solo se numeraron 1-9 para que
fueran legibles en orden humano.

Usar este archivo como guía de despacho para agentes en paralelo (ej.
varias instancias de Haiku). Cada "Agente" de una oleada recibe una lista
de archivos **disjunta** de la de los demás agentes de la misma oleada —
nunca dos agentes tocan el mismo archivo en la misma oleada.

## Regla de oro

> Un archivo = un dueño en cada momento dado. Si un archivo se crea en una
> oleada y se **modifica** (parchea) en una oleada posterior, ambas
> ediciones pueden ser agentes distintos, pero nunca al mismo tiempo — la
> oleada posterior espera a que termine (y se verifique) la anterior.

## Tabla de dependencias por archivo

| Archivo | Depende de (archivos) | Fase original |
|---|---|---|
| `src/lib/types.ts` | — | 1 |
| `src/lib/constants.ts` | — | 1 (+ patch en 8) |
| `src/lib/position.ts` | — | 2 |
| `src/lib/dom.ts` | `constants.ts`, `types.ts` | 4 (+ patch en 8) |
| `src/config/types.ts` | — | 8 |
| `src/lib/storage.ts` | — | 1 |
| `src/context/AssistantContext.tsx` | `types.ts` | 1 |
| `src/context/AssistantProvider.tsx` | `AssistantContext.tsx`, `storage.ts`, `constants.ts`, `types.ts` | 1 |
| `src/components/BugIcon.tsx` | — | 2 |
| `src/components/FloatingButton.tsx` | `BugIcon.tsx` | 2 |
| `src/hooks/useHoverCloseTimer.ts` | `constants.ts` | 2 |
| `src/components/Menu/Menu.tsx` | `position.ts` | 2 |
| `src/components/Menu/MenuItem.tsx` | — | 2 |
| `src/components/Menu/ToggleRow.tsx` | — | 2 |
| `styles/button-menu.css` | (usa tokens de `styles/tokens.css`) | 2 |
| `src/components/Menu/SubMenu.tsx` | `position.ts` | 3 |
| `src/components/Menu/ActionRow.tsx` | — | 3 |
| `src/hooks/useTrackedTargets.ts` | `dom.ts`, `constants.ts` | 4 (+ patch en 8) |
| `src/components/Overlay/useHoveredTarget.ts` | `dom.ts` | 5 |
| `src/components/Overlay/useRect.ts` | — | 5 |
| `src/components/Overlay/FrameLabel.tsx` | — | 5 |
| `src/components/Overlay/CaptureOverlay.tsx` | `dom.ts`, `useRect.ts`, `FrameLabel.tsx` | 5 |
| `src/components/Overlay/ShowOverlay.tsx` | `dom.ts`, `useRect.ts`, `FrameLabel.tsx` | 5 |
| `styles/overlays.css` | `styles/tokens.css` | 5 |
| `src/lib/clipboard.ts` | — | 6 |
| `src/lib/promptFormat.ts` | `types.ts` | 6 |
| `src/components/PromptModal/PromptModal.tsx` | `dom.ts`, `promptFormat.ts` | 6 (+ patch en 8) |
| `styles/modal.css` | `styles/tokens.css` | 6 |
| `src/config/defineConfig.ts` | `config/types.ts` | 8 |
| `src/components/PromptModal/VariantSizePicker.tsx` | `config/types.ts` | 8 |
| `src/components/PromptModal/ThemePicker.tsx` | `config/types.ts` | 8 |
| `styles/pickers.css` | `styles/tokens.css` | 8 |
| `ia-skills/**` (plugin.json, skills, comando) | — (nada de `src/`) | 9 |
| `src/IaFrontRefAssistant.tsx` | **todo** lo de arriba salvo `config/*`, `VariantSizePicker`, `ThemePicker` | 7 |
| `src/index.ts` (primer corte) | `IaFrontRefAssistant.tsx` | 7 |
| `example/src/App.tsx` | `IaFrontRefAssistant.tsx` | 7 |
| `styles/index.css` (imports finales) | todos los `styles/*.css` de arriba | 2/5/6/8 |
| Patch fase 8 sobre `constants.ts`, `dom.ts`, `useTrackedTargets.ts` | versiones ya creadas de esos archivos | 8 |
| Patch fase 8 sobre `PromptModal.tsx`, `IaFrontRefAssistant.tsx`, `index.ts` | versiones ya creadas (fase 7) de esos archivos + `config/types.ts`, `VariantSizePicker.tsx`, `ThemePicker.tsx` | 8 |

Nota sobre CSS: en los documentos de fase 2/5/6/8 el CSS se describía como
"agregar al final de `src/styles/index.css`" — para ejecución multi-agente
eso es un archivo compartido con conflicto garantizado. Acá se separa en
partials (`styles/tokens.css`, `styles/button-menu.css`,
`styles/overlays.css`, `styles/modal.css`, `styles/pickers.css`) que cada
agente escribe de forma exclusiva, y un paso final de una sola línea por
archivo (`@import`) los une en `styles/index.css`. El **contenido CSS en
sí** (las reglas, los nombres de clase) sigue siendo exactamente el que
especifica cada fase — esto solo cambia el archivo destino.

## Oleada 0 — fundaciones puras (1 agente, secuencial, ~rápido)

No conviene paralelizar esto: son archivos chicos, sin lógica compleja,
y varias piezas de la oleada 1 dependen de ellos. Un solo agente, en este
orden:

1. `src/lib/types.ts`
2. `src/lib/constants.ts`
3. `src/lib/position.ts`
4. `src/lib/dom.ts` (usa 2 y 1)
5. `src/config/types.ts`
6. `src/styles/tokens.css` (el bloque `:root`/`.ia-fra-root` con las
   variables, de [00-overview.md](00-overview.md#convenciones-globales-leer-antes-de-implementar-cualquier-fase))

Checkpoint: `npm run typecheck` debe pasar sobre estos archivos sueltos
(no hay tests todavía, son la base). Recién después de esto arranca la
oleada 1.

## Oleada 1 — el grueso del trabajo (hasta 7 agentes en paralelo)

Cada agente = una fila. Ningún archivo se repite entre filas.

| Agente | Archivos (crear + su `.test.ts`/`.test.tsx`) | Fase(s) origen |
|---|---|---|
| **A — Storage/Context** | `src/lib/storage.ts`, `src/context/AssistantContext.tsx`, `src/context/AssistantProvider.tsx` | 1 |
| **B — Botón y menú shell** | `src/components/BugIcon.tsx`, `src/components/FloatingButton.tsx`, `src/hooks/useHoverCloseTimer.ts`, `src/components/Menu/Menu.tsx`, `src/components/Menu/MenuItem.tsx`, `src/components/Menu/ToggleRow.tsx`, `src/styles/button-menu.css` | 2 |
| **C — Submenú** | `src/components/Menu/SubMenu.tsx`, `src/components/Menu/ActionRow.tsx` | 3 |
| **D — Motor DOM** | `src/hooks/useTrackedTargets.ts` | 4 |
| **E — Overlays** | `src/components/Overlay/useHoveredTarget.ts`, `src/components/Overlay/useRect.ts`, `src/components/Overlay/FrameLabel.tsx`, `src/components/Overlay/CaptureOverlay.tsx`, `src/components/Overlay/ShowOverlay.tsx`, `src/styles/overlays.css` | 5 |
| **F — Prompt/clipboard** | `src/lib/clipboard.ts`, `src/lib/promptFormat.ts`, `src/components/PromptModal/PromptModal.tsx` (versión de fase 6, sin `definitions`), `src/styles/modal.css` | 6 |
| **G — Config + pickers** | `src/config/defineConfig.ts`, `src/components/PromptModal/VariantSizePicker.tsx`, `src/components/PromptModal/ThemePicker.tsx`, `src/styles/pickers.css` | 8 (parte independiente) |

Un octavo track, **sin relación de dependencia con nada de lo anterior**,
puede arrancar en paralelo desde la oleada 0 incluso (no espera a nada de
`src/`):

| Agente | Archivos | Fase origen |
|---|---|---|
| **H — Skills de Claude Code** | `ia-skills/plugin.json`, `ia-skills/skills/frontend-data-tagging/SKILL.md`, `ia-skills/skills/config-mapper/SKILL.md`, `ia-skills/commands/init-ia-front-assistent.md` | 9 |

Checkpoint tras oleada 1: cada agente corre `npm test` **solo sobre sus
propios archivos nuevos** (`vitest run <sus paths>`) antes de reportar
terminado — no hace falta que el proyecto entero compile todavía (fase 7
ni existe), pero sí que sus piezas sueltas tipen y pasen sus propios tests.

## Oleada 2 — integración de estilos (1 agente, rápido)

Un solo archivo, edición mínima — no vale la pena un agente dedicado si el
mismo agente de la oleada 3 lo hace como primer paso, pero si se quiere
mantener la separación:

```css
/* src/styles/index.css */
@import './tokens.css';
@import './button-menu.css';
@import './overlays.css';
@import './modal.css';
@import './pickers.css';
```

(Orden no crítico salvo que `tokens.css` vaya primero, ya que los demás
usan `var(--ia-fra-*)` definidas ahí.)

## Oleada 3 — integración fase 7 (1 agente, obligatoriamente secuencial)

**No paralelizable**: un solo archivo (`src/IaFrontRefAssistant.tsx`) que
importa y compone todo lo de la oleada 1. Requiere que la oleada 1
completa (los 7 agentes de código, A-G) y la oleada 2 hayan terminado y
pasado sus checkpoints.

Archivos:
- `src/IaFrontRefAssistant.tsx` (composición final, fase 7)
- `src/index.ts` (primer corte de exports, fase 7)
- `example/src/App.tsx` (markup de prueba, fase 7)

Checkpoint: `npm test` completo + `npm run build` en la raíz, y
`npm run build --prefix example` — recién acá se verifica que TODO el
paquete compila junto por primera vez.

## Oleada 4 — patches de fase 8 (1 agente; puede subdividirse en 2 si se
quiere, pero en orden estricto, no en paralelo real)

Motivo por el que no son paralelizables entre sí: el segundo grupo de
patches (`PromptModal.tsx`, `IaFrontRefAssistant.tsx`) necesita que
`TrackedTarget` ya tenga el campo `kind` (lo agrega el primer grupo) para
tipar `target.kind` sin error.

1. Patch `src/lib/constants.ts` (agregar `ATTR_COMPONENT_KIND`)
2. Patch `src/lib/dom.ts` (`TrackedTarget.kind`, lectura del atributo)
3. Patch `src/hooks/useTrackedTargets.ts` (propagar `kind`, sumar al
   `attributeFilter`)
4. Patch `src/components/PromptModal/PromptModal.tsx` (agregar
   `definitions` prop + `VariantSizePicker`/`ThemePicker`)
5. Patch `src/IaFrontRefAssistant.tsx` (agregar `definitions` prop,
   pasarlo hasta `PromptModal`)
6. Patch `src/index.ts` (exportar `defineConfig` + tipos de config)

Checkpoint: `npm test` + `npm run build` de nuevo, completo.

## Track independiente — Oleada H (fase 9, sin checkpoint de integración)

El agente **H** (skills de Claude Code) no necesita ningún checkpoint de
build/test de `reactComponent/` porque no toca ese código — puede
terminar en cualquier momento, incluso antes que todo lo demás. Su único
requisito real es tener a mano el contrato de datos (`00-overview.md`) y
la forma de `IaFraConfig` (`08-component-config.md`) para escribir
`SKILL.md`/`init-ia-front-assistent.md` con la info correcta — no requiere que el
código exista, son solo referencias de documentación.

## Resumen visual

```
Oleada 0 (1 agente, secuencial)
   └─> Oleada 1 (hasta 7 agentes en paralelo: A B C D E F G)      ⟍
                                                                    ⟩ H corre en paralelo con todo, sin esperar nada
   └─> Oleada 2 (1 agente, integra CSS)                           ⟋
       └─> Oleada 3 (1 agente, fase 7 — integración total)
           └─> Oleada 4 (1 agente, patches fase 8)
```

## Recomendaciones de coordinación multi-agente

- **Aislar el working directory por agente si es posible** (ej. git
  worktree por agente en la oleada 1) y mergear al terminar la oleada —
  evita que dos agentes con `Write`/`Edit` concurrentes sobre el mismo
  repo se pisen accidentalmente, incluso estando en archivos distintos
  (algunos flujos de Node/`npm install` tocan `node_modules`/lockfile
  compartido). Si no hay soporte de worktrees, al menos evitar que dos
  agentes corran `npm install` al mismo tiempo.
- **Cada agente termina su tarea corriendo sus propios tests**, no solo
  escribiendo código — los criterios de aceptación ya están detallados en
  cada fase (`01-...md` a `09-...md`), úsenlos tal cual como definición de
  "terminado" por archivo.
- **No adelantar oleadas**: un agente de la oleada 1 no debe intentar
  tocar `IaFrontRefAssistant.tsx` (oleada 3) "para dejarlo listo" — genera
  conflictos con el agente que sí tiene esa tarea asignada.
- **Fase 9 (agente H) es la única verdaderamente sin fecha límite** dentro
  de esta secuencia — se le puede asignar en cualquier momento sin afectar
  el camino crítico del código.
- El **camino crítico** (la secuencia más larga que determina el tiempo
  total mínimo) es: Oleada 0 → el agente más lento de la Oleada 1 → Oleada
  2 → Oleada 3 → Oleada 4. Priorizar que los agentes de la Oleada 1 con más
  archivos (B y E tienen la lista más larga) arranquen primero si el
  despacho no es 100% simultáneo.
