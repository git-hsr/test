<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { WidgetTool } from '../../types/tool'
import { normalizeUrl } from '../../utils/helpers'

const props = defineProps<{ tool: WidgetTool }>()
const failed = shallowRef(false)

const url = computed(() => {
  const raw = String(props.tool.widgetConfig?.url ?? '')
  return raw ? normalizeUrl(raw) : ''
})

function openTab() {
  if (url.value) window.open(url.value, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="frame">
    <div class="frame-bar">
      <button type="button" class="frame-open" @click="openTab">新标签打开</button>
    </div>
    <iframe
      v-if="url && !failed"
      class="frame-body"
      :src="url"
      sandbox="allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
      referrerpolicy="no-referrer"
      title="网页窗"
      @error="failed = true"
    />
    <div v-else class="frame-empty">
      <p class="frame-hint">无法嵌入该页面</p>
      <button type="button" class="frame-open" @click="openTab">在新标签打开</button>
    </div>
  </div>
</template>

<style scoped>
.frame {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.frame-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 10px 0;
}
.frame-open {
  border: 0;
  background: color-mix(in srgb, var(--color-primary) 18%, transparent);
  color: var(--color-primary);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}
.frame-body {
  flex: 1;
  width: 100%;
  border: 0;
  margin-top: 6px;
  border-radius: 10px;
  background: #fff;
}
.frame-empty {
  flex: 1;
  display: grid;
  place-items: center;
  gap: 8px;
}
.frame-hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
