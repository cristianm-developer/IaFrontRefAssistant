import type { TargetType } from './types';
import { ATTR_SECTION, ATTR_WRAPPER, ATTR_COMPONENT, ATTR_COMPONENT_KIND, ATTR_COMPONENT_NAME, ATTR_ROUTE, ATTR_SOURCE_FILE, ATTR_SOURCE_LINE, AIUI_REFERENCE_ATTRIBUTES, LEAF_TAGS, TEXT_CONTAINER_TAGS } from './constants';
import type { AIUIReferenceAttribute } from './constants';

export interface TrackedTarget {
  el: Element;
  id: string;         // valor real (wrapper/component) o id runtime (elemento)
  type: TargetType;    // 'section' | 'component' | 'element'
  kind?: string;       // solo puede venir presente cuando type === 'component'
}

export interface TargetContext {
  route: string;
  sourceFile?: string;
  sourceLine?: string;
  componentName?: string;
  tagName: string;
  text: string;
  classes: string[];
  attributes: Record<string, string>;
  styles: Record<string, string>;
  semantic: {
    role?: string;
    accessibleName?: string;
    href?: string;
    inputType?: string;
    name?: string;
    placeholder?: string;
    states: Record<string, boolean>;
  };
  parent?: {
    tagName: string;
    id?: string;
    type?: TargetType;
    targetId?: string;
    componentKind?: string;
    classes: string[];
  };
}

const CONTEXT_STATE_KEYS = ['disabled', 'checked', 'selected', 'expanded', 'pressed', 'hidden'] as const;

const CONTEXT_STYLE_KEYS = new Set([
  'display', 'flex-direction', 'align-items', 'justify-content', 'gap',
  'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  'margin', 'padding', 'overflow',
  'color', 'background-color', 'border-color',
  'font-size', 'font-weight', 'line-height',
  'border', 'border-radius',
]);

function addDeclaredStyles(styles: Record<string, string>, declaration: CSSStyleDeclaration): void {
  for (let index = 0; index < declaration.length; index += 1) {
    const property = declaration.item?.(index) ?? declaration[index];
    if (CONTEXT_STYLE_KEYS.has(property)) {
      styles[property] = declaration.getPropertyValue(property).trim();
    }
  }
}

function collectDeclaredStyles(el: Element): Record<string, string> {
  const styles: Record<string, string> = {};
  if (el instanceof HTMLElement) addDeclaredStyles(styles, el.style);

  const sheets = Array.from(el.ownerDocument.styleSheets);
  for (const sheet of sheets) {
    try {
      const visit = (ruleList: CSSRuleList | undefined) => {
        if (!ruleList) return;
        for (let index = 0; index < ruleList.length; index += 1) {
          const rule = ruleList.item?.(index) ?? ruleList[index];
          if (!rule) continue;
          if (rule.type === 1) {
            const cssRule = rule as CSSStyleRule;
            if (el.matches(cssRule.selectorText)) addDeclaredStyles(styles, cssRule.style);
          } else if (rule.type === 4 || rule.type === 12) {
            visit((rule as CSSMediaRule | CSSSupportsRule).cssRules);
          }
        }
      };
      visit(sheet.cssRules);
    } catch {
      // Cross-origin stylesheets do not expose cssRules; inline/class metadata
      // remains available and the reference should still be usable.
    }
  }
  return styles;
}

export function getTargetContext(
  el: Element,
  referenceAttributes: readonly AIUIReferenceAttribute[] = AIUI_REFERENCE_ATTRIBUTES,
  includeSemanticState = true,
): TargetContext {
  const contextAttributes = new Set(referenceAttributes);
  const attributes: Record<string, string> = {};
  for (const attribute of Array.from(el.attributes)) {
    if (contextAttributes.has(attribute.name as AIUIReferenceAttribute)) {
      attributes[attribute.name] = attribute.value;
    }
  }
  const styles = collectDeclaredStyles(el);
  const semantic = {
    role: contextAttributes.has('role') ? el.getAttribute('role') ?? undefined : undefined,
    accessibleName: contextAttributes.has('aria-label') ? el.getAttribute('aria-label') ?? ((el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 160) || undefined) : undefined,
    href: contextAttributes.has('href') ? el.getAttribute('href') ?? undefined : undefined,
    inputType: contextAttributes.has('type') ? el.getAttribute('type') ?? undefined : undefined,
    name: contextAttributes.has('name') ? el.getAttribute('name') ?? undefined : undefined,
    placeholder: contextAttributes.has('placeholder') ? el.getAttribute('placeholder') ?? undefined : undefined,
    states: includeSemanticState
      ? Object.fromEntries(CONTEXT_STATE_KEYS.map((key) => [key, el.hasAttribute(key)]))
      : {},
  };
  const parent = el.parentElement;
  const parentTarget = parent?.closest('[data-section-id], [data-wrapper-id], [data-component-id]');
  const parentType: TargetType | undefined = parentTarget?.hasAttribute(ATTR_COMPONENT)
    ? 'component'
    : parentTarget?.hasAttribute(ATTR_SECTION)
    ? 'section'
    : parentTarget?.hasAttribute(ATTR_WRAPPER)
    ? 'wrapper'
    : undefined;
  return {
    route: el.getAttribute(ATTR_ROUTE) ?? window.location.pathname,
    sourceFile: el.getAttribute(ATTR_SOURCE_FILE) ?? undefined,
    sourceLine: el.getAttribute(ATTR_SOURCE_LINE) ?? undefined,
    componentName: el.getAttribute(ATTR_COMPONENT_NAME) ?? el.getAttribute(ATTR_COMPONENT_KIND) ?? undefined,
    tagName: el.tagName.toLowerCase(),
    text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 500),
    classes: Array.from(el.classList),
    attributes,
    styles,
    semantic,
    parent: parent ? {
      tagName: parent.tagName.toLowerCase(),
      id: parent.getAttribute('id') ?? undefined,
      type: parentType,
      targetId: parentTarget?.getAttribute(ATTR_COMPONENT) ?? parentTarget?.getAttribute(ATTR_SECTION) ?? parentTarget?.getAttribute(ATTR_WRAPPER) ?? undefined,
      componentKind: parentTarget?.getAttribute(ATTR_COMPONENT_KIND) ?? undefined,
      classes: Array.from(parent.classList),
    } : undefined,
  };
}

