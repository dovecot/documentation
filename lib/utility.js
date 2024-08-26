/** Utility functions. **/

import fg from 'fast-glob'
import fs from 'fs'
import matter from 'gray-matter'
import { dirname } from 'path';
import { compile, match } from 'path-to-regexp'
import { fileURLToPath } from 'url';

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

export async function sourceFiles() {
	/* Check for config override file. */
	const lconf = await loadLocalConf()

	return lconf?.source_paths ?? [ 'docs/**/*.md' ]
}

export async function watchFiles() {
	/* Check for config override file. */
	const lconf = await loadLocalConf()

	return lconf?.watch_paths ??
		[ 'docs/**/*.md', 'docs/**/*.inc', 'data/**/*' ]
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

export async function frontmatterIter(callback) {
	const sf = await sourceFiles()
	const files = sf.flatMap((x) => fg.sync(x))

	/* Check for config override file. */
	const lconf = await loadLocalConf()
	const spt_conf = lconf?.source_path_translations ??
		{ 'docs/:path(.*)': ':path' }

	const spt = Object.entries(spt_conf).map(([from, to]) => ({
		toPath: compile(`/${to}`, { validate: false }),
		matchUrl: match(from.startsWith('^') ? new RegExp(from) : from)
	}))

	for (let f of files) {
		const str = fs.readFileSync(f, 'utf8')
		const data = matter(str).data

		for (const { matchUrl, toPath } of spt) {
			const res = matchUrl(f)
			if (res) {
				f = toPath(res.params).slice(1)
				break
			}
		}

		callback(f, data)
	}
}

export async function loadDovecotLinks(base) {
	const links = {}

	await frontmatterIter(function (f, data) {
		if (!data.dovecotlinks) {
			return
		}

		for (const [k,v] of Object.entries(data.dovecotlinks)) {
			if (links[k]) {
				throw new Error("Duplicate Dovecot Link key: " + k)
			}

			links[k] = {
				url: resolveURL(f.substring(0, f.lastIndexOf('.')) + '.html', base)
			}

			if ((typeof v) == 'object') {
				links[k].text = v.text
				if (v.hash) {
					links[k].url += '#' + v.hash
				}
			} else {
				links[k].text = v
			}
		}
	})

	const data = await loadData('links_overrides')

	/* Merge the two lists together. */
	return { ...links, ...data.links_overrides }
}

export function resolveURL(url, base) {
	return (base.endsWith('/') ? base.slice(0, -1) : base) + '/' + url
}

export function doBuildChecks() {
	// Running a local dev environment is considered a "CI build", since
	// we should not be doing expensive validity checking
	return (process.env.npm_lifecycle_event === 'docs:build-checks')
}
