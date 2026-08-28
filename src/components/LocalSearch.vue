<script setup lang="ts">
import { computed, useTemplateRef, watch, shallowRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useDebounceFn } from '@vueuse/shared'
import { useToolStore } from '../stores/toolStore'
import { useUiStore } from '../stores/uiStore'
import AppIcon from './AppIcon.vue'

const tools = useToolStore()
const ui = useUiStore()
const box = useTemplateRef<HTMLElement>('box')
const inputRef = useTemplateRef<HTMLInputElement>('q')
const q = shallowRef('')

watch(
  () => ui.localSearchOpen,
  (open) => {
    if (!open) return
    q.value = ui.localSearchQuery
    requestAnimationFrame(() => inputRef.value?.focus())
  },
)

const apply = useDebounceFn((value: string) => {
  ui.localSearchQuery = value
}, 120)

watch(q, (value) => apply(value))

const hits = computed(() => {
  const s = ui.localSearchQuery.trim().toLowerCase()
  if (!s) return tools.tools.slice(0, 12)
  return tools.tools.filter((t) => t.name.toLowerCase().includes(s) || (t.description ?? '').toLowerCase().includes(s))
})

function close() {
  ui.localSearchOpen = false
}

function go(id: string) {
  const item = tools.getById(id)
  if (!item) return
  tools.setActiveCategory(item.categoryId)
  if (item.folderId) ui.activeFolderId = item.folderId
  close()
}

onClickOutside(box, close)
</script>

<template>
  <Teleport to="body">
    <div v-if="ui.localSearchOpen" class="mask">
      <div ref="box" class="box">
        <div class="row">
          <AppIcon name="search" />
          <input
            ref="q"
            v-model="q"
            class="input"
            type="search"
            placeholder="搜索本地图标…"
          />
        </div>
        <ul class="list">
          <li v-for="item in hits" :key="item.id">
            <button type="button" class="hit" @click="go(item.id)">
              <span class="hit-name">{{ item.name }}</span>
              <span class="hit-kind">{{ item.kind }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 25;
  display: grid;
  place-items: start center;
  padding-top: 12vh;
  background: rgba(0, 0, 0, 0.28);
}
.box {
  width: min(520px, 92vw);
  border-radius: 16px;
  background: var(--drawer-bg);
  color: var(--text);
  padding: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 12px;
  font-size: 18px;
}
.input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 16px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 50vh;
  overflow: auto;
}
.hit {
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.hit:hover {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
}
.hit-name {
  font-size: 14px;
}
.hit-kind {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
