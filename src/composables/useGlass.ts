import { watch } from 'vue'
import { createSharedComposable, useCssVar, useStorage } from '@vueuse/core'

export const DEFAULT_GLASS_BLUR = 24
export const DEFAULT_GLASS_ALPHA = 0.15

export const useGlass = createSharedComposable(() => {
  const blur = useStorage('nav-glass-blur-v1', DEFAULT_GLASS_BLUR)
  const alpha = useStorage('nav-glass-alpha-v1', DEFAULT_GLASS_ALPHA)
  const blurVar = useCssVar('--glass-blur', document.documentElement, { initialValue: '24px' })
  const alphaVar = useCssVar('--glass-alpha', document.documentElement, { initialValue: '0.15' })

  watch(
    [blur, alpha],
    ([nextBlur, nextAlpha]) => {
      blurVar.value = `${nextBlur}px`
      alphaVar.value = String(nextAlpha)
    },
    { immediate: true },
  )

  function reset() {
    blur.value = DEFAULT_GLASS_BLUR
    alpha.value = DEFAULT_GLASS_ALPHA
  }

  return {
    blur,
    alpha,
    reset,
  }
})
