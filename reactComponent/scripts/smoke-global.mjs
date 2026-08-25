// Smoke test del build IIFE: simula un <script src="ia-front-ref-assistant.global.js">
// clásico (sin import/module), como lo usaría Angular/HTML plano.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  runScripts: 'dangerously',
});
const code = readFileSync(new URL('../dist/ia-front-ref-assistant.global.js', import.meta.url), 'utf8');
const scriptEl = dom.window.document.createElement('script');
scriptEl.textContent = code;
dom.window.document.body.appendChild(scriptEl);

const globalObj = dom.window.IaFrontRefAssistant;
console.log('window.IaFrontRefAssistant exposed:', !!globalObj);
console.log('has mountIaFrontRefAssistant:', typeof globalObj?.mountIaFrontRefAssistant === 'function');

globalObj.mountIaFrontRefAssistant({ active: true });

// Preact/React programan el commit async (microtask/rAF-shim bajo jsdom) —
// hacemos poll en vez de un setTimeout fijo para no depender de cuánto
// tarde el scheduler en esta máquina/proceso.
let button = null;
for (let i = 0; i < 40 && !button; i++) {
  await new Promise((r) => setTimeout(r, 25));
  button = dom.window.document.querySelector('.ia-fra-button');
}
console.log('button found:', !!button);

if (!globalObj || typeof globalObj.mountIaFrontRefAssistant !== 'function' || !button) {
  console.error('SMOKE TEST FAILED');
  process.exit(1);
}
console.log('SMOKE TEST OK');
