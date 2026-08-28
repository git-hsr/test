<script setup lang="ts">
import { computed, nextTick, provide, shallowRef, useTemplateRef, watch } from 'vue'
import { useElementSize, useEventListener } from '@vueuse/core'
import { useThrottleFn } from '@vueuse/shared'
import type { ToolItem as NavTool } from '../types/tool'
import { useToolStore } from '../stores/toolStore'
import { useGridDrag } from '../composables/useGridDrag'
import { useContextMenu } from '../composables/useContextMenu'
import { useToolAction } from '../composables/useToolAction'
import { consumeClickKey, gridColsKey } from '../composables/keys'
import ToolItem from './ToolItem.vue'

const props = defineProps<{
  items: NavTool[]
  folderId?: string
}>()

const tools = useToolStore()
const menu = useContextMenu()
const { activate } = useToolAction()
const gridRef = useTemplateRef<HTMLElement>('grid')
const { width } = useElementSize(gridRef)

const itemList = computed(() => props.items)

const maxCols = computed(() => {
  const cell = 96
  const gap = 16
  const n = Math.floor((width.value + gap) / (cell + gap))
  return Math.min(12, Math.max(1, n || 1))
})

const cols = computed(() => {
  const max = maxCols.value
  return Math.min(12, Math.max(4, max || 4))
})
provide(gridColsKey, cols)

const {
  displayItems,
  mergeTargetId,
  sourceId,
  ghost,
  onPointerDown,
  consumeClick,
} = useGridDrag({
  items: itemList,
  getGridEl: () => {
    const host = gridRef.value
    if (!host) return null
    const panes = host.querySelectorAll<HTMLElement>('.pane')
    return panes[panes.length - 1] ?? host
  },
  onReorder: (ids) => {
    if (props.folderId) tools.reorderFolderChildren(props.folderId, ids)
    else tools.reorderVisible(ids)
  },
  onMerge: (fromId, targetId) => {
    if (props.folderId) return
    tools.mergeIntoFolder(fromId, targetId)
  },
  onMoveCategory: (toolId, categoryId) => {
    tools.moveToCategory(toolId, categoryId)
  },
  onTap: (id, event) => {
    const tool = tools.getById(id)
    if (tool) activate(tool, event)
  },
})

provide(consumeClickKey, () => consumeClick())

const cellStyle = computed(() => ({
  '--cols': String(cols.value),
  '--cell': '88px',
}))

function onDesktopMenu(event: MouseEvent) {
  if (props.folderId) return
  if ((event.target as HTMLElement).closest('[data-tool-id]')) return
  menu.open(event, { scope: 'desktop' })
}

function onToolMenu(event: MouseEvent, tool: NavTool) {
  menu.open(event, { scope: 'tool', tool, inFolder: Boolean(props.folderId) })
}

const paneKey = computed(() => props.folderId ?? tools.activeCategoryId)
const slideDir = shallowRef<'next' | 'prev'>('next')

watch(
  () => tools.activeCategoryId,
  (id, prev) => {
    if (!prev || prev === id) return
    const list = tools.sortedCategories
    const a = list.findIndex((c) => c.id === prev)
    const b = list.findIndex((c) => c.id === id)
    if (a < 0 || b < 0) return
    const n = list.length
    const forward = (b - a + n) % n
    const backward = (a - b + n) % n
    slideDir.value = forward <= backward ? 'next' : 'prev'
  },
)

const switchCat = useThrottleFn((delta: number) => {
  if (props.folderId) return
  const list = tools.sortedCategories
  if (list.length < 2) return
  const i = list.findIndex((c) => c.id === tools.activeCategoryId)
  const next = list[(i + (delta > 0 ? 1 : -1) + list.length) % list.length]
  if (next) tools.setActiveCategory(next.id)
}, 480)

useEventListener(
  gridRef,
  'wheel',
  (event: WheelEvent) => {
    if (props.folderId) return
    if (Math.abs(event.deltaY) < 20) return
    event.preventDefault()
    switchCat(event.deltaY)
  },
  { passive: false },
)

const ghostTool = computed(() =>
  ghost.value ? tools.getById(ghost.value.id) : undefined,
)

const orderKey = computed(() => displayItems.value.map((t) => t.id).join(','))

function snapshot(grid: HTMLElement) {
  const map = new Map<string, DOMRect>()
  for (const el of grid.querySelectorAll<HTMLElement>('[data-tool-id]')) {
    const id = el.dataset.toolId
    if (id) map.set(id, el.getBoundingClientRect())
  }
  return map
}

