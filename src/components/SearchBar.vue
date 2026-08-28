<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { SEARCH_ENGINES } from '../data/engines'
import { useUiStore } from '../stores/uiStore'
import AppIcon from './AppIcon.vue'

const ui = useUiStore()
const query = shallowRef('')
const inputRef = useTemplateRef<HTMLInputElement>('searchInput')

const engineIndex = computed(() => {
  const i = SEARCH_ENGINES.findIndex((e) => e.id === ui.activeEngineId)
  return i >= 0 ? i : 0
})
const engine = computed(() => SEARCH_ENGINES[engineIndex.value])

function cycleEngine() {
  const next = SEARCH_ENGINES[(engineIndex.value + 1) % SEARCH_ENGINES.length]
  ui.activeEngineId = next.id
}

function searchHref() {
  return engine.value.searchUrl + encodeURIComponent(query.value.trim())
}

function onSubmit(event: Event) {
  event.preventDefault()
  if (!query.value.trim()) return
  const a = document.createElement('a')
  a.href = searchHref()
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.click()
}

onKeyStroke('Tab', (event) => {
  if (document.activeElement !== inputRef.value) return
  event.preventDefault()
  cycleEngine()
})
</script>

<template>
  <form class="search" @submit="onSubmit">
    <button type="button" class="search-engine" :title="`${engine.name}（Tab 切换）`" @click="cycleEngine">
      <img :src="engine.icon" :alt="engine.name" class="search-favicon" />
    </button>
    <input
      ref="searchInput"
      v-model="query"
      class="search-input"
      type="search"
      name="q"
      autocomplete="off"
      :placeholder="`在 ${engine.name} 中搜索`"
    />
    <button type="submit" class="search-go" aria-label="搜索">
      <AppIcon name="search" />
    </button>
  </form>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  width: min(640px, 92vw);
  height: 52px;
  padding: 0 8px 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--surface));
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(18px);
}
.search-engine,
.search-go {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.search-favicon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.search-input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 15px;
}
.search-input::placeholder {
  color: var(--text-muted);
}
</style>
