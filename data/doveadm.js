/* List of Dovecot doveadm types. */
import { doveadm_arg_types,
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

				// If true, this is an optional positional argument.
				// optional: true,

				// If true, this is a positional argument. Positional
				// arguments are handled in array order.
				// positional: true,

				// The argument type
				type: doveadm_arg_types.BOOL,

				// Description of the parameter. Rendered w/Markdown.
				text: `Do a reverse move?`,
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

		// Fields/Values returned. Values are rendered w/Markdown.
		// fields: {},

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
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to add to.`,
			},
			id: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `ID to add to.`,
			},
			right: {
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
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to delete.`,
			},
			id: {
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
				type: doveadm_arg_types.BOOL,
			},
			mailbox: {
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
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox to replace rights.`,
			},
			id: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `ID to replace.`,
			},
			right: {
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
				//example: `/var/run/dovecot/doveadm-server`,
				cli: 'a',
				cli_only: true,
				type: doveadm_arg_types.STRING,
				text: `Path to doveadm socket.`,
			},
			user: {
				//example: `foo`,
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID of user to apply operation to.`,
			},
		},
		fields: {
			'entries': 0
		},
		man: 'doveadm-auth',
		text: `Flush authentication cache.`,
	},

	'auth login': {
		args: {
			'auth-login-socket-path': {
				cli: 'a',
				cli_only: true,
				type: doveadm_arg_types.STRING,
			},
			'auth-master-socket-path': {
				cli: 'm',
				cli_only: true,
				type: doveadm_arg_types.STRING,
			},
			'sasl-mech': {
				cli: 'm',
				type: doveadm_arg_types.STRING,
			},
			'auth-info': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY,
				text: `Specifies additional conditions for the user command.`,
			},
			'master-user': {
				cli: 'M',
				type: doveadm_arg_types.STRING,
				text: `Master user.`,
			},
			user: {
				//example: `foo`,
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Login UID.`,
			},
			password: {
				//example: `bar`,
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
				//example: `/var/run/dovecot/doveadm-server`,
				cli: 'a',
				cli_only: true,
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
				type: doveadm_arg_types.STRING,
				text: `Only return value of this field.`,
			},
			user: {
				//example: `foo`,
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
				//example: `/var/run/dovecot/doveadm-server`,
				cli: 'a',
				cli_only: true,
				type: doveadm_arg_types.STRING,
				text: `Path to doveadm socket.`,
			},
			'sasl-mech': {
				cli: 'A',
				type: doveadm_arg_types.STRING,
			},
			'auth-info': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY,
				text: `Specifies additional conditions for the user command.`,
			},
			'master-user': {
				cli: 'M',
				type: doveadm_arg_types.STRING,
				text: `Master user.`
			},
			user: {
				//example: `foo`,
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Login UID.`
			},
			password: {
				//example: `bar`,
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
			},
			'purge-remote': {
				cli: 'P',
				type: doveadm_arg_types.BOOL,
			},
			'reverse-sync': {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
			},
			'lock-timeout': {
				cli: 'l',
				type: doveadm_arg_types.INTEGER,
			},
			rawlog: {
				cli: 'r',
				type: doveadm_arg_types.STRING,
			},
			mailbox: {
				cli: 'm',
				type: doveadm_arg_types.STRING,
			},
			'mailbox-guid': {
				cli: 'g',
				type: doveadm_arg_types.STRING,
			},
			namespace: {
				cli: 'n',
				type: doveadm_arg_types.ARRAY,
			},
			'all-namespaces': {
				cli: 'N',
				type: doveadm_arg_types.BOOL,
			},
			'exclude-mailbox': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY,
			},
			'all-mailbox': {
				cli: 'a',
				type: doveadm_arg_types.STRING,
			},
			state: {
				cli: 's',
				type: doveadm_arg_types.STRING,
			},
			'sync-since-time': {
				cli: 't',
				type: doveadm_arg_types.STRING,
			},
			'sync-until-time': {
				cli: 'e',
				type: doveadm_arg_types.STRING,
			},
			'sync-flags': {
				cli: 'O',
				type: doveadm_arg_types.STRING,
			},
			'sync-max-size': {
				cli: 'I',
				type: doveadm_arg_types.STRING,
			},
			timeout: {
				cli: 'T',
				type: doveadm_arg_types.INTEGER,
			},
			'default-destination': {
				cli: 'd',
				type: doveadm_arg_types.BOOL,
			},
			'legacy-dsync': {
				cli: 'E',
				type: doveadm_arg_types.BOOL,
			},
			destination: {
				positional: true,
				type: doveadm_arg_types.ARRAY,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-sync'
	},

	'compress connect': {
		args: {
			host: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Hostname to connect to.`
			},
			port: {
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
				positional: true,
				type: doveadm_arg_types.STRING,
			},
			'source-user': {
				// TODO: key-value with 'user'
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
			},
			'user': {
				// TODO: key-value with 'source-user'
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
			},
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-move',
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
				//example: 'foo',
				cli: 'u',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			'dict-uri': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
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
				//example: 'foo',
				cli: 'u',
				type: doveadm_arg_types.STRING,
				text: `uid of user to modify.`,
			},
			'dict-uri': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Key to query.`,
			},
			difference: {
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
				//example: 'foo',
				cli: 'u',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			exact: {
				cli: '1',
				type: doveadm_arg_types.BOOL,
				text: `List only exact matches?`,
			},
			recurse: {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Do recursive searches?`,
			},
			'no-value': {
				cli: 'V',
				type: doveadm_arg_types.BOOL,
				text: `List keys that have no value set?`,
			},
			'dict-uri': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			prefix: {
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
				//example: 'foo',
				cli: 'u',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			'dict-uri': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Key to query.`,
			},
			value: {
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
				//example: 'foo',
				type: doveadm_arg_types.STRING,
				text: `uid of user to query.`,
			},
			'dict-uri': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `URI for dictionary to query.`,
			},
			key: {
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
				type: doveadm_arg_types.STRING,
			},
			path: {
				positional: true,
				type: doveadm_arg_types.STRING,
			},
			args: {
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY,
			},
		},
		man: 'doveadm-dump',
		text: `Show contents of mailbox index/log files, in human readable format.`
	},

	exec: {
		args: {
			binary: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The name of an executable located in \`/usr/libexec/dovecot\`.`,
			},
			args: {
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
				//example: ['text'],
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
		args: {
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
		args: {
			recursive: {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Do recursive delete of path.`
			},
			maxParallel: {
				cli: 'n',
				type: doveadm_arg_types.INTEGER,
				text: `Max number of parallel workers.`,
			},
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
		args: {
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
		args: {
			noCache: {
				cli: 'C',
				type: doveadm_arg_types.BOOL
			},
			objectIds: {
				cli: 'O',
				type: doveadm_arg_types.BOOL
			},
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
		args: {
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
		args: {
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
		args: {
			hash: {
				cli: 'h',
				type: doveadm_arg_types.STRING
			},
			metadata: {
				cli: 'm',
				type: doveadm_arg_types.ARRAY
			},
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
		args: {
			'fs-driver': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver to use.`
			},
			'fs-args': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Filesystem driver arguments to use.`
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
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Namespace to rebuild.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Rebuild FTS indexes.`,
	},

	'fts tokenize': {
		args: {
			language: {
				type: doveadm_arg_types.STRING,
			},
			text: {
				//example: `c’est la vie`,
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
				type: doveadm_arg_types.STRING,
				text: `UID of user to apply import to.`,
			},
			subscribe: {
				cli: 's',
				type: doveadm_arg_types.BOOL,
				text: `Newly created folders are also subscribed to.`,
			},
			'source-location': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Location of source mailboxes.`,
			},
			'dest-parent-mailbox': {
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
				type: doveadm_arg_types.STRING,
				text: `Max number of recent mails to index.`,
			},
			'mailbox-mask': {
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
				type: doveadm_arg_types.STRING,
				text: `The maximum number of \\Recent messages in the mailboxes.`,
			},
			user: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The user to add.`,
			},
			mailbox: {
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
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'passdb-field': {
				cli: 'f',
				type: doveadm_arg_types.STRING,
				text: `Passdb field.`
			},
			'dest-host': {
				cli: 'h',
				type: doveadm_arg_types.STRING,
				text: `Destination host.`
			},
			mask: {
				//example: `testuser001`,
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
				type: doveadm_arg_types.BOOL
			},
			fieldstr: {
				cli: 'f',
				type: doveadm_arg_types.STRING
			},
			'last-used': {
				cli: 'l',
				type: doveadm_arg_types.INTEGER
			},
			decision: {
				cli: 'd',
				type: doveadm_arg_types.STRING
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox cache purge': {
		args: {
			mailbox: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox cache remove': {
		args: {
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox create': {
		args: {
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			guid: {
				cli: 'g',
				type: doveadm_arg_types.STRING
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
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
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox mask.`
			},
		},
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
		text: `
Generate new keypair for user or folder.

To generate new active user key and re-encrypt all your keys with it can be
done with

\`\`\`sh
doveadm mailbox cryptokey generate -u username -UR
\`\`\`

This can be used to generate new user keypair and re-encrypt and create folder
keys.

::: info Note
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
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox mask.`
			},
		},
		fields: {},
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
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
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Mailbox mask.`
			},
		},
		fields: {},
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
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
				type: doveadm_arg_types.STRING,
				text: `Old password.`
			},
		},
		fields: {},
		flags: doveadm_flag_types.USER,
		plugin: 'mail-crypt',
		text: `Sets, changes or clears password for user's private key.`
	},

	'mailbox delete': {
		args: {
			'require-empty': {
				cli: 'e',
				type: doveadm_arg_types.BOOL
			},
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			recursive: {
				cli: 'r',
				type: doveadm_arg_types.BOOL
			},
			unsafe: {
				cli: 'Z',
				type: doveadm_arg_types.BOOL
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox metadata get': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox metadata list': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			'prepend-prefix': {
				cli: 'p',
				type: doveadm_arg_types.BOOL
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			'key-prefix': {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox metadata set': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			value: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox metadata unset': {
		args: {
			'allow-empty-mailbox-name': {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox list': {
		args: {
			mutf7: {
				cli: '7',
				type: doveadm_arg_types.BOOL
			},
			utf8: {
				cli: '8',
				type: doveadm_arg_types.BOOL
			},
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			'mailbox-mask': {
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox mutf7': {
		args: {
			toUtf8: {
				cli: '7',
				type: doveadm_arg_types.BOOL
			},
			fromUtf8: {
				cli: '8',
				type: doveadm_arg_types.BOOL
			},
			name: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		// TODO: Missing man page
	},

	'mailbox path': {
		args: {
			type: {
				cli: 't',
				type: doveadm_arg_types.STRING
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox rename': {
		args: {
			subscriptions: {
				cli: 's',
				type: doveadm_arg_types.BOOL
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			'new-name': {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox status': {
		args: {
			'total-sum': {
				cli: 't',
				type: doveadm_arg_types.BOOL
			},
			field: {
				cli: 'f',
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
			'mailbox-mask': {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox subscribe': {
		args: {
			mailbox: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox unsubscribe': {
		args: {
			mailbox: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	'mailbox update': {
		args: {
			'mailbox-guid': {
				cli: 'g',
				type: doveadm_arg_types.STRING
			},
			'uid-validity': {
				cli: 'V',
				type: doveadm_arg_types.INTEGER
			},
			'min-next-uid': {
				cli: 'N',
				type: doveadm_arg_types.INTEGER
			},
			'min-first-recent-uid': {
				cli: 'R',
				type: doveadm_arg_types.INTEGER
			},
			'min-highest-modseq': {
				cli: 'H',
				type: doveadm_arg_types.INTEGER
			},
			'min-highest-private-modseq': {
				cli: 'P',
				type: doveadm_arg_types.INTEGER
			},
			mailbox: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mailbox',
	},

	move: {
		args: {
			'destination-mailbox': {
				positional: true,
				type: doveadm_arg_types.STRING,
			},
			'source-user': {
				// TODO: key-value with 'user'
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
			},
			'user': {
				// TODO: key-value with 'source-user'
				positional: true,
				optional: true,
				type: doveadm_arg_types.STRING,
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
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			netmask: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		man: 'doveadm-penalty',
	},

	'process status': {
		args: {
			service: {
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		man: 'doveadm-process-status',
	},

	'proxy kick': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'passdb-field': {
				cli: 'f',
				type: doveadm_arg_types.STRING,
				text: `Passdb field.`
			},
			'dest-host': {
				cli: 'h',
				type: doveadm_arg_types.STRING,
				text: `Destination host.`
			},
			mask: {
				//example: `testuser001`,
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
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'separate-connections': {
				cli: '1',
				type: doveadm_arg_types.BOOL,
			},
			'passdb-field': {
				cli: 'f',
				type: doveadm_arg_types.STRING,
				text: `Passdb field.`
			},
			mask: {
				//example: `testuser001`,
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

3.0 returns different formats based on value of \`separate-connections\`.
If \`separate-connections\` is true, \`pid\`, \`ip\`, \`dest_ip\`, and list of
\`alt_username_fields\` (from anvil) is returned.`,
		},
		man: 'doveadm-proxy',
		text: `Show who is logged into the Dovecot server.`,
	},

	purge: {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-purge',
	},

	pw: {
		args: {
			list: {
				cli: 'l',
				type: doveadm_arg_types.BOOL
			},
			plaintext: {
				cli: 'p',
				type: doveadm_arg_types.STRING
			},
			rounds: {
				cli: 'r',
				type: doveadm_arg_types.INTEGER
			},
			scheme: {
				cli: 's',
				type: doveadm_arg_types.STRING
			},
			'test-hash': {
				cli: 't',
				type: doveadm_arg_types.STRING
			},
			user: {
				cli: 'u',
				type: doveadm_arg_types.STRING
			},
			'reverse-verify': {
				cli: 'V',
				type: doveadm_arg_types.BOOL
			},
		},
		man: 'doveadm-pw',
	},

	'quota get': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'quota',
		man: 'doveadm-quota',
	},

	'quota recalc': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'quota',
		man: 'doveadm-quota',
	},

	'rebuild attachments': {
		args: {
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-rebuild',
	},

	reload: {
		args: {},
		man: 'doveadm-reload',
	},

	save: {
		args: {
			mailbox: {
				cli: 'm',
				type: doveadm_arg_types.STRING
			},
			uid: {
				cli: 'U',
				type: doveadm_arg_types.INTEGER
			},
			guid: {
				cli: 'g',
				type: doveadm_arg_types.STRING
			},
			'received-date': {
				cli: 'r',
				type: doveadm_arg_types.STRING
			},
			file: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		added: {
			'doveadm_save_args_added': `
\`received-date\`, \`uid\`, and \`gid\` arguments added.`
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-save',
	},

	search: {
		args: {
			query: doveadm_args_query,
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-search',
	},

	'service status': {
		args: {
			service: {
				positional: true,
				optional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		man: 'doveadm-service-status',
	},

	'service stop': {
		args: {
			service: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		// TODO: Needs man page
	},

	'sieve activate': {
		args: {
			scriptname: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve'
	},

	'sieve deactivate': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve'
	},

	'sieve delete': {
		args: {
			'ignore-active': {
				cli: 'a',
				type: doveadm_arg_types.BOOL
			},
			scriptname: {
				positional: true,
				type: doveadm_arg_types.ARRAY
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve'
	},

	'sieve get': {
		args: {
			scriptname: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve'
	},

	'sieve list': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve'
	},

	'sieve put': {
		args: {
			activate: {
				cli: 'a',
				type: doveadm_arg_types.BOOL
			},
			scriptname: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			file: {
				positional: true,
				type: doveadm_arg_types.ISTREAM
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve'
	},

	'sieve rename': {
		args: {
			oldname: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
			newname: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve'
	},

	/* Deprecated. TODO: No man page, but that might be ok? */
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
				positional: true,
				type: doveadm_arg_types.STRING
			},
			filter: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		man: 'doveadm-stats'
	},

	'stats dump': {
		args: {
			socketPath: {
				cli: 's',
				cli_only: true,
				type: doveadm_arg_types.STRING
			},
			reset: {
				cli: 'r',
				type: doveadm_arg_types.BOOL
			},
			fields: {
				cli: 'f',
				type: doveadm_arg_types.STRING
			},
		},
		man: 'doveadm-stats'
	},

	'stats remove': {
		args: {
			name: {
				positional: true,
				type: doveadm_arg_types.STRING
			},
		},
		man: 'doveadm-stats'
	},

	'stats reopen': {
		args: {},
		man: 'doveadm-stats'
	},

	'stop': {
		args: {},
		// TODO: man page needed
	},

	sync: {
		args: {
			'full-sync': {
				cli: 'f',
				type: doveadm_arg_types.BOOL,
			},
			'purge-remote': {
				cli: 'P',
				type: doveadm_arg_types.BOOL,
			},
			'reverse-sync': {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
			},
			'lock-timeout': {
				cli: 'l',
				type: doveadm_arg_types.INTEGER,
			},
			rawlog: {
				cli: 'r',
				type: doveadm_arg_types.STRING,
			},
			mailbox: {
				cli: 'm',
				type: doveadm_arg_types.STRING,
			},
			'mailbox-guid': {
				cli: 'g',
				type: doveadm_arg_types.STRING,
			},
			namespace: {
				cli: 'n',
				type: doveadm_arg_types.ARRAY,
			},
			'all-namespaces': {
				cli: 'N',
				type: doveadm_arg_types.BOOL,
			},
			'exclude-mailbox': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY,
			},
			'all-mailbox': {
				cli: 'a',
				type: doveadm_arg_types.STRING,
			},
			state: {
				cli: 's',
				type: doveadm_arg_types.STRING,
			},
			'sync-since-time': {
				cli: 't',
				type: doveadm_arg_types.STRING,
			},
			'sync-until-time': {
				cli: 'e',
				type: doveadm_arg_types.STRING,
			},
			'sync-flags': {
				cli: 'O',
				type: doveadm_arg_types.STRING,
			},
			'sync-max-size': {
				cli: 'I',
				type: doveadm_arg_types.STRING,
			},
			timeout: {
				cli: 'T',
				type: doveadm_arg_types.INTEGER,
			},
			'default-destination': {
				cli: 'd',
				type: doveadm_arg_types.BOOL,
			},
			'legacy-dsync': {
				cli: 'E',
				type: doveadm_arg_types.BOOL,
			},
			'oneway-sync': {
				cli: '1',
				type: doveadm_arg_types.BOOL,
			},
			destination: {
				positional: true,
				type: doveadm_arg_types.ARRAY,
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-sync'
	},

	user: {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				type: doveadm_arg_types.STRING,
				text: `userdb socket path`
			},
			'auth-info': {
				cli: 'x',
				type: doveadm_arg_types.ARRAY
			},
			field: {
				cli: 'f',
				type: doveadm_arg_types.STRING
			},
			'expand-field': {
				cli: 'e',
				type: doveadm_arg_types.STRING
			},
			'userdb-only': {
				cli: 'u',
				type: doveadm_arg_types.BOOL
			},
			'user-mask': doveadm_args_usermask,
		},
		man: 'doveadm-user',
	},

	who: {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: true,
				type: doveadm_arg_types.STRING,
				text: `Anvil socket path.`
			},
			'separate-connections': {
				cli: '1',
				type: doveadm_arg_types.BOOL,
			},
			'passdb-field': {
				cli: 'f',
				type: doveadm_arg_types.STRING,
				text: `Passdb field.`
			},
			mask: {
				//example: `testuser001`,
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `UID mask.`,
			},
		},
		man: 'doveadm-who',
		text: `Show who is logged into the Dovecot server.`,
	},

}
