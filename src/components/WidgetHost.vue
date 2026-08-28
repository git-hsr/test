<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useToolStore } from '../stores/toolStore'
import { useUiStore } from '../stores/uiStore'
import { getWidget } from '../widgets/registry'
import AppIcon from './AppIcon.vue'

const tools = useToolStore()
const ui = useUiStore()
const box = useTemplateRef<HTMLElement>('box')

const tool = computed(() => {
  const id = ui.activeWidgetToolId
  const item = id ? tools.getById(id) : undefined
  return item?.kind === 'widget' ? item : undefined
})
const comp = computed(() => (tool.value ? getWidget(tool.value.widgetId)?.component : undefined))
const pos = computed(() => {
  const a = ui.widgetAnchor
  const x = Math.min(a?.x ?? 80, window.innerWidth - 340)
  const y = Math.min(a?.y ?? 80, window.innerHeight - 280)
  return { left: `${x}px`, top: `${y}px` }
})

function close() {
  ui.activeWidgetToolId = null
}

onClickOutside(box, close)
</script>

<template>
  <Teleport to="body">
    <div v-if="tool && comp" ref="box" class="host" :style="pos">
      <div class="host-bar">
        <span>{{ tool.name }}</span>
        <button type="button" class="icon-btn" aria-label="关闭" @click="close">
          <AppIcon name="close" />
        </button>
      </div>
      <div class="host-body">
        <component :is="comp" :tool="tool" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.host {
  position: fixed;
  z-index: 20;
  width: 320px;
  height: 240px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: var(--surface);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
  color: var(--text);
  overflow: hidden;
}
.host-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 0 14px;
  font-size: 13px;
  font-weight: 600;
}
.icon-btn {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.host-body {
  flex: 1;
  min-height: 0;
}
</style>
