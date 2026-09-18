import test from 'node:test'
import assert from 'node:assert/strict'
import { doveadm_response_types } from '../lib/doveadm.js'
import { logger } from '../lib/logger.js'

test('doveadm_response_types exports correct constant values', () => {
	assert.equal(doveadm_response_types.STRING, 'string')
	assert.equal(doveadm_response_types.INTEGER, 'integer')
	assert.equal(doveadm_response_types.BOOLEAN, 'boolean')
	assert.equal(doveadm_response_types.TIMESTAMP, 'timestamp')
	assert.equal(doveadm_response_types.ARRAY, 'array')
	assert.equal(doveadm_response_types.OBJECT, 'object')
})

test('doveadm_response_types invalid key triggers logger.fatal', () => {
	let fatalCalled = false
	const originalFatal = logger.fatal
	logger.fatal = (msg) => {
		fatalCalled = true
		throw new Error(msg)
	}
	try {
		assert.throws(() => {
			doveadm_response_types.INVALID_KEY
		}, /Invalid doveadm_response_types key: INVALID_KEY/)
		assert.equal(fatalCalled, true)
	} finally {
		logger.fatal = originalFatal
	}
})

const mockMd = {
	render: (str) => `<p>${str.trim()}</p>`,
	renderInline: (str) => str.trim(),
}

test('normalizeDoveadm preserves absent response key', async () => {
	const { normalizeDoveadm } = await import('../lib/doveadm.js')
	const input = {
		testcmd: {
			text: 'A test command',
		}
	}
	const result = await normalizeDoveadm(input, mockMd)
	const cmd = result.doveadm.testcmd
	assert.equal('response' in cmd, false)
})

test('normalizeDoveadm preserves response === null', async () => {
	const { normalizeDoveadm } = await import('../lib/doveadm.js')
	const input = {
		testcmd: {
			text: 'A test command',
			response: null,
		}
	}
	const result = await normalizeDoveadm(input, mockMd)
	const cmd = result.doveadm.testcmd
	assert.equal('response' in cmd, true)
	assert.equal(cmd.response, null)
})

test('normalizeDoveadm processes structured response object with fields, note, example', async () => {
	const { normalizeDoveadm } = await import('../lib/doveadm.js')
	const input = {
		testcmd: {
			text: 'A test command',
			response: {
				note: 'Some note text',
				fields: {
					fieldOne: {
						type: 'string',
						description: 'The first field',
					},
					fieldTwo: {
						type: 'integer',
						description: 'The second field',
						dynamic: true,
					},
				},
				example: {
					fieldOne: 'value',
					fieldTwo: 42,
				},
			}
		}
	}
	const result = await normalizeDoveadm(input, mockMd)
	const resp = result.doveadm.testcmd.response
	assert.equal(resp.note, '<p>Some note text</p>')
	assert.deepEqual(resp.fields, [
		{ name: 'fieldOne', type: 'string', description: 'The first field' },
		{ name: 'fieldTwo', type: 'integer', description: 'The second field', dynamic: true },
	])
	assert.deepEqual(resp.example, {
		fieldOne: 'value',
		fieldTwo: 42,
	})
})

test('loadDoveadm preserves null values (e.g. response: null) without cleanDeep stripping them', async () => {
	const { resolveConfig } = await import('vitepress')
	globalThis.VITEPRESS_CONFIG = await resolveConfig('.')
	const { loadData } = await import('../lib/utility.js')
	const rawData = await loadData('doveadm')
	rawData.doveadm['__test_null_cmd__'] = {
		text: 'Temporary test command',
		response: null,
	}

	try {
		const { loadDoveadm } = await import('../lib/doveadm.js')
		const data = await loadDoveadm()
		assert.ok(data.doveadm['__test_null_cmd__'])
		assert.equal('response' in data.doveadm['__test_null_cmd__'], true)
		assert.equal(data.doveadm['__test_null_cmd__'].response, null)
	} finally {
		delete rawData.doveadm['__test_null_cmd__']
	}
})

