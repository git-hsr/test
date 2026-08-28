<script setup lang="ts">
import { shallowRef, watch, computed } from 'vue'
import { useToolStore } from '../stores/toolStore'
import { useUiStore } from '../stores/uiStore'
import AppIcon from './AppIcon.vue'

const ICONS = ['code', 'palette', 'zap', 'folder', 'globe', 'notes', 'image', 'widget'] as const

const tools = useToolStore()
const ui = useUiStore()
const name = shallowRef('')
const icon = shallowRef<string>('code')
const description = shallowRef('')

const modal = computed(() => ui.categoryModal)

watch(
  modal,
  (m) => {
    if (!m) return
    name.value = m.category?.name ?? ''
    icon.value = m.category?.icon ?? 'code'
    description.value = m.category?.description ?? ''
  },
  { immediate: true },
)

function close() {
  ui.categoryModal = null
}

function save() {
  const m = modal.value
  if (!m) return
  const n = name.value.trim() || '未命名分组'
  if (m.mode === 'create') tools.addCategory(n, icon.value, description.value)
  else if (m.category) tools.updateCategory(m.category.id, { name: n, icon: icon.value, description: description.value })
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modal" class="mask" @click.self="close">
      <form class="dialog" @submit.prevent="save">
        <h2 class="title">{{ modal.mode === 'create' ? '新增分组' : '编辑分组' }}</h2>
        <label class="field">
          名称
          <input v-model="name" class="input" required />
        </label>
        <p class="field">图标</p>
        <div class="icons">
          <button
            v-for="item in ICONS"
            :key="item"
            type="button"
            class="ico"
            :class="{ 'is-on': icon === item }"
            :title="item"
            @click="icon = item"
          >
            <AppIcon :name="item" />
          </button>
        </div>
        <label class="field">
          描述
          <input v-model="description" class="input" />
        </label>
        <div class="actions">
          <button type="button" class="btn" @click="close">取消</button>
          <button type="submit" class="btn is-primary">保存</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 35;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.32);
}
.dialog {
  width: min(400px, 92vw);
  padding: 22px;
  border-radius: 16px;
  background: var(--drawer-bg);
  color: var(--text);
  display: grid;
  gap: 12px;
}
.title { margin: 0; font-size: 18px; }
.field {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
.input {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 10px;
  background: transparent;
  color: var(--text);
  font: inherit;
}
.icons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ico {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  font-size: 18px;
  border: 1px solid var(--line);
  background: transparent;
  color: inherit;
  border-radius: 8px;
  cursor: pointer;
}
.ico.is-on {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn {
  border: 1px solid var(--line);
  background: transparent;
  color: inherit;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn.is-primary {
  border: 0;
  background: var(--color-primary);
  color: #fff;
}
</style>
