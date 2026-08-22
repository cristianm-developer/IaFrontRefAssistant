# CLAUDE.md — Technical Documentation

**Project:** IA Front Ref Assistant
**Description:** React component providing a visual interface to assist AI-driven coding
**Version:** 0.1.2
**Status:** Complete (Phases 0-10)

---

## 📋 Quick Guide

### Structure

```
reactComponent/
├── src/              # Source code (TypeScript/React)
│   ├── lib/         # Pure utilities (types, constants, logic)
│   ├── config/      # Configuration and user types
│   ├── context/     # React Context + Provider
│   ├── hooks/       # Custom hooks (state, DOM tracking)
│   ├── components/  # React components
│   ├── styles/      # Modular CSS (tokens + partials)
│   └── index.ts     # Public exports
├── example/         # Example React app (consumes the library locally)
├── plan/            # Phase 0-10 documentation
├── package.json     # Metadata and scripts
├── tsconfig.json    # TypeScript configuration
├── vite.config.ts   # Vite configuration (builder)
└── vitest.config.ts # Vitest configuration (tests)
```

### Main scripts

```bash
npm run build           # Build the library (Vite lib mode)
npm test               # Run tests (Vitest)
npm run dev            # Watch mode for development
npm run typecheck      # Check types (tsc --noEmit)
npm run example:dev    # Start the example app
```

---

## 🏗️ Architecture

### Main components

#### 1. **FloatingButton** (entry point)
- Fixed button in the bottom-right corner
- Badge shows the number of prompts
- Opens the menu on click
- Full control: Ctrl+click (capture), Ctrl+Alt+click (overlays)

#### 2. **Menu System** (navigation)
- Main menu with actions: Capture, Show, Clear, Exit
- SubMenu for contextual actions
- ToggleRow for switches (e.g. capture mode on/off)
- Automatic positioning (clamps to the viewport)

#### 3. **Overlay System** (visualization)
- **CaptureOverlay**: Interactive, allows clicking to capture
- **ShowOverlay**: Shows every detected element, non-interactive
- **FrameLabel**: Label with element name + automatic flip
- Efficient: RAF throttling in `useHoveredTarget` + `useRect`

#### 4. **PromptModal** (output)
- Editable textarea with captured prompts
- Integrations: VariantSizePicker + ThemePicker (if definitions exist)
- Copies to clipboard via a "Save" button

#### 5. **DOM Tracking** (`useTrackedTargets`)
- MutationObserver that detects changes
- Debouncing (120ms) for efficiency
- Supports 3 independent flags: sections, components, elements
- Leaf-node heuristic: identifies "atomic" elements vs. containers

#### 6. **Context** (global state)
- AssistantProvider manages config, prompts, flags
- Automatic localStorage persistence
- Field-by-field merge to tolerate old versions

---

## 🔑 Key Concepts

### Data attributes

The component identifies elements using 3 attributes (all optional):

```html
<!-- Section identified as "hero" -->
<section data-wrapper-id="hero">
  <!-- Reusable component instance "card" -->
  <div data-component-id="featured-card" data-component-kind="card">
    <!-- Individual leaf element -->
    <button>Click me</button>
  </div>
</section>
```

**`data-wrapper-id`**: Identifies large sections (hero, footer, etc.)
**`data-component-id`**: Identifies reusable instances
**`data-component-kind`**: Links to a config definition (e.g. "card", "button-primary")

### Automatic tagging

The `useTrackedTargets` hook scans the DOM:

1. Looks for elements with `data-wrapper-id` → generates relative IDs
2. Looks for elements with `data-component-id` → generates relative IDs
3. Looks for "leaf" elements (elements with no text container) → generates IDs by selector

Every element is stored as a `TrackedTarget`:
```typescript
interface TrackedTarget {
  id: string;                    // Unique ID (e.g. "hero/featured-card/button[0]")
  type: TargetType;              // 'wrapper' | 'component' | 'element'
  element: HTMLElement;
  kind?: string;                 // Value of data-component-kind
  level: number;                 // Depth in the DOM
}
```

### User configuration

```typescript
interface IaFraConfig {
  active: boolean;               // Turn the component on/off globally
  currentVariant?: string;       // Current variant (e.g. "default", "dark")
  currentTheme?: string;         // Current theme (e.g. "light")
  components?: {                 // Component definitions
    [kind: string]: {
      label: string;
      variants?: string[];
      sizes?: string[];
    }
  };
  themeTokens?: {                // Theme definitions
    [themeName: string]: {
      label: string;
      values: Record<string, string>;
    }
  };
}
```

