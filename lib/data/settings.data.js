import { addWatchPaths } from '../utility.js'
import { loadSettings } from '../settings.js'

export default addWatchPaths({
	async load() {
		return await loadSettings()
	}
})
