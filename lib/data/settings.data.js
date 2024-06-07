import { loadData, normalizeArrayData, watchFiles } from '../utility.js'
import { getVitepressMd } from '../markdown.js'

async function normalizeSettings(settings) {
	const data = normalizeArrayData(
		settings,
		['seealso', 'tags', 'values_enum']
	)

	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(data)) {
		if (!v) {
			delete data[k]
			continue
		}

		/* Style default entry. */
		if (v.default) {
			v.default = String(v.default)
			if (!v.default.startsWith('[[')) {
				v.default = '`' + v.default + '`'
			}
			v.default = md.renderInline(v.default)
		}

		/* Add markdown to seealso settings. */
		for (const [index, element] of v.seealso.entries()) {
			if (!element.startsWith('[[')) {
				v.seealso[index] = '[[setting,' + element + ']]'
			}
			v.seealso[index] = md.renderInline(element)
		}

		/* Plugin link. */
		if (v.plugin) {
			v.plugin_link = md.renderInline('[[plugin,' + v.plugin + ']]')
		}

		/* There can be multiple value entries. */
		if (!Array.isArray(v.values)) {
			v.values = [ v.values ]
		}

		for (const v2 of v.values) {
			v2.url = md.renderInline(v2.url)
		}

		for (const k2 of ['added', 'changed', 'deprecated', 'removed']) {
			if (v[k2]) {
				const changes = []
				for (const[k3, v3] of Object.entries(v[k2])) {
					changes.push({
						text: v3 ? md.render(v3.trim()) : null,
						version: md.renderInline('[[' + k2 + ',' + k3 + ']]')
					})
				}
				v[k2] = changes
			}
		}

		v.text = md.render(v.text.trim())
	}

	return data
}

export default {
	watch: await watchFiles(),
	async load() {
		return await normalizeSettings(
			(await loadData('settings')).settings
		)
	}
}
