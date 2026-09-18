import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

async function compileVueComponent(filePath, transformSource = null) {
	let source = fs.readFileSync(filePath, 'utf8')
	if (transformSource) {
		source = transformSource(source)
	}
	const sfc = parse(source)
	const script = compileScript(sfc.descriptor, { id: 'test-sfc' })
	const template = compileTemplate({
		source: sfc.descriptor.template.content,
		id: 'test-sfc',
		filename: filePath,
		ssr: true,
		compilerOptions: { bindingMetadata: script.bindings }
	})

	const moduleCode = script.content.replace(/export default/, 'const __default__ =') +
		'\n' + template.code +
		'\n__default__.ssrRender = ssrRender;\nexport default __default__;'

	const tmpFile = path.resolve('test', `__test_${Math.random().toString(36).slice(2)}.js`)
	fs.writeFileSync(tmpFile, moduleCode)
	try {
		const mod = await import(tmpFile)
		return mod.default
	} finally {
		if (fs.existsSync(tmpFile)) {
			fs.unlinkSync(tmpFile)
		}
	}
}

const MockBadge = {
	props: ['type', 'text'],
	template: '<span class="VPBadge" :class="type"><slot>{{ text }}</slot></span>'
}

function createAppWithBadge(comp, props = null) {
	const app = createSSRApp(comp, props)
	app.component('Badge', MockBadge)
	return app
}

let compiledDoveadmComponent = null

async function getDoveadmComponent() {
	if (!compiledDoveadmComponent) {
		compiledDoveadmComponent = await compileVueComponent('components/DoveadmComponent.vue', (src) =>
			src.replace("import { data } from '../lib/data/doveadm.data.js'", "const data = globalThis.__TEST_DOVEADM_DATA__;")
		)
	}
	return compiledDoveadmComponent
}

async function renderDoveadm(doveadmData, { clicked = true, cmdName = 'testcmd' } = {}) {
	const comp = await getDoveadmComponent()
	globalThis.__TEST_DOVEADM_DATA__ = {
		doveadm: doveadmData,
		http_api_link: 'HTTP API'
	}
	const targetComp = clicked
		? {
			...comp,
			setup(props, ctx) {
				const res = comp.setup(props, ctx)
				res.responseClick(cmdName)
				return res
			}
		}
		: comp

	const app = createAppWithBadge(targetComp)
	return await renderToString(app)
}

test('DoveadmHttpApiComponent renders Example Server Response for commands with a response', async () => {
	const comp = await compileVueComponent('components/DoveadmHttpApiComponent.vue')
	// Single object response
	const appSingle = createAppWithBadge(comp, {
		data: {
			http_cmd: 'testCmd',
			args: [
				{ param: 'arg1', type: 'string', text: 'An argument', example: 'val1' }
			],
			response: {
				fields: [
					{ name: 'count', type: 'integer', description: 'Count' },
					{ name: 'status', type: 'string', description: 'Status' }
				]
			}
		}
	})
	const htmlSingle = await renderToString(appSingle)
	assert.ok(htmlSingle.includes('Example Server Response'), 'Should render "Example Server Response"')
	assert.ok(htmlSingle.includes('doveadmResponse'), 'Should render doveadmResponse')
	assert.ok(htmlSingle.includes('&quot;status&quot;: &quot;example&quot;'), 'String field should use dummy text "example"')

	// List response (should render 2 objects)
	const appList = createAppWithBadge(comp, {
		data: {
			http_cmd: 'testListCmd',
			args: [],
			response: {
				type: 'list',
				fields: [
					{ name: 'mailbox', type: 'string', description: 'Mailbox' }
				]
			}
		}
	})
	const htmlList = await renderToString(appList)
	assert.ok(htmlList.includes('Example Server Response'), 'List should render Example Server Response')
	// Two objects in array
	const matches = [...htmlList.matchAll(/&quot;mailbox&quot;: &quot;example&quot;/g)]
	assert.equal(matches.length, 2, 'List response example should contain two objects')
})

