import containerPlugin from 'markdown-it-container'
import fg from 'fast-glob'
import deflistPlugin from 'markdown-it-deflist'
import path from 'path'
import { createMarkdownRenderer } from 'vitepress'
import { dovecotSetting, frontmatterIter, loadData } from './utility.js'

export function dovecotMdExtend(md) {
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
	md.use(dovecot_markdown)

	return md
}

let vitepress_md = null
export async function getVitepressMd() {
	if (vitepress_md === null) {
		const config = globalThis.VITEPRESS_CONFIG

		vitepress_md = dovecotMdExtend(await createMarkdownRenderer(
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
function dovecot_markdown(md) {
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
		case 'setting_text':
			env.inner = parts[1]
			env.args = parts[2] ? parts[2] : undefined;

			let page = mode
			switch (mode) {
			case 'doveadm':
				initDoveadm()

				if (!opts.doveadm[env.inner]) {
					if (!Object.values(opts.doveadm).find((x) => (x.man == 'doveadm-' + env.inner))) {
						handle_error('doveadm link missing: ' + env.inner)
						return '<code><a>'
					}
				}
				break

			case 'event':
				initEvents()

				if (!opts.events[env.inner]) {
					handle_error('event link missing: ' + env.inner)
					return '<code><a>'
				}
				page += 's'
				break

			case 'setting':
			case 'setting_text':
				initSettings()

				/* Settings names can have brackets, so we need to unescape
				 * input for purposes of searching settings keys. */
				const search_str = env.inner.replaceAll('&gt;', '>')
						.replaceAll('&lt;', '<')

				if (!opts.settings[search_str]) {
					handle_error('setting link missing: ' + env.inner)
					return '<code><a>'
				}
				page = 'settings'
				break
			}

			return '<code><a href="' +
				resolveURL('core/summaries/' + page + '.html#' + env.inner) +
				'">'

		case 'link':
			let url = '#'
			env.inner = false

			initDovecotLinks()

			if (!opts.dovecotlinks[parts[1]]) {
				handle_error('Dovecot link missing: ' + parts[1])
				return '<a>'
			}

			const d = opts.dovecotlinks[parts[1]]
			env.inner = parts[2] ? parts[2] : (d.text ? d.text : false)

			return '<a href="' + d.url + '">'

		case 'man':
			env.inner = parts[1]
			hash = parts[2] ? parts[2] : false;
			env.args = parts[3] ? parts[3] : 1;

			initManFiles()

			if (!opts.man.includes(env.inner)) {
				handle_error('man link missing: ' + env.inner)
				return '<a><code>'
			}

			return '<code><a href="' +
				resolveURL('core/man/' + env.inner + '.' + env.args) +
				'.html' + (hash ? '#' + hash : '') + '">'

		case 'plugin':
			env.inner = parts[1]
			env.args = parts[2] ? parts[2] : undefined
			const plugin = env.inner.replaceAll('-', '_')

			initPluginFiles()

			if (!opts.plugins.includes(plugin)) {
				handle_error('plugin link missing: ' + env.inner)
				return '<a>'
			}

			return '<a href="' +
				resolveURL('core/plugins/' + plugin + '.html') + '">'

		case 'removed':
			env.args = parts[1]
			env.inner = 'Removed'
			return '<span class="VPBadge danger">'

		case 'rfc':
			env.inner = parts[1]
			env.args = parts[2] ? parts[2] : false;

			const rfcurl = "https://datatracker.ietf.org/doc/html/rfc" +
				env.inner + (env.args ? '#section-' + env.args : '')

			return '<a target="_blank" rel="noreferrer" href="' + rfcurl + '">'

		case 'variable':
			switch (parts[1] ? parts[1] : 'settings') {
			case 'auth':
				hash = '#authentication-variables'
				env.inner = 'Authentication variables'
				break

			case 'settings':
				env.inner = 'Settings variables'
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

			default:
				handle_error('Unknown variable type: ' + parts[1])
			}

			return '<code><a href="' +
				resolveURL('core/settings/variables.html' + hash) + '">'

		default:
			initMarkdownExtend()

			return handle_default(mode,
				opts.markdown?.open?.(mode, parts, opts, env))
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
			initUpdates()

			if (!opts.updates[env.args]) {
				handle_error('Missing updates entry for: ' + env.args)
				return env.args
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
			return env.args ?? (env.inner + ' plugin')

		case 'rfc':
			return 'RFC ' + env.inner +
				(env.args ? ' (section ' + env.args + ')' : '')

		case 'setting':
			return env.inner + (env.args ? ' = ' + env.args : '')

		case 'setting_text':
			return env.args ?? env.inner

		case 'variable':
			return env.inner

		default:
			return handle_default(mode, opts.markdown?.body?.(mode, env))
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
		case 'setting_text':
		case 'variable':
			return '</a></code>'

		case 'link':
		case 'plugin':
		case 'rfc':
			return '</a>'

		default:
			return handle_default(mode, opts.markdown?.close?.(mode, env))
		}
	}

	function handle_default(mode, res) {
		if (res) { return res }
		handle_error('Unknown dovecot markdown command: ' + mode)
	}

	function handle_error(msg) {
		if (process.env.NODE_ENV !== 'development') {
			throw new Error(msg)
		}
		console.error(msg)
	}

	function initDoveadm() {
		if (!opts.doveadm) {
			opts.doveadm = loadData('doveadm').doveadm
		}
	}

	function initDovecotLinks() {
		if (opts.dovecotlinks) {
			return
		}

		const links = {}
		const rewrites = globalThis.VITEPRESS_CONFIG.rewrites.map

		frontmatterIter(Object.keys(rewrites), function (f, data) {
			if (!data.dovecotlinks) {
				return
			}

			for (const [k, v] of Object.entries(data.dovecotlinks)) {
				if (links[k]) {
					throw new Error("Duplicate Dovecot Link key: " + k)
				}

				links[k] = {
					url: resolveURL(rewrites[f].substring(0, rewrites[f].lastIndexOf('.')) + '.html')
				}

				if ((typeof v) == 'object') {
					links[k].text = v.text
					if (v.hash) {
						links[k].url += '#' + v.hash
					}
				} else {
					links[k].text = v
				}
			}
		})

		opts.dovecotlinks = {
			...links, ...(loadData('links_overrides').links_overrides)
		}
	}

	function initEvents() {
		if (!opts.events) {
			opts.events = loadData('events').events
		}
	}

	function initManFiles() {
		if (!opts.man) {
			opts.man = dovecotSetting('man_paths').flatMap((x) => {
				return fg.sync(x).map((y) => {
					const str = path.basename(y)
					return str.substring(0, str.indexOf('.'))
				})
			})
		}
	}

	function initMarkdownExtend() {
		if (!opts.markdown) {
			opts.markdown = dovecotSetting('markdown_extend') ?? {}
		}
	}

	function initPluginFiles() {
		if (!opts.plugins) {
			opts.plugins = dovecotSetting('plugin_paths').flatMap((x) =>
				fg.sync(x).map((y) => path.basename(y, '.md'))
			)
		}
	}

	function initSettings() {
		if (!opts.settings) {
			opts.settings = loadData('settings').settings
		}
	}

	function initUpdates() {
		if (!opts.updates) {
			opts.updates = loadData('updates').updates
		}
	}

	function resolveURL(url) {
		if (!('url_rewrite' in opts)) {
			opts.url_rewrite = dovecotSetting('url_rewrite')
		}

		const new_url =
			(opts.base.endsWith('/') ? opts.base.slice(0, -1) : opts.base) +
			'/' + url
		return (opts.url_rewrite) ? opts.url_rewrite(new_url) : new_url
	}

	const opts = {
		base: globalThis.VITEPRESS_CONFIG.site.base
	}

	md.inline.ruler.after('emphasis', 'dovecot_brackets', process_brackets)
	md.renderer.rules.dovecot_open = dovecot_open
	md.renderer.rules.dovecot_body = dovecot_body
	md.renderer.rules.dovecot_close = dovecot_close

	opts.resolveURL = resolveURL
}
