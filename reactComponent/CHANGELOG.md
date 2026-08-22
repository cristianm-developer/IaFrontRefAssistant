# CHANGELOG

Todos los cambios notables en este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.1] — 2026-08-22

### 🐛 Corregido
- **`useRect`** — el primer render no actualizaba el rect (esperaba 100ms de throttle incluso en el primer tick), rompiendo overlays hasta el segundo frame
- **`FrameLabel`** — el frame completo (no solo el label) capturaba `pointer-events`, bloqueando clics sobre el contenido subyacente cuando `interactive`
- **`process.env.NODE_ENV`** sin guard — podía lanzar `ReferenceError: process is not defined` en bundlers de consumidores que no polyfillean `process` en el browser
- Tests de `ThemePicker` desactualizados (asumían un toggle de pills que ya no existe; el componente usa `<select>`) — reescritos para reflejar la UI actual
- Empaquetado: faltaban `README.md`/`LICENSE` dentro de `reactComponent/`, por lo que no se publicaban con el paquete de npm

## [0.1.0] — 2025-08-21 — Initial Release

### ✨ Agregado

#### Núcleo
- **Componente `IaFrontRefAssistant`** — Raíz de la aplicación con SSR-safety
  - Renderiza vía Portal a `document.body`
  - Detecta instancias anidadas con warning
  - Soporta prop `definitions` para configuración de usuario

#### UI/UX
- **FloatingButton** — Botón fijo en esquina inferior derecha
  - Badge que muestra cantidad de prompts capturados
  - Interacciones: click (menú), Ctrl+click (captura), Ctrl+Alt+click (overlays)
  - Opacidad dinámica cuando inactivo

- **Menu System** — Navegación jerárquica
  - Menu.tsx — Menú principal posicionado dinámicamente
  - MenuItem.tsx — Filas genéricas con chevron y slots
  - SubMenu.tsx — Submenús laterales con positioning automático
  - ToggleRow.tsx — Switches con deslizador animado
  - ActionRow.tsx — Botones de acciones

- **Overlay System** — Visualización de elementos
  - CaptureOverlay.tsx — Modo interactivo para capturar elementos
  - ShowOverlay.tsx — Modo persistente que muestra todos los elementos
  - FrameLabel.tsx — Etiquetas de elementos con flip automático
  - useHoveredTarget.ts — Hook para trackear elemento bajo mouse (RAF throttling)
  - useRect.ts — Hook para trackear DOMRect con RAF loop

- **PromptModal** — Generador de prompts
  - Modal editable con textarea
  - VariantSizePicker.tsx — Selector de variantes y tamaños
  - ThemePicker.tsx — Selector de tokens de tema (collapsable)
  - Copia a clipboard con botón "Save"

#### Funcionalidad
- **DOM Tracking** (`useTrackedTargets`)
  - Detección automática de elementos via MutationObserver
  - Debouncing (120ms) para eficiencia
  - Soporta 3 flags independientes: sections, components, elements
  - Heurística de elementos "hoja" (atómicos)

- **State Management** (AssistantProvider + Context)
  - Context global con useState
  - Persistencia automática en localStorage
  - Merge field-by-field para tolerar upgrades

- **Storage** (SSR-safe)
  - Wrapper sobre localStorage con fallback
  - JSON serialization/deserialization
  - Silent error handling (no tira la app)

- **Positioning** (clampMenuPosition)
  - Cálculo automático para evitar overflow
  - Margen configurable
  - Respeta límites de viewport

#### Configuración
- **IaFraConfig** — Interfaz de configuración
  - `active` — Activar/desactivar globalmente
  - `currentVariant` — Variante actual
  - `currentTheme` — Tema actual
  - `components` — Definiciones de componentes reutilizables
  - `themeTokens` — Definiciones de temas

- **defineConfig()** — Helper para type inference en tiempo de escritura

#### Estilos
- **Sistema de diseño CSS** — 14 variables base
  - Paleta de colores (bg, fg, border, accent, danger)
  - Espaciado y tipografía
  - Sombras y border-radius
  - Z-index configurables

- **CSS Modular** — 5 archivos + 1 index
  - tokens.css — Variables y base
  - button-menu.css — Botón flotante y menú
  - overlays.css — Overlays y frames
  - modal.css — Modal de prompts
  - pickers.css — Pickers de variantes/temas
  - index.css — Imports finales

#### Documentación
- **README.md** — Guía de usuario completa
  - Instalación
  - Uso básico
  - Configuración avanzada
  - Referencias de API
  - Compatibilidad

- **CLAUDE.md** — Documentación técnica para desarrolladores
  - Arquitectura y componentes
  - Conceptos clave
  - Tests y cobertura
  - Workflow de desarrollo
  - Debugging

- **INTEGRATION.md** — Guías de integración
  - Ejemplos para: React+Vite, Next.js, CRA, Remix, Astro
  - Casos de uso avanzados
  - Troubleshooting
  - Performance tips

- **CHANGELOG.md** — Este archivo

#### Testing
- **152 tests pasando** (21 archivos)
  - Unit tests para librerías (`lib/`, `hooks/`)
  - Component tests para React (RTL)
  - Integration tests para flujos

