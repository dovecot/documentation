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
		description: `[[link,dict,Dictionary]] library and drivers`
	},

	'dict-server': {
		category: 'root',
		description: `[[link,dict,Dictionary]] Dictionary server/proxy (dict process)`
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
		description: `[[plugin,fts]]`
	},

	'fts-flatcurve': {
		category: 'root',
		description: `[[plugin,fts-flatcurve]]`
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
		description: `[[link,imap_server,IMAP]] process`
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
		description: `[[link,lmtp]] process`
	},

	lua: {
		category: 'root',
		description: `[[link,lua,Lua script]]`
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
		description: `[[link,managesieve,ManageSieve]]`
	},

	pop3: {
		category: 'root',
		description: `[[link,pop3]] process`
	},

	'push-notification': {
		category: 'root',
		description: `[[plugin,push-notification]]`
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
		description: `[[link,ssl,SSL/TLS]] connections`
	},

	'ssl-client': {
		category: 'root',
		description: `Incoming [[link,ssl,SSL/TLS]] connections`
	},

	'ssl-server': {
		category: 'root',
		description: `Outgoing [[link,ssl,SSL/TLS]] connections`
	},

	submission: {
		category: 'root',
		description: `[[link,submission]] process`
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
		description: `[[link,sieve]] parent category`
	},

	'sieve-action': {
		category: 'sieve',
		description: `Individual [[link,sieve]] actions executed`
	},

	'sieve-execute': {
		category: 'sieve',
		description: `[[link,sieve]] script(s) being executed for a particular message; this envelops all of Sieve execution, both runtime and action execution`
	},

	'sieve-runtime': {
		category: 'sieve',
		description: `Evaluation of individual [[link,sieve]] scripts`
	},

	'sieve-storage': {
		category: 'sieve',
		description: `[[link,sieve]] storage`
	},

	/* SQL categories */

	sql: {
		category: 'sql',
		description: `SQL parent category`
	},

	cassandra: {
		category: 'sql',
		description: `[[link,sql_cassandra,Cassandra CQL]] events`
	},

	mysql: {
		category: 'sql',
		description: `[[link,sql_mysql,MySQL]] events`
	},

	pgsql: {
		category: 'sql',
		description: `[[link,sql_postgresql,PostgreSQL]] events`
	},

	sqlite: {
		category: 'sql',
		description: `[[link,sql_sqlite,SQLite]] events`
	},

	sqlpool: {
		category: 'sql',
		description: `SQL is used internally via "SQL connection pools"`
	},

}
