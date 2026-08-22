# Fase 8 — `data-component-kind` + config de variantes/sizes/theme

Fase aditiva: no rompe nada de las fases 1-7 (que se dan por ya
planeadas/implementadas). Agrega:

1. Un atributo nuevo, `data-component-kind`, para que la IA le diga a este
   componente **qué tipo** de componente es cada root (`Button`, `Card`,
   `Modal`, etc.), no solo su id de instancia.
2. Un archivo de configuración que el **consumidor** del paquete escribe en
   su propio proyecto (`iafrontrefassistant.config.ts`), con la lista de
   tipos de componentes conocidos + sus variantes/sizes estándar, y una
   lista de "theme tokens" (radios, colores, etc.).
3. En el modal de prompt (fase 6), cuando el target sea un componente cuyo
   `kind` matchea una entrada del config, aparecen selectores de
   variante/size que agregan una oración al textarea. Y, si el config trae
   `theme`, una sección aparte siempre disponible para inyectar cambios de
   tema.

## Por qué prop y no "leer un archivo"

El paquete se publica a npm y el componente corre **en el navegador**, no en
un paso de build/Node como Tailwind o ESLint (esos sí pueden usar
`cosmiconfig`/`require` porque corren como CLI). Acá el patrón equivalente
es el que usan las librerías de componentes con configuración de usuario
(Chakra `ThemeProvider theme={theme}`, MUI, Stripe Elements `options`): el
consumidor importa su propio módulo de config y lo pasa como prop.

```ts
// iafrontrefassistant.config.ts (en el root del proyecto consumidor)
import { defineConfig } from 'ia-front-ref-assistant';

export default defineConfig({
  components: [
    {
      kind: 'Button',
      variants: [
        { value: 'primary', label: 'Primario' },
        { value: 'secondary', label: 'Secundario' },
        { value: 'ghost', label: 'Fantasma' },
      ],
      sizes: [
        { value: 'sm', label: 'Chico' },
        { value: 'md', label: 'Mediano' },
        { value: 'lg', label: 'Grande' },
      ],
    },
  ],
  theme: [
    { key: 'border-radius', label: 'Border radius' },
    { key: 'bg-color', label: 'Color de fondo' },
    { key: 'border-color', label: 'Color de borde' },
  ],
});
```

```tsx
// App.tsx del consumidor
import config from '../iafrontrefassistant.config';
import { IaFrontRefAssistant } from 'ia-front-ref-assistant';

<IaFrontRefAssistant definitions={config} />
```

`defineConfig` es una función identidad, existe solo para que TypeScript
infiera bien el tipo al escribir el objeto literal (mismo truco cosmético
que usan Vite/Astro con sus `defineConfig`) — no carga nada, no hace I/O.

El prop se llama **`definitions`** (no `config`) a propósito: `config` ya
está reservado internamente para el estado persistido de
activo/capturar/mostrar (`AssistantConfig` de fase 1, expuesto como
`config` en `useAssistant()`). Mezclar los dos nombres sería confuso tanto
en el código como en la API pública.

## Archivos a crear

```
src/config/types.ts
src/config/defineConfig.ts
src/lib/constants.ts             (modificar: agregar ATTR_COMPONENT_KIND)
src/lib/dom.ts                   (modificar: TrackedTarget.kind)
src/hooks/useTrackedTargets.ts   (modificar: leer y propagar kind)
src/components/PromptModal/VariantSizePicker.tsx   (nuevo)
src/components/PromptModal/ThemePicker.tsx         (nuevo)
src/components/PromptModal/PromptModal.tsx         (modificar: fase 6, +definitions)
src/IaFrontRefAssistant.tsx      (modificar: fase 7, +prop definitions)
src/index.ts                     (modificar: exportar defineConfig + tipos)
```

## `src/config/types.ts`

```ts
export interface ConfigOption {
  value: string; // valor técnico (lo que se inyecta en el prompt entre comillas)
  label: string; // lo que se muestra en el botón/pill del selector
}

export interface ComponentDefinition {
  kind: string; // debe matchear el valor de data-component-kind, comparación exacta
  variants?: ConfigOption[];
  sizes?: ConfigOption[];
}

export interface ThemeTokenDefinition {
  key: string;   // identificador libre, ej. 'border-radius' — no se valida contra CSS real
  label: string; // texto mostrado y usado en la oración inyectada
  values?: ConfigOption[]; // opcional: valores conocidos (ver nota abajo)
}

export interface IaFraConfig {
  components?: ComponentDefinition[];
  theme?: ThemeTokenDefinition[];
  prePrompt?: string; // ver nota abajo
}
```

