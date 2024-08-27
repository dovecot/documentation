import { loadData, normalizeArrayData, watchFiles } from '../utility.js'
import { getVitepressMd } from '../markdown.js'

/* Take the events list and normalize entries and process inheritance. */
function processInherit(i, ob) {
	let fields = {}

	if (i in ob.events) {
		fields = { ...fields, ...normalizeEventsFields(ob.events[i].fields) }
		if (ob.events[i].inherit) {
			fields = { ...fields, ...processInheritList(ob.events[i].inherit, ob) }
		}
	} else if (i in ob.inherits) {
		fields = { ...fields, ...normalizeEventsFields(ob.inherits[i].fields) }
		if (ob.inherits[i].inherit) {
			fields = { ...fields, ...processInheritList(ob.inherits[i].inherit, ob) }
		}
	}

	return fields
}

function processInheritList(i_list, ob) {
	/* Normalize inherit. */
	let inherit = i_list
	if (typeof i_list === 'string') {
		i_list = [ i_list ]
	}

	let fields = {}
	for (const i of i_list.values()) {
		fields = { ...fields, ...processInherit(i, ob) }
	}

	return fields
}

function normalizeEventsFields(fields) {
	let f = {}

	for (const[k, v] of Object.entries(fields)) {
		let v2
		if (typeof v === 'string') {
			v2 = { text: v }
		} else {
			v2 = v
		}

		f[k] = { ...{
			// This is a single value
			//added: false,
			// Need to normalize, as changed can be multiple values.
			changed: {},
			// This is a single value
			//deleted: false,
			// This is a single value
			//deprecated: false,
			text: false
		}, ...v2}
	}

	return f
}

async function normalizeEvents(events, global_inherits, inherits) {
	events = normalizeArrayData(
		events,
		['tags']
	)

	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(events)) {
		if (!v) {
			delete events[k]
			continue
		}

		/* Process inheritance. */
		let fields = normalizeEventsFields(global_inherits)
		if (v.fields) {
			fields = { ...fields, ...normalizeEventsFields(v.fields) }
		}
		if (v.inherit) {
			const ob = {
				events: events,
				inherits: inherits,
			}
			fields = { ...fields, ...processInheritList(v.inherit, ob) }
		}

		for (const [k2, v2] of Object.entries(fields)) {
			let text = v2.text.trim()

			/* Change entries. */
			for (const k3 of ['added', 'changed', 'deprecated', 'removed']) {
				if (v2[k3]) {
					for (const[k4, v4] of Object.entries(v2[k3])) {
						text += '<p>\n\n[[' + k3 + ',' + k4 + ']]' +
							(v4 ? (' ' + v4) : '') + '\n\n</p>'
					}
				}
			}

			v2.text = md.render(text)
		}

		v.fields = fields
		v.text = v.text ? md.render(v.text) : null
	}

	return events
}

export default {
	watch: await watchFiles(),
	async load() {
		const data = await loadData('events')
		return await normalizeEvents(
			structuredClone(data.events),
			structuredClone(data.global_inherits),
			structuredClone(data.inherits)
		)
	}
}
