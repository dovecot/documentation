import { addWatchPaths } from '../utility.js'
import { loadEvents } from '../events.js'

export default addWatchPaths({
	async load() {
		return await loadEvents()
	}
})
