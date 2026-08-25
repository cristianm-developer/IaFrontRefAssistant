# Integration Guide

`ia-front-ref-assistant` is one function call — `mountIaFrontRefAssistant()` — that works the same in every framework, because it bundles [Preact](https://preactjs.com) internally instead of depending on `react`/`react-dom`. There's nothing to wrap and nothing else to install; what differs per framework below is only **where** you place that one call.

```bash
npm install ia-front-ref-assistant
```

## Table of contents

1. [React (Vite / CRA / any SPA)](#react-vite--cra--any-spa)
2. [Next.js](#nextjs)
3. [Remix](#remix)
4. [Astro](#astro)
5. [Angular](#angular)
6. [Vue](#vue)
7. [Svelte](#svelte)
8. [Plain HTML, no bundler](#plain-html-no-bundler)
9. [Advanced use cases](#advanced-use-cases)
10. [Troubleshooting](#troubleshooting)

---

## React (Vite / CRA / any SPA)

Call it once from your entry file, alongside (not wrapping) `ReactDOM.createRoot(...).render(...)`:

```tsx
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'
import App from './App.tsx'

const config = defineConfig({
  active: true,
  components: {
    'button-primary': {
      label: 'Primary Button',
      variants: ['default', 'hover', 'disabled'],
      sizes: ['sm', 'md', 'lg'],
    },
  },
})

mountIaFrontRefAssistant(config)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```tsx
// App.tsx — tag elements normally, no wrapper needed
function App() {
  return (
    <div>
      <section data-wrapper-id="hero">
        <h1>Welcome to my app</h1>
        <button data-component-id="cta" data-component-kind="button-primary">
          Get Started
        </button>
      </section>
    </div>
  )
}

export default App
```

### Customizing themes

```css
/* theme.css — import this AFTER mountIaFrontRefAssistant() runs, so it
   wins the cascade over the widget's injected styles */
.ia-fra-root {
  --ia-fra-bg: #f8f9fa;
  --ia-fra-fg: #212529;
  --ia-fra-accent: #0d6efd;
  --ia-fra-border: #dee2e6;
}

@media (prefers-color-scheme: dark) {
  .ia-fra-root {
    --ia-fra-bg: #212529;
    --ia-fra-fg: #f8f9fa;
    --ia-fra-accent: #0dcaf0;
    --ia-fra-border: #495057;
  }
}
```

```tsx
mountIaFrontRefAssistant(config)
import './theme.css' // after the call above
```

---

## Next.js

Call it from a small client component, mounted once from the root layout — a Server Component can render a `'use client'` child without itself becoming a Client Component:

```tsx
// app/layout.tsx (Server Component)
import { AssistantMount } from '@/components/AssistantMount'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AssistantMount />
        {children}
      </body>
    </html>
  )
}
```

```tsx
// components/AssistantMount.tsx
'use client'

import { useEffect } from 'react'
import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'

const config = defineConfig({
  active: process.env.NODE_ENV === 'development',
  components: {
    'cta-button': { label: 'CTA Button', variants: ['primary', 'secondary'] },
  },
})

export function AssistantMount() {
  useEffect(() => {
    const handle = mountIaFrontRefAssistant(config)
    return () => handle.unmount()
  }, [])

  return null
}
```

Wrapping the call in `useEffect` (with an `unmount()` cleanup) is what makes this safe under React Strict Mode's double-invoke in development — `mountIaFrontRefAssistant()` is idempotent either way, but this avoids a stray dev-mode warning.

Tag elements the same way, anywhere in your pages/components:

```tsx
export default function Home() {
  return (
    <main>
      <section data-wrapper-id="hero">
        <h1>My Next.js App</h1>
        <button data-component-id="cta">Sign Up</button>
      </section>
    </main>
  )
}
```

### With dynamic configuration

```tsx
// app/api/assistant-config/route.ts
import type { IaFraConfig } from 'ia-front-ref-assistant'

export async function GET() {
  const config: IaFraConfig = {
    active: process.env.NODE_ENV === 'development',
    currentVariant: 'default',
    currentTheme: 'light',
    components: {
      'button': { label: 'Button', variants: ['primary', 'secondary', 'danger'], sizes: ['sm', 'md', 'lg'] },
      'card': { label: 'Card', variants: ['elevated', 'outline'] },
    },
  }

  return Response.json(config)
}
```

```tsx
// components/DynamicAssistantMount.tsx
'use client'

import { useEffect, useState } from 'react'
import { mountIaFrontRefAssistant } from 'ia-front-ref-assistant'
import type { IaFraConfig } from 'ia-front-ref-assistant'

export function DynamicAssistantMount() {
  const [config, setConfig] = useState<IaFraConfig | null>(null)

  useEffect(() => {
    fetch('/api/assistant-config').then((res) => res.json()).then(setConfig)
  }, [])

  useEffect(() => {
    if (!config) return
    const handle = mountIaFrontRefAssistant(config)
    return () => handle.unmount()
  }, [config])

  return null
}
```

---

## Remix

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react"
import { AssistantMount } from "./components/AssistantMount"

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AssistantMount />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

```tsx
// app/components/AssistantMount.tsx
import { useEffect } from 'react'
import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'

const config = defineConfig({
  active: process.env.NODE_ENV === 'development',
  components: { 'button': { label: 'Button', variants: ['primary', 'secondary'] } },
})

export function AssistantMount() {
  useEffect(() => {
    const handle = mountIaFrontRefAssistant(config)
    return () => handle.unmount()
  }, [])

  return null
}
```

---

## Astro

```astro
---
// src/layouts/Layout.astro (the layout every page uses)
---

<html lang="en">
  <body>
    <slot />
    <script>
      import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'

      const config = defineConfig({
        active: import.meta.env.DEV,
        components: {
          'button': { label: 'Button', variants: ['primary', 'secondary'] },
        },
      })

      mountIaFrontRefAssistant(config)
    </script>
  </body>
</html>
```

```astro
---
// src/pages/index.astro — plain Astro markup, tagged normally
import Layout from '../layouts/Layout.astro'
---

<Layout title="Welcome">
  <main>
    <section data-wrapper-id="hero">
      <h1>My Astro Site</h1>
      <button data-component-id="cta">Get Started</button>
    </section>
  </main>
</Layout>
```

No `@astrojs/react` integration needed — the `<script>` is a plain ES module that Astro/Vite bundles as-is. Put it once in the layout every page shares, not per-page, so you don't end up with multiple floating buttons (the call is idempotent either way).

---

## Angular

Call it once from `main.ts`, at bootstrap:

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'

mountIaFrontRefAssistant(defineConfig({
  active: true,
  components: { 'button': { label: 'Button', variants: ['primary', 'secondary'] } },
}))

bootstrapApplication(AppComponent, appConfig)
```

Tag elements directly in your Angular templates — `data-*` attributes work the same as any other HTML attribute:

```html
<!-- app.component.html -->
<section data-wrapper-id="hero">
  <h1>My Angular App</h1>
  <button data-component-id="cta">Get Started</button>
</section>
```

---

## Vue

```ts
// main.ts
import { createApp } from 'vue'
import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'
import App from './App.vue'

mountIaFrontRefAssistant(defineConfig({
  active: true,
  components: { 'button': { label: 'Button', variants: ['primary', 'secondary'] } },
}))

createApp(App).mount('#app')
```

```html
<!-- App.vue -->
<template>
  <section data-wrapper-id="hero">
    <h1>My Vue App</h1>
    <button data-component-id="cta">Get Started</button>
  </section>
</template>
```

---

## Svelte

```ts
// main.ts
import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'
import App from './App.svelte'

mountIaFrontRefAssistant(defineConfig({
  active: true,
  components: { 'button': { label: 'Button', variants: ['primary', 'secondary'] } },
}))

const app = new App({ target: document.getElementById('app')! })
export default app
```

```html
<!-- App.svelte -->
<section data-wrapper-id="hero">
  <h1>My Svelte App</h1>
  <button data-component-id="cta">Get Started</button>
</section>
```

---

## Plain HTML, no bundler

Use the classic `<script>` global build — no `import`/`type="module"` required:

```html
<script src="node_modules/ia-front-ref-assistant/dist/ia-front-ref-assistant.global.js"></script>
<script>
  window.IaFrontRefAssistant.mountIaFrontRefAssistant({ active: true })
</script>
```

Serve `ia-front-ref-assistant.global.js` from wherever you host static assets (copy it out of `node_modules`, or point at a CDN mirror of the npm package). `window.IaFrontRefAssistant` also exposes `defineConfig` if you want the type-checked helper (only useful if that inline script is itself TypeScript-checked somehow — a plain object literal works just as well here).

---

## Advanced Use Cases

### 1. Development only

```ts
const config = defineConfig({
  active: process.env.NODE_ENV === 'development', // or import.meta.env.DEV, etc.
  components: { /* ... */ },
})
```

### 2. Toggle via URL param

```ts
const searchParams = new URLSearchParams(window.location.search)
const config = defineConfig({
  active: searchParams.get('debug') === 'true',
  components: { /* ... */ },
})
```

### 3. Toggle via localStorage

```ts
const config = defineConfig({
  active: localStorage.getItem('ia-fra-enabled') === 'true',
  components: { /* ... */ },
})
```

### 4. Per-user configuration

```ts
// Load from an API, then mount
const userConfig = await fetch(`/api/user/${userId}/ia-fra-config`).then((r) => r.json())
mountIaFrontRefAssistant(userConfig)
```

### 5. Storybook integration

```tsx
// .storybook/preview.tsx
import { mountIaFrontRefAssistant, defineConfig } from 'ia-front-ref-assistant'

const config = defineConfig({
  active: true,
  components: {
    'button': { label: 'Button', variants: ['primary', 'secondary', 'tertiary'], sizes: ['sm', 'md', 'lg'] },
  },
})

let mounted = false
export const decorators = [
  (Story) => {
    if (!mounted) {
      mountIaFrontRefAssistant(config)
      mounted = true
    }
    return Story()
  },
]
```

---

## Troubleshooting

### "Widget doesn't show up"

✅ Confirm `mountIaFrontRefAssistant(...)` is actually called (check the browser console for the dev warning it logs if called more than once — that at least confirms the module loaded).

✅ Check that `active: true` in the config (or omit `active`/leave it undefined, which also mounts the button).

### "Styles aren't applied" / "flash of unstyled widget"

✅ Not expected — `mountIaFrontRefAssistant()` injects its CSS synchronously, before rendering. If you see this, check for a Content-Security-Policy blocking inline `<style>` tags (the widget injects one into `document.head`).

### "TypeScript errors with React Server Components"

✅ Use `'use client'` in the wrapper component that calls it (see the Next.js section above) — the call itself needs `document`, so it can't run in a Server Component.

### "z-index conflicts"

✅ Use the CSS variables:
```css
.ia-fra-root {
  --ia-fra-z-menu: 9999;
  --ia-fra-z-overlay: 9998;
}
```

### "Called it twice and only saw one dev warning, no crash"

✅ Expected — `mountIaFrontRefAssistant()` is idempotent by design (checks for a marker element before mounting again), specifically so it's safe to call from code paths that might run more than once (React Strict Mode, HMR, multiple `<script>` includes).

---

## More examples

See the `example/` folder in the repository for a full, working React app.

```bash
cd example
npm install
npm run dev
```

---

**Version:** 0.1.2
**Last updated:** 2026-08-22
