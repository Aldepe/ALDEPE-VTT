export function createId(prefix = 'id'): string {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  return `${prefix}_${randomPart.replaceAll('-', '').slice(0, 16)}`
}
