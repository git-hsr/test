import type { Component } from 'vue'
import NotesWidget from './notes/Index.vue'
import WebframeWidget from './webframe/Index.vue'

export interface WidgetDef {
  id: string
  name: string
  icon: string
  component: Component
  defaultConfig?: Record<string, unknown>
}

const registry = new Map<string, WidgetDef>()

export function registerWidget(def: WidgetDef) {
  registry.set(def.id, def)
}

export function getWidget(id: string) {
  return registry.get(id)
}

export function listWidgets() {
  return [...registry.values()]
}

export function registerBuiltinWidgets() {
  registerWidget({
    id: 'notes',
    name: '备忘录',
    icon: 'notes',
    component: NotesWidget,
  })
  registerWidget({
    id: 'webframe',
    name: '网页窗',
    icon: 'globe',
    component: WebframeWidget,
    defaultConfig: { url: 'https://vuejs.org' },
  })
}