function playFlip(grid: HTMLElement, first: Map<string, DOMRect>, skipId: string | null) {
  for (const el of grid.querySelectorAll<HTMLElement>('[data-tool-id]')) {
    const id = el.dataset.toolId
    if (!id || id === skipId) continue
    const prev = first.get(id)
    if (!prev) continue
    const now = el.getBoundingClientRect()
    const dx = prev.left - now.left
    const dy = prev.top - now.top
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
    el.style.transition = 'none'
    el.style.transform = `translate(${dx}px, ${dy}px)`
    void el.getBoundingClientRect()
    el.style.transition = 'transform 0.22s ease'
    el.style.transform = ''
    const done = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform') return
      el.style.transition = ''
      el.removeEventListener('transitionend', done)
    }
    el.addEventListener('transitionend', done)
  }
}

watch(
  orderKey,
  () => {
    const grid = gridRef.value
    if (!grid || !sourceId.value) return
    const first = snapshot(grid)
    nextTick(() => {
      playFlip(grid, first, sourceId.value)
    })
  },
  { flush: 'pre' },
)
</script>

<template>
  <div
    ref="grid"
    class="grid-host"
    :class="{ 'is-board': !folderId }"
    @contextmenu="onDesktopMenu"
  >
    <div class="board">
      <Transition :name="folderId ? '' : `cat-${slideDir}`" :css="!folderId">
        <div :key="paneKey" class="pane grid" :style="cellStyle">
          <ToolItem
            v-for="tool in displayItems"
            :key="tool.id"
            :tool="tool"
            :in-folder="Boolean(folderId)"
            :merge-target="mergeTargetId === tool.id"
            :dragging="sourceId === tool.id"
            @pointerdown="onPointerDown($event, tool.id)"
            @contextmenu.prevent="onToolMenu($event, tool)"
          />
        </div>
      </Transition>
    </div>

    <Teleport to="body">
      <div
        v-if="ghost && ghostTool"
        class="ghost"
        :style="{
          left: `${ghost.x}px`,
          top: `${ghost.y}px`,
          width: `${ghost.w}px`,
          height: `${ghost.h}px`,
        }"
      >
        <ToolItem
          :tool="ghostTool"
          preview
          :in-folder="Boolean(folderId)"
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.grid-host {
  position: relative;
  width: 100%;
}
.grid-host:not(.is-board) {
  min-height: 240px;
}
.grid-host.is-board {
  flex: 1 1 auto;
  align-self: stretch;
  min-height: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
}
.grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--cell));
  grid-auto-rows: var(--cell);
  grid-auto-flow: dense;
  gap: 16px;
  justify-content: center;
  width: 100%;
}
.grid-host:not(.is-board) .grid {
  min-height: 240px;
}
.grid-host.is-board .board {
  position: relative;
  width: max-content;
  max-width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  border-radius: 24px;
  background: color-mix(
    in srgb,
    rgb(var(--color-primary-rgb) / var(--glass-alpha, 0.15)) 42%,
    rgb(var(--glass-rgb, 255 255 255) / var(--glass-alpha, 0.15))
  );
  backdrop-filter: blur(var(--glass-blur, 24px)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--glass-blur, 24px)) saturate(1.2);
  border: 1px solid color-mix(in srgb, var(--color-primary) 28%, transparent);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
}
.grid-host.is-board .pane {
  width: max-content;
  max-width: 100%;
  height: 100%;
  min-height: 100%;
  align-self: stretch;
  align-content: start;
  padding: 18px 20px 14px;
  box-sizing: border-box;
}
.cat-next-enter-active,
.cat-next-leave-active,
.cat-prev-enter-active,
.cat-prev-leave-active {
  transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1);
}
.cat-next-leave-active,
.cat-prev-leave-active {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.cat-next-enter-from {
  transform: translateY(100%);
}
.cat-next-leave-to {
  transform: translateY(-100%);
}
.cat-prev-enter-from {
  transform: translateY(-100%);
}
.cat-prev-leave-to {
  transform: translateY(100%);
}
@media (prefers-reduced-motion: reduce) {
  .cat-next-enter-active,
  .cat-next-leave-active,
  .cat-prev-enter-active,
  .cat-prev-leave-active {
    transition: opacity 0.2s ease;
  }
  .cat-next-enter-from,
  .cat-next-leave-to,
  .cat-prev-enter-from,
  .cat-prev-leave-to,
  .cat-next-leave-from,
  .cat-prev-leave-from {
    transform: none;
    opacity: 0;
  }
}
.ghost {
  position: fixed;
  z-index: 40;
  pointer-events: none;
  transform: translate(-50%, -50%);
  opacity: 0.3;
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.32));
}
</style>
