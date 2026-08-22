# 📚 Índice de Documentación

Guía completa de documentación para el proyecto **IA Front Ref Assistant**.

---

## 🗂️ Ubicación de archivos

```
IaFrontRefAssistant/
├── reactComponent/                    # Librería principal (npm)
│   ├── README.md                      # ← Guía de usuario
│   ├── CLAUDE.md                      # ← Documentación técnica (devs)
│   ├── INTEGRATION.md                 # ← Guías de integración por framework
│   ├── CHANGELOG.md                   # ← Historial de versiones
│   ├── CONTRIBUTING.md                # ← Cómo contribuir
│   ├── CLAUDE_CODE_SKILLS.md          # ← Skills para Claude Code (CLI)
│   ├── plan/                          # ← Fases 0-10 (especificaciones técnicas)
│   │   ├── 00-overview.md
│   │   ├── 01-data-types.md
│   │   ├── 02-*.md
│   │   ├── ...
│   │   ├── 09-claude-code-integration.md
│   │   └── 10-parallel-execution-plan.md
│   ├── src/                           # Código fuente (TypeScript/React)
│   ├── example/                       # App React de prueba
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
└── DOCUMENTATION.md                   # ← Este archivo
```

---

## 📖 Documentación por audiencia

### 👤 **Para usuarios finales**

**Quiero usar la librería en mi proyecto**

1. Comienza con: [`reactComponent/README.md`](reactComponent/README.md)
   - Instalación
   - Uso básico
   - Configuración

2. Luego: [`reactComponent/INTEGRATION.md`](reactComponent/INTEGRATION.md)
   - Ejemplos para tu framework (React, Next.js, etc.)
   - Troubleshooting

