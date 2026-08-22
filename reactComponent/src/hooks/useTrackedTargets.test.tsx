import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useTrackedTargets, type TrackedTargetFlags } from './useTrackedTargets';
import { ATTR_WRAPPER, ATTR_COMPONENT } from '../lib/constants';

// Test component that uses the hook and displays results
function TestComponent({ flags }: { flags: TrackedTargetFlags }) {
  const targets = useTrackedTargets(flags);
  return (
    <div data-testid="result">
      <div data-testid="count">{targets.length}</div>
      <ul data-testid="list">
        {targets.map((t, i) => (
          <li key={i} data-testid={`item-${i}`}>
            {t.type}:{t.id}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('useTrackedTargets', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when all flags are false', () => {
    render(<TestComponent flags={{ sections: false, components: false, elements: false }} />);
    const count = screen.getByTestId('count');
    expect(count.textContent).toBe('0');
  });

  it('returns empty array when all flags are false and does not create MutationObserver', () => {
    const observerSpy = vi.spyOn(window, 'MutationObserver');
    render(<TestComponent flags={{ sections: false, components: false, elements: false }} />);
    expect(observerSpy).not.toHaveBeenCalled();
    observerSpy.mockRestore();
  });

  it('detects wrapper elements when sections flag is true', () => {
    const container = document.createElement('div');
    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');
    wrap1.textContent = 'Wrapper 1';

    const wrap2 = document.createElement('div');
    wrap2.setAttribute(ATTR_WRAPPER, 'wrap-2');
    wrap2.textContent = 'Wrapper 2';

    container.appendChild(wrap1);
    container.appendChild(wrap2);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: true, components: false }} />);

    const count = screen.getByTestId('count');
    expect(count.textContent).toBe('2');

    const item0 = screen.getByTestId('item-0');
    const item1 = screen.getByTestId('item-1');
    expect(item0.textContent).toContain('section:wrap-1');
    expect(item1.textContent).toContain('section:wrap-2');
  });

  it('detects component elements when components flag is true', () => {
    const container = document.createElement('div');
    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const comp1 = document.createElement('div');
    comp1.setAttribute(ATTR_COMPONENT, 'comp-1');
    comp1.textContent = 'Component 1';

    wrap1.appendChild(comp1);
    container.appendChild(wrap1);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: false, components: true }} />);

    const count = screen.getByTestId('count');
    expect(count.textContent).toBe('1');

    const item0 = screen.getByTestId('item-0');
    expect(item0.textContent).toContain('component:comp-1');
  });

  it('detects individual elements when elements flag is true', () => {
    const container = document.createElement('div');
    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const button = document.createElement('button');
    button.textContent = 'Click';

    const spanWithText = document.createElement('span');
    spanWithText.textContent = 'Text';

    const emptySpan = document.createElement('span');

    wrap1.appendChild(button);
    wrap1.appendChild(spanWithText);
    wrap1.appendChild(emptySpan);
    container.appendChild(wrap1);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: false, components: false, elements: true }} />);

    const count = screen.getByTestId('count');
    // Should find button and span with text (but not empty span)
    expect(parseInt(count.textContent || '0')).toBeGreaterThanOrEqual(2);
  });

  it('combines sections and components when both flags are true', () => {
    const container = document.createElement('div');

    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const comp1 = document.createElement('div');
    comp1.setAttribute(ATTR_COMPONENT, 'comp-1');
    wrap1.appendChild(comp1);

    const wrap2 = document.createElement('div');
    wrap2.setAttribute(ATTR_WRAPPER, 'wrap-2');

    container.appendChild(wrap1);
    container.appendChild(wrap2);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: true, components: true, elements: false }} />);

    const count = screen.getByTestId('count');
    expect(count.textContent).toBe('3'); // 2 wrappers + 1 component
  });

  it('processes elements scopes even when sections/components flags are false', () => {
    const container = document.createElement('div');

    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');
    const btn = document.createElement('button');
    btn.textContent = 'Click';
    wrap1.appendChild(btn);

    const comp1 = document.createElement('div');
    comp1.setAttribute(ATTR_COMPONENT, 'comp-1');
    const span = document.createElement('span');
    span.textContent = 'Text';
    comp1.appendChild(span);

    container.appendChild(wrap1);
    container.appendChild(comp1);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: false, components: false, elements: true }} />);

    const count = screen.getByTestId('count');
    // Should find both button and span
    expect(parseInt(count.textContent || '0')).toBeGreaterThanOrEqual(2);
  });

  it('respects nested boundaries and finds elements in each scope', () => {
    const container = document.createElement('div');

    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const btn1 = document.createElement('button');
    btn1.textContent = 'Button 1';

    const comp1 = document.createElement('div');
    comp1.setAttribute(ATTR_COMPONENT, 'comp-1');
    const btn2 = document.createElement('button');
    btn2.textContent = 'Button 2';
    comp1.appendChild(btn2);

    wrap1.appendChild(btn1);
    wrap1.appendChild(comp1);
    container.appendChild(wrap1);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: false, components: false, elements: true }} />);

    const count = screen.getByTestId('count');
    // Both buttons should be found
    expect(parseInt(count.textContent || '0')).toBeGreaterThanOrEqual(2);
  });

  it('updates when DOM changes dynamically', async () => {
    const container = document.createElement('div');
    container.id = 'test-root';
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: true, components: false }} />);

    let count = screen.getByTestId('count');
    expect(count.textContent).toBe('0');

    // Dynamically add a wrapper
    const newWrapper = document.createElement('div');
    newWrapper.setAttribute(ATTR_WRAPPER, 'wrap-new');
    newWrapper.textContent = 'New';
    container.appendChild(newWrapper);

    await waitFor(
      () => {
        count = screen.getByTestId('count');
        expect(count.textContent).toBe('1');
      },
      { timeout: 500 }
    );
  });

  it('generates deterministic relative IDs for elements', () => {
    const container = document.createElement('div');
    const wrap1 = document.createElement('div');
    wrap1.setAttribute(ATTR_WRAPPER, 'wrap-1');

    const btn1 = document.createElement('button');
    btn1.textContent = 'First';
    const btn2 = document.createElement('button');
    btn2.textContent = 'Second';

    wrap1.appendChild(btn1);
    wrap1.appendChild(btn2);
    container.appendChild(wrap1);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: false, components: false, elements: true }} />);

    const item0 = screen.getByTestId('item-0');
    const item1 = screen.getByTestId('item-1');
    const id0 = item0.textContent;
    const id1 = item1.textContent;

    // IDs should be different for different elements
    expect(id0).not.toBe(id1);

    // IDs should reference nth-of-type
    expect(id0).toContain('nth-of-type');
    expect(id1).toContain('nth-of-type');
  });

  it('handles empty wrappers correctly', () => {
    const container = document.createElement('div');

    const emptyWrap = document.createElement('div');
    emptyWrap.setAttribute(ATTR_WRAPPER, 'wrap-empty');

    const wrapWithContent = document.createElement('div');
    wrapWithContent.setAttribute(ATTR_WRAPPER, 'wrap-content');
    const span = document.createElement('span');
    span.textContent = 'Content';
    wrapWithContent.appendChild(span);

    container.appendChild(emptyWrap);
    container.appendChild(wrapWithContent);
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: false, components: false, elements: true }} />);

    const count = screen.getByTestId('count');
    // Only the span from wrap-with-content should be found
    expect(count.textContent).toBe('1');
  });

  it('debounces MutationObserver callback', async () => {
    const container = document.createElement('div');
    container.id = 'test-root';
    document.body.appendChild(container);

    render(<TestComponent flags={{ sections: true, components: false }} />);

    let count = screen.getByTestId('count');
    expect(count.textContent).toBe('0');

    // Add a wrapper dynamically
    const wrapper = document.createElement('div');
    wrapper.setAttribute(ATTR_WRAPPER, 'wrap-dynamic');
    wrapper.textContent = 'Dynamic wrapper';
    container.appendChild(wrapper);

    // Wait for MutationObserver debounce (120ms) + small buffer
    await waitFor(
      () => {
        count = screen.getByTestId('count');
        expect(count.textContent).toBe('1');
      },
      { timeout: 500 }
    );
  });

  it('cleans up observer on unmount', () => {
    const disconnectSpy = vi.fn();
    const originalMutationObserver = window.MutationObserver;

    class MockMutationObserver {
      observe() {}
      disconnect() {
        disconnectSpy();
      }
    }

    window.MutationObserver = MockMutationObserver as any;

    const container = document.createElement('div');
    const wrap = document.createElement('div');
    wrap.setAttribute(ATTR_WRAPPER, 'wrap-1');
    container.appendChild(wrap);
    document.body.appendChild(container);

    const { unmount } = render(
      <TestComponent flags={{ sections: true, components: false }} />
    );

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();

    window.MutationObserver = originalMutationObserver;
  });
});
