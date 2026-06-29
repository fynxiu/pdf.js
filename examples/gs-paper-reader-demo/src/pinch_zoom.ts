export interface PinchZoomOptions {
  target: HTMLElement;
  getScale(): number;
  setScale(scale: number): void;
  minScale?: number;
  maxScale?: number;
}

export function installPdfPinchZoom(options: PinchZoomOptions): () => void {
  const pointers = new Map<number, PointerEvent>();
  const minScale = options.minScale ?? 0.5;
  const maxScale = options.maxScale ?? 3;
  let startDistance = 0;
  let startScale = options.getScale();
  let pendingScale = startScale;
  let timer: number | null = null;

  const flush = () => {
    timer = null;
    options.setScale(pendingScale);
  };
  const down = (event: PointerEvent) => {
    if (event.pointerType !== "touch") return;
    options.target.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, event);
    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      startDistance = distance(a, b);
      startScale = options.getScale();
      pendingScale = startScale;
    }
  };
  const move = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, event);
    if (pointers.size !== 2 || startDistance <= 0) return;
    event.preventDefault();
    const [a, b] = Array.from(pointers.values());
    const next = clamp(startScale * (distance(a, b) / startDistance), minScale, maxScale);
    if (Math.abs(next - pendingScale) < 0.03) return;
    pendingScale = Number(next.toFixed(2));
    if (timer === null) timer = window.setTimeout(flush, 90);
  };
  const end = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) startDistance = 0;
  };

  options.target.addEventListener("pointerdown", down);
  options.target.addEventListener("pointermove", move);
  options.target.addEventListener("pointerup", end);
  options.target.addEventListener("pointercancel", end);
  return () => {
    options.target.removeEventListener("pointerdown", down);
    options.target.removeEventListener("pointermove", move);
    options.target.removeEventListener("pointerup", end);
    options.target.removeEventListener("pointercancel", end);
  };
}

function distance(a: PointerEvent, b: PointerEvent): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
