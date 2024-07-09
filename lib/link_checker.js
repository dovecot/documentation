import getHrefs from 'get-hrefs'
import linkCheck from 'link-check'
import { doBuildChecks } from './utility.js'

const linkCache = {}
const linkErrors = []

// A list of strings that should be ignored if it appears in URL
const ignores = [
	// Ignore links to "Edit Github Page"
	'https://github.com/dovecot/documentation/edit',
	// Ignore localhost links
	'://localhost',
	// Ignore example data
	'://10.10.10.1',
]

export function checkExternalLinks(context, extra_ignores = []) {
	if (!doBuildChecks()) {
		return
	}

	const i = ignores.concat(extra_ignores)

	getHrefs(context.content).forEach((url) => {
		if (url.startsWith('http') &&
			!linkCache[url] &&
			(i.find((elt) => url.includes(elt)) === undefined)) {
			linkCheck(url, {
				timeout: '15s'
			}, function (err, result) {
				if (err) {
					throw new Error(err)
				}
				if (result.status === 'dead') {
					linkErrors.push([ context.page, url, result.err ])
				}
			})

			linkCache[url] = true
		}
	})
}

export function outputBrokenLinks() {
	if (linkErrors.length) {
		linkErrors.forEach((err) => {
			console.error('Dead Link (' + err[0] + '): ' + err[1])
			if (err[2]) {
				console.error(err[2])
			}
			console.error('\n')
		})
		throw new Error('Dead links found')
	}
}
