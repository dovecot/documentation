import { createContentLoader } from '../utility.js'

export default createContentLoader('**/core/config/auth/databases/!(index|overview).md', {
  includeSrc: false,
  transform(raw) {
    return raw
      .map(({ url, frontmatter }) => {
        return {
          title: frontmatter.title || url.split('/').pop().replace('.html', ''),
          url
        }
      })
      .sort((a, b) => a.title.localeCompare(b.title))
  }
})
