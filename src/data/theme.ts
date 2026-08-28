export const THEME_PRIMARIES: { id: string; color: string }[] = [
  { id: 'blue', color: '#409EFF' },
  { id: 'orange', color: '#E6A23C' },
  { id: 'gold', color: '#F2C94C' },
  { id: 'green', color: '#67C23A' },
  { id: 'teal', color: '#13C2C2' },
  { id: 'cyan', color: '#36CFC9' },
  { id: 'indigo', color: '#5C6BC0' },
  { id: 'purple', color: '#9B59B6' },
  { id: 'pink', color: '#EC4899' },
  { id: 'rose', color: '#F56C6C' },
  { id: 'slate', color: '#909399' },
]

export const AUX_COLORS = {
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399',
} as const

export function hexToRgb(hex: string): string {
  const raw = hex.replace('#', '')
  const num = Number.parseInt(raw, 16)
  if (Number.isNaN(num)) return '64 158 255'
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r} ${g} ${b}`
}