Nota sobre `IaFraConfig.prePrompt` (agregado post-v1): texto fijo que
`formatPrompt` (fase 6, `lib/promptFormat.ts`) antepone a todo prompt final
guardado desde el modal, separado por una línea en blanco. Sirve para que
cada prompt lleve siempre referencias importantes del proyecto (ej. "Usa la
skill frontend-component y la skill frontend-context para entender cómo
implementar estos cambios."). Si está vacío/ausente o son solo espacios,
`formatPrompt` no antepone nada — se comporta igual que antes de este
campo. Lo suele generar la skill `config-mapper` al correr `/init-ia-front-assistent`
(ver `ia-skills/`), pero el usuario lo puede escribir/editar a mano en
`iafrontrefassistant.config.ts` en cualquier momento.

Nota sobre `ThemeTokenDefinition.values`: v1 soporta que venga vacío/ausente
(el usuario escribe el valor a mano después de la oración inyectada). La
idea mencionada por el usuario de "esto luego será generado por IA leyendo
los CSS" (para poblar `values` automáticamente, ej. una paleta de colores
real extraída del proyecto) **queda fuera de alcance de v1** — v1 solo
define el tipo y lo consume si ya viene poblado a mano; el generador
automático es una herramienta aparte (probablemente un script/CLI) para una
ronda futura.

## `src/config/defineConfig.ts`

```ts
import type { IaFraConfig } from './types';

export function defineConfig(config: IaFraConfig): IaFraConfig {
  return config;
}
```

## `src/lib/constants.ts` — addenda

```ts
export const ATTR_COMPONENT_KIND = 'data-component-kind';
```

Vive junto a `ATTR_WRAPPER`/`ATTR_COMPONENT` de fase 1. Es opcional en el
DOM: un `[data-component-id]` sin `data-component-kind` sigue siendo un
target de tipo `'component'` válido (fases 4/5/6 siguen funcionando igual),
simplemente no tiene selector de variante/size en el modal por no poder
matchear ninguna `ComponentDefinition`.

## `src/lib/dom.ts` — addenda a `TrackedTarget`

```ts
export interface TrackedTarget {
  el: Element;
  id: string;
  type: TargetType;
  kind?: string; // solo puede venir presente cuando type === 'component'
}
```

En `useTrackedTargets` (fase 4), al construir los targets de `components`:

```ts
{
  el,
  id: el.getAttribute(ATTR_COMPONENT)!,
  type: 'component',
  kind: el.getAttribute(ATTR_COMPONENT_KIND) ?? undefined,
}
```

Los targets de `type: 'section'` y `type: 'element'` nunca tienen `kind`
(queda `undefined`, ni siquiera se intenta leer el atributo en esos casos).

Además, el `MutationObserver` de `useTrackedTargets` (fase 4) debe agregar
`ATTR_COMPONENT_KIND` a su `attributeFilter`, para que cambiar el atributo
`data-component-kind` en caliente (sin agregar/quitar nodos) también
dispare un re-escaneo:

```ts
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: [ATTR_WRAPPER, ATTR_COMPONENT, ATTR_COMPONENT_KIND], // agregado en esta fase
});
```

## `VariantSizePicker`

```ts
interface VariantSizePickerProps {
  definition: ComponentDefinition;
  onPick: (sentence: string) => void; // agrega una línea al textarea del modal
}
```

- Dos filas (si existen): "Variante" y "Tamaño".
- Cada `ConfigOption` se renderiza como un botón/pill con `option.label`.
  Click → `onPick(\`Usa la variante "${option.label}".\`)` (o "el tamaño").
- Al final de cada fila, un pill fijo "+ Nueva variante" / "+ Nuevo tamaño"
  → `onPick('Agregá una nueva variante para este componente: ')` (con
  espacio final, sin punto — el padre además debe enfocar el textarea y
  mover el cursor al final tras insertar, para que el usuario siga
  escribiendo ahí mismo la descripción).
- No se muestra la fila "Variante" si `definition.variants` está vacío o
  ausente; ídem "Tamaño"/`sizes`. Si ambas faltan, el componente entero
  devuelve `null` (no deja un contenedor vacío).

