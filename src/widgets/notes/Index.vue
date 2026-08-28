<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { WidgetTool } from '../../types/tool'

const props = defineProps<{ tool: WidgetTool }>()
const text = useStorage(`nav-note-${props.tool.id}`, '')
</script>

<template>
  <div class="notes">
    <textarea
      v-model="text"
      class="notes-input"
      placeholder="随手记下…"
      spellcheck="false"
    />
  </div>
</template>

<style scoped>
.notes {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 14px 14px 10px;
  box-sizing: border-box;
}
.notes-input {
  flex: 1;
  min-height: 0;
  width: 100%;
  resize: none;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text);
  font: inherit;
  line-height: 1.55;
}
</style>
