<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore'

const ui = useUiStore()
const tip = computed(() => ui.tooltip)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="tip"
      class="tip"
      :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
    >
      {{ tip.text }}
    </div>
  </Teleport>
</template>

<style scoped>
.tip {
  position: fixed;
  z-index: 40;
  transform: translateY(-50%);
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--menu-bg);
  color: var(--text);
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}
</style>
