<script setup lang="ts">
import { computed } from 'vue'
import { useToolStore } from './stores/toolStore'
import { useUiStore } from './stores/uiStore'
import { useTheme } from './composables/useTheme'
import { useGlass } from './composables/useGlass'
import { useShortcuts } from './composables/useShortcuts'
import WallpaperLayer from './components/WallpaperLayer.vue'
import Clock from './components/Clock.vue'
import SearchBar from './components/SearchBar.vue'
import Sidebar from './components/Sidebar.vue'
import ToolGrid from './components/ToolGrid.vue'
import FolderPanel from './components/FolderPanel.vue'
import WidgetHost from './components/WidgetHost.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import WallpaperDialog from './components/WallpaperDialog.vue'
import ContextMenu from './components/ContextMenu.vue'
import Tooltip from './components/Tooltip.vue'
import LocalSearch from './components/LocalSearch.vue'
import ToolModal from './components/ToolModal.vue'
import CategoryModal from './components/CategoryModal.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

useTheme()
useGlass()
useShortcuts()
const tools = useToolStore()
const ui = useUiStore()

const desktopItems = computed(() => tools.visibleTools)
</script>

<template>
  <div class="app">
    <WallpaperLayer />
    <Sidebar />
    <main class="desktop" :class="{ 'is-minimal': ui.minimalMode }">
      <Clock v-show="!ui.minimalMode" />
      <SearchBar />
      <ToolGrid :items="desktopItems" />
    </main>
    <FolderPanel />
    <WidgetHost />
    <SettingsDrawer />
    <WallpaperDialog />
    <LocalSearch />
    <ToolModal />
    <CategoryModal />
    <ConfirmDialog />
    <Tooltip />
    <ContextMenu />
  </div>
</template>

<style scoped>
.app {
  height: 100%;
  min-height: 100%;
}
.desktop {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8vh 24px calc(88px + 16px) 104px;
  box-sizing: border-box;
  gap: 28px;
}
.desktop.is-minimal {
  padding-top: 4vh;
  gap: 16px;
}
</style>
