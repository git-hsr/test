<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { ContextMenuItem } from '../types/tool'
import { useUiStore } from '../stores/uiStore'
import { useContextMenu, type MenuPayload } from '../composables/useContextMenu'
import AppIcon from './AppIcon.vue'

const ui = useUiStore()
const { handle, close } = useContextMenu()
const root = useTemplateRef<HTMLElement>('menu')
const openChild = shallowRef<string | null>(null)

onClickOutside(root, close)

const menu = computed(() => ui.contextMenu)

const pos = computed(() => {
  const m = menu.value
  if (!m) return { left: '0px', top: '0px' }
  const x = Math.min(m.x, window.innerWidth - 220)
  const y = Math.min(m.y, window.innerHeight - 12)
  return { left: `${Math.max(8, x)}px`, top: `${Math.max(8, y)}px` }
})

function onPick(item: ContextMenuItem) {
  if (item.disabled || item.children?.length) return
  const payload = menu.value?.payload as MenuPayload | undefined
  if (payload) handle(item.id, payload)
}

function onParent(item: ContextMenuItem) {
  if (item.disabled) return
  openChild.value = openChild.value === item.id ? null : item.id
}
</script>

<template>
  <Teleport to="body">
    <div v-if="menu" ref="menu" class="menu" :style="pos">
      <template v-for="item in menu.items" :key="item.id">
        <button
          type="button"
          class="menu-item"
          :class="{ 'is-danger': item.danger, 'is-disabled': item.disabled }"
          :disabled="item.disabled"
          @click="item.children ? onParent(item) : onPick(item)"
        >
          <AppIcon v-if="item.icon" :name="item.icon" />
          <span class="menu-label">{{ item.label }}</span>
          <AppIcon v-if="item.children" name="chevron" />
        </button>
        <div v-if="item.children && openChild === item.id" class="menu-sub">
          <button
            v-for="child in item.children"
            :key="child.id"
            type="button"
            class="menu-item"
            :class="{ 'is-danger': child.danger, 'is-disabled': child.disabled }"
            :disabled="child.disabled"
            @click="onPick(child)"
          >
            <span class="menu-label">{{ child.label }}</span>
          </button>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.menu {
  position: fixed;
  z-index: 50;
  min-width: 200px;
  padding: 6px;
  border-radius: 12px;
  background: var(--menu-bg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
  color: var(--text);
}
.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}
.menu-item:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
}
.menu-item.is-danger {
  color: var(--color-danger);
}
.menu-item.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.menu-label {
  flex: 1;
}
.menu-sub {
  padding-left: 8px;
}
</style>
