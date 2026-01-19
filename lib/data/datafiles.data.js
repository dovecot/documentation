import { dataFileList } from '../datafiles.js'

const filedata = []
for (const d of dataFileList) {
	filedata.push({
		download: d.download,
		github: d.github,
		name: d.name
	})
}

export default {
	load() {
		return { files: filedata }
	}
}
