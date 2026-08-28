import type { SearchEngine } from '../types/tool'

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'baidu',
    name: '百度',
    icon: 'https://icons.duckduckgo.com/ip3/www.baidu.com.ico',
    searchUrl: 'https://www.baidu.com/s?wd=',
  },
  {
    id: 'google',
    name: '谷歌',
    icon: 'https://icons.duckduckgo.com/ip3/www.google.com.ico',
    searchUrl: 'https://www.google.com/search?q=',
  },
  {
    id: 'bing',
    name: '必应',
    icon: 'https://icons.duckduckgo.com/ip3/www.bing.com.ico',
    searchUrl: 'https://www.bing.com/search?q=',
  },
]
