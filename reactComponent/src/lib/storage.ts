export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Para arrays, no hacer merge (spread de array crea objeto). Si lo
    // guardado no es un array (corrupto / formato viejo), no cae al merge
    // de objetos de abajo — un array spreadeado con un objeto deja de ser
    // iterable y rompe a los consumidores (ej: setPrompts(prev => [...prev])).
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? (parsed as T) : fallback;
    }
    // Para objetos, merge shallow para tolerar campos nuevos
    if (typeof fallback === 'object' && fallback !== null && typeof parsed === 'object' && parsed !== null) {
      return { ...fallback, ...parsed };
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage lleno o deshabilitado: seguimos en memoria, no rompemos la UI
  }
}