---

## 🧪 Tests

### Strategy

- **Unit tests**: For pure functions (`lib/`, hooks)
- **Component tests**: For React components (RTL)
- **Integration tests**: Full flows (Modal, Overlays, etc.)

### Coverage

```
src/lib/types.ts              → (types, untested)
src/lib/constants.ts          → (constants, untested)
src/lib/position.ts           → Tested
src/lib/dom.ts                → 7 tests
src/lib/storage.ts            → 9 tests
src/lib/promptFormat.ts       → (pure formatting, tested in Modal)

src/context/AssistantProvider → 8 tests
src/hooks/useTrackedTargets   → 13 tests
src/hooks/useHoverCloseTimer  → 5 tests

src/components/BugIcon        → 3 tests
src/components/FloatingButton → 9 tests
src/components/Menu/*         → 35 tests (Menu, MenuItem, SubMenu, etc.)
src/components/Overlay/*      → 33 tests (overlays + hooks)
src/components/PromptModal/*  → 27 tests (Modal, pickers)

src/IaFrontRefAssistant       → 2 tests (composition, Portal SSR)
src/index.ts                  → (exports, no tests)
```

**Total: 155 passing tests**

### Running them

```bash
# All tests
npm test

# Watch mode (development)
npm test:watch

# Specific tests
npm test -- src/lib/dom.ts

# With coverage (if Vitest supports it)
npm test -- --coverage
```

### Testing notes

- RTL (React Testing Library) is the foundation
- Snapshots are used minimally (only for SVG)
- `localStorage` is mocked in every test
- SSR-safety verified in AssistantProvider (mount guard)

---

## 🎨 Styling

### Modular CSS

Styles are split into partials to avoid conflicts during multi-agent compilation:

```
src/styles/
├── tokens.css         # Variables (:root, .ia-fra-root)
├── button-menu.css    # .ia-fra-button, .ia-fra-menu, .ia-fra-toggle
├── overlays.css       # .ia-fra-overlay, .ia-fra-frame
├── modal.css          # .ia-fra-modal, .ia-fra-textarea
├── pickers.css        # .ia-fra-picker, .ia-fra-pill
└── index.css          # @import of all partials (tokens first)
```

### CSS Variables

All defined in `tokens.css`, `--ia-fra-*` namespace:

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

  /* Z-index (1000-wide gap to insert new layers)*/
  --ia-fra-z-overlay: 2147482999;
  --ia-fra-z-menu: 2147483000;
}
```

### Conventions

- **Prefix**: Every element uses `.ia-fra-*` to avoid collisions
- **Light BEM**: `.ia-fra-button`, `.ia-fra-button--active`, `.ia-fra-button__icon`
- **Responsive**: Mobile-first, media queries for desktop
- **Accessibility**: Focus outlines, contrast ratios, semantic HTML

---

## 📦 Build

### Vite (builder)

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IaFrontRefAssistant',
      // Outputs
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

**Outputs:**
- `dist/ia-front-ref-assistant.js` (ESM)
- `dist/ia-front-ref-assistant.cjs` (CommonJS)
- `dist/index.d.ts` (TypeScript definitions)
- `dist/style.css` (compiled styles)

### Size

- **JS (ESM)**: ~28.7 kB (minified)
- **CJS**: ~19.3 kB (minified)
- **CSS**: ~6 kB (minified)
- **Total**: ~54 kB before gzip

---

## 🔧 Development Workflow

### Initial setup

```bash
# Clone/install
git clone https://github.com/cristianm-developer/IaFrontRefAssistant.git
cd IaFrontRefAssistant/reactComponent
npm install

# Tests/verification
npm test
npm run typecheck

