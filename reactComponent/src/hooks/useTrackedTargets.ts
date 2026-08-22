'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ATTR_COMPONENT, ATTR_WRAPPER, ATTR_COMPONENT_KIND } from '../lib/constants';
import { findIndividualElements, getComponentElements, getWrapperElements, buildRelativeId, type TrackedTarget } from '../lib/dom';

export interface TrackedTargetFlags {
  sections: boolean;
  components: boolean;
  elements?: boolean;
}

export function useTrackedTargets(flags: TrackedTargetFlags): TrackedTarget[] {
  const { sections, components } = flags;
  const elements = flags.elements ?? false;
  const [targets, setTargets] = useState<TrackedTarget[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scan = useCallback(() => {
    const result: TrackedTarget[] = [];
    const wrapperEls = getWrapperElements();
    const componentEls = getComponentElements();

    if (sections) {
      for (const el of wrapperEls) {
        result.push({ el, id: el.getAttribute(ATTR_WRAPPER)!, type: 'section' });
      }
    }
    if (components) {
      for (const el of componentEls) {
        result.push({ el, id: el.getAttribute(ATTR_COMPONENT)!, type: 'component', kind: el.getAttribute(ATTR_COMPONENT_KIND) ?? undefined });
      }
    }
    if (elements) {
      const scopeEls = [...wrapperEls, ...componentEls];
      for (const scopeEl of scopeEls) {
        const scopeId = scopeEl.hasAttribute(ATTR_COMPONENT)
          ? scopeEl.getAttribute(ATTR_COMPONENT)!
          : scopeEl.getAttribute(ATTR_WRAPPER)!;
        for (const leafEl of findIndividualElements(scopeEl)) {
          result.push({ el: leafEl, id: buildRelativeId(leafEl, scopeEl, scopeId), type: 'element' });
        }
      }
    }
    setTargets(result);
  }, [sections, components, elements]);

  useEffect(() => {
    if (!sections && !components && !elements) {
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
      attributeFilter: [ATTR_WRAPPER, ATTR_COMPONENT, ATTR_COMPONENT_KIND],
    });
    return () => {
      observer.disconnect();
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [sections, components, elements, scan]);

  return targets;
}
