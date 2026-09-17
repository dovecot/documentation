/* List of Dovecot doveadm types. */
import { doveadm_arg_types,
		 doveadm_args_human_timestamp,
		 doveadm_args_query,
		 doveadm_args_usermask,
		 doveadm_flag_types,
		 doveadm_response_types } from '../lib/doveadm.js'

export const doveadm = {

	// Response data (per command):
	// For commands that produce no output, response should be 'null'
	// response: {
	//     // Optional note rendered below response table or when no JSON
	//     // fields. Rendered w/Markdown.
	//     note: ``,
	//
	//     // Structured response fields.
	//     fields: {
	//         fieldName: {
	//             type: doveadm_response_types.STRING,
	//             description: ``,
	//             dynamic: true, // optional
	//         }
	//     },
	//
	//     // Example JSON data returned from the server.
	//     example: {},
	// },

	// Doveadm command name (each command is a separate object)
	altmove: {
		// If true, this command only works for CLI, not HTTP.
		cli_only_cmd: false,

		// Command specific arguments.
		args: {
			// The argument (name is the doveadm CLI representation)
			// This is the argument used for '--xyz' command line and the
			// camelCased argument used in HTTP API
			reverse: {
				// The short command line argument (no dash needed)
				cli: 'r',

				// If true, only show argument for CLI, not HTTP.
				// cli_only: true,

				// If set, will use as command example argument.
				// i.e., for HTTP API requests, this argument will be added
				// to the example argument string.
				// example: "foo",

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

		response: null,

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
		response: null,
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
		response: null,
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				id: {
					type: doveadm_response_types.STRING,
					description: `ACL entry ID (user name or shared mailbox name).`
				},
				global: {
					type: doveadm_response_types.STRING,
					description: `ID of the user owning the ACL entry when it is a global ACL.`
				},
				rights: {
					type: doveadm_response_types.STRING,
					description: `Comma-separated list of ACL rights.`
				},
			},
		},
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Show ACLs.`
	},

	'acl recalc': {
		args: {},
		response: null,
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
		response: null,
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				rights: {
					type: doveadm_response_types.STRING,
					description: `Comma-separated list of ACL rights for the user.`
				},
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
		response: null,
		flags: doveadm_flag_types.USER,
		man: 'doveadm-acl',
		plugin: 'acl',
		text: `Replaces ACL rights.`,
	},

	'auth cache flush': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: false,
				example: `/run/dovecot/doveadm-server`,
				type: doveadm_arg_types.STRING,
				text: `Path to doveadm socket.`,
			},
			"user-mask": {
				example: 'username_?',
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `user-mask of users to apply operation to.`,
			},
		},
		response: {
			fields: {
				entries: {
					type: doveadm_response_types.STRING,
					description: `Number of cache entries flushed.`,
				},
			},
			note: `Direct stdout output indicates the number of cache entries flushed when executed via CLI.`,
			example: {
				entries: 1
			},
		},
		man: 'doveadm-auth',
		text: `Flush authentication cache.`,
	},

	'auth cache status': {
		args: {
			'socket-path': {
				cli: 'a',
				cli_only: false,
				type: doveadm_arg_types.STRING,
				text: `Path to doveadm socket.`,
			},
			reset: {
				type: doveadm_arg_types.BOOL,
				text: `Reset hit/miss/insert counters after reading them.`,
			},
		},
		response: {
			fields: {
				hits: {
					type: doveadm_response_types.STRING,
					description: `Number of cache hits since last reset.`,
				},
				misses: {
					type: doveadm_response_types.STRING,
					description: `Number of cache misses since last reset.`,
				},
				hit_ratio_percent: {
					type: doveadm_response_types.STRING,
					description: `Cache hit ratio in percent.`,
				},
				pos_entries: {
					type: doveadm_response_types.STRING,
					description: `Number of positive cache entries.`,
				},
				neg_entries: {
					type: doveadm_response_types.STRING,
					description: `Number of negative cache entries.`,
				},
				pos_size: {
					type: doveadm_response_types.STRING,
					description: `Bytes used by positive cache entries.`,
				},
				neg_size: {
					type: doveadm_response_types.STRING,
					description: `Bytes used by negative cache entries.`,
				},
				used_size: {
					type: doveadm_response_types.STRING,
					description: `Total bytes used by the cache.`,
				},
				max_size: {
					type: doveadm_response_types.STRING,
					description: `Maximum cache size in bytes.`,
				},
			},
			example: {
				hits: 1234,
				misses: 56,
				hit_ratio_percent: 95,
				pos_entries: 100,
				neg_entries: 2,
				pos_size: 8192,
				neg_size: 64,
				used_size: 8256,
				max_size: 1048576,
			},
		},
		man: 'doveadm-auth',
		text: `Show authentication cache statistics.`,
		added: {
			'doveadm_auth_cache_status_added': false
		},
	},

	'auth login': {
		cli_only_cmd: true,
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
		response: {
			note: `Direct stdout output containing passdb authentication result and extra fields.`,
		},
		man: 'doveadm-auth',
		text: `Test full login.`,
	},

	'auth lookup': {
		cli_only_cmd: true,
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
		response: {
			note: `Direct stdout output containing passdb fields for queried user(s).`,
		},
		man: 'doveadm-auth',
		text: `Perform a passdb lookup.`,
	},

	'auth test': {
		cli_only_cmd: true,
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
		response: {
			note: `Direct stdout output indicating authentication success or failure and extra fields.`,
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

${doveadm_args_human_timestamp}`,
			},
			'sync-until-time': {
				cli: 'e',
				example: '1 day',
				type: doveadm_arg_types.STRING,
				text: `Sync until timestamp.

${doveadm_args_human_timestamp}`,
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				state: {
					type: doveadm_response_types.STRING,
					description: `dsync state string after synchronization.`,
					dynamic: true
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-sync',
		text: `Dovecot's mailbox synchronization utility.

This command cannot be used safely via API by untrusted users.`
	},

	'compress connect': {
		cli_only_cmd: true,
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
		response: {
			note: `Interactive connection to a compression-enabled IMAP service. The raw IMAP dialog (greeting, capability advertisement, and compression negotiation) is streamed to stdout.`,
		},
		man: 'doveadm-compress-connect',
		text: `Connects to a compression-enabled IMAP service.`
	},

	config: {
		cli_only_cmd: true,
		args: {
			a: {
				cli: 'a',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Show all settings.`,
			},
			C: {
				cli: 'C',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `TODO (check full config).`,
			},
			c: {
				cli: 'c',
				example: '/etc/dovecot/dovecot.conf',
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `Read configuration from this file.`,
			},
			d: {
				cli: 'd',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Show setting's default value.`,
			},
			F: {
				cli: 'F',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Show the configuration in a filter-based format.`,
			},
			f: {
				cli: 'f',
				example: 'protocol=imap',
				optional: true,
				type: doveadm_arg_types.STRING,
				text: `Apply filters to limit output.`,
			},
			h: {
				cli: 'h',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Hide the setting's name.`,
			},
			I: {
				cli: 'I',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `TODO (dump config import).`,
			},
			N: {
				cli: 'N',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Show settings with non-default values and explicitly set default values.`,
			},
			n: {
				cli: 'n',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Show only settings with non-default values.`,
			},
			P: {
				cli: 'P',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Show passwords and other sensitive values.`,
			},
			s: {
				cli: 's',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Show hidden settings.`,
			},
			U: {
				cli: 'U',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Ignore unknown settings.`,
			},
			w: {
				cli: 'w',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `TODO (hide obsolete warnings).`,
			},
			x: {
				cli: 'x',
				optional: true,
				type: doveadm_arg_types.BOOL,
				text: `Expand variables and show file contents.`,
			},
			'section_name': {
				example: 'namespace',
				optional: true,
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Show only the configuration of these section names.`,
			},
			'setting_name': {
				example: 'mailbox',
				optional: true,
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Show only the configuration of these setting names.`,
			}
		},
		man: 'doveconf',
		response: null,
		text: `Read and parse Dovecot's configuration files.`
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
		response: null,
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
		response: null,
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
		response: {
			fields: {
				value: {
					type: doveadm_response_types.STRING,
					description: `Value associated with the requested dictionary key.`,
				},
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				key: {
					type: doveadm_response_types.STRING,
					description: `Dictionary key.`
				},
				value: {
					type: doveadm_response_types.STRING,
					description: `Value associated with the key.`,
					dynamic: true
				},
			},
			note: `If \`--no-value\` is set, the \`value\` field is omitted.`,
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
		response: null,
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
		response: null,
		man: 'doveadm-dict',
		text: `Unset key value in configured dictionary.`,
	},

	dump: {
		cli_only_cmd: true,
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
		response: {
			note: `Direct stdout output dumping mailbox index or log file structures.`,
		},
		man: 'doveadm-dump',
		text: `Show contents of mailbox index/log files, in human readable format.`
	},

	exec: {
		cli_only_cmd: true,
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
		response: null,
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
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-expunge',
		text: `
Expunge messages matching given search query.

::: warning
The expunge command REQUIRES a mailbox parameter in the query argument.

The expunge command REQUIRES a message range limiter in the query argument.
If all messages are desired to be expunged, the "all" query can be used.
:::`
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
		response: {
			note: `The response fields are defined by the \`field\` argument. One entry per matched message, with one field per requested item, e.g. \`user\`, \`mailbox\`, \`mailbox-guid\`, \`seq\`, \`uid\`, \`guid\`, \`flags\`, \`modseq\`, \`hdr\`, \`hdr.<name>\`, \`body\`, \`body.<section>\`, \`binary.<section>\`, \`body.preview\`, \`body.snippet\`, \`text\`, \`text.utf8\`, \`size.physical\`, \`size.virtual\`, \`date.received\`, \`date.sent\`, \`date.saved\`, \`imap.envelope\`, \`imap.body\`, \`imap.bodystructure\`, \`mime.parts\`, \`pop3.uidl\`, \`pop3.order\`, \`refcount\`, \`storageid\`, and their \`.unixtime\` variants.`,
		},
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
		response: null,
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
		response: null,
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
		response: null,
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
		response: null,
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
		response: null,
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
		response: null,
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
		response: {
			fields: {
				content: {
					type: doveadm_response_types.STRING,
					description: `Raw contents of the file or object from storage.`,
				},
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
		response: {
			type: 'list',
			fields: {
				path: {
					type: doveadm_response_types.STRING,
					description: `Path of the object in storage.`,
				},
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
		response: {
			type: 'list',
			fields: {
				path: {
					type: doveadm_response_types.STRING,
					description: `Directory path in storage.`,
				},
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
		response: {
			type: 'list',
			fields: {
				key: {
					type: doveadm_response_types.STRING,
					description: `Metadata attribute key name.`,
				},
				value: {
					type: doveadm_response_types.STRING,
					description: `Metadata attribute value.`,
				},
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
		response: null,
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
		response: {
			fields: {
				path: {
					type: doveadm_response_types.STRING,
					description: `Path of the queried object.`,
				},
				size: {
					type: doveadm_response_types.INTEGER,
					description: `Total size of the object in bytes.`,
				},
			},
		},
		man: 'doveadm-fs',
		text: `Retrieve files status for the path provided. Currently, only the total size (in bytes) of the item is returned.`,
	},

	'fts expand': {
		args: {
			query: doveadm_args_query,
		},
		response: {
			note: `Prints the expanded search query as a single line (unstructured output).`
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Expand query using FTS.`,
	},

	'fts lookup': {
		args: {
			query: doveadm_args_query,
		},
		response: {
			note: `Prints one line per mailbox with the matching UID sequence ranges (unstructured output).`
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
		response: null,
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				token: {
					type: doveadm_response_types.STRING,
					description: `Tokenized word.`
				},
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts',
		text: `Tokenize a string using FTS.`,
	},

	/* flatcurve FTS commands */

	'fts flatcurve check': {
		args: {
			'mailbox-mask': {
				example: [ 'INBOX' ],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `A list of mailbox masks to check.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts-flatcurve',
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		text: `
Run a simple check on Dovecot Xapian databases, and attempt to fix basic
errors (it is the same checking done by the xapian-check command with the
\`-F\` command-line option).`,
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `The human-readable mailbox name. (key is hidden)`
				},
				guid: {
					type: doveadm_response_types.STRING,
					description: `The GUID of the mailbox.`
				},
				errors: {
					type: doveadm_response_types.STRING,
					description: `The number of errors reported by the Xapian library.`
				},
				shards: {
					type: doveadm_response_types.STRING,
					description: `The number of index shards processed.`
				},
			},
			note: `Mailboxes without an existing flatcurve FTS index produce no output.`,
			example: [
				{
					mailbox: "INBOX",
					guid: "guid_string",
					errors: 0,
					shards: 1
				}
			],
		},
	},

	'fts flatcurve remove': {
		args: {
			'mailbox-mask': {
				example: [ 'INBOX' ],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `A list of mailbox masks to remove.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts-flatcurve',
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		text: `Removes all FTS data for a mailbox.`,
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `The human-readable mailbox name. (key is hidden)`
				},
				guid: {
					type: doveadm_response_types.STRING,
					description: `The GUID of the mailbox.`
				},
			},
			note: `Mailboxes without flatcurve FTS data produce no output.`,
			example: [
				{
					mailbox: "INBOX",
					guid: "guid_string"
				}
			],
		},
	},

	'fts flatcurve rotate': {
		args: {
			'mailbox-mask': {
				example: [ 'INBOX' ],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `A list of mailbox masks to rotate.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts-flatcurve',
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		text: `Triggers an FTS index rotation for a mailbox.`,
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `The human-readable mailbox name. (key is hidden)`
				},
				guid: {
					type: doveadm_response_types.STRING,
					description: `The GUID of the mailbox.`
				},
			},
			note: `Mailboxes without an existing flatcurve FTS index produce no output.`,
			example: [
				{
					mailbox: "INBOX",
					guid: "guid_string"
				}
			],
		},
	},

	'fts flatcurve stats': {
		args: {
			'mailbox-mask': {
				example: [ 'INBOX' ],
				positional: true,
				type: doveadm_arg_types.ARRAY,
				text: `A list of mailbox masks to process.`,
			},
		},
		man: 'doveadm-fts',
		plugin: 'fts-flatcurve',
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		text: `Returns FTS data for a mailbox.`,
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `The human-readable mailbox name. (key is hidden)`
				},
				guid: {
					type: doveadm_response_types.STRING,
					description: `The GUID of the mailbox.`
				},
				last_uid: {
					type: doveadm_response_types.STRING,
					description: `The last UID indexed in the mailbox.`
				},
				messages: {
					type: doveadm_response_types.STRING,
					description: `The number of messages indexed in the mailbox.`
				},
				shards: {
					type: doveadm_response_types.STRING,
					description: `The number of index shards.`
				},
				version: {
					type: doveadm_response_types.STRING,
					description: `The (Dovecot internal) version of the FTS data.`
				},
			},
			note: `Mailboxes without an existing flatcurve FTS index produce no output.`,
			example: [
				{
					mailbox: "INBOX",
					guid: "guid_string",
					last_uid: 123,
					messages: 2,
					shards: 1,
					version: 1
				}
			],
		},
	},

	help: {
		cli_only_cmd: true,
		args: {
			command: {
				example: 'mailbox',
				optional: true,
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The command/group to show the man page of.`,
			},
		},
		response: {
			note: `Prints doveadm usage and available commands directly to stdout.`,
		},
		text: `Provide doveadm usage information.`,
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
		response: null,
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
		response: null,
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
		response: null,
		man: 'doveadm-indexer',
		text: `Add indexing request for the given user and the mailbox to the indexer queue.`,
	},

	'indexer list': {
		args: {
			'user-mask': { ...doveadm_args_usermask, ...{ optional: true } }
		},
		response: {
			type: 'list',
			fields: {
				username: {
					type: doveadm_response_types.STRING,
					description: `Username whose mailbox is queued for indexing.`,
				},
				mailbox: {
					type: doveadm_response_types.STRING,
					description: `Mailbox queued for indexing.`,
				},
				session_id: {
					type: doveadm_response_types.STRING,
					description: `Session identifier associated with the index request.`,
				},
				max_recent: {
					type: doveadm_response_types.STRING,
					description: `Maximum number of recent messages to index before completing the request.`,
				},
				type: {
					type: doveadm_response_types.STRING,
					description: `Index request type (e.g., optimize or index).`,
				},
				status: {
					type: doveadm_response_types.STRING,
					description: `Current execution status of the indexing request.`,
				},
			},
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				path: {
					type: doveadm_response_types.STRING,
					description: `Base directory path of the Dovecot instance.`,
				},
				name: {
					type: doveadm_response_types.STRING,
					description: `Configured instance name.`,
				},
				'last used': {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp indicating when the instance was last accessed.`,
				},
				running: {
					type: doveadm_response_types.STRING,
					description: `Indicates whether the instance master process is currently running (yes or no).`,
				},
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
		response: null,
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
		response: {
			fields: {
				count: {
					type: doveadm_response_types.STRING,
					description: `Number of user sessions successfully disconnected.`,
				},
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
		response: {
			type: 'list',
			fields: {
				timestamp: {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp when the log line was written.`
				},
				prefix: {
					type: doveadm_response_types.STRING,
					description: `Prefix (usually the process name) of the log line.`
				},
				type: {
					type: doveadm_response_types.STRING,
					description: `Log type (e.g. error, warn, info).`
				},
				text: {
					type: doveadm_response_types.STRING,
					description: `Log message text.`
				},
			},
			note: `The CLI renders these fields as a formatted line (\`%{timestamp} %{type}: %{prefix}%{text}\`) rather than a table.`,
		},
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
		response: {
			note: `Direct stdout output listing paths to detected syslog and Dovecot log files.`,
		},
		man: 'doveadm-log',
		text: `Show the location of logs.`,
	},

	'log reopen': {
		args: {},
		response: null,
		man: 'doveadm-log',
		text: `Cause master process to reopen all log files.`,
	},

	'log test': {
		args: {},
		response: null,
		man: 'doveadm-log',
		text: `Write a test message to the log files.`,
	},

	'mail dict get': {
		args: {
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key to fetch.`
			},
		},
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				value: {
					type: doveadm_response_types.STRING,
					description: `The value of the key.`
				}
			}
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-dict',
		text: `Fetch a key from a dictionary in user context.`,
	},

	'mail dict inc': {
		args: {
			timestamp: {
				cli: 't',
				type: doveadm_arg_types.INTEGER,
				text: `Set the timestamp also.`
			},
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key to increment.`
			},
			diff: {
				positional: true,
				type: doveadm_arg_types.INTEGER,
				text: `The amount of the increment.`
			},
		},
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-dict',
		text: `Increment the value of a numeric key in a dictionary in user context.`,
	},

	'mail dict iter': {
		args: {
			exact: {
				cli: '1',
				type: doveadm_arg_types.BOOL,
				text: `Exact match.`
			},
			recurse: {
				cli: 'R',
				type: doveadm_arg_types.BOOL,
				text: `Recurse.`
			},
			'no-value': {
				cli: 'V',
				type: doveadm_arg_types.BOOL,
				text: `Don't print values, just key names.`
			},
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			prefix: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key prefix to look for.`
			},
		},
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				key: {
					type: doveadm_response_types.STRING,
					description: `Matching key.`
				},
				value: {
					type: doveadm_response_types.STRING,
					description: `Key value. Hidden with --no-value.`,
					dynamic: true
				}
			}
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-dict',
		text: `Find the keys matching a prefix in a dictionary in user context.`,
	},

	'mail dict set': {
		args: {
			timestamp: {
				cli: 't',
				type: doveadm_arg_types.INTEGER,
				text: `Set the timestamp also.`
			},
			'expire-secs': {
				cli: 'e',
				type: doveadm_arg_types.INTEGER,
				text: `Set the key duration also.`
			},
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key to set.`
			},
			value: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The value to set.`
			},
		},
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-dict',
		text: `Set/create a key in a dictionary in user context.`,
	},

	'mail dict unset': {
		args: {
			timestamp: {
				cli: 't',
				type: doveadm_arg_types.INTEGER,
				text: `Set the timestamp also.`
			},
			'filter-name': {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `Configuration filter name to use.`
			},
			key: {
				positional: true,
				type: doveadm_arg_types.STRING,
				text: `The key to unset.`
			},
		},
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-dict',
		text: `Remove a key from a dictionary in user context.`,
	},

	'mail fs copy': {
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
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
		text: `Copy object in storage.`,
	},

	'mail fs delete': {
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
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
		text: `Delete object from storage.`,
	},

	'mail fs get': {
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				content: {
					type: doveadm_response_types.STRING,
					description: `Raw contents of the file or object from mail storage.`,
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
		text: `Get object from storage.`,
	},

	'mail fs iter': {
		args: {
			'no-cache': {
				cli: 'C',
				type: doveadm_arg_types.BOOL
			},
			'object-ids': {
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				path: {
					type: doveadm_response_types.STRING,
					description: `Path of the object in mail storage.`,
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
		text: `List objects in fs path.`,
	},

	'mail fs iter-dirs': {
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				path: {
					type: doveadm_response_types.STRING,
					description: `Directory path in mail storage.`,
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
		text: `List folders in fs path.`,
	},

	'mail fs metadata': {
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				key: {
					type: doveadm_response_types.STRING,
					description: `Metadata attribute key name.`,
				},
				value: {
					type: doveadm_response_types.STRING,
					description: `Metadata attribute value.`,
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
	},

	'mail fs put': {
		args: {
			hash: {
				cli: 'h',
				type: doveadm_arg_types.STRING
			},
			metadata: {
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
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
		text: `Store object in storage.`,
	},

	'mail fs stat': {
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				path: {
					type: doveadm_response_types.STRING,
					description: `Path of the queried object in mail storage.`,
				},
				size: {
					type: doveadm_response_types.INTEGER,
					description: `Total size of the object in bytes.`,
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-mail-fs',
		text: `Retrieve files status for the path provided. Currently, only the total size (in bytes) of the item is returned.`,
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `Mailbox name for which the cache decision applies.`,
				},
				field: {
					type: doveadm_response_types.STRING,
					description: `Cached message header or body field name.`,
				},
				decision: {
					type: doveadm_response_types.STRING,
					description: `Caching decision rule (e.g., yes, no, or temp).`,
				},
				'last-used': {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp indicating when the cached field was last accessed.`,
				},
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
		response: null,
		text: `Purge the dovecot.index.cache file.`,
	},

	'mailbox cache remove': {
		args: {
			query: doveadm_args_query,
		},
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `Mailbox name from which cached messages were removed.`,
				},
				uid: {
					type: doveadm_response_types.STRING,
					description: `Unique identifier (UID) of the message whose cache was removed.`,
				},
				result: {
					type: doveadm_response_types.STRING,
					description: `Status or result of removing the message from cache.`,
				},
			},
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
		response: null,
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				success: {
					type: doveadm_response_types.STRING,
					description: `Whether the keypair was generated.`
				},
				box: {
					type: doveadm_response_types.STRING,
					description: `Mailbox the key belongs to.`
				},
				pubid: {
					type: doveadm_response_types.STRING,
					description: `Public key ID (hex encoded).`
				},
			},
		},
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				box: {
					type: doveadm_response_types.STRING,
					description: `Mailbox the key belongs to.`
				},
				active: {
					type: doveadm_response_types.STRING,
					description: `Whether the key is currently active.`
				},
				pubid: {
					type: doveadm_response_types.STRING,
					description: `Public ID of the key.`
				}
			}
		},
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				box: {
					type: doveadm_response_types.STRING,
					description: `Mailbox the key belongs to.`
				},
				name: {
					type: doveadm_response_types.STRING,
					description: `Public ID of the key.`
				},
				error: {
					type: doveadm_response_types.STRING,
					description: `Error message, if the export failed for this key.`,
					dynamic: true
				},
				key: {
					type: doveadm_response_types.STRING,
					description: `Exported private key data.`
				}
			}
		},
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				result: {
					type: doveadm_response_types.STRING,
					description: `Result of the password operation, or an error message.`
				}
			}
		},
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
		response: null,
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				value: {
					type: doveadm_response_types.STRING,
					description: `Value of the requested mailbox metadata entry.`,
				},
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				key: {
					type: doveadm_response_types.STRING,
					description: `Key name of the mailbox metadata entry.`,
				},
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
		response: null,
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `Name of the mailbox.`,
				},
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
		response: {
			note: `Prints converted mailbox names directly to stdout.`,
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				path: {
					type: doveadm_response_types.STRING,
					description: `Filesystem directory path of the mailbox storage or index files.`,
				},
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				mailbox: {
					type: doveadm_response_types.STRING,
					description: `Mailbox name.`
				},
				messages: {
					type: doveadm_response_types.STRING,
					description: `Number of messages.`,
					dynamic: true
				},
				recent: {
					type: doveadm_response_types.STRING,
					description: `Number of recent messages.`,
					dynamic: true
				},
				deleted: {
					type: doveadm_response_types.STRING,
					description: `Number of deleted messages.`,
					dynamic: true
				},
				uidnext: {
					type: doveadm_response_types.STRING,
					description: `Next UID value.`,
					dynamic: true
				},
				uidvalidity: {
					type: doveadm_response_types.STRING,
					description: `UID validity.`,
					dynamic: true
				},
				unseen: {
					type: doveadm_response_types.STRING,
					description: `First unseen message sequence number.`,
					dynamic: true
				},
				highestmodseq: {
					type: doveadm_response_types.STRING,
					description: `Highest MODSEQ.`,
					dynamic: true
				},
				vsize: {
					type: doveadm_response_types.STRING,
					description: `Virtual size of mailbox.`,
					dynamic: true
				},
				guid: {
					type: doveadm_response_types.STRING,
					description: `Mailbox GUID.`,
					dynamic: true
				},
				firstsaved: {
					type: doveadm_response_types.STRING,
					description: `Saved time of first mail.`,
					dynamic: true
				}
			},
			note: `Fields shown depend on the positional \`field\` argument; the \`mailbox\` field is omitted when \`total-sum\` is set.`
		},
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
		response: null,
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
		response: null,
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
		response: null,
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
		response: null,
		text: `
Move messages to new mailbox.

::: warning
The move command REQUIRES a mailbox parameter in the query argument.

The move command REQUIRES a message range limiter in the query argument.
If all messages are desired to be moved, the "all" query can be used.
:::`
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
		response: {
			type: 'list',
			fields: {
				IP: {
					type: doveadm_response_types.STRING,
					description: `Remote IP address subject to penalty tracking.`,
				},
				penalty: {
					type: doveadm_response_types.STRING,
					description: `Current penalty score or penalty duration applied to the IP.`,
				},
				last_penalty: {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp of the most recently incurred penalty.`,
				},
				last_update: {
					type: doveadm_response_types.STRING,
					description: `Elapsed time since the penalty entry was last updated.`,
				},
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
		response: {
			type: 'list',
			fields: {
				name: {
					type: doveadm_response_types.STRING,
					description: `Service name of the worker process.`,
				},
				pid: {
					type: doveadm_response_types.STRING,
					description: `Process ID of the worker process.`,
				},
				available_count: {
					type: doveadm_response_types.STRING,
					description: `Number of available client connections this process can accept.`,
				},
				total_count: {
					type: doveadm_response_types.STRING,
					description: `Total number of client connections currently handled by this process.`,
				},
				idle_start: {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp indicating when this process entered an idle state.`,
				},
				last_status_update: {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp of the most recent status report from this process.`,
				},
				last_kill_sent: {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp when a termination signal was last sent to this process.`,
				},
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
		response: {
			fields: {
				count: {
					type: doveadm_response_types.STRING,
					description: `Number of proxy connections kicked.`,
				},
			},
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
		response: {
			type: 'list',
			fields: {
				username: {
					type: doveadm_response_types.STRING,
					description: `Proxied user account name.`,
				},
				connections: {
					type: doveadm_response_types.STRING,
					description: `Number of active connections for this proxy user.`,
					dynamic: true
				},
				service: {
					type: doveadm_response_types.STRING,
					description: `Protocol or service name handled by the proxy.`,
				},
				pids: {
					type: doveadm_response_types.STRING,
					description: `Process IDs of the proxy login or connection processes.`,
					dynamic: true
				},
				ips: {
					type: doveadm_response_types.STRING,
					description: `Client IP addresses connected to the proxy.`,
					dynamic: true
				},
				dest_ip: {
					type: doveadm_response_types.STRING,
					description: `Backend destination IP address the connection is routed to.`,
					dynamic: true
				},
			},
			note: `Without \`separate-connections\`, each object is one username/service combination with \`connections\`, \`pids\`, and \`ips\` aggregated. With \`separate-connections\`, each object is one connection with \`pid\`, \`ip\`, and \`dest_ip\` instead, plus one column per configured \`passdb-field\`.`,
		},
		man: 'doveadm-proxy',
		text: `Show who is logged into the Dovecot server.`,
	},

	purge: {
		args: {},
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-purge',
		text: `Remove all messages with refcount=0 from a user's mail storage.`,
	},

	pw: {
		cli_only_cmd: true,
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
		response: {
			note: `Direct stdout output displaying formatted password hash or list of schemes.`,
		},
		man: 'doveadm-pw',
		text: `Generate password hashes.`,
	},

	'quota get': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'quota',
		man: 'doveadm-quota',
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				root: {
					type: doveadm_response_types.STRING,
					description: `Quota root name.`
				},
				type: {
					type: doveadm_response_types.STRING,
					description: `Quota resource type (e.g. bytes, messages).`
				},
				value: {
					type: doveadm_response_types.STRING,
					description: `Current quota usage.`
				},
				limit: {
					type: doveadm_response_types.STRING,
					description: `Quota limit.`
				},
				percent: {
					type: doveadm_response_types.STRING,
					description: `Quota usage in percent of the limit.`
				},
			},
		},
		text: `Display current quota usage.`,
	},

	'quota recalc': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'quota',
		man: 'doveadm-quota',
		response: null,
		text: `Recalculate current quota usage.`,
	},

	'rebuild attachments': {
		args: {
			query: doveadm_args_query,
		},
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				uid: {
					type: doveadm_response_types.STRING,
					description: `Message UID for which attachment detection was rebuilt.`,
				},
				attachment: {
					type: doveadm_response_types.STRING,
					description: `Attachment filename, hash, or status rebuilt in the index.`,
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-rebuild',
		text: `Rebuild attachment detection information in index.`,
	},

	reload: {
		args: {
			'kick-timeout': {
				example: '4h',
				type: doveadm_arg_types.STRING,
				text: `
Override [[setting,service_shutdown_clients_timeout]] for this reload: how long the
processes of the old configuration may keep serving their existing clients.
\`0\` disconnects them immediately, \`infinite\` keeps them until the
clients disconnect.`,
			},
		},
		response: null,
		added: {
			'service_shutdown_clients_changed': `
\`kick-timeout\` argument added.`
		},
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
		response: null,
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-save',
		text: `Save messages to a mailbox.`,
	},

	search: {
		args: {
			query: doveadm_args_query,
		},
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				'mailbox-guid': {
					type: doveadm_response_types.STRING,
					description: `GUID of the mailbox containing the matching message.`,
				},
				uid: {
					type: doveadm_response_types.STRING,
					description: `Unique identifier (UID) of the matching message.`,
				},
			},
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
		response: {
			type: 'list',
			fields: {
				name: {
					type: doveadm_response_types.STRING,
					description: `Service name configured in Dovecot.`,
				},
				process_count: {
					type: doveadm_response_types.STRING,
					description: `Current number of running processes for this service.`,
				},
				process_avail: {
					type: doveadm_response_types.STRING,
					description: `Number of processes currently available to accept new requests.`,
				},
				process_limit: {
					type: doveadm_response_types.STRING,
					description: `Configured maximum process limit for this service.`,
				},
				client_limit: {
					type: doveadm_response_types.STRING,
					description: `Maximum number of concurrent clients allowed per process.`,
				},
				throttle_secs: {
					type: doveadm_response_types.STRING,
					description: `Service throttling delay in seconds if processes crash frequently.`,
				},
				exit_failure_last: {
					type: doveadm_response_types.STRING,
					description: `Exit status code of the last abnormal process termination.`,
				},
				exit_failures_in_sec: {
					type: doveadm_response_types.STRING,
					description: `Number of process failure exits recorded in the current second.`,
				},
				last_drop_warning: {
					type: doveadm_response_types.TIMESTAMP,
					description: `Timestamp of the last warning issued for dropped connections.`,
				},
				listen_pending: {
					type: doveadm_response_types.STRING,
					description: `Number of pending connections in the listening queue.`,
				},
				listening: {
					type: doveadm_response_types.STRING,
					description: `State of listening sockets for this service (1 if active, 0 otherwise).`,
				},
				doveadm_stop: {
					type: doveadm_response_types.STRING,
					description: `Indicator whether the service was stopped via doveadm (1 if stopped, 0 otherwise).`,
				},
				process_total: {
					type: doveadm_response_types.STRING,
					description: `Total lifetime count of worker processes spawned for this service.`,
				},
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
		response: null,
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
		response: null,
		text: `Mark active Sieve script.`,
	},

	'sieve deactivate': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		response: null,
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
		response: null,
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				'sieve script': {
					type: doveadm_response_types.STRING,
					description: `Contents of the Sieve script.`
				},
			},
		},
		text: `Retrieve a Sieve script.`,
	},

	'sieve list': {
		args: {},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		plugin: 'sieve',
		man: 'doveadm-sieve',
		response: {
			type: 'list',
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				script: {
					type: doveadm_response_types.STRING,
					description: `Sieve script name.`
				},
				active: {
					type: doveadm_response_types.STRING,
					description: `Marked ACTIVE if this is the active script.`
				},
			},
		},
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
		response: null,
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				path: {
					type: doveadm_response_types.STRING,
					description: `Filesystem path of the matching single-instance storage attachment file.`,
				},
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
		response: null,
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
		response: {
			type: 'list',
			fields: {
				metric_name: {
					type: doveadm_response_types.STRING,
					description: `Name of the statistic.`
				},
				field: {
					type: doveadm_response_types.INTEGER,
					description: `Value of the statistic (the per-statistic numeric column).`,
					dynamic: true
				},
			},
			note: `\`metric_name\` and \`field\` are always present; one additional \`field\` column appears per statistic that carries extra values (e.g. counter names or durations). Which ones appear depends on the configured statistics and the \`fields\` argument.`,
		},
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
		response: null,
		man: 'doveadm-stats',
		text: `Remove metrics from statistics.`,
	},

	'stats reopen': {
		args: {},
		response: null,
		man: 'doveadm-stats',
		text: `Reopen file exporter files.`,
	},

	'stop': {
		args: {},
		response: null,
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
		response: {
			fields: {
				username: {
					/* Sticky: doveadm-mail.c prepends a username column when the
					 * command is run against multiple users (-A, wildcard, or user file). */
					type: doveadm_response_types.STRING,
					description: `Username. Included when the command is run against multiple users.`,
					dynamic: true
				},

				state: {
					type: doveadm_response_types.STRING,
					description: `dsync state string after synchronization.`,
					dynamic: true
				},
			},
		},
		flags: doveadm_flag_types.USER | doveadm_flag_types.USERFILE,
		man: 'doveadm-sync',
		text: `Dovecot's mailbox synchronization utility.

This command cannot be used safely via API by untrusted users.`
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
			'expand-field': {
				cli: 'e',
				example: 'userdb_field',
				type: doveadm_arg_types.STRING,
				text: `Expand all %variables in this template string.`,
			},
			'userdb-only': {
				cli: 'u',
				type: doveadm_arg_types.BOOL,
				text: `Only show values from userdb.`,
			},
			'user-mask': doveadm_args_usermask,
		},
		man: 'doveadm-user',
		response: {
			type: 'list',
			fields: {
				field: {
					type: doveadm_response_types.STRING,
						description: `Userdb field name.`
				},
				value: {
					type: doveadm_response_types.STRING,
						description: `Value of the userdb field.`
				},
			},
			note: `In the default table mode the fields are the userdb fields, which are installation-specific (e.g. \`uid\`, \`home\`, \`mail\`). With \`-f\` only a single field is shown and with \`-e\` the value is a fully expanded template string.`,
		},
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
			type: 'list',
			fields: {
				username: {
					type: doveadm_response_types.STRING,
					description: `Username.`
				},
				connections: {
					type: doveadm_response_types.STRING,
					description: `The total number of connections for the user. Only returned if \`separate-connections\` is not set.`,
					dynamic: true
				},
				service: {
					type: doveadm_response_types.STRING,
					description: `The Dovecot service.`
				},
				pids: {
					type: doveadm_response_types.STRING,
					description: `Process IDs of the user's connections.`,
					dynamic: true
				},
				ips: {
					type: doveadm_response_types.STRING,
					description: `IP addresses where the user's connections are originating.`,
					dynamic: true
				},
				dest_ip: {
					type: doveadm_response_types.STRING,
					description: `Backend destination IP address the connection is routed to.`,
					dynamic: true
				},
			},
			note: `Without \`separate-connections\`, each object is one username/service combination with \`connections\`, \`pids\`, and \`ips\` aggregated. With \`separate-connections\`, each object is one connection with \`pid\`, \`ip\`, and \`dest_ip\` instead, plus one column per configured \`passdb-field\`.`,
			example: [
				{
					username: "foo",
					connections: "1",
					service: "imap",
					pids: "(47)",
					ips: "(10.0.2.100)"
				}
			],
		},
		man: 'doveadm-who',
		text: `Show who is logged into the Dovecot server.`,
	},

}
