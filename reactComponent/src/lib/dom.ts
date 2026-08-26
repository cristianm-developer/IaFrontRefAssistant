import type { TargetType } from './types';
import { ATTR_WRAPPER, ATTR_COMPONENT, ATTR_CAPTURE_WRAPPER, LEAF_TAGS, TEXT_CONTAINER_TAGS } from './constants';

export interface TrackedTarget {
  el: Element;
  id: string;         // valor real (wrapper/component) o id runtime (elemento)
  type: TargetType;    // 'section' | 'component' | 'element'
  kind?: string;       // solo puede venir presente cuando type === 'component'
}

export function getWrapperElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(`[${ATTR_WRAPPER}]`));
}

export function getComponentElements(root: ParentNode = document): Element[] {
  return Array.from(root.querySelectorAll(`[${ATTR_COMPONENT}]`));
}

function wrapperLabel(el: Element): string {
  const source = el.id || el.getAttribute('aria-label') || el.getAttribute('role') || el.className || el.textContent || 'container';
  const label = String(source).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return label || 'container';
}

export function getCaptureWrapperElements(root: ParentNode = document): Element[] {
  const candidates = Array.from(root.querySelectorAll('div, article, nav, header, footer, main, aside, ul, ol'))
    .filter((el) => !el.hasAttribute(ATTR_WRAPPER) && !el.hasAttribute(ATTR_COMPONENT) && !el.hasAttribute(ATTR_CAPTURE_WRAPPER));
  const used = new Set<string>();
  return candidates.filter((el) => {
    if (el.children.length < 2) return false;
    const base = `wrapper-${wrapperLabel(el)}`;
    let id = base;
    let suffix = 2;
    while (used.has(id) || root.querySelector(`[${ATTR_CAPTURE_WRAPPER}="${id}"]`)) id = `${base}-${suffix++}`;
    used.add(id);
    el.setAttribute(ATTR_CAPTURE_WRAPPER, id);
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
