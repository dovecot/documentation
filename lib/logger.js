/* Standardized logging utility. */

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
	},

	fatal(message) {
		const err = new Error(message)
		const stack = err.stack.split('\n')

		/* The first line of stack is 'Error: message'.
		 * The second line is the call to logger.fatal().
		 * The third line is the actual location of the error. */
		const callSite = stack[2] ? stack[2].trim() : 'unknown location'

		console.error(`\n❌ FATAL ERROR: ${message}`)
		console.error(`   at ${callSite}\n`)
		process.exit(1)
	}
}
