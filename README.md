# IA Front Ref Assistant

A framework-agnostic floating visual widget for working with AI coding assistants. It lets you capture, tag, and generate prompts for UI elements in real time — drop it into any web app to get started.

![Version](https://img.shields.io/badge/version-0.1.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What is it?

**IA Front Ref Assistant** mounts into your app and gives you:

- 🎯 **Visual capture** of HTML elements via an interactive overlay
- 📍 **Automatic tagging** of components and sections with data attributes
- 💬 **Prompt generation** with code and configuration context
- 🎨 **Customizable theming** via CSS tokens
- ⚙️ **Per-component configuration** for variants and sizes

It's especially useful when working with Claude, ChatGPT, or any AI coding assistant — it lets you capture visual references from your UI and turn them into detailed, in-context prompts.

## Framework support

The package is **framework-agnostic**. It ships [Preact](https://preactjs.com) bundled inside its own JavaScript and does not require `react`, `react-dom`, or a framework integration package. The same public API works in React, Astro, Vue, Angular, Svelte, and plain HTML.

Integration is intentionally DOM-based: call `mountIaFrontRefAssistant()` once from the browser entry point or a client-side script. The assistant mounts its own isolated root and does not wrap, render, or depend on your application's component tree.

## Installation

### The package

```bash
npm install @cristianmpx/aiui-assistant
```

No peer dependencies to install — the package's own build already bundles what it needs to render.

### Recommended: install the skill pack (automated setup)

Installing the package by itself only gets you the widget — you still have to hand-write `iafrontrefassistant.config.ts`, tag your existing components, and call `mountIaFrontRefAssistant()` yourself. This repo also ships an **agent skill pack** that does all of that for you: adds the dependency, creates/syncs the config file, tags your existing components, and wires up the mount call — idempotently, safe to re-run any time.

The skills are plain Markdown (`SKILL.md` with YAML frontmatter), following the shared, multi-vendor [Agent Skills](https://agents.md) convention — so the same files work across tools. What differs per tool is only *where* Skills are discovered from and how you register them:

| Tool | Skills folder it reads | How to install this pack |
|---|---|---|
| **Claude Code** | `.claude/skills/` (project) or via a plugin | `/plugin marketplace add https://github.com/cristianm-developer/IaFrontRefAssistant.git` then `/plugin install ia-skills@ia-front-ref-assistant` — see [Non-interactive / CI](#non-interactive--ci) to script it. |
| **OpenAI Codex CLI** | `.agents/skills/` (project) | Copy this repo's [`.agents/skills/`](.agents/skills/) folder into your project's `.agents/skills/`, e.g.: `npx degit cristianm-developer/IaFrontRefAssistant/.agents/skills .agents/skills` |
| **Cursor** | `.agents/skills/` or `.cursor/skills/` (project) | Same copy as Codex above — Cursor reads `.agents/skills/` too: `npx degit cristianm-developer/IaFrontRefAssistant/.agents/skills .agents/skills` |
| **Claude.ai / Claude API (Agent Skills)** | Uploaded, not filesystem-based | Upload the `.agents/skills/*/SKILL.md` folders as Skills (Settings → Capabilities in claude.ai, or the `skills` param in the Agent SDK/API). |
| **Any other assistant** (Windsurf, Cline, a custom agent, ...) | Varies | Point the assistant at [`.agents/skills/`](.agents/skills/) and ask it to follow those `SKILL.md` files directly — they're self-contained. |

([`degit`](https://github.com/Rich-Harris/degit) needs no install of its own — `npx degit ...` pulls just that subfolder without cloning the whole repo or leaving a `.git` behind.)

Once installed, invoke `init-ia-front-assistant` (as `/init-ia-front-assistent` in Claude Code, `$init-ia-front-assistant` in Codex CLI, or by asking Cursor/any other assistant to run that skill).

#### Non-interactive / CI

The `/plugin` commands above are typed inside an interactive Claude Code session. To register and install the plugin from a script instead, add the marketplace to `.claude/settings.json` and install with the `--yes` CLI flag:

```json
// .claude/settings.json
{
  "extraKnownMarketplaces": [
    { "name": "aiui-assistant", "source": "https://github.com/cristianm-developer/IaFrontRefAssistant.git" }
  ],
  "enabledPlugins": { "ia-skills": true }
}
```
```bash
claude plugin install ia-skills@ia-front-ref-assistant --scope project --yes
```
`enabledPlugins` only toggles a plugin that's already installed — it doesn't install it by itself, so the `claude plugin install ... --yes` step is still required once per machine/CI runner.

## Basic Usage

Call `mountIaFrontRefAssistant()` once wherever your app boots — for example in `main.ts`, an Astro layout `<script>`, or a client-side lifecycle hook. It creates its own render root and portals the widget into `document.body`, so it doesn't need to wrap your app's JSX/template:

```tsx
// e.g. main.ts, main.tsx, an Astro client script, or any app entry point
import { mountIaFrontRefAssistant, defineConfig } from '@cristianmpx/aiui-assistant';

const config = defineConfig({
  active: true,
  currentVariant: 'default',
  currentTheme: 'light',
  components: {
    'button-primary': {
      label: 'Primary Button',
      variants: ['default', 'hover', 'disabled'],
      sizes: ['sm', 'md', 'lg'],
    },
  },
  themeTokens: {
    light: {
      label: 'Light',
      values: { primary: '#3B82F6', text: '#000000' },
    },
  },
});

mountIaFrontRefAssistant(config);
```

No CSS import needed either — `mountIaFrontRefAssistant()` injects its own styles. See [INTEGRATION.md](reactComponent/INTEGRATION.md) for the exact call site in React, Next.js, Astro, Angular, Vue, Svelte, and plain HTML.

## Tagging Elements

For the widget to identify your elements, add the `data-wrapper-id` and `data-component-id` attributes — plain HTML attributes, so this works the same in JSX, an Astro/Vue/Angular template, or raw HTML:

```html
<!-- Site section -->
<section data-wrapper-id="hero">
  <h1>Welcome</h1>

  <!-- Individual component -->
  <div data-component-id="cta-button" data-component-kind="button-primary">
    <button>Sign Up</button>
  </div>
</section>
```

> If you installed via the Claude Code skill pack above, this tagging is done for you automatically by `/init-ia-front-assistent`.

### Supported attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-wrapper-id` | Identifies site sections | `data-wrapper-id="hero"` |
| `data-component-id` | Identifies reusable components | `data-component-id="cta-button"` |
| `data-component-kind` | Links to a config definition | `data-component-kind="button-primary"` |

## Advanced Configuration

### `defineConfig(options)`

Type-safe configuration helper:

```ts
import { defineConfig } from '@cristianmpx/aiui-assistant';

const config = defineConfig({
  // Turn the widget on/off globally
  active: true,

  // Current variant (to test different UI versions)
  currentVariant: 'default',

  // Current theme
  currentTheme: 'light',

  // Reusable component definitions
  components: {
    'button-primary': {
      label: 'Primary Button',
      variants: ['default', 'hover', 'disabled', 'loading'],
      sizes: ['sm', 'md', 'lg'],
    },
    'card': {
      label: 'Card Container',
      variants: ['elevated', 'outline'],
    },
  },

  // Theme token definitions
  themeTokens: {
    light: {
      label: 'Light Mode',
      values: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        text: '#000000',
        bg: '#FFFFFF',
      },
    },
    dark: {
      label: 'Dark Mode',
      values: {
        primary: '#60A5FA',
        secondary: '#A78BFA',
        text: '#FFFFFF',
        bg: '#1F2937',
      },
    },
  },
});
```

### `mountIaFrontRefAssistant(definitions?, options?)`

```ts
mountIaFrontRefAssistant(
  config,          // optional — the object from defineConfig()
  {
    container: myDiv, // optional — defaults to a <div> it creates and appends to document.body
  }
);
```

Returns `{ unmount() }` if you ever need to tear the widget down. Calling it more than once is a no-op (logs a dev warning) — safe to call from code that might run twice (e.g. React Strict Mode, HMR).

## Features

### Floating button

- Fixed in the bottom-right corner
- Badge showing the number of captured prompts
- Controls: click = open menu, Ctrl+click = toggle capture, Ctrl+Alt+click = toggle overlays

### Main menu

- **Capture** — enable capture mode (interactive overlay)
- **Show Overlays** — display all detected elements
- **Clear Prompts** — clear captured prompts
- **Exit** — close the menu

### Capture mode

- Hover over elements to see their DOM structure
- Click to capture a reference to the element
- Escape to cancel

### Show overlays mode

- Displays all detected elements (wrappers, components, elements)
- Hover elements to see details
- Stays active until turned off

### Prompt modal

- Holds all captured prompts
- Editable textarea for refinements
- If a config exists: variant and theme pickers
- "Save" button copies to clipboard in a ready-to-use format

## Styling and Theming

The widget uses CSS custom properties for theming:

```css
.ia-fra-root {
  /* Colors */
  --ia-fra-bg: #ffffff;
  --ia-fra-fg: #1f2937;
  --ia-fra-border: #e5e7eb;
  --ia-fra-accent: #3b82f6;
  --ia-fra-danger: #ef4444;

  /* Spacing */
  --ia-fra-radius: 6px;
  --ia-fra-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

  /* Z-index */
  --ia-fra-z-overlay: 2147482999;
  --ia-fra-z-menu: 2147483000;
}
```

`mountIaFrontRefAssistant()` injects its own `<style>` tag, appended to `document.head` the first time it runs. To override tokens, add your own rule for `.ia-fra-root` **after** calling `mountIaFrontRefAssistant()` (so it wins the cascade), or target it with higher specificity/`!important` if your override needs to load earlier:

```css
/* your-theme.css — loaded/injected after mountIaFrontRefAssistant() */
.ia-fra-root {
  --ia-fra-accent: #your-brand-color;
  --ia-fra-bg: #your-bg;
}
```

## Development Scripts

Run these from `reactComponent/`:

```bash
# Build the library in watch mode
npm run dev

# One-off build (for release)
npm run build

# Run tests
npm test

# Tests in watch mode
npm run test:watch

# TypeScript typecheck
npm run typecheck

# Runtime smoke test of the built dist/ output (zero react/react-dom installed)
npm run smoke

# Example project
npm run example:install
npm run example:dev
```

## Full Example

See [reactComponent/example/](reactComponent/example/) for a working React app that uses the widget.

To run it:

```bash
npm run example:install
npm run example:dev
```

Then open http://localhost:5173 in your browser.

## Code Structure

```
reactComponent/src/
├── lib/                    # Utilities
│   ├── types.ts           # Base types (TargetType, AssistantConfig)
│   ├── constants.ts       # Constants (attributes, timeouts)
│   ├── position.ts        # Positioning math
│   ├── dom.ts             # Element detection and tagging
│   ├── storage.ts         # localStorage persistence
│   └── promptFormat.ts    # Prompt formatting
│
├── config/                # Configuration
│   ├── types.ts           # Config types (IaFraConfig)
│   └── defineConfig.ts    # Type-inference helper
│
├── context/               # React Context
│   ├── AssistantContext.tsx      # Context definition
│   └── AssistantProvider.tsx     # Provider with state
│
├── hooks/                 # Custom hooks
│   ├── useHoverCloseTimer.ts     # Auto-close timer
│   └── useTrackedTargets.ts      # MutationObserver-based detection
│
├── components/            # UI components (internal — not part of the public API, see "API Reference")
│   ├── FloatingButton.tsx        # Main floating button
│   ├── BugIcon.tsx               # Bug SVG icon
│   ├── Menu/                     # Dropdown menu
│   │   ├── Menu.tsx
│   │   ├── MenuItem.tsx
│   │   ├── SubMenu.tsx
│   │   ├── ToggleRow.tsx
│   │   └── ActionRow.tsx
│   ├── Overlay/                  # Visual overlays
│   │   ├── CaptureOverlay.tsx   # Interactive capture mode
│   │   ├── ShowOverlay.tsx      # Show-all-elements mode
│   │   ├── FrameLabel.tsx       # Frame labels
│   │   ├── useHoveredTarget.ts  # Hover-tracking hook
│   │   └── useRect.ts           # DOMRect hook
│   └── PromptModal/              # Prompt modal
│       ├── PromptModal.tsx       # Main modal
│       ├── VariantSizePicker.tsx # Variant picker
│       └── ThemePicker.tsx       # Theme picker
│
├── styles/                # CSS
│   ├── tokens.css         # Variables and base
│   ├── button-menu.css    # Button and menu
│   ├── overlays.css       # Overlays
│   ├── modal.css          # Modal
│   ├── pickers.css        # Pickers
│   └── index.css          # Imports all partials
│
├── IaFrontRefAssistant.tsx  # Internal root component (used by mount.tsx only — see "Why no <IaFrontRefAssistant> export")
└── mount.tsx                # mountIaFrontRefAssistant() — the public entry point

.agents/skills/             # Portable skill pack (Codex CLI, Cursor, ...)
├── config-mapper/          # Syncs iafrontrefassistant.config.ts
├── frontend-data-tagging/  # Applies data-* attributes
└── init-ia-front-assistant/  # Full setup skill ($init-ia-front-assistant)

ia-skills/                  # Claude Code plugin wrapper (see "Recommended" install above)
├── .claude-plugin/
│   └── plugin.json         # Plugin manifest
├── commands/
│   └── init-ia-front-assistent.md   # /init-ia-front-assistent
└── skills/
    ├── config-mapper/      # Same content as .agents/skills/config-mapper
    └── frontend-data-tagging/  # Same content as .agents/skills/frontend-data-tagging
```

## API Reference

### Exported types

```typescript
// Configuration
export interface IaFraConfig {
  active: boolean;
  currentVariant?: string;
  currentTheme?: string;
  components?: Record<string, ComponentDefinition>;
  themeTokens?: Record<string, ThemeTokenDefinition>;
}

export interface ComponentDefinition {
  label: string;
  variants?: string[];
  sizes?: string[];
}

export interface ThemeTokenDefinition {
  label: string;
  values: Record<string, string>;
}

// Captured prompts
export interface PromptEntry {
  id: string;
  targetId: string;
  text: string;
  timestamp: number;
}

// Assistant state
export interface AssistantConfig {
  active: boolean;
  captureMode: boolean;
  showMode: boolean;
  prompts: PromptEntry[];
}
```

### Exported functions

```typescript
// Type-safe configuration helper
export function defineConfig(config: IaFraConfig): IaFraConfig

// Mounts the widget in its own render root and injects its own CSS —
// see "Basic Usage" above.
export function mountIaFrontRefAssistant(
  definitions?: IaFraConfig,
  options?: { container?: HTMLElement }
): { unmount: () => void }
```

A classic `<script>` global build is also published at `dist/aiui-assistant.global.js` for zero-bundler setups — it exposes the same two functions under `window.AIUIAssistant`. See [INTEGRATION.md](reactComponent/INTEGRATION.md#plain-html-no-bundler).

### Why no `<IaFrontRefAssistant>` JSX component export

Earlier versions exported a `<IaFrontRefAssistant>{children}</IaFrontRefAssistant>` component meant to wrap your app's JSX. That pattern is now internal-only: this package bundles [Preact](https://preactjs.com) instead of depending on `react`/`react-dom` (see "Compatibility"), and a real React reconciler in a host app cannot correctly render a component built against a different, bundled UI runtime as a child of its own tree — Preact's hooks need Preact's own reconciler to track their state, which a foreign React tree never provides. `mountIaFrontRefAssistant()` doesn't have this problem because it creates and manages its own isolated render root, so it's the one supported way to mount the widget, in React apps included.

## Production metadata cleanup

Use `AIUIReactAssistCleanup()` from `@cristianmpx/aiui-assistant` in Vite/Astro builds, or `withAIUIReactAssistCleanup(nextConfig)` in Next.js. Cleanup runs only for production output and removes the assistant's generated `data-*` attributes without modifying source files. Use `keepAttributes` when route/source debugging metadata should remain. No separate Vitest plugin is needed.

## Compatibility

- **Browsers**: Chrome/Edge 90+, Firefox 88+, Safari 14+
- **Frameworks**: none required — the package bundles [Preact](https://preactjs.com) internally (no `react`/`react-dom`/`@astrojs/react`/etc. to install), so `mountIaFrontRefAssistant()` works the same in React, Next.js, Astro, Angular, Vue, Svelte, or plain HTML with no build step at all (`dist/aiui-assistant.global.js` as a classic `<script>`). See [INTEGRATION.md](reactComponent/INTEGRATION.md) for per-framework call sites.
- **SSR**: Supported (detects `typeof document === 'undefined'` and no-ops)

## License

MIT © 2026

## Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or suggestions, open an issue on GitHub.
