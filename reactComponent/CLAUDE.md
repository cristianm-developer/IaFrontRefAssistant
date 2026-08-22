# CLAUDE.md — Documentación Técnica

**Proyecto:** IA Front Ref Assistant  
**Descripción:** Componente React que proporciona interfaz visual para asistir codificación con IA  
**Versión:** 0.1.0  
**Estado:** Completo (Fases 0-10)  

---

## 📋 Guía Rápida

### Estructura

```
reactComponent/
├── src/              # Código fuente (TypeScript/React)
│   ├── lib/         # Utilidades puras (tipos, constantes, lógica)
│   ├── config/      # Configuración y tipos de usuario
│   ├── context/     # React Context + Provider
│   ├── hooks/       # Custom hooks (estado, DOM tracking)
│   ├── components/  # Componentes React
│   ├── styles/      # CSS modular (tokens + partials)
│   └── index.ts     # Exports públicos
├── example/         # App React de ejemplo (consume localmente)
├── plan/            # Documentación de fases 0-10
├── package.json     # Metadata y scripts
├── tsconfig.json    # Configuración TypeScript
├── vite.config.ts   # Configuración Vite (builder)
└── vitest.config.ts # Configuración Vitest (tests)
```

### Scripts principales

```bash
npm run build           # Compilar librería (Vite lib mode)
npm test               # Correr tests (Vitest)
npm run dev            # Watch mode para desarrollo
npm run typecheck      # Verificar tipos (tsc --noEmit)
npm run example:dev    # Levantar app de ejemplo
```

---

## 🏗️ Arquitectura

### Componentes principales

#### 1. **FloatingButton** (punto de entrada)
- Botón fijo en esquina inferior derecha
- Badge muestra cantidad de prompts
- Abre menú al click
- Control total: Ctrl+click (captura), Ctrl+Alt+click (overlays)

#### 2. **Menu System** (navegación)
- Menú principal con acciones: Capture, Show, Clear, Exit
- SubMenu para acciones contextuales
- ToggleRow para switches (ej: modo captura activo/inactivo)
- Positioning automático (clampea al viewport)

#### 3. **Overlay System** (visualización)
- **CaptureOverlay**: Interactivo, permite click para capturar
- **ShowOverlay**: Muestra todos los elementos detectados, no interactivo
- **FrameLabel**: Etiqueta con nombre de elemento + flip automático
- Eficiente: RAF throttling en `useHoveredTarget` + `useRect`

#### 4. **PromptModal** (salida)
- Textarea editable con prompts capturados
- Integraciones: VariantSizePicker + ThemePicker (si existen definiciones)
- Copia a clipboard con botón "Save"

#### 5. **DOM Tracking** (`useTrackedTargets`)
- MutationObserver que detecta cambios
- Debouncing (120ms) para eficiencia
- Soporta 3 flags independientes: sections, components, elements
- Heurística de hojas: identifica elementos "atómicos" vs contenedores

#### 6. **Context** (estado global)
- AssistantProvider gestiona config, prompts, flags
- Persistencia automática en localStorage
- Merge field-by-field para tolerar versiones viejas

---

## 🔑 Conceptos Clave

### Atributos de datos

El componente identifica elementos usando 3 atributos (opcionales):

```html
<!-- Sección identificada como "hero" -->
<section data-wrapper-id="hero">
  <!-- Componente reutilizable "card" -->
  <div data-component-id="featured-card" data-component-kind="card">
    <!-- Elemento hoja individual -->
    <button>Click me</button>
  </div>
</section>
```

**`data-wrapper-id`**: Identifica secciones grandes (hero, footer, etc.)  
**`data-component-id`**: Identifica instancias reutilizables  
**`data-component-kind`**: Enlaza con definición de config (p.e. "card", "button-primary")

### Tagueo automático

El hook `useTrackedTargets` escanea el DOM:

1. Busca elementos con `data-wrapper-id` → genera IDs relativos
2. Busca elementos con `data-component-id` → genera IDs relativos
3. Busca "hojas" (elementos sin contenedor de texto) → genera IDs por selector

Todos los elementos se almacenan como `TrackedTarget`:
```typescript
interface TrackedTarget {
  id: string;                    // ID único (ej: "hero/featured-card/button[0]")
  type: TargetType;              // 'wrapper' | 'component' | 'element'
  element: HTMLElement;
  kind?: string;                 // Valor de data-component-kind
  level: number;                 // Profundidad en DOM
}
```

### Configuración de usuario

```typescript
interface IaFraConfig {
  active: boolean;               // Activar/desactivar globalmente
  currentVariant?: string;       // Variante actual (ej: "default", "dark")
  currentTheme?: string;         // Tema actual (ej: "light")
  components?: {                 // Definiciones de componentes
    [kind: string]: {
      label: string;
      variants?: string[];
      sizes?: string[];
    }
  };
  themeTokens?: {                // Definiciones de temas
    [themeName: string]: {
      label: string;
      values: Record<string, string>;
    }
  };
}
```

