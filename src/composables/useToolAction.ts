import type { ToolItem } from '../types/tool'
import { isOneByOne } from '../utils/helpers'
import { useUiStore } from '../stores/uiStore'

export function useToolAction() {
  const ui = useUiStore()

  function activate(tool: ToolItem, event?: MouseEvent) {
    if (tool.kind === 'link') return
    if (tool.kind === 'folder') {
      ui.activeFolderId = tool.id
      return
    }
    if (!isOneByOne(tool.colSpan, tool.rowSpan)) return
    ui.activeWidgetToolId = tool.id
    ui.widgetAnchor = event
      ? { x: event.clientX, y: event.clientY }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  }

  return { activate }
}
