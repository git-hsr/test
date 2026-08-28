import { computed, watch } from 'vue'
import {
  createSharedComposable,
  useCycleList,
  useDocumentVisibility,
  usePreferredReducedMotion,
} from '@vueuse/core'
import { useIntervalFn } from '@vueuse/shared'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'
import type { WallpaperConfig } from '../types/tool'

const DEFAULT_GRADIENT =
  'linear-gradient(145deg, #1b3a4b 0%, #3d5a80 42%, #98c1d9 100%)'

export const useWallpaper = createSharedComposable(() => {
  const { data: config, isFinished } = useIDBKeyval<WallpaperConfig>('nav-wallpaper-v1', {
    mode: 'static',
    slideshowInterval: 10,
    currentIndex: 0,
    list: [DEFAULT_GRADIENT],
  })

  const list = computed(() =>
    config.value?.list?.length ? config.value.list : [DEFAULT_GRADIENT],
  )

  const { state, index, next, go } = useCycleList(list)

  const currentWallpaper = computed(() => state.value || DEFAULT_GRADIENT)
  const visibility = useDocumentVisibility()
  const reduced = usePreferredReducedMotion()

  const { pause, resume } = useIntervalFn(
    () => {
      if (config.value?.mode === 'slideshow') next()
    },
    () => (config.value?.slideshowInterval ?? 10) * 1000,
    { immediate: false },
  )

  watch(isFinished, (ok) => {
    if (ok && config.value) go(config.value.currentIndex ?? 0)
  }, { immediate: true })

  watch(
    () => [config.value?.mode, visibility.value, reduced.value] as const,
    ([mode, vis, reduce]) => {
      if (mode === 'slideshow' && vis === 'visible' && reduce !== 'reduce') resume()
      else pause()
    },
    { immediate: true },
  )

  watch(index, (i) => {
    if (config.value) config.value.currentIndex = i
  })

  function addWallpaper(dataUrl: string) {
    if (!config.value) return
    const nextList = config.value.list.filter((x) => x !== DEFAULT_GRADIENT)
    nextList.push(dataUrl)
    config.value.list = nextList
    go(nextList.length - 1)
  }

  function removeWallpaper(i: number) {
    if (!config.value) return
    const nextList = config.value.list.filter((_, idx) => idx !== i)
    config.value.list = nextList.length ? nextList : [DEFAULT_GRADIENT]
    go(0)
  }

  function setMode(mode: WallpaperConfig['mode']) {
    if (config.value) config.value.mode = mode
  }

  function setIntervalSec(sec: number) {
    if (config.value) config.value.slideshowInterval = Math.max(3, sec)
  }

  return {
    config,
    currentWallpaper,
    addWallpaper,
    removeWallpaper,
    setMode,
    setIntervalSec,
    next,
    go,
  }
})
