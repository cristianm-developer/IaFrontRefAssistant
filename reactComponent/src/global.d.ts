// Declaración ambiental mínima: evita depender de @types/node (que no debe
// filtrarse a los tipos publicados de esta librería de browser) mientras
// permite chequear `typeof process !== 'undefined'` de forma segura en
// entornos donde el bundler del consumidor no define `process`.
declare const process: { env?: { NODE_ENV?: string } } | undefined;
