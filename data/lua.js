/* Lua function definitions. */

export const lua_functions = [

	{
		// Function name
		name: 'i_debug',

		// List of function arguments
		args: {
			text: {
				// If true, this argument appears inside a Lua hash table
				// instead of as a standalone argument.
				// hash_arg: false,

				// If true, this argument can be provided multiple times.
				// multi: false,

				// If true, this is an optional argument.
				// optional: false,

				// Argument type
				type: 'string',

				// Argument description. Rendered w/Markdown.
				text: `Message to log.`
			},
		},

		// List of tags to associate with this function. This is the
		// Lua namespace/object (this is appended to the beginning of the
		// function name).
		tags: [ 'dovecot' ],

		// Function description. Rendered w/Markdown.
		text: `Log debug level message.`
	},

	{
		name: 'i_info',
		args: {
			text: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'dovecot' ],
		text: `Log info level message.`
	},

	{
		name: 'i_warning',
		args: {
			text: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'dovecot' ],
		text: `Log warning level message.`
	},

	{
		name: 'i_error',
		args: {
			text: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'dovecot' ],
		text: `Log error level message.`
	},

	{
		name: 'event',
		args: {
			parent: {
				type: 'parent',
				text: `Use as parent event.`
			},
		},
		tags: [ 'dovecot' ],
		text:
`Generate new event. If \`parent\` is not specified, the lua script is used
as the parent.`
	},

	{
		name: 'restrict_global_variables',
		args: {
			toggle: {
				type: 'boolean',
				text: `Enable or disable defining new global variables.`
			},
		},
		tags: [ 'dovecot' ],
		text: `
Enable or disable restricting new global variables.

If enabled, the rest of the script won't be allowed to declare global
non-function variables but they can declare local variables and use
already defined global variables.

If a script needs to define a variable, they must declare them as local i.e.
instead of \`my_var = "some value"\`, do \`local my_var = "some value"\`.
Restrictions will remain in place until the end of the execution of the
script or until they are lifted by calling
\`dovecot.restrict_global_variables(false)\`.

Default is permissive mode, i.e., same as lua's default, global variables
are not restricted.`
	},

	{
		name: 'client',
		args: {
			debug: {
				hash_arg: true,
				type: 'boolean',
				text: `Enable debug logging.`
			},
			no_auto_redirect: {
				hash_arg: true,
				type: 'boolean',
				text: `Don't automatically act upon redirect responses.`
			},
			no_auto_retry: {
				hash_arg: true,
				type: 'boolean',
				text: `Never automatically retry requests.`
			},
			connect_backoff_time_msecs: {
				default: '100 msec',
				hash_arg: true,
				type: 'int',
				text: `Initial backoff time; doubled at each connection failure.`
			},
			connect_backoff_max_time_msecs: {
				default: '60000 msec',
				hash_arg: true,
				type: 'int',
				text: `Maximum backoff time.`
			},
			connect_timeout_msecs: {
				default: '<request_timeout_msecs>',
				hash_arg: true,
				type: 'int',
				text: `Max time to wait for \`connect()\` (and SSL handshake) to finish before retrying.`
			},
			event_parent: {
				hash_arg: true,
				type: 'event',
				text: `Parent event to use.`
			},
			max_attempts: {
				default: '1',
				hash_arg: true,
				type: 'int',
				text: `Maximum number of attempts for a request.`
			},
			max_auto_retry_delay_secs: {
				hash_arg: true,
				type: 'int',
				text: `
Maximum acceptable delay in seconds for automatically retrying/redirecting
requests.

If a server sends a response with a \`Retry-After\` header that causes a
delay longer than this, the request is not automatically retried and
the response is returned.`
			},
			max_connect_attempts: {
				hash_arg: true,
				type: 'int',
				text: `
Maximum number of connection attempts to a host before all associated
requests fail.

If > 1, the maximum will be enforced across all IPs for that host, meaning
that IPs may be tried more than once eventually if the number of IPs is
smaller than the specified maximum attempts. If the number of IPs is
higher than the maximum attempts, not all IPs are tried.

If <= 1, all IPs are tried at most once.`
			},
			max_idle_time_msecs: {
				hash_arg: true,
				type: 'int',
				text: `
Maximum time a connection will idle before disconnecting.

If parallel connections are idle, the duplicates will end earlier based on
how many idle connections exist to that same service.`
			},
			max_redirects: {
				default: '0; redirects refused',
				hash_arg: true,
				type: 'int',
				text: `Maximum number of redirects for a request.`
			},
			proxy_url: {
				hash_arg: true,
				type: 'string',
				text: `Proxy URL to use, can include username and password.`
			},
			request_absolute_timeout_msecs: {
				default: '0; no timeout',
				hash_arg: true,
				type: 'int',
				text: `Max total time to wait for HTTP request to finish, including retries and everything else.`
			},
			request_timeout_msecs: {
				default: '60000 msec',
				hash_arg: true,
				type: 'int',
				text: `Max time to wait for HTTP response before retrying.`
			},
			soft_connect_timeout_msecs: {
				default: '0; wait until current connection attempt finishes',
				hash_arg: true,
				type: 'int',
				text: `Time to wait for \`connect()\` (and SSL handshake) to finish for the first connection before trying the next IP in parallel.`
			},
			rawlog_dir: {
				hash_arg: true,
				type: 'string',
				text: `Directory for writing raw log data for debugging purposes. Must be writable by the process creating this log.`
			},
			user_agent: {
				default: '<none>',
				hash_arg: true,
				type: 'string',
				text: `\`User-Agent:\` header.`
			},
		},
		return: 'An http_client object.',
		tags: [ 'dovecot.http' ],
		text: `
Create a new http client object that can be used to submit requests to
remote servers.`
	},

	{
		name: 'request',
		args: {
			url: {
				hash_arg: true,
				type: 'string',
				text: `Full url address. Parameters will be parsed from the string. TLS encryption is implied with use of \`https\`.`
			},
			method: {
				hash_arg: true,
				type: 'string',
				text: `HTTP method to use.`
			},
		},
		return: 'An http_request object.',
		tags: [ 'http_client' ],
		text: `
Create a new request object.

By default, the request has \`Host\`, and \`Date\` headers with relevant
values, as well as \`Connection: Keep-Alive\`.`
	},

	{
		name: 'add_header',
		args: {
			name: {
				type: 'string',
				text: `Name of the HTTP header.`
			},
			value: {
				type: 'string',
				text: `Value of the header.`
			},
		},
		tags: [ 'http_request' ],
		text: `Add a header to the request.`
	},

	{
		name: 'remove_header',
		args: {
			name: {
				type: 'string',
				text: `Name of the HTTP header.`
			},
		},
		tags: [ 'http_request' ],
		text: `
Do a lookup of the header in the request and remove it if found.`
	},

	{
		name: 'set_payload',
		args: {
			value: {
				type: 'string',
				text: `Payload of the request as string data.`
			},
			synchronous: {
				type: 'boolean',
				text: `Expect 100 Continue header before sending data. Defaults to \`false\`.`
			},
		},
		tags: [ 'http_request' ],
		text: `
Set payload data to the request.

Optionally you can set \`synchronous\`, which will cause "100 Continue"
header to be sent.`
	},

	{
		name: 'submit',
		return: `An http_response object.`,
		tags: [ 'http_request' ],
		text: `
Connect to the remote server and submit the request.

This function blocks until the HTTP response is fully received.`
	},

	{
		name: 'status',
		return: `Status code of the http response.`,
		tags: [ 'http_response' ],
		text: `
Get the status code of the HTTP response.

The codes contain error codes as well as HTTP codes, e.g., '200 HTTP_OK'
and error code that denote connection to remote server failed.

A human-readable string of the error can then be read using \`reason()\`
function.`
	},

	{
		name: 'reason',
		return: `String representation of the status.`,
		tags: [ 'http_response' ],
		text: `
Returns a human-readable string of HTTP status codes, e.g. "OK",
"Bad Request", "Service Unavailable", as well as connection errors, e.g.,
"connect(...) failed: Connection refused".`
	},

	{
		name: 'header',
		args: {
			name: {
				type: 'string',
				text: `Header to retrieve.`
			}
		},
		return: `Value of the HTTP response header.`,
		tags: [ 'http_response' ],
		text: `
Get value of a header in the HTTP request.

If header is not found from the response, an empty string is returned.`
	},

	{
		name: 'payload',
		return: `Payload of the HTTP response as a string.`,
		tags: [ 'http_response' ],
		text: `Get the payload of the HTTP response.`
	},

	{
		name: 'append_log_prefix',
		args: {
			prefix: {
				type: 'string',
				text: `Prefix to append.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Set prefix to append into log messages.`
	},

	{
		name: 'replace_log_prefix',
		args: {
			prefix: {
				type: 'string',
				text: `Prefix to append.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Append prefix for log messages.`
	},

	{
		name: 'set_name',
		args: {
			name: {
				type: 'string',
				text: `Event name.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Set name for event.`
	},

	{
		name: 'add_str',
		args: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			value: {
				type: 'string',
				text: `A value.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Add a key-value pair to event.`
	},

	{
		name: 'add_int',
		args: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			value: {
				type: 'int',
				text: `Integer value.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Add a key-value pair to event.`
	},

	{
		name: 'add_timeval',
		args: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			value: {
				type: 'int',
				text: `Unix timestamp.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Add a key-value pair to event.`
	},

	{
		name: 'inc_int',
		args: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			diff: {
				type: 'int',
				text: `Difference to add. Can be negative.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Increment key-value pair.`
	},

	{
		name: 'log_debug',
		args: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Emit debug message.`
	},

	{
		name: 'log_info',
		args: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Emit info message.`
	},

	{
		name: 'log_warning',
		args: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Emit warning message.`
	},

	{
		name: 'log_error',
		args: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event', 'event_passthrough' ],
		text: `Emit error message.`
	},

	{
		name: 'passthrough_event',
		tags: [ 'event' ],
		text: `
Returns an passthrough event.

A log message *must be* logged or else a panic will occur.`
	},

	{
		name: 'lookup',
		args: {
			key: {
				type: 'string',
				text: `Key to lookup.`
			},
			username: {
				optional: true,
				type: 'string',
				text: `Username for private dict keys.`
			},
		},
		tags: [ 'dict' ],
		text: `
Lookup key from dict. If key is found, returns a table with values.

If key is not found, returns \`nil\`.`
	},

	{
		name: 'iterate',
		args: {
			path: {
				type: 'string',
				text: `Path prefix to iterate.`
			},
			flags: {
				type: 'int',
				text: `Iteration flags. Currently raw numbers must be used for these. See \`enum dict_iterate_flags\` in the C code.`
			},
			username: {
				optional: true,
				type: 'string',
				text: `Username for private dict paths.`
			},
		},
		tags: [ 'dict' ],
		text: `
Returns an iteration step function and dict iter userdata. For example:

\`\`\`lua
for key, values in dict:iterate(key_prefix, 0) do
    dovecot.i_debug('key='..key..', first value='..values[1])
end`
	},

	{
		name: 'transaction_begin',
		args: {
			username: {
				optional: true,
				type: 'string',
				text: `Username for private dict keys.`
			},
		},
		tags: [ 'dict' ],
		text: `Returns a new transaction object.`
	},

	{
		name: 'set',
		args: {
			key: {
				type: 'string',
				text: `Key to set.`
			},
			value: {
				type: 'string',
				text: `Value to set.`
			},
		},
		tags: [ 'dict.transaction' ],
		text: `Set key=value in the dict transaction.`
	},

	{
		name: 'unset',
		args: {
			key: {
				type: 'string',
				text: `Key to unset.`
			},
		},
		tags: [ 'dict.transaction' ],
		text: `Unset key in the dict transaction.`
	},

	{
		name: 'set_timestamp',
		args: {
			seconds: {
				hash_arg: true,
				type: 'int',
				text: `UNIX timestamp.`
			},
			nanoseconds: {
				hash_arg: true,
				type: 'int',
				text: `Nanoseconds part of the timestamp.`
			},
		},
		tags: [ 'dict.transaction' ],
		text: `
Set timestamp to the dict transaction.

This is currently used only with Cassandra.`
	},

	{
		name: 'commit',
		tags: [ 'dict.transaction' ],
		text: `Commit the transaction.`
	},

	{
		name: 'rollback',
		tags: [ 'dict.transaction' ],
		text: `Rollback the transaction.`
	},

	{
		name: 'lookup',
		args: {
			hostname: {
				type: 'string',
				text: `Hostname to lookup.`
			},
			event: {
				optional: true,
				type: 'event',
				text: `Event to use for logging.`
			},
		},
		return: `
On successful DNS lookup, returns a table with IP addresses (which has at
least one IP).

On failure, returns nil, error string, net_gethosterror()
compatible error code (similar to e.g. Lua io.* calls).`,
		tags: [ 'dns_client' ],
		text: `Lookup hostname asynchronously via dns-client process.`
	},

	{
		name: 'plugin_getenv',
		args: {
			key: {
				type: 'string',
				text: `Setting name.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Returns key from user plugin settings or userdb environment.`
	},

	{
		name: 'var_expand',
		args: {
			template: {
				type: 'string',
				text: `Variable template string.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Expands mail user variables (see [[variable]]).`
	},

	{
		name: 'mailbox',
		args: {
			name: {
				type: 'string',
				text: `Mailbox name.`
			},
			flags: {
				optional: true,
				type: 'int',
				text: `Flags, see [\`dovecot.storage\`](#dovecot-storage).`
			},
		},
		tags: [ 'mail_user' ],
		text: `Allocates a mailbox.`
	},

	{
		name: 'metadata_get',
		args: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Returns given metadata key for the user.`
	},

	{
		name: 'metadata_set',
		args: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
			value: {
				type: 'string',
				text: `Value to set, \`nil\` unsets value.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Sets user metadata key to value.`
	},

	{
		name: 'metadata_unset',
		args: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `
Unsets value, same as calling \`mail_user.metadata_set()\` with value = \`nil\`.`
	},

	{
		name: 'metadata_list',
		args: {
			key: {
				multi: true,
				type: 'string',
				text: `Metadata prefix, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Lists all keys for the user metadata under prefix.`
	},

	{
		name: 'open',
		tags: [ 'mailbox' ],
		text: `Opens the mailbox.`
	},

	{
		name: 'close',
		tags: [ 'mailbox' ],
		text: `Closes the mailbox.`
	},

	{
		name: 'free',
		tags: [ 'mailbox' ],
		text: `Releases mailbox (must be done).`
	},

	{
		name: 'sync',
		args: {
			flags: {
				optional: true,
				type: 'int',
				text: `Flags, see [\`dovecot.storage\`](#dovecot-storage).`
			},
		},
		tags: [ 'mailbox' ],
		text: `Synchronizes the mailbox (should usually be done).`
	},

	{
		name: 'status',
		args: {
			item: {
				multi: true,
				type: 'string',
				text: `Item name.`
			},
		},
		return: `mailbox_status table`,
		tags: [ 'mailbox' ],
		text: `Returns requested mailbox status items as table.`
	},

	{
		name: 'metadata_get',
		args: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mailbox' ],
		text: `Returns given metadata key for the mailbox.`
	},

	{
		name: 'metadata_set',
		args: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
			value: {
				type: 'string',
				text: `Value to set, \`nil\` unsets value.`
			},
		},
		tags: [ 'mailbox' ],
		text: `Sets mailbox metadata key to value.`
	},

	{
		name: 'metadata_unset',
		args: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `
Unsets value, same as calling \`mailbox.metadata_set()\` with value = \`nil\`.`
	},

	{
		name: 'metadata_list',
		args: {
			key: {
				multi: true,
				type: 'string',
				text: `Metadata prefix, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Lists all keys for the mailbox metadata under prefix.`
	},

]

export const lua_constants = [

	{
		// Constant name
		name: 'STATUS_MESSAGES',

		// List of tags to associate with this constant. This is the
		// Lua namespace/object (this is appended to the beginning of the
		// constant name).
		tags: [ 'dovecot.storage' ],

		// Constant description. Rendered w/Markdown.
		// text: `foo`,
	},

	{
		name: 'STATUS_RECENT',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_UIDNEXT',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_UIDVALIDITY',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_UNSEEN',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_FIRST_UNSEEN_SEQ',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_KEYWORDS',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_HIGHESTMODSEQ',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_PERMANENT_FLAGS',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'FIRST_RECENT_UID',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'STATUS_HIGHESTPVTMODSEQ',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_READONLY',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_SAVEONLY',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_DROP_RECENT',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_NO_INDEX_FILES',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_KEEP_LOCKED',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_IGNORE_ACLS',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_AUTO_CREATE',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_FLAG_AUTO_SUBSCRIBE',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_SYNC_FLAG_FULL_READ',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_SYNC_FLAG_FULL_WRITE',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_SYNC_FLAG_FAST',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_SYNC_FLAG_NO_EXPUNGES',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_SYNC_FLAG_FIX_INCONSISTENT',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_SYNC_FLAG_EXPUNGE',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_SYNC_FLAG_FORGE_RESYNC',
		tags: [ 'dovecot.storage' ]
	},

	{
		name: 'MAILBOX_ATTRIBUTE_PREFIX_DOVECOT',
		tags: [ 'dovecot.storage' ],
		text: `String constant \`vendor/vendor.dovecot/\`.`
	},

	{
		name: 'MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT',
		tags: [ 'dovecot.storage' ],
		text: `String constant \`vendor/vendor.dovecot/pvt/\`.`
	},

	{
		name: 'MAILBOX_ATTRIBUTE_PREFIX_DOVECOT_PVT_SERVER',
		tags: [ 'dovecot.storage' ],
		text: `String constant \`vendor/vendor.dovecot/pvt/server/\`.`
	},

]

export const lua_variables = [

	{
		// Variable name
		name: `home`,

		// List of tags to associate with this constant. This is the
		// Lua namespace/object (this is appended to the beginning of the
		// constant name).
		tags: [ 'mail_user' ],

		// Constant description. Rendered w/Markdown.
		text: `Home directory (if available).`
	},

	{
		name: `username`,
		tags: [ 'mail_user' ],
		text: `User's name.`
	},

	{
		name: `uid`,
		tags: [ 'mail_user' ],
		text: `System UID.`
	},

	{
		name: `gid`,
		tags: [ 'mail_user' ],
		text: `System GID.`
	},

	{
		name: `service`,
		tags: [ 'mail_user' ],
		text: `Service type (IMAP/POP3/LMTP/LDA/...).`
	},

	{
		name: `session_id`,
		tags: [ 'mail_user' ],
		text: `Current session ID.`
	},

	{
		name: `session_create_time`,
		tags: [ 'mail_user' ],
		text: `When session was created.`
	},

	{
		name: `nonexistent`,
		tags: [ 'mail_user' ],
		text: `Does user exist?`
	},

	{
		name: `anonymous`,
		tags: [ 'mail_user' ],
		text: `Is user anonymous?`
	},

	{
		name: `autocreated`,
		tags: [ 'mail_user' ],
		text: `Was user automatically created internally for some operation?`
	},

	{
		name: `mail_debug`,
		tags: [ 'mail_user' ],
		text: `Is debugging turned on?`
	},

	{
		name: `fuzzy_search`,
		tags: [ 'mail_user' ],
		text: `Does fuzzy search work for this user?`
	},

	{
		name: `dsyncing`,
		tags: [ 'mail_user' ],
		text: `Is user being dsynced?`
	},

	{
		name: `attribute`,
		tags: [ 'mailbox' ],
		text: `Full mailbox name.`
	},

	{
		name: `name`,
		tags: [ 'mailbox' ],
		text: `Mailbox name.`
	},

	{
		name: `mailbox`,
		tags: [ 'mailbox_status' ],
		text: `Full name of mailbox.`
	},

	{
		name: `messages`,
		tags: [ 'mailbox_status' ],
		text: `Number of messages.`
	},

	{
		name: `recent`,
		tags: [ 'mailbox_status' ],
		text: `Number of \\Recent messages.`
	},

	{
		name: `unseen`,
		tags: [ 'mailbox_status' ],
		text: `Number of \\Unseen messages.`
	},

	{
		name: `uidvalidity`,
		tags: [ 'mailbox_status' ],
		text: `Current UID validity.`
	},

	{
		name: `uidnext`,
		tags: [ 'mailbox_status' ],
		text: `Next UID.`
	},

	{
		name: `first_unseen_seq`,
		tags: [ 'mailbox_status' ],
		text: `First sequence number of unseen mail.`
	},

	{
		name: `first_recent_uid`,
		tags: [ 'mailbox_status' ],
		text: `First UID of unseen mail.`
	},

	{
		name: `highest_modseq`,
		tags: [ 'mailbox_status' ],
		text: `Highest modification sequence.`
	},

	{
		name: `highest_pvt_modseq`,
		tags: [ 'mailbox_status' ],
		text: `Highest private modification sequence.`
	},

	{
		name: `permanent_flags`,
		tags: [ 'mailbox_status' ],
		text: `Supported permanent flags as a bitmask.`
	},

	{
		name: `flags`,
		tags: [ 'mailbox_status' ],
		text: `Supported flags as a bitmask.`
	},

	{
		name: `permanent_keywords`,
		tags: [ 'mailbox_status' ],
		text: `Are permanent keywords supported?`
	},

	{
		name: `allow_new_keywords`,
		tags: [ 'mailbox_status' ],
		text: `Can new keywords be added?`
	},

	{
		name: `nonpermanent_modseqs`,
		tags: [ 'mailbox_status' ],
		text: `Are modification sequences temporary?`
	},

	{
		name: `no_modseq_tracking`,
		tags: [ 'mailbox_status' ],
		text: `Are modification sequences being tracked?`
	},

	{
		name: `have_guids`,
		tags: [ 'mailbox_status' ],
		text: `Do GUIDs exist?`
	},

	{
		name: `have_save_guids`,
		tags: [ 'mailbox_status' ],
		text: `Can GUIDs be saved?`
	},

	{
		name: `have_only_guid128`,
		tags: [ 'mailbox_status' ],
		text: `Are GUIDs only 128 bits?`
	},

	{
		name: `keywords`,
		tags: [ 'mailbox_status' ],
		text: `Table of current keywords.`
	},

	{
		name: `mailbox`,
		tags: [ 'mail' ],
		text: `Mailbox object.`
	},

	{
		name: `seq`,
		tags: [ 'mail' ],
		text: `Sequence number (can change).`
	},

	{
		name: `uid`,
		tags: [ 'mail' ],
		text: `UID (immutable).`
	},

]
