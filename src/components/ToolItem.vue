<script setup lang="ts">
import { computed, inject } from 'vue'
import type { ToolItem } from '../types/tool'
import { accentFor, cardLayout, iconBgOf, iconFills, isLightColor, isOneByOne } from '../utils/helpers'
import { useToolAction } from '../composables/useToolAction'
import { consumeClickKey } from '../composables/keys'
import { getWidget } from '../widgets/registry'
import ToolGlyph from './ToolGlyph.vue'

const props = defineProps<{
  tool: ToolItem
  mergeTarget?: boolean
  dragging?: boolean
  inFolder?: boolean
  preview?: boolean
}>()

const emit = defineEmits<{
  pointerdown: [event: PointerEvent]
}>()

const { activate } = useToolAction()
const consumeClick = inject(consumeClickKey, () => false)

const layout = computed(() =>
  props.inFolder ? 'icon' : cardLayout(props.tool.colSpan, props.tool.rowSpan),
)
const inlineWidget = computed(() => {
  if (props.tool.kind !== 'widget' || props.inFolder) return false
  return !isOneByOne(props.tool.colSpan, props.tool.rowSpan)
})
const widgetTool = computed(() => (props.tool.kind === 'widget' ? props.tool : null))
const widgetComp = computed(() =>
  widgetTool.value ? getWidget(widgetTool.value.widgetId)?.component : undefined,
)
const isLink = computed(() => props.tool.kind === 'link')
const href = computed(() => (props.tool.kind === 'link' ? props.tool.url : undefined))
const showDesc = computed(() => props.tool.showDescription && layout.value !== 'icon')
const isFolder = computed(() => props.tool.kind === 'folder')
const accent = computed(() => accentFor(props.tool.id))
const fillIcon = computed(() => iconFills(props.tool))
const iconBg = computed(() => iconBgOf(props.tool))
const glyphFg = computed(() => (isLightColor(iconBg.value) ? '#1a1a1a' : '#fff'))

function onClick(event: MouseEvent) {
  if (props.preview) return
  const dragged = consumeClick()
  if (isLink.value) {
    if (dragged) event.preventDefault()
    return
  }
  event.preventDefault()
  if (dragged) return
  activate(props.tool, event)
}
</script>

<template>
  <component
    :is="preview ? 'div' : isLink ? 'a' : 'button'"
    class="tile"
    :class="[
      `is-${layout}`,
      {
        'is-merge': mergeTarget,
        'is-dragging': dragging,
        'is-widget': inlineWidget,
        'is-folder': isFolder,
        'is-preview': preview,
        'is-icon-fill': fillIcon && !isFolder,
      },
    ]"
    :data-tool-id="preview ? undefined : tool.id"
    :href="preview ? undefined : href"
    :target="preview || !isLink ? undefined : '_blank'"
    :rel="preview || !isLink ? undefined : 'noopener noreferrer'"
    :draggable="false"
    :type="preview || isLink ? undefined : 'button'"
    :style="{
      gridColumn: preview ? undefined : `span ${inFolder ? 1 : tool.colSpan}`,
      gridRow: preview ? undefined : `span ${inFolder ? 1 : tool.rowSpan}`,
      '--tile-accent': accent,
      '--icon-bg': iconBg,
      '--glyph-fg': layout === 'icon' && !isFolder ? glyphFg : undefined,
    }"
    @pointerdown="preview ? undefined : emit('pointerdown', $event)"
    @dragstart.prevent
    @click="onClick"
  >
    <div class="tile-body">
      <div v-if="inlineWidget && widgetComp && widgetTool" class="tile-widget">
        <component :is="widgetComp" :tool="widgetTool" />
        <p v-if="showDesc && tool.description" class="tile-desc">{{ tool.description }}</p>
      </div>
      <template v-else>
        <div class="tile-visual">
          <ToolGlyph :tool="tool" />
        </div>
        <p v-if="showDesc && tool.description" class="tile-desc">{{ tool.description }}</p>
      </template>
    </div>

    <div class="tile-meta">
      <span class="tile-name">{{ tool.name }}</span>
    </div>
  </component>
</template>

<style scoped>
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  min-width: 0;
  min-height: 0;
  padding: 0;
  font: inherit;
  user-select: none;
  -webkit-user-drag: none;
  user-drag: none;
}
.tile.is-dragging {
  opacity: 0.3;
  pointer-events: none;
}
.tile.is-preview {
  cursor: default;
  pointer-events: none;
}
.tile-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  color: #fff;
}
.tile.is-icon .tile-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.tile.is-merge .tile-body {
  transform: scale(1.06);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 55%, transparent);
}
.tile.is-icon .tile-body {
  width: 76%;
  aspect-ratio: 1;
  border-radius: 24%;
  overflow: hidden;
  background: var(--icon-bg, #fff);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  font-size: 28px;
}
.tile.is-icon.is-icon-fill .tile-body {
  background: var(--icon-bg, #fff);
}
.tile.is-folder.is-icon .tile-body {
  background: rgba(232, 226, 216, 0.28);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}
.tile.is-horizontal .tile-visual :deep(.img),
.tile.is-vertical .tile-visual :deep(.img),
.tile.is-square .tile-visual :deep(.img) {
  max-width: 48%;
  max-height: 48%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
}
.tile.is-horizontal .tile-body,
.tile.is-vertical .tile-body,
.tile.is-square .tile-body,
.tile.is-widget .tile-body {
  position: relative;
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  overflow: hidden;
  padding: 12px 14px 10px;
  box-sizing: border-box;
  background: color-mix(in srgb, var(--tile-accent) 34%, #fff);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
}
.tile.is-folder.is-horizontal .tile-body,
.tile.is-folder.is-vertical .tile-body,
.tile.is-folder.is-square .tile-body {
  background: color-mix(in srgb, #ece7de 70%, #fff);
}
.tile.is-widget .tile-body {
  padding: 0;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  backdrop-filter: blur(16px);
}
.tile.is-horizontal,
.tile.is-vertical,
.tile.is-square,
.tile.is-widget {
  justify-content: stretch;
}
.tile-visual {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  width: 100%;
  height: 100%;
  font-size: 42px;
  color: var(--tile-accent);
}
.tile.is-horizontal .tile-visual :deep(.letter),
.tile.is-vertical .tile-visual :deep(.letter),
.tile.is-square .tile-visual :deep(.letter) {
  color: var(--tile-accent);
}
.tile-widget {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
}
.tile-widget .tile-desc,
.tile.is-horizontal .tile-desc,
.tile.is-vertical .tile-desc,
.tile.is-square .tile-desc {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
}
.tile-meta {
  flex-shrink: 0;
  width: 100%;
  text-align: center;
  background: transparent;
  padding: 0 2px;
}
.tile-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.65);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tile-desc {
  flex-shrink: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  text-align: left;
  color: rgba(30, 36, 48, 0.62);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
