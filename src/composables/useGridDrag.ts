import { computed, onUnmounted, shallowRef, type ComputedRef } from 'vue'
import { useTimeoutFn } from '@vueuse/shared'
import type { ToolItem } from '../types/tool'
import { isOneByOne } from '../utils/helpers'
import { useUiStore } from '../stores/uiStore'

export type DragPhase = 'idle' | 'sorting' | 'merging' | 'droppingToSidebar'

const THRESHOLD = 12
const MERGE_MS = 450
const SORT_MS = 280
const LISTENER_OPTS: AddEventListenerOptions = { capture: true }

function sameIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, i) => id === b[i])
}

export function useGridDrag(opts: {
  items: ComputedRef<ToolItem[]>
  getGridEl: () => HTMLElement | null
  onReorder: (ids: string[]) => void
  onMerge: (sourceId: string, targetId: string) => void
  onMoveCategory: (toolId: string, categoryId: string) => void
  onTap?: (id: string, event: PointerEvent) => void
}) {
  const ui = useUiStore()
  const phase = shallowRef<DragPhase>('idle')
  const sourceId = shallowRef<string | null>(null)
  const mergeTargetId = shallowRef<string | null>(null)
  const sidebarTargetId = shallowRef<string | null>(null)
  const ghost = shallowRef<{ x: number; y: number; id: string; w: number; h: number } | null>(null)
  const previewIds = shallowRef<string[] | null>(null)
  const suppressClick = shallowRef(false)

  const { start: startMergeTimer, stop: stopMergeTimer } = useTimeoutFn(
    () => {
      if (sourceId.value && mergeTargetId.value) phase.value = 'merging'
    },
    MERGE_MS,
    { immediate: false },
  )

  const { start: startSortTimer, stop: stopSortTimer } = useTimeoutFn(
    () => {
      if (pendingInsertAt !== null) applyInsert(pendingInsertAt)
    },
    SORT_MS,
    { immediate: false },
  )

  let startX = 0
  let startY = 0
  let dragging = false
  let pointerId = -1
  let downId: string | null = null
  let listening = false
  let pendingInsertAt: number | null = null
  let ghostW = 64
  let ghostH = 64

  function canMerge(source: ToolItem, target: ToolItem) {
    if (source.id === target.id) return false
    if (source.kind === 'folder' || source.folderId) return false
    if (!isOneByOne(source.colSpan, source.rowSpan)) return false
    if (target.kind === 'folder') return isOneByOne(target.colSpan, target.rowSpan)
    if (target.folderId) return false
    return isOneByOne(target.colSpan, target.rowSpan)
  }

  function hitTest(x: number, y: number) {
    const el = document.elementFromPoint(x, y)
    const sidebar = el?.closest('[data-category-id]') as HTMLElement | null
    if (sidebar?.dataset.categoryId) {
      return { kind: 'sidebar' as const, id: sidebar.dataset.categoryId }
    }
    const tile = el?.closest('[data-tool-id]') as HTMLElement | null
    if (tile?.dataset.toolId) {
      return { kind: 'tile' as const, id: tile.dataset.toolId, el: tile }
    }
    return null
  }

  function inCenter(el: HTMLElement, x: number, y: number) {
    const r = el.getBoundingClientRect()
    return (
      Math.abs(x - (r.left + r.width / 2)) <= r.width * 0.25 &&
      Math.abs(y - (r.top + r.height / 2)) <= r.height * 0.25
    )
  }

  function clearSortHover() {
    pendingInsertAt = null
    stopSortTimer()
  }

  function currentIds() {
    return previewIds.value ?? opts.items.value.map((t) => t.id)
  }

  function findInsertAt(x: number, y: number): number | null {
    const grid = opts.getGridEl()
    if (!grid || !downId) return null
    const pad = 20
    const without = currentIds().filter((id) => id !== downId)
    let best: { id: string; place: 'before' | 'after'; dist: number } | null = null
    for (const el of grid.querySelectorAll<HTMLElement>('[data-tool-id]')) {
      const id = el.dataset.toolId
      if (!id || id === downId) continue
      const r = el.getBoundingClientRect()
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) continue
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dist = Math.hypot(x - cx, y - cy)
      const dx = x - cx
      const dy = y - cy
      const place =
        Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'before' : 'after') : dy < 0 ? 'before' : 'after'
      if (!best || dist < best.dist) best = { id, place, dist }
    }
    if (!best) return null
    const hitIndex = without.indexOf(best.id)
    if (hitIndex < 0) return null
    return best.place === 'before' ? hitIndex : hitIndex + 1
  }

  function applyInsert(insertAt: number) {
    if (!downId) return
    const current = currentIds()
    const without = current.filter((id) => id !== downId)
    const at = Math.max(0, Math.min(insertAt, without.length))
    without.splice(at, 0, downId)
    if (sameIds(without, current)) return
    previewIds.value = without
  }

  function armSort(insertAt: number) {
    if (!downId) return
    if (currentIds().indexOf(downId) === insertAt) {
      pendingInsertAt = insertAt
      stopSortTimer()
      return
    }
    if (pendingInsertAt !== insertAt) {
      pendingInsertAt = insertAt
      startSortTimer()
    }
  }

  function bindListeners() {
    if (listening) return
    listening = true
    window.addEventListener('pointermove', onPointerMove, LISTENER_OPTS)
    window.addEventListener('pointerup', onPointerUp, LISTENER_OPTS)
    window.addEventListener('pointercancel', onPointerCancel, LISTENER_OPTS)
  }

  function unbindListeners() {
    if (!listening) return
    listening = false
    window.removeEventListener('pointermove', onPointerMove, LISTENER_OPTS)
    window.removeEventListener('pointerup', onPointerUp, LISTENER_OPTS)
    window.removeEventListener('pointercancel', onPointerCancel, LISTENER_OPTS)
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== pointerId || !downId) return
    if (dragging && event.buttons === 0) {
      finish()
      return
    }
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    if (!dragging) {
      if (Math.hypot(dx, dy) < THRESHOLD) return
      dragging = true
      suppressClick.value = true
      sourceId.value = downId
      phase.value = 'sorting'
      if (event.cancelable && event.pointerType !== 'mouse') event.preventDefault()
      const el = opts.getGridEl()?.querySelector(`[data-tool-id="${downId}"]`) as HTMLElement | null
      if (el) {
        ghostW = el.offsetWidth
        ghostH = el.offsetHeight
      }
    }
    ghost.value = { x: event.clientX, y: event.clientY, id: downId, w: ghostW, h: ghostH }

    const hit = hitTest(event.clientX, event.clientY)
    const source = opts.items.value.find((t) => t.id === downId)

    if (hit?.kind === 'sidebar') {
      stopMergeTimer()
      clearSortHover()
      mergeTargetId.value = null
      sidebarTargetId.value = hit.id
      ui.sidebarDropId = hit.id
      phase.value = 'droppingToSidebar'
      return
    }
    sidebarTargetId.value = null
    ui.sidebarDropId = null

    if (hit?.kind === 'tile' && source) {
      const target = opts.items.value.find((t) => t.id === hit.id)
      if (target && canMerge(source, target) && inCenter(hit.el, event.clientX, event.clientY)) {
        clearSortHover()
        if (mergeTargetId.value !== target.id) {
          mergeTargetId.value = target.id
          startMergeTimer()
        }
        return
      }
    }

    stopMergeTimer()
    mergeTargetId.value = null
    phase.value = 'sorting'

    const insertAt = findInsertAt(event.clientX, event.clientY)
    if (insertAt !== null) {
      armSort(insertAt)
      return
    }
    clearSortHover()
  }

  function reset() {
    dragging = false
    downId = null
    pointerId = -1
    phase.value = 'idle'
    sourceId.value = null
    mergeTargetId.value = null
    sidebarTargetId.value = null
    ui.sidebarDropId = null
    ghost.value = null
    ghostW = 64
    ghostH = 64
    previewIds.value = null
    stopMergeTimer()
    clearSortHover()
    unbindListeners()
  }

  function finish() {
    if (dragging && sourceId.value) {
      if (phase.value === 'merging' && mergeTargetId.value) {
        opts.onMerge(sourceId.value, mergeTargetId.value)
      } else if (phase.value === 'droppingToSidebar' && sidebarTargetId.value) {
        opts.onMoveCategory(sourceId.value, sidebarTargetId.value)
      } else if (previewIds.value) {
        opts.onReorder(previewIds.value)
      }
    }
    reset()
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    const tapId = !dragging ? downId : null
    finish()
    if (tapId) opts.onTap?.(tapId, event)
  }

  function onPointerCancel(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    reset()
  }

  function onPointerDown(event: PointerEvent, id: string) {
    if (event.button !== 0) return
    if (pointerId !== -1) reset()
    downId = id
    startX = event.clientX
    startY = event.clientY
    pointerId = event.pointerId
    suppressClick.value = false
    bindListeners()
  }

  function consumeClick() {
    if (!suppressClick.value) return false
    suppressClick.value = false
    return true
  }

  onUnmounted(() => {
    reset()
  })

  const displayItems = computed(() => {
    const list = opts.items.value
    if (!previewIds.value) return list
    const map = new Map(list.map((t) => [t.id, t]))
    return previewIds.value.map((id) => map.get(id)).filter(Boolean) as ToolItem[]
  })

  return {
    phase,
    ghost,
    mergeTargetId,
    sidebarTargetId,
    sourceId,
    displayItems,
    onPointerDown,
    consumeClick,
  }
}
