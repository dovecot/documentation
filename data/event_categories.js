/* List of event categories. */

export const categories = {

	/* Root Categories */

	// KEY: Category Name
	auth: {
		// Category type
		category: 'root',
		// Category description. Rendered w/Markdown.
		description: `Authentication (server mainly)`
	},

	'auth-client': {
		category: 'root',
		description: `Authentication client library`
	},

	dict: {
		category: 'root',
		description: `Dictionary library and drivers`
	},

	'dict-server': {
		category: 'root',
		description: `Dictionary server/proxy (dict process)`
	},

	dns: {
		category: 'root',
		description: `DNS client library`
	},

	'dns-worker': {
		category: 'root',
		description: `DNS client library`
	},

	fs: {
		category: 'root',
		description: `FS library`
	},

	fts: {
		category: 'root',
		description: `Full text search plugin`
	},

	'fts-dovecot': {
		category: 'root',
		description: `fts-flatcurve FTS plugin`
	},

	'http-client': {
		category: 'root',
		description: `HTTP client library`
	},

	'http-server': {
		category: 'root',
		description: `HTTP server library`
	},

	imap: {
		category: 'root',
		description: `imap process`
	},

	'imap-hibernate': {
		category: 'root',
		description: `imap-hibernate process`
	},

	'imap-urlauth': {
		category: 'root',
		description: `imap-urlauth process`
	},

	lda: {
		category: 'root',
		description: `dovecot-lda process`
	},

	'local-delivery': {
		category: 'root',
		description: `LDA/LMTP local delivery`
	},

	lmtp: {
		category: 'root',
		description: `LMTP process`
	},

	lua: {
		category: 'root',
		description: `Lua script`
	},

	'mail-cache': {
		category: 'root',
		description: `\`dovecot.index.cache\` file handling`
	},

	'mail-index': {
		category: 'root',
		description: `\`dovecot.index\*\` file handling`
	},

	managesieve: {
		category: 'root',
		description: `ManageSieve`
	},

	pop3: {
		category: 'root',
		description: `POP3 process`
	},

	'push-notification': {
		category: 'root',
		description: `push-notification plugin`
	},

	'quota-status': {
		category: 'root',
		description: `quota-status process`
	},

	'service:<name>': {
		category: 'root',
		description: `Named service, e.g. \`service:imap\` or \`service:auth\``
	},

	'smtp-client': {
		category: 'root',
		description: `SMTP/LMTP client`
	},

	'smtp-server': {
		category: 'root',
		description: `SMTP/LMTP server`
	},

	'smtp-submit': {
		category: 'root',
		description: `SMTP submission client`
	},

	ssl: {
		category: 'root',
		description: `SSL/TLS connections`
	},

	'ssl-client': {
		category: 'root',
		description: `Incoming SSL/TLS connections`
	},

	'ssl-server': {
		category: 'root',
		description: `Outgoing SSL/TLS connections`
	},

	submission: {
		category: 'root',
		description: `Submission process`
	},

	/* Storage categories */

	storage: {
		category: 'storage',
		description: `Mail storage parent category`
	},

	imapc: {
		category: 'storage',
		description: `[[link,imapc]] storage`,
	},

	mailbox: {
		category: 'storage',
		description: `Mailbox (folder)`
	},

	maildir: {
		category: 'storage',
		description: `[[link,maildir]] storage`,
	},

	mbox: {
		category: 'storage',
		description: `[[link,mbox]] storage`,
	},

	mdbox: {
		category: 'storage',
		description: `[[link,mdbox]] storage`,
	},

	sdbox: {
		category: 'storage',
		description: `[[link,sdbox]] storage`,
	},

	pop3c: {
		category: 'storage',
		description: `[[link,pop3c]] storage`,
	},

	/* Sieve categories */

	sieve: {
		category: 'sieve',
		description: `Sieve parent category`
	},

	'sieve-action': {
		category: 'sieve',
		description: `Individual Sieve actions executed`
	},

	'sieve-execute': {
		category: 'sieve',
		description: `Sieve script(s) being executed for a particular message; this envelops all of Sieve execution, both runtime and action execution`
	},

	'sieve-runtime': {
		category: 'sieve',
		description: `Evaluation of individual Sieve scripts`
	},

	'sieve-storage': {
		category: 'sieve',
		description: `Sieve storage`
	},

	/* SQL categories */

	sql: {
		category: 'sql',
		description: `SQL parent category`
	},

	cassandra: {
		category: 'sql',
		description: `Cassandra CQL events`
	},

	mysql: {
		category: 'sql',
		description: `MySQL events`
	},

	pgsql: {
		category: 'sql',
		description: `PostgreSQL events`
	},

	sqlite: {
		category: 'sql',
		description: `SQLite events`
	},

	sqlpool: {
		category: 'sql',
		description: `SQL is used internally via "SQL connection pools"`
	},

}
