<script setup lang="ts">
import { computed } from 'vue'
import { useToolStore } from '../stores/toolStore'
import { useUiStore } from '../stores/uiStore'
import ToolGrid from './ToolGrid.vue'
import AppIcon from './AppIcon.vue'

const tools = useToolStore()
const ui = useUiStore()

const folder = computed(() => {
  const id = ui.activeFolderId
  return id ? tools.getById(id) : undefined
})
const children = computed(() =>
  folder.value?.kind === 'folder' ? tools.childrenOf(folder.value.id) : [],
)

function close() {
  ui.activeFolderId = null
}
</script>

<template>
  <Teleport to="body">
    <div v-if="folder" class="mask" @pointerdown.self="close">
      <div class="panel">
        <div class="panel-head">
          <p class="panel-title">{{ folder.name }}</p>
          <button type="button" class="panel-close" aria-label="关闭" @click="close">
            <AppIcon name="close" />
          </button>
        </div>
        <ToolGrid :items="children" :folder-id="folder.id" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 22;
  display: grid;
  place-items: center;
  background: rgba(8, 12, 20, 0.28);
  backdrop-filter: blur(16px);
}
.panel {
  width: min(720px, calc(100vw - 48px));
  min-height: 280px;
  padding: 20px 22px 28px;
  border-radius: 28px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.panel-close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
  display: grid;
  place-items: center;
}
</style>
