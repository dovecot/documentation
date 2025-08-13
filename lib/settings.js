import { getVitepressMd } from './markdown.js'
import { loadData, normalizeArrayData } from './utility.js'

/* List of Dovecot settings value types. */
export const setting_types = {
	BOOLEAN: {
		label: 'Boolean',
		url: '[[link,settings_types_boolean]]',
		default_required: true,
	},
	IPADDR: {
		label: 'IP Address(es)',
		url: '[[link,settings_types_ip]]',
		// Default: empty
	},
	SIZE: {
		label: 'Size',
		url: '[[link,settings_types_size]]',
		default_required: true,
	},
	STRING: {
		label: 'String',
		url: '[[link,settings_types_string]]'
		// Default: empty
	},
	STRING_NOVAR: {
		label: 'String Without Variables',
		url: '[[link,settings_types_string_novar]]'
		// Default: empty
	},
	/* This is a String entry, with specific allowable values. */
	ENUM: {
		label: 'String',
		url: '[[link,settings_types_string]]',
		enum_required: true,
	},
	TIME: {
		label: 'Time',
		url: '[[link,settings_types_time]]',
		default_required: true,
	},
	TIME_MSECS: {
		label: 'Time (milliseconds)',
		url: '[[link,settings_types_time_msecs]]',
		default_required: true,
	},
	UINT: {
		label: 'Unsigned Integer',
		url: '[[link,settings_types_uint]]',
		default_required: true,
	},
	OCTAL_UINT: {
		label: 'Octal Unsigned Integer',
		url: '[[link,settings_types_octal_uint]]',
		default_required: true,
	},
	URL: {
		label: 'URL',
		url: '[[link,settings_types_url]]'
		// Default: empty
	},
	FILE: {
		label: 'File',
		url: '[[link,settings_types_file]]'
		// Default: empty
	},
	NAMED_FILTER: {
		label: 'Named Filter',
		url: '[[link,settings_types_named_filter]]',
		no_default: true,
	},
	NAMED_LIST_FILTER: {
		label: 'Named List Filter',
		url: '[[link,settings_types_named_list_filter]]'
		// Default: empty
	},
	STRLIST: {
		label: 'String List',
		url: '[[link,settings_types_strlist]]'
		// Default: empty
	},
	BOOLLIST: {
		label: 'Boolean List',
		url: '[[link,settings_types_boollist]]'
		// Default: empty
	},
	IN_PORT: {
		label: 'Port Number',
		url: '[[link,settings_types_in_port]]',
		default_required: true,
	},
	GROUP: {
		label: 'Settings Group',
		url: '[[link,settings_groups_includes]]'
	}
}

function wrapInTag(str, tag) {
	if (tag)
		return `<${tag}>${str}</${tag}>`
	return str
}

/* Resolve links in given parameter. If no singular link is detected, it is
 * rendered with the provided tag surrounding the value. */
function normalizeString(md, str, tag = null) {
	let out = ''

	if (str) {
		/* FIXME: This makes the following .startsWith() call work,
		 * but might lead to type-specific errors, e.g. String({})
		 * yields '[object Object]'. This still needs to be verified
		 * manually. */
		out = String(str)
		if (!out.startsWith('[[')) {
			out = wrapInTag(out, tag)
		}
		return md.renderInline(out)
	}

	return str
}

/* Mark a plain item as an inter-settings dovecot-specific link, i.e.
 * [[setting,<item>]]. Don't process already marked links. */
function normalizeArray(md, arr) {
	if (arr) {
		return arr.map(entry => (
			md.renderInline(
				entry.startsWith('[[')
					? entry
					: `[[setting,${entry}]]`
			)
		))
	}

	return arr
}

async function normalizeSettings(settings) {
	const data = normalizeArrayData(
		settings,
		['dependencies', 'seealso', 'tags', 'values_enum']
	)

	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(data)) {
		if (!v) {
			delete data[k]
			continue
		}

		/* Style default entry. */
		if (!!v.default) {
			if (['string', 'number'].includes(typeof v.default) ||
				v.default instanceof String)
				v.default = normalizeString(md, v.default, 'code')
			else {
				let out = normalizeString(md, v.default.value ?? '', 'code')
				if (out.length > 0)
					out += '<br />'
				if (!!v.default.text)
					out += `${normalizeString(md, v.default.text ?? '')}`
				v.default = out
			}
		}

		/* Add list of dependencies. */
		v.dependencies = normalizeArray(md, v.dependencies)

		/* Add markdown to seealso settings. */
		v.seealso = normalizeArray(md, v.seealso)

		/* Plugin. */
		if (v.plugin) {
			v.plugin = [ v.plugin ].flat()
			v.plugin_link = v.plugin.map((x) =>
				md.renderInline('[[plugin,' + x + ']]')
			).join(', ')
		}

		/* There can be multiple value entries. */
		if (!Array.isArray(v.values)) {
			v.values = [ v.values ]
		}

		for (const v2 of v.values) {
			if (!v2) {
				throw new Error("Incorrect value type for " + k)
			}

			if (v2.default_required && (v.default === undefined)) {
				throw new Error("Default value missing for " + k)
			}
			if (v2.enum_required && !v.values_enum) {
				throw new Error("Enum array missing for " + k)
			}

			v2.url = md.renderInline(v2.url)

			if (v2.no_default) {
				v.no_default = true
			}
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

export async function loadSettings() {
	return await normalizeSettings(
		structuredClone(loadData('settings').settings)
	)
}
