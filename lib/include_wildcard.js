/* Wildcard support for VitePress Markdown file inclusion.
 *
 * VitePress itself supports only including a single file:
 *
 *   <!-- @include: include/2.4.6-foo.inc -->
 *
 * This plugin expands a '*' wildcard in the filename part of the path to
 * one include line per matching file, sorted by name, before VitePress
 * processes the includes:
 *
 *   <!-- @include: include/2.4.6-list-*.inc -->
 *
 * This allows each change to add a new file instead of modifying the same
 * lines in the including page.
 *
 * A wildcard matching no files is a build error.
 *
 * Only the top-level Markdown page is expanded, not the included files. */

import fs from 'fs'
import path from 'path'

/* Same as VitePress processIncludes(). */
const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g

function resolveInclude(srcDir, file, include) {
	if (include[0] === '@') {
		return path.join(srcDir,
			include.slice(include[1] === '/' ? 2 : 1))
	}
	return path.join(path.dirname(file), include)
}

function wildcardRE(pattern) {
	const parts = pattern.split('*').map(
		(s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
	return new RegExp('^' + parts.join('.*') + '$')
}

function expandIncludes(srcDir, src, file) {
	return src.replace(includesRE, (m, include) => {
		if (!include.includes('*')) return m

		/* VitePress #region or {start,end} suffix */
		if (/(#[\w-]+)?(\{\d*,\d*\})?$/.exec(include)[0] !== '') {
			throw new Error(`${file}: Wildcard include can't have a region or line range: ${include}`)
		}
		const pos = include.lastIndexOf('/')
		const dir = include.slice(0, pos + 1)
		const pattern = include.slice(pos + 1)
		if (dir.includes('*')) {
			throw new Error(`${file}: Wildcard is supported only in the include filename: ${include}`)
		}

		const re = wildcardRE(pattern)
		const dirPath = resolveInclude(srcDir, file, dir || '.')
		const names = fs.readdirSync(dirPath)
			.filter((name) => re.test(name))
			.sort()
		if (names.length === 0) {
			throw new Error(`${file}: Wildcard include matched no files: ${include}`)
		}

		return names.map((name) => `<!-- @include: ${dir}${name} -->`)
			.join('\n\n')
	})
}

export function dovecotIncludeWildcardPlugin() {
	let srcDir
	return {
		name: 'dovecot-include-wildcard',
		/* Must run before the VitePress plugin processes the includes. */
		enforce: 'pre',
		configResolved(config) {
			srcDir = config.vitepress.srcDir
		},
		transform(code, id) {
			if (!id.endsWith('.md')) return
			return expandIncludes(srcDir, code, id)
		}
	}
}
