import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssistantProvider } from './AssistantProvider';
import { useAssistant } from './AssistantContext';

function TestComponent() {
  const { config, prompts, toggleActive, addPrompt, clearPrompts } = useAssistant();
  return (
    <div>
      <div data-testid="active">{config.active ? 'active' : 'inactive'}</div>
      <div data-testid="prompts-count">{prompts.length}</div>
      <div data-testid="requests-count">{prompts.reduce((total, prompt) => total + (prompt.requestCount ?? 1), 0)}</div>
      <button onClick={toggleActive}>Toggle</button>
      <button
        onClick={() =>
          addPrompt({
            targetId: 'test-id',
            targetType: 'element',
            url: 'http://test.com',
            text: 'test text',
          })
        }
      >
        Add Prompt
      </button>
      <button onClick={clearPrompts}>Clear</button>
    </div>
  );
}

describe('AssistantProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('monta correctamente con children', () => {
    render(
      <AssistantProvider>
        <div>Test Child</div>
      </AssistantProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('arranca con DEFAULT_CONFIG cuando no hay nada en storage', () => {
    render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );
    expect(screen.getByTestId('active')).toHaveTextContent('active');
    expect(screen.getByTestId('prompts-count')).toHaveTextContent('0');
  });

  it('toggleActive invierte active y persiste en localStorage', async () => {
    const { rerender } = render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    const toggle = screen.getByText('Toggle');
    expect(screen.getByTestId('active')).toHaveTextContent('active');

    toggle.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    rerender(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    expect(screen.getByTestId('active')).toHaveTextContent('inactive');

    const stored = localStorage.getItem('ia-fra:config');
    expect(stored).toBeTruthy();
    const config = JSON.parse(stored!);
    expect(config.active).toBe(false);
  });

  it('addPrompt incrementa prompts.length', async () => {
    render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    expect(screen.getByTestId('prompts-count')).toHaveTextContent('0');

    const addBtn = screen.getByText('Add Prompt');
    addBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.getByTestId('prompts-count')).toHaveTextContent('1');
  });

  it('clearPrompts vuelve prompts a 0', async () => {
    render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    const addBtn = screen.getByText('Add Prompt');
    addBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId('prompts-count')).toHaveTextContent('1');

    const clearBtn = screen.getByText('Clear');
    clearBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId('prompts-count')).toHaveTextContent('0');
  });

  it('recupera config guardada de localStorage en mount', () => {
    const savedConfig = {
      active: false,
      capture: { sections: true, components: false, elements: false },
      show: { sections: false, components: false },
    };
    localStorage.setItem('ia-fra:config', JSON.stringify(savedConfig));

    render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    expect(screen.getByTestId('active')).toHaveTextContent('inactive');
  });

  it('tolera config vieja sin capture.elements', () => {
    const oldConfig = {
      active: true,
      capture: { sections: true, components: false },
      show: { sections: false, components: false },
    };
    localStorage.setItem('ia-fra:config', JSON.stringify(oldConfig));

    render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    expect(screen.getByTestId('active')).toHaveTextContent('active');
    const stored = localStorage.getItem('ia-fra:config');
    const config = JSON.parse(stored!);
    expect(config.capture.elements).toBe(false);
  });

  it('persiste prompts en localStorage', async () => {
    render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    const addBtn = screen.getByText('Add Prompt');
    addBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const stored = localStorage.getItem('ia-fra:prompts');
    expect(stored).toBeTruthy();
    const prompts = JSON.parse(stored!);
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toMatchObject({
      targetId: 'test-id',
      targetType: 'element',
      url: 'http://test.com',
      text: 'test text',
    });
    expect(prompts[0].id).toBeDefined();
    expect(prompts[0].createdAt).toBeDefined();
    expect(prompts[0].requestCount).toBe(1);
  });

  it('mantiene el contador individual aunque agrupe solicitudes del mismo target', async () => {
    render(
      <AssistantProvider>
        <TestComponent />
      </AssistantProvider>
    );

    const addBtn = screen.getByText('Add Prompt');
    addBtn.click();
    addBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.getByTestId('prompts-count')).toHaveTextContent('1');
    expect(screen.getByTestId('requests-count')).toHaveTextContent('2');

    const stored = JSON.parse(localStorage.getItem('ia-fra:prompts')!);
    expect(stored[0].requestCount).toBe(2);
    expect(stored[0].text).toBe('test text\n\ntest text');
  });
});
