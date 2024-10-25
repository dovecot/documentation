/** Utility functions. **/

import fg from 'fast-glob'
import fs from 'fs'
import matter from 'gray-matter'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export async function loadData(id) {
	const path = globalThis.VITEPRESS_CONFIG.userConfig.themeConfig.dovecot?.data_paths?.[id]
		?? ('../data/' + id + '.js')

	try {
		return await import(__dirname + '/' + path)
	} catch (e) {
		throw new Error('Unable to import module (' + __dirname + '/' +
			path + '):' + e)
	}
}

function _dovecotSetting(name, setting) {
	if (setting === undefined) {
		throw new Error("Missing '" + name + "' setting")
	}

	return setting
}

/* Bootstrap the configuration by reading the .vitepress/config.js file. */
export async function dovecotSettingBootstrap(name) {
	return _dovecotSetting(
		name,
		(await import(process.cwd() + '/.vitepress/config.js')).dovecotConfig?.[name]
	)
}

export function dovecotSetting(name) {
	return _dovecotSetting(
		name,
		globalThis.VITEPRESS_CONFIG.userConfig.themeConfig.dovecot?.[name]
	)
}

export function addWatchPaths(obj) {
	return { ...obj, ...{ watch: dovecotSetting('watch_paths') } }
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
