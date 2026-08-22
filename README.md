# IA Front Ref Assistant

A React component that adds a floating visual interface to your app for working with AI coding assistants. It lets you capture, tag, and generate prompts for UI elements in real time.

![Version](https://img.shields.io/badge/version-0.1.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What is it?

**IA Front Ref Assistant** mounts into your app and gives you:

- 🎯 **Visual capture** of HTML elements via an interactive overlay
- 📍 **Automatic tagging** of components and sections with data attributes
- 💬 **Prompt generation** with code and configuration context
- 🎨 **Customizable theming** via CSS tokens
- ⚙️ **Per-component configuration** for variants and sizes

It's especially useful when working with Claude, ChatGPT, or any AI coding assistant — it lets you capture visual references from your UI and turn them into detailed, in-context prompts.

## Installation

### The package

```bash
npm install ia-front-ref-assistant
```

#### Requirements

- **React**: 18+ or 19+
- **React DOM**: 18+ or 19+

### Recommended: install the skill pack (automated setup)

Installing the package by itself only gets you the component — you still have to hand-write `iafrontrefassistant.config.ts` and tag every component with `data-wrapper-id`/`data-component-id`/`data-component-kind` yourself. This repo also ships an **agent skill pack** that does all of that for you: adds the dependency, creates/syncs the config file, tags your existing components, and mounts `<IaFrontRefAssistant>` at your app's root — idempotently, safe to re-run any time.

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
    { "name": "ia-front-ref-assistant", "source": "https://github.com/cristianm-developer/IaFrontRefAssistant.git" }
  ],
  "enabledPlugins": { "ia-skills": true }
}
```
```bash
claude plugin install ia-skills@ia-front-ref-assistant --scope project --yes
```
`enabledPlugins` only toggles a plugin that's already installed — it doesn't install it by itself, so the `claude plugin install ... --yes` step is still required once per machine/CI runner.

## Basic Usage

Wrap your app with the `IaFrontRefAssistant` component:

```tsx
import IaFrontRefAssistant, { defineConfig } from 'ia-front-ref-assistant';
import 'ia-front-ref-assistant/style.css';

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

export default function App() {
  return (
    <IaFrontRefAssistant definitions={config}>
      <YourApp />
    </IaFrontRefAssistant>
  );
}
```

## Tagging Elements

For the component to identify your elements, add the `data-wrapper-id` and `data-component-id` attributes:

```tsx
// Site section
<section data-wrapper-id="hero">
  <h1>Welcome</h1>

  {/* Individual component */}
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

```tsx
import { defineConfig } from 'ia-front-ref-assistant';

const config = defineConfig({
  // Turn the component on/off globally
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

### Component props

```tsx
<IaFrontRefAssistant
  // Configuration with component/theme definitions (optional)
  definitions={config}
>
  {/* Your app */}
</IaFrontRefAssistant>
```

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

The component uses CSS custom properties for theming:

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

Customize it by importing your own variables before the component:

```css
/* your-theme.css */
.ia-fra-root {
  --ia-fra-accent: #your-brand-color;
  --ia-fra-bg: #your-bg;
}
```

```tsx
import './your-theme.css';
import 'ia-front-ref-assistant/style.css';
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

# Example project
npm run example:install
npm run example:dev
```

## Full Example

See [reactComponent/example/](reactComponent/example/) for a working React app that uses the component.

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
├── components/            # React components
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
└── IaFrontRefAssistant.tsx  # Root component

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

// Hook to access the context
export function useAssistant(): AssistantContextValue
```

## Compatibility

- **Browsers**: Chrome/Edge 90+, Firefox 88+, Safari 14+
- **React**: 18.0.0+, 19.0.0+
- **SSR**: Supported (detects `typeof window`)

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
