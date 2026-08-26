'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ATTR_SECTION, ATTR_COMPONENT, ATTR_WRAPPER, ATTR_COMPONENT_KIND } from '../lib/constants';
import { findIndividualElements, getComponentElements, getSectionElements, getWrapperElements, getCaptureWrapperElements, buildRelativeId, type TrackedTarget } from '../lib/dom';

export interface TrackedTargetFlags {
  sections: boolean;
  components: boolean;
  wrappers?: boolean;
  elements?: boolean;
}

export function useTrackedTargets(flags: TrackedTargetFlags): TrackedTarget[] {
  const { sections, components, wrappers = false } = flags;
  const elements = flags.elements ?? false;
  const [targets, setTargets] = useState<TrackedTarget[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scan = useCallback(() => {
    const result: TrackedTarget[] = [];
    const sectionEls = getSectionElements();
    const componentEls = getComponentElements();
    // Los wrappers internos comparten la semántica visual de una sección en
    // el modo "Mostrar": se generan aunque solo esté activo show.sections.
    const generatedWrapperEls = wrappers ? getCaptureWrapperElements() : [];
    const wrapperEls = Array.from(new Set([...getWrapperElements(), ...generatedWrapperEls]));

    if (sections) {
      for (const el of sectionEls) {
        result.push({ el, id: el.getAttribute(ATTR_SECTION) ?? el.getAttribute(ATTR_WRAPPER)!, type: 'section' });
      }
    }
    if (components) {
      for (const el of componentEls) {
        result.push({ el, id: el.getAttribute(ATTR_COMPONENT)!, type: 'component', kind: el.getAttribute(ATTR_COMPONENT_KIND) ?? undefined });
      }
    }
    if (wrappers) {
      for (const el of wrapperEls) {
        result.push({ el, id: el.getAttribute(ATTR_WRAPPER)!, type: 'wrapper' });
      }
    }
    if (elements) {
      const scopeEls = Array.from(new Set([...sectionEls, ...wrapperEls, ...componentEls]));
      for (const scopeEl of scopeEls) {
        const scopeId = scopeEl.hasAttribute(ATTR_COMPONENT)
          ? scopeEl.getAttribute(ATTR_COMPONENT)!
          : scopeEl.hasAttribute(ATTR_SECTION)
          ? scopeEl.getAttribute(ATTR_SECTION)!
          : scopeEl.hasAttribute(ATTR_WRAPPER)
          ? scopeEl.getAttribute(ATTR_WRAPPER)!
          : scopeEl.getAttribute(ATTR_WRAPPER)!;
        for (const leafEl of findIndividualElements(scopeEl)) {
          result.push({ el: leafEl, id: buildRelativeId(leafEl, scopeEl, scopeId), type: 'element' });
        }
      }
    }
    setTargets(result);
  }, [sections, components, wrappers, elements]);

  useEffect(() => {
    if (!sections && !components && !wrappers && !elements) {
      setTargets([]);
      return;
    }
    scan();
    const observer = new MutationObserver(() => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        scan();
        timeoutRef.current = null;
      }, 120);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [ATTR_SECTION, ATTR_WRAPPER, ATTR_COMPONENT, ATTR_COMPONENT_KIND],
    });
    return () => {
      observer.disconnect();
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [sections, components, wrappers, elements, scan]);

  return targets;
}
