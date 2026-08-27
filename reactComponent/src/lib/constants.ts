export const ATTR_SECTION = 'data-section-id';
export const ATTR_WRAPPER = 'data-wrapper-id';
export const ATTR_COMPONENT = 'data-component-id';
export const ATTR_COMPONENT_KIND = 'data-component-kind';
export const ATTR_ROUTE = 'data-route';
export const ATTR_SOURCE_FILE = 'data-source-file';
export const ATTR_SOURCE_LINE = 'data-source-line';
export const ATTR_COMPONENT_NAME = 'data-component-name';

/** Attributes available to include in copied frontend references. */
export const AIUI_REFERENCE_ATTRIBUTES = [
  'id', 'role', 'aria-label', 'aria-labelledby', 'aria-describedby', 'href',
  'type', 'name', 'placeholder', 'data-section-id', 'data-wrapper-id',
  'data-component-id', 'data-component-kind', 'data-component-name',
  'data-route', 'data-source-file', 'data-source-line',
] as const;

export type AIUIReferenceAttribute = typeof AIUI_REFERENCE_ATTRIBUTES[number];

export const STORAGE_KEY_CONFIG = 'ia-fra:config';
export const STORAGE_KEY_PROMPTS = 'ia-fra:prompts';
export const STORAGE_VERSION = 1; // para futuras migraciones

// Heurística de "elemento individual" (fase 4 la consume)
export const LEAF_TAGS = [
  'button', 'a', 'input', 'select', 'textarea', 'img',
  'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
] as const;

export const TEXT_CONTAINER_TAGS = ['span', 'p', 'li'] as const;

export const HOVER_CLOSE_DELAY_MS = 2000;

// Flags sin operación para apagado total (fase 7)
export const NOOP_CAPTURE_FLAGS = { sections: false, components: false, wrappers: false, elements: false };
export const NOOP_SHOW_FLAGS = { sections: false, components: false, wrappers: false };