test('Phase 1 silent commands are annotated with response: null in data/doveadm.js', async () => {
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
		assert.ok(cmd in doveadm, `Command ${cmd} should exist in doveadm.js`)
		assert.equal(doveadm[cmd].response, null, `Command ${cmd} should have response: null`)
	}
})

test('Phase 2 simple fixed-field and unstructured commands are documented in data/doveadm.js', async () => {
	const { doveadm } = await import('../data/doveadm.js')
	const fixedFieldCmds = [
		'backup', 'dict get', 'fs get', 'fs iter', 'fs iter-dirs', 'fs metadata', 'fs stat',
		'indexer list', 'instance list', 'kick', 'mail fs get', 'mail fs iter', 'mail fs iter-dirs',
		'mail fs metadata', 'mail fs stat', 'mailbox cache decision', 'mailbox cache remove',
		'mailbox metadata get', 'mailbox metadata list', 'mailbox list', 'mailbox path',
		'penalty', 'process status', 'proxy kick', 'proxy list', 'rebuild attachments',
		'search', 'service status', 'sis find', 'sync'
	]

	const unstructuredCmds = [
		'auth login', 'auth lookup', 'auth test', 'compress connect',
		'dump', 'help', 'log find', 'mailbox mutf7', 'pw'
	]

	for (const cmd of fixedFieldCmds) {
		assert.ok(cmd in doveadm, `Command ${cmd} should exist in doveadm.js`)
		const resp = doveadm[cmd].response
		assert.ok(resp, `Command ${cmd} should have response object`)
		assert.ok(resp.fields && typeof resp.fields === 'object', `Command ${cmd} should have response.fields object`)
		assert.ok(Object.keys(resp.fields).length > 0, `Command ${cmd} should have at least one field`)
		for (const [fieldName, fieldDef] of Object.entries(resp.fields)) {
			assert.ok(fieldDef.type, `Field ${fieldName} in ${cmd} must have type`)
			assert.ok(fieldDef.description, `Field ${fieldName} in ${cmd} must have description`)
			assert.ok(!fieldDef.description.endsWith('..'), `Field ${fieldName} description in ${cmd} should be clean: ${fieldDef.description}`)
		}
	}

	for (const cmd of unstructuredCmds) {
		assert.ok(cmd in doveadm, `Command ${cmd} should exist in doveadm.js`)
		const resp = doveadm[cmd].response
		assert.ok(resp, `Command ${cmd} should have response object`)
		assert.equal('fields' in resp, false, `Unstructured command ${cmd} should not have response.fields`)
		assert.ok(typeof resp.note === 'string' && resp.note.length > 0, `Command ${cmd} should have non-empty response.note`)
	}
})


