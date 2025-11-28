import path from 'path'
import { lib_dirname } from './utility.js'

const download_base = 'datafiles'
const github_base = 'https://github.com/dovecot/documentation'

export const publicDataDir = path.resolve(lib_dirname, `../public/${download_base}`)

export const dataFileList = [
	createEntry(
		'doveadm.js',
		async () => {
		        const { loadDoveadm } = await import(path.resolve(lib_dirname, './doveadm.js'))
		        return await loadDoveadm()
		}
	),
	createEntry(
		'event_categories.js',
		async () => {
		        const { loadEventCategories } = await import(path.resolve(lib_dirname, './event_categories.js'))
		        return await loadEventCategories()
		}
	),
	createEntry(
		'event_reasons.js',
		async () => {
			const { loadEventReasons } = await import(path.resolve(lib_dirname, './event_reasons.js'))
			return await loadEventReasons()
		}
	),
	createEntry(
		'events.js',
		async () => {
		        const { loadEvents } = await import(path.resolve(lib_dirname, './events.js'))
		        return await loadEvents()
		}
	),
	createEntry(
		'lua.js',
		async () => {
		        const { loadLua } = await import(path.resolve(lib_dirname, './lua.js'))
		        return await loadLua()
		}
	),
	createEntry(
		'settings.js',
		async () => {
		        const { loadSettings } = await import(path.resolve(lib_dirname, './settings.js'))
		        return await loadSettings()
		}
	)
]

function createEntry(id, func) {
	const json = `${path.basename(id, '.js')}.json`

	return {
		data: func,
		download: `/${download_base}/${json}`,
		github: `${github_base}/blob/main/data/${id}`,
		json: path.resolve(publicDataDir, json),
		name: json
	}
}