---

## 🧪 Tests

### Estrategia

- **Unit tests**: Para funciones puras (`lib/`, hooks)
- **Component tests**: Para componentes React (RTL)
- **Integration tests**: Flujos completos (Modal, Overlays, etc.)

### Cobertura

```
src/lib/types.ts              → (tipos, no testeados)
src/lib/constants.ts          → (constantes, no testeadas)
src/lib/position.ts           → Testeado
src/lib/dom.ts                → 7 tests
src/lib/storage.ts            → 9 tests
src/lib/promptFormat.ts       → (puro formato, testeado en Modal)

src/context/AssistantProvider → 8 tests
src/hooks/useTrackedTargets   → 13 tests
src/hooks/useHoverCloseTimer  → 5 tests

src/components/BugIcon        → 3 tests
src/components/FloatingButton → 9 tests
src/components/Menu/*         → 35 tests (Menu, MenuItem, SubMenu, etc.)
src/components/Overlay/*      → 33 tests (overlays + hooks)
src/components/PromptModal/*  → 27 tests (Modal, pickers)

src/IaFrontRefAssistant       → 2 tests (composición, Portal SSR)
src/index.ts                  → (exports, no tests)
```

**Total: 152 tests pasando**

### Ejecución

```bash
# Todos los tests
npm test

# Modo watch (desarrollo)
npm test:watch

# Tests específicos
npm test -- src/lib/dom.ts

# Con cobertura (si Vitest lo soporta)
npm test -- --coverage
```

### Notas de testing

- RTL (React Testing Library) es la base
- Se usan snapshot mínimamente (solo para SVG)
- Mocking de `localStorage` en cada test
- SSR-safety verificado en AssistantProvider (mount guard)

---

## 🎨 Estilos

### CSS Modular

Los estilos se dividen en partials para evitar conflictos en compilación multi-agente:

```
src/styles/
├── tokens.css         # Variables (:root, .ia-fra-root)
├── button-menu.css    # .ia-fra-button, .ia-fra-menu, .ia-fra-toggle
├── overlays.css       # .ia-fra-overlay, .ia-fra-frame
├── modal.css          # .ia-fra-modal, .ia-fra-textarea
├── pickers.css        # .ia-fra-picker, .ia-fra-pill
└── index.css          # @import de todos (orden: tokens primero)
```

### Variables CSS

Todas definidas en `tokens.css`, namespace `--ia-fra-*`:

```css
.ia-fra-root {
  /* Color palette */
  --ia-fra-bg: #ffffff;
  --ia-fra-fg: #1f2937;
  --ia-fra-border: #e5e7eb;
  --ia-fra-accent: #3b82f6;
  --ia-fra-danger: #ef4444;
  
  /* Layout */
  --ia-fra-radius: 6px;
  --ia-fra-spacing-xs: 4px;
  --ia-fra-spacing-sm: 8px;
  --ia-fra-spacing-md: 12px;
  
  /* Effects */
  --ia-fra-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --ia-fra-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Z-index (gap de 1000 para insertar nuevas capas)*/
  --ia-fra-z-overlay: 2147482999;
  --ia-fra-z-menu: 2147483000;
}
```

### Convenciones

- **Prefijo**: Todos los elementos usan `.ia-fra-*` para evitar colisiones
- **BEM ligero**: `.ia-fra-button`, `.ia-fra-button--active`, `.ia-fra-button__icon`
- **Responsive**: Mobile-first, media queries para desktop
- **Accesibilidad**: Focus outlines, contrast ratios, semantic HTML

---

## 📦 Compilación

### Vite (builder)

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IaFrontRefAssistant',
      // Salidas
      fileName: (format) => `ia-front-ref-assistant.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' }
      }
    }
  }
});
```

**Salidas:**
- `dist/ia-front-ref-assistant.js` (ESM)
- `dist/ia-front-ref-assistant.cjs` (CommonJS)
- `dist/index.d.ts` (TypeScript definitions)
- `dist/style.css` (Estilos compilados)

### Tamaño

- **JS (ESM)**: ~26.5 kB (minificado)
- **CJS**: ~18 kB (minificado)
- **CSS**: ~3 kB (minificado)
- **Total**: ~47.5 kB antes de gzip

---

## 🔧 Development Workflow

### Setup inicial

```bash
# Clonar/instalar
git clone <repo>
cd reactComponent
npm install

# Tests/verificación
npm test
npm run typecheck

# Dev server (watch mode)
npm run dev
```

### Crear archivo nuevo

1. Coloca en carpeta correcta (`lib/`, `hooks/`, `components/`)
2. Crea `.test.ts(x)` adyacente
3. Exporta desde `src/index.ts` si es público
4. Asegúrate que tipea correctamente

### Modificar estilos

