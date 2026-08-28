<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore'

const ui = useUiStore()
const box = computed(() => ui.confirm)

function resolve(ok: boolean) {
  box.value?.resolve(ok)
  ui.confirm = null
}
</script>

<template>
  <Teleport to="body">
    <div v-if="box" class="mask">
      <div class="dialog" role="dialog" aria-modal="true">
        <h2 class="title">{{ box.title }}</h2>
        <p class="msg">{{ box.message }}</p>
        <div class="actions">
          <button type="button" class="btn" @click="resolve(false)">取消</button>
          <button type="button" class="btn is-danger" @click="resolve(true)">删除</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.36);
}
.dialog {
  width: min(360px, 92vw);
  padding: 22px;
  border-radius: 16px;
  background: var(--drawer-bg);
  color: var(--text);
}
.title { margin: 0 0 8px; font-size: 18px; }
.msg { margin: 0 0 18px; color: var(--text-muted); font-size: 14px; }
.actions { display: flex; justify-content: flex-end; gap: 8px; }
.btn {
  border: 1px solid var(--line);
  background: transparent;
  color: inherit;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn.is-danger {
  border: 0;
  background: var(--color-danger);
  color: #fff;
}
</style>