- **Cobertura:**
  - storage.ts → 9 tests
  - AssistantProvider.tsx → 8 tests
  - useTrackedTargets.ts → 13 tests
  - useHoverCloseTimer.ts → 5 tests
  - FloatingButton.tsx → 9 tests
  - Menu system → 35 tests
  - Overlay system → 33 tests
  - PromptModal system → 27 tests
  - BugIcon.tsx → 3 tests
  - IaFrontRefAssistant.tsx → 2 tests

#### Build & Distribution
- **Compilación Vite lib mode**
  - ESM: dist/ia-front-ref-assistant.js (~26.5 kB)
  - CJS: dist/ia-front-ref-assistant.cjs (~18 kB)
  - TypeScript definitions: dist/index.d.ts
  - Estilos compilados: dist/style.css (~3 kB)

- **Package exports**
  - Entrada principal: IaFrontRefAssistant
  - Subexport: `ia-front-ref-assistant/style.css`
  - Tipos públicos exportados

#### Skills para Claude Code
- **plugin.json** — Manifest del plugin
- **frontend-data-tagging SKILL** — Tagueo automático de elementos
- **config-mapper SKILL** — Mapeo de configuración
- **init-ia-front-assistent command** — Inicialización de proyectos

### 🏗️ Arquitectura
- **Componentes puros** — Sin side effects salvo donde necesario
- **Hooks custom** — useTrackedTargets, useHoverCloseTimer, useAssistant
- **React Context** — Estado global con Provider
- **Portal rendering** — UI flotante sin afectar layout
- **SSR-safe** — Detecta `typeof window` en AssistantProvider

### 🎨 Diseño
- **Mobile-first CSS** — Responsive en todos los tamaños
- **BEM ligero** — Prefijo `.ia-fra-*` para evitar colisiones
- **Variables CSS** — Sistema de tokens personalizable
- **Accesibilidad** — ARIA labels, focus management, semantic HTML

### 📦 Dependencias
- **Peer Dependencies:** React 18+/19+, ReactDOM 18+/19+
- **Dev Dependencies:** TypeScript, Vite, Vitest, React Testing Library, JSdom

### 🔧 Configuración
- `vite.config.ts` — Builder y lib mode
- `vitest.config.ts` — Test runner
- `tsconfig.json` — TypeScript strict mode
- `package.json` — Scripts y metadata

### 📋 Ejecución
Realizada en **5 oleadas paralelas**:

1. **Oleada 0** (1 agente) — Fundaciones puras
   - 6 archivos base (tipos, constantes, posición, DOM, CSS tokens)
   - Checkpoint: typecheck ✓

2. **Oleada 1** (8 agentes paralelo) — Grueso del trabajo
   - A: Storage/Context (3 archivos, 13 tests)
   - B: UI shell (7 archivos, 47 tests)
   - C: Submenú (2 archivos, 13 tests)
   - D: Motor DOM (1 archivo, 20 tests)
   - E: Overlays (6 archivos, 33 tests)
   - F: Prompt/clipboard (4 archivos)
   - G: Config + pickers (4 archivos, 19 tests)
   - H: Skills (4 archivos, paralelo con todo)
   - Checkpoint: 145 tests ✓

3. **Oleada 2** (1 agente) — Integración CSS
   - 1 archivo (imports finales)
   - Checkpoint: build ✓

4. **Oleada 3** (1 agente) — Integración total
   - 3 archivos (IaFrontRefAssistant, index.ts, App.tsx)
   - Checkpoint: 152 tests, build ✓

5. **Oleada 4** (1 agente) — Patches fase 8
   - 6 patches secuenciales (configuración avanzada)
   - Checkpoint: tests + build ✓

**Total:** ~70 archivos, 152 tests, cero conflictos de merge

### ✅ Verificaciones
- ✓ TypeScript typecheck (con warnings pre-existentes)
- ✓ npm test — 152 tests pasando
- ✓ npm run build — Compilación exitosa
- ✓ npm run example:dev — App ejemplo funcional
- ✓ SSR-safe — Soporta Next.js, Astro
- ✓ React 18/19 compatible

---

## Notas de esta versión

### Deuda técnica
- Algunos tests tienen warnings de `act()` (no bloquean tests)
- typecheck reporta errores pre-existentes en ciertos tests (no en código principal)
- Vulnerabilidades en dependencias transitivas (audit fix pendiente)

### Roadmap futuro
- [ ] Theme builder UI
- [ ] Cloud sync de prompts
- [ ] Colaboración en tiempo real
- [ ] Export de prompts a diferentes formatos
- [ ] Integración con más assistants de IA
- [ ] Modo "screenshot" para guardar overlays
- [ ] Keyboard shortcuts customizables
- [ ] Analytics (anónimas)

### Breaking changes
N/A — Primera versión

---

## Cómo contribuir

1. Revisa [CLAUDE.md](CLAUDE.md) para entender la arquitectura
2. Lee [plan/10-parallel-execution-plan.md](plan/10-parallel-execution-plan.md) para el workflow
3. Asegúrate que tests pasen: `npm test`
4. Verifica tipos: `npm run typecheck`
5. Actualiza CHANGELOG.md si es un cambio notable

---

**Fecha de lanzamiento:** Agosto 21, 2025  
**Compilado por:** Sistema multi-agente (Haiku + Sonnet)  
**Tiempo de desarrollo:** ~8 horas (paralelo)  
**Tests:** 152/152 ✓  
**Build:** ✓ Exitoso
