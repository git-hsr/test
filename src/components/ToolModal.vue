<script setup lang="ts">
import { computed, inject, shallowRef, watch } from 'vue'
import { useToolStore } from '../stores/toolStore'
import { useUiStore } from '../stores/uiStore'
import { gridColsKey } from '../composables/keys'
import { listWidgets } from '../widgets/registry'
import { clampSpan, DEFAULT_ICON_BG, faviconFor, iconBgOf, normalizeUrl } from '../utils/helpers'
import type { ToolItem } from '../types/tool'

const tools = useToolStore()
const ui = useUiStore()
const cols = inject(gridColsKey, computed(() => 8))

const name = shallowRef('')
const url = shallowRef('')
const icon = shallowRef('')
const description = shallowRef('')
const widgetId = shallowRef('notes')
const colSpan = shallowRef(1)
const rowSpan = shallowRef(1)
const showDescription = shallowRef(false)
const iconFill = shallowRef(false)
const iconBg = shallowRef(DEFAULT_ICON_BG)

const widgets = listWidgets()
const modal = computed(() => ui.toolModal)
const editing = computed(() => modal.value?.mode === 'edit')
const kind = computed(() => modal.value?.kind ?? 'link')
const isSystemLink = computed(() => {
  const t = modal.value?.tool
  return t?.type === 'system' && t.kind === 'link'
})

watch(
  modal,
  (m) => {
    if (!m) return
    const t = m.tool
    name.value = t?.name ?? ''
    url.value = t && t.kind === 'link' ? t.url : ''
    icon.value = t?.icon ?? ''
    description.value = t?.description ?? ''
    widgetId.value = t && t.kind === 'widget' ? t.widgetId : 'notes'
    colSpan.value = t?.colSpan ?? 1
    rowSpan.value = t?.rowSpan ?? 1
    showDescription.value = t?.showDescription ?? false
    iconFill.value = t?.iconFill ?? false
    iconBg.value = t ? iconBgOf(t) : DEFAULT_ICON_BG
  },
  { immediate: true },
)

function close() {
  ui.toolModal = null
}

function save() {
  const m = modal.value
  if (!m) return
  if (m.mode === 'create') {
    if (m.kind === 'link') {
      const href = normalizeUrl(url.value)
      tools.addLink({
        name: name.value.trim() || '未命名',
        url: href,
        icon: icon.value || faviconFor(href),
        description: description.value,
        iconFill: iconFill.value,
        iconBg: iconBg.value || DEFAULT_ICON_BG,
      })
    } else {
      const w = widgets.find((x) => x.id === widgetId.value)
      tools.addWidget({
        name: name.value.trim() || w?.name || '组件',
        widgetId: widgetId.value,
        icon: icon.value || w?.icon || 'widget',
        description: description.value,
        widgetConfig: { ...w?.defaultConfig },
      })
    }
  } else if (m.tool) {
    const span = clampSpan(colSpan.value, rowSpan.value, cols.value)
    const patch: Partial<ToolItem> = {
      name: name.value.trim() || m.tool.name,
      icon: icon.value,
      description: description.value,
      showDescription: showDescription.value,
      colSpan: span.colSpan,
      rowSpan: span.rowSpan,
      iconFill: iconFill.value,
      iconBg: iconBg.value || DEFAULT_ICON_BG,
    }
    if (m.tool.kind === 'link' && !isSystemLink.value) {
      Object.assign(patch, { url: normalizeUrl(url.value) })
    }
    if (m.tool.kind === 'widget') {
      Object.assign(patch, {
        widgetId: widgetId.value,
        widgetConfig: {
          ...(m.tool.widgetConfig ?? {}),
          url: url.value ? normalizeUrl(url.value) : m.tool.widgetConfig?.url,
        },
      })
    }
    tools.updateTool(m.tool.id, patch)
  }
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modal" class="mask" @click.self="close">
      <form class="dialog" @submit.prevent="save">
        <h2 class="title">{{ editing ? '编辑' : kind === 'link' ? '添加快捷方式' : '添加组件' }}</h2>

        <label class="field">
          名称
          <input v-model="name" class="input" required />
        </label>

        <label v-if="kind === 'link' || (editing && modal.tool?.kind === 'widget' && widgetId === 'webframe')" class="field">
          链接
          <input v-model="url" class="input" :disabled="isSystemLink" placeholder="https://" />
        </label>

        <label v-if="kind === 'widget'" class="field">
          组件
          <select v-model="widgetId" class="input" :disabled="editing">
            <option v-for="w in widgets" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </label>

        <label class="field">
          图标
          <input v-model="icon" class="input" placeholder="图标名或图片地址" />
        </label>

        <div v-if="!modal.tool || modal.tool.kind !== 'folder'" class="icon-opts">
          <label class="check">
            <input v-model="iconFill" type="checkbox" />
            图标铺满格子
          </label>
          <label class="field">
            图标背景
            <input v-model="iconBg" class="input is-color" type="color" />
          </label>
        </div>

        <label class="field">
          描述
          <input v-model="description" class="input" />
        </label>

        <div v-if="editing" class="row">
          <label class="field">
            列
            <input v-model.number="colSpan" class="input" type="number" min="1" max="4" />
          </label>
          <label class="field">
            行
            <input v-model.number="rowSpan" class="input" type="number" min="1" max="4" />
          </label>
        </div>

        <label v-if="editing" class="check">
          <input v-model="showDescription" type="checkbox" />
          显示描述
        </label>

        <div class="actions">
          <button type="button" class="btn" @click="close">取消</button>
          <button type="submit" class="btn is-primary">保存</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 35;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.32);
}
.dialog {
  width: min(420px, 92vw);
  padding: 22px;
  border-radius: 16px;
  background: var(--drawer-bg);
  color: var(--text);
  display: grid;
  gap: 12px;
}
.title {
  margin: 0;
  font-size: 18px;
}
.field {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
.input {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px 10px;
  background: transparent;
  color: var(--text);
  font: inherit;
}
.icon-opts {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 12px;
}
.icon-opts .check {
  padding-bottom: 6px;
}
.input.is-color {
  padding: 2px 4px;
  min-height: 36px;
  width: 72px;
  cursor: pointer;
}
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn {
  border: 1px solid var(--line);
  background: transparent;
  color: inherit;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn.is-primary {
  border-color: transparent;
  background: var(--color-primary);
  color: #fff;
}
</style>
