export function clampMenuPosition(opts: {
  idealLeft: number;
  idealTop: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  margin?: number;
}): { left: number; top: number } {
  const { idealLeft, idealTop, width, height, viewportWidth, viewportHeight, margin = 16 } = opts;
  const left = Math.min(Math.max(idealLeft, margin), viewportWidth - width - margin);
  const top = Math.min(Math.max(idealTop, margin), viewportHeight - height - margin);
  return { left, top };
}
