---
name: config-mapper
description: Usar cuando el usuario pida crear, actualizar o sincronizar iafrontrefassistant.config.ts con los componentes, el theme, y/o el `prePrompt` reales del proyecto (variantes, sizes, tokens de color/radios/etc. usados en el CSS, y las referencias fijas — skills/convenciones — que debe llevar todo prompt), o cuando el comando /init-ia-front-assistent la invoque, o cuando el usuario pida agregar/cambiar algo puntual en el `prePrompt` (ej. "en el prompt final agregá que revise X").
---

# Mapeo de componentes/theme a iafrontrefassistant.config.ts

Objetivo: que `iafrontrefassistant.config.ts` (root del proyecto
consumidor) refleje los componentes reales del proyecto (con sus variantes
y tamaños, si el componente los soporta como prop) y los tokens de theme
reales (colores, radios, etc. usados en el CSS/design system del
proyecto), usando el helper `defineConfig` que exporta
`@cristianmpx/aiui-assistant`.

## Si el archivo no existe

Crearlo con esta forma base (ver
[08-component-config.md](../../reactComponent/plan/08-component-config.md) del plan de la librería
para el tipo exacto de `IaFraConfig`):

```ts
import { defineConfig } from '@cristianmpx/aiui-assistant';

export default defineConfig({
  components: [],
  theme: [],
});
```

`referenceAttributes` es opcional: si se omite, la referencia incluye todos
los atributos de `AIUI_REFERENCE_ATTRIBUTES`. Si el usuario prefiere limitar
el contexto, preguntale qué atributos quiere recibir y guardá únicamente esa
selección, por ejemplo:

```ts
referenceAttributes: [
  'id', 'role', 'aria-label', 'href',
  'data-section-id', 'data-wrapper-id', 'data-component-id',
  'data-component-kind', 'data-route',
]
```

Preguntá también si quiere estados semánticos booleanos (`disabled`,
`checked`, `selected`, `expanded`, `pressed`, `hidden`). Se incluyen por
 defecto; si el usuario los rechaza, guardá `includeSemanticState: false`.

## Mapear componentes

**Contrato obligatorio del runtime:** `components` es siempre un array de
`ComponentDefinition`. No generar el formato legado de objeto indexado
(`components: { Button: { ... } }`), aunque el proyecto ya use ese formato:
convertirlo a entradas `{ kind, variants?, sizes? }`. `variants` y `sizes`
también son arrays de `{ value, label }`, nunca arrays de strings. El valor de
`kind` debe coincidir exactamente con `data-component-kind`.

Para cada componente del proyecto que tenga `data-component-kind` (ver
skill `frontend-data-tagging`) o que sea candidato a tenerlo:

1. Buscar su definición de props (interface/type de TS, o PropTypes).
2. Si tiene una prop tipo `variant` (o similar: `type`, `appearance`) con
   un union de strings literales, o una prop `size` con union de strings —
   esos son los candidatos a `variants`/`sizes` del config.
3. Agregar/actualizar la entrada correspondiente en `components`:

```ts
{
  kind: 'Button', // debe matchear el data-component-kind real
  variants: [
    { value: 'primary', label: 'Primario' },
    { value: 'ghost', label: 'Fantasma' },
  ],
  sizes: [
    { value: 'sm', label: 'Chico' },
    { value: 'md', label: 'Mediano' },
  ],
}
```

   `label` en español, legible para un humano eligiendo en un selector;
   `value` es el valor técnico real de la prop (debe poder usarse tal cual
   en el código, no traducir el `value`).

4. **Nunca borrar** una entrada de `components` que ya esté en el archivo
   solo porque no se la detectó en este pase — puede haber sido escrita a
   mano por el usuario con variantes que no vienen de una prop TS literal
   (ej. vienen de una librería externa de estilos). Si una entrada parece
   corresponder a un componente que ya no existe en el código fuente, no
   borrarla tampoco: dejar un comentario `// TODO: revisar, no se encontró
   el componente "X" en el código fuente` arriba de esa entrada, y avisar
   al usuario en el resumen final.
5. Para una entrada que sí existe y sí se pudo mapear de nuevo, actualizar
   sus `variants`/`sizes` para que reflejen el estado actual del código
   (agregar valores nuevos, no borrar valores existentes que ya no se
   detecten — mismo criterio conservador que con componentes enteros, un
   valor pudo agregarse a mano por una razón que el escaneo no ve).

