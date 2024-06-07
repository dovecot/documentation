/* Lua function definitions. */

export const lua_functions = {

	'dovecot.i_debug(text)': {
		params: {
			text: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'base '],
		text: `Log debug level message.`
	},

	'dovecot.i_info(text)': {
		params: {
			text: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'base '],
		text: `Log info level message.`
	},

	'dovecot.i_warning(text)': {
		params: {
			text: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'base '],
		text: `Log warning level message.`
	},

	'dovecot.i_error(text)': {
		params: {
			text: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'base '],
		text: `Log error level message.`
	},

	'dovecot.event()': {
		tags: [ 'base' ],
		text: `Generate new event with lua script as parent.`
	},

	'dovecot.event(parent)': {
		tags: [ 'base' ],
		text: `Generate new event with given parent event.`
	},

	'dovecot.restrict_global_variables(toggle)': {
		params: {
			text: {
				type: 'boolean',
				text: `Enable or disable defining new global variables.`
			},
		},
		tags: [ 'base' ],
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

	'dovecot.http.client({ parameters })': {
		params: {
			debug: {
				type: 'boolean',
				text: `Enable debug logging.`
			},
			no_auto_redirect: {
				type: 'boolean',
				text: `Don't automatically act upon redirect responses.`
			},
			no_auto_retry: {
				type: 'boolean',
				text: `Never automatically retry requests.`
			},
			connect_backoff_time_msecs: {
				default: '100 msec',
				type: 'int',
				text: `Initial backoff time; doubled at each connection failure.`
			},
			connect_backoff_max_time_msecs: {
				default: '60000 msec',
				type: 'int',
				text: `Maximum backoff time.`
			},
			connect_timeout_msecs: {
				default: '<request_timeout_msecs>',
				type: 'int',
				text: `Max time to wait for \`connect()\` (and SSL handshake) to finish before retrying.`
			},
			event_parent: {
				type: 'event',
				text: `Parent event to use.`
			},
			max_attempts: {
				default: '1',
				type: 'int',
				text: `Maximum number of attempts for a request.`
			},
			max_auto_retry_delay_secs: {
				type: 'int',
				text: `
Maximum acceptable delay in seconds for automatically retrying/redirecting
requests.

If a server sends a response with a \`Retry-After\` header that causes a
delay longer than this, the request is not automatically retried and
the response is returned.`
			},
			max_connect_attempts: {
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
				type: 'int',
				text: `
Maximum time a connection will idle before disconnecting.

If parallel connections are idle, the duplicates will end earlier based on
how many idle connections exist to that same service.`
			},
			max_redirects: {
				default: '0; redirects refused',
				type: 'int',
				text: `Maximum number of redirects for a request.`
			},
			proxy_url: {
				type: 'string',
				text: `Proxy URL to use, can include username and password.`
			},
			request_absolute_timeout_msecs: {
				default: '0; no timeout',
				type: 'int',
				text: `Max total time to wait for HTTP request to finish, including retries and everything else.`
			},
			request_timeout_msecs: {
				default: '60000 msec',
				type: 'int',
				text: `Max time to wait for HTTP response before retrying.`
			},
			soft_connect_timeout_msecs: {
				default: '0; wait until current connection attempt finishes',
				type: 'int',
				text: `Time to wait for \`connect()\` (and SSL handshake) to finish for the first connection before trying the next IP in parallel.`
			},
			rawlog_dir: {
				type: 'string',
				text: `Directory for writing raw log data for debugging purposes. Must be writable by the process creating this log.`
			},
			user_agent: {
				default: '<none>',
				type: 'string',
				text: `\`User-Agent:\` header.`
			},
		},
		return: 'An http_client object.',
		tags: [ 'base' ],
		text: `
Create a new http client object that can be used to submit requests to
remote servers.`
	},

	'http_client.request({url=string, method=string})': {
		params: {
			url: {
				type: 'string',
				text: `Full url address. Parameters will be parsed from the string. TLS encryption is implied with use of \`https\`.`
			},
			method: {
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

	'http_request.add_header(name, value)': {
		params: {
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

	'http_request.remove_header(name)': {
		params: {
			name: {
				type: 'string',
				text: `Name of the HTTP header.`
			},
		},
		tags: [ 'http_request' ],
		text: `
Do a lookup of the header in the request and remove it if found.`
	},

	'http_request.set_payload(value, synchronous)': {
		params: {
			value: {
				type: 'string',
				text: `Payload of the request as string data.`
			},
			synchronous: {
				type: 'boolean',
				text: `Expect 100 Continue header before sending data. Defaults to false.`
			},
		},
		tags: [ 'http_request' ],
		text: `
Set payload data to the request.

Optionally you can set \`synchronous\`, which will cause "100 Continue"
header to be sent.`
	},

	'http_request.submit()': {
		return: `An http_response object.`,
		tags: [ 'http_request' ],
		text: `
Connect to the remote server and submit the request.

This function blocks until the HTTP response is fully received.`
	},

	'http_response.status()': {
		return: `Status code of the http response.`,
		tags: [ 'http_response' ],
		text: `
Get the status code of the HTTP response.

The codes contain error codes as well as HTTP codes, e.g., '200 HTTP_OK'
and error code that denote connection to remote server failed.

A human-readable string of the error can then be read using \`reason()\`
function.`
	},

	'http_response.reason()': {
		return: `String representation of the status.`,
		tags: [ 'http_response' ],
		text: `
Returns a human-readable string of HTTP status codes, e.g. "OK",
"Bad Request", "Service Unavailable", as well as connection errors, e.g.,
"connect(...) failed: Connection refused".`
	},

	'http_response.header(name)': {
		return: `Value of the HTTP response header.`,
		tags: [ 'http_response' ],
		text: `
Get value of a header in the HTTP request.

If header is not found from the response, an empty string is returned.`
	},

	'http_response.payload()': {
		return: `Payload of the HTTP response as a string.`,
		tags: [ 'http_response' ],
		text: `Get the payload of the HTTP response.`
	},

	'event.append_log_prefix(prefix)': {
		params: {
			prefix: {
				type: 'string',
				text: `Prefix to append.`
			},
		},
		tags: [ 'event' ],
		text: `Set prefix to append into log messages.`
	},

	'event.replace_log_prefix(prefix)': {
		params: {
			prefix: {
				type: 'string',
				text: `Prefix to append.`
			},
		},
		tags: [ 'event' ],
		text: `Append prefix for log messages.`
	},

	'event.set_name(name)': {
		params: {
			name: {
				type: 'string',
				text: `Event name.`
			},
		},
		tags: [ 'event' ],
		text: `Set name for event.`
	},

	'event.add_str(key,value)': {
		params: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			value: {
				type: 'string',
				text: `A value.`
			},
		},
		tags: [ 'event' ],
		text: `Add a key-value pair to event.`
	},

	'event.add_int(key,value)': {
		params: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			value: {
				type: 'int',
				text: `Integer value.`
			},
		},
		tags: [ 'event' ],
		text: `Add a key-value pair to event.`
	},

	'event.add_timeval(key,seconds)': {
		params: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			value: {
				type: 'int',
				text: `Unix timestamp.`
			},
		},
		tags: [ 'event' ],
		text: `Add a key-value pair to event.`
	},

	'event.inc_int(key,diff)': {
		params: {
			key: {
				type: 'string',
				text: `Key name.`
			},
			diff: {
				type: 'int',
				text: `Difference to add. Can be negative.`
			},
		},
		tags: [ 'event' ],
		text: `Increment key-value pair.`
	},

	'event.log_debug(message)': {
		params: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event' ],
		text: `Emit debug message.`
	},

	'event.log_info(message)': {
		params: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event' ],
		text: `Emit info message.`
	},

	'event.log_warning(message)': {
		params: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event' ],
		text: `Emit warning message.`
	},

	'event.log_error(message)': {
		params: {
			message: {
				type: 'string',
				text: `Message to log.`
			},
		},
		tags: [ 'event' ],
		text: `Emit error message.`
	},


	'event.passthrough_event()': {
		tags: [ 'event' ],
		text: `
Returns an passthrough event.

A log message *must be* logged or else a panic will occur.`
	},

	'dict.lookup(key[, username])': {
		params: {
			key: {
				type: 'string',
				text: `Key to lookup.`
			},
			username: {
				type: 'string',
				text: `Username for private dict keys.`
			},
		},
		tags: [ 'dict' ],
		text: `
Lookup key from dict. If key is found, returns a table with values.

If key is not found, returns \`nil\`.`
	},

	'dict.iterate(path, flags[, username])': {
		params: {
			path: {
				type: 'string',
				text: `Path prefix to iterate.`
			},
			flags: {
				type: 'int',
				text: `Iteration flags. Currently raw numbers must be used for these. See \`enum dict_iterate_flags\` in the C code.`
			},
			username: {
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

	'dict.transaction_begin([username])': {
		params: {
			username: {
				type: 'string',
				text: `Username for private dict keys.`
			},
		},
		tags: [ 'dict' ],
		text: `Returns a new transaction object.`
	},

	'dict.transaction.set(key, value)': {
		params: {
			key: {
				type: 'string',
				text: `Key to set.`
			},
			value: {
				type: 'string',
				text: `Value to set.`
			},
		},
		tags: [ 'dict_transaction' ],
		text: `Set key=value in the dict transaction.`
	},

	'dict.transaction.unset(key)': {
		params: {
			key: {
				type: 'string',
				text: `Key to unset.`
			},
		},
		tags: [ 'dict_transaction' ],
		text: `Unset key in the dict transaction.`
	},

	'dict.transaction.set_timestamp({tv_sec=seconds, tv_nsec=nanoseconds})': {
		params: {
			seconds: {
				type: 'int',
				text: `UNIX timestamp.`
			},
			nanoseconds: {
				type: 'int',
				text: `Nanoseconds part of the timestamp.`
			},
		},
		tags: [ 'dict_transaction' ],
		text: `
Set timestamp to the dict transaction.

This is currently used only with Cassandra.`
	},

	'dict.transaction.commit()': {
		tags: [ 'dict_transaction' ],
		text: `Commit the transaction.`
	},

	'dict.transaction.rollback()': {
		tags: [ 'dict_transaction' ],
		text: `Rollback the transaction.`
	},

	'dns_client.lookup(hostname[, event])': {
		params: {
			hostname: {
				type: 'string',
				text: `Hostname to lookup.`
			},
			event: {
				type: 'event',
				text: `Event to use for logging.`
			},
		},
		return: `
On succesful DNS lookup, returns a table with IP addresses (which has at
least one IP).

On failure, returns nil, error string, net_gethosterror()
compatible error code (similar to e.g. Lua io.* calls).`,
		tags: [ 'dns_client' ],
		text: `Lookup hostname asynchronously via dns-client process.`
	},

	'mail_user.plugin_getenv(key)': {
		params: {
			key: {
				type: 'string',
				text: `Setting name.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Returns key from user plugin settings or userdb environment.`
	},

	'mail_user.var_expand(template)': {
		params: {
			template: {
				type: 'string',
				text: `Variable template string.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Expands mail user variables (see [[variable]]).`
	},

	'mail_user.mailbox(name[, flags])': {
		params: {
			name: {
				type: 'string',
				text: `Mailbox name.`
			},
			flags: {
				type: 'int',
				text: `Flags, see [\`dovecot.storage\`](#dovecot-storage).`
			},
		},
		tags: [ 'mail_user' ],
		text: `Allocates a mailbox.`
	},

	'mail_user.metadata_get(key)': {
		params: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Returns given metadata key for the user.`
	},

	'mail_user.metadata_set(key, value)': {
		params: {
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

	'mail_user.metadata_unset(key)': {
		params: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `
Unsets value, same as calling \`mail_user.metadata_set()\` with value = \`nil\`.`
	},

	'mail_user.metadata_list(prefix, prefix, prefix...)': {
		params: {
			key: {
				type: 'string',
				text: `Metadata prefix, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Lists all keys for the user metadata under prefix.`
	},

	'mailbox.open()': {
		tags: [ 'mailbox' ],
		text: `Opens the mailbox.`
	},

	'mailbox.close()': {
		tags: [ 'mailbox' ],
		text: `Closes the mailbox.`
	},

	'mailbox.free()': {
		tags: [ 'mailbox' ],
		text: `Releases mailbox (must be done).`
	},

	'mailbox.sync([flags])': {
		params: {
			flags: {
				type: 'int',
				text: `Flags, see [\`dovecot.storage\`](#dovecot-storage).`
			},
		},
		tags: [ 'mailbox' ],
		text: `Synchronizes the mailbox (should usually be done).`
	},

	'mailbox.status(item,item,item...)': {
		params: {
			item: {
				type: 'string',
				text: `Item name.`
			},
		},
		return: `mailbox_status table`,
		tags: [ 'mailbox' ],
		text: `Returns requested mailbox status items as table.`
	},

	'mailbox.metadata_get(key)': {
		params: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mailbox' ],
		text: `Returns given metadata key for the mailbox.`
	},

	'mailbox.metadata_set(key)': {
		params: {
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

	'mailbox.metadata_unset(key)': {
		params: {
			key: {
				type: 'string',
				text: `Metadata key, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `
Unsets value, same as calling \`mailbox.metadata_set()\` with value = \`nil\`.`
	},

	'mailbox.metadata_list(prefix, prefix, prefix...)': {
		params: {
			key: {
				type: 'string',
				text: `Metadata prefix, must begin with \`/private/\` or \`/shared/\`.`
			},
		},
		tags: [ 'mail_user' ],
		text: `Lists all keys for the mailbox metadata under prefix.`
	},

}
