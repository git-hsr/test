<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useFileDialog } from '@vueuse/core'
import { useWallpaper } from '../composables/useWallpaper'
import { wallpaperCss } from '../utils/helpers'
import AppIcon from './AppIcon.vue'

const { config, setMode, setIntervalSec, go, addWallpaper, removeWallpaper } = useWallpaper()
const { files, open } = useFileDialog({ accept: 'image/*', multiple: false, reset: true })

const reading = shallowRef(false)
const progress = shallowRef(0)
let reader: FileReader | null = null

function resetRead() {
  reading.value = false
  progress.value = 0
  reader = null
}

function readImage(file: File) {
  reader?.abort()
  reading.value = true
  progress.value = 8
  const next = new FileReader()
  reader = next
  next.onprogress = (event) => {
    if (!event.lengthComputable) return
    progress.value = Math.max(8, Math.round((event.loaded / event.total) * 90))
  }
  next.onload = () => {
    progress.value = 96
    addWallpaper(String(next.result ?? ''))
    progress.value = 100
    window.setTimeout(() => {
      if (reader === next) resetRead()
    }, 280)
  }
  next.onerror = () => {
    resetRead()
  }
  next.onabort = () => {
    resetRead()
  }
  next.readAsDataURL(file)
}

watch(files, (list) => {
  const file = list?.[0]
  if (file) readImage(file)
})
</script>

<template>
  <div class="wall">
    <header class="wall-head">
      <h2 class="wall-title">壁纸</h2>
      <slot name="close" />
    </header>

    <div class="modes">
      <button type="button" class="chip" :class="{ 'is-on': config?.mode === 'static' }" @click="setMode('static')">
        静态
      </button>
      <button type="button" class="chip" :class="{ 'is-on': config?.mode === 'slideshow' }" @click="setMode('slideshow')">
        轮播
      </button>
      <label v-if="config?.mode === 'slideshow'" class="interval">
        间隔(秒)
        <input
          class="num"
          type="number"
          min="3"
          :value="config.slideshowInterval"
          @change="setIntervalSec(Number(($event.target as HTMLInputElement).value))"
        />
      </label>
    </div>

    <div class="list">
      <div
        v-for="(item, i) in config?.list ?? []"
        :key="i"
        class="card"
        :class="{ 'is-on': config?.currentIndex === i }"
        :style="{ backgroundImage: wallpaperCss(item) }"
        @click="go(i)"
      >
        <button type="button" class="del" aria-label="删除" @click.stop="removeWallpaper(i)">
          <AppIcon name="trash" />
        </button>
      </div>
      <button
        type="button"
        class="card is-add"
        :class="{ 'is-busy': reading }"
        :disabled="reading"
        :aria-busy="reading"
        @click="open()"
      >
        <template v-if="reading">
          <span class="pct">{{ progress }}%</span>
          <span
            class="track"
            role="progressbar"
            aria-label="上传进度"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="progress"
          >
            <span class="fill" :style="{ width: `${progress}%` }" />
          </span>
        </template>
        <template v-else>
          <AppIcon name="plus" />
          上传图片
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.wall {
  color: var(--text);
}
.wall-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.wall-title { margin: 0; font-size: 18px; }
.modes {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.chip {
  border: 1px solid var(--line);
  background: transparent;
  color: inherit;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
}
.chip.is-on {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.interval {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.num {
  width: 64px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 4px 6px;
  background: transparent;
  color: var(--text);
}
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.card {
  position: relative;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
}
.card.is-on { border-color: var(--color-primary); }
.card.is-add {
  display: grid;
  place-items: center;
  gap: 8px;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  font-size: 12px;
}
.card.is-add.is-busy {
  cursor: wait;
  grid-template-rows: auto auto;
  align-content: center;
  padding: 12px;
}
.card.is-add:disabled {
  opacity: 1;
}
.pct {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}
.track {
  display: block;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--line) 80%, transparent);
  overflow: hidden;
}
.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary);
  transition: width 0.16s ease;
}
.del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
}
</style>