## Mapear theme

Buscar tokens de theme reales del proyecto (variables CSS custom
properties `--algo` en hojas de estilo globales, o el archivo de config de
Tailwind si el proyecto lo usa, u otro design system detectable) y
agregarlos a `theme` como `ThemeTokenDefinition`:

```ts
{ key: 'border-radius', label: 'Border radius' }
{ key: 'bg-color', label: 'Color de fondo', values: [
  { value: '#0d0d0d', label: 'Fondo oscuro' },
  { value: '#ffffff', label: 'Fondo claro' },
] }
```

`values` solo se completa si se pueden extraer valores concretos y
nombrables del proyecto (ej. una paleta de colores con nombres definidos);
si no hay forma clara de nombrarlos, dejar el token sin `values` (el
usuario completa el valor a mano en el modal, ver
[08-component-config.md](../../reactComponent/plan/08-component-config.md)) — no inventar nombres
para colores que no tienen uno claro en el código fuente.

## Mapear `prePrompt`

`prePrompt` es el texto fijo que se antepone a TODO prompt final que el
usuario guarda desde el modal (ver `IaFraConfig.prePrompt` en
[08-component-config.md](../../reactComponent/plan/08-component-config.md)). Su función es que la IA que
después recibe el prompt no pierda de vista referencias importantes del
proyecto — típicamente qué skills/convenciones propias usar para
implementar el cambio (ej. "Usa la skill frontend-component y la skill
frontend-context para entender cómo implementar estos cambios.").

### Si no existe todavía (generación inicial, normalmente desde `/init-ia-front-assistent`)

1. Detectar qué skills/comandos propios del proyecto existen (en este
   propio repo: `.agents/skills/*`, `ia-skills/skills/*`, `ia-skills/commands/*`, o el
   directorio equivalente de skills de Claude Code del proyecto
   consumidor si lo tiene) y qué convenciones fijas de implementación
   tiene el proyecto (linters/formatters obligatorios, carpeta de
   componentes, patrón de nombrado, etc.).
2. Antes de escribir nada, **no asumir** cuáles de esas referencias son
   realmente relevantes para el flujo "capturar elemento → pedirle un
   cambio a la IA" — si hay ambigüedad (varias skills candidatas, o no
   está claro qué convención es obligatoria vs. opcional), preguntarle al
   usuario en vez de adivinar (ver paso de interrogación en
   `/init-ia-front-assistent`).
3. Redactar `prePrompt` como una o pocas oraciones directas e imperativas
   (no un párrafo largo — se antepone a cada prompt, tiene que ser barato
   de leer), ej.:
   ```ts
   prePrompt: 'Usa la skill frontend-component y la skill frontend-context para entender cómo implementar estos cambios.',
   ```
4. Si no se detecta ninguna skill/convención propia que valga la pena fijar
   siempre, dejar `prePrompt` ausente (no inventar contenido genérico tipo
   "seguí buenas prácticas").

### Si ya existe (el usuario pide agregar/cambiar algo puntual)

Cuando el usuario pida un cambio del tipo "en el prompt final agregá que
también revise X" / "sacá la referencia a Y" / "cambiá el prePrompt para
que diga Z":

1. Leer el `prePrompt` actual tal cual está en el archivo.
2. Aplicar el pedido como una edición mínima sobre ese texto (agregar una
   oración, sacar una, reemplazar una frase) — **no regenerar todo el
   `prePrompt` desde cero**, así se conserva cualquier redacción manual
   del usuario que no vino de este mapeo automático.
3. Si el pedido es ambiguo (ej. no está claro si debe reemplazar una
   referencia existente o sumarse a las que ya hay), preguntar antes de
   escribir.
4. Mostrar el `prePrompt` resultante completo en el resumen final, para
   que el usuario confirme que quedó como esperaba.

## Al terminar

Mostrar al usuario un resumen: cuántas entradas de `components` se
agregaron/actualizaron, cuántos tokens de `theme` se agregaron, qué
entradas quedaron marcadas con el `TODO` de revisión manual, y el
`prePrompt` final (si se creó o modificó en este pase).
