import { addWatchPaths } from '../utility.js'
import { loadEventReasons } from '../event_reasons.js'

export default addWatchPaths({
	async load() {
		return await loadEventReasons()
	}
})
