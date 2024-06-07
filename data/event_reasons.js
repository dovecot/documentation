/* Event Reasons.
 *
 * Keys are reasons, Values are object. */

export const reasons = {
	'storage:autoexpunge': {
		category: 'storage',
		description: `Mails are being autoexpunged`
	},

	'storage:mailbox_list_rebuild': {
		category: 'storage',
		description: `Mailbox list index is being rebuilt`
	},

	'mdbox:rebuild': {
		category: 'storage',
		description: `mdbox storage is being rebuilt`
	},

	'mailbox:create': {
		category: 'mailbox',
		description: `Mailbox is being created`
	},

	'mailbox:update': {
		category: 'mailbox',
		description: `Mailbox metadata is being updated (e.g. [[doveadm,mailbox update]])`
	},

	'mailbox:rename': {
		category: 'mailbox',
		description: `Mailbox is being renamed`
	},

	'mailbox:delete': {
		category: 'mailbox',
		description: `Mailbox is being deleted`
	},

	'mailbox:subscribe': {
		category: 'mailbox',
		description: `Mailbox is being subscribed`
	},

	'mailbox:unsubscribe': {
		category: 'mailbox',
		description: `Mailbox is being unsubscribed`
	},

	'mailbox:sort': {
		category: 'mailbox',
		description: `Mails are being sorted (IMAP SORT)`
	},

	'mailbox:thread': {
		category: 'mailbox',
		description: `Threading is being built for mails (IMAP THREAD)`
	},

	'mailbox:vsize': {
		category: 'mailbox',
		description: `Mailbox vsize is requested or updated`
	},

	'mail:snippet': {
		category: 'mail',
		description: `
Message snippet / IMAP PREVIEW

The other reasons may give further details why.

Only emitted when a mail body is opened (not when read from cache).`
	},

	'mail:header_fields': {
		category: 'mail',
		description: `
A specified list of headers.

These are normally expected to be returned from cache.

Only emitted when a mail body is opened (not when read from cache).`
	},

	'mail:attachment_keywords': {
		category: 'mail',
		description: `
\`$HasAttachment\` or \`$HasNoAttachment\` keyword is being generated.

Only emitted when a mail body is opened (not when read from cache).`
	},

	'mail:mime_parts': {
		category: 'mail',
		description: `
MIME part structure.

Only emitted when a mail body is opened (not when read from cache).`
	},

	'mail:date': {
		category: 'mail',
		description: `
Date header.

Only emitted when a mail body is opened (not when read from cache).`
	},

	'mail:imap_envelope': {
		category: 'mail',
		description: `
IMAP ENVELOPE

Only emitted when a mail body is opened (not when read from cache).`
	},

	'mail:imap_bodystructure': {
		category: 'mail',
		description: `
IMAP BODY / BODYSTRUCTURE

Only emitted when a mail body is opened (not when read from cache).`
	},

	'imap:notify_update': {
		category: 'imap',
		description:`The active NOTIFY command is sending updates to client.`
	},

	'imap:unhibernate': {
		category: 'imap',
		description:`IMAP client is being unhibernated.`
	},

	'imap:cmd_<name>': {
		category: 'imap',
		description:`IMAP command is being run.`
	},

	'imap:fetch_body': {
		category: 'imap',
		description:`
A part of the message body is explicitly being fetched.

If set, any other \`imap:fetch_*\` reasons aren't set since this alone is a
reason for opening the mail.`
	},

	'imap:fetch_header': {
		category: 'imap',
		description:`
The full header (except maybe some listed headers) are being fetched.

If set, any other \`imap:fetch_*\` reasons aren't set since this alone is a
reason for opening the mail.`
	},

	'imap:fetch_header_fields': {
		category: 'imap',
		description:`
Specific header fields are being fetched.

These should normally come from cache.`
	},

	'imap:fetch_bodystructure': {
		category: 'imap',
		description:`
IMAP BODY / BODYSTRUCTURE is being fetched.

These should normally come from cache.`
	},

	'imap:fetch_size': {
		category: 'imap',
		description:`
RFC822.SIZE is being fetched.

This should normally come from cache.`
	},

	'pop3:initialize': {
		category: 'pop3',
		description:`POP3 mailbox is being opened.`
	},

	'pop3:cmd_<name>': {
		category: 'pop3',
		description:`POP3 command is being run.`
	},

	'doveadm:cmd_<name>': {
		category: 'doveadm',
		description:`Doveadm command is being run.`
	},

	'lmtp:cmd_mail': {
		category: 'lmtp',
		description:`MAIL command is being run.`
	},

	'lmtp:cmd_rcpt': {
		category: 'lmtp',
		description:`RCPT command is being run.`
	},

	'lmtp:cmd_data': {
		category: 'lmtp',
		description:`DATA command is being run.`
	},

	'submission:cmd_mail': {
		category: 'submission',
		description:`MAIL command is being run.`
	},

	'submission:cmd_rcpt': {
		category: 'submission',
		description:`RCPT command is being run.`
	},

	'submission:cmd_data': {
		category: 'submission',
		description:`DATA command is being run.`
	},

	'indexer:index_mailbox': {
		category: 'indexer',
		description: `Mailbox is being indexed.`
	},

	'virtual:config_read': {
		category: 'other_plugins',
		description: `
virtual plugin mailbox configuration is being read.

This may cause mailbox metadata to be accessed.`
	},

	'trash:clean': {
		category: 'other_plugins',
		description: `trash plugin cleaning space`
	},

	'quota:count': {
		category: 'other_plugins',
		description: `
quota plugin is counting the mailbox's full size.

This is normal with \`quota=count\` driver.`
	},

	'quota:recalculate': {
		category: 'other_plugins',
		description: `
Quota is being recalculated (e.g. [[doveadm,quota recalc]])`
	},

	'lazy_expunge:expunge': {
		category: 'other_plugins',
		description: `
lazy_expunge plugin is handling an expunge.

Use for checking the refcount and for actually doing the lazy_expunge move.`
	},

	'fts:lookup': {
		category: 'other_plugins',
		description: `Searching is accessing full text search index.`
	},

	'fts:index': {
		category: 'other_plugins',
		description: `
Message is being added to the full text search index.

Note that this reason won't be used for email opening events, because the
emails are already opened by the indexer precache searching code. So usually
the \`indexer:index_mailbox\` reason is what is wanted to be used.`
	},
}