test('DoveadmComponent renders Response Fields details section positioned before CLI block', async () => {
	const html = await renderDoveadm({
		testcmd: {
			text: '<p>Command description.</p>',
			usage: 'testcmd'
		}
	}, { clicked: false })

	// Response Fields details should exist
	assert.ok(html.includes('<summary>Response Fields</summary>'), 'Response Fields details should exist')

	const descPos = html.indexOf('<p>Command description.</p>')
	const respPos = html.indexOf('<summary>Response Fields</summary>')
	const cliPos = html.indexOf('<summary>CLI</summary>')

	assert.ok(descPos < respPos, 'Response Fields section should be positioned after command description')
	assert.ok(respPos < cliPos, 'Response Fields section should be positioned before CLI block')
})

test('DoveadmComponent Response Fields is lazy (closed by default, inner template not rendered until click)', async () => {
	const cmdData = {
		testcmd: {
			text: '<p>Command description.</p>',
			usage: 'testcmd'
		}
	}

	// Without click, inner template should not be instantiated
	const htmlClosed = await renderDoveadm(cmdData, { clicked: false })
	assert.equal(htmlClosed.includes('undocumented'), false, 'Inner template should not be rendered when closed')

	// Simulating click instantiates the inner template
	const htmlOpen = await renderDoveadm(cmdData, { clicked: true })
	assert.ok(htmlOpen.includes('undocumented'), 'Inner template should be rendered after click')
})

test('DoveadmComponent State 1: response absent -> renders undocumented warning badge', async () => {
	const html = await renderDoveadm({
		testcmd: {
			text: '<p>Command description.</p>',
			usage: 'testcmd'
		}
	})
	assert.ok(html.includes('warning'), 'Should render warning badge')
	assert.ok(html.includes('undocumented'), 'Should render "undocumented" text')
})

test('DoveadmComponent State 2: response === null -> renders small "No output." note', async () => {
	const html = await renderDoveadm({
		testcmd: {
			text: '<p>Command description.</p>',
			usage: 'testcmd',
			response: null
		}
	})
	assert.ok(html.includes('<small>No output.</small>'), 'Should render small "No output." note')
	assert.equal(html.includes('undocumented'), false, 'Should not render undocumented badge')
})

test('DoveadmComponent State 3: response truthy but no fields array -> renders paragraph "This command does not produce JSON output." followed by response.note', async () => {
	const html = await renderDoveadm({
		testcmd: {
			text: '<p>Command description.</p>',
			usage: 'testcmd',
			response: {
				note: '<p>Direct stdout formatted output only.</p>'
			}
		}
	})
	assert.ok(html.includes('This command does not produce JSON output.'), 'Should render no-JSON-output message')
	assert.ok(html.includes('Direct stdout formatted output only.'), 'Should render response.note text')
	assert.equal(html.includes('undocumented'), false, 'Should not render undocumented badge')
	assert.equal(html.includes('No output.'), false, 'Should not render No output.')
})

test('DoveadmComponent State 4: response.fields array present -> renders table (Field/Type/Description), conditional tag for dynamic, and note', async () => {
	const html = await renderDoveadm({
		testcmd: {
			text: '<p>Command description.</p>',
			usage: 'testcmd',
			response: {
				fields: [
					{
						name: 'fieldStatic',
						type: 'string',
						description: 'A static string field'
					},
					{
						name: 'fieldDynamic',
						type: 'integer',
						description: 'A dynamic integer field',
						dynamic: true
					}
				],
				note: '<p>Note explaining dynamic fields.</p>'
			}
		}
	})

	// Table headers
	assert.ok(html.includes('<th>Field</th>'), 'Should have Field column header')
	assert.ok(html.includes('<th>Type</th>'), 'Should have Type column header')
	assert.ok(html.includes('<th>Description</th>'), 'Should have Description column header')

	// Field rows
	assert.ok(html.includes('<code>fieldStatic</code>'), 'Should render fieldStatic')
	assert.ok(html.includes('A static string field'), 'Should render fieldStatic description')

	assert.ok(html.includes('<code>fieldDynamic</code>'), 'Should render fieldDynamic')
	assert.ok(html.includes('(conditional)'), 'Should show "(conditional)" for dynamic fields')
	assert.ok(html.includes('A dynamic integer field'), 'Should render fieldDynamic description')

	// Note rendered below table
	const tablePos = html.indexOf('</table>')
	const notePos = html.indexOf('<p>Note explaining dynamic fields.</p>')
	assert.ok(notePos > tablePos, 'response.note should render below the table')
})

