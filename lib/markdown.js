import containerPlugin from 'markdown-it-container'
import deflistPlugin from 'markdown-it-deflist'
import { createMarkdownRenderer } from 'vitepress'
import { loadData, loadDovecotLinks, resolveURL } from './utility.js'

export async function dovecotMdExtend(md) {
	md.use(containerPlugin, 'todo', {
		render: function(tokens, idx) {
			if (tokens[idx].nesting === 1) {
				return '<div class="caution custom-block">\n<p class="custom-block-title">⚠️ TODO</p>'
			} else {
				return '</div>\n'
			}
		}
	})
	md.use(deflistPlugin)
	md.use(dovecot_markdown, {
		dovecotlinks: await loadDovecotLinks(),
		updates: (await loadData('updates')).updates
	})

	return md
}

let vitepress_md = null

export async function getVitepressMd() {
	if (vitepress_md === null) {
		const config = globalThis.VITEPRESS_CONFIG

		vitepress_md = await dovecotMdExtend(await createMarkdownRenderer(
			config.srcDir,
			config.markdown,
			config.site.base,
			config.logger
		))
	}

	return vitepress_md
}

/* This is a dovecot markdown extension to support the "[[...]]" syntax.
 * Much of this is copied from existing markdown-it plugins. See, e.g.,
 * https://github.com/markdown-it/markdown-it-sub/blob/master/index.mjs */
