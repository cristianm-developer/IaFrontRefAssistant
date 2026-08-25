// Declaración ambiental mínima: evita depender de @types/node (que no debe
// filtrarse a los tipos publicados de esta librería de browser) mientras
// permite chequear `typeof process !== 'undefined'` de forma segura en
// entornos donde el bundler del consumidor no define `process`.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

// `?inline` es una query especial de Vite: entrega el CSS procesado como
// string en vez de inyectarlo/extraerlo (ver mount.tsx, que lo usa para
// llevar el CSS embebido en el bundle de JS).
declare module '*.css?inline' {
  const css: string;
  export default css;
}
