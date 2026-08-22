# Contributing Guide

Thanks for your interest in contributing to **IA Front Ref Assistant**. This document walks you through the process.

## 📋 Table of contents

- [Getting started](#getting-started)
- [Local development](#local-development)
- [Commit structure](#commit-structure)
- [Pull requests](#pull-requests)
- [Code checklist](#code-checklist)
- [FAQ](#faq)

---

## Getting started

### Prerequisites

- Node.js 18+ or 20+
- npm 9+ or pnpm 8+
- Git
- Basic knowledge of React, TypeScript

### Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/cristianm-developer/IaFrontRefAssistant.git
   cd IaFrontRefAssistant/reactComponent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify everything works**
   ```bash
   npm test
   npm run build
   ```

---

## Local development

### Project structure

```
reactComponent/
├── src/              # Source code (edit here)
│   ├── lib/         # Pure utilities
│   ├── config/      # Configuration
│   ├── context/     # React Context
│   ├── hooks/       # Custom hooks
│   ├── components/  # React components
│   ├── styles/      # CSS
│   └── index.ts     # Exports
├── example/         # Test app (for manual QA)
├── plan/            # Phase documentation
└── test files (*.test.ts/tsx)  # Tests next to their source files
```

### Typical workflow

```bash
# 1. Create a branch for your feature
git checkout -b feat/descriptive-name

# 2. Develop with watch mode
npm run dev

# 3. Try it in the example app
npm run example:dev

# 4. Run tests while you develop
npm test:watch

# 5. Check types before committing
npm run typecheck

# 6. Final build
npm run build

# 7. Commit and push
git add .
git commit -m "feat: description of the change"
git push origin feat/descriptive-name
```

### Productivity tips

**Terminal 1 — Build in watch mode:**
```bash
npm run dev
```

**Terminal 2 — Tests in watch mode:**
```bash
npm test:watch
```

**Terminal 3 — Example app:**
```bash
npm run example:dev
```

Then open http://localhost:5173 (example) and http://localhost:5174 (if another port) in separate browser windows.

---

## Commit structure

We use [Conventional Commits](https://www.conventionalcommits.org/) for clarity:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New functionality
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting changes (no logic)
- **refactor**: Refactor without behavior changes
- **perf**: Performance improvements
- **test**: New or modified tests
- **chore**: Config, deps, etc. changes

### Scopes

- **components**: React components
- **hooks**: Custom hooks
- **lib**: Utilities
- **context**: State management
- **config**: Configuration
- **styles**: CSS
- **types**: TypeScript types
- **tests**: Tests
- **docs**: Documentation
- **ci**: GitHub Actions, etc.

### Examples

```bash
# Good ✓
git commit -m "feat(components): add VariantSizePicker component"
git commit -m "fix(hooks): debounce MutationObserver correctly"
git commit -m "docs: update README with examples"
git commit -m "test(useTrackedTargets): add edge case for nested scopes"

# Avoid ✗
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "wip"
```

---

## Pull Requests

### Before opening a PR

1. **Create a descriptive branch:**
   ```bash
   git checkout -b feat/component-name
   ```

2. **Verify everything passes:**
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

3. **Update documentation if needed:**
   - README.md
   - CLAUDE.md
   - INTEGRATION.md
   - CHANGELOG.md (add under "Unreleased")

### Creating the PR

1. **On GitHub, open a new PR**
   - Title: follows Conventional Commits
   - Description: explains *what* and *why*

2. **Template (copy into the PR description):**

```markdown
## 📝 Description

Briefly explain what this PR does.

## 🎯 Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (breaks existing functionality)
- [ ] Documentation

## 🧪 Testing

Describe how you verified it works:
- [ ] Local tests passed
- [ ] Tried it in the example app
- [ ] Tried it in a real browser

## 📋 Checklist

- [ ] Code follows the project's conventions
- [ ] Added tests for any new functionality
- [ ] Updated relevant documentation
- [ ] No breaking changes (or they're documented)
- [ ] TypeScript typecheck passes
- [ ] Commits are descriptive

## 📸 Screenshots (if applicable)

Paste screenshots of any visual changes.

## ⚠️ Breaking Changes

If there are breaking changes, document:
- What changed
- How to migrate
```

### Review Process

- At least one contributor must review
- CI must pass (tests, build, typecheck)
- I'll resolve comments or request changes
- Merge once it's ready

---

## Code checklist

### Before every commit, verify:

- [ ] **TypeScript typed correctly**
  ```bash
  npm run typecheck
  ```

- [ ] **Tests pass**
  ```bash
  npm test
  ```

- [ ] **Build has no errors**
  ```bash
  npm run build
  ```

- [ ] **New files are exported** (if public)
  - Added to `src/index.ts`
  - Documented in CLAUDE.md

- [ ] **New tests** (for new functionality)
  - Adjacent `.test.ts(x)` file
  - Minimum 80% line coverage
  - Edge cases covered

- [ ] **Well-structured CSS**
  - CSS variables for colors/spacing
  - `.ia-fra-*` prefix on classes
  - No collisions with other libraries

- [ ] **Documentation updated**
  - README.md for usage changes
  - CLAUDE.md for architectural changes
  - Comments on complex code

- [ ] **Descriptive commits**
  - Follows Conventional Commits
  - One per logical change (don't batch unrelated changes)

---

## Style guides

### TypeScript

```typescript
// ✓ Good
interface TrackedTarget {
  id: string;
  type: TargetType;
  element: HTMLElement;
  kind?: string;
}

// ✗ Avoid
interface TrackedTarget {
  id,
  type,
  element,
  kind?
}
```

- Use `interface` for public types
- Use `type` for internal types/unions
- Explicit exports (no star imports)
- Comments only for "why", not "what"

### React

```typescript
// ✓ Good
function MyComponent({ label, onClick }: Props) {
  const [state, setState] = useState(false)

  useEffect(() => {
    // Handle cleanup
    return () => {}
  }, [])

  return <button onClick={onClick}>{label}</button>
}

// ✗ Avoid
const MyComponent = ({ label, onClick }) => {
  // Missing type
  const x = useState()
  // No dependency array
  useEffect(() => {})
  return <button>{label}</button>
}
```

- Named functions (not anonymous arrow functions)
- Typed props
- useEffect always with a dependency array
- Clean up listeners/timers in cleanup

### CSS

```css
/* ✓ Good */
.ia-fra-button {
  background-color: var(--ia-fra-accent);
  padding: var(--ia-fra-spacing-md);
  border-radius: var(--ia-fra-radius);
  transition: opacity 0.15s ease;
}

.ia-fra-button:hover {
  opacity: 0.8;
}

/* ✗ Avoid */
.ia-fra-button {
  background: #3B82F6;  /* hardcoded */
  padding: 12px;        /* no variable */
  border-radius: 6px;
  transition: all;      /* vague */
}
```

- CSS variables for everything
- Explicit transitions
- `.ia-fra-*` namespace
- Comments on complex partials

---

## FAQ

### Where do I report bugs?

Open an issue with this template:
```markdown
## Bug report

### Description
What's going wrong

### Steps to reproduce
1. ...
2. ...

### Expected behavior
What should happen instead

### Logs/Screenshots
Paste errors or screenshots
```

### Can I work on feature X?

1. Open an issue first
2. Discuss the approach
3. Wait for approval
4. Only then, open the PR

This avoids conflicts if someone else is already working on it.

### What about test coverage?

- New functions: minimum 80% coverage
- Changes to existing code: keep coverage steady
- Tests can fail for valid reasons (100% is not a hard requirement)

### Can I make breaking changes?

Yes, but:
1. Document them in the PR
2. Update CHANGELOG.md
3. We'll decide whether it warrants a 1.0.0 or should wait

### How do I add a new dependency?

1. Open an issue first
2. Justify why you need it
3. We'll see whether it's critical or avoidable
4. If it's a go, `npm install <pkg>` + commit + PR

We want to keep dependencies minimal.

---

## Useful resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Docs](https://vitest.dev/)
- [RTL Best Practices](https://testing-library.com/docs/react-testing-library/intro)

---

## Code of Conduct

Please be respectful to other contributors. This includes:
- Constructive comments in reviews
- No spam, self-promotion, or off-topic content
- Inclusivity for everyone

Violations: reach out to me directly in a private issue.

---

## Acknowledgments

Thanks to everyone who contributes, reports bugs, and gives feedback.

---

**Thanks for contributing!** 🙌

**Last updated:** August 21, 2025
