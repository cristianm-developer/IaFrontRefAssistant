'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AssistantContext, useAssistant } from './context/AssistantContext';
import { AssistantProvider } from './context/AssistantProvider';
import { useHoverCloseTimer } from './hooks/useHoverCloseTimer';
import { useTrackedTargets } from './hooks/useTrackedTargets';
import { useHoveredTarget } from './components/Overlay/useHoveredTarget';
import { copyText } from './lib/clipboard';
import { formatQueueForClipboard } from './lib/promptFormat';
import { FloatingButton } from './components/FloatingButton';
import { Menu } from './components/Menu/Menu';
import { MenuItem } from './components/Menu/MenuItem';
import { ToggleRow } from './components/Menu/ToggleRow';
import { SubMenu } from './components/Menu/SubMenu';
import { ActionRow } from './components/Menu/ActionRow';
import { CaptureOverlay } from './components/Overlay/CaptureOverlay';
import { ShowOverlay } from './components/Overlay/ShowOverlay';
import { PromptModal } from './components/PromptModal/PromptModal';
import type { TrackedTarget } from './lib/dom';
import type { IaFraConfig } from './config/types';
import { NOOP_CAPTURE_FLAGS, NOOP_SHOW_FLAGS } from './lib/constants';

export interface IaFrontRefAssistantProps {
  // Opcional: el widget flotante se renderiza vía portal a document.body
  // independientemente de los children — no necesita envolver el árbol de
  // la app para funcionar (útil para mountIaFrontRefAssistant(), ver mount.ts).
  children?: React.ReactNode;
  definitions?: IaFraConfig;
}

export function IaFrontRefAssistant({ children, definitions }: IaFrontRefAssistantProps) {
  // Chequeo crudo (no useAssistant(), que tira si no hay provider): si ya
  // hay una instancia más arriba, esta es anidada — no duplicar provider/UI.
  const existing = useContext(AssistantContext);
  if (existing) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(
        '[ia-front-ref-assistant] <IaFrontRefAssistant> ya está montado más ' +
        'arriba en el árbol; esta instancia anidada no vuelve a montar el ' +
        'botón/menú, solo renderiza sus children.'
      );
    }
    return <>{children}</>;
  }

  return (
    <AssistantProvider>
      <AssistantRoot definitions={definitions}>{children}</AssistantRoot>
    </AssistantProvider>
  );
}

