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

export async function loadData(id) {
	let path = '../data/' + id + '.js'

	/* Check for config override file. */
	const lconf = await loadLocalConf()
	if (lconf && lconf.data_paths[id]) {
		path = lconf.data_paths[id]
	}

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
	if (lconf && lconf.source_paths) {
		return lconf.source_paths
	}

	return [ 'docs/**/*.md' ]
}

export async function watchFiles() {
	/* Check for config override file. */
	const lconf = await loadLocalConf()
	if (lconf && lconf.watch_paths) {
		return lconf.watch_paths
	}

	return [ 'docs/**/*.md', 'docs/**/*.inc', 'data/**/*' ]
}

export async function manFiles() {
	/* Check for config override file. */
	const lconf = await loadLocalConf()
	if (lconf && lconf.man_paths) {
		return lconf.man_paths
	}

	return [ 'docs/core/man/*.[[:digit:]].md' ]
}

export async function pluginFiles() {
	/* Check for config override file. */
	const lconf = await loadLocalConf()
	if (lconf && lconf.plugin_paths) {
		return lconf.plugin_paths
	}

	return [ 'docs/core/plugins/*.md' ]
}

export async function frontmatterIter(callback) {
	const sf = await sourceFiles()
	const files = sf.flatMap((x) => fg.sync(x))
	let spt = []
	let spt_conf = { 'docs/:path(.*)': ':path' }

	/* Check for config override file. */
	const lconf = await loadLocalConf()
	if (lconf && lconf.source_path_translations) {
		spt_conf = lconf.source_path_translations
	}

	spt = Object.entries(spt_conf).map(([from, to]) => ({
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
