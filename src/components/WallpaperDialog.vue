<script setup lang="ts">
import { useUiStore } from '../stores/uiStore'
import AppIcon from './AppIcon.vue'
import WallpaperManager from './WallpaperManager.vue'

const ui = useUiStore()

function close() {
  ui.wallpaperOpen = false
}
</script>

<template>
  <Teleport to="body">
    <div v-if="ui.wallpaperOpen" class="mask" @click.self="close">
      <div class="sheet">
        <WallpaperManager>
          <template #close>
            <button type="button" class="icon-btn" aria-label="关闭" @click="close">
              <AppIcon name="close" />
            </button>
          </template>
        </WallpaperManager>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 32;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.34);
}
.sheet {
  width: min(640px, 92vw);
  padding: 20px;
  border-radius: 18px;
  background: var(--drawer-bg);
}
.icon-btn {
  border: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 18px;
  display: grid;
  place-items: center;
}
</style>
