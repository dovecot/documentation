import { createContentLoader } from 'vitepress'

export default createContentLoader('docs/core/config/auth/databases/*.md', {
  includeSrc: false,
  transform(raw) {
    return raw
      .filter(({ url }) => !url.endsWith('index.html') && !url.endsWith('overview.html') && !url.endsWith('/'))
      .map(({ url, frontmatter }) => {
        return {
          title: frontmatter.title || url.split('/').pop().replace('.html', ''),
          url
        }
      })
      .sort((a, b) => a.title.localeCompare(b.title))
  }
})
