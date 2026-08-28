<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'

const now = useNow()

const time = computed(() =>
  new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now.value),
)

const date = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(now.value),
)
</script>

<template>
  <div class="clock">
    <p class="clock-time">{{ time }}</p>
    <p class="clock-date">{{ date }}</p>
  </div>
</template>

<style scoped>
.clock {
  text-align: center;
  color: #fff;
  text-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  user-select: none;
}
.clock-time {
  margin: 0;
  font-size: clamp(56px, 8vw, 88px);
  font-weight: 500;
  letter-spacing: 4px;
  line-height: 1;
}
.clock-date {
  margin: 10px 0 0;
  font-size: 16px;
  letter-spacing: 2px;
  opacity: 0.92;
}
</style>