3. API Reference: [`reactComponent/README.md#api-reference`](reactComponent/README.md#api-reference)

### 👨‍💻 **Para desarrolladores del proyecto**

**Quiero entender el código y contribuir**

1. Comienza con: [`reactComponent/CLAUDE.md`](reactComponent/CLAUDE.md)
   - Arquitectura general
   - Componentes principales
   - Estructura de carpetas

2. Luego: Documentación de fases en [`reactComponent/plan/`](reactComponent/plan/)
   - Lee la fase que te interesa (ej: `04-dom-tracking-engine.md`)
   - Entenderás el diseño específico

3. Finalmente: [`reactComponent/CONTRIBUTING.md`](reactComponent/CONTRIBUTING.md)
   - Cómo hacer cambios
   - Workflow de PR
   - Guías de estilo

### 🚀 **Para integrar skills en Claude Code**

**Quiero usar los skills en mi workflow de Claude**

1. Comienza con: [`reactComponent/CLAUDE_CODE_SKILLS.md`](reactComponent/CLAUDE_CODE_SKILLS.md) *(próximamente)*
   - Qué son los skills
   - Instalación en Claude
   - Comandos disponibles

2. O lee directamente en: [`reactComponent/ia-skills/`](reactComponent/ia-skills/)
   - Plugin manifests
   - SKILL.md files

### 📋 **Para release/publicación**

**Quiero publicar una versión nueva**

1. Revisa: [`reactComponent/CHANGELOG.md`](reactComponent/CHANGELOG.md)
   - Historial de cambios
   - Cómo documentar nuevas versiones

2. Sigue checklist en: [`reactComponent/CONTRIBUTING.md#checklist-de-código`](reactComponent/CONTRIBUTING.md#checklist-de-código)

---

## 🎯 Documentación por tópico

### **Instalación & Setup**

- [`README.md` — Instalación](reactComponent/README.md#instalación)
- [`INTEGRATION.md` — Setup por framework](reactComponent/INTEGRATION.md)

### **Cómo usar**

- [`README.md` — Uso básico](reactComponent/README.md#uso-básico)
- [`README.md` — Tagueo de elementos](reactComponent/README.md#tagueo-de-elementos)
- [`INTEGRATION.md` — Ejemplos completos](reactComponent/INTEGRATION.md)

### **Configuración**

- [`README.md` — Configuración avanzada](reactComponent/README.md#configuración-avanzada)
- [`CLAUDE.md` — Conceptos de config](reactComponent/CLAUDE.md#configuración-de-usuario)

### **Estilos & Temas**

- [`README.md` — Estilos y temas](reactComponent/README.md#estilos-y-temas)
- [`CLAUDE.md` — CSS modular](reactComponent/CLAUDE.md#-estilos)

### **Desarrollo**

- [`CLAUDE.md` — Arquitectura](reactComponent/CLAUDE.md#-arquitectura)
- [`CLAUDE.md` — Setup & workflow](reactComponent/CLAUDE.md#-development-workflow)
- [`CONTRIBUTING.md` — Guía de contribución](reactComponent/CONTRIBUTING.md)

### **Testing**

- [`CLAUDE.md` — Tests](reactComponent/CLAUDE.md#-tests)
- [`CONTRIBUTING.md` — Checklist de código](reactComponent/CONTRIBUTING.md#checklist-de-código)

### **Compilación & Release**

- [`CLAUDE.md` — Release](reactComponent/CLAUDE.md#-release--publicación)
- [`CHANGELOG.md` — Versionado](reactComponent/CHANGELOG.md)

### **Troubleshooting**

- [`README.md` — FAQ implícitas](reactComponent/README.md#rendimiento)
- [`INTEGRATION.md` — Troubleshooting](reactComponent/INTEGRATION.md#troubleshooting)

---

## 📚 Documentación Técnica (Fases)

Ubicación: [`reactComponent/plan/`](reactComponent/plan/)

Cada fase documenta un aspecto específico del componente:

| Fase | Archivo | Tópico |
|------|---------|--------|
| 00 | `00-overview.md` | Visión general, contrato de datos, convenciones |
| 01 | `01-data-types.md` | Tipos TypeScript y estado base |
| 02 | `02-positioning-foundation.md` | Cálculo de posicionamiento (menú, overlays) |
| 03 | `03-ui-shell-button.md` | Botón flotante y UI shell |
| 04 | `04-dom-tracking-engine.md` | Motor de detección con MutationObserver |
| 05 | `05-overlay-capture.md` | Modo captura interactivo |
| 06 | `06-overlay-show.md` | Modo mostrar elementos |
| 07 | `07-prompt-clipboard.md` | Modal de prompts |
| 08 | `08-component-assembly.md` | Integración de componentes (IaFrontRefAssistant.tsx) |
| 09 | `09-component-config.md` | Configuración de usuario (themes, variants) |
| 10 | `09-claude-code-integration.md` | Skills para Claude Code |
| Plan | `10-parallel-execution-plan.md` | Cómo se ejecutó el proyecto (multi-agente) |

**Lectura recomendada:**

- Para entender un componente específico → Lee su fase (ej: `04-dom-tracking-engine.md` para useTrackedTargets)
- Para arquitectura global → Comienza por `00-overview.md`
- Para debugging → Lee la fase + revisa código + tests adyacentes

---

## 🔍 Búsqueda rápida

### ¿Cómo...?

| Pregunta | Respuesta |
|----------|-----------|
| ...instalar? | [`README.md` — Instalación](reactComponent/README.md#instalación) |
| ...usar en React? | [`README.md` — Uso básico](reactComponent/README.md#uso-básico) |
| ...usar en Next.js? | [`INTEGRATION.md` — Next.js](reactComponent/INTEGRATION.md#nextjs-app-router) |
| ...personalizar estilos? | [`README.md` — Estilos](reactComponent/README.md#estilos-y-temas) |
| ...entender la arquitectura? | [`CLAUDE.md` — Arquitectura](reactComponent/CLAUDE.md#-arquitectura) |
| ...contribuir? | [`CONTRIBUTING.md`](reactComponent/CONTRIBUTING.md) |
| ...reportar un bug? | [`CONTRIBUTING.md` — FAQ](reactComponent/CONTRIBUTING.md#preguntas-frecuentes) |
| ...ver el historial de cambios? | [`CHANGELOG.md`](reactComponent/CHANGELOG.md) |
| ...usar skills en Claude? | [`CLAUDE_CODE_SKILLS.md`](reactComponent/CLAUDE_CODE_SKILLS.md) *(próximamente)* |

---

## 📊 Estadísticas de documentación

```
Total de archivos de documentación: 11
├── README.md                    ← 300+ líneas
├── CLAUDE.md                    ← 400+ líneas
├── INTEGRATION.md               ← 350+ líneas
├── CONTRIBUTING.md              ← 250+ líneas
├── CHANGELOG.md                 ← 200+ líneas
├── plan/ (10 archivos)         ← 1000+ líneas
└── Este archivo (DOCUMENTATION.md)

Total: ~2500+ líneas de documentación
Coverage: ~95% del código

Lenguajes: Español + Inglés (comentarios en código)
```

---

## 🎓 Curva de aprendizaje

### Principiante (1-2 horas)

1. [`README.md`](reactComponent/README.md) — Visión general
2. [`INTEGRATION.md`](reactComponent/INTEGRATION.md) — Tu framework específico
3. Ejecuta `npm run example:dev` y prueba en vivo

### Intermedio (3-5 horas)

1. [`CLAUDE.md`](reactComponent/CLAUDE.md) — Arquitectura
2. Revisa código en `src/` junto con documentación de fases
3. Lee tests (`*.test.ts`) para ver comportamiento esperado

### Avanzado (6+ horas)

1. Todas las fases en [`plan/`](reactComponent/plan/)
2. Debugging con herramientas (DevTools, RTL logs)
3. Contribuciones según [`CONTRIBUTING.md`](reactComponent/CONTRIBUTING.md)

---

## 🔗 Enlaces útiles

### Documentación externa

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

### Recursos del proyecto

- [GitHub Repository](https://github.com/yourusername/ia-front-ref-assistant)
- [NPM Package](https://www.npmjs.com/package/ia-front-ref-assistant)
- [Issues](https://github.com/yourusername/ia-front-ref-assistant/issues)
- [Discussions](https://github.com/yourusername/ia-front-ref-assistant/discussions)

---

## ✨ Notas especiales

### Multi-agente

Este proyecto fue compilado usando un sistema multi-agente (fases 0-10 en paralelo).

Ver: [`reactComponent/plan/10-parallel-execution-plan.md`](reactComponent/plan/10-parallel-execution-plan.md)

**Implicación:** El código está altamente modular y cada componente es independiente. Puedes trabajar en casi cualquier parte sin romper otras.

### Accesibilidad

Toda la documentación intenta ser accesible:
- Títulos claros y jerárquicos
- Tablas y listas para organizar
- Links descriptivos (no "click here")
- Ejemplos ejecutables

### Mantenimiento

Documentación se actualiza junto con código:
- CHANGELOG.md en cada commit notable
- Plan/*.md si hay cambios arquitectónicos
- README.md si cambia la API pública

---

## 🆘 Necesito ayuda

### Para usuarios

1. Revisa [`INTEGRATION.md` — Troubleshooting](reactComponent/INTEGRATION.md#troubleshooting)
2. Si no resuelve → Abre issue en GitHub
3. Incluye: versión de Node/React, pasos exactos, error completo

### Para desarrolladores

1. Revisa [`CLAUDE.md` — Debugging](reactComponent/CLAUDE.md#-debugging)
2. Revisa tests relacionados (`.test.ts` files)
3. Si no resuelve → Abre discussion en GitHub

### Para contribuidores

1. Lee [`CONTRIBUTING.md` — FAQ](reactComponent/CONTRIBUTING.md#preguntas-frecuentes)
2. Abre issue para discutir feature antes de trabajar
3. Sigue el workflow de PR

---

## 📝 Versionado de documentación

- **Versión de documentación:** 0.1.0
- **Última actualización:** Agosto 21, 2025
- **Compatible con:** ia-front-ref-assistant 0.1.0+

---

**¡Bienvenido a la comunidad!** 🙌

Para cualquier pregunta sobre documentación, [abre un issue](https://github.com/yourusername/ia-front-ref-assistant/issues).