# Dev server (watch mode)
npm run dev
```

### Creating a new file

1. Place it in the right folder (`lib/`, `hooks/`, `components/`)
2. Create an adjacent `.test.ts(x)`
3. Export it from `src/index.ts` if it's public
4. Make sure it types correctly

### Editing styles

1. Edit the right CSS partial (e.g. `button-menu.css`)
2. Use `--ia-fra-*` variables from `tokens.css`
3. Never edit `index.css` directly (imports only)
4. Verify other sections aren't broken

---

## 🚀 Release / Publishing

### Pre-release checklist

- [ ] `npm run build` with no errors
- [ ] `npm test` — 100% passing
- [ ] `npm run typecheck` — no errors
- [ ] `npm run example:dev` — works well
- [ ] README updated
- [ ] CHANGELOG.md added
- [ ] Version bumped in `package.json`
- [ ] Git tag created

### Publishing to npm

```bash
# Bump version
npm version patch|minor|major

# Final build
npm run build

# Publish
npm publish

# Verify
npm info ia-front-ref-assistant
```

---

## 🐛 Debugging

### Useful logs

You can add these to AssistantProvider:

```typescript
// See current state
console.log('Config:', config);
console.log('Active targets:', targets);

// See capture events
console.log('Prompt captured:', promptEntry);
```

### React DevTools

- Inspect `<AssistantProvider>` to see global state
- Profiler to measure unnecessary renders

### Interactive overlay

```typescript
// In the browser console
const targets = document.querySelectorAll('[data-component-id]');
console.table(Array.from(targets).map(el => ({
  id: el.getAttribute('data-component-id'),
  kind: el.getAttribute('data-component-kind'),
  html: el.outerHTML.substring(0, 80)
})));
```

---

## 📚 Internal References

### Project phases (in `plan/`)

```
00-overview.md           → Overview and contract
01-data-types.md         → Base types
02-positioning.md        → Positioning
03-ui-shell.md          → Floating button
04-dom-tracking.md      → Detection engine
05-overlay-capture.md   → Capture mode
06-prompt-clipboard.md  → Prompt modal
07-component-assembly.md → Integration (IaFrontRefAssistant.tsx)
08-component-config.md  → User configuration
09-claude-code-integration.md → Skills for Claude Code
10-parallel-execution-plan.md → How it was executed (multi-agent)
```

### Critical files

- **`src/index.ts`** — Public entry point
- **`src/IaFrontRefAssistant.tsx`** — Root component
- **`src/context/AssistantProvider.tsx`** — Global state
- **`src/hooks/useTrackedTargets.ts`** — Core DOM detection
- **`src/styles/tokens.css`** — Design system (source of truth)

---

## 🤝 Collaboration (Multi-agent)

If working with multiple agents (as in phase 10):

### Rules

1. **One file = one owner per wave** — Don't modify the same file at the same time
2. **Checkpoints between waves** — Verify each phase compiles/tests before the next
3. **Respect dependencies** — If your file imports something, wait for it to be complete first

### Phases (sequential)

1. **Wave 0** (1 agent) → types, constants, base CSS
2. **Wave 1** (8 agents in parallel) → components, hooks, context
3. **Wave 2** (1 agent) → CSS integration
4. **Wave 3** (1 agent) → final composition
5. **Wave 4** (1 agent) → patches and refinements

See `plan/10-parallel-execution-plan.md` for full details.

---

## 📝 Implementation Notes

### Why `useTrackedTargets` uses MutationObserver

- Detects DOM changes without polling
- Debouncing (120ms) avoids listener spam
- TreeWalker with a custom filter for the leaf-node heuristic

### Why localStorage + Context

- Context: reactive, real-time state (React)
- localStorage: persistence across reloads
- Field-by-field merge tolerates config upgrades

### Why a Portal for the UI

- Doesn't interfere with the user's layout (`display: none` or Portal)
- SSR-safe: checks `typeof window === 'undefined'`
- Z-index managed via CSS variables

### Why modular CSS in partials

- Enables parallel compilation (multi-agent)
- No merge conflicts in `styles/index.css`
- Each partial is independent until the final import

---

## 🎓 Lessons Learned

- **React 18/19 compat**: Watch out for hooks that depend on the version
- **LocalStorage + React**: Needs initialization in an effect, not during render
- **MutationObserver**: Can be expensive, needs debouncing
- **TreeWalker**: More efficient than querySelectorAll for traversal
- **Portal + SSR**: Always check that `document` exists

---

## 📞 Contact / Questions

If you need something clarified:

1. Check the corresponding phase file in `plan/`
2. Look for comments in the code (especially TODO/heuristic notes)
3. Check the tests to see the expected behavior

---

**Last updated:** 2026-08-22
**Built by:** Multi-agent system (waves 0-4)
