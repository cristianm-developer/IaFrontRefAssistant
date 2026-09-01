# Documentation Index — AIUI Assistant

A complete documentation guide for the **AIUI Assistant** project.

---

## 🗂️ File locations

```
aiui-assistant/
├── README.md                    # ← User guide and AI context reference
├── LICENSE                      # ← MIT License
├── DOCUMENTATION.md             # ← This file
├── ia-skills/                   # ← Canonical skills, Codex and Claude plugins
└── reactComponent/              # Main library (npm)
    ├── README.md               # ← Copy of the root README (npm needs its own)
    ├── CLAUDE.md                # ← Technical documentation (devs)
    ├── INTEGRATION.md           # ← Per-framework integration guides
    ├── CHANGELOG.md             # ← Version history
    ├── CONTRIBUTING.md          # ← How to contribute
    ├── plan/                    # ← Phases 0-10 (technical specs)
    │   ├── 00-overview.md
    │   ├── 01-data-types.md
    │   ├── 02-*.md
    │   ├── ...
    │   ├── 09-claude-code-integration.md
    │   └── 10-parallel-execution-plan.md
    ├── src/                     # Source code (TypeScript/React)
    ├── example/                 # Sample React app
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── vitest.config.ts
```

## Current feature coverage

- DOM metadata for independent sections, nested logical wrappers, reusable components, and individual elements.
- AI-ready references with route, source location, component name, semantic state, immediate parent context, declared visual styles, and visible content.
- Human-readable and JSON copy formats, with repeated requests for the same target grouped into one prompt entry.
- Configurable `referenceAttributes` and `includeSemanticState` options.
- Production cleanup plugins for Vite/Astro and Next.js, with an optional `keepAttributes` allowlist.
- Framework-agnostic mounting for React, Next.js, Astro, Angular, Vue, Svelte, and plain HTML.
- Versioned plugin distribution for Codex and Claude Code, with canonical skill files that can be copied into Cursor or another compatible system.

---

## 📖 Documentation by audience

### 👤 **For end users**

**I want to use the library in my project**

1. Start with: [`README.md`](README.md)
   - Installation
   - Basic usage
   - Configuration

2. Then: [`reactComponent/INTEGRATION.md`](reactComponent/INTEGRATION.md)
   - Examples for your framework (React, Next.js, etc.)
   - Troubleshooting

