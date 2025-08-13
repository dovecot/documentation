import { addWatchPaths } from '../utility.js'
import { loadDoveadm } from '../doveadm.js'

export default addWatchPaths({
	async load() {
		return await loadDoveadm()
	}
})
