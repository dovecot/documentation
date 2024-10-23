/** Utility functions. **/

import fg from 'fast-glob'
import fs from 'fs'
import matter from 'gray-matter'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const local_conf_path = __dirname + '/../.vitepress/local.js'

export function normalizeArrayData(data, keys) {
	for (const [k, v] of Object.entries(data)) {
		if (v) {
			/* Normalize entries. */
			for (const key of keys) {
				if (!v[key]) {
					v[key] = v[key] = []
				} else if (typeof v[key] === 'string') {
					v[key] = [ v[key] ]
				}
			}
		}
	}

	return data
}

let local_conf = null
async function loadLocalConf() {
	if (local_conf === null) {
		if (fs.existsSync(local_conf_path)) {
			local_conf = await import(local_conf_path)
		} else {
			local_conf = false
		}
	}

	return local_conf
}

export async function markdownExtension() {
	const lconf = await loadLocalConf()

	return {
		...{
			markdown: lconf.markdown_extend ?? {},
		},
		...(lconf.markdown_extend?.init?.() ?? {})
	}
}

export async function loadData(id) {
	/* Check for config override file. */
	const lconf = await loadLocalConf()
	const path = lconf?.data_paths?.[id] ??
		('../data/' + id + '.js')

	try {
		return await import(__dirname + '/' + path)
	} catch (e) {
		throw new Error('Unable to import module (' + __dirname + '/' +
			path + '):' + e)
	}
}

export function addWatchPaths(obj) {
	return {
		...obj,
		...{
			watch: globalThis.VITEPRESS_CONFIG.userConfig.themeConfig.dovecot?.watch_paths ?? [ 'docs/**/*.md', 'docs/**/*.inc', 'data/**/*' ]
		}
	}
}

export async function manFiles() {
	/* Check for config override file. */
	const lconf = await loadLocalConf()

	return lconf?.man_paths ??
		[ 'docs/core/man/*.[[:digit:]].md' ]
}

export async function manIncludes() {
	const lconf = await loadLocalConf()
	return lconf?.man_includes ??
		[ 'docs/core/man/include/*.inc' ]
}

export async function pluginFiles() {
	/* Check for config override file. */
	const lconf = await loadLocalConf()

	return lconf?.plugin_paths ??
		[ 'docs/core/plugins/*.md' ]
}

export function getExcludes(srcDirs = [ 'docs' ]) {
	const excludes = []

	frontmatterIter(
		srcDirs.flatMap((x) => fg.sync(x + '/**/*.md')),
		function (f, data) {
			/* Exclude all pages with "exclude" frontmatter present. */
			if (data.exclude) {
				excludes.push(f)
			}
		}
	)

	return excludes
}

export function frontmatterIter(files, callback) {
	for (let f of files) {
		try {
			const str = fs.readFileSync(f, 'utf8')
			callback(f, matter(str).data)
		} catch (err) {
			/* Ignore file not exist errors, since they can occur for
			 * dynamically generated paths (e.g. Release Notes). */
			if (err.code !== 'ENOENT') throw err
		}
	}
}

export function resolveURL(url, base) {
	return (base.endsWith('/') ? base.slice(0, -1) : base) + '/' + url
}
