import { shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { Category, ContextMenuState, ToolItem } from '../types/tool'

export type ModalMode = 'create' | 'edit'

export const useUiStore = defineStore('ui', () => {
  const minimalMode = useStorage('nav-minimal-v1', false)
  const activeEngineId = useStorage('nav-engine-v1', 'baidu')
  const settingsOpen = shallowRef(false)
  const wallpaperOpen = shallowRef(false)
  const localSearchOpen = shallowRef(false)
  const localSearchQuery = shallowRef('')
  const activeFolderId = shallowRef<string | null>(null)
  const activeWidgetToolId = shallowRef<string | null>(null)
  const widgetAnchor = shallowRef<{ x: number; y: number } | null>(null)
  const contextMenu = shallowRef<ContextMenuState | null>(null)
  const tooltip = shallowRef<{ x: number; y: number; text: string } | null>(null)
  const toolModal = shallowRef<{
    mode: ModalMode
    tool?: ToolItem
    kind: 'link' | 'widget'
  } | null>(null)
  const categoryModal = shallowRef<{ mode: ModalMode; category?: Category } | null>(null)
  const confirm = shallowRef<{
    title: string
    message: string
    resolve: (ok: boolean) => void
  } | null>(null)
  const sidebarDropId = shallowRef<string | null>(null)

  function closeOverlays() {
    settingsOpen.value = false
    wallpaperOpen.value = false
    localSearchOpen.value = false
    activeFolderId.value = null
    activeWidgetToolId.value = null
    contextMenu.value = null
    tooltip.value = null
    toolModal.value = null
    categoryModal.value = null
  }

  function askConfirm(title: string, message: string) {
    return new Promise<boolean>((resolve) => {
      confirm.value = { title, message, resolve }
    })
  }

  return {
    minimalMode,
    activeEngineId,
    settingsOpen,
    wallpaperOpen,
    localSearchOpen,
    localSearchQuery,
    activeFolderId,
    activeWidgetToolId,
    widgetAnchor,
    contextMenu,
    tooltip,
    toolModal,
    categoryModal,
    confirm,
    sidebarDropId,
    closeOverlays,
    askConfirm,
  }
})
