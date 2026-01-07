import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {}
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

export function useNormalMessage(props) {
  // 渲染 Markdown 内容
  const renderedContent = computed(() => {
    if (!props.content) return ''

    let html = marked(props.content)

    // 添加古风样式类
    html = html
      .replace(/<h1>/g, '<h1 class="ink-h1">')
      .replace(/<h2>/g, '<h2 class="ink-h2">')
      .replace(/<h3>/g, '<h3 class="ink-h3">')
      .replace(/<p>/g, '<p class="ink-p">')
      .replace(/<ul>/g, '<ul class="ink-ul">')
      .replace(/<ol>/g, '<ol class="ink-ol">')
      .replace(/<li>/g, '<li class="ink-li">')
      .replace(/<blockquote>/g, '<blockquote class="ink-blockquote">')
      .replace(/<code>/g, '<code class="ink-code">')
      .replace(/<pre>/g, '<div class="ink-pre-wrapper"><pre class="ink-pre">')
      .replace(/<\/pre>/g, '</pre></div>')
      .replace(/<a /g, '<a class="ink-link" ')
      .replace(/<strong>/g, '<strong class="ink-strong">')
      .replace(/<em>/g, '<em class="ink-em">')

    return html
  })

  return {
    renderedContent
  }
}
