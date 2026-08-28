import { useActiveElement, onKeyStroke } from '@vueuse/core'
import { useUiStore } from '../stores/uiStore'

export function useShortcuts() {
  const ui = useUiStore()
  const active = useActiveElement()

  function isTyping() {
    const el = active.value
    if (!el) return false
    const tag = el.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
  }

  onKeyStroke('f', (event) => {
    if (!(event.ctrlKey || event.metaKey)) return
    event.preventDefault()
    ui.localSearchOpen = true
    ui.localSearchQuery = ''
  })

  onKeyStroke('Escape', () => {
    if (isTyping()) {
      ;(active.value as HTMLElement | null)?.blur()
      return
    }
    if (ui.contextMenu) {
      ui.contextMenu = null
      return
    }
    if (ui.confirm) {
      ui.confirm.resolve(false)
      ui.confirm = null
      return
    }
    if (ui.toolModal) {
      ui.toolModal = null
      return
    }
    if (ui.categoryModal) {
      ui.categoryModal = null
      return
    }
    if (ui.settingsOpen) {
      ui.settingsOpen = false
      return
    }
    if (ui.wallpaperOpen) {
      ui.wallpaperOpen = false
      return
    }
    if (ui.localSearchOpen) {
      ui.localSearchOpen = false
      return
    }
    if (ui.activeWidgetToolId) {
      ui.activeWidgetToolId = null
      return
    }
    if (ui.activeFolderId) ui.activeFolderId = null
  })
}
