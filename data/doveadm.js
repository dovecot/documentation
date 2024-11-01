/* List of Dovecot doveadm types. */
import { doveadm_arg_types,
		 doveadm_args_human_timestamp,
		 doveadm_args_query,
		 doveadm_args_usermask,
		 doveadm_flag_types } from '../lib/doveadm.js'

export const doveadm = {

	// Doveadm command name (each command is a separate object)
	altmove: {
		// Command specific arguments.
		args: {
			// The argument (name is the doveadm CLI representation)
			// This is the argument used for '--xyz' command line and the
			// camelCased argument used in HTTP API
			reverse: {
				// The short command line argument (no dash needed)
				cli: 'r',

				// If true, only show for cli, not HTTP.
				// cli_only: true,

				// If set, will use as command example argument.
				// i.e., for HTTP API requests, this argument will be added
				// to the example argument string.
				example: false,

				// If true, this is an optional positional argument.
				// optional: true,

				// If true, this is a positional argument. Positional
				// arguments are handled in array order.
				// positional: true,

				// The argument type
				type: doveadm_arg_types.BOOL,

				// Description of the parameter. Rendered w/Markdown.
				text: `Do a reverse move.`,
			},
			query: doveadm_args_query,
		},

		// Change Documentation
		// added: {
		//     // KEY = update identifier (see data/updates.js)
		//     // VALUE = Text to display. Rendered w/Markdown.
		//     'update_identifier': `Update description`
		// },
		// changed: {},
		// deprecated: {},
		// removed: {},

		// Response data. (HTTP API)
		//
		// Since doveadm responses are so variable, it is difficult to create
		// an abstracted system to document the format.
		//
		// Thus, (for now) simply provide a place to describe HTTP API
		// responses.
		// response: {
		//     // This is the JSON data returned from the server. Do NOT
		//     // include the enclosing array, as this will be added
		//     // automatically when displaying.
		//     example: {},
		//
		//     // A description of the response. Rendered w/Markdown.
		//     text: ``,
		// },

		// What doveadm flags does this command support (bit field)
		// Arguments are automatically added for each flag set
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,

		// Local man page
		man: 'doveadm-altmove',

		// Plugin name
		// plugin: '',

		// Tag name(s). String or array.
		// tags: 'foo', // or [ 'foo1', 'foo2', ... ]

		// Summary of command. Rendered w/Markdown.
		text: `
Move mails between primary and alternative mailbox storage locations.

::: warning
Applicable to [[link,mdbox]] and [[link,sdbox]] mailbox formats only.
:::`
	},

	'acl add': {
		args: {
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to add to.`,
			},
			id: {
				example: 'acl_id',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `ID to add to.`,
			},
			right: {
				example: ['r', 'w'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `ACL rights to add.`,
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Add ACL rights.`
	},

	'acl debug': {
		args: {
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to query.`,
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Explain access rights for a mailbox/user.`
	},

	'acl delete': {
		args: {
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to delete.`,
			},
			id: {
				example: 'acl_id',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `ID to delete.`,
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Delete an ACL entry.`,
	},

	'acl get': {
		args: {
			'match-me': {
				cli: 'm',
				type: doveadm_arg_types.BOOL,
			},
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to query.`,
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Show ACLs.`
	},

	'acl recalc': {
		args: {},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Ensure shared mailboxes exist in ACL shared dictionary.`
	},

	'acl remove': {
		args: {
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to remove rights from.`,
			},
			id: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `ID to remove.`,
			},
			right: {
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `ACL rights to remove.`,
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Remove ACL rights.`,
	},

	'acl rights': {
		args: {
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to show.`,
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Show current ACL rights.`,
	},

	'acl set': {
		args: {
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to replace rights.`,
			},
			id: {
				example: 'acl_id',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `ID to replace.`,
			},
			right: {
				example: ['r', 'w'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `ACL rights to replace.`,
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Replaces ACL rights.`,
	},

	'auth cache flush': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: `/run/dovecot/doveadm-server`,
				type: doveadm_arg_types.STRING,
				text: `Path to doveadm socket.`,
			},
			user: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID of user to apply operation to.`,
			},
		},
		response: {
			example: {
				entries: 1
			},
			text: `
| Key | Description |
| --- | ----------- |
| \`entries\` | The number of cache entries flushed. |
`
		},
		man: 'doveadm-auth',
		text: `Flush authentication cache.`,
	},

	'auth login': {
		args: {
			'auth-login-socket-path': {
				cli: 'a',
				cli_only: true,
				example: `/var/run/dovecot/auth-login`,
				type: doveadm_arg_types.STRING,
			},
			'auth-master-socket-path': {
				cli: 'm',
				cli_only: true,
				example: `/var/run/dovecot/auth-master`,
				type: doveadm_arg_types.STRING,
			},
			'sasl-mech': {
				cli: 'A',
				example: 'PLAIN',
				type: doveadm_arg_types.STRING,
			},
			'auth-info': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY,
				text: `Specifies additional conditions for the user command.`,
			},
			'master-user': {
				cli: 'M',
				example: 'masteruser',
				type: doveadm_arg_types.STRING,
				text: `Master user.`,
			},
			user: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Login UID.`,
			},
			password: {
				example: `password`,
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `Login Password.`,
			},
		},
		man: 'doveadm-auth',
		text: `Test full login.`,
	},

	'auth lookup': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: `/var/run/dovecot/doveadm-server`,
				type: doveadm_arg_types.STRING,
				text: `Path to doveadm socket.`,
			},
			'auth-info': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY,
				text: `Specifies additional conditions for the user command.`,
			},
			field: {
				cli: 'f',
				example: 'fieldname',
				type: doveadm_arg_types.STRING,
				text: `Only return value of this field.`,
			},
			user: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID of user to query.`,
			},
		},
		man: 'doveadm-auth',
		text: `Perform a passdb lookup.`,
	},

	'auth test': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: `/var/run/dovecot/doveadm-server`,
				type: doveadm_arg_types.STRING,
				text: `Path to doveadm socket.`,
			},
			'sasl-mech': {
				cli: 'A',
				example: 'PLAIN',
				type: doveadm_arg_types.STRING,
			},
			'auth-info': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY,
				text: `Specifies additional conditions for the user command.`,
			},
			'master-user': {
				cli: 'M',
				example: 'masteruser',
				type: doveadm_arg_types.STRING,
				text: `Master user.`
			},
			user: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Login UID.`
			},
			password: {
				example: `password`,
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `Login password.`
			},
		},
		man: 'doveadm-auth',
		text: `Test authentication for a user.`,
	},

	backup: {
		args: {
			'full-sync': {
				cli: 'f',
				type: doveadm_arg_types.BOOL,
				text: `Full sync.`,
			},
			'purge-remote': {
				cli: 'P',
				type: doveadm_arg_types.BOOL,
				text: `Purge destination after sync.`,
			},
			'reverse-sync': {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Do a reverse sync.`,
			},
			'lock-timeout': {
				cli: 'l',
				example: 60,
				type: doveadm_arg_types.INTEGER,
				text: `Lock timeout for the user (in seconds).`,
			},
			rawlog: {
				cli: 'r',
				example: 'rawlog_name',
				type: doveadm_arg_types.STRING,
				text: `Write rawlog to this file.`,
			},
			mailbox: {
				cli: 'm',
				example: 'INBOX',
				type: doveadm_arg_types.STRING,
				text: `Sync only this mailbox.`,
			},
			'mailbox-guid': {
				cli: 'g',
				example: 'mailbox_guid',
				type: doveadm_arg_types.STRING,
				text: `Sync only this mailbox GUID.`,
			},
			namespace: {
				cli: 'n',
				example: ['namespace'],
				type: doveadm_arg_types.ARRAY,
				text: `Sync only these namespaces.`,
			},
			'all-namespaces': {
				cli: 'N',
				type: doveadm_arg_types.BOOL,
				text: `Sync all namespaces.`,
			},
			'exclude-mailbox': {
				cli: 'x',
				example: ['excluded_mailbox'],
				type: doveadm_arg_types.ARRAY,
				text: `Exclude these mailbox names/masks.`,
			},
			'all-mailbox': {
				cli: 'a',
				example: 'VirtualAll',
				type: doveadm_arg_types.STRING,
				text: `The name of the virtual All mailbox.`,
			},
			state: {
				cli: 's',
				example: 'state_string',
				type: doveadm_arg_types.STRING,
				text: `State string of last dsync run.`,
			},
			'sync-since-time': {
				cli: 't',
				example: '7 days',
				type: doveadm_arg_types.STRING,
				text: `Sync since timestamp.

` + doveadm_args_human_timestamp,
			},
			'sync-until-time': {
				cli: 'e',
				example: '1 day',
				type: doveadm_arg_types.STRING,
				text: `Sync until timestamp.

` + doveadm_args_human_timestamp,
			},
			'sync-flags': {
				cli: 'O',
				example: '\\deleted',
				type: doveadm_arg_types.STRING,
				text: `
Sync only mails that have the specified flag. If the flag name begins with
\`-\`, sync all mails except the ones with the specified flag.`
			},
			'sync-max-size': {
				cli: 'I',
				example: '20M',
				type: doveadm_arg_types.STRING,
				text: `Skip any mails larger than the specified size.

Format: [[link,settings_types_size]]`
			},
			timeout: {
				cli: 'T',
				example: 60,
				type: doveadm_arg_types.INTEGER,
				text: `Timeout (in seconds).`,
			},
			'default-destination': {
				cli: 'd',
				type: doveadm_arg_types.BOOL,
				text: `Use the default destination.`,
			},
			'legacy-dsync': {
				cli: 'E',
				type: doveadm_arg_types.BOOL,
				text: `Use legacy dsync.`,
			},
			destination: {
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `
The synchronized destination. See [[man,doveadm-sync]] for options.`
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-sync'
	},

	'compress connect': {
		args: {
			host: {
				example: 'hostname',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Hostname to connect to.`
			},
			port: {
				example: '123',
				positional: true,
				optional: true,
				type: doveadm_arg_types.INTEGER,
				text: `Port to connect to.`
			},
		},
		man: 'doveadm-compress-connect',
		text: `Connects to a compression-enabled IMAP service.`
	},

	copy: {
		args: {
			'destination-mailbox': {
				example: 'Test',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The destination mailbox.`,
			},
			'source-user': {
				example: 'sourceuser',
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `
Apply the search query to this user's \`mail_location\`.

For CLI use, this is specified by adding the keyword \`user\` followed by
the source user name, e.g., \`user sourceuser\`.`
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-copy',
		text: `Copy messages matching the given search query into another mailbox.`,
	},

	deduplicate: {
		args: {
			'by-msg-id': {
				cli: 'm',
				type: doveadm_arg_types.BOOL,
				text: `Deduplicate by Message-Id header. By default deduplication will be done by message GUIDs.`,
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-deduplicate',
		text: `Expunge duplicated messages in mailboxes.`,
	},

	'dict get': {
		args: {
			user: {
				cli: 'u',
				example: 'username',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			'dict-uri': {
				example: 'dict_label',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
				example: 'example_key',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Key to query.`,
			},
		},
		man: 'doveadm-dict',
		text: `Get key value from configured dictionary.`,
	},

	'dict inc': {
		args: {
			user: {
				cli: 'u',
				example: 'username',
				type: doveadm_arg_types.STRING,
				text: `uid of user to modify.`,
			},
			'dict-uri': {
				example: 'dict_label',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
				example: 'example_key',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Key to query.`,
			},
			difference: {
				example: 1,
				positional: true,
				type: doveadm_arg_types.INTEGER,
				text: `The amount to increment.`,
			},
		},
		man: 'doveadm-dict',
		text: `Increase key value in dictionary.`,
	},

	'dict iter': {
		args: {
			user: {
				cli: 'u',
				example: 'username',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			exact: {
				cli: '1',
				type: doveadm_arg_types.BOOL,
				text: `List only exact matches.`,
			},
			recurse: {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Do recursive searches.`,
			},
			'no-value': {
				cli: 'V',
				type: doveadm_arg_types.BOOL,
				text: `List keys that have no value set.`,
			},
			'dict-uri': {
				example: 'dict_label',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			prefix: {
				example: 'testprefix',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Search only keys with this prefix.`,
			},
		},
		man: 'doveadm-dict',
		text: `List keys in dictionary.`,
	},

	'dict set': {
		args: {
			user: {
				cli: 'u',
				example: 'username',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			'dict-uri': {
				example: 'dict_label',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
				example: 'example_key',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Key to query.`,
			},
			value: {
				example: 'value',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Value to set.`,
			},
		},
		man: 'doveadm-dict',
		text: `Set key value in configured dictionary.`,
	},

	'dict unset': {
		args: {
			user: {
				example: 'username',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			'dict-uri': {
				example: 'dict_label',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
				example: 'example_key',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Key to unset.`,
			},
		},
		man: 'doveadm-dict',
		text: `Unset key value in configured dictionary.`,
	},

	dump: {
		args: {
			type: {
				cli: 't',
				example: 'index',
				type: doveadm_arg_types.STRING,
				text: `The type of file to be dumped.`,
			},
			path: {
				example: '/path/to/file',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Path to the file specified by the type argument.`,
			},
			args: {
				example: ['uid=123'],
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Type specific arguments.`,
			},
		},
		man: 'doveadm-dump',
		text: `Show contents of mailbox index/log files, in human readable format.`
	},

	exec: {
		args: {
			binary: {
				example: 'dovecot-lda',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The name of an executable located in \`/usr/libexec/dovecot\`.`,
			},
			args: {
				example: ['-a arg1', '-b arg2'],
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Options and arguments, which will be passed through to the binary.`
			},
		},
		man: 'doveadm-exec',
		text: `Execute commands from within \`/usr/libexec/dovecot\`.`
	},

	expunge: {
		args: {
			'delete-empty-mailbox': {
				cli: 'd',
				type: doveadm_arg_types.BOOL,
				text: `Delete mailbox if empty after expunge has been applied.`,
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-expunge',
		text: `Expunge messages matching given search query.`,
	},

	fetch: {
		args: {
			field: {
				example: ['text'],
				type: doveadm_arg_types.ARRAY,
				text: `Search fields to fetch.`,
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-fetch',
		//example_response: {
		//	text: "From: Test User <test@example.com>\nSubject: Test\n\nmail body\n",
		//},
		text: `Fetch mail data from user mailbox.`,
	},

	'flags add': {
		args: {
			flag: {
				example: ['\\flag1'],
				type: doveadm_arg_types.ARRAY,
				text: `List of flags to add.`,
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-flags',
		text: `Add flags to message(s).`,
	},

	'flags remove': {
		args: {
			flag: {
				example: ['\\flag1'],
				type: doveadm_arg_types.ARRAY,
				text: `List of flags to remove.`,
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-flags',
		text: `Remove flags from message(s).`,
	},

	'flags replace': {
		args: {
			flag: {
				example: ['\\flag1'],
				type: doveadm_arg_types.ARRAY,
				text: `List of flags to replace with.`
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-flags',
		text: `Replace flags with another flag in message or messages. Replaces all current flags with the ones in the parameter list.`,
	},

	'force resync': {
		args: {
			fsck: {
				cli: 'f',
				type: doveadm_arg_types.BOOL
			},
			'mailbox-mask': {
				text: `Mask of mailboxes to fix.`,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-force-resync',
		text: `Under certain circumstances Dovecot may be unable to automatically solve problems with mailboxes. In such situations the force-resync command may be helpful. It tries to fix all problems. For [[link,sdbox]] and [[link,mdbox]] mailboxes the storage files will be also checked.`,
	},

	'fs copy': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			'source-path': {
				type: doveadm_arg_types.STRING,
				text: `Source object path.`,
			},
			'destination-path': {
				type: doveadm_arg_types.STRING,
				text: `Destination object path.`,
			},
		},
		man: 'doveadm-fs',
		text: `Copy object in storage.`,
	},

	'fs delete': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			recursive: {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Do recursive delete of path.`
			},
			'max-parallel': {
				cli: 'n',
				type: doveadm_arg_types.INTEGER,
				text: `Max number of parallel workers.`,
			},
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object path.`,
			},
		},
		man: 'doveadm-fs',
		text: `Delete object from storage.`,
	},

	'fs get': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object path.`,
			},
		},
		man: 'doveadm-fs',
		text: `Get object from storage.`,
	},

	'fs iter': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			'no-cache': {
				// TODO: Needs to be documented in man page
				cli: 'C',
				type: doveadm_arg_types.BOOL
			},
			'object-ids': {
				// TODO: Needs to be documented in man page
				cli: 'O',
				type: doveadm_arg_types.BOOL
			},
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object path.`,
			},
		},
		man: 'doveadm-fs',
		text: `List objects in fs path.`,
	},

	'fs iter-dirs': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object path.`,
			},
		},
		man: 'doveadm-fs',
		text: `List folders in fs path.`,
	},

	'fs metadata': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object path.`,
			},
		},
		man: 'doveadm-fs',
	},

	'fs put': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			hash: {
				// TODO: Needs to be documented in man page
				cli: 'h',
				type: doveadm_arg_types.STRING
			},
			metadata: {
				// TODO: Needs to be documented in man page
				cli: 'm',
				type: doveadm_arg_types.ARRAY
			},
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			'input-path': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object input path.`,
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object path.`,
			},
		},
		man: 'doveadm-fs',
		text: `Store object in storage.`,
	},

	'fs stat': {
		/* No examples in here, as this command's use should not be
		 * encouraged. */
		args: {
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Object path.`,
			},
		},
		man: 'doveadm-fs',
		text: `Retrieve files status for the path provided. Currently, only the total size (in bytes) of the item is returned.`,
	},

	'fts expand': {
		args: {
			query: doveadm_args_query,
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Expand query using FTS.`,
	},

	'fts lookup': {
		args: {
			query: doveadm_args_query,
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Search mail with FTS plugin.`,
	},

	'fts optimize': {
		args: {
			namespace: {
				example: '#shared',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Namespace to optimize.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Optimize FTS data.`,
	},

	'fts rescan': {
		args: {
			namespace: {
				example: '#shared',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Namespace to rebuild.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Rebuild FTS indexes.`,
	},

	// TODO: Needs to be documented in man page
	'fts tokenize': {
		args: {
			language: {
				type: doveadm_arg_types.STRING,
			},
			text: {
				example: `c’est la vie`,
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `String to tokenize.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Search mail with FTS plugin.`,
	},

	'import': {
		args: {
			'source-user': {
				cli: 'U',
				example: 'sourceuser',
				type: doveadm_arg_types.STRING,
				text: `UID of user to apply import to.`,
			},
			subscribe: {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Newly created folders are also subscribed to.`,
			},
			'source-location': {
				example: 'maildir:/backup/Maildir',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Location of source mailbox.`,
			},
			'dest-parent-mailbox': {
				example: 'backup',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Destination parent mailbox where to import.`,
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-import',
		text: `Import messages matching given search query.`,
	},

	index: {
		args: {
			queue: {
				cli: 'q',
				type: doveadm_arg_types.BOOL,
				text: `Queue index operation for later execution.`,
			},
			'max-recent': {
				cli: 'n',
				example: 10,
				type: doveadm_arg_types.STRING,
				text: `Max number of recent mails to index.`,
			},
			'mailbox-mask': {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox search mask to apply indexing to.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-index',
		text: `Index user mailbox folder or folders.`,
	},

	'indexer add': {
		args: {
			head: {
				cli: 'h',
				type: doveadm_arg_types.BOOL,
				text: `Add request to the head of the queue.`,
			},
			'max-recent': {
				cli: 'n',
				example: 10,
				// TODO: This is treated/documented as an integer value
				// (CMD_PARAM_INT64), but is defined as a string in source
				// (CMD_PARAM_STR).
				type: doveadm_arg_types.STRING,
				text: `The maximum number of \\Recent messages in the mailboxes.`,
			},
			user: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The user to add.`,
			},
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The mailbox to index.`,
			},
		},
		man: 'doveadm-indexer',
		text: `Add indexing request for the given user and the mailbox to the indexer queue.`,
	},

	'indexer list': {
		args: {
			'user-mask': { ...doveadm_args_usermask, ...{ optional: true } }
		},
		man: 'doveadm-indexer',
		text: `List queued index requests.`,
	},

	'indexer remove': {
		args: {
			'user-mask': doveadm_args_usermask,
			'mailbox-mask': {
				example: 'Trash',
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `The mailbox mask to remove.`,
			},
		},
		man: 'doveadm-indexer',
		text: `Remove index requests.`,
	},

	'instance list': {
		args: {
			'show-config': {
				cli: 'c',
				type: doveadm_arg_types.BOOL,
			},
			name: {
				example: 'instance_name',
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
			},
		},
		man: 'doveadm-instance',
		text: `List Dovecot instances.`,
	},

	'instance remove': {
		args: {
			name: {
				example: 'instance_name',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The instance to remove.`,
			},
		},
		man: 'doveadm-instance',
		text: `Remove Dovecot instances.`,
	},

	kick: {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: '/rundir/anvil',
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'passdb-field': {
				cli: 'f',
				example: 'alt_username_field',
				type: doveadm_arg_types.STRING,
				text: `Alternative username field to use for kicking.`,
			},
			'dest-host': {
				cli: 'h',
				example: 'destination_host',
				type: doveadm_arg_types.STRING,
				text: `Disconnect proxy connections to this destination host.`,
			},
			mask: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID mask.`,
			},
		},
		man: 'doveadm-kick',
		text: `Kick user.`,
	},

	'log errors': {
		args: {
			since: {
				cli: 'c',
				example: 2147483647,
				type: doveadm_arg_types.INTEGER,
				text: `Only show errors since this point in time (UNIX timestamp).`,
			},
		},
		man: 'doveadm-log',
		text: `Fetch error logs.`,
	},

	'log find': {
		args: {
			'log-dir': {
				example: '/syslogd/write/path',
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `Specify directory where syslogd writes files.`,
			},
		},
		man: 'doveadm-log',
		text: `Show the location of logs.`,
	},

	'log reopen': {
		args: {},
		man: 'doveadm-log',
		text: `Cause master process to reopen all log files.`,
	},

	'log test': {
		args: {},
		man: 'doveadm-log',
		text: `Write a test message to the log files.`,
	},

	'mailbox cache decision': {
		args: {
			all: {
				cli: 'a',
				type: doveadm_arg_types.BOOL,
				text: `List or change all fields.`,
			},
			fieldstr: {
				cli: 'f',
				example: 'field1 field2',
				type: doveadm_arg_types.STRING,
				text: `List or change these fields (comma/space separated).`,
			},
			'last-used': {
				cli: 'l',
				example: 2147483647,
				type: doveadm_arg_types.INTEGER,
				text: `Set last used timestamp.`,
			},
			decision: {
				cli: 'd',
				example: 'yes',
				type: doveadm_arg_types.STRING,
				text: `Set field caching decision`,
			},
			mailbox: {
				example: ['Trash'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailboxes to change cache decisions for.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `List or change caching decisions for field(s).`,
	},

	'mailbox cache purge': {
		args: {
			mailbox: {
				example: ['Trash'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailboxes to purge index file.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Purge the dovecot.index.cache file.`,
	},

	'mailbox cache remove': {
		args: {
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Remove matching mails from the cache.`,
	},

	'mailbox create': {
		args: {
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Add to subscription list.`,
			},
			guid: {
				cli: 'g',
				example: 'mailbox-guid',
				type: doveadm_arg_types.STRING,
				text: `Create mailbox with this GUID.`,
			},
			mailbox: {
				example: ['Test'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailboxes to create.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Create mailboxes.`,
	},

	'mailbox cryptokey generate': {
		args: {
			'user-key-only': {
				cli: 'U',
				type: doveadm_arg_types.BOOL,
				text: `Operate on user keypair only.`
			},
			're-encrypt-box-keys': {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Re-encrypt all folder keys with current active user key`
			},
			'force': {
				cli: 'f',
				type: doveadm_arg_types.BOOL,
				text: `Force keypair creation, normally keypair is only created if none found.`
			},
			'mailbox': {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox mask.`
			},
		},
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
		man: 'doveadm-mailbox-cryptokey',
		text: `
Generate new keypair for user or folder.

To generate new active user key and re-encrypt all your keys with it can be
done with

\`\`\`sh
doveadm mailbox cryptokey generate -u username -UR
\`\`\`

This can be used to generate new user keypair and re-encrypt and create folder
keys.

::: info
You must provide a password if you want to generate password-protected
keypair right away. You can also use [[doveadm,mailbox cryptokey password]]
to secure it.
:::`
	},

	'mailbox cryptokey list': {
		args: {
			'user-key': {
				cli: 'U',
				type: doveadm_arg_types.BOOL,
				text: `Operate on user keypair only.`
			},
			'mailbox': {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox mask.`
			},
		},
		response: null,
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
		man: 'doveadm-mailbox-cryptokey',
		text: `List all keys for user or mailbox.`
	},

	'mailbox cryptokey export': {
		args: {
			'user-key': {
				cli: 'U',
				type: doveadm_arg_types.BOOL,
				text: `Operate on user keypair only.`
			},
			'mailbox': {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox mask.`
			},
		},
		response: null,
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
		man: 'doveadm-mailbox-cryptokey',
		text: `Exports user or folder private keys.`
	},

	'mailbox cryptokey password': {
		args: {
			'clear-password': {
				cli: 'C',
				type: doveadm_arg_types.BOOL,
				text: `Clear password.`
			},
			'ask-new-password': {
				cli: 'N',
				type: doveadm_arg_types.BOOL,
				text: `Ask new password.`
			},
			'new-password': {
				cli: 'n',
				example: 'newpassword',
				type: doveadm_arg_types.STRING,
				text: `New password.`
			},
			'ask-old-password': {
				cli: 'O',
				type: doveadm_arg_types.BOOL,
				text: `Ask old password.`
			},
			'old-password': {
				cli: 'o',
				example: 'oldpassword',
				type: doveadm_arg_types.STRING,
				text: `Old password.`
			},
		},
		response: null,
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
		man: 'doveadm-mailbox-cryptokey',
		text: `Sets, changes or clears password for user's private key.`
	},

	'mailbox delete': {
		args: {
			'require-empty': {
				cli: 'e',
				type: doveadm_arg_types.BOOL,
				text: `Require mailboxes to be empty before deleting.`,
			},
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Unsubscribe deleted mailboxes.`,
			},
			recursive: {
				cli: 'r',
				type: doveadm_arg_types.BOOL,
				text: `Delete mailboxes recursively.`,
			},
			unsafe: {
				cli: 'Z',
				type: doveadm_arg_types.BOOL,
				text: `Delete mailboxes as efficiently as possible.`,
			},
			mailbox: {
				example: ['Test'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `The mailboxes to delete.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Delete mailboxes.`,
	},

	'mailbox metadata get': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Allow to specify an empty mailbox name string.`,
			},
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Target mailbox to query.`,
			},
			key: {
				example: 'key',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Metadata key to retrieve.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Get metadata for a mailbox.`,
	},

	'mailbox metadata list': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Allow to specify an empty mailbox name string.`,
			},
			'prepend-prefix': {
				cli: 'p',
				type: doveadm_arg_types.BOOL,
				text: `Prepend the prefix to results.`,
			},
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Target mailbox to query.`,
			},
			'key-prefix': {
				example: 'key-prefix',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key prefix to look for.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `List metadata for a mailbox.`,
	},

	'mailbox metadata set': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Allow to specify an empty mailbox name string.`,
			},
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Target mailbox.`,
			},
			key: {
				example: 'key',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key to add.`,
			},
			value: {
				example: 'value',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The value to add.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Set metadata for a mailbox.`,
	},

	'mailbox metadata unset': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Allow to specify an empty mailbox name string.`,
			},
			mailbox: {
				example: 'INBOX',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Target mailbox.`,
			},
			key: {
				example: 'key',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key to delete.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Unset metadata for a mailbox.`,
	},

	'mailbox list': {
		args: {
			mutf7: {
				cli: '7',
				type: doveadm_arg_types.BOOL,
				text: `Lists mailboxes with mUTF-7 encoding.`,
			},
			utf8: {
				cli: '8',
				type: doveadm_arg_types.BOOL,
				text: `Lists mailboxes with UTF-8 encoding.`,
			},
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Only list subscribed mailboxes.`,
			},
			'mailbox-mask': {
				example: ['INBOX'],
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY,
				text: `A list of mailbox masks to list.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Get list of existing mailboxes.`,
	},

	'mailbox mutf7': {
		args: {
			toUtf8: {
				cli: '7',
				type: doveadm_arg_types.BOOL,
				text: `Mailbox is in mUTF-7 format.`,
			},
			fromUtf8: {
				cli: '8',
				type: doveadm_arg_types.BOOL,
				text: `Mailbox is in UTF-8 format.`,
			},
			name: {
				example: ['Test'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailbox names to convert.`,
			},
		},
		man: 'doveadm-mailbox',
		text: `Convert mailbox names from mUTF-7 to UTF-8.`,
	},

	'mailbox path': {
		args: {
			type: {
				cli: 't',
				example: 'index',
				type: doveadm_arg_types.STRING,
				text: `Mailbox path type.`
			},
			mailbox: {
				example: ['INBOX'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailbox name to query.`
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Returns filesystem paths for the mailboxes.`,
	},

	'mailbox rename': {
		args: {
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Unsubscribe old mailbox and subscribe new mailbox.`,
			},
			mailbox: {
				example: 'OldName',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The source mailbox name.`,
			},
			'new-name': {
				example: 'NewName',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The destination mailbox name.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Rename mailbox.`,
	},

	'mailbox status': {
		args: {
			'total-sum': {
				cli: 't',
				type: doveadm_arg_types.BOOL,
				text: `Sum values of status fields.`,
			},
			field: {
				cli: 'f',
				example: ['all'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Fields that should be shown.`,
			},
			'mailbox-mask': {
				example: ['INBOX'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailboxes to query.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Show status of mailboxes.`,
	},

	'mailbox subscribe': {
		args: {
			mailbox: {
				example: ['Test'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailboxes to subscribe to.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Subscribe to mailboxes.`,
	},

	'mailbox unsubscribe': {
		args: {
			mailbox: {
				example: ['Test'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Mailboxes to unsubscribe from.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Unsubscribe from mailboxes.`,
	},

	'mailbox update': {
		/* No examples in here, because this command's use should not be
		 * encouraged. */
		args: {
			'mailbox-guid': {
				cli: 'g',
				type: doveadm_arg_types.STRING,
				text: `Mailbox GUID.`,
			},
			'uid-validity': {
				cli: 'V',
				type: doveadm_arg_types.INTEGER,
				text: `UID validity.`,
			},
			'min-next-uid': {
				cli: 'N',
				type: doveadm_arg_types.INTEGER,
				text: `Minimum NEXTUID.`,
			},
			'min-first-recent-uid': {
				cli: 'R',
				type: doveadm_arg_types.INTEGER,
				text: `First recent UID.`,
			},
			'min-highest-modseq': {
				cli: 'H',
				type: doveadm_arg_types.INTEGER,
				text: `Minimum highest MODSEQ.`,
			},
			'min-highest-private-modseq': {
				cli: 'P',
				type: doveadm_arg_types.INTEGER,
				text: `Minimum highest private MODSEQ.`,
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to update.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
		text: `Set internal mailbox metadata.`,
	},

	move: {
		args: {
			'destination-mailbox': {
				example: 'Test',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The destination mailbox.`,
			},
			'source-user': {
				example: 'sourceuser',
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `
Apply the search query to this user's \`mail_location\`.

For CLI use, this is specified by adding the keyword \`user\` followed by
the source user name, e.g., \`user sourceuser\`.`
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-move',
	},

	penalty: {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: '/rundir/anvil',
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			netmask: {
				example: '127.0.0.0/8',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filter output by netmask.`,
			},
		},
		man: 'doveadm-penalty',
	},

	'process status': {
		args: {
			service: {
				example: ['stats'],
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Filter output to only these services.`,
			},
		},
		man: 'doveadm-process-status',
	},

	'proxy kick': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: '/rundir/anvil',
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'passdb-field': {
				cli: 'f',
				example: 'alt_username_field',
				type: doveadm_arg_types.STRING,
				text: `Alternative username field to use for kicking.`,
			},
			'dest-host': {
				cli: 'h',
				example: 'destination_host',
				type: doveadm_arg_types.STRING,
				text: `Disconnect proxy connections to this destination host.`,
			},
			mask: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID mask.`,
			},
		},
		changed: {
			'doveadm_proxy_kick_args': `
* \`host\` argument has been changed to \`dest-host\`.
* \`user\` argument has been changed to \`mask\`.`,
		},
		man: 'doveadm-proxy',
		text: `Kick user.`,
	},

	'proxy list': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: '/rundir/anvil',
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'separate-connections': {
				cli: '1',
				type: doveadm_arg_types.BOOL,
				text: `Output one entry per user/connection.`,
			},
			'passdb-field': {
				cli: 'f',
				example: 'alt_username_field',
				type: doveadm_arg_types.STRING,
				text: `Alternative username field to use for listing.`,
			},
			mask: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID mask.`,
			},
		},
		added: {
			'doveadm_proxy_list_args_added': `
\`separate-connections\`, \`passdb-field\`, and \`mask\` arguments added.`
		},
		changed: {
			'doveadm_proxy_list_response_changed': `
The response format has changed.

Dovecot now returns different formats based on the value of
\`separate-connections\`. If \`separate-connections\` is true, \`pid\`,
\`ip\`, \`dest_ip\`, and list of \`alt_username_fields\` (from anvil) is
returned.`,
		},
		man: 'doveadm-proxy',
		text: `Show who is logged into the Dovecot server.`,
	},

	purge: {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-purge',
		text: `Remove all messages with refcount=0 from a user's mail storage.`,
	},

	pw: {
		args: {
			list: {
				cli: 'l',
				type: doveadm_arg_types.BOOL,
				text: `List all supported password schemes.`,
			},
			plaintext: {
				cli: 'p',
				example: 'password',
				type: doveadm_arg_types.STRING,
				text: `Plaintext password.`,
			},
			rounds: {
				cli: 'r',
				example: 5000,
				type: doveadm_arg_types.INTEGER,
				text: `Number of encryption rounds.`,
			},
			scheme: {
				cli: 's',
				example: 'CRYPT',
				type: doveadm_arg_types.STRING,
				text: `The password scheme to use.`,
			},
			'test-hash': {
				cli: 't',
				example: 'password_hash',
				type: doveadm_arg_types.STRING,
				text: `Test if hash matches password (e.g., \`plaintext\` argument).`,
			},
			user: {
				cli: 'u',
				example: 'username',
				type: doveadm_arg_types.STRING,
				text: `Username to use for schemes that require one.`,
			},
			'reverse-verify': {
				cli: 'V',
				type: doveadm_arg_types.BOOL,
				text: `Internally verify hashed password.`,
			},
		},
		man: 'doveadm-pw',
		text: `Generate password hashes.`,
	},

	'quota get': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'quota',
		man: 'doveadm-quota',
		text: `Display current quota usage.`,
	},

	'quota recalc': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'quota',
		man: 'doveadm-quota',
		text: `Recalculate current quota usage.`,
	},

	'rebuild attachments': {
		args: {
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-rebuild',
		text: `Rebuild attachment detection information in index.`,
	},

	reload: {
		args: {},
		man: 'doveadm',
		text: `Reload Dovecot configuration.`,
	},

	save: {
		args: {
			mailbox: {
				cli: 'm',
				example: 'Test',
				type: doveadm_arg_types.STRING,
				text: `Save in this mailbox instead of INBOX.`,
			},
			uid: {
				cli: 'U',
				example: 1000,
				type: doveadm_arg_types.INTEGER,
				text: `Save using this UID.`,
			},
			guid: {
				cli: 'g',
				example: 1000,
				type: doveadm_arg_types.STRING,
				text: `Save using this GID.`,
			},
			'received-date': {
				cli: 'r',
				example: `2007-04-13`,
				type: doveadm_arg_types.STRING,
				text: `Save with this as the received date.`,
			},
			file: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The message data to save.`,
			},
		},
		added: {
			'doveadm_save_args_added': `
\`received-date\`, \`uid\`, and \`gid\` arguments added.`
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-save',
		text: `Save messages to a mailbox.`,
	},

	search: {
		args: {
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-search',
		text: `Find matching messages in mailbox.`,
	},

	'service status': {
		args: {
			service: {
				example: ['name'],
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Filter output to only these services.`,
			},
		},
		man: 'doveadm-service-status',
		text: `Show information about Dovecot services.`,
	},

	'service stop': {
		args: {
			service: {
				example: ['stats'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `The list of services to stop.`,
			},
		},
		man: 'doveadm-service-stop',
		text: `Stop Dovecot services.`
	},

	'sieve activate': {
		args: {
			scriptname: {
				example: 'scriptname',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The script name to mark as active.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		text: `Mark active Sieve script.`,
	},

	'sieve deactivate': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		text: `Deactivate Sieve script.`,
	},

	'sieve delete': {
		args: {
			'ignore-active': {
				cli: 'a',
				type: doveadm_arg_types.BOOL,
				text: `If set, allows the active script to be deleted.`,
			},
			scriptname: {
				example: ['scriptname'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `The list of scripts to delete.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		text: `Delete Sieve scripts.`,
	},

	'sieve get': {
		args: {
			scriptname: {
				example: 'scriptname',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The script to retrieve.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		text: `Retrieve a Sieve script.`,
	},

	'sieve list': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		text: `List Sieve scripts.`,
	},

	'sieve put': {
		args: {
			activate: {
				cli: 'a',
				type: doveadm_arg_types.BOOL,
				text: `Mark script as active.`,
			},
			scriptname: {
				example: 'scriptname',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The script to retrieve.`,
			},
			file: {
				positional: true,
				type: doveadm_arg_types.ISTREAM,
				text: `The script to add.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		text: `Add Sieve script to storage.`,
	},

	'sieve rename': {
		args: {
			oldname: {
				example: 'old_scriptname',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The old scriptname.`,
			},
			newname: {
				example: 'new_scriptname',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The new scriptname.`,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		text: `Rename Sieve script.`,
	},

	/* Deprecated. */
	'sis find': {
		args: {
			'root-dir': {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			'hash': {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
	},

	// TODO: Fix man page TODOs
	'stats add': {
		args: {
			exporter: {
				type: doveadm_arg_types.STRING
			},
			'exporter-include': {
				type: doveadm_arg_types.STRING
			},
			description: {
				type: doveadm_arg_types.STRING
			},
			fields: {
				type: doveadm_arg_types.STRING
			},
			'group-by': {
				type: doveadm_arg_types.STRING
			},
			name: {
				example: 'metric_name',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Metric name.`,
			},
			filter: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		man: 'doveadm-stats',
		text: `Add metrics to statistics.`,
	},

	'stats dump': {
		args: {
			socketPath: {
				cli: 's',
				cli_only: true,
				example: '/path/to/stats',
				type: doveadm_arg_types.STRING,
				text: `Path to socket path.`,
			},
			reset: {
				cli: 'r',
				type: doveadm_arg_types.BOOL,
				text: `Reset stats after dumping.`,
			},
			fields: {
				cli: 'f',
				type: doveadm_arg_types.STRING,
				text: `Stats fields to return.`,
			},
		},
		man: 'doveadm-stats',
		text: `Output statistics.`,
	},

	'stats remove': {
		args: {
			name: {
				example: 'metric_name',
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The metric to remove.`,
			},
		},
		man: 'doveadm-stats',
		text: `Remove metrics from statistics.`,
	},

	'stats reopen': {
		args: {},
		man: 'doveadm-stats',
		text: `Reopen file exporter files.`,
	},

	'stop': {
		args: {},
		man: 'doveadm',
		text: `Stop Dovecot.`,
	},

	sync: {
		args: {
			'full-sync': {
				cli: 'f',
				type: doveadm_arg_types.BOOL,
				text: `Do full synchronization.`,
			},
			'purge-remote': {
				cli: 'P',
				type: doveadm_arg_types.BOOL,
				text: `Run a purge for remote after sync.`,
			},
			'reverse-sync': {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Do a reverse sync.`,
			},
			'lock-timeout': {
				cli: 'l',
				example: 60,
				type: doveadm_arg_types.INTEGER,
				text: `Lock timeout (in seconds).`,
			},
			rawlog: {
				cli: 'r',
				example: '/tmp/rawlog',
				type: doveadm_arg_types.STRING,
				text: `Rawlog path.`,
			},
			mailbox: {
				cli: 'm',
				example: 'INBOX',
				type: doveadm_arg_types.STRING,
				text: `Only sync this mailbox.`,
			},
			'mailbox-guid': {
				cli: 'g',
				example: 'mailbox-guid',
				type: doveadm_arg_types.STRING,
				text: `Only sync this mailbox (by GUID).`,
			},
			namespace: {
				cli: 'n',
				example: ['#shared'],
				type: doveadm_arg_types.ARRAY,
				text: `Only sync this list of namespaces.`,
			},
			'all-namespaces': {
				cli: 'N',
				type: doveadm_arg_types.BOOL,
				text: `Sync all namespaces.`,
			},
			'exclude-mailbox': {
				cli: 'x',
				example: ['Spam'],
				type: doveadm_arg_types.ARRAY,
				text: `Exclude these mailboxes.`,
			},
			'all-mailbox': {
				cli: 'a',
				example: 'AllMailbox',
				type: doveadm_arg_types.STRING,
				text: `Name for the "All Mails" virtual mailbox.`,
			},
			state: {
				cli: 's',
				example: 'state_string',
				type: doveadm_arg_types.STRING,
				text: `Use stateful sync.`,
			},
			'sync-since-time': {
				cli: 't',
				example: '2023-04-13',
				type: doveadm_arg_types.STRING,
				text: `Skip mails older than this date.`,
			},
			'sync-until-time': {
				cli: 'e',
				example: '2023-10-21',
				type: doveadm_arg_types.STRING,
				text: `Skip mails newer than this date.`,
			},
			'sync-flags': {
				cli: 'O',
				example: '\\Flagged',
				type: doveadm_arg_types.STRING,
				text: `Sync only mails with this flag.`,
			},
			'sync-max-size': {
				cli: 'I',
				example: '10M',
				type: doveadm_arg_types.STRING,
				text: `Skip mails larger than this size.`,
			},
			timeout: {
				cli: 'T',
				example: 600,
				type: doveadm_arg_types.INTEGER,
				text: `Timeout for stalled I/O operations.`,
			},
			'default-destination': {
				cli: 'd',
				type: doveadm_arg_types.BOOL,
				text: `Use the default destination.`,
			},
			/* This is not documented in man page, so it is hidden here.
			'legacy-dsync': {
				cli: 'E',
				type: doveadm_arg_types.BOOL,
				text: `Do full synchronization.`,
			},
			*/
			'oneway-sync': {
				cli: '1',
				type: doveadm_arg_types.BOOL,
				text: `Do one-way synchronization.`,
			},
			destination: {
				example: ['maildir:~/Maildir'],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `Sync destinations.`
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-sync',
		text: `Dovecot's mailbox synchronization utility.`,
	},

	user: {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: `/var/run/dovecot/doveadm-server`,
				type: doveadm_arg_types.STRING,
				text: `userdb socket path`
			},
			'auth-info': {
				cli: 'x',
				example: ['service=imap'],
				type: doveadm_arg_types.ARRAY,
				text: `Additional conditions for auth lookup.`,
			},
			field: {
				cli: 'f',
				example: 'userdb_field',
				type: doveadm_arg_types.STRING,
				text: `Only show value of this field.`,
			},
			// TODO: Needs documentation in man file
			'expand-field': {
				cli: 'e',
				type: doveadm_arg_types.STRING
			},
			'userdb-only': {
				cli: 'u',
				type: doveadm_arg_types.BOOL,
				text: `Only show values from userdb.`,
			},
			'user-mask': doveadm_args_usermask,
		},
		man: 'doveadm-user',
		text: `Lookup user in Dovecot's userdbs.`,
	},

	who: {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				example: '/rundir/anvil',
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'separate-connections': {
				cli: '1',
				type: doveadm_arg_types.BOOL,
				text: `Output one entry per user/connection.`,
			},
			'passdb-field': {
				cli: 'f',
				example: 'alt_username_field',
				type: doveadm_arg_types.STRING,
				text: `Alternative username field to use for lookup.`,
			},
			mask: {
				example: 'username',
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID -or- IP Address mask.`,
			},
		},
		response: {
			example: [
				{
					username: "foo",
					connections: "1",
					service: "imap",
					pid: "(47)",
					ip: "(10.0.2.100)"
				}
			],
			text: `
Returns an array of objects.

If \`separate-connections\` is \`false\`, each object represents a single
username/service combination, and the \`pid\` and \`ip\` fields will include
all entries for that combination.

If \`separate-connections\` is \`true\`, each object will contain a single
connection.

Object fields:

| Key | Description |
| --- | ----------- |
| \`connections\` | The total number of connections for the user. This is only returned if \`separate-connections\` is \`false\`. |
| \`ip\` | IP addresses where the user's connections are originating. |
| \`pid\` | Process IDs of the session. |
| \`service\` | The Dovecot service. |
| \`username\` | Username |
`
		},
		man: 'doveadm-who',
		text: `Show who is logged into the Dovecot server.`,
	},

}
