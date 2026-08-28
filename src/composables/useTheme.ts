import { computed, watch } from 'vue'
import { createSharedComposable, useColorMode, useCssVar, useStorage } from '@vueuse/core'
import { AUX_COLORS, THEME_PRIMARIES, hexToRgb } from '../data/theme'

export const CUSTOM_PRIMARY_ID = 'custom'

function toHexColor(value: string): string {
  const hex = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  return '#409EFF'
}

export const useTheme = createSharedComposable(() => {
  const colorMode = useColorMode({ emitAuto: true, initialValue: 'auto' })
  const primaryId = useStorage('nav-theme-primary-v1', 'blue')
  const customColor = useStorage('nav-theme-custom-v1', '#409EFF')
  const primaryVar = useCssVar('--color-primary', document.documentElement, { initialValue: '#409EFF' })
  const primaryRgbVar = useCssVar('--color-primary-rgb', document.documentElement, { initialValue: '64 158 255' })
  const successVar = useCssVar('--color-success', document.documentElement, { initialValue: AUX_COLORS.success })
  const warningVar = useCssVar('--color-warning', document.documentElement, { initialValue: AUX_COLORS.warning })
  const dangerVar = useCssVar('--color-danger', document.documentElement, { initialValue: AUX_COLORS.danger })
  const infoVar = useCssVar('--color-info', document.documentElement, { initialValue: AUX_COLORS.info })

  const currentPrimary = computed(() => {
    if (primaryId.value === CUSTOM_PRIMARY_ID) return toHexColor(customColor.value)
    return THEME_PRIMARIES.find((p) => p.id === primaryId.value)?.color ?? '#409EFF'
  })

  watch(
    currentPrimary,
    (color) => {
      primaryVar.value = color
      primaryRgbVar.value = hexToRgb(color)
    },
    { immediate: true },
  )

  function setCustomColor(value: string) {
    customColor.value = toHexColor(value)
    primaryId.value = CUSTOM_PRIMARY_ID
  }

  successVar.value = AUX_COLORS.success
  warningVar.value = AUX_COLORS.warning
  dangerVar.value = AUX_COLORS.danger
  infoVar.value = AUX_COLORS.info

  return {
    colorMode,
    primaryId,
    customColor,
    currentPrimary,
    primaries: THEME_PRIMARIES,
    setCustomColor,
  }
})
