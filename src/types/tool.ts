export const HOME_CATEGORY_ID = 'home'

export type ItemType = 'system' | 'custom'
export type ToolKind = 'link' | 'widget' | 'folder'

export const LAYOUT_PRESETS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [1, 2],
  [2, 1],
  [2, 2],
  [2, 4],
]

export interface Category {
  id: string
  name: string
  icon: string
  type: ItemType
  order: number
  description?: string
}

export interface ToolBase {
  id: string
  name: string
  icon: string
  type: ItemType
  categoryId: string
  description?: string
  order: number
  folderId?: string | null
  colSpan: number
  rowSpan: number
  showDescription: boolean
  iconFill?: boolean
  iconBg?: string
}

export interface LinkTool extends ToolBase {
  kind: 'link'
  url: string
}

export interface WidgetTool extends ToolBase {
  kind: 'widget'
  widgetId: string
  widgetConfig?: Record<string, unknown>
}

export interface FolderTool extends ToolBase {
  kind: 'folder'
}

export type ToolItem = LinkTool | WidgetTool | FolderTool

export interface SearchEngine {
  id: string
  name: string
  icon: string
  searchUrl: string
}

export interface WallpaperConfig {
  mode: 'static' | 'slideshow'
  slideshowInterval: number
  currentIndex: number
  list: string[]
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryId: string
}

export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  danger?: boolean
  disabled?: boolean
  children?: ContextMenuItem[]
}

export interface ContextMenuState {
  x: number
  y: number
  items: ContextMenuItem[]
  payload?: unknown
}