test('Phase 3: complex / dynamic-field commands are documented in data/doveadm.js', async () => {
	const { doveadm } = await import('../data/doveadm.js')

	/* Commands whose stable field sets can be documented structurally. */
	const dynamicFieldCmds = [
		'auth cache flush',
		'dict iter',
		'fts flatcurve check',
		'fts flatcurve remove',
		'fts flatcurve rotate',
		'fts flatcurve stats',
		'log errors',
		'mailbox status',
		'stats dump',
		'user',
		'who',
	]

	for (const cmd of dynamicFieldCmds) {
		assert.ok(cmd in doveadm, `Command ${cmd} should exist in doveadm.js`)
		const resp = doveadm[cmd].response
		assert.ok(resp, `Command ${cmd} should have response object`)
		assert.ok(resp.fields && typeof resp.fields === 'object', `Command ${cmd} should have response.fields object`)
		assert.ok(Object.keys(resp.fields).length > 0, `Command ${cmd} should have at least one field`)
		assert.ok(typeof resp.note === 'string' && resp.note.length > 0, `Command ${cmd} should have non-empty response.note`)
		for (const [fieldName, fieldDef] of Object.entries(resp.fields)) {
			assert.ok(fieldDef.type, `Field ${fieldName} in ${cmd} must have type`)
			assert.ok(fieldDef.description, `Field ${fieldName} in ${cmd} must have description`)
		}
	}

	/* Conditionally-present fields must be marked dynamic. */
	const dynamicExpectations = {
		'dict iter': ['value'],
		'mailbox status': ['messages', 'recent', 'deleted', 'uidnext', 'uidvalidity', 'unseen', 'highestmodseq', 'vsize', 'guid', 'firstsaved'],
		'stats dump': ['field'],
		'who': ['connections', 'pid', 'ip', 'dest_ip'],
	}
	for (const [cmd, names] of Object.entries(dynamicExpectations)) {
		for (const name of names) {
			assert.ok(doveadm[cmd].response.fields[name]?.dynamic === true, `${cmd} field ${name} must be dynamic: true`)
		}
	}

	/* Open-ended dynamic fields must be documented via note, not fields. */
	const noteOnlyCmds = ['fetch']
	for (const cmd of noteOnlyCmds) {
		const resp = doveadm[cmd].response
		assert.ok(resp, `Command ${cmd} should have response object`)
		assert.equal('fields' in resp, false, `Command ${cmd} should not have response.fields`)
		assert.ok(typeof resp.note === 'string' && resp.note.length > 0, `Command ${cmd} should have non-empty response.note`)
	}

	/* No command entry in data/doveadm.js may lack a response key. */
	for (const [cmd, v] of Object.entries(doveadm)) {
		assert.ok('response' in v, `Command ${cmd} must have a response key`)
	}

	/* Legacy response.text must be gone (migrated to fields/note). */
	for (const [cmd, v] of Object.entries(doveadm)) {
		if (v.response && typeof v.response === 'object') {
			assert.equal('text' in v.response, false, `Command ${cmd} must not use legacy response.text`)
		}
	}
})

test('Phase 3: simple remaining commands have response entries', async () => {
	const { doveadm } = await import('../data/doveadm.js')

	/* Silent commands. */
	const silentCmds = [
		'copy', 'move', 'acl debug', 'exec',
		'fts optimize', 'fts rescan', 'mailbox cache purge',
		'quota recalc', 'sieve activate', 'sieve deactivate',
		'sieve delete', 'sieve put', 'sieve rename',
	]
	for (const cmd of silentCmds) {
		assert.equal(doveadm[cmd].response, null, `Command ${cmd} should have response: null`)
	}

	/* Fixed-field commands. */
	const fixedFields = {
		'fts expand': ['query'],
		'fts lookup': ['query'],
		'acl get': ['id', 'global', 'rights'],
		'acl rights': ['rights'],
		'quota get': ['root', 'type', 'value', 'limit', 'percent'],
		'sieve get': ['script'],
		'sieve list': ['script', 'active'],
		'fts tokenize': ['token'],
		'config': ['name', 'value'],
		'mailbox cryptokey generate': ['success', 'box', 'pubid'],
	}
	for (const [cmd, names] of Object.entries(fixedFields)) {
		const fields = doveadm[cmd].response?.fields
		assert.ok(fields, `Command ${cmd} should have response.fields`)
		for (const name of names) {
			assert.ok(name in fields, `Command ${cmd} should document field ${name}`)
			assert.ok(fields[name].type, `Command ${cmd} field ${name} must have type`)
			assert.ok(fields[name].description, `Command ${cmd} field ${name} must have description`)
		}
	}

	/* Non-JSON commands need a note. */
	const noteCmds = ['compress connect', 'dump', 'help', 'log find', 'mailbox mutf7', 'pw']
	for (const cmd of noteCmds) {
		const resp = doveadm[cmd].response
		assert.ok(resp, `Command ${cmd} should have response object`)
		assert.equal('fields' in resp, false, `Command ${cmd} should not have response.fields`)
		assert.ok(typeof resp.note === 'string' && resp.note.length > 0, `Command ${cmd} should have non-empty response.note`)
	}
})
