import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import {
  HOME_CATEGORY_ID,
  type Category,
  type FolderTool,
  type ToolItem,
  type WidgetTool,
} from '../types/tool'
import { seedCategories, seedTools } from '../data/seed'
import { clampSpan, createId, isOneByOne } from '../utils/helpers'

function cloneTool(item: ToolItem, patch: Partial<ToolItem>): ToolItem {
  return { ...item, ...patch, id: createId(), type: 'custom' } as ToolItem
}

export const useToolStore = defineStore('tools', () => {
  const categories = useStorage<Category[]>('nav-cats-v1', seedCategories)
  const tools = useStorage<ToolItem[]>('nav-tools-v1', seedTools)
  const activeCategoryId = useStorage<string>('nav-active-cat-v1', HOME_CATEGORY_ID)
  const removedToolIds = useStorage<string[]>('nav-removed-tools-v1', [])

  function hydrate() {
    if (!categories.value.some((c) => c.id === HOME_CATEGORY_ID)) {
      categories.value = [seedCategories[0], ...categories.value]
    }
    const ids = new Set(tools.value.map((t) => t.id))
    const removed = new Set(removedToolIds.value)
    for (const item of seedTools) {
      if (item.type === 'system' && !ids.has(item.id) && !removed.has(item.id)) {
        tools.value.push(item)
      }
    }
    if (!categories.value.some((c) => c.id === activeCategoryId.value)) {
      activeCategoryId.value = HOME_CATEGORY_ID
    }
    repairFolders()
  }
  hydrate()

  const sortedCategories = computed(() =>
    [...categories.value].sort((a, b) => a.order - b.order),
  )

  const customCategories = computed(() =>
    sortedCategories.value.filter((c) => c.id !== HOME_CATEGORY_ID),
  )

  const homeCategory = computed(
    () => sortedCategories.value.find((c) => c.id === HOME_CATEGORY_ID)!,
  )

  function childrenOf(folderId: string) {
    return tools.value
      .filter((t) => t.folderId === folderId)
      .sort((a, b) => a.order - b.order)
  }

  const visibleTools = computed(() =>
    tools.value
      .filter((t) => t.categoryId === activeCategoryId.value && !t.folderId)
      .sort((a, b) => a.order - b.order),
  )

  function getById(id: string) {
    return tools.value.find((t) => t.id === id)
  }

  function nextOrder(categoryId: string, folderId: string | null = null) {
    const list = tools.value.filter(
      (t) => t.categoryId === categoryId && (t.folderId ?? null) === folderId,
    )
    return list.reduce((m, t) => Math.max(m, t.order), -1) + 1
  }

  function repairFolders() {
    const folderIds = new Set(
      tools.value.filter((t) => t.kind === 'folder').map((t) => t.id),
    )
    for (const t of tools.value) {
      if (t.folderId && !folderIds.has(t.folderId)) {
        t.folderId = null
      }
    }
  }

  function dissolveFolderIfNeeded(folderId: string) {
    const folder = getById(folderId)
    if (!folder || folder.kind !== 'folder') return
    const kids = childrenOf(folderId)
    if (kids.length > 1) return
    if (kids.length === 1) {
      kids[0].folderId = null
      kids[0].order = folder.order
      kids[0].categoryId = folder.categoryId
    }
    tools.value = tools.value.filter((t) => t.id !== folderId)
  }

  function setActiveCategory(id: string) {
    activeCategoryId.value = id
  }

  function reorderVisible(ids: string[]) {
    ids.forEach((id, index) => {
      const item = getById(id)
      if (item && !item.folderId) item.order = index
    })
  }

  function reorderFolderChildren(folderId: string, ids: string[]) {
    ids.forEach((id, index) => {
      const item = getById(id)
      if (item && item.folderId === folderId) item.order = index
    })
  }

  function reorderCategories(ids: string[]) {
    const home = categories.value.find((c) => c.id === HOME_CATEGORY_ID)
    if (home) home.order = 0
    ids.forEach((id, index) => {
      const cat = categories.value.find((c) => c.id === id)
      if (cat && cat.id !== HOME_CATEGORY_ID) cat.order = index + 1
    })
  }

  function setItemSpan(id: string, colSpan: number, rowSpan: number, cols: number) {
    const item = getById(id)
    if (!item) return
    const next = clampSpan(colSpan, rowSpan, cols)
    item.colSpan = next.colSpan
    item.rowSpan = next.rowSpan
  }

  function updateTool(id: string, patch: Partial<ToolItem>) {
    const item = getById(id)
    if (!item) return
    const next: Record<string, unknown> = { ...patch }
    delete next.id
    delete next.kind
    if (item.type === 'system') {
      delete next.type
      if (item.kind === 'link') delete next.url
    }
    Object.assign(item, next)
  }

  function addLink(payload: {
    name: string
    url: string
    icon?: string
    description?: string
    categoryId?: string
    iconFill?: boolean
    iconBg?: string
  }) {
    const categoryId = payload.categoryId ?? activeCategoryId.value
    const item: ToolItem = {
      id: createId(),
      kind: 'link',
      type: 'custom',
      name: payload.name,
      url: payload.url,
      icon: payload.icon || '',
      description: payload.description,
      categoryId,
      order: nextOrder(categoryId),
      colSpan: 1,
      rowSpan: 1,
      showDescription: false,
      folderId: null,
      iconFill: payload.iconFill ?? false,
      iconBg: payload.iconBg || '#ffffff',
    }
    tools.value.push(item)
    return item
  }

  function addWidget(payload: {
    name: string
    widgetId: string
    icon: string
    description?: string
    widgetConfig?: Record<string, unknown>
  }) {
    const categoryId = activeCategoryId.value
    const item: WidgetTool = {
      id: createId(),
      kind: 'widget',
      type: 'custom',
      name: payload.name,
      widgetId: payload.widgetId,
      icon: payload.icon,
      description: payload.description,
      widgetConfig: payload.widgetConfig,
      categoryId,
      order: nextOrder(categoryId),
      colSpan: payload.widgetId === 'notes' ? 2 : 1,
      rowSpan: payload.widgetId === 'notes' ? 2 : 1,
      showDescription: false,
      folderId: null,
      iconFill: false,
      iconBg: '#ffffff',
    }
    tools.value.push(item)
    return item
  }

  function removeTool(id: string) {
    const item = getById(id)
    if (!item) return
    if (!removedToolIds.value.includes(id)) {
      removedToolIds.value = [...removedToolIds.value, id]
    }
    if (item.kind === 'folder') {
      for (const child of childrenOf(id)) {
        child.folderId = null
        child.order = nextOrder(item.categoryId)
      }
    }
    const folderId = item.folderId
    tools.value = tools.value.filter((t) => t.id !== id)
    if (folderId) dissolveFolderIfNeeded(folderId)
  }

  function addCategory(name: string, icon: string, description?: string) {
    const cat: Category = {
      id: createId(),
      name,
      icon,
      description,
      type: 'custom',
      order: categories.value.length,
    }
    categories.value.push(cat)
    return cat
  }

  function updateCategory(id: string, patch: Partial<Category>) {
    const cat = categories.value.find((c) => c.id === id)
    if (!cat) return
    Object.assign(cat, patch)
  }

  function removeCategory(id: string) {
    if (id === HOME_CATEGORY_ID) return
    for (const t of tools.value) {
      if (t.categoryId === id) t.categoryId = HOME_CATEGORY_ID
    }
    categories.value = categories.value.filter((c) => c.id !== id)
    if (activeCategoryId.value === id) activeCategoryId.value = HOME_CATEGORY_ID
  }

  function moveToCategory(toolId: string, categoryId: string) {
    const item = getById(toolId)
    if (!item) return
    const prevFolder = item.folderId
    item.categoryId = categoryId
    item.folderId = null
    item.order = nextOrder(categoryId)
    if (item.kind === 'folder') {
      for (const child of childrenOf(item.id)) {
        child.categoryId = categoryId
      }
    }
    if (prevFolder) dissolveFolderIfNeeded(prevFolder)
  }

  function moveToDesktop(toolId: string) {
    const item = getById(toolId)
    if (!item?.folderId) return
    const folderId = item.folderId
    item.folderId = null
    item.order = nextOrder(item.categoryId)
    dissolveFolderIfNeeded(folderId)
  }

  function mergeIntoFolder(sourceId: string, targetId: string) {
    const source = getById(sourceId)
    const target = getById(targetId)
    if (!source || !target) return
    if (source.kind === 'folder' || source.folderId) return
    if (!isOneByOne(source.colSpan, source.rowSpan)) return

    if (target.kind === 'folder') {
      source.folderId = target.id
      source.categoryId = target.categoryId
      source.order = nextOrder(target.categoryId, target.id)
      return
    }
    if (target.folderId) return
    if (!isOneByOne(target.colSpan, target.rowSpan)) return

    const folder: FolderTool = {
      id: createId(),
      kind: 'folder',
      type: 'custom',
      name: '文件夹',
      icon: 'folder',
      categoryId: target.categoryId,
      description: '文件夹',
      order: target.order,
      colSpan: 1,
      rowSpan: 1,
      showDescription: false,
      folderId: null,
      iconFill: false,
      iconBg: '#ffffff',
    }
    source.folderId = folder.id
    target.folderId = folder.id
    source.categoryId = folder.categoryId
    source.order = 0
    target.order = 1
    tools.value.push(folder)
  }

  function copyToCategory(toolId: string, targetCategoryId: string) {
    const item = getById(toolId)
    if (!item || item.categoryId === targetCategoryId) return
    if (item.kind === 'folder') {
      const folderCopy = cloneTool(item, {
        categoryId: targetCategoryId,
        folderId: null,
        order: nextOrder(targetCategoryId),
      }) as FolderTool
      tools.value.push(folderCopy)
      for (const child of childrenOf(item.id)) {
        tools.value.push(
          cloneTool(child, {
            categoryId: targetCategoryId,
            folderId: folderCopy.id,
            order: child.order,
          }),
        )
      }
      return
    }
    tools.value.push(
      cloneTool(item, {
        categoryId: targetCategoryId,
        folderId: null,
        order: nextOrder(targetCategoryId),
      }),
    )
  }

  return {
    categories,
    tools,
    activeCategoryId,
    sortedCategories,
    customCategories,
    homeCategory,
    visibleTools,
    childrenOf,
    getById,
    setActiveCategory,
    reorderVisible,
    reorderFolderChildren,
    reorderCategories,
    setItemSpan,
    updateTool,
    addLink,
    addWidget,
    removeTool,
    addCategory,
    updateCategory,
    removeCategory,
    moveToCategory,
    moveToDesktop,
    mergeIntoFolder,
    copyToCategory,
    dissolveFolderIfNeeded,
  }
})
