<script setup lang="ts">
import { computed } from 'vue'
import { useGlass } from '../../composables/useGlass'

const { blur, alpha, reset } = useGlass()

const blurLabel = computed(() => `${Number(blur.value).toFixed(1)}px`)
const alphaLabel = computed(() => Number(alpha.value).toFixed(2))
const alphaPct = computed({
  get: () => Math.round(Number(alpha.value) * 100),
  set: (value: number) => {
    alpha.value = value / 100
  },
})
</script>

<template>
  <div class="page">
    <header class="page-head">
      <h2 class="page-title">外观</h2>
      <p class="page-sub">调节内容块的玻璃质感</p>
    </header>

    <section class="card">
      <div class="group">
        <label class="label">
          <span>模糊强度</span>
          <span class="val">{{ blurLabel }}</span>
        </label>
        <input v-model.number="blur" class="range" type="range" min="0" max="28" step="0.5" />
      </div>

      <div class="group">
        <label class="label">
          <span>玻璃透明度</span>
          <span class="val">{{ alphaLabel }}</span>
        </label>
        <input v-model.number="alphaPct" class="range" type="range" min="0" max="40" step="1" />
      </div>

      <div class="foot">
        <span>拖动滑块实时调节</span>
        <button type="button" class="reset" @click="reset">重置</button>
      </div>
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
  padding: 20px 22px 18px;
  box-shadow: none;
}
:global(html.dark) .card {
  background: color-mix(in srgb, var(--color-primary) 12%, rgb(255 255 255 / 0.06));
  border-color: color-mix(in srgb, var(--color-primary) 28%, transparent);
}
.group {
  margin-bottom: 18px;
}
.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}
.val {
  min-width: 52px;
  text-align: center;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--text) 6%, transparent);
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 13px;
}
.range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--text) 12%, transparent);
  outline: none;
}
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: 2px solid color-mix(in srgb, var(--color-primary) 45%, #fff);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.16);
}
.range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: 2px solid color-mix(in srgb, var(--color-primary) 45%, #fff);
}
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-size: 12px;
  color: var(--text-muted);
}
.reset {
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
}
.reset:hover {
  color: var(--text);
  background: color-mix(in srgb, var(--text) 6%, transparent);
}
</style>