3. API Reference: [`README.md#api-reference`](README.md#api-reference)

### 👨‍💻 **For project developers**

**I want to understand the code and contribute**

1. Start with: [`reactComponent/CLAUDE.md`](reactComponent/CLAUDE.md)
   - General architecture
   - Main components
   - Folder structure

2. Then: Phase documentation in [`reactComponent/plan/`](reactComponent/plan/)
   - Read the phase you're interested in (e.g. `04-dom-tracking-engine.md`)
   - You'll understand that specific design

3. Finally: [`reactComponent/CONTRIBUTING.md`](reactComponent/CONTRIBUTING.md)
   - How to make changes
   - PR workflow
   - Style guides

### 🚀 **To install the AIUI Assistant plugin or skills**

**I want to use the skills in my Claude Code / Codex CLI / Cursor workflow**

1. Start with: [`README.md` — Recommended install](README.md#recommended-install-the-skill-pack-automated-setup)
   - What the skills do
   - Native plugin installation for Claude Code and Codex
   - Manual skill installation for Cursor and other compatible systems

2. Or read directly from [`ia-skills/skills/`](ia-skills/skills/) (canonical skill source and Claude Code plugin)
   - Plugin manifests
   - `SKILL.md` files

### 📋 **For release/publishing**

**I want to publish a new version**

1. Check: [`reactComponent/CHANGELOG.md`](reactComponent/CHANGELOG.md)
   - Change history
   - How to document new versions

2. Follow the checklist in: [`reactComponent/CONTRIBUTING.md#code-checklist`](reactComponent/CONTRIBUTING.md#code-checklist)

---

## 🎯 Documentation by topic

### **Installation & Setup**

- [`README.md` — Installation](README.md#installation)
- [`INTEGRATION.md` — Per-framework setup](reactComponent/INTEGRATION.md)

### **How to use it**

- [`README.md` — Basic usage](README.md#basic-usage)
- [`README.md` — Tagging elements](README.md#tagging-elements)
- [`INTEGRATION.md` — Full examples](reactComponent/INTEGRATION.md)

### **Configuration**

- [`README.md` — Advanced configuration](README.md#advanced-configuration)
- [`CLAUDE.md` — Config concepts](reactComponent/CLAUDE.md#user-configuration)

### **Styling & Theming**

- [`README.md` — Styling and theming](README.md#styling-and-theming)
- [`CLAUDE.md` — Modular CSS](reactComponent/CLAUDE.md#-styling)

### **Development**

- [`CLAUDE.md` — Architecture](reactComponent/CLAUDE.md#-architecture)
- [`CLAUDE.md` — Setup & workflow](reactComponent/CLAUDE.md#-development-workflow)
- [`CONTRIBUTING.md` — Contributing guide](reactComponent/CONTRIBUTING.md)

### **Testing**

- [`CLAUDE.md` — Tests](reactComponent/CLAUDE.md#-tests)
- [`CONTRIBUTING.md` — Code checklist](reactComponent/CONTRIBUTING.md#code-checklist)

### **Build & Release**

- [`CLAUDE.md` — Release](reactComponent/CLAUDE.md#-release--publishing)
- [`CHANGELOG.md` — Versioning](reactComponent/CHANGELOG.md)

### **Troubleshooting**

- [`INTEGRATION.md` — Troubleshooting](reactComponent/INTEGRATION.md#troubleshooting)

---

## 📚 Technical Documentation (Phases)

Location: [`reactComponent/plan/`](reactComponent/plan/)

Each phase documents one specific aspect of the component:

| Phase | File | Topic |
|------|---------|--------|
| 00 | `00-overview.md` | Overview, data contract, conventions |
| 01 | `01-data-types.md` | TypeScript types and base state |
| 02 | `02-positioning-foundation.md` | Positioning math (menu, overlays) |
| 03 | `03-ui-shell-button.md` | Floating button and UI shell |
| 04 | `04-dom-tracking-engine.md` | Detection engine (MutationObserver) |
| 05 | `05-overlay-capture.md` | Interactive capture mode |
| 06 | `06-overlay-show.md` | Show-elements mode |
| 07 | `07-prompt-clipboard.md` | Prompt modal |
| 08 | `08-component-assembly.md` | Component integration (IaFrontRefAssistant.tsx) |
| 09 | `09-component-config.md` | User configuration (themes, variants) |
| 10 | `09-claude-code-integration.md` | Claude Code skills |
| Plan | `10-parallel-execution-plan.md` | How the project was executed (multi-agent) |

**Suggested reading:**

- To understand a specific component → Read its phase (e.g. `04-dom-tracking-engine.md` for useTrackedTargets)
- For the overall architecture → Start with `00-overview.md`
- For debugging → Read the phase + review the code + adjacent tests

---

## 🔍 Quick lookup

### How do I...?

| Question | Answer |
|----------|-----------|
| ...install it? | [`README.md` — Installation](README.md#installation) |
| ...use it in React? | [`README.md` — Basic usage](README.md#basic-usage) |
| ...use it in Next.js? | [`INTEGRATION.md` — Next.js](reactComponent/INTEGRATION.md#nextjs-app-router) |
| ...customize the styles? | [`README.md` — Styling](README.md#styling-and-theming) |
| ...understand the architecture? | [`CLAUDE.md` — Architecture](reactComponent/CLAUDE.md#-architecture) |
| ...contribute? | [`CONTRIBUTING.md`](reactComponent/CONTRIBUTING.md) |
| ...report a bug? | [`CONTRIBUTING.md` — FAQ](reactComponent/CONTRIBUTING.md#faq) |
| ...see the change history? | [`CHANGELOG.md`](reactComponent/CHANGELOG.md) |
| ...install the skills in Claude/Codex/Cursor? | [`README.md` — Recommended install](README.md#recommended-install-the-skill-pack-automated-setup) |

---

## 🎓 Learning curve

### Beginner (1-2 hours)

1. [`README.md`](README.md) — Overview
2. [`INTEGRATION.md`](reactComponent/INTEGRATION.md) — Your specific framework
3. Run `npm run example:dev` and try it live

### Intermediate (3-5 hours)

1. [`CLAUDE.md`](reactComponent/CLAUDE.md) — Architecture
2. Review the code in `src/` alongside the phase docs
3. Read the tests (`*.test.ts`) to see expected behavior

### Advanced (6+ hours)

1. All phases in [`plan/`](reactComponent/plan/)
2. Debugging with tooling (DevTools, RTL logs)
3. Contribute per [`CONTRIBUTING.md`](reactComponent/CONTRIBUTING.md)

---

## 🔗 Useful links

### External documentation

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Agent Skills (agents.md)](https://agents.md)

### Project resources

- [GitHub Repository](https://github.com/cristianm-developer/aiui-assistant)
- [NPM Package](https://www.npmjs.com/package/@cristianmpx/aiui-assistant)
- [Issues](https://github.com/cristianm-developer/aiui-assistant/issues)
- [Discussions](https://github.com/cristianm-developer/aiui-assistant/discussions)

---

## ✨ Special notes

### Multi-agent

This project was built using a multi-agent system (phases 0-10 in parallel).

See: [`reactComponent/plan/10-parallel-execution-plan.md`](reactComponent/plan/10-parallel-execution-plan.md)

**Implication:** the code is highly modular and each component is independent. You can work on almost any part without breaking the rest.

### Accessibility

All the documentation tries to be accessible:
- Clear, hierarchical headings
- Tables and lists to organize content
- Descriptive links (never "click here")
- Runnable examples

### Maintenance

Documentation is updated alongside the code:
- CHANGELOG.md on every notable commit
- Plan/*.md for architectural changes
- README.md when the public API changes

---

## 🆘 I need help

### For users

1. Check [`INTEGRATION.md` — Troubleshooting](reactComponent/INTEGRATION.md#troubleshooting)
2. If that doesn't resolve it → open an issue on GitHub
3. Include: Node/React version, exact steps, the full error

### For developers

1. Check [`CLAUDE.md` — Debugging](reactComponent/CLAUDE.md#-debugging)
2. Check related tests (`.test.ts` files)
3. If that doesn't resolve it → open a discussion on GitHub

### For contributors

1. Read [`CONTRIBUTING.md` — FAQ](reactComponent/CONTRIBUTING.md#faq)
2. Open an issue to discuss a feature before working on it
3. Follow the PR workflow

---

## 📝 Documentation versioning

- **Documentation version:** 0.1.14
- **Last updated:** August 27, 2026
- **Compatible with:** @cristianmpx/aiui-assistant 0.1.19+

---

**Welcome to the community!** 🙌

For any documentation questions, [open an issue](https://github.com/cristianm-developer/aiui-assistant/issues).
