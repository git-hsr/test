import type { Category, ContextMenuItem, ToolItem } from '../types/tool'
import { LAYOUT_PRESETS } from '../types/tool'
import { useToolStore } from '../stores/toolStore'
import { useUiStore } from '../stores/uiStore'

export type MenuPayload =
  | { scope: 'desktop' }
  | { scope: 'tool'; tool: ToolItem; inFolder?: boolean }
  | { scope: 'category'; category: Category }

export function useContextMenu() {
  const tools = useToolStore()
  const ui = useUiStore()

  function open(event: MouseEvent, payload: MenuPayload) {
    event.preventDefault()
    ui.tooltip = null
    ui.contextMenu = {
      x: event.clientX,
      y: event.clientY,
      items: buildItems(payload),
      payload,
    }
  }

  function close() {
    ui.contextMenu = null
  }

  function buildItems(payload: MenuPayload): ContextMenuItem[] {
    if (payload.scope === 'desktop') {
      return [
        { id: 'add-link', label: '添加快捷方式', icon: 'globe' },
        { id: 'add-widget', label: '添加组件', icon: 'widget' },
        { id: 'wallpaper', label: '壁纸', icon: 'image' },
        {
          id: 'minimal',
          label: ui.minimalMode ? '退出极简模式' : '极简模式',
          icon: 'layout',
        },
      ]
    }

    if (payload.scope === 'category') {
      const locked = payload.category.id === 'home'
      return [
        { id: 'edit-category', label: '编辑分组', icon: 'edit', disabled: locked },
        { id: 'delete-category', label: '删除分组', icon: 'trash', danger: true, disabled: locked },
      ]
    }

    const { tool, inFolder } = payload
    const otherCats = tools.sortedCategories.filter((c) => c.id !== tool.categoryId)
    const items: ContextMenuItem[] = []

    if (tool.kind === 'link') items.push({ id: 'open', label: '打开', icon: 'globe' })
    items.push({ id: 'edit-tool', label: '编辑', icon: 'edit' })

    if (!inFolder) {
      items.push({
        id: 'layout',
        label: '布局',
        icon: 'layout',
        children: [
          ...LAYOUT_PRESETS.map(([c, r]) => ({
            id: `span:${c}x${r}`,
            label: `${c}×${r}`,
          })),
          { id: 'custom-span', label: '自定义尺寸' },
        ],
      })
      items.push({
        id: 'toggle-desc',
        label: tool.showDescription ? '隐藏描述' : '显示描述',
      })
    }

    if (inFolder) {
      items.push({ id: 'to-desktop', label: '移到桌面', icon: 'home' })
    }

    if (otherCats.length) {
      items.push({
        id: 'copy-to',
        label: '复制到分组',
        icon: 'copy',
        children: otherCats.map((c) => ({ id: `copy:${c.id}`, label: c.name })),
      })
      items.push({
        id: 'move-to',
        label: '移动到分组',
        icon: 'folder',
        children: otherCats.map((c) => ({ id: `move:${c.id}`, label: c.name })),
      })
    }

    items.push({
      id: 'delete-tool',
      label: '删除',
      icon: 'trash',
      danger: true,
    })
    return items
  }

  async function handle(id: string, payload: MenuPayload) {
    close()
    if (payload.scope === 'desktop') {
      if (id === 'add-link') ui.toolModal = { mode: 'create', kind: 'link' }
      if (id === 'add-widget') ui.toolModal = { mode: 'create', kind: 'widget' }
      if (id === 'wallpaper') ui.wallpaperOpen = true
      if (id === 'minimal') ui.minimalMode = !ui.minimalMode
      return
    }

    if (payload.scope === 'category') {
      if (id === 'edit-category') {
        ui.categoryModal = { mode: 'edit', category: payload.category }
      }
      if (id === 'delete-category') {
        const ok = await ui.askConfirm('删除分组', `删除「${payload.category.name}」后，其中的工具会移到首页。`)
        if (ok) tools.removeCategory(payload.category.id)
      }
      return
    }

    const { tool } = payload
    if (id === 'open' && tool.kind === 'link') {
      window.open(tool.url, '_blank', 'noopener,noreferrer')
      return
    }
    if (id === 'edit-tool' || id === 'custom-span') {
      ui.toolModal = {
        mode: 'edit',
        kind: tool.kind === 'widget' ? 'widget' : 'link',
        tool,
      }
      return
    }
    if (id.startsWith('span:')) {
      const [c, r] = id.slice(5).split('x').map(Number)
      tools.setItemSpan(tool.id, c, r, 12)
      return
    }
    if (id === 'toggle-desc') {
      tools.updateTool(tool.id, { showDescription: !tool.showDescription })
      return
    }
    if (id === 'to-desktop') {
      tools.moveToDesktop(tool.id)
      return
    }
    if (id.startsWith('copy:')) {
      tools.copyToCategory(tool.id, id.slice(5))
      return
    }
    if (id.startsWith('move:')) {
      tools.moveToCategory(tool.id, id.slice(5))
      return
    }
    if (id === 'delete-tool') {
      const ok = await ui.askConfirm('删除图标', `确定删除「${tool.name}」？`)
      if (ok) tools.removeTool(tool.id)
    }
  }

  return { open, close, handle }
}
