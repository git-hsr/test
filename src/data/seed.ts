import { HOME_CATEGORY_ID, type Category, type ToolItem } from '../types/tool'
import { faviconFor } from '../utils/helpers'

function link(partial: {
  id: string
  name: string
  url: string
  categoryId: string
  order: number
  description: string
  type?: 'system' | 'custom'
  iconFill?: boolean
  iconBg?: string
}): ToolItem {
  return {
    kind: 'link',
    type: partial.type ?? 'system',
    icon: faviconFor(partial.url),
    colSpan: 1,
    rowSpan: 1,
    showDescription: true,
    folderId: null,
    iconFill: false,
    iconBg: '#ffffff',
    ...partial,
  }
}

export const seedCategories: Category[] = [
  { id: HOME_CATEGORY_ID, name: '首页', icon: 'home', type: 'system', order: 0, description: '默认桌面' },
  { id: 'dev', name: '开发', icon: 'code', type: 'custom', order: 1, description: '开发文档与工具' },
  { id: 'design', name: '设计', icon: 'palette', type: 'custom', order: 2, description: '设计灵感与资源' },
  { id: 'work', name: '效率', icon: 'zap', type: 'custom', order: 3, description: '效率与协作' },
]

export const seedTools: ToolItem[] = [
  link({
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    categoryId: HOME_CATEGORY_ID,
    order: 0,
    description: '代码托管与协作',
  }),
  link({
    id: 'stackoverflow',
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    categoryId: HOME_CATEGORY_ID,
    order: 1,
    description: '开发问答社区',
  }),
  link({
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com',
    categoryId: HOME_CATEGORY_ID,
    order: 2,
    description: '搜索与发现',
  }),
  {
    id: 'notes-home',
    kind: 'widget',
    widgetId: 'notes',
    name: '备忘录',
    icon: 'notes',
    type: 'system',
    categoryId: HOME_CATEGORY_ID,
    description: '随手记下待办',
    order: 3,
    colSpan: 2,
    rowSpan: 2,
    showDescription: false,
    folderId: null,
  },
  link({ id: 'vue', name: 'Vue', url: 'https://vuejs.org', categoryId: 'dev', order: 0, description: 'Vue 官方文档' }),
  link({ id: 'vite', name: 'Vite', url: 'https://vite.dev', categoryId: 'dev', order: 1, description: '下一代前端工具' }),
  link({ id: 'mdn', name: 'MDN', url: 'https://developer.mozilla.org', categoryId: 'dev', order: 2, description: 'Web 开发文档' }),
  link({ id: 'npm', name: 'npm', url: 'https://www.npmjs.com', categoryId: 'dev', order: 3, description: '包管理与检索' }),
  link({
    id: 'typescript',
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    categoryId: 'dev',
    order: 4,
    description: '类型化 JavaScript',
  }),
  link({ id: 'figma', name: 'Figma', url: 'https://www.figma.com', categoryId: 'design', order: 0, description: '协作设计工具' }),
  link({
    id: 'dribbble',
    name: 'Dribbble',
    url: 'https://dribbble.com',
    categoryId: 'design',
    order: 1,
    description: '设计灵感社区',
  }),
  link({
    id: 'unsplash',
    name: 'Unsplash',
    url: 'https://unsplash.com',
    categoryId: 'design',
    order: 2,
    description: '免费高质量图片',
  }),
  link({
    id: 'coolors',
    name: 'Coolors',
    url: 'https://coolors.co',
    categoryId: 'design',
    order: 3,
    description: '配色方案生成',
  }),
  link({ id: 'notion', name: 'Notion', url: 'https://www.notion.so', categoryId: 'work', order: 0, description: '笔记与知识库' }),
  link({
    id: 'excalidraw',
    name: 'Excalidraw',
    url: 'https://excalidraw.com',
    categoryId: 'work',
    order: 1,
    description: '手绘风白板',
  }),
  link({
    id: 'regex101',
    name: 'Regex101',
    url: 'https://regex101.com',
    categoryId: 'work',
    order: 2,
    description: '正则表达式调试',
  }),
  link({
    id: 'caniuse',
    name: 'Can I Use',
    url: 'https://caniuse.com',
    categoryId: 'work',
    order: 3,
    description: '浏览器兼容性查询',
    iconFill: true,
  }),
]
