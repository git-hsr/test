<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/shared'
import draggable from 'vuedraggable'
import { HOME_CATEGORY_ID, type Category } from '../types/tool'
import { useToolStore } from '../stores/toolStore'
import { useUiStore } from '../stores/uiStore'
import { useContextMenu } from '../composables/useContextMenu'
import AppIcon from './AppIcon.vue'

const tools = useToolStore()
const ui = useUiStore()
const menu = useContextMenu()

const dragList = ref<Category[]>([...tools.customCategories])
watch(
  () => tools.customCategories.map((c) => c.id).join(','),
  () => {
    dragList.value = [...tools.customCategories]
  },
)

function commitOrder() {
  tools.reorderCategories(dragList.value.map((c) => c.id))
}

let tipText = ''
let tipEl: HTMLElement | null = null
const { start: startTip, stop: stopTip } = useTimeoutFn(() => {
  if (!tipEl) return
  const r = tipEl.getBoundingClientRect()
  ui.tooltip = { x: r.right + 10, y: r.top + r.height / 2, text: tipText }
}, 400, { immediate: false })

function showTip(event: MouseEvent, text: string) {
  tipEl = event.currentTarget as HTMLElement
  tipText = text
  startTip()
}

function hideTip() {
  stopTip()
  ui.tooltip = null
}

const home = computed(() => tools.homeCategory)
</script>

<template>
  <aside class="sidebar" :class="{ 'is-minimal': ui.minimalMode }">
    <button
      type="button"
      class="side-btn"
      :data-category-id="HOME_CATEGORY_ID"
      :class="{
        'is-active': tools.activeCategoryId === HOME_CATEGORY_ID,
        'is-drop': ui.sidebarDropId === HOME_CATEGORY_ID,
      }"
      @click="tools.setActiveCategory(HOME_CATEGORY_ID)"
      @mouseenter="showTip($event, home.name)"
      @mouseleave="hideTip"
    >
      <AppIcon :name="home.icon" />
    </button>

    <draggable
      v-model="dragList"
      class="side-drag"
      item-key="id"
      :animation="180"
      :delay="150"
      :force-fallback="true"
      ghost-class="is-ghost"
      @end="commitOrder"
    >
      <template #item="{ element }">
        <button
          type="button"
          class="side-btn"
          :data-category-id="element.id"
          :class="{
            'is-active': tools.activeCategoryId === element.id,
            'is-drop': ui.sidebarDropId === element.id,
          }"
          @click="tools.setActiveCategory(element.id)"
          @contextmenu="menu.open($event, { scope: 'category', category: element })"
          @mouseenter="showTip($event, element.name)"
          @mouseleave="hideTip"
        >
          <AppIcon :name="element.icon" />
        </button>
      </template>
    </draggable>

    <button
      type="button"
      class="side-btn side-add"
      @click="ui.categoryModal = { mode: 'create' }"
      @mouseenter="showTip($event, '新增分组')"
      @mouseleave="hideTip"
    >
      <AppIcon name="plus" />
    </button>

    <button
      type="button"
      class="side-btn side-settings"
      @click="ui.settingsOpen = true"
      @mouseenter="showTip($event, '设置')"
      @mouseleave="hideTip"
    >
      <AppIcon name="settings" />
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  z-index: 2;
  left: 12px;
  top: 12px;
  bottom: 12px;
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-radius: 24px;
  background: color-mix(in srgb, var(--color-primary) 16%, var(--sidebar-bg));
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
}
.sidebar.is-minimal {
  opacity: 0.28;
}
.sidebar.is-minimal:hover {
  opacity: 1;
}
.side-drag {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: center;
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.side-btn {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--text);
  display: grid;
  place-items: center;
  font-size: 22px;
  cursor: pointer;
}
.side-btn.is-active {
  background: color-mix(in srgb, var(--color-primary) 22%, transparent);
  color: var(--color-primary);
}
.side-btn.is-drop {
  outline: 2px solid var(--color-primary);
}
.side-add {
  flex-shrink: 0;
}
.side-settings {
  margin-top: auto;
  flex-shrink: 0;
}
.is-ghost {
  opacity: 0.4;
}
</style>