```tsx
'use client';

import type { ComponentDefinition } from '../../config/types';

export interface VariantSizePickerProps {
  definition: ComponentDefinition;
  onPick: (sentence: string) => void;
}

export function VariantSizePicker({ definition, onPick }: VariantSizePickerProps) {
  const hasVariants = !!definition.variants && definition.variants.length > 0;
  const hasSizes = !!definition.sizes && definition.sizes.length > 0;
  if (!hasVariants && !hasSizes) return null;

  return (
    <div className="ia-fra-picker">
      {hasVariants && (
        <div className="ia-fra-picker__row">
          <span className="ia-fra-picker__row-label">Variante</span>
          {definition.variants!.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="ia-fra-pill"
              onClick={() => onPick(`Usa la variante "${opt.label}".`)}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className="ia-fra-pill ia-fra-pill--ghost"
            onClick={() => onPick('Agregá una nueva variante para este componente: ')}
          >
            + Nueva variante
          </button>
        </div>
      )}
      {hasSizes && (
        <div className="ia-fra-picker__row">
          <span className="ia-fra-picker__row-label">Tamaño</span>
          {definition.sizes!.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="ia-fra-pill"
              onClick={() => onPick(`Usa el tamaño "${opt.label}".`)}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className="ia-fra-pill ia-fra-pill--ghost"
            onClick={() => onPick('Agregá un nuevo tamaño para este componente: ')}
          >
            + Nuevo tamaño
          </button>
        </div>
      )}
    </div>
  );
}
```

## `ThemePicker`

```ts
interface ThemePickerProps {
  tokens: ThemeTokenDefinition[];
  onPick: (sentence: string) => void;
}
```

- Sección colapsable ("Theme ▾"), colapsada por default para no saturar el
  modal cuando el target no es un componente con variantes.
- Un pill por `token` con `token.label`.
  - Si el token **no** tiene `values` (o está vacío): click →
    `onPick(\`Cambiá ${token.label} a \`)` (con espacio final, foco +
    cursor al final del textarea, igual que "nueva variante").
  - Si el token **tiene** `values`: click en el pill del token lo expande
    inline mostrando sub-pills con cada `value.label`; click en un sub-pill
    → `onPick(\`Cambiá ${token.label} a "${value.label}".\`)` (oración
    completa, no requiere que el usuario siga escribiendo).
- Se muestra **siempre** que `definitions.theme` tenga al menos 1 entrada,
  sin importar el `type`/`kind` del target — a diferencia de
  `VariantSizePicker`, que depende de que el target sea un componente con
  `kind` matcheado.

```tsx
'use client';

import { useState } from 'react';
import type { ThemeTokenDefinition } from '../../config/types';

export interface ThemePickerProps {
  tokens: ThemeTokenDefinition[];
  onPick: (sentence: string) => void;
}

export function ThemePicker({ tokens, onPick }: ThemePickerProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  if (tokens.length === 0) return null;

  function handleTokenClick(token: ThemeTokenDefinition) {
    const hasValues = !!token.values && token.values.length > 0;
    if (!hasValues) {
      onPick(`Cambiá ${token.label} a `);
      return;
    }
    setExpandedToken((prev) => (prev === token.key ? null : token.key));
  }

  return (
    <div className="ia-fra-picker">
      <button type="button" className="ia-fra-picker__toggle" onClick={() => setCollapsed((v) => !v)}>
        Theme {collapsed ? '▾' : '▴'}
      </button>
      {!collapsed && (
        <div className="ia-fra-picker__row">
          {tokens.map((token) => (
            <div key={token.key} className="ia-fra-picker__token">
              <button type="button" className="ia-fra-pill" onClick={() => handleTokenClick(token)}>
                {token.label}
              </button>
              {expandedToken === token.key && token.values && (
                <div className="ia-fra-picker__subrow">
                  {token.values.map((value) => (
                    <button
                      key={value.value}
                      type="button"
                      className="ia-fra-pill ia-fra-pill--sub"
                      onClick={() => onPick(`Cambiá ${token.label} a "${value.label}".`)}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Inyección de texto al textarea (regla compartida)

Todas las inserciones (variant/size/theme) siguen la misma regla, ya usada
en fase 6 para el textarea del modal:

```ts
function appendSentence(current: string, sentence: string): string {
  const trimmed = current.trimEnd();
  return trimmed.length > 0 ? `${trimmed}\n${sentence}` : sentence;
}
```

Es decir: cada click agrega una **línea nueva** con la oración, nunca pisa
lo que el usuario ya escribió. Ejemplo tras 3 clicks sobre texto libre
previo:

```
Cambiá el color de fondo.
Usa la variante "primary".
Usa el tamaño "md".
```

Para las oraciones "abiertas" (nueva variante/tamaño, theme sin `values`)
que terminan en espacio en vez de punto, después de `appendSentence` el
padre hace `textareaRef.current.focus()` +
`setSelectionRange(len, len)` con `len = value.length`, para que el cursor
quede exactamente donde el usuario tiene que seguir tipeando.

## `PromptModal` — addenda (fase 6)

```ts
interface PromptModalProps {
  target: TrackedTarget;
  definitions?: IaFraConfig; // nuevo, opcional — si no viene, el modal se ve exactamente igual que en fase 6
  onClose: () => void;
  onSave: (text: string) => void;
}
```

- Si `definitions?.components` tiene una entrada con
  `kind === target.kind` (y `target.kind` no es `undefined`), renderiza
  `<VariantSizePicker definition={match} onPick={handlePick} />` arriba del
  textarea.
- Si `definitions?.theme` tiene entradas, renderiza
  `<ThemePicker tokens={definitions.theme} onPick={handlePick} />` debajo de
  eso (o del textarea, decisión de layout libre en implementación — no
  afecta comportamiento).
- `handlePick(sentence)` hace `setText(prev => appendSentence(prev, sentence))`
  y el foco/cursor como se describió arriba.
- Nada de esto cambia el formateo final (`formatPrompt` de fase 6 sigue
  envolviendo con `About {id} in {url}: {texto}` — las oraciones inyectadas
  son parte del `{texto}`, no del template).

Diff completo sobre el `PromptModal.tsx` de fase 6 (agregar esto, no
reescribir desde cero):

```tsx
// nuevos imports
import type { IaFraConfig } from '../../config/types';
import { VariantSizePicker } from './VariantSizePicker';
import { ThemePicker } from './ThemePicker';

