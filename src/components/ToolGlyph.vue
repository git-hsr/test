<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { ToolItem } from '../types/tool'
import { accentFor, hostLetter, iconBgOf, iconFills } from '../utils/helpers'
import { useToolStore } from '../stores/toolStore'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  tool: ToolItem
}>()

const tools = useToolStore()
const imgOk = shallowRef(true)
const letter = computed(() => hostLetter(props.tool.name))
const kids = computed(() =>
  props.tool.kind === 'folder' ? tools.childrenOf(props.tool.id).slice(0, 4) : [],
)
const slots = computed(() => {
  const list = kids.value
  return [0, 1, 2, 3].map((i) => list[i] ?? null)
})
const remoteIcon = computed(
  () =>
    Boolean(props.tool.icon) &&
    (props.tool.icon.startsWith('http') || props.tool.icon.startsWith('data:')),
)

const fills = computed(() => iconFills(props.tool))

function childAccent(child: ToolItem) {
  return accentFor(child.id)
}

function childLetter(child: ToolItem) {
  return hostLetter(child.name)
}

function childRemote(child: ToolItem) {
  return Boolean(child.icon) && (child.icon.startsWith('http') || child.icon.startsWith('data:'))
}

function childDotStyle(child: ToolItem) {
  if (childRemote(child)) {
    if (iconFills(child)) return undefined
    return { background: iconBgOf(child) }
  }
  return { background: childAccent(child) }
}

function onImgError() {
  imgOk.value = false
}
</script>

<template>
  <div v-if="tool.kind === 'folder'" class="glyph is-folder">
    <div class="mini">
      <span
        v-for="(child, i) in slots"
        :key="child?.id ?? `empty-${i}`"
        class="dot"
        :class="{
          'is-empty': !child,
          'has-img': Boolean(child && childRemote(child)),
          'is-fill': Boolean(child && childRemote(child) && iconFills(child)),
        }"
        :style="child ? childDotStyle(child) : undefined"
      >
        <template v-if="child">
          <img
            v-if="childRemote(child)"
            :src="child.icon"
            alt=""
            class="ico"
          />
          <AppIcon v-else-if="child.icon && !childRemote(child)" :name="child.icon" />
          <span v-else class="mini-letter">{{ childLetter(child) }}</span>
        </template>
      </span>
    </div>
  </div>
  <div v-else class="glyph" :class="{ 'has-img': imgOk && remoteIcon, 'is-fill': fills }">
    <img
      v-if="imgOk && remoteIcon"
      :src="tool.icon"
      alt=""
      class="img"
      @error="onImgError"
    />
    <AppIcon v-else-if="tool.icon && !remoteIcon" :name="tool.icon" />
    <span v-else class="letter">{{ letter }}</span>
  </div>
</template>

<style scoped>
.glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  color: var(--glyph-fg, #fff);
}
.img {
  display: block;
  max-width: 58%;
  max-height: 58%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
  -webkit-user-drag: none;
}
.glyph.is-fill .img {
  max-width: none;
  max-height: none;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.letter {
  font-weight: 700;
  font-size: 1.15em;
  color: inherit;
  letter-spacing: 0.02em;
}
.mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 3px;
  width: 100%;
  height: 100%;
  padding: 5px;
  box-sizing: border-box;
}
.dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 28%;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  color: #fff;
  font-size: 11px;
}
.dot.has-img,
.dot.is-empty {
  background: transparent;
}
.dot.has-img:not(.is-fill) {
  background: #fff;
}
.ico {
  display: block;
  max-width: 70%;
  max-height: 70%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
  -webkit-user-drag: none;
}
.dot.is-fill .ico {
  max-width: none;
  max-height: none;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-letter {
  font-size: 9px;
  font-weight: 700;
  color: #fff;
}
</style>
