/** Unique enough local id (Hermes has no `crypto.randomUUID`). */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