test('DoveadmComponent renders small "No output." note for all Phase 1 silent commands', async () => {
	const { doveadm } = await import('../data/doveadm.js')
	const silentCmds = [
		'stop', 'reload', 'service stop',
		'stats add', 'stats remove', 'stats reopen',
		'indexer add', 'indexer remove',
		'dict set', 'dict unset',
		'instance remove',
		'log test', 'log reopen',
		'fs put', 'fs copy', 'fs delete',
		'mail fs put', 'mail fs copy', 'mail fs delete',
		'mailbox create', 'mailbox delete', 'mailbox rename', 'mailbox subscribe', 'mailbox unsubscribe', 'mailbox update',
		'mailbox metadata set', 'mailbox metadata unset',
		'save', 'index', 'altmove', 'deduplicate', 'expunge', 'flags add', 'flags remove', 'flags replace', 'import', 'force resync', 'purge',
		'acl add', 'acl delete', 'acl remove', 'acl set', 'acl recalc'
	]

	for (const cmd of silentCmds) {
		const html = await renderDoveadm({
			[cmd]: {
				text: `<p>${cmd} description</p>`,
				usage: cmd,
				response: doveadm[cmd].response
			}
		}, { clicked: true, cmdName: cmd })
		assert.ok(html.includes('<small>No output.</small>'), `${cmd} should render small "No output." note`)
		assert.equal(html.includes('undocumented'), false, `${cmd} should not render undocumented badge`)
	}
})

test('DoveadmComponent renders Phase 2 simple fixed-field and unstructured commands correctly', async () => {
	const { doveadm } = await import('../data/doveadm.js')
	const { normalizeDoveadm } = await import('../lib/doveadm.js')
	const mockMd = {
		render: (str) => `<p>${str.trim()}</p>`,
		renderInline: (str) => str.trim(),
	}
	const spotCheckCmds = ['kick', 'mailbox list', 'search', 'fs stat', 'penalty', 'dump', 'help']

	for (const cmd of spotCheckCmds) {
		const rawFields = doveadm[cmd].response?.fields ? { ...doveadm[cmd].response.fields } : null
		const rawNote = doveadm[cmd].response?.note
		const cmdClone = structuredClone(doveadm[cmd])
		const res = await normalizeDoveadm({ [cmd]: cmdClone }, mockMd)
		const normCmd = res.doveadm[cmd]
		const html = await renderDoveadm({
			[cmd]: {
				text: `<p>${cmd} description</p>`,
				usage: cmd,
				response: normCmd.response
			}
		}, { clicked: true, cmdName: cmd })

		assert.equal(html.includes('undocumented'), false, `${cmd} should not render undocumented badge`)

		if (rawFields) {
			assert.ok(html.includes('<th>Field</th>'), `${cmd} should render Field table header`)
			assert.ok(html.includes('<th>Type</th>'), `${cmd} should render Type table header`)
			assert.ok(html.includes('<th>Description</th>'), `${cmd} should render Description table header`)
			for (const fieldName of Object.keys(rawFields)) {
				assert.ok(html.includes(`<code>${fieldName}</code>`), `${cmd} should render field <code>${fieldName}</code>`)
			}
		} else if (rawNote) {
			assert.ok(html.includes(rawNote), `${cmd} should render note: ${rawNote}`)
		}
	}
})
