# Guía de Integración

Ejemplos de cómo integrar `ia-front-ref-assistant` en diferentes stacks y frameworks.

## Tabla de contenidos

1. [React (Vite)](#react-vite)
2. [Next.js (App Router)](#nextjs-app-router)
3. [Create React App](#create-react-app)
4. [Remix](#remix)
5. [Astro](#astro)

---

## React + Vite

### Instalación

```bash
npm install ia-front-ref-assistant
```

### Setup básico

```tsx
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```tsx
// App.tsx
import IaFrontRefAssistant, { defineConfig } from 'ia-front-ref-assistant'
import 'ia-front-ref-assistant/style.css'

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

function App() {
  return (
    <IaFrontRefAssistant definitions={config}>
      <Main />
    </IaFrontRefAssistant>
  )
}

function Main() {
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

### Personalizar temas

```tsx
// theme.css
.ia-fra-root {
  --ia-fra-bg: #f8f9fa;
  --ia-fra-fg: #212529;
  --ia-fra-accent: #0d6efd;
  --ia-fra-border: #dee2e6;
}

/* Dark mode */
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
// main.tsx
import './theme.css'
import 'ia-front-ref-assistant/style.css'
```

---

## Next.js (App Router)

### Instalación

```bash
npm install ia-front-ref-assistant
```

### Setup con Client Component

```tsx
// app/page.tsx (Server Component)
import { AssistantWrapper } from '@/components/AssistantWrapper'

export default function Home() {
  return (
    <AssistantWrapper>
      <main>
        <section data-wrapper-id="hero">
          <h1>My Next.js App</h1>
          <button data-component-id="cta">Sign Up</button>
        </section>
      </main>
    </AssistantWrapper>
  )
}
```

```tsx
// components/AssistantWrapper.tsx
'use client'

import IaFrontRefAssistant, { defineConfig } from 'ia-front-ref-assistant'
import 'ia-front-ref-assistant/style.css'
import { ReactNode } from 'react'

const config = defineConfig({
  active: process.env.NODE_ENV === 'development',
  components: {
    'cta-button': {
      label: 'CTA Button',
      variants: ['primary', 'secondary'],
    },
  },
})

export function AssistantWrapper({ children }: { children: ReactNode }) {
  return (
    <IaFrontRefAssistant definitions={config}>
      {children}
    </IaFrontRefAssistant>
  )
}
```

### Con configuración dinámica

```tsx
// app/api/assistant-config/route.ts
import { IaFraConfig } from 'ia-front-ref-assistant'

export async function GET() {
  const config: IaFraConfig = {
    active: process.env.NODE_ENV === 'development',
    currentVariant: 'default',
    currentTheme: 'light',
    components: {
      'button': {
        label: 'Button',
        variants: ['primary', 'secondary', 'danger'],
        sizes: ['sm', 'md', 'lg'],
      },
      'card': {
        label: 'Card',
        variants: ['elevated', 'outline'],
      },
    },
    themeTokens: {
      light: {
        label: 'Light',
        values: {
          primary: '#0d6efd',
          text: '#212529',
        },
      },
      dark: {
        label: 'Dark',
        values: {
          primary: '#0dcaf0',
          text: '#f8f9fa',
        },
      },
    },
  }

  return Response.json(config)
}
```

```tsx
// components/DynamicAssistantWrapper.tsx
'use client'

import IaFrontRefAssistant from 'ia-front-ref-assistant'
import 'ia-front-ref-assistant/style.css'
import { ReactNode, useEffect, useState } from 'react'
import type { IaFraConfig } from 'ia-front-ref-assistant'

export function DynamicAssistantWrapper({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<IaFraConfig | null>(null)

  useEffect(() => {
    fetch('/api/assistant-config')
      .then(res => res.json())
      .then(setConfig)
  }, [])

  if (!config) return children

  return (
    <IaFrontRefAssistant definitions={config}>
      {children}
    </IaFrontRefAssistant>
  )
}
```

### Con layout.tsx

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { AssistantWrapper } from '@/components/AssistantWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'My App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AssistantWrapper>
          {children}
        </AssistantWrapper>
      </body>
    </html>
  )
}
```

---

## Create React App

### Instalación

```bash
npm install ia-front-ref-assistant
```

### Setup

```tsx
// src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

```tsx
// src/App.tsx
import IaFrontRefAssistant, { defineConfig } from 'ia-front-ref-assistant'
import 'ia-front-ref-assistant/style.css'
import './App.css'

const config = defineConfig({
  active: process.env.NODE_ENV === 'development',
  components: {
    'button': {
      label: 'Button',
      variants: ['primary', 'secondary'],
    },
  },
})

function App() {
  return (
    <IaFrontRefAssistant definitions={config}>
      <div className="App">
        <header>
          <h1>My CRA App</h1>
        </header>
        <main>
          <button data-component-id="hero-button" data-component-kind="button">
            Click me
          </button>
        </main>
      </div>
    </IaFrontRefAssistant>
  )
}

export default App
```

---

## Remix

### Instalación

```bash
npm install ia-front-ref-assistant
```

### Setup con Outlet

```tsx
// app/root.tsx
import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import iaFraStyles from "ia-front-ref-assistant/style.css"
import { AssistantWrapper } from "./components/AssistantWrapper"

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: iaFraStyles },
]

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
        <AssistantWrapper>
          <Outlet />
        </AssistantWrapper>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
```

```tsx
// app/components/AssistantWrapper.tsx
'use client'

import IaFrontRefAssistant, { defineConfig } from 'ia-front-ref-assistant'
import { ReactNode } from 'react'

const config = defineConfig({
  active: process.env.NODE_ENV === 'development',
  components: {
    'button': {
      label: 'Button',
      variants: ['primary', 'secondary'],
    },
  },
})

export function AssistantWrapper({ children }: { children: ReactNode }) {
  return (
    <IaFrontRefAssistant definitions={config}>
      {children}
    </IaFrontRefAssistant>
  )
}
```

---

## Astro

### Instalación

```bash
npm install ia-front-ref-assistant
npm install react react-dom
```

### Setup en isla React

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro'
import { AssistantClient } from '../components/AssistantClient'
---

<Layout title="Welcome">
  <AssistantClient client:load>
    <main>
      <section data-wrapper-id="hero">
        <h1>My Astro Site</h1>
        <button data-component-id="cta">Get Started</button>
      </section>
    </main>
  </AssistantClient>
</Layout>
```

```tsx
// src/components/AssistantClient.tsx
'use client'

import IaFrontRefAssistant, { defineConfig } from 'ia-front-ref-assistant'
import 'ia-front-ref-assistant/style.css'
import type { ReactNode } from 'react'

const config = defineConfig({
  active: import.meta.env.DEV,
  components: {
    'button': {
      label: 'Button',
      variants: ['primary', 'secondary'],
    },
  },
})

export function AssistantClient({ children }: { children: ReactNode }) {
  return (
    <IaFrontRefAssistant definitions={config}>
      {children}
    </IaFrontRefAssistant>
  )
}
```

---

## Casos de Uso Avanzados

### 1. Solo en desarrollo

```tsx
const config = defineConfig({
  // Solo activa en desarrollo
  active: process.env.NODE_ENV === 'development',
  components: { /* ... */ },
})
```

### 2. Toggle por URL param

```tsx
const searchParams = new URLSearchParams(window.location.search)
const config = defineConfig({
  active: searchParams.get('debug') === 'true',
  components: { /* ... */ },
})
```

### 3. Toggle por localStorage

```tsx
const config = defineConfig({
  active: localStorage.getItem('ia-fra-enabled') === 'true',
  components: { /* ... */ },
})
```

### 4. Configuración por usuario

```tsx
// Cargar desde API
const userConfig = await fetch(`/api/user/${userId}/ia-fra-config`).then(r => r.json())
const config = defineConfig(userConfig)
```

### 5. Integración con Storybook

```tsx
// .storybook/preview.tsx
import { AssistantWrapper } from '../src/components/AssistantWrapper'
import { defineConfig } from 'ia-front-ref-assistant'

const config = defineConfig({
  active: true,
  components: {
    'button': {
      label: 'Button',
      variants: ['primary', 'secondary', 'tertiary'],
      sizes: ['sm', 'md', 'lg'],
    },
  },
})

export const decorators = [
  (Story) => (
    <AssistantWrapper config={config}>
      <Story />
    </AssistantWrapper>
  ),
]
```

---

## Troubleshooting

### "Estilos no se aplican"

✅ Asegúrate de importar el CSS:
```tsx
import 'ia-front-ref-assistant/style.css'
```

### "Componente no aparece"

✅ Verifica que el wrapper esté en la raíz:
```tsx
<IaFrontRefAssistant>
  {/* Tu app debe estar aquí */}
</IaFrontRefAssistant>
```

✅ Revisa que `active: true` en config

### "localStorage errors en SSR"

✅ Esto es normal, el componente maneja SSR-safety. No hay error real, solo warning.

### "TypeScript errors con React Server Components"

✅ Usa `'use client'` en el wrapper:
```tsx
'use client'

import IaFrontRefAssistant from 'ia-front-ref-assistant'
```

### "Conflictos de z-index"

✅ Usa CSS variables:
```css
/* Sube el z-index si es necesario */
.ia-fra-root {
  --ia-fra-z-menu: 9999;
  --ia-fra-z-overlay: 9998;
}
```

---

## Rendimiento

### Lazy loading (opcional)

```tsx
import { lazy, Suspense } from 'react'

const IaFrontRefAssistant = lazy(() => import('ia-front-ref-assistant'))

export function App() {
  return (
    <Suspense fallback={<>{/* children */}</>}>
      <IaFrontRefAssistant>
        {/* ... */}
      </IaFrontRefAssistant>
    </Suspense>
  )
}
```

### Desactivar en producción

```tsx
const config = defineConfig({
  active: process.env.NODE_ENV !== 'production',
  components: { /* ... */ },
})
```

---

## Más ejemplos

Ver carpeta `example/` en el repositorio para una app React funcional completa.

```bash
cd example
npm install
npm run dev
```

---

**Versión:** 0.1.0  
**Última actualización:** 2025-08-21