1. Edita el partial CSS correcto (ej: `button-menu.css`)
2. Usa variables `--ia-fra-*` de `tokens.css`
3. Nunca edites `index.css` directamente (solo imports)
4. Verifica que otras secciones no se rompan

---

## 🚀 Release / Publicación

### Checklist pre-release

- [ ] `npm run build` sin errores
- [ ] `npm test` — 100% pasando
- [ ] `npm run typecheck` — sin errores
- [ ] `npm run example:dev` — funciona bien
- [ ] README actualizado
- [ ] CHANGELOG.md añadido
- [ ] Version bump en `package.json`
- [ ] Git tags creado

### Publicar en npm

```bash
# Bump version
npm version patch|minor|major

# Build final
npm run build

# Publicar
npm publish

# Verificar
npm info ia-front-ref-assistant
```

---

## 🐛 Debugging

### Logs útiles

En AssistantProvider se puede agregar:

```typescript
// Ver estado actual
console.log('Config:', config);
console.log('Active targets:', targets);

// Ver eventos de captura
console.log('Prompt captured:', promptEntry);
```

### React DevTools

- Inspeciona `<AssistantProvider>` para ver estado global
- Profiler para medir renders innecesarios

### Overlay interactivo

```typescript
// En consola del navegador
const targets = document.querySelectorAll('[data-component-id]');
console.table(Array.from(targets).map(el => ({
  id: el.getAttribute('data-component-id'),
  kind: el.getAttribute('data-component-kind'),
  html: el.outerHTML.substring(0, 80)
})));
```

---

## 📚 Referencias Internas

### Fases del proyecto (en `plan/`)

```
00-overview.md           → Visión general y contrato
01-data-types.md         → Tipos base
02-positioning.md        → Posicionamiento
03-ui-shell.md          → Botón flotante
04-dom-tracking.md      → Motor de detección
05-overlay-capture.md   → Modo captura
06-prompt-clipboard.md  → Modal de prompts
07-component-assembly.md → Integración (IaFrontRefAssistant.tsx)
08-component-config.md  → Configuración de usuario
09-claude-code-integration.md → Skills para Claude
10-parallel-execution-plan.md → Cómo se ejecutó (multi-agente)
```

### Archivos críticos

- **`src/index.ts`** — Punto de entrada público
- **`src/IaFrontRefAssistant.tsx`** — Componente raíz
- **`src/context/AssistantProvider.tsx`** — Estado global
- **`src/hooks/useTrackedTargets.ts`** — Core de detección DOM
- **`src/styles/tokens.css`** — Sistema de diseño (fuente de verdad)

---

## 🤝 Colaboración (Multi-agente)

Si se trabaja con múltiples agentes (como en fase 10):

### Reglas

1. **Un archivo = un dueño por oleada** — No modificar el mismo archivo simultáneamente
2. **Checkpoints entre oleadas** — Verificar que cada fase compila/testa antes de la siguiente
3. **Dependencias respetadas** — Si tu archivo importa algo, espera que esté completo primero

### Fases (secuencial)

1. **Oleada 0** (1 agente) → tipos, constantes, CSS base
2. **Oleada 1** (8 agentes paralelo) → componentes, hooks, context
3. **Oleada 2** (1 agente) → integración CSS
4. **Oleada 3** (1 agente) → composición final
5. **Oleada 4** (1 agente) → patches y refinamientos

Ver `plan/10-parallel-execution-plan.md` para detalles completos.

---

## 📝 Notas de Implementación

### Por qué `useTrackedTargets` usa MutationObserver

- Detecta cambios en el DOM sin polling
- Debouncing (120ms) evita spam de listeners
- TreeWalker con filtro personalizado para heurística de hojas

### Por qué localStorage + Context

- Context: estado reactivo en tiempo real (React)
- localStorage: persistencia entre reloads
- Merge field-by-field tolera upgrades de config

### Por qué Portal para la UI

- No interfiere con layout del usuario (`display: none` o Portal)
- SSR-safe: verifica `typeof window === 'undefined'`
- Z-index manejado con CSS variables

### Por qué CSS modular en partials

- Permite compilación paralela (multi-agente)
- No hay conflictos de merge en `styles/index.css`
- Cada partial es independiente hasta el import final

---

## 🎓 Aprendizajes

- **React 18/19 compat**: Cuidado con hooks que dependen de versión
- **LocalStorage + React**: Necesita inicialización en effect, no en render
- **MutationObserver**: Puede ser costoso, necesita debouncing
- **TreeWalker**: Más eficiente que querySelectorAll para traversal
- **Portal + SSR**: Siempre verificar que `document` existe

---

## 📞 Contacto / Preguntas

Si necesitas clarificar algo:

1. Revisa el archivo de fase correspondiente en `plan/`
2. Busca comentarios en el código (especialmente TTD/heurística)
3. Revisa los tests para ver comportamiento esperado

---

**Última actualización:** 2025-08-21  
**Compilado por:** Multi-agente (Oleadas 0-4)