function isAssistantElement(el: Element): boolean {
  return el.closest('.ia-fra-root') !== null;
}

export function getWrapperElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(`[${ATTR_WRAPPER}]`)).filter((el) => !isAssistantElement(el));
}

export function getSectionElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(`[${ATTR_SECTION}]`)).filter((el) => !isAssistantElement(el));
}

export function getComponentElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(`[${ATTR_COMPONENT}]`)).filter((el) => !isAssistantElement(el));
}

function wrapperLabel(el: Element): string {
  const source = el.id || el.getAttribute('aria-label') || el.getAttribute('role') || el.className || el.textContent || 'container';
  const label = String(source).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return label || 'container';
}

export function getCaptureWrapperElements(root: ParentNode = document): Element[] {
  const candidates = Array.from(root.querySelectorAll('div, article, nav, header, footer, main, aside, ul, ol'))
    .filter((el) => !isAssistantElement(el) && !el.hasAttribute(ATTR_SECTION) && !el.hasAttribute(ATTR_WRAPPER) && !el.hasAttribute(ATTR_COMPONENT));
  const used = new Set<string>();
  return candidates.filter((el) => {
    if (el.children.length < 2) return false;
    const base = `wrapper-${wrapperLabel(el)}`;
    let id = base;
    let suffix = 2;
    while (used.has(id) || root.querySelector(`[${ATTR_WRAPPER}="${id}"]`)) id = `${base}-${suffix++}`;
    used.add(id);
    el.setAttribute(ATTR_WRAPPER, id);
    return true;
  });
}

export function hasDirectText(el: Element): boolean {
  // true si el elemento tiene al menos un childNode de tipo TEXT_NODE
  // con contenido no vacío luego de trim() — no cuenta texto que venga
  // solo de descendientes (ese texto pertenece al hijo, no a este nodo).
  return Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0
  );
}

export function isLeafCandidate(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if ((LEAF_TAGS as readonly string[]).includes(tag)) return true;
  if ((TEXT_CONTAINER_TAGS as readonly string[]).includes(tag)) {
    return hasDirectText(el);
  }
  return false;
}

export function findIndividualElements(scopeRoot: Element): Element[] {
  // recorre descendientes de scopeRoot (un wrapper o componente capturado),
  // sin entrar a subtrees que sean a su vez [data-wrapper-id] o
  // [data-component-id] anidados (esos elementos pertenecen a SU PROPIO
  // scope, no al del padre) — se listan aparte cuando se procesa ese scope.
  const results: Element[] = [];
  const walker = document.createTreeWalker(scopeRoot, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const el = node as Element;
      if (el !== scopeRoot && (el.hasAttribute(ATTR_WRAPPER) || el.hasAttribute(ATTR_COMPONENT))) {
        return NodeFilter.FILTER_REJECT; // no entra a este subtree
      }
      return NodeFilter.FILTER_ACCEPT; // acepta el nodo para iteración
    },
  });
  let current = walker.nextNode();
  while (current) {
    const el = current as Element;
    if (isLeafCandidate(el)) results.push(el);
    current = walker.nextNode();
  }
  return results;
}

export function buildRelativeId(el: Element, scopeRoot: Element, scopeId: string): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== scopeRoot) {
    const tag = node.tagName.toLowerCase();
    const parent = node.parentElement;
    const index = parent
      ? Array.from(parent.children).filter((c) => c.tagName === node!.tagName).indexOf(node) + 1
      : 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    node = node.parentElement;
  }
  const prefix = scopeRoot.hasAttribute(ATTR_COMPONENT) ? 'comp' : 'wrap';
  return [`${prefix}:${scopeId}`, ...parts].join(' > ');
}
