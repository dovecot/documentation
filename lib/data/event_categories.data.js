import { loadEventCategories } from '../event_categories.js'
import { addWatchPaths } from '../utility.js'

export default addWatchPaths({
	async load() {
		return await loadEventCategories()
	}
})
