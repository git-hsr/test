<script setup lang="ts">
import { computed } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useWallpaper } from '../composables/useWallpaper'
import { wallpaperCss } from '../utils/helpers'

const { currentWallpaper } = useWallpaper()
const reduced = usePreferredReducedMotion()
const bg = computed(() => wallpaperCss(currentWallpaper.value))
const animate = computed(() => reduced.value !== 'reduce')
</script>

<template>
  <div class="stage">
    <Transition name="wall-fade" :css="animate">
      <div
        :key="bg"
        class="wallpaper"
        :style="{ backgroundImage: bg }"
      />
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-color: #1b3a4b;
}
.wallpaper {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-color: #1b3a4b;
}
.wall-fade-enter-active,
.wall-fade-leave-active {
  transition: opacity 1.2s ease;
}
.wall-fade-enter-active {
  z-index: 1;
}
.wall-fade-leave-active {
  z-index: 0;
}
.wall-fade-enter-from,
.wall-fade-leave-to {
  opacity: 0;
}
</style>
