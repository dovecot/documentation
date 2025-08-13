import { addWatchPaths } from '../utility.js'
import { loadLua } from '../lua.js'

export default addWatchPaths({
	async load() {
		return await loadLua()
	}
})
