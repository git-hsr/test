<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: string }>()

const PATHS: Record<string, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
  code: 'M8 8 4 12l4 4M16 8l4 4-4 4M13 5l-2 14',
  palette: 'M12 4a8 8 0 1 0 0 16h1.2a2.4 2.4 0 0 0 2.1-3.6 2.4 2.4 0 0 1 2.1-3.6H18A8 8 0 0 0 12 4z',
  zap: 'M13 3 5 14h7l-1 7 8-11h-7z',
  notes: 'M7 4h10a1 1 0 0 1 1 1v14l-3-2-3 2-3-2-3 2V5a1 1 0 0 1 1-1zm2 5h6M9 13h6',
  folder: 'M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
  plus: 'M12 6v12M6 12h12',
  settings: 'M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zM4.6 14.2 3 13.3v-2.6l1.6-.9.6-1.5L4.4 6.7 6.7 4.4l1.6.8L9.8 4.6 10.7 3h2.6l.9 1.6 1.5.6 1.6-.8 2.3 2.3-.8 1.6.6 1.5L21 10.7v2.6l-1.6.9-.6 1.5.8 1.6-2.3 2.3-1.6-.8-1.5.6L13.3 21h-2.6l-.9-1.6-1.5-.6-1.6.8-2.3-2.3.8-1.6z',
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm6.5-1.5 3 3',
  close: 'M7 7l10 10M17 7 7 17',
  check: 'M5 12.5 10 17l9-10',
  image: 'M5 6h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm3 3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4.8 17l5.2-5.5 3.2 3.2 2.2-2.2L19 17',
  globe: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-8 8h16M12 4c2.4 2.6 3.6 5.4 3.6 8S14.4 17.4 12 20C9.6 17.4 8.4 14.6 8.4 12S9.6 6.6 12 4z',
  layout: 'M5 5h6v14H5zM13 5h6v6h-6zM13 13h6v6h-6z',
  copy: 'M8 8h10v12H8zM6 16H5V4h11v1',
  trash: 'M6 8h12l-1 12H7zm3-3h6M4 8h16M10 12v5M14 12v5',
  edit: 'M5 16.5V19h2.5L18 8.5 15.5 6 5 16.5zM13.8 7.7l2.5 2.5',
  sun: 'M12 6v-2M12 20v-2M6 12H4M20 12h-2M7 7 5.6 5.6M18.4 18.4 17 17M7 17l-1.4 1.4M18.4 5.6 17 7M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z',
  moon: 'M16 13.5A6.5 6.5 0 0 1 9.2 5.4 7 7 0 1 0 18.6 14.8 6.4 6.4 0 0 1 16 13.5z',
  monitor: 'M4 6h16v10H4zM8 20h8M12 16v4',
  widget: 'M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM15 15h2v4h-2zM17 15h2',
  chevron: 'M9 6l6 6-6 6',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
}

const d = computed(() => PATHS[props.name] ?? PATHS.globe)
</script>

<template>
  <svg class="app-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      :d="d"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.app-icon {
  width: 1em;
  height: 1em;
  display: block;
}
</style>