function AssistantRoot({
  children,
  definitions,
}: {
  children: React.ReactNode;
  definitions?: IaFraConfig;
}) {
  const { config, prompts, ...actions } = useAssistant();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const widgetRootRef = useRef<HTMLDivElement>(null);
  const capturarRef = useRef<HTMLDivElement>(null);
  const modoPromptRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<'capturar' | 'modo-prompt' | null>(null);
  const [modalTarget, setModalTarget] = useState<TrackedTarget | null>(null);
  const [justCopied, setJustCopied] = useState(false);

  // Client-only: en servidor / primer render de cliente no existe
  // document.body, y hay que coincidir exactamente con el server render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cierra menú Y submenú juntos (fase 3): click afuera, Escape, o el timer
  // de 2s deben resetear ambos estados, no solo menuOpen.
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  }, []);

  function toggleSubmenu(key: 'capturar' | 'modo-prompt') {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  }

  // Wrapper único botón+menú(+submenú) para el timer de cierre de 2s — ver
  // fase 2, sección "Dónde se conecta useHoverCloseTimer".
  const hoverHandlers = useHoverCloseTimer({ active: menuOpen, onClose: closeMenu });

  // Apagado total: si !config.active, no se monta NINGÚN overlay ni se
  // corre NINGÚN useTrackedTargets/useHoveredTarget de fondo. El único
  // elemento que sigue vivo es el botón (para poder reactivar).
  const captureTargets = useTrackedTargets(config.active ? config.capture : NOOP_CAPTURE_FLAGS);
  const showTargets = useTrackedTargets(config.active ? config.show : NOOP_SHOW_FLAGS);
  // Cada modo resuelve su propio target más específico. Si se mezclan ambas
  // listas, un componente configurado solo para "Mostrar" puede ganar sobre
  // una sección configurada para "Capturar" y ocultar accidentalmente el
  // hover/label de captura.
  const captureHovered = useHoveredTarget(config.active ? captureTargets : []);
  const showHovered = useHoveredTarget(config.active ? showTargets : []);

  // El overlay solo sirve como feedback visual. La selección se hace en
  // captura sobre el documento para que cualquier click dentro del target
  // cuente, incluso cuando el label flotante queda fuera del hover. También
  // interceptamos el click original mientras el asistente está activo para
  // evitar activar accidentalmente botones, links o inputs de la página.
  useEffect(() => {
    if (!config.active || captureTargets.length === 0) return;

    const onDocumentClick = (event: MouseEvent) => {
      const hit = event.target;
      if (!(hit instanceof Element)) return;
      // El widget vive en un portal propio. Usar la referencia evita que el
      // listener global intercepte los clicks del botón/menú del asistente,
      // especialmente en integraciones donde Preact y Astro tienen roots
      // distintos.
      if (widgetRootRef.current?.contains(hit)) return;

      let selected: TrackedTarget | null = null;
      let selectedDepth = Number.POSITIVE_INFINITY;

      for (const target of captureTargets) {
        if (target.el !== hit && !target.el.contains(hit)) continue;

        let depth = 0;
        let node: Element | null = hit;
        while (node && node !== target.el) {
          depth += 1;
          node = node.parentElement;
        }
        if (node === target.el && depth < selectedDepth) {
          selected = target;
          selectedDepth = depth;
        }
      }

      if (!selected) return;
      event.preventDefault();
      event.stopPropagation();
      setModalTarget(selected);
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, [config.active, captureTargets]);

  // Compartida entre FloatingButton.onCtrlAltClick y el ActionRow "Copiar
  // fila de prompts" del submenú "Modo prompt" (fase 3/6). No vacía la fila
  // si copyText falla, para no perder prompts guardados. Incluye el
  // feedback visual "¡Copiado!" (fase 3).
  const handleCopyAndClear = useCallback(async () => {
    if (prompts.length === 0) return;
    const ok = await copyText(formatQueueForClipboard(prompts));
    if (ok) {
      actions.clearPrompts();
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1200);
    }
  }, [prompts, actions]);

  const handleSavePrompt = useCallback(
    (text: string) => {
      if (!modalTarget) return;
      try {
        actions.addPrompt({
          targetId: modalTarget.id,
          targetType: modalTarget.type,
          url: window.location.href,
          text,
        });
        setModalTarget(null);
      } catch (err) {
        console.error('[ia-front-ref-assistant] Error saving prompt:', err);
        // No cierra el modal si hay error, para permitir reintentar
      }
    },
    [modalTarget, actions]
  );

  const promptCount = prompts.reduce((total, prompt) => total + (prompt.requestCount ?? 1), 0);

  const floatingUI = (
    <div
      ref={widgetRootRef}
      className="ia-fra-root"
      onMouseEnter={hoverHandlers.onMouseEnter}
      onMouseLeave={hoverHandlers.onMouseLeave}
    >
      <FloatingButton
        ref={buttonRef}
        active={config.active}
        open={menuOpen}
        badgeCount={promptCount}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onCtrlClick={actions.toggleActive}
        onCtrlAltClick={handleCopyAndClear}
      />
      <Menu open={menuOpen} anchorRef={buttonRef} onRequestClose={closeMenu}>
        <ToggleRow label="Activo" checked={config.active} onChange={actions.setActive} />
        <MenuItem
          ref={capturarRef}
          label="Capturar"
          hasChildren
          expanded={openSubmenu === 'capturar'}
          onClick={() => toggleSubmenu('capturar')}
        >
          {openSubmenu === 'capturar' && (
            <SubMenu anchorRef={capturarRef}>
              <ToggleRow
                label="Capturar secciones"
                checked={config.capture.sections}
                onChange={(v) => actions.setCaptureFlag('sections', v)}
              />
              <ToggleRow
                label="Capturar wrappers"
                checked={config.capture.wrappers}
                onChange={(v) => actions.setCaptureFlag('wrappers', v)}
              />
              <ToggleRow
                label="Capturar componentes"
                checked={config.capture.components}
                onChange={(v) => actions.setCaptureFlag('components', v)}
              />
              <ToggleRow
                label="Capturar elementos individuales"
                checked={config.capture.elements}
                onChange={(v) => actions.setCaptureFlag('elements', v)}
              />
              <ToggleRow
                label="Mostrar todas las secciones"
                checked={config.show.sections}
                onChange={(v) => actions.setShowFlag('sections', v)}
              />
              <ToggleRow
                label="Mostrar todos los wrappers"
                checked={config.show.wrappers}
                onChange={(v) => actions.setShowFlag('wrappers', v)}
              />
              <ToggleRow
                label="Mostrar todos los componentes"
                checked={config.show.components}
                onChange={(v) => actions.setShowFlag('components', v)}
              />
            </SubMenu>
          )}
        </MenuItem>
        <MenuItem
          ref={modoPromptRef}
          label="Modo prompt"
          hasChildren
          expanded={openSubmenu === 'modo-prompt'}
          onClick={() => toggleSubmenu('modo-prompt')}
        >
          {openSubmenu === 'modo-prompt' && (
            <SubMenu anchorRef={modoPromptRef}>
              <ActionRow
                label="Vaciar fila de prompts"
                disabled={prompts.length === 0}
                onClick={actions.clearPrompts}
              />
              <ActionRow
                label={justCopied ? '¡Copiado!' : 'Copiar fila de prompts'}
                disabled={prompts.length === 0}
                onClick={handleCopyAndClear}
              />
            </SubMenu>
          )}
        </MenuItem>
      </Menu>
      {config.active && (
        <>
          <CaptureOverlay targets={captureTargets} hovered={captureHovered} onSelect={setModalTarget} />
          <ShowOverlay targets={showTargets} hovered={showHovered} />
        </>
      )}
      {modalTarget && (
        <PromptModal
          target={modalTarget}
          definitions={definitions}
          onClose={() => setModalTarget(null)}
          onSave={handleSavePrompt}
        />
      )}
    </div>
  );

  return (
    <>
      {children}
      {mounted && createPortal(floatingUI, document.body)}
    </>
  );
}
