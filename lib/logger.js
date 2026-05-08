/* Standardized logging utility for Dovecot Vitepress. */

if (!globalThis.__LOGGED_ONCE__) {
	globalThis.__LOGGED_ONCE__ = new Set()
}

let logQueue = Promise.resolve()

export const logger = {
	success(message, { once = false, newline = false } = {}) {
		if (once) {
			if (globalThis.__LOGGED_ONCE__.has(message)) return
			globalThis.__LOGGED_ONCE__.add(message)
		}

		logQueue = logQueue.then(() => {
			console.log(`${newline ? '\n' : ''}✅ ${message}.`)
		})
	}
}
