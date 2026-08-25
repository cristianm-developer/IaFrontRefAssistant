// Smoke test manual: importa el bundle compilado (con Preact embebido) en un
// DOM real de jsdom, fuera del entorno de Vite/Vitest, para confirmar que
// funciona como lo vería un consumidor sin React instalado.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;

const { mountIaFrontRefAssistant } = await import('../dist/ia-front-ref-assistant.js');

const handle = mountIaFrontRefAssistant({ active: true });

// Poll en vez de un setTimeout fijo — el commit de React es async y su
// timing bajo jsdom varía según la carga de la máquina/proceso.
let button = null;
for (let i = 0; i < 40 && !button; i++) {
  await new Promise((r) => setTimeout(r, 25));
  button = document.querySelector('.ia-fra-button');
}
const style = document.querySelector('style[data-ia-fra-style]');

console.log('button found:', !!button);
console.log('style found:', !!style);
console.log('style has .ia-fra-button rule:', !!style?.textContent.includes('.ia-fra-button'));
console.log('react/preact global leaked onto window:', 'React' in window || 'preact' in window);

handle.unmount();
console.log('after unmount, button gone:', !document.querySelector('.ia-fra-button'));

if (!button || !style) {
  console.error('SMOKE TEST FAILED');
  process.exit(1);
}
console.log('SMOKE TEST OK');
