# Guía de Contribución

Gracias por tu interés en contribuir a **IA Front Ref Assistant**. Este documento te guiará en el proceso.

## 📋 Tabla de contenidos

- [Cómo empezar](#cómo-empezar)
- [Desarrollo local](#desarrollo-local)
- [Estructura de commits](#estructura-de-commits)
- [Pull requests](#pull-requests)
- [Checklist de código](#checklist-de-código)
- [Preguntas frecuentes](#preguntas-frecuentes)

---

## Cómo empezar

### Requisitos previos

- Node.js 18+ o 20+
- npm 9+ o pnpm 8+
- Git
- Conocimiento básico de React, TypeScript

### Setup

1. **Fork el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/ia-front-ref-assistant.git
   cd ia-front-ref-assistant/reactComponent
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Verifica que todo funciona**
   ```bash
   npm test
   npm run build
   ```

---

## Desarrollo local

### Estructura del proyecto

```
reactComponent/
├── src/              # Código fuente (edita aquí)
│   ├── lib/         # Utilidades puras
│   ├── config/      # Configuración
│   ├── context/     # React Context
│   ├── hooks/       # Custom hooks
│   ├── components/  # Componentes React
│   ├── styles/      # CSS
│   └── index.ts     # Exports
├── example/         # App de prueba (para QA manual)
├── plan/            # Documentación de fases
└── test files (*.test.ts/tsx)  # Tests adyacentes a archivos
```

### Workflow típico

```bash
# 1. Crea una rama para tu feature
git checkout -b feat/nombre-descriptivo

# 2. Desarrollo con watch mode
npm run dev

# 3. Prueba en la app ejemplo
npm run example:dev

# 4. Corre tests mientras desarrollas
npm test:watch

# 5. Verifica tipos antes de commit
npm run typecheck

# 6. Build final
npm run build

# 7. Commit y push
git add .
git commit -m "feat: descripción de cambio"
git push origin feat/nombre-descriptivo
```

### Tips de productividad

**Terminal 1 — Compilar en watch mode:**
```bash
npm run dev
```

**Terminal 2 — Tests en watch mode:**
```bash
npm test:watch
```

**Terminal 3 — App ejemplo:**
```bash
npm run example:dev
```

Luego abre http://localhost:5173 (ejemplo) y http://localhost:5174 (si hay otro puerto) en navegadores paralelos.

---

## Estructura de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para claridad:

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (sin lógica)
- **refactor**: Refactorización sin cambios de comportamiento
- **perf**: Mejoras de performance
- **test**: Tests nuevos o modificados
- **chore**: Cambios en config, deps, etc.

### Scopes

- **components**: Componentes React
- **hooks**: Custom hooks
- **lib**: Utilidades
- **context**: State management
- **config**: Configuración
- **styles**: CSS
- **types**: Tipos TypeScript
- **tests**: Tests
- **docs**: Documentación
- **ci**: GitHub Actions, etc.

### Ejemplos

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

### Antes de abrir PR

1. **Crea una rama descriptiva:**
   ```bash
   git checkout -b feat/component-name
   ```

2. **Verifica que pasa todo:**
   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

3. **Actualiza documentación si es necesario:**
   - README.md
   - CLAUDE.md
   - INTEGRATION.md
   - CHANGELOG.md (agrega bajo "Unreleased")

### Crear el PR

1. **En GitHub, abre un nuevo PR**
   - Título: sigue Conventional Commits
   - Descripción: explica *qué* y *por qué*

2. **Template (copia en descripción del PR):**

```markdown
## 📝 Descripción

Explica brevemente qué hace este PR.

## 🎯 Tipo de cambio

- [ ] Bug fix (no rompe cambios existentes)
- [ ] Nueva funcionalidad (no rompe cambios existentes)
- [ ] Breaking change (rompe funcionalidad existente)
- [ ] Documentación

## 🧪 Testing

Describe cómo verificaste que funciona:
- [ ] Tests locales pasaron
- [ ] Probé en app ejemplo
- [ ] Probé en navegador real

## 📋 Checklist

- [ ] Código sigue las convenciones del proyecto
- [ ] Agregué tests si es funcionalidad nueva
- [ ] Actualicé documentación relevante
- [ ] No hay breaking changes (o está documentado)
- [ ] TypeScript typecheck pasa
- [ ] Commits son descriptivos

## 📸 Screenshots (si aplica)

Pega screenshots de cambios visuales.

## ⚠️ Breaking Changes

Si hay breaking changes, documenta:
- Qué cambió
- Cómo migrar
```

### Review Process

- Un contributor mínimo debe revisar
- CI debe pasar (tests, build, typecheck)
- Resolveré comentarios o pediré cambios
- Merge cuando esté listo

---

## Checklist de código

### Antes de cada commit, verifica:

- [ ] **TypeScript tipado correctamente**
  ```bash
  npm run typecheck
  ```

- [ ] **Tests pasan**
  ```bash
  npm test
  ```

- [ ] **Build sin errores**
  ```bash
  npm run build
  ```

- [ ] **Archivos nuevos están exportados** (si es público)
  - Agregado a `src/index.ts`
  - Documentado en CLAUDE.md

- [ ] **Tests nuevos** (si es funcionalidad nueva)
  - Archivo `.test.ts(x)` adyacente
  - Mínimo 80% de cobertura de líneas
  - Casos borde cubiertos

- [ ] **CSS bien estructurado**
  - Variables CSS para colores/espaciado
  - Prefijo `.ia-fra-*` en clases
  - Sin colisiones con otros libros

- [ ] **Documentación actualizada**
  - README.md si es cambio de uso
  - CLAUDE.md si es cambio arquitectónico
  - Comentarios en código complejo

- [ ] **Commits descriptivos**
  - Sigue Conventional Commits
  - Uno por cambio lógico (no acumules)

---

## Guías de estilo

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

- Usa `interface` para tipos públicos
- Usa `type` para tipos internos/uniones
- Exports explícitos (no star imports)
- Comments solo para "por qué", no "qué"

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

- Funciones nombradas (no arrow functions anónimas)
- Props tipadas
- useEffect con dependency array siempre
- Limpia listeners/timers en cleanup

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
  transition: all;      /* vago */
}
```

- Variables CSS para todo
- Transiciones explícitas
- Namespace `.ia-fra-*`
- Comentarios en partials complejos

---

## Preguntas frecuentes

### ¿Dónde reporto bugs?

Abre un issue con template:
```markdown
## Bug report

### Descripción
Qué pasa de mal

### Pasos para reproducir
1. ...
2. ...

### Comportamiento esperado
Qué debería pasar

### Logs/Screenshots
Pega errores o screenshots
```

### ¿Puedo trabajar en feature X?

1. Abre una issue primero
2. Discute el approach
3. Aguarda aprobación
4. Luego sí, abre el PR

Esto evita conflictos si alguien ya está trabajando en eso.

### ¿Qué con la cobertura de tests?

- Nuevas funciones: mínimo 80% cobertura
- Cambios en existentes: mantén cobertura
- Tests pueden fallar por motivos válidos (no es requisito del 100%)

### ¿Puedo hacer breaking changes?

Sí, pero:
1. Docúmentalos en PR
2. Actualiza CHANGELOG.md
3. Veremos si hacemos 1.0.0 o esperar

### ¿Cómo agrego una nueva dependencia?

1. Abre issue primero
2. Justifica por qué la necesitas
3. Veremos si es crítica o se puede evitar
4. Si sí, `npm install <pkg>` + commit + PR

Queremos mantener las deps mínimas.

---

## Recursos útiles

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Docs](https://vitest.dev/)
- [RTL Best Practices](https://testing-library.com/docs/react-testing-library/intro)

---

## Código de Conducta

Por favor, sé respetuoso con otros contribuidores. Esto incluye:
- Comentarios constructivos en reviews
- No spam, self-promotion, o off-topic
- Inclusión de todes

Violaciones: avísame directamente en un issue privado.

---

## Reconocimientos

Agradezco a todos los que contribuyen, reportan bugs, y dan feedback.

---

**¡Gracias por contribuir!** 🙌

**Última actualización:** Agosto 21, 2025
