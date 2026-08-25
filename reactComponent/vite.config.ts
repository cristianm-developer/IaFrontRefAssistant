/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// Un solo bundle para todos los consumidores: react/react-dom/react/jsx-runtime
// se aliasean a preact/compat y quedan EMBEBIDOS (no externalizados), así el
// paquete no depende de que el proyecto host tenga React instalado — sirve
// igual en React, Astro, Vue, Angular o HTML plano. Es la técnica estándar
// de "alias React a Preact":
// https://preactjs.com/guide/v10/switching-to-preact/#aliasing-react-to-preact
//
// mountIaFrontRefAssistant() (ver src/mount.tsx) es la única API pública
// pensada para el consumidor: crea su propia raíz de render, nunca depende
// de que el host reconcilie el árbol — por eso funciona sin importar qué
// runtime de UI use la app que lo carga.
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
  ],
  // El alias a Preact SOLO aplica al build de producción, no a los tests:
  // Vitest usa @testing-library/react con react-dom real para renderizar, y
  // mezclar eso con componentes ya resueltos contra preact/compat rompe la
  // reconciliación (refs/hooks de un runtime evaluados por el reconciler del
  // otro). Los tests siguen corriendo contra React real; el build de
  // producción es el único que ve Preact — ver "Casos borde" en mount.tsx.
  resolve: process.env.VITEST
    ? undefined
    : {
        alias: [
          // Orden importa: los subpaths más específicos van primero.
          { find: 'react-dom/client', replacement: 'preact/compat/client' },
          { find: 'react/jsx-runtime', replacement: 'preact/compat/jsx-runtime' },
          { find: 'react/jsx-dev-runtime', replacement: 'preact/compat/jsx-dev-runtime' },
          { find: 'react-dom', replacement: 'preact/compat' },
          { find: 'react', replacement: 'preact/compat' },
        ],
      },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IaFrontRefAssistant',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'ia-front-ref-assistant.js'
        if (format === 'cjs') return 'ia-front-ref-assistant.cjs'
        return 'ia-front-ref-assistant.global.js'
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    // Sin `external`: preact (= react/react-dom aliaseados) queda embebido.
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