export interface PromptModalProps {
  target: TrackedTarget;
  definitions?: IaFraConfig; // nuevo
  onClose: () => void;
  onSave: (text: string) => void;
}

// dentro del componente, agregar junto al resto de los helpers:
function appendSentence(current: string, sentence: string): string {
  const trimmed = current.trimEnd();
  return trimmed.length > 0 ? `${trimmed}\n${sentence}` : sentence;
}

function handlePick(sentence: string) {
  setText((prev) => appendSentence(prev, sentence));
  // foco + cursor al final, para las oraciones "abiertas" que terminan en espacio
  requestAnimationFrame(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  });
}

const matchedComponent = definitions?.components?.find((c) => c.kind === target.kind);
```

Y en el JSX, arriba del `<textarea>` existente:

```tsx
{matchedComponent && <VariantSizePicker definition={matchedComponent} onPick={handlePick} />}
{definitions?.theme && definitions.theme.length > 0 && (
  <ThemePicker tokens={definitions.theme} onPick={handlePick} />
)}
```

(`requestAnimationFrame` en `handlePick` es necesario porque el `focus()` +
`setSelectionRange` deben correr **después** de que React actualice el DOM
del `<textarea>` con el nuevo `value` más largo — si se llama en el mismo
tick que `setText`, `el.value.length` todavía refleja el valor viejo.)

## Estilos (agregar a `src/styles/index.css`, o `src/styles/pickers.css`
en modo multi-agente — ver [10-parallel-execution-plan.md](10-parallel-execution-plan.md))

```css
.ia-fra-picker {
  margin-bottom: 8px;
}
.ia-fra-picker__toggle {
  background: none;
  border: none;
  color: var(--ia-fra-fg);
  opacity: 0.7;
  font: inherit;
  cursor: pointer;
  padding: 0 0 6px;
}
.ia-fra-picker__row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.ia-fra-picker__row-label {
  font-size: 11px;
  opacity: 0.6;
  margin-right: 4px;
}
.ia-fra-picker__token {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ia-fra-picker__subrow {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 8px;
}
.ia-fra-pill {
  background: #1a1a1a;
  color: var(--ia-fra-fg);
  border: 1px solid var(--ia-fra-border);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}
.ia-fra-pill--ghost {
  border-style: dashed;
  opacity: 0.7;
}
.ia-fra-pill--sub {
  font-size: 11px;
  padding: 3px 8px;
}
```

## `IaFrontRefAssistant` — addenda (fase 7)

`IaFrontRefAssistant` ya es un componente envolvente (`children`
requerido, ver fase 7 actualizada). Fase 8 solo agrega `definitions` a esas
props:

```ts
export interface IaFrontRefAssistantProps {
  children: React.ReactNode;
  definitions?: IaFraConfig;
}
```

`AssistantRoot` simplemente pasa `definitions` hacia abajo hasta
`PromptModal` (es el único consumidor en v1 — no hace falta un Context
nuevo para esto, alcanza con prop drilling porque la cadena es corta:
`AssistantRoot` → `PromptModal`), mientras `children` se renderiza tal cual
antes del `<div className="ia-fra-root">`.

## `src/index.ts` — addenda

```ts
export { IaFrontRefAssistant } from './IaFrontRefAssistant';
export type { IaFrontRefAssistantProps } from './IaFrontRefAssistant';
export { defineConfig } from './config/defineConfig';
export type {
  IaFraConfig,
  ComponentDefinition,
  ThemeTokenDefinition,
  ConfigOption,
} from './config/types';
```

Rompe la regla que había puesto fase 7 de "solo se exporta el componente
raíz, nada más" — se amplía a propósito porque `defineConfig` y los tipos
de config **son API pública necesaria** para que el consumidor pueda
escribir su `iafrontrefassistant.config.ts` con autocompletado. Los
subcomponentes internos (`FloatingButton`, `Menu`, overlays,
`VariantSizePicker`, `ThemePicker`, etc.) siguen sin exportarse.

## Casos borde

- `target.kind` es `undefined` (componente sin `data-component-kind`) →
  `VariantSizePicker` no se renderiza, aunque `definitions.components` no
  esté vacío. No es un error, es el estado normal para componentes que la
  IA todavía no anotó con `kind`.
- `definitions` prop ausente por completo → `PromptModal` se comporta
  exactamente igual que en fase 6 (sin pickers). Verifica que la feature es
  100% opt-in/aditiva.
- Dos `ComponentDefinition` con el mismo `kind` en el config del usuario
  (error de autoría) → se usa el primer match (`Array.prototype.find`), no
  se valida ni se avisa — responsabilidad del consumidor.
- `ThemeTokenDefinition` con `values: []` (array vacío explícito, no
  `undefined`) → tratado igual que ausente: click inserta la oración
  abierta "Cambiá X a ".
- Target de `type: 'section'` o `type: 'element'` con `definitions.theme`
  configurado → `ThemePicker` igual se muestra (el theme no depende del
  tipo de target), pero `VariantSizePicker` nunca aparece para esos tipos
  (`kind` no existe fuera de `'component'`).
- `data-component-kind` presente pero el atributo `data-component-id`
  (fase 1) falta en el mismo elemento → ese elemento ni siquiera es
  detectado como target (fase 4 escanea por `[data-component-id]`), el
  `kind` sin id no tiene efecto. No es un caso a manejar especialmente, es
  consecuencia natural del contrato ya definido.

## Criterios de aceptación (tests)

- `defineConfig.test.ts`: `defineConfig(x)` devuelve `x` tal cual
  (identidad) — test trivial pero cierra la cobertura del archivo.
- `dom.test.ts` (extiende fixtures de fase 4): un `[data-component-id]` con
  `data-component-kind="Button"` produce un `TrackedTarget` con
  `kind: 'Button'`; uno sin el atributo produce `kind: undefined`.
- `VariantSizePicker.test.tsx`: con una `ComponentDefinition` con 2
  variantes y 1 size, se renderizan 3 pills + 2 pills "nueva/o"; click en
  una variante llama `onPick` con la oración exacta esperada; con
  `variants: []` y `sizes` presente, solo se renderiza la fila de tamaños.
- `ThemePicker.test.tsx`: token sin `values` → click llama `onPick('Cambiá
  X a ')`; token con 2 `values` → click lo expande, click en un value llama
  `onPick` con la oración cerrada y con comillas.
- `PromptModal.test.tsx` (extiende fase 6): con `definitions` + target cuyo
  `kind` matchea, aparecen los pickers y clickear una variante agrega la
  línea al textarea sin borrar texto previo; sin `definitions`, el modal
  no renderiza ningún picker y el resto del comportamiento de fase 6 sigue
  intacto (test de no-regresión).
- Integración liviana: click en variante + click en tamaño + escribir texto
  libre + guardar → el `text` guardado en `prompts` contiene las 3 líneas
  en el orden correcto, envueltas en el template `About … in … :`.
