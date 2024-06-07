import { doveadm_arg_types, doveadm_flag_types, getDoveadmCmdLine } from '../doveadm.js'
import { getVitepressMd } from '../markdown.js'
import { loadData, normalizeArrayData, watchFiles } from '../utility.js'
import slugify from '@sindresorhus/slugify'

const doveadm_userargs = {
	'all-users': {
		cli: 'A',
		type: doveadm_arg_types.BOOL,
		text: `Apply operation to all users.`
	},
	'socket-path': {
		cli: 'S',
		type: doveadm_arg_types.STRING,
		text: `Path to doveadm socket.`
	},
	user: {
		cli: 'u',
		type: doveadm_arg_types.STRING,
		text: `UID of user to apply operation to.`,
	},
}

const doveadm_userfileargs = {
	/* Hidden from documentation.
	'trans-flags': {
		type: doveadm_arg_types.INTEGER,
		text: `Transaction flags.`
	},
	*/
	'user-file': {
		cli: 'F',
		type: doveadm_arg_types.STRING,
		text: `A filename. If set, fetch usernames from file. One username per line.`
	},
}

function typeToString(type) {
	switch (type) {
	case doveadm_arg_types.ARRAY:
		return 'array';
	case doveadm_arg_types.BOOL:
		return 'boolean';
	case doveadm_arg_types.INTEGER:
		return 'integer';
	case doveadm_arg_types.STRING:
		return 'string';
	case doveadm_arg_types.SEARCH_QUERY:
		return 'search_query';
	case doveadm_arg_types.ISTREAM:
		return 'istream';
	}
}

function argToHttpParam(arg) {
	return arg.split('-').reduce((s, c) =>
		s + (c.charAt(0).toUpperCase() + c.slice(1)))
}

async function normalizeDoveadm(doveadm) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(doveadm)) {
		if (!v) {
			delete doveadm[k]
			continue
		}

		if (v.flags && (v.flags & doveadm_flag_types.USER)) {
			v.args = { ...v.args, ...doveadm_userargs }
		}

		if (v.flags && (v.flags & doveadm_flag_types.USERFILE)) {
			v.args = { ...v.args, ...doveadm_userfileargs }
		}

		/* Convert 'man' entry into a markdown link to man page.
		 * We will add the hash to all URLs for simplicity; for those man
		 * pages that don't have individual command names, this will just
		 * be ignored by the browser. */
		if (v.man) {
			v.man_link = md.renderInline('[[man,' + v.man + ',' + slugify(k) + ']]')
		}

		/* Change entries. */
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

		/* Return values. */
		if (v.fields) {
			const fields = []
			for (const [k2, v2] of Object.entries(v.fields)) {
				fields.push({
					key: k2,
					value: v2 ? md.renderInline(String(v2)) : null
				})
			}
			v.fields = fields
		}
		if (!v.fields || !v.fields.length) {
			delete v['fields']
		}

		/* Text Description. */
		if (v.text) {
			v.text = md.render(v.text)
		}

		/* Cmd line arguments. */
		v.usage = k + (v.args ? ' ' + getDoveadmCmdLine(v.args) : '')

		if (v.args) {
			const args = []
			for (const [k2, v2] of Object.entries(v.args)) {
				if (!v2.hidden) {
					args.push({
						flag: v2.cli ? '-' + v2.cli : (v2.positional ? k2 : '--' + k2),
						param: argToHttpParam(k2),
						type: typeToString(v2.type),
						text: v2.text ? md.render(v2.text) : null
					})
				}
			}
			v.args = args
		}
		if (!v.args || !v.args.length) {
			delete v['args']
		}
	}

	return {
		doveadm: normalizeArrayData(
			doveadm,
			['tags']
		),
		http_api_link: md.renderInline('[[link,doveadm_http_api,HTTP API]]')
	}
}

export default {
	watch: await watchFiles(),
	async load() {
		return await normalizeDoveadm(
			(await loadData('doveadm')).doveadm
		)
	}
}
