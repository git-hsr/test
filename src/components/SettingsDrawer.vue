<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { useScrollLock } from '@vueuse/core'
import { useUiStore } from '../stores/uiStore'
import AppIcon from './AppIcon.vue'
import SettingsTheme from './settings/SettingsTheme.vue'
import SettingsAppearance from './settings/SettingsAppearance.vue'

type SettingsTab = 'theme' | 'appearance'

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'theme', label: '主题', icon: 'palette' },
  { id: 'appearance', label: '外观', icon: 'layout' },
]

const ui = useUiStore()
const tab = shallowRef<SettingsTab>('theme')
const lock = useScrollLock(document)

watch(
  () => ui.settingsOpen,
  (open) => {
    lock.value = open
    if (open) tab.value = 'theme'
  },
  { immediate: true },
)

function close() {
  ui.settingsOpen = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="ui.settingsOpen" class="shade" @click.self="close">
        <aside class="panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <nav class="nav" aria-label="设置栏目">
            <div class="nav-brand">
              <span class="nav-mark" aria-hidden="true">
                <AppIcon name="settings" />
              </span>
              <p id="settings-title" class="nav-name">设置</p>
            </div>
            <button
              v-for="item in TABS"
              :key="item.id"
              type="button"
              class="nav-item"
              :class="{ 'is-on': tab === item.id }"
              @click="tab = item.id"
            >
              <span class="nav-ico">
                <AppIcon :name="item.icon" />
              </span>
              {{ item.label }}
            </button>
          </nav>

          <section class="main">
            <button type="button" class="icon-btn" aria-label="关闭" @click="close">
              <AppIcon name="close" />
            </button>
            <Transition name="set-fade">
              <SettingsTheme v-if="tab === 'theme'" key="theme" />
              <SettingsAppearance v-else key="appearance" />
            </Transition>
          </section>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.shade {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  justify-content: flex-end;
  background: rgba(8, 12, 20, 0.12);
}
.panel {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  width: min(820px, 86vw);
  height: 100%;
  border-radius: 24px 0 0 24px;
  overflow: hidden;
  color: var(--text);
  background: color-mix(in srgb, rgb(var(--color-primary-rgb) / 0.2) 38%, rgb(255 255 255 / 0.32));
  backdrop-filter: blur(28px) saturate(1.2);
  -webkit-backdrop-filter: blur(28px) saturate(1.2);
  box-shadow: -18px 0 56px rgba(0, 0, 0, 0.18);
}
:global(html.dark) .panel {
  background: color-mix(in srgb, rgb(var(--color-primary-rgb) / 0.28) 42%, rgb(22 26 34 / 0.48));
}
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 22px 12px 16px;
  background: color-mix(in srgb, var(--text) 6%, transparent);
  color: var(--text);
}
.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 16px;
}
.nav-mark {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--color-primary) 22%, transparent);
  color: var(--color-primary);
  font-size: 16px;
}
.nav-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  border-radius: 10px;
  padding: 10px 12px 10px 14px;
  cursor: pointer;
  font-size: 14px;
}
.nav-item.is-on {
  background: color-mix(in srgb, var(--color-primary) 16%, transparent);
}
.nav-item.is-on::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 999px;
  background: var(--color-primary);
}
.nav-ico {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 15px;
  flex-shrink: 0;
}
.main {
  position: relative;
  overflow: auto;
  padding: 28px 32px 32px;
  background: transparent;
}
.icon-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.drawer-enter-active,
.drawer-leave-active {
  transition: background-color 0.28s ease;
}
.drawer-enter-active .panel,
.drawer-leave-active .panel {
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  background-color: transparent;
}
.drawer-enter-from .panel,
.drawer-leave-to .panel {
  transform: translateX(100%);
}
.set-fade-enter-active,
.set-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.set-fade-leave-active {
  position: absolute;
  inset: 28px 32px 32px;
}
.set-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.set-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
