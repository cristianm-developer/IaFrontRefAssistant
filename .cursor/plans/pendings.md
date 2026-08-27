# Pendings — IaFrontRefAssistant
status: active
updated: 2026-08-26
skill: `save-pending`

## items

### cleanup-generated-data-attributes | Clean generated frontend metadata
src: feature/frontend-context-data
status: completed
- Crear un script para limpiar del HTML final los atributos `data-*` agregados por Ia Front Ref Assistant, preservando los atributos del proyecto que no pertenezcan al asistente.
- Implementado como `AIUIReactAssistCleanup()` para Vite/Astro y `withAIUIReactAssistCleanup()` para Next.js; Vitest no ejecuta el cleanup.

### meta
- last_save: 2026-08-26 | chat: frontend context metadata and grouped prompts
