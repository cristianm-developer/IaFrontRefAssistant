---
name: frontend-data-tagging
description: Usar SIEMPRE que se cree, genere o edite código de frontend (componentes, vistas, secciones, layouts) en un proyecto que tenga `@cristianmpx/aiui-assistant` como dependencia en package.json o un archivo `iafrontrefassistant.config.ts` en el root. Asegura que las secciones, wrappers lógicos y componentes raíz lleven los atributos data-section-id / data-wrapper-id / data-component-id / data-component-kind.
---

# Tagueo de frontend para Ia Front Ref Assistant

Este proyecto usa `@cristianmpx/aiui-assistant`. Todo código de frontend que
generes o edites debe respetar este contrato de atributos `data-*`:

| Atributo | Va en | Valor |
|---|---|---|
| `data-section-id` | Secciones de contexto independientes de una página/view (hero, footer, sidebar, etc.) | kebab-case, descriptivo del rol de esa sección en ESA página (ej. `hero`, `pricing-table`, `footer`) |
| `data-wrapper-id` | Wrappers lógicos internos que organizan visualmente elementos y pueden anidarse | kebab-case, descriptivo del contenido/rol del container (ej. `hero-content`, `title-group`) |
| `data-component-id` | El elemento raíz de un componente reutilizable (no cada wrapper interno del componente, solo el nodo más externo) | kebab-case, único dentro de la página. Si hay más de una instancia del mismo componente en la misma vista, sufijo numérico: `cta-card-1`, `cta-card-2` |
| `data-component-kind` | El mismo elemento raíz que lleva `data-component-id` | El **tipo** del componente, estable entre instancias — PascalCase igual al nombre del componente fuente (ej. `Button`, `CtaCard`, `Modal`). Dos instancias del mismo componente comparten `kind` pero no `id`. |

Metadata opcional para enriquecer la referencia que se copia al prompt:

| Atributo | Uso |
|---|---|
| `data-route` | Ruta/view donde vive el elemento; si falta, el runtime usa `location.pathname`. |
| `data-component-name` | Nombre real del componente fuente cuando difiere de `data-component-kind`. |
| `data-source-file` / `data-source-line` | Archivo y línea de origen, si el framework o tooling puede conocerlos. |

Reglas:

- Solo el nodo **raíz** de un componente lleva `data-component-id`/
  `data-component-kind` — nunca los hijos internos del mismo componente
  (evita "capturar" ruido: el usuario de la herramienta quiere clickear el
  componente completo, no cada `<div>` interno).
- Una `data-section-id` puede contener uno o más `data-wrapper-id` y
  `data-component-id` adentro. No hace falta crear wrappers extra solo para
  tener identidad: `data-section-id` es para contexto independiente y
  `data-wrapper-id` para organización visual interna.
- Los wrappers internos pueden anidarse. El runtime puede detectar y asignar
  automáticamente `data-wrapper-id` cuando está activo "Capturar wrappers" o
  "Mostrar wrappers"; la skill no debe agregarlo a cada `div` presentacional.
  Solo agregarlo manualmente cuando el wrapper tenga una identidad
  visual/semántica clara y estable. No convertirlo en `data-section-id` salvo
  que sea una sección independiente.
- "Mostrar secciones" y "Mostrar wrappers" son modos independientes: una
  sección no debe incluirse en el inventario de wrappers y un wrapper no debe
  presentarse como sección.
- No re-tagear elementos que ya tienen `data-section-id`/`data-wrapper-id`/`data-component-id`
  al editarlos — preservar el id existente salvo que el usuario pida
  explícitamente renombrar el componente/sección (un id estable es lo que
  permite que las conversaciones sobre "el cta-card" sigan siendo válidas
  entre sesiones).
- Si el componente ya tiene el atributo `id`/`data-testid`/similar del
  proyecto, **no** reemplazarlo — `data-wrapper-id`/`data-component-id`/
  `data-component-kind` son atributos adicionales, no sustituyen otros que
  el proyecto ya use para otros fines (testing, analytics, etc.).
- No taguear elementos puramente presentacionales sin identidad propia
  (un `<div>` que solo aplica `display: flex` para alinear dos botones no
  es ni una sección ni un componente).
- Componentes de terceros (una librería de UI externa que el proyecto solo
  consume, sin código fuente propio) no se tagean — el contrato aplica a
  componentes **del proyecto**, escritos por el equipo (o por la propia
  IA).
- Si el proyecto tiene `iafrontrefassistant.config.ts` con `components`
  definidos, el `kind` que se use al taguear un componente nuevo debería
  coincidir con una entrada existente si el componente es del mismo tipo
  (ej. si ya existe `{ kind: 'Button', ... }`, un nuevo botón usa
  `data-component-kind="Button"`, no inventa `"Btn"` o `"ButtonPrimary"`).
  Si es un componente genuinamente nuevo sin entrada en el config, taguear
  igual con el `kind` que corresponda — la skill `config-mapper` (u
  `/init-ia-front-assistent`) se encarga de agregar la entrada al config después, no
  hace falta bloquear el tagueo por eso.

La captura construye una referencia por elemento con su tipo lógico (`section`,
`wrapper`, `component` o `element`), ruta, nombre de componente, clases,
atributos y estilos computados. Los pedidos adicionales sobre el mismo
elemento se agrupan en una sola entrada; no dupliques metadata ni inventes un
context packet externo.
