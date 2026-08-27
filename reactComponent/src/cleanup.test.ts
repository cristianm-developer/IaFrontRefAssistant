import { describe, expect, it } from 'vitest';
import { AIUIReactAssistCleanup, cleanupAIUIHtml, withAIUIReactAssistCleanup } from './cleanup';

describe('AIUI cleanup', () => {
  it('removes assistant metadata only from HTML tags', () => {
    const html = '<main data-section-id="hero" class="hero"><p data-component-id="title">Hello</p><script>const x = "data-route=keep"</script></main>';
    expect(cleanupAIUIHtml(html)).toBe('<main class="hero"><p>Hello</p><script>const x = "data-route=keep"</script></main>');
  });

  it('supports custom attributes', () => {
    expect(cleanupAIUIHtml('<div data-custom="x" data-wrapper-id="hero"></div>', ['data-custom']))
      .toBe('<div data-wrapper-id="hero"></div>');
  });

  it('keeps selected assistant attributes in production', () => {
    const plugin = AIUIReactAssistCleanup({ keepAttributes: ['data-route', 'data-source-file'] });
    const transform = plugin.transformIndexHtml as ((html: string) => string);
    expect(transform('<main data-route="/home" data-source-file="Home.tsx" data-section-id="hero"></main>'))
      .toBe('<main data-route="/home" data-source-file="Home.tsx"></main>');
  });

  it('returns a production-only Vite plugin', () => {
    const plugin = AIUIReactAssistCleanup();
    expect(plugin.name).toBe('aiui-react-assist-cleanup');
    expect(plugin.apply).toBe('build');
    const transform = plugin.transformIndexHtml as ((html: string) => string);
    expect(transform('<div data-wrapper-id="x"></div>')).toBe('<div></div>');
  });

  it('wraps Next config without enabling cleanup in dev', () => {
    const original = { webpack: (config: any) => ({ ...config, marker: true }) };
    const wrapped = withAIUIReactAssistCleanup(original) as typeof original & { webpack: (config: any, context: any) => any };
    const devConfig: any = { plugins: [] };
    expect(wrapped.webpack(devConfig, { dev: true })).toMatchObject({ marker: true, plugins: [] });
    const prodConfig: any = { plugins: [] };
    expect(wrapped.webpack(prodConfig, { dev: false }).plugins).toHaveLength(1);
  });
});
