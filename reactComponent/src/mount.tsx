'use client';

import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IaFrontRefAssistant } from './IaFrontRefAssistant';
import type { IaFraConfig } from './config/types';
// `?inline` = el CSS viaja como string DENTRO de este bundle en vez de
// extraerse a dist/style.css — así mountIaFrontRefAssistant() no depende de
// que el consumidor importe la hoja de estilos por separado (no todos los
// setups sin bundler React tienen una forma clara de hacerlo: <script>
// plano, Astro sin @astrojs/react, etc.).
import assistantCss from './styles/index.css?inline';

const MOUNT_MARKER = 'data-ia-fra-mount';
const STYLE_MARKER = 'data-ia-fra-style';

function ensureStylesInjected(): void {
  if (document.querySelector(`style[${STYLE_MARKER}]`)) return;
  const style = document.createElement('style');
  style.setAttribute(STYLE_MARKER, '');
  style.textContent = assistantCss;
  document.head.appendChild(style);
}

export interface MountOptions {
  /**
   * Container to render into. Defaults to a fresh `<div>` this function
   * creates and appends to `document.body` (and removes again on unmount).
   */
  container?: HTMLElement;
}

export interface MountHandle {
  /** Unmounts the widget and removes the container this call created (if any). */
  unmount: () => void;
}

const NOOP_HANDLE: MountHandle = { unmount: () => {} };

/**
 * Framework-agnostic bootstrap: mounts the floating widget directly into
 * the page via its own React root, without requiring the host app to be
 * React and without wrapping any of the host app's content.
 *
 * The widget's DOM scanning (`useTrackedTargets`) already reads
 * `data-wrapper-id`/`data-component-id` from the whole `document.body` via
 * a `MutationObserver`, not from a React children tree — so this is
 * functionally equivalent to `<IaFrontRefAssistant>{yourApp}</IaFrontRefAssistant>`
 * for the widget's own purposes. Use it from a plain `<script type="module">`,
 * Vue, Svelte, Astro (with a `<script>` tag — no `@astrojs/react` island
 * needed), or any setup where mounting a React wrapper around your whole
 * app isn't practical. Requires `react`/`react-dom` (or a compatible shim,
 * e.g. `preact/compat`) to be resolvable at runtime — this doesn't lift the
 * React 18+ `createRoot` requirement.
 *
 * Unlike `<IaFrontRefAssistant>`, this also injects the widget's CSS itself
 * (as a `<style>` tag) — the styles ship inlined in this module instead of
 * relying on `dist/style.css` — so there's no separate stylesheet import to
 * remember for setups that don't have an obvious place to add one.
 *
 * No-ops on the server (`typeof document === 'undefined'`) and if called
 * more than once (idempotent — logs a dev warning on the second call
 * instead of duplicating the button).
 */
export function mountIaFrontRefAssistant(
  definitions?: IaFraConfig,
  options: MountOptions = {}
): MountHandle {
  if (typeof document === 'undefined') {
    return NOOP_HANDLE;
  }

  if (document.querySelector(`[${MOUNT_MARKER}]`)) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(
        '[ia-front-ref-assistant] mountIaFrontRefAssistant() ya fue llamado ' +
        'antes en esta página; ignorando esta llamada para no duplicar el widget.'
      );
    }
    return NOOP_HANDLE;
  }

  ensureStylesInjected();

  const ownsContainer = !options.container;
  const container = options.container ?? document.createElement('div');
  container.setAttribute(MOUNT_MARKER, '');
  if (ownsContainer) {
    document.body.appendChild(container);
  }

  const root: Root = createRoot(container);
  root.render(createElement(IaFrontRefAssistant, { definitions }));

  return {
    unmount: () => {
      root.unmount();
      container.removeAttribute(MOUNT_MARKER);
      if (ownsContainer && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
  };
}
