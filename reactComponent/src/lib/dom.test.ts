import { describe, it, expect, beforeEach } from 'vitest';
import { ATTR_WRAPPER, ATTR_COMPONENT } from './constants';
import { getWrapperElements, getComponentElements, getCaptureWrapperElements, findIndividualElements, buildRelativeId, getTargetContext } from './dom';

describe('DOM functions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('getWrapperElements finds wrappers in document', () => {
    const container = document.createElement('div');
    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');
    container.appendChild(wrap1);
    document.body.appendChild(container);

    const wrappers = getWrapperElements();
    expect(wrappers.length).toBe(1);
    expect(wrappers[0].getAttribute(ATTR_WRAPPER)).toBe('wrap-1');
  });

  it('getComponentElements finds components in document', () => {
    const container = document.createElement('div');
    const comp1 = document.createElement('div');
    comp1.setAttribute(ATTR_COMPONENT, 'comp-1');
    container.appendChild(comp1);
    document.body.appendChild(container);

    const components = getComponentElements();
    expect(components.length).toBe(1);
    expect(components[0].getAttribute(ATTR_COMPONENT)).toBe('comp-1');
  });

  it('findIndividualElements finds button', () => {
    const wrap = document.createElement('div');
    wrap.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const button = document.createElement('button');
    button.textContent = 'Click';
    wrap.appendChild(button);

    document.body.appendChild(wrap);

    const elements = findIndividualElements(wrap);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(elements.some(el => el.tagName.toLowerCase() === 'button')).toBe(true);
  });

  it('findIndividualElements finds span with text', () => {
    const wrap = document.createElement('div');
    wrap.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const span = document.createElement('span');
    span.textContent = 'Text';
    wrap.appendChild(span);

    document.body.appendChild(wrap);

    const elements = findIndividualElements(wrap);
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(elements.some(el => el.tagName.toLowerCase() === 'span')).toBe(true);
  });

  it('findIndividualElements ignores empty span', () => {
    const wrap = document.createElement('div');
    wrap.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const emptySpan = document.createElement('span');
    wrap.appendChild(emptySpan);

    document.body.appendChild(wrap);

    const elements = findIndividualElements(wrap);
    // Should not include the empty span
    const hasEmptySpan = elements.some(el =>
      el.tagName.toLowerCase() === 'span' && !el.textContent?.trim()
    );
    expect(hasEmptySpan).toBe(false);
  });

  it('buildRelativeId generates deterministic paths', () => {
    const wrap = document.createElement('div');
    wrap.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const btn1 = document.createElement('button');
    btn1.textContent = 'First';
    const btn2 = document.createElement('button');
    btn2.textContent = 'Second';

    wrap.appendChild(btn1);
    wrap.appendChild(btn2);
    document.body.appendChild(wrap);

    const id1 = buildRelativeId(btn1, wrap, 'wrap-1');
    const id2 = buildRelativeId(btn2, wrap, 'wrap-1');

    expect(id1).toContain('wrap:wrap-1');
    expect(id1).toContain('button:nth-of-type(1)');
    expect(id2).toContain('wrap:wrap-1');
    expect(id2).toContain('button:nth-of-type(2)');
    expect(id1).not.toBe(id2);
  });

  it('respects nested boundaries', () => {
    const wrap = document.createElement('div');
    wrap.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const btn = document.createElement('button');
    btn.textContent = 'Outside';
    wrap.appendChild(btn);

    const nestedComp = document.createElement('div');
    nestedComp.setAttribute(ATTR_COMPONENT, 'comp-1');
    const nestedBtn = document.createElement('button');
    nestedBtn.textContent = 'Inside';
    nestedComp.appendChild(nestedBtn);
    wrap.appendChild(nestedComp);

    document.body.appendChild(wrap);

    // Should find button outside but not the one in nested component
    const elements = findIndividualElements(wrap);
    expect(elements.length).toBe(1);
    expect(elements[0]).toBe(btn);
  });

  it('captures only declared visual styles, not browser-computed defaults', () => {
    const style = document.createElement('style');
    style.textContent = '.card { display: flex; color: red; border-radius: 8px; }';
    document.head.appendChild(style);
    const card = document.createElement('div');
    card.className = 'card';
    document.body.appendChild(card);

    const context = getTargetContext(card);
    expect(context.styles).toMatchObject({ display: 'flex', color: 'red', 'border-radius': '8px' });
    expect(context.styles.position).toBeUndefined();

    style.remove();
  });

  it('detecta wrappers genericos como un span que agrupa icono y texto', () => {
    const group = document.createElement('span');
    group.appendChild(document.createElement('svg'));
    group.appendChild(document.createTextNode('Guardar'));
    document.body.appendChild(group);

    const wrappers = getCaptureWrapperElements();
    expect(wrappers).toContain(group);
    expect(group.getAttribute(ATTR_WRAPPER)).toMatch(/^wrapper-/);
  });

  it('allows the project config to limit reference attributes', () => {
    const link = document.createElement('a');
    link.id = 'docs-link';
    link.href = '/docs';
    link.setAttribute('data-route', '/home');
    document.body.appendChild(link);

    const context = getTargetContext(link, ['id']);
    expect(context.attributes).toEqual({ id: 'docs-link' });
    expect(context.semantic.href).toBeUndefined();
  });

  it('can omit semantic boolean states from the reference', () => {
    const button = document.createElement('button');
    button.disabled = true;
    document.body.appendChild(button);
    expect(getTargetContext(button, undefined, false).semantic.states).toEqual({});
  });
});
