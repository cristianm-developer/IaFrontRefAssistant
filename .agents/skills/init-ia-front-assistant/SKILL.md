---
name: init-ia-front-assistant
description: Usar cuando el usuario pida inicializar, instalar, auditar o sincronizar `ia-front-ref-assistant` en este proyecto (frases tipo "instalá ia-front-ref-assistant", "inicializá el asistente de IA", "sincronizá el tagueo de componentes"). Instala el paquete si falta, crea/sincroniza `iafrontrefassistant.config.ts`, retagea vistas/componentes existentes con `data-wrapper-id`/`data-component-id`/`data-component-kind`, y monta `<IaFrontRefAssistant>` en la raíz de la app si todavía no está.
---

# Inicialización de ia-front-ref-assistant

> Esta skill es la versión portable (formato [Agent Skills](https://agents.md))
> del comando `/init-ia-front-assistent` de Claude Code — mismo contenido,
> pensada para invocarse desde cualquier agente que lea `.agents/skills/`
> (Codex CLI vía `$init-ia-front-assistant`, Cursor, etc.), no solo desde
> Claude Code.

> El paquete ya está publicado en npm (`npm install ia-front-ref-assistant`);
> usá esa forma por default. Solo recurrí a la URL de git
> (`git+https://github.com/cristianm-developer/IaFrontRefAssistant.git`,
> subdirectorio `reactComponent`) si el usuario pide explícitamente
> instalar desde el repo (ej. para probar un cambio sin publicar).
> Si esta skill se corre desde una copia local
> del monorepo (herMANO de `reactComponent/` en el mismo checkout, típico
> mientras se desarrolla el propio paquete), usá esa ruta local
> (`file:../ruta/a/reactComponent`) en vez de la URL de git.

Ejecutá estos pasos en orden:

1. Detectá el gestor de paquetes del proyecto consumidor (`npm`, `pnpm` o
   `yarn`, por el lockfile presente: `package-lock.json`, `pnpm-lock.yaml`,
   `yarn.lock`; si no hay ninguno, asumí `npm`).
2. Verificá que `ia-front-ref-assistant` esté en las dependencias de
   `package.json`. **Si no está, instalalo vos mismo** (no le preguntes al
   usuario si quiere instalarlo, salvo que el paso 3 detecte que el
   proyecto no es React — ver "Casos borde"):
   - `npm`: `npm install ia-front-ref-assistant`
   - `pnpm`: `pnpm add ia-front-ref-assistant`
   - `yarn`: `yarn add ia-front-ref-assistant`

   `dist/` ya viene compilado en el tarball publicado en npm, no hace falta
   ningún paso extra. (Si en cambio se instala desde la URL de git citada
   arriba, el script `prepare` del paquete corre `npm run build` automáticamente
   al instalar.) Si el install falla, mostrá el error tal cual y no sigas
   (no tagees ni montes nada sobre un paquete que no quedó instalado).
3. Si `ia-front-ref-assistant` ya estaba en las dependencias (paso 2 no
   tuvo que instalar nada), preguntale al usuario si quiere que igual se
   actualice a la última versión (`npm update ia-front-ref-assistant`
   o equivalente) antes de seguir — no lo hagas sin preguntar, puede tener
   una versión fijada a propósito.
4. Antes de escribir nada, **interrogá al usuario** sobre lo que sea
   ambiguo para generar un buen `prePrompt` (ver sección "Mapear
   prePrompt" de la skill `config-mapper`) — no lo inventes ni lo dejes en
   blanco solo porque el proyecto no deja algo 100% claro por sí solo. En
   concreto, preguntá (adaptá las preguntas si algo ya es evidente del
   código, no repreguntes lo obvio):
   - Qué skills/comandos propios del proyecto (si hay varios candidatos
     detectados en `.agents/skills/`, `ia-skills/` o el directorio
     equivalente) deberían citarse siempre en el prompt final, y con qué
     nombre exacto.
   - Si hay convenciones de implementación obligatorias (carpeta de
     componentes, patrón de nombrado, linter/formatter, librería de
     estilos) que la IA que reciba el prompt siempre deba tener en cuenta.
   - Si el usuario ya tiene una frase/texto que quiere usar tal cual como
     `prePrompt`, en vez de que se lo redacte esta skill.
   No sigas con el paso 5 hasta tener esto resuelto (con las respuestas
   del usuario, o con su confirmación explícita de que no hace falta
   `prePrompt` para este proyecto).
5. Usá la skill `config-mapper` para crear (si no existe) o sincronizar
   `iafrontrefassistant.config.ts` con los componentes, el theme y el
   `prePrompt` (con lo relevado en el paso 4) actuales del proyecto.
6. Recorré el código fuente de frontend del proyecto (vistas, componentes)
   y, usando las reglas de la skill `frontend-data-tagging`, agregá los
   atributos `data-wrapper-id` / `data-component-id` / `data-component-kind`
   donde falten. No re-tagear lo que ya está tagueado. Priorizá los
   directorios típicos de componentes/vistas del proyecto (detectalos por
   convención: `src/components`, `src/views`, `src/pages`, `app/`, etc. —
   los que existan).
7. **Montá el componente en la raíz de la app si todavía no está.**
   Buscá si ya existe un `<IaFrontRefAssistant>` importado en algún lado
   del código (grep de `from 'ia-front-ref-assistant'`) — si ya está
   montado, no toques nada de este paso, solo confirmalo en el resumen.
   Si no está:
   1. Detectá el archivo raíz de la app según el framework:
      - Next.js (App Router): `app/layout.tsx` (o `.jsx`) — envolvé
        `children` dentro del `<body>`.
      - Next.js (Pages Router): `pages/_app.tsx` — envolvé el `<Component
        {...pageProps} />`.
      - Vite/CRA/SPA genérica: `src/App.tsx` (el componente raíz que
        renderiza `src/main.tsx`/`src/index.tsx`) — envolvé el JSX que
        devuelve.
      - Si ninguno de estos existe, preguntale al usuario cuál es el
        componente raíz de su app en vez de adivinar.
   2. Agregá el import del componente y, si el proyecto no importa CSS
      globalmente de otra forma incompatible, también su hoja de estilos:
      ```tsx
      import { IaFrontRefAssistant } from 'ia-front-ref-assistant';
      import 'ia-front-ref-assistant/style.css';
      ```
   3. Envolvé el JSX raíz con `<IaFrontRefAssistant definitions={config}>`,
      donde `config` es el default export de `iafrontrefassistant.config.ts`
      creado/sincronizado en el paso 5 (agregá también ese import). Ejemplo
      mínimo (Vite/CRA):
      ```tsx
      import { IaFrontRefAssistant } from 'ia-front-ref-assistant';
      import 'ia-front-ref-assistant/style.css';
      import config from '../iafrontrefassistant.config';

      export default function App() {
        return (
          <IaFrontRefAssistant definitions={config}>
            {/* JSX raíz existente, sin modificar */}
          </IaFrontRefAssistant>
        );
      }
      ```
   4. Es un cambio quirúrgico: no reordenes ni reformatees el resto del
      archivo, solo agregá los 2-3 imports y el wrapper alrededor del JSX
      que ya devolvía el componente raíz.
   5. Si `<IaFrontRefAssistant>` en Server Components de Next.js App
      Router no puede envolver `children` directamente (porque `layout.tsx`
      es un Server Component y el componente es `'use client'`), eso es
      normal — `'use client'` en el propio paquete lo resuelve, se puede
      envolver igual en el layout server sin marcar el layout entero como
      client.
8. Al terminar, mostrá un resumen: si se instaló el paquete (y con qué
   comando), cuántos wrappers/componentes se tagearon (y en qué archivos),
   cuántos ya estaban tagueados y se dejaron igual, el resumen que dejó
   `config-mapper` sobre el config (incluido el `prePrompt` final), y si
   se montó `<IaFrontRefAssistant>` en la raíz (y en qué archivo) o ya
   estaba montado.
9. Sugerí correr `npm run build`/`npm run dev` del proyecto consumidor para
   confirmar que todo compila con los cambios (instalación de dependencia,
   atributos `data-*`, y el nuevo wrapper en la raíz).

Esta skill es **idempotente**: correrla dos veces seguidas no debe
reinstalar el paquete si ya está (paso 2), no debe duplicar ids ni volver a
taguear lo ya tagueado (paso 6 explícitamente dice "no re-tagear lo que ya
está tagueado"), no debe duplicar entradas en el config (paso 5 delega en
`config-mapper`, que actualiza entradas existentes en vez de agregarlas de
nuevo — y sobre el `prePrompt` puntualmente, si ya existe y el usuario no
pidió cambiarlo en el paso 4, `config-mapper` lo deja tal cual, no lo
regenera), y no debe volver a envolver la app en un segundo
`<IaFrontRefAssistant>` (paso 7 explícitamente chequea si ya está montado
antes de tocar nada).

## Casos borde

- Proyecto sin ningún componente/vista detectable (recién creado, vacío) →
  esta skill crea igual el `iafrontrefassistant.config.ts` base (con
  `components: []`, `theme: []`) y reporta "0 componentes tagueados" sin
  error.
- Proyecto muy grande (cientos de componentes) → recorrer por directorios
  conocidos primero (paso 6) en vez de todo el repo, para no perder tiempo
  en `node_modules`, `dist`, `.next`, etc. (excluir siempre esas carpetas).
- El usuario no tiene skills/comandos propios detectables ni convenciones
  fijas que valga la pena citar siempre (proyecto chico, sin
  `.agents/skills/`/`ia-skills/` propio) → tras preguntar en el paso 4, si
  el usuario confirma que no hace falta, seguir sin `prePrompt` (no es
  obligatorio, ver nota en `config-mapper`).
- Un componente con `variant`/`size` tipado como `string` genérico (no
  union de literales) → no se puede derivar una lista cerrada de opciones;
  `config-mapper` no agrega `variants`/`sizes` para ese componente en ese
  caso (deja el array vacío/ausente), no inventa valores.
- El usuario invoca esta skill en un proyecto que **no** usa React (el
  paquete es React-only) → detectá esto (ausencia de `react`/`react-dom`
  en dependencias) **antes** del paso 2 (instalación) y avisá que el
  paquete no aplica, sin instalar ni taguear ni montar nada.
- El install del paso 2 falla (sin acceso a la URL de git, red caída,
  permisos) → mostrar el error del gestor de paquetes tal cual y frenar
  ahí, sin seguir con el resto de los pasos.
- No se encuentra un componente raíz reconocible en el paso 7 (estructura
  de carpetas no estándar, monorepo con múltiples apps) → preguntarle al
  usuario cuál es el archivo correcto en vez de adivinar o modificar el
  primer archivo `.tsx` que aparezca.
- El componente raíz detectado en el paso 7 no es un componente de
  función simple (ej. tiene HOCs, múltiples providers ya anidados) →
  igual encontrar el `return (...)` / JSX que se retorna y envolverlo ahí,
  sin reordenar los providers existentes — `<IaFrontRefAssistant>` puede
  ir como el provider más externo o más interno, no importa el orden
  relativo a otros providers del usuario.