function dovecot_markdown(md, opts) {
	function process_brackets(state, silent) {
		const max = state.posMax
		const start = state.pos

		if (silent) { return false }
		/* Need at least '[[x]]' */
		if (start + 4 >= max) { return false }
		/* 0x5B = [ */
		if (state.src.charCodeAt(start) !== 0x5B ||
			state.src.charCodeAt(start + 1) !== 0x5B) { return false }

		state.pos = start + 2
		let found = false

		while (state.pos < max) {
			/* 0x5D = ] */
			if (state.src.charCodeAt(state.pos) === 0x5D &&
				(state.pos + 1) <= max &&
				state.src.charCodeAt(state.pos + 1) === 0x5D) {
				found = true
				break
			}

			state.md.inline.skipToken(state)
		}

		if (!found) {
			state.pos = start
			return false
		}

		// found!
		const content = state.src.slice(start + 2, state.pos)
		state.posMax = state.pos
		state.pos = start + 2

		// Now, break apart content to determine command
		// parts[0] is the command, parts[1..] is the data
		const parts = content.split(',').map((x) => x.trim())

		let token = state.push('dovecot_open', 'dovecot', 0)
		token.attrSet('mode', parts[0])
		token.attrSet('parts', parts)

		token = state.push('dovecot_body', 'dovecot', 0)
		token.attrSet('mode', parts[0])

		token = state.push('dovecot_close', 'dovecot', 0)
		token.attrSet('mode', parts[0])

		state.pos = state.posMax + 2
		state.posMax = max

		return true
	}

	function dovecot_open(tokens, index, mdOpts, env) {
		const token = tokens[index]
		const mode = token.attrGet('mode')
		const parts = token.attrGet('parts')

		let hash = ''

		switch (mode) {
		case 'added':
			env.args = parts[1]
			env.inner = 'Added'
			return '<span class="VPBadge tip">'

		case 'changed':
			env.args = parts[1]
			env.inner = 'Changed'
			return '<span class="VPBadge info">'

		case 'deprecated':
			env.args = parts[1]
			env.inner = 'Deprecated'
			return '<span class="VPBadge warning">'

		case 'doveadm':
		case 'event':
		case 'setting':
			env.inner = parts[1]
			env.args = parts[2] ? parts[2] : undefined;

			let page = mode
			switch (mode) {
			case 'event':
			case 'setting':
				page += 's'
				break
			}

			return '<code><a href="' +
				resolveURL('core/summaries/' + page + '.html#' + env.inner) +
				'">'

		case 'link':
			let url = '#'
			env.inner = false

			if (!opts.dovecotlinks[parts[1]]) {
				throw new Error('Dovecot link missing: ' + parts[1])
			}

			const d = opts.dovecotlinks[parts[1]]
			env.inner = parts[2] ? parts[2] : (d.text ? d.text : false)

			return '<a href="' + d.url + '">'

		case 'man':
			env.inner = parts[1]
			hash = parts[2] ? parts[2] : false;
			env.args = parts[3] ? parts[3] : 1;

			return '<code><a href="' +
				resolveURL('core/man/' + env.inner + '.' + env.args) +
				'.html' + (hash ? '#' + hash : '') + '">'

		case 'plugin':
			env.inner = parts[1]

			return '<a href="' +
				resolveURL('core/plugins/' + env.inner.replaceAll('-', '_') +
				'.html' + (parts[2] ? '#' + parts[2] : '')) + '">'

		case 'removed':
			env.args = parts[1]
			env.inner = 'Removed'
			return '<span class="VPBadge danger">'

		case 'rfc':
			env.inner = parts[1]
			env.args = parts[2] ? parts[2] : false;

			return '<a target="_blank" rel="noreferrer" href="https://datatracker.ietf.org/doc/html/rfc' +
				env.inner + (env.args ? '#section-' + env.args : '') + '">'

		case 'variable':
			switch (parts[1] ? parts[1] : 'config') {
			case 'auth':
				hash = '#authentication-variables'
				env.inner = 'Authentication variables'
				break

			case 'config':
				env.inner = 'Config variables'
				break

			case 'global':
				hash = '#global-variables'
				env.inner = 'Global variables'
				break

			case 'login':
				hash = '#login-variables'
				env.inner = 'Login variables'
				break

			case 'mail-service-user':
				hash = '#mail-service-user-variables'
				env.inner = 'Mail service user variables'
				break

			case 'mail-user':
				hash = '#mail-user-variables'
				env.inner = 'Mail user variables'
				break
			}

			return '<code><a href="' +
				resolveURL('core/settings/variables.html' + hash) + '">'

		default:
			throw new Error('Unknown dovecot markdown command: ' + mode)
		}
	}

	function dovecot_body(tokens, index, mdOpts, env) {
		const token = tokens[index]
		const mode = token.attrGet('mode')

		switch (mode) {
		case 'added':
		case 'changed':
		case 'deprecated':
		case 'removed':
			if (!opts.updates[env.args]) {
				throw new Error('Missing updates entry for: ' + env.args)
			}
			return env.inner + ': ' + opts.updates[env.args]

		case 'doveadm':
			return 'doveadm ' + env.inner + (env.args ? ' ' + env.args : '')

		case 'event':
			return env.inner

		case 'link':
			return env.inner

		case 'man':
			return env.inner + '(' + env.args + ')'

		case 'plugin':
			return env.inner + ' plugin'

		case 'rfc':
			return 'RFC ' + env.inner +
				(env.args ? ' (section ' + env.args + ')' : '')

		case 'setting':
			return env.inner + (env.args ? ' = ' + env.args : '')

		case 'variable':
			return env.inner
		}
	}

	function dovecot_close(tokens, index, mdOpts, env) {
		const token = tokens[index]
		const mode = token.attrGet('mode')

		switch (mode) {
		case 'added':
		case 'changed':
		case 'deprecated':
		case 'removed':
			return '</span>'

		case 'doveadm':
		case 'event':
		case 'man':
		case 'setting':
		case 'variable':
			return '</a></code>'

		case 'link':
		case 'plugin':
		case 'rfc':
			return '</a>'
		}
	}

	md.inline.ruler.after('emphasis', 'dovecot_brackets', process_brackets)
	md.renderer.rules.dovecot_open = dovecot_open
	md.renderer.rules.dovecot_body = dovecot_body
	md.renderer.rules.dovecot_close = dovecot_close
}
