# IA Front Ref Assistant

Componente React que proporciona una interfaz visual flotante para ayudar en la codificación con asistentes de IA. Permite capturar, etiquetar y generar prompts para elementos de UI en tiempo real.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ¿Qué es?

**IA Front Ref Assistant** es un componente React que se monta en tu aplicación y proporciona:

- 🎯 **Captura visual** de elementos HTML con overlay interactivo
- 📍 **Tagueo automático** de componentes y secciones con atributos de datos
- 💬 **Generador de prompts** con contexto de código y configuración
- 🎨 **Tema personalizable** con tokens CSS
- ⚙️ **Configuración por componente** para variantes y tamaños

Es especialmente útil cuando trabajas con Claude o Chat GPT, permitiéndote capturar referencias visuales de tu UI y generar prompts detallados en contexto.

## Instalación

```bash
npm install ia-front-ref-assistant
```

### Requisitos

- **React**: 18+ o 19+
- **React DOM**: 18+ o 19+

## Uso Básico

Envuelve tu aplicación con el componente `IaFrontRefAssistant`:

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

## Tagueo de Elementos

Para que el componente pueda identificar tus elementos, agrega los atributos `data-wrapper-id` y `data-component-id`:

```tsx
// Sección del sitio
<section data-wrapper-id="hero">
  <h1>Welcome</h1>
  
  {/* Componente individual */}
  <div data-component-id="cta-button" data-component-kind="button-primary">
    <button>Sign Up</button>
  </div>
</section>
```

### Atributos soportados

| Atributo | Propósito | Ejemplo |
|----------|-----------|---------|
| `data-wrapper-id` | Identifica secciones del sitio | `data-wrapper-id="hero"` |
| `data-component-id` | Identifica componentes reutilizables | `data-component-id="cta-button"` |
| `data-component-kind` | Enlaza con definición de configuración | `data-component-kind="button-primary"` |

## Configuración Avanzada

### `defineConfig(options)`

Función helper para type-safe configuration:

```tsx
import { defineConfig } from 'ia-front-ref-assistant';

const config = defineConfig({
  // Activar/desactivar el componente globalmente
  active: true,

  // Variante actual (para probar diferentes versiones de UI)
  currentVariant: 'default',

  // Tema actual
  currentTheme: 'light',

  // Definiciones de componentes reutilizables
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

  // Definiciones de tokens de tema
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

### Props del componente

```tsx
<IaFrontRefAssistant
  // Configuración con definiciones de componentes y temas (opcional)
  definitions={config}
>
  {/* Tu aplicación */}
</IaFrontRefAssistant>
```

## Funcionalidad

### Botón Flotante

- Posicionado fijo en la esquina inferior derecha
- Muestra badge con cantidad de prompts capturados
- Controles: click = abrir menú, Ctrl+click = alternar captura, Ctrl+Alt+click = alternar overlay

### Menú Principal

- **Capture** - Activar modo de captura (overlay interactivo)
- **Show Overlays** - Mostrar todos los elementos detectados
- **Clear Prompts** - Limpiar prompts capturados
- **Exit** - Cerrar menú

### Modo Captura

- Hover sobre elementos para ver su estructura DOM
- Click para capturar referencia del elemento
- Escape para cancelar

### Modo Show Overlays

- Muestra todos los elementos detectados (wrappers, componentes, elementos)
- Hover en elementos para ver detalles
- Permanece activo hasta desactivar

### Modal de Prompts

- Contiene todos los prompts capturados
- Textarea editable para refinamientos
- Si existe configuración: selectores de variante y tema
- Botón "Save" copia al clipboard en formato pronto para usar

## Estilos y Temas

El componente usa variables CSS (custom properties) para temas:

```css
.ia-fra-root {
  /* Colores */
  --ia-fra-bg: #ffffff;
  --ia-fra-fg: #1f2937;
  --ia-fra-border: #e5e7eb;
  --ia-fra-accent: #3b82f6;
  --ia-fra-danger: #ef4444;
  
  /* Espaciado */
  --ia-fra-radius: 6px;
  --ia-fra-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  /* Z-index */
  --ia-fra-z-overlay: 2147482999;
  --ia-fra-z-menu: 2147483000;
}
```

Personaliza importando tus propias variables antes del componente:

```css
/* tu-tema.css */
.ia-fra-root {
  --ia-fra-accent: #your-brand-color;
  --ia-fra-bg: #your-bg;
}
```

```tsx
import './tu-tema.css';
import 'ia-front-ref-assistant/style.css';
```

## Scripts de Desarrollo

```bash
# Compilar la librería en modo watch
npm run dev

