export function createId(): string {
  return crypto.randomUUID()
}

export function faviconFor(url: string): string {
  try {
    const host = new URL(url).hostname
    return `https://icons.duckduckgo.com/ip3/${host}.ico`
  } catch {
    return ''
  }
}

export function hostLetter(name: string): string {
  const t = name.trim()
  return t ? t.slice(0, 1).toUpperCase() : '?'
}

export function clampSpan(col: number, row: number, cols: number) {
  return {
    colSpan: Math.min(Math.max(1, Math.round(col)), Math.min(4, cols)),
    rowSpan: Math.min(Math.max(1, Math.round(row)), 4),
  }
}

export function isOneByOne(colSpan: number, rowSpan: number) {
  return colSpan === 1 && rowSpan === 1
}

export function cardLayout(colSpan: number, rowSpan: number): 'icon' | 'vertical' | 'horizontal' | 'square' {
  if (colSpan === 1 && rowSpan === 1) return 'icon'
  if (rowSpan > colSpan) return 'vertical'
  if (colSpan > rowSpan) return 'horizontal'
  return 'square'
}

export function normalizeUrl(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

export function wallpaperCss(value: string): string {
  if (/^(data:|blob:|https?:|\/)/i.test(value)) return `url("${value}")`
  return value
}

export const DEFAULT_ICON_BG = '#ffffff'

export function iconBgOf(tool: { iconBg?: string }): string {
  const raw = tool.iconBg?.trim() ?? ''
  if (/^#([0-9a-f]{3})$/i.test(raw)) {
    const a = raw[1]
    const b = raw[2]
    const c = raw[3]
    return `#${a}${a}${b}${b}${c}${c}`
  }
  if (/^#([0-9a-f]{6})$/i.test(raw)) return raw
  return DEFAULT_ICON_BG
}

export function iconFills(tool: { iconFill?: boolean }): boolean {
  return tool.iconFill === true
}

export function isLightColor(hex: string): boolean {
  const c = iconBgOf({ iconBg: hex }).slice(1)
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 160
}

const ACCENTS = [
  '#F5C542',
  '#4C9FFF',
  '#FF8A3D',
  '#5B7CFA',
  '#34C759',
  '#FF6B6B',
  '#AF52DE',
  '#32ADE6',
  '#FF9F0A',
  '#64D2FF',
] as const

export function accentFor(seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0
  return ACCENTS[hash % ACCENTS.length]
}
