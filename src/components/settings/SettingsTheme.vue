<script setup lang="ts">
import { computed } from 'vue'
import { CUSTOM_PRIMARY_ID, useTheme } from '../../composables/useTheme'
import { AUX_COLORS } from '../../data/theme'
import AppIcon from '../AppIcon.vue'

const { colorMode, primaryId, customColor, primaries, setCustomColor } = useTheme()
const mode = computed(() => colorMode.store.value)
const isCustom = computed(() => primaryId.value === CUSTOM_PRIMARY_ID)

function setMode(next: 'light' | 'dark' | 'auto') {
  colorMode.store.value = next
}

function onCustomInput(event: Event) {
  const input = event.target as HTMLInputElement
  setCustomColor(input.value)
}
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h2 class="page-title">主题</h2>
      <p class="page-sub">配色与明暗模式</p>
    </header>

    <section class="card">
      <h3 class="card-title">模式</h3>
      <div class="modes">
        <button type="button" class="mode" :class="{ 'is-on': mode === 'light' }" @click="setMode('light')">
          <AppIcon name="sun" />
          浅色
        </button>
        <button type="button" class="mode" :class="{ 'is-on': mode === 'dark' }" @click="setMode('dark')">
          <AppIcon name="moon" />
          深色
        </button>
        <button type="button" class="mode" :class="{ 'is-on': mode === 'auto' }" @click="setMode('auto')">
          <AppIcon name="monitor" />
          跟随系统
        </button>
      </div>
    </section>

    <section class="card">
      <h3 class="card-title">主题色</h3>
      <div class="swatches">
        <button
          v-for="item in primaries"
          :key="item.id"
          type="button"
          class="swatch"
          :class="{ 'is-on': primaryId === item.id }"
          :style="{ background: item.color }"
          :title="item.id"
          @click="primaryId = item.id"
        />
        <label
          class="swatch swatch-pick"
          :class="{ 'is-on': isCustom }"
          :style="{ background: customColor }"
          title="自定义颜色"
        >
          <input class="swatch-input" type="color" :value="customColor" @input="onCustomInput" />
          <span class="swatch-plus" aria-hidden="true">
            <AppIcon name="plus" />
          </span>
        </label>
      </div>
    </section>

    <section class="card">
      <h3 class="card-title">辅助色</h3>
      <ul class="aux">
        <li><i class="dot" :style="{ background: AUX_COLORS.success }" /> Success</li>
        <li><i class="dot" :style="{ background: AUX_COLORS.warning }" /> Warning</li>
        <li><i class="dot" :style="{ background: AUX_COLORS.danger }" /> Danger</li>
        <li><i class="dot" :style="{ background: AUX_COLORS.info }" /> Info</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: 16px;
}
.page-head {
  margin-bottom: 4px;
}
.page-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
}
.page-sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}
.card {
  background: color-mix(in srgb, var(--color-primary) 10%, rgb(255 255 255 / 0.18));
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
  border-radius: 18px;
  padding: 18px 20px 20px;
  box-shadow: none;
}
:global(html.dark) .card {
  background: color-mix(in srgb, var(--color-primary) 12%, rgb(255 255 255 / 0.06));
  border-color: color-mix(in srgb, var(--color-primary) 28%, transparent);
}
.card-title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
}
.modes {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
}
.mode.is-on {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.swatch.is-on {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--color-primary);
}
.swatch-pick {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.swatch-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  opacity: 0;
  cursor: pointer;
}
.swatch-plus {
  pointer-events: none;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: #fff;
  mix-blend-mode: difference;
}
.aux {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}
.aux li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
</style>