# Compilar una sola vez (para release)
npm run build

# Correr tests
npm test

# Tests en modo watch
npm run test:watch

# Verificar tipos TypeScript
npm run typecheck

# Proyecto ejemplo
npm run example:install
npm run example:dev
```

## Ejemplo Completo

Ver [example/](example/) para una app React funcional que usa el componente.

Para ejecutar el ejemplo:

```bash
npm run example:install
npm run example:dev
```

Luego abre http://localhost:5173 en tu navegador.

## Estructura del Código

```
src/
├── lib/                    # Utilidades
│   ├── types.ts           # Tipos base (TargetType, AssistantConfig)
│   ├── constants.ts       # Constantes (atributos, timeouts)
│   ├── position.ts        # Cálculo de posicionamiento
│   ├── dom.ts             # Detección y tagueo de elementos
│   ├── storage.ts         # Persistencia en localStorage
│   └── promptFormat.ts    # Formateo de prompts
│
├── config/                # Configuración
│   ├── types.ts           # Tipos de config (IaFraConfig)
│   └── defineConfig.ts    # Helper para type inference
│
├── context/               # React Context
│   ├── AssistantContext.tsx      # Definición del contexto
│   └── AssistantProvider.tsx     # Provider con estado
│
├── hooks/                 # Custom hooks
│   ├── useHoverCloseTimer.ts     # Timer para cierre automático
│   └── useTrackedTargets.ts      # Detección de elementos con MutationObserver
│
├── components/            # Componentes React
│   ├── FloatingButton.tsx        # Botón flotante principal
│   ├── BugIcon.tsx               # Icono SVG del bug
│   ├── Menu/                     # Menú desplegable
│   │   ├── Menu.tsx
│   │   ├── MenuItem.tsx
│   │   ├── SubMenu.tsx
│   │   ├── ToggleRow.tsx
│   │   └── ActionRow.tsx
│   ├── Overlay/                  # Overlays visuales
│   │   ├── CaptureOverlay.tsx   # Modo captura interactivo
│   │   ├── ShowOverlay.tsx      # Modo mostrar elementos
│   │   ├── FrameLabel.tsx       # Etiquetas de frames
│   │   ├── useHoveredTarget.ts  # Hook para tracking
│   │   └── useRect.ts           # Hook para DOMRect
│   └── PromptModal/              # Modal de prompts
│       ├── PromptModal.tsx       # Modal principal
│       ├── VariantSizePicker.tsx # Selector de variantes
│       └── ThemePicker.tsx       # Selector de temas
│
├── styles/                # Estilos CSS
│   ├── tokens.css         # Variables y base
│   ├── button-menu.css    # Botón y menú
│   ├── overlays.css       # Overlays
│   ├── modal.css          # Modal
│   ├── pickers.css        # Pickers
│   └── index.css          # Importa todos
│
└── IaFrontRefAssistant.tsx  # Componente raíz

ia-skills/                # Integración Claude Code
├── plugin.json            # Manifest
├── skills/                # Skills del plugin
└── commands/              # Comandos
```

## API Reference

### Tipos Exportados

```typescript
// Configuración
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

// Prompts capturados
export interface PromptEntry {
  id: string;
  targetId: string;
  text: string;
  timestamp: number;
}

// Configuración del asistente
export interface AssistantConfig {
  active: boolean;
  captureMode: boolean;
  showMode: boolean;
  prompts: PromptEntry[];
}
```

### Funciones Exportadas

```typescript
// Helper para configuración type-safe
export function defineConfig(config: IaFraConfig): IaFraConfig

// Hook para acceder al contexto
export function useAssistant(): AssistantContextValue
```

## Compatibilidad

- **Navegadores**: Chrome/Edge 90+, Firefox 88+, Safari 14+
- **React**: 18.0.0+, 19.0.0+
- **SSR**: Soportado (detecta `typeof window`)

## Licencia

MIT © 2025

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -am 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Soporte

Para problemas, preguntas o sugerencias, abre un issue en GitHub.
