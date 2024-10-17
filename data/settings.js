/* Dovecot settings. */

import { setting_types } from '../lib/settings.js'

export const settings = {

	/* Core (advanced) settings. */

	// KEY = setting name
	auth_proxy_self: {
		// Change Documentation
		// KEY = update identifier (see data/updates.js)
		// VALUE = Text to display. "false" means only the version
		// and change type is displayed. Rendered w/Markdown.
		// added: {
		//     'update_identifier': `Update description`
		// },
		// changed: {},
		// deprecated: {},
		// removed: {},

		// Default value of the setting. If not set, is displayed as "None".
		// Rendered w/Markdown. Can be a singular value, i.e. "default: value",
		// or an object that renders the default value and an optional
		// non-highlighted text.
		// default: '',
		// or
		// default: {
		//   value: '',
		//   text: '',
		// },

		// A list of "See Also" links to display. Rendered w/Markdown.
		// Text entries are processed as inter-settings links.
		// seealso: [],

		// A list of identifier "tags" to use for this setting.
		// This is used by pages to filter settings lists.
		// tags: [],

		// If setting is defined by a plugin, the plugin identifier.
		// This can be a string or an array.
		// plugin: '',

		// A list of dependencies without which this setting cannot work.
		// dependencies: [],

		// The setting type. See lib/settings.js for the list of types.
		values: setting_types.STRING,

		// If true, this is an "advanced" setting. This will be shown
		// in a separate section on the All Settings page.
		advanced: true,

		// Setting description. Rendered w/Markdown.
		text: `
If the destination for proxying matches any of the IP addresses listed
here, proxying is not performed when \`proxy_maybe=yes\` is returned.

This parameter isn't normally needed; its main use is if the
destination IP address belongs to, for instance, a load-balancer rather
than the server itself.`
	},

	fs: {
		tags: [ 'fs' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ '[[link,fs]]', 'fs_name', 'fs_driver' ],
		text: `
Create a new [[link,fs,fs]] to the list of filesystems. The filter name refers
to [[setting,fs_name]] setting.

Example:
\`\`\`[dovecot.conf]
fs posix {
  # ...
}
\`\`\`

Since an empty [[setting,fs_driver]] default to [[setting,fs_name]] there is no
need to specify [[setting,fs_driver]] explicitly.

It's possible to specify the same \`fs\` multiple times by separating the
[[setting,fs_name]] and [[setting,fs_driver]] settings:

\`\`\`[dovecot.conf]
fs compress1 {
  fs_driver = compress
}
fs compress2 {
  fs_driver = compress
}
\`\`\``
	},

	fs_name: {
		tags: [ 'fs' ],
		values: setting_types.STRING,
		seealso: [ 'fs', 'fs_driver' ],
		text: `
Name of the [[setting,fs]]. The [[setting,fs_driver]] setting default to this.`
	},

	fs_driver: {
		tags: [ 'fs' ],
		values: setting_types.STRING,
		default: '[[setting,fs_name]]',
		seealso: [ 'fs', 'fs_name' ],
		text: `
The [[setting,fs]] driver to use. Defaults to [[setting,fs_name]].`
	},

	fs_compress_read_plain_fallback: {
		tags: [ 'fs-compress' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		seealso: [ '[[plugin,fs-compress]]' ],
		text: `
By default [[plugin,fs-compress]] fails if the file wasn't compressed. If this
setting is enabled the file is returned as-is (i.e. allows reading plaintext
files).`
	},

	fs_compress_write_method: {
		tags: [ 'fs-compress' ],
		values: setting_types.STRING,
		seealso: [ '[[link,mail_compress_compression_methods]]' ],
		text: `
Which [[link,mail_compress_compression_methods,Compression Method]] to use for
writing new files.`
	},

	fs_crypt_read_plain_fallback: {
		tags: [ 'fs-crypt' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If enabled files that are not encrypted are returned as-is. By default it
results in a read error.`
	},

	fs_dict_value_encoding: {
		tags: [ 'fs-dict' ],
		values: setting_types.ENUM,
		values_enum: [ 'raw', 'hex', 'base64' ],
		default: 'raw',
		text: `
How to encode file contents into the dict value.`
	},

	fs_posix_lock_method: {
		advanced: true,
		tags: [ 'fs-posix' ],
		values: setting_types.ENUM,
		values_enum: [ 'flock', 'dotlock' ],
		default: 'flock',
		text: `
Lock method to use for locking files. Currently nothing uses \`lib-fs\`
locking.`
	},

	fs_posix_prefix: {
		tags: [ 'fs-posix' ],
		values: setting_types.STRING,
		text: `
Directory prefix where files are read from/written to.

::: info
The trailing \`/\` is not automatically added, so using e.g. \`/tmp/foo\` as
prefix will cause \`/tmp/foofilename\` to be created.
:::
`
	},

	fs_posix_mode: {
		tags: [ 'fs-posix' ],
		values: setting_types.UINT,
		default: '0600',
		text: `
Mode to use for creating files.`
	},

	fs_posix_autodelete_empty_directories: {
		tags: [ 'fs-posix' ],
		values: setting_types.BOOLEAN,
		default: 'yes',
		text: `
If the last file in a directory is deleted, should the parent directory be
automatically deleted?

::: info
Using this setting makes the POSIX filesystem behave more like an object
storage would.
:::

::: warning
This setting can cause the POSIX filesystem to also delete the parent directory
hierarchy farther up than anticipated.
:::`
	},

	fs_posix_fsync: {
		tags: [ 'fs-posix' ],
		values: setting_types.BOOLEAN,
		default: 'yes',
		text: `
Configure whether \`fsync()\` is called after writes to guarantee that the file
is written to disk.`
	},

	fs_posix_accurate_mtime: {
		advanced: true,
		tags: [ 'fs-posix' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Configure whether \`utimes()\` is called after writes to guarantee microsecond
precision timestamps for files. By default Linux updates the \`mtime\` only on
timer interrupts, which is not remotely close to microsecond precision.`
	},

	login_proxy_notify_path: {
		default: 'proxy-notify',
		values: setting_types.STRING,
		advanced: true,
		text: `
Path to proxy-notify pipe.

[[link,login_variables]] can be used.`
	},

	mail_cache_max_header_name_length: {
		added: {
			settings_mail_cache_max_header_name_length_added: false
		},
		default: 100,
		values: setting_types.UINT,
		advanced: true,
		text: `
Maximum header name length stored in the cache, where 0 stands for unlimited
(which is also the former behavior).

When enabled, the cache truncates the names to this length in memory and on
file. While the header name remains unchanged in the storage, all the headers
sharing the first [[setting,mail_cache_max_header_name_length]] prefix
characters are de facto aliased and will be considered as the same header on
cache fetch.

Also, attempting to fetch a specific aliased header will succeed even if
the header does not actually exist (this does NOT happen when the feature
is disable with explicitly with [[setting,mail_cache_max_header_name_length,0]])

Example: ([[setting,mail_cache_max_header_name_length,5]])

If the mail contains the header \`X-name: value\`, attempting to fetch
\`X-nam\` or \`X-names\` will also produce \`X-name: value\` as a result
(with the original header name, not the requested one).

Trying to fetch the mail text or the mail headers will properly return only
\`X-name: value\`.`
	},

	mail_cache_max_headers_count: {
		added: {
			settings_mail_cache_max_headers_count_added: false
		},
		default: 100,
		values: setting_types.UINT,
		advanced: true,
		text: `
Maximum number of headers in \`yes\`/\`temp\` cache decision before the cache
refuses to promote more header decisions from \`no\` to \`temp\`, where \`0\`
stands for unlimited (which is also the former behavior).

When entries are rejected, the event [[event,mail_cache_decision_rejected]]
is emitted.

Also, while the cache's headers count is saturated, the effective value of
[[setting,mail_cache_unaccessed_field_drop]] is reduced to 1/4 of
of the specified one, in order to aid the cache to return within the limits.`
	},

	mail_cache_max_size: {
		default: '1G',
		values: setting_types.SIZE,
		advanced: true,
		text: `
If \`dovecot.index.cache\` becomes larger than this, it's truncated
to empty size.

::: warning
The maximum value is 1 GB because the cache file format can't currently
support larger sizes.
:::`
	},

	mail_cache_min_mail_count: {
		default: 0,
		values: setting_types.UINT,
		advanced: true,
		text: `
Only update cache file when the mailbox contains at least this many messages.

With a setting other than \`0\`, you can optimize behavior for fewer disk
writes at the cost of more disk reads.`
	},

	mail_cache_purge_continued_percentage: {
		default: 200,
		values: setting_types.UINT,
		advanced: true,
		text: `
Compress the cache file when n% of records are deleted (by count, not by size).

For example \`200\` means that the record has 2 continued rows, i.e. it
exists in 3 separate segments in the cache file.`
	},

	mail_cache_purge_delete_percentage: {
		default: 20,
		values: setting_types.UINT,
		advanced: true,
		text: `
Compress the cache file when n% of records are deleted (by count, not by
size).`
	},

	mail_cache_purge_header_continue_count: {
		default: 4,
		values: setting_types.UINT,
		advanced: true,
		text: `
Compress the cache file when we need to follow more than n next_offsets to
find the latest cache header.`
	},

	mail_cache_purge_min_size: {
		default: '32k',
		values: setting_types.SIZE,
		advanced: true,
		text: `
Only compress cache file if it is larger than this size.`
	},

	mail_cache_record_max_size: {
		default: '64k',
		values: setting_types.SIZE,
		advanced: true,
		text: `
If a cache record becomes larger than this, don't add it to the cache file.`
	},

	mail_cache_unaccessed_field_drop: {
		default: '30days',
		seealso: [ '[[link,mail_cache]]' ],
		values: setting_types.TIME,
		advanced: true,
		text: `
Specifies when cache decisions are downgraded.

Change caching decision from YES to TEMP after this much time has passed.
Drop the field entirely after twice this much time has passed,
regardless of whether the cache decision was YES or TEMP previously.

If the cache header count is capped to
[[setting,mail_cache_max_headers_count]] then the effective value is reduced
to 1/4 of the configured value until enough headers expire for the cache to
fall back inside the limits.`
	},

	mail_index_log_rotate_max_size: {
		default: '1M',
		seealso: [ 'mail_index_log_rotate_min_age', 'mail_index_log_rotate_min_size' ],
		values: setting_types.SIZE,
		advanced: true,
		text: `
   Always rotate transaction log after it exceeds this size.`
	},

	mail_index_log_rotate_min_age: {
		default: '5mins',
		seealso: [ 'mail_index_log_rotate_max_size' ],
		values: setting_types.TIME,
		advanced: true,
		text: `
Rotate transaction log if it is older than this value and is larger than
[[setting,mail_index_log_rotate_min_size]].`
	},

	mail_index_log_rotate_min_size: {
		default: '32k',
		values: setting_types.SIZE,
		advanced: true,
		text: `
Rotate transaction log if it is larger than this size and is older than
[[setting,mail_index_log_rotate_min_age]].`
	},

	mail_index_log2_max_age: {
		default: '2days',
		values: setting_types.TIME,
		advanced: true,
		text: `
Delete \`.log.2\` index file when older than this value.

Older \`.log.2\` files are useful for QRESYNC and dsync, so this value
should not be too low.`
	},

	mail_index_rewrite_max_log_bytes: {
		default: '128k',
		seealso: [ 'mail_index_rewrite_min_log_bytes' ],
		values: setting_types.SIZE,
		advanced: true,
		text: `
Rewrite the index when the number of bytes that needs to be read from the
.log index file on refresh is between these min/max values.`
	},

	mail_index_rewrite_min_log_bytes: {
		default: '8k',
		seealso: [ 'mail_index_rewrite_max_log_bytes' ],
		values: setting_types.SIZE,
		advanced: true,
		text: `
Rewrite the index when the number of bytes that needs to be read from the
.log index file on refresh is between these min/max values.`
	},

	/* ManageSieve settings. */

	managesieve_client_workarounds: {
		tags: [ 'managesieve', 'sieve' ],
		values: setting_types.STRING,
		advanced: true,
		text: `
Enables various workarounds for ManageSieve clients. Currently there are
none.`
	},

	managesieve_implementation_string: {
		tags: [ 'managesieve', 'sieve' ],
		default: 'Dovecot Pigeonhole',
		values: setting_types.STRING,
		advanced: true,
		text: `
Sets the ManageSieve implementation string returned by the \`IMPLEMENTATION\`
capability.`
	},

	managesieve_logout_format: {
		tags: [ 'managesieve', 'sieve' ],
		default: 'bytes=%i/%o',
		values: setting_types.STRING_NOVAR,
		text: `
Specifies the string pattern used to compose the logout message of an
authenticated session. The following substitutions are available:

| Variable | Substitution |
| -------- | ------------ |
| \`%i\` | Total number of bytes read from client. |
| \`%o\` | Total number of bytes sent to client. |`
	},

	managesieve_max_compile_errors: {
		tags: [ 'managesieve', 'sieve' ],
		default: 5,
		values: setting_types.UINT,
		advanced: true,
		text: `
The maximum number of compile errors that are returned to the client upon
script upload or script verification.`
	},

	managesieve_max_line_length: {
		tags: [ 'managesieve', 'sieve' ],
		default: 65536,
		values: setting_types.UINT,
		advanced: true,
		text: `
The maximum ManageSieve command line length in bytes.

Since long command lines are very unlikely with ManageSieve, changing this
will generally not be useful.`
	},

	managesieve_notify_capability: {
		tags: [ 'managesieve', 'sieve' ],
		default: '<dynamically determined>',
		values: setting_types.STRING,
		advanced: true,
		text: `
\`NOTIFY\` capabilities reported by the ManageSieve service before
authentication.

If left unassigned, these will be assigned dynamically according to what
the Sieve interpreter supports by default (after login this may differ
depending on the authenticated user).`
	},

	managesieve_sieve_capability: {
		tags: [ 'managesieve', 'sieve' ],
		default: 'fileinto reject envelope encoded-character vacation subaddress comparator-i;ascii-numeric relational regex imap4flags copy include variables body enotify environment mailbox date index ihave duplicate mime foreverypart extracttext',
		values: setting_types.STRING,
		advanced: true,
		text: `
\`SIEVE\` capabilities reported by the ManageSieve service before
authentication.

If left unassigned, these will be assigned dynamically according to what
the Sieve interpreter supports by default (after login this may differ
depending on the authenticated user).`
	},

	/* Pigeonhole plugin settings. */

	sieve: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: 'file:~/sieve;active=~/.dovecot.sieve',
		seealso: [ '[[link,sieve_location]]' ],
		values: setting_types.STRING,
		text: `
The location of the user's main Sieve script or script storage.

The LDA Sieve plugin uses this to find the active script for Sieve
filtering at delivery.

The Sieve include extension uses this location for retrieving \`:personal\`
scripts.

This location is also where the ManageSieve service will store the user's
scripts, if supported by the location type.

For the file location type, the location will then be the path to the
storage directory for all the user's personal Sieve scripts.

ManageSieve maintains a symbolic link pointing to the currently active
script (the script executed at delivery).  The location of this symbolic
link can be configured using the \`;active=<path>\` option.`
	},

	sieve_after: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
This setting can be specified multiple times by adding a number after the
setting name, such as \`sieve_after2\` and so on.

[[link,sieve_location,Location]] of scripts that need to be executed after
the user's personal script.

If a [[link,sieve_file]] location path points to a directory, all
the Sieve scripts contained therein (with the proper .sieve extension) are
executed. The order of execution within that directory is determined by the
file names, using a normal 8bit per-character comparison.

Multiple script locations can be specified by appending an increasing
number to the setting name.

The Sieve scripts found from these locations are added to the script
execution sequence in the specified order.

Reading the numbered [[setting,sieve_before]] settings stops at the
first missing setting, so no numbers may be skipped.`
	},

	sieve_before: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ 'sieve_after' ],
		text: `
This setting can be specified multiple times by adding a number after the
setting name, such as \`sieve_before2\` and so on.

See [[setting,sieve_after]] for configuration details, as this
setting behaves the same way, except the scripts are run **before** user's
personal scripts (instead of **after**).`
	},

	sieve_default: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
[[link,sieve_location,Location]] of the default personal sieve script file
which gets executed ONLY if user's private Sieve script does not exist, e.g.
\`file:/var/lib/dovecot/default.sieve\` (check the
[[link,sieve_multiscript,multiscript section]]
for instructions on running global Sieve scripts before and after the user's
personal script).

This is usually a global script, so be sure to pre-compile the specified
script manually in that case using the sievec command line tool, as
explained by [[man,sievec]].`
	},

	sieve_default_name: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_visible_default_script]]' ],
		text: `
The name by which the default Sieve script is visible to ManageSieve
clients. Normally, it is not visible at all.`
	},

	sieve_discard: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
The location of a Sieve script that is run for any message that is about
to be discarded; i.e., it is not delivered anywhere by the normal Sieve
execution.

This only happens when the "implicit keep" is canceled, by e.g. the
"discard" action, and no actions that deliver the message are executed.

This "discard script" can prevent discarding the message, by executing
alternative actions.

If the discard script does nothing, the message is still discarded as it
would be when no discard script is configured.`
	},

	sieve_extensions: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: '<see description>',
		values: setting_types.STRING,
		text: `
The Sieve language extensions available to users.

By default, all supported extensions are available, except for deprecated
extensions, extensions that add the ability to change messages, extensions
that require explicit configuration, or extensions that are still under
development.

Some system administrators may want to disable certain Sieve extensions or
enable those that are not available by default.

Supported extensions are listed at [[link,sieve_extensions]].

This setting can use \`+\` and \`-\` to specify differences relative to the
default.

Example:

\`\`\`
# Enable the deprecated imapflags extension in addition to all
# extensions enabled by default.
plugin {
	sieve_extensions = +imapflags
}
\`\`\``
	},

	sieve_global: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
Location for \`:global\` include scripts for the Sieve include extension.`
	},

	sieve_global_extensions: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: '[[setting,sieve_extensions]]',
		values: setting_types.STRING,
		text: `
Which Sieve language extensions are **only** available in global scripts.

This can be used to restrict the use of certain Sieve extensions to
administrator control, for instance when these extensions can cause
security concerns.

This setting has higher precedence than [[setting,sieve_extensions]], meaning
that the extensions enabled with this setting are never available to the
user's personal script no matter what is specified for the
\`sieve_extensions\` setting.

The syntax of this setting is similar to \`sieve_extensions\`, with the
difference that extensions are enabled or disabled for exclusive use in
global scripts.

Currently, no extensions are marked as such by default.`
	},

	sieve_implicit_extensions: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
::: warning
Do not use this setting unless you really need to!
:::

The Sieve language extensions implicitly available to users.

The extensions listed in this setting do not need to be enabled explicitly
using the Sieve "require" command.

This behavior directly violates the Sieve standard, but can be necessary
for compatibility with some existing implementations of Sieve (notably
jSieve).

The syntax and semantics of this setting are otherwise identical to
[[setting,sieve_extensions]].`
	},

	sieve_max_actions: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: 32,
		values: setting_types.UINT,
		text: `
The maximum number of actions that can be performed during a single script
execution.

If set to \`0\`, no limit on the total number of actions is enforced.`
	},

	sieve_max_cpu_time: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: '30s',
		values: setting_types.TIME,
		text: `
The maximum amount of CPU time that a Sieve script is allowed to use while
executing. If the execution exceeds this resource limit, the script ends with
an error, causing the implicit "keep" action to be executed.

This limit is not only enforced for a single script execution, but also
cumulatively for the last executions within a configurable timeout
(see [[setting,sieve_resource_usage_timeout]]).`
	},

	sieve_max_redirects: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: 4,
		values: setting_types.UINT,
		text: `
The maximum number of redirect actions that can be performed during a
single script execution.

\`0\` means redirect is prohibited.`
	},

	sieve_resource_usage_timeout: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: '1h',
		values: setting_types.TIME,
		text: `
To prevent abuse, the Sieve interpreter can record resource usage of a Sieve
script execution in the compiled binary if it is significant. Currently, this
happens when CPU system + user time exceeds 1.5 seconds for one execution.
Such high resource usage is summed over time in the binary and once that
cumulative resource usage exceeds the limits ([[setting,sieve_max_cpu_time]]),
the Sieve script is disabled in the binary for future execution, even if an
individual execution exceeded no limits.

If the last time high resource usage was recorded is older than
[[setting,sieve_resource_usage_timeout]], the resource usage in the binary is
reset. This means that the Sieve script is only disabled when the limits are
cumulatively exceeded within this timeout. With the default configuration this
means that the Sieve script is only disabled when the total CPU time of Sieve
executions that lasted more than 1.5 seconds exceeds 30 seconds in the last
hour.

A disabled Sieve script can be reactivated by the user by uploading a new
version of the Sieve script after the excessive resource usage times out. An
administrator can force reactivation by forcing a script compile (e.g. using
the sievec command line tool).`
	},

	sieve_max_script_size: {
		tags: [ 'sieve', 'managesieve_quota', ],
		plugin: 'sieve',
		default: '1M',
		values: setting_types.SIZE,
		advanced: true,
		text: `
The maximum size of a Sieve script. The compiler will refuse to compile any
script larger than this limit.

If set to \`0\`, no limit on the script size is enforced.`
	},

	sieve_plugins: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
The Pigeonhole Sieve interpreter can have plugins of its own.

Using this setting, the used plugins can be specified. Plugin names should
be space-separated in the setting.

Check [[link,sieve_plugins]] for available plugins.`
	},

	sieve_redirect_envelope_from: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		default: 'sender',
		values: setting_types.STRING,
		text: `
Specifies what envelope sender address is used for redirected messages.

Normally, the Sieve \`redirect\` command copies the sender address for the
redirected message from the processed message  So, the redirected message
appears to originate from the original sender.

The following options are supported for this setting:

| Option | Description |
| ------ | ----------- |
| \`sender\` | The sender address is used |
| \`recipient\` | The final recipient address is used |
| \`orig_recipient\` | The original recipient is used |
| \`user_email\` | The user's primary address is used. This is configured with the [[setting,sieve_user_email]] setting. If that setting is not configured, \`user_email\` is equal to \`sender\`. |
| \`postmaster\` | The [[setting,postmaster_address]] configured for LDA/LMTP. |
| \`<user@domain>\` | Redirected messages are always sent from \`user@domain\`. The angle brackets are mandatory. The null \`<>\` address is also supported. |

When the envelope sender of the processed message is the null address
\`<>\`, the envelope sender of the redirected message is also always
\`<>\`, irrespective of what is configured for this setting.`
	},

	sieve_trace_addresses: {
		tags: [ 'sieve-trace' ],
		plugin: 'sieve',
		default: 'no',
		values: setting_types.BOOLEAN,
		seealso: [ '[[link,sieve_trace_debugging]]' ],
		text: `
Enables showing byte code addresses in the trace output, rather than only
the source line numbers.`
	},

	sieve_trace_debug: {
		tags: [ 'sieve-trace' ],
		plugin: 'sieve',
		default: 'no',
		values: setting_types.BOOLEAN,
		seealso: [ '[[link,sieve_trace_debugging]]' ],
		text: `
Enables highly verbose debugging messages that are usually only useful for
developers.`
	},

	sieve_trace_dir: {
		tags: [ 'sieve-trace' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_trace_debugging]]' ],
		text: `
The directory where trace files are written.

Trace debugging is disabled if this setting is not configured or if the
directory does not exist.

If the path is relative or it starts with \`~/\` it is interpreted relative
to the current user's home directory.`
	},

	sieve_trace_level: {
		tags: [ 'sieve-trace' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_trace_debugging]]' ],
		text: `
The verbosity level of the trace messages. Trace debugging is disabled if
this setting is not configured. Options are:

| Option | Description |
| ------ | ----------- |
| \`actions\` | Only print executed action commands, like keep, fileinto, reject, and redirect. |
| \`commands\` | Print any executed command, excluding test commands. |
| \`tests\` | Print all executed commands and performed tests. |
| \`matching\` |  Print all executed commands, performed tests and the values matched in those tests. |`
	},

	sieve_quota_max_scripts: {
		tags: [ 'sieve', 'managesieve_quota' ],
		plugin: 'sieve',
		default: 0,
		values: setting_types.UINT,
		text: `
The maximum number of personal Sieve scripts a single user can have.

Default is \`0\`, which is unlimited.`
	},

	sieve_quota_max_storage: {
		tags: [ 'sieve', 'managesieve_storage' ],
		plugin: 'sieve',
		default: 0,
		values: setting_types.UINT,
		text: `
The maximum amount of disk storage a single user's scripts may
occupy.

Default is \`0\`, which is unlimited.`
	},

	sieve_user_email: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
The primary e-mail address for the user.

This is used as a default when no other appropriate address is available
for sending messages.

If this setting is not configured, either the postmaster or null \`<>\`
address is used as a sender, depending on the action involved.

This setting is important when there is no message envelope to extract
addresses from, such as when the script is executed in IMAP.`
	},

	sieve_user_log: {
		tags: [ 'sieve' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		text: `
The path to the file where the user log file is written.
a default location is used.

If the main user's personal Sieve (as configured with [[setting,sieve]]
is a file, the logfile is set to \`<filename>.log\` by default.

If it is not a file, the default user log file is \`~/.dovecot.sieve.log\`.`
	},

	sieve_duplicate_default_period: {
		tags: [ 'sieve', 'sieve-duplicate' ],
		plugin: 'sieve',
		default: '14d',
		values: setting_types.TIME,
		seealso: [ '[[link,sieve_duplicate]]' ],
		advanced: true,
		text: `
Default period after which tracked values are purged from the duplicate
tracking database.`
	},

	sieve_duplicate_max_period: {
		tags: [ 'sieve', 'sieve-duplicate' ],
		plugin: 'sieve',
		default: '7d',
		values: setting_types.TIME,
		seealso: [ '[[link,sieve_duplicate]]' ],
		advanced: true,
		text: `
Maximum period after which tracked values are purged from the duplicate
tracking database.`
	},

	sieve_editheader_forbid_add: {
		tags: [ 'sieve', 'sieve-editheader' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_editheader]]' ],
		text: `
A space-separated list of headers that cannot be added to the message header.

Addition of the \`Subject:\` header cannot be prohibited, as required by
the RFC specification. Therefore, adding this header to this setting has no
effect.`
	},

	sieve_editheader_forbid_delete: {
		tags: [ 'sieve', 'sieve-editheader' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_editheader]]' ],
		text: `
A space-separated list of headers that cannot be deleted from the message
header.

Deleting the \`Received:\` and \`Auto-Submitted:\` fields is always
forbidden, while removing the \`Subject:\` header cannot be prohibited, as
required by the RFC specification. Therefore, adding one of these headers
to this setting has no effect.`
	},

	sieve_editheader_max_header_size: {
		tags: [ 'sieve', 'sieve-editheader' ],
		plugin: 'sieve',
		default: 2048,
		values: setting_types.UINT,
		seealso: [ '[[link,sieve_editheader]]' ],
		text: `
The maximum size in bytes of a header field value passed to the addheader
command.

The minimum value for this setting is \`1024\` bytes.`
	},

	sieve_editheader_protected: {
		tags: [ 'sieve', 'sieve-editheader' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_editheader]]' ],
		text: `
A space-separated list of headers that cannot be added to or deleted from
the message header.

This setting is provided for backwards compatibility.

It is a combination of the [[setting,sieve_editheader_forbid_add]] and
[[setting,sieve_editheader_forbid_delete]] settings. The same limitations
apply.`
	},

	sieve_notify_mailto_envelope_from: {
		tags: [ 'sieve', 'sieve-enotify' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ 'sieve_redirect_envelope_from', '[[link,sieve_enotify]]' ],
		text: `
Defines the source of the notification sender address for e-mail
notifications.`
	},

	sieve_include_max_includes: {
		tags: [ 'sieve', 'sieve-include' ],
		plugin: 'sieve',
		values: setting_types.UINT,
		default: 255,
		seealso: [ '[[link,sieve_include]]' ],
		advanced: true,
		text: `
The maximum number of scripts that may be included. This is the total
number of scripts involved in the include tree.`
	},

	sieve_include_max_nesting_depth: {
		tags: [ 'sieve', 'sieve-include' ],
		plugin: 'sieve',
		values: setting_types.UINT,
		default: 10,
		seealso: [ '[[link,sieve_include]]' ],
		advanced: true,
		text: `
The maximum nesting depth for the include tree.`
	},

	sieve_spamtest_max_header: {
		tags: [ 'sieve', 'sieve-spamtest' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		default: 10,
		seealso: [ '[[link,sieve_spamtest]]' ],
		text: `
Value format: \`<header-field> [ ":" <regexp> ]\`

Some spam scanners include the maximum score value in one of their status
headers. Using this setting, this maximum can be extracted from the message
itself instead of specifying the maximum manually using the setting
[[setting,sieve_spamtest_max_value]].

The syntax is identical to the [[setting,sieve_spamtest_status_header]]
setting.`
	},

	sieve_spamtest_max_value: {
		tags: [ 'sieve', 'sieve-spamtest' ],
		plugin: 'sieve',
		values: setting_types.UINT,
		seealso: [ '[[link,sieve_spamtest]]' ],
		text: `
This statically specifies the maximum value a numeric spam score can have.`
	},

	sieve_spamtest_status_header: {
		tags: [ 'sieve', 'sieve-spamtest' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_spamtest]]' ],
		text: `
Value format: \`<header-field> [ ":" <regexp> ]\`

This specifies the header field that contains the result information of the
spam scanner and it may express the syntax of the content of the header.

If no matching header is found in the message, the spamtest command will
match against \`0\`.

This is a structured setting. The first part specifies the header field
name.  Optionally, a POSIX regular expression follows the header field
name, separated by a colon. Any white space directly following the colon is
not part of the regular expression. If the regular expression is omitted,
any header content is accepted and the full header value is used. When a
regular expression is used, it must specify one match value (inside
brackets) that yields the desired spam scanner result.

If the header does not match the regular expression or if no value match is
found, the spamtest test will match against \`0\` during Sieve script
execution.`
	},

	sieve_spamtest_status_type: {
		tags: [ 'sieve', 'sieve-spamtest' ],
		plugin: 'sieve',
		values: setting_types.ENUM,
		values_enum: [ 'score', 'strlen', 'text' ],
		seealso: [ '[[link,sieve_spamtest]]' ],
		text: `
This specifies the type of status result that the spam/virus scanner
produces.

This can either be a numeric score \`(score)\`, a string of identical
characters \`(strlen)\`, e.g. \`'*******'\`, or a textual description
\`(text)\`, e.g. \`'Spam'\` or \`'Not Spam'\`.`
	},

	'sieve_spamtest_text_value<X>': {
		tags: [ 'sieve', 'sieve-spamtest' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_spamtest]]' ],
		text: `
When the [[setting,sieve_spamtest_status_type]] setting is set to
\`text\`, these settings specify that the spamtest test will match against
the value \`<X>\` when the specified string is equal to the text (extracted)
from the status header.

For spamtest and spamtestplus, values of X between 0 and 10 are
recognized, while virustest only uses values between 0 and 5.`,
	},

	'sieve_vacation_default_period': {
		tags: [ 'sieve', 'sieve-vacation' ],
		plugin: 'sieve',
		default: '7d',
		values: setting_types.TIME,
		seealso: [ '[[link,sieve_vacation]]' ],
		text: `
Specifies the default period that is used when no \`:days\` or \`:seconds\`
tag is specified.

The configured value must lie between [[setting,sieve_vacation_min_period]]
and [[setting,sieve_vacation_max_period]].`
	},

	sieve_vacation_dont_check_recipient: {
		tags: [ 'sieve', 'sieve-vacation' ],
		plugin: 'sieve',
		default: 'no',
		values: setting_types.BOOLEAN,
		seealso: [ '[[link,sieve_vacation]]' ],
		text: `
This disables the checks for implicit delivery entirely. This means that
the vacation command does not verify that the message is explicitly
addressed at the recipient.

Use this option with caution. Specifying \`yes\` will violate the Sieve
standards and can cause vacation replies to be sent for messages not
directly addressed at the recipient.`
	},

	sieve_vacation_max_period: {
		tags: [ 'sieve', 'sieve-vacation' ],
		plugin: 'sieve',
		default: 0,
		values: setting_types.TIME,
		seealso: [ '[[link,sieve_vacation]]' ],
		text: `
Specifies the maximum period that can be specified for the \`:days\` tag of
the vacation command.

The configured value must be larger than [[setting,sieve_vacation_min_period]].

A value of \`0\` has a special meaning: it indicates that there is no upper
limit.`
	},

	sieve_vacation_min_period: {
		tags: [ 'sieve', 'sieve-vacation' ],
		plugin: 'sieve',
		default: '1d',
		values: setting_types.TIME,
		seealso: [ '[[link,sieve_vacation]]' ],
		text: `
Specifies the minimum period that can be specified for the \`:days\` and
\`:seconds\` tags of the vacation command.

A minimum of \`0\` indicates that users are allowed to make the Sieve
interpreter send a vacation response message for every incoming message
that meets the other reply criteria (refer to [[rfc,5230]]). A value of zero
is not recommended.`
	},

	sieve_vacation_send_from_receipt: {
		tags: [ 'sieve', 'sieve-vacation' ],
		plugin: 'sieve',
		default: 'no',
		values: setting_types.BOOLEAN,
		seealso: [ '[[link,sieve_vacation]]' ],
		text: `
This setting determines whether vacation messages are sent with the SMTP
\`MAIL FROM\` envelope address set to the recipient address of the Sieve
script owner.

Normally this is set to \`<>\`, which is the default as recommended in the
specification. This is meant to prevent mail loops. However, there are
situations for which a valid sender address is required and this setting
can be used to accommodate for those.`
	},

	sieve_vacation_use_original_recipient: {
		tags: [ 'sieve', 'sieve-vacation' ],
		plugin: 'sieve',
		default: 'no',
		values: setting_types.BOOLEAN,
		seealso: [ '[[link,sieve_vacation]]' ],
		text: `
This specifies whether the original envelope recipient should be used in
the check for implicit delivery.

The vacation command checks headers of the incoming message, such as
\`To:\` and \`Cc:\` for the address of the recipient, to verify that the
message is explicitly addressed at the recipient. If the recipient address
is not found, the vacation action will not trigger a response to prevent
sending a reply when it is not appropriate.

Normally only the final recipient address is used in this check. This
setting allows including the original recipient specified in the SMTP
session if available.

This is useful to handle mail accounts with aliases. Use this option with
caution: if you are using aliases that point to more than a single account,
as senders can get multiple vacation responses for a single message.

Use the [[link,lda]] \`-a\`
option or the LMTP/LDA [[setting,lda_original_recipient_header]] setting to
make the original SMTP recipient available to Sieve.`
	},

	sieve_variables_max_scope_size: {
		tags: [ 'sieve', 'sieve-variables' ],
		plugin: 'sieve',
		default: 255,
		values: setting_types.UINT,
		seealso: [ '[[link,sieve_vacation]]' ],
		advanced: true,
		text: `
The maximum number of variables that can be declared in a scope.

There are currently two variable scopes: the normal script scope and the
global scope created by the [[link,sieve_include]].

The minimum value for this setting is \`128\`.`
	},

	sieve_variables_max_variable_size: {
		tags: [ 'sieve', 'sieve-variables' ],
		plugin: 'sieve',
		default: '4k',
		values: setting_types.SIZE,
		seealso: [ '[[link,sieve_variables]]' ],
		advanced: true,
		text: `
The maximum allowed size for the value of a variable. If exceeded at
runtime, the value is always truncated to the configured maximum.

The minimum value for this setting is \`4000 bytes\`.`
	},

	sieve_virustest_max_header: {
		tags: [ 'sieve', 'sieve-virustest' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_virustest]]' ],
		text: `
Value Format: \`<header-field> [ ":" <regexp> ]\`

Some spam scanners include the maximum score value in one of their status
headers. Using this setting, this maximum can be extracted from the message
itself instead of specifying the maximum manually using the setting
[[setting,sieve_virustest_max_value]].

The syntax is identical to [[setting,sieve_virustest_status_header]].`
	},

	sieve_virustest_max_value: {
		tags: [ 'sieve', 'sieve-virustest' ],
		plugin: 'sieve',
		values: setting_types.UINT,
		seealso: [ '[[link,sieve_virustest]]' ],
		text: `
This statically specifies the maximum value a numeric spam score can have.`
	},

	sieve_virustest_status_header: {
		tags: [ 'sieve', 'sieve-virustest' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_virustest]]' ],
		text: `
Value Format: \`<header-field> [ ":" <regexp> ]\`

This specifies the header field that contains the result information of the
spam scanner and it may express the syntax of the content of the header.

If no matching header is found in the message, the spamtest command will
match against \`0\`.

This is a structured setting. The first part specifies the header field
name. Optionally, a POSIX regular expression follows the header field name,
separated by a colon. Any white space directly following the colon is not
part of the regular expression. If the regular expression is omitted, any
header content is accepted and the full header value is used. When a
regular expression is used, it must specify one match value (inside
brackets) that yields the desired spam scanner result.

If the header does not match the regular expression or if no value match is
found, the spamtest test will match against \`0\` during Sieve script
execution.`
	},

	sieve_virustest_status_type: {
		tags: [ 'sieve', 'sieve-virustest' ],
		plugin: 'sieve',
		values: setting_types.ENUM,
		values_enum: [ 'score', 'strlen', 'text' ],
		seealso: [ '[[link,sieve_virustest]]' ],
		text: `
This specifies the type of status result that the spam/virus scanner produces.

This can either be a numeric score \`(score)\`, a string of identical
characters \`(strlen)\`, e.g. \`'*******'\`, or a textual description
\`(text)\`, e.g. \`'Spam'\` or \`'Not Spam'\`.`
	},

	'sieve_virustest_text_value<X>': {
		tags: [ 'sieve', 'sieve-virustest' ],
		plugin: 'sieve',
		values: setting_types.STRING,
		seealso: [ '[[link,sieve_virustest]]' ],
		text: `
When the [[setting,sieve_virustest_status_type]] setting is set to
\`text\`, these settings specify that the spamtest test will match against
the value \`<X>\` when the specified string is equal to the text (extracted)
from the status header.

For spamtest and spamtestplus, values of X between 0 and 10 are recognized,
while virustest only uses values between 0 and 5.`
	},

	/* imapsieve plugin */

	'imapsieve_mailbox<XXX>_after': {
		plugin: 'imap-sieve',
		values: setting_types.STRING,
		seealso: [ '[[plugin,sieve-imapsieve]]' ],
		text: `
Points to a directory relative to the [[setting,base_dir]] where
the plugin looks for script service sockets.

The \`XXX\` in this setting is a sequence number, which allows configuring
multiple associations between Sieve scripts and mailboxes.`
	},

	'imapsieve_mailbox<XXX>_before': {
		plugin: 'imap-sieve',
		values: setting_types.STRING,
		seealso: [ '[[plugin,sieve-imapsieve]]' ],
		text: `
When an IMAP event of interest occurs, this sieve script is executed before
any user script respectively.

This setting each specify the location of a single sieve script. The
semantics of this setting is similar to [[setting,sieve_before]]: the
specified scripts form a sequence together with the user script in which
the next script is only executed when an (implicit) keep action is
executed.

The \`XXX\` in this setting is a sequence number, which allows configuring
multiple associations between Sieve scripts and mailboxes.`
	},

	'imapsieve_mailbox<XXX>_causes': {
		plugin: 'imap-sieve',
		values: setting_types.STRING,
		values_enum: [ 'APPEND', 'COPY', 'FLAG' ],
		seealso: [ '[[plugin,sieve-imapsieve]]' ],
		text: `
Only execute the administrator Sieve scripts for the mailbox configured
with [[setting,imapsieve_mailbox\<XXX\>_name]] when one of the listed
\`IMAPSIEVE\` causes apply.

This has no effect on the user script, which is always executed no matter
the cause.

The \`XXX\` in this setting is a sequence number, which allows configuring
multiple associations between Sieve scripts and mailboxes.`
	},

	'imapsieve_mailbox<XXX>_from': {
		plugin: 'imap-sieve',
		values: setting_types.STRING,
		seealso: [ '[[plugin,sieve-imapsieve]]' ],
		text: `
Only execute the administrator Sieve scripts for the mailbox configured
with [[setting,imapsieve_mailbox<XXX>_name]] when the message
originates from the indicated mailbox.

This setting supports wildcards with a syntax compatible with the \`IMAP
LIST\` command, meaning that this setting can apply to multiple or even
all \`("*")\` mailboxes.

The \`XXX\` in this setting is a sequence number, which allows configuring
multiple associations between Sieve scripts and mailboxes.`
	},

	'imapsieve_mailbox<XXX>_name': {
		plugin: 'imap-sieve',
		values: setting_types.STRING,
		seealso: [ '[[plugin,sieve-imapsieve]]' ],
		text: `
This setting configures the name of a mailbox for which administrator
scripts are configured.

The \`XXX\` in this setting is a sequence number, which allows configuring
multiple associations between Sieve scripts and mailboxes.

All \`imapsieve_mailbox<XXX>_*\` settings with matching sequence numbers apply
to the mailbox named by this setting.

The sequence of configured mailboxes ends at the first missing
\`imapsieve_mailbox<XXX>_name\` setting.

This setting supports wildcards with a syntax compatible with the \`IMAP
LIST\` command, meaning that this setting can apply to multiple or even
all \`("*")\` mailboxes.`
	},

	imapsieve_url: {
		plugin: 'imap-sieve',
		values: setting_types.URL,
		seealso: [ '[[plugin,sieve-imapsieve]]' ],
		text: `
If set, support for user Sieve scripts in IMAP is enabled.

The value is an URL pointing to the ManageSieve server that users must use
to upload their Sieve scripts.

Leave this setting empty if you don't want users to have the ability to
associate Sieve scripts with mailboxes.

This has no effect on the administrator-controlled Sieve scripts.

\`\`\`
plugin {
  imapsieve_url = sieve://sieve.example.com
}
\`\`\``
	},

	/* sieve_extprograms plugin */

	'sieve_<extension>_socket_dir': {
		plugin: 'sieve-extprograms',
		values: setting_types.STRING,
		text: `
Points to a directory relative to the [[setting,base_dir]] where
the plugin looks for script service sockets.

"&lt;extension&gt;" in the setting name is replaced by either
\`pipe\`, \`filter\` or \`execute\` depending on which extension is
being configured.`
	},

	'sieve_<extension>_bin_dir': {
		plugin: 'sieve-extprograms',
		values: setting_types.STRING,
		text: `
Points to a directory where the plugin looks for programs (shell
scripts) to execute directly and pipe messages to.

"&lt;extension&gt;" in the setting name is replaced by either
\`pipe\`, \`filter\` or \`execute\` depending on which extension is
being configured.`
	},

	'sieve_<extension>_exec_timeout': {
		default: '10s',
		plugin: 'sieve-extprograms',
		values: setting_types.TIME,
		text: `
Configures the maximum execution time after which the program is
forcibly terminated.

"&lt;extension&gt;" in the setting name is replaced by either
\`pipe\`, \`filter\` or \`execute\` depending on which extension is
being configured.`
	},

	'sieve_<extension>_input_eol': {
		default: 'crlf',
		plugin: 'sieve-extprograms',
		values: setting_types.ENUM,
		values_enum: [ 'crlf', 'lf' ],
		text: `
Determines the end-of-line character sequence used for the data piped
to external programs. The default is currently "crlf", which
represents a sequence of the carriage return (CR) and line feed (LF)
characters. This matches the Internet Message Format ([[rfc,5322]]) and
what Sieve itself uses as a line ending. Set this setting to "lf" to
use a single LF character instead.

"&lt;extension&gt;" in the setting name is replaced by either
\`pipe\`, \`filter\` or \`execute\` depending on which extension is
being configured.`
	},

	/* acl plugin */

	acl: {
		added: {
			settings_acl_global_settings_added: false,
		},
		plugin: 'acl',
		values: setting_types.NAMED_FILTER,
		seealso: [ 'acl_id' ,'acl_rights' ],
		text: `
Specifies an ACL entry on global, namespace or mailbox level. The filter name
refers to the [[setting,acl_id]] setting.

Has two settings:

[[setting, acl_id]]
:    The identifier in ACL.

[[setting,acl_rights]]
:   The permission to grant - or deny - for this user.`
	},

	acl_driver: {
		added: {
			settings_acl_global_settings_added: false,
		},
		plugin: 'acl',
		values: setting_types.STRING,
		text: `
The ACL driver to use. This setting is **REQUIRED** - if empty, the acl
plugin is disabled.

Currently, there is a single driver available: \`vfile\`. This driver
supports two ways of defining the ACL configuration:

- *global*: ACL rules are applied to all users.

- *per-mailbox*: Each mailbox has separate ACL rules. They are stored in a
  \`dovecot-acl\` file in each mailbox (or [[setting,mail_control_path]])
  directory. This is the default.`
	},

	acl_id: {
		added: {
			settings_acl_global_settings_added: false,
		},
		plugin: 'acl',
		values: setting_types.STRING,
		seealso: [ 'acl', '[[link,acl_file_format]]' ],
		text: `
Specifies identity to match. See [[link,acl_file_format]] for values. The
[[setting,acl]] filter name refers to this setting.`
	},

	acl_rights: {
		added: {
			settings_acl_global_settings_added: false,
		},
		plugin: 'acl',
		values: setting_types.STRING,
		seealso: [ 'acl', '[[link,acl_file_format]]' ],
		text: `
Specifies rights for this acl. See [[link,acl_file_format]] for values. This is
usually used in [[setting,acl]] block.`
	},

	acl_global_path: {
		added: {
			settings_acl_global_settings_added: false,
		},
		plugin: 'acl',
		values: setting_types.STRING,
		seealso: [ 'acl' ],
		text: `
Location of global ACL configuration file. This option is deprecated, you
should use [[setting,acl]] instead.`
	},

	acl_defaults_from_inbox: {
		default: 'no',
		plugin: 'acl',
		values: setting_types.BOOLEAN,
		text: `
If enabled, the default ACLs for private and shared namespaces (but not
public namespaces) are taken from the INBOX. This means that giving
somebody access to your INBOX will give them access to all your other
mailboxes as well, unless the specific mailboxes' ACLs override the
INBOX's.`
	},

	acl_globals_only: {
		default: 'no',
		plugin: 'acl',
		values: setting_types.BOOLEAN,
		text: `
If enabled, don't try to find \`dovecot-acl\` files from mailbox
directories. This reduces unnecessary disk I/O when only global ACLs are
used.`
	},

	acl_groups: {
		plugin: 'acl',
		values: setting_types.STRING,
		text: `
A comma-separated string which contains all the groups the user belongs to.

A user's UNIX groups have no effect on ACLs (you can enable them by using a
special [[link,post_login_scripting]].

The default ACL for mailboxes is to give the mailbox owner all permissions
and other users none. Mailboxes in public namespaces don't have owners, so
by default no one can access them.`
	},

	acl_ignore: {
		added: {
			settings_acl_global_settings_added: false,
		},
		plugin: 'acl',
		values: setting_types.BOOLEAN,
		text: `
Can be used in global config, namespace, or mailbox level to ignore ACLs.

\`\`\`[dovecot.conf]
namespace ignore {
  acl_ignore = yes
}
\`\`\``
	},

	acl_sharing_map: {
		added: {
			settings_acl_global_settings_added: false,
		},
		plugin: 'acl',
		values: setting_types.NAMED_FILTER,
		seealso: [ '[[link,dict]]' ],
		text: `
A shared mailbox dictionary that defines which users may LIST mailboxes
shared by other users.

See [[link, shared_mailboxes_listing]] for further details on the contents
of the dictionary entries.

Example:

\`\`\`[dovecot.conf]
acl_sharing_map {
  dict file {
    path = /var/lib/dovecot/shared-mailboxes
  }
}
\`\`\``
	},

	acl_user: {
		plugin: 'acl',
		values: setting_types.STRING,
		seealso: [ '[[link,acl_master_users]]' ],
		text: `
See [[setting,auth_master_user_separator]] for the format of this setting.`
	},

	/* apparmor plugin */

	apparmor_hats: {
		plugin: 'apparmor',
		values: setting_types.BOOLLIST,
		text: `
List of AppArmor "hats" to change to when a user is loaded.

Example:

\`\`\`
apparmor_hats {
  hat_name = yes
  another_hat = yes
}
\`\`\``
	},

	/* charset-alias plugin */

	charset_aliases: {
		plugin: 'charset-alias',
		values: setting_types.STRLIST,
		text: `
List of \`<from>=<to>\` charsets. The "from" charsets
will be treated as "to" charsets when decoding to UTF-8.

Example:

\`\`\`
charset_aliases {
  shift_jis = sjis-win
  euc-jp = eucjp-win
  iso-2022-jp = iso-2022-jp-3
}
\`\`\``
	},

	/* fts plugin */

	fts: {
		plugin: 'fts',
		values: setting_types.NAMED_LIST_FILTER,
		text: `
Configures the used fts driver to perform [[plugin,fts]] indexing. If not
specified, FTS is disabled. The filter name refers to the
[[setting,fts_driver]] setting.

Example:

\`\`\`[dovecot.conf]
fts solr {
  # ...
}
\`\`\``
	},

	fts_autoindex: {
		default: 'no',
		plugin: 'fts',
		seealso: [ 'fts_autoindex_max_recent_msgs' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, index mail as it is delivered or appended.

It can be overridden at the mailbox level, e.g. you can disable autoindexing
for selected mailboxes using this setting:

Example:

\`\`\`[dovecot.conf]
fts_autoindex = yes

# ...

mailbox trash {
  special_use = \Trash
  fts_autoindex = no
}

mailbox spam {
  special_use = \Junk
  fts_autoindex = no
}

mailbox storage/* {
  fts_autoindex = no
}
\`\`\``
	},

	fts_autoindex_max_recent_msgs: {
		default: 0,
		plugin: 'fts',
		seealso: [ 'fts_autoindex' ],
		values: setting_types.UINT,
		text: `
To exclude infrequently accessed mailboxes from automatic indexing, set
this value to the maximum number of \`\Recent\` flagged messages that exist
in the mailbox.

A value of \`0\` means to ignore this setting.

Mailboxes with more flagged \`\Recent\` messages than this value will not
be autoindexed, even though they get deliveries or appends. This is useful
for, e.g., inactive Junk folders.

Any folders excluded from automatic indexing will still be indexed, if a
search on them is performed.

Example:

\`\`\`[dovecot.conf]
fts_autoindex_max_recent_msgs = 999
\`\`\``
	},

	fts_decoder_driver: {
		plugin: 'fts',
		values: setting_types.ENUM,
		values_enum: [ 'script', 'tika' ],
		text: `
Optional setting. If set, decode attachments to plaintext using the selected
service and index the resulting plaintext.`
	},

	fts_decoder_script_socket_path: {
		changed: {
			settings_fts_decoder_script_socket_path_changed: `
Renamed from \`fts_decoder\`.`
		},
		plugin: 'fts',
		values: setting_types.STRING,
		text: `
Name of the script service used to decode the attachments.

See the \`decode2text.sh\` script included in Dovecot for how to use this.

Example:

\`\`\`
plugin {
  fts_decoder = decode2text
}

service decode2text {
  executable = script /usr/lib/dovecot/decode2text.sh
  user = vmail
  unix_listener decode2text {
	mode = 0666
  }
}
\`\`\``
	},

	fts_driver: {
		plugin: 'fts',
		values: setting_types.ENUM,
		values_enum: [ 'dovecot', 'solr', 'flatcurve' ],
		text: `
Configures the used fts driver to perform [[plugin,fts]] indexing. The
[[setting,fts]] filter name refers to this setting.`
	},

	fts_search_add_missing: {
		plugin: 'fts',
		values: setting_types.ENUM,
		values_enum: [ 'body-search-only', 'yes' ],
		default: 'body-search-only',
		text: `
Should missing mails be added to FTS indexes before search?

With \`body-search-only\` this is done only when the search query requests
searching message bodies, i.e. header searches are not updating the FTS index.

The unindexed mails are searched without FTS, i.e. either getting the headers
from \`dovecot.index.cache\` or by opening the emails if the headers aren't in
cache. This may be a useful optimization if the user's client only uses header
searches.

::: info
Only the \`yes\` option guarantees consistent search results. Otherwise it's
possible that the search results will be different depending on whether the
search was performed via FTS index or not.
:::`
	},

	fts_search_read_fallback: {
		plugin: 'fts',
		values: setting_types.BOOLEAN,
		default: 'yes',
		text: `
If FTS lookup or indexing fails, fall back to searching without FTS (i.e.
possibly opening all emails). This may timeout for large mailboxes and/or slow
storage.`
	},

	fts_header_excludes: {
		plugin: 'fts',
		values: setting_types.BOOLLIST,
		text: `
The list of headers to include or exclude.

- The default is the preexisting behavior, i.e. index all headers.
- \`includes\` take precedence over \`excludes\`: if a header matches both,
  it is indexed.
- The terms are case insensitive.
- An asterisk \`*\` at the end of a header name matches anything starting
	 with that header name.
- The asterisk can only be used at the end of the header name.
  Prefix and infix usage of asterisk are not supported.

Example:

\`\`\`[dovecot.conf]
fts_header_excludes {
  Received = yes
  DKIM-* = yes
  X-* = yes
  Comments = yes
}

fts_header_includes {
  X-Spam-Status = yes
  Comments = yes
}
\`\`\`

- \`Received\` headers, all \`DKIM-\` headers and all \`X-\` experimental
  headers are excluded, with the following exceptions:

  - \`Comments\` and \`X-Spam-Status\` are indexed anyway, as they match
    **both** \`excludes\` and \`includes\` lists.
  - All other headers are indexed.

Example:

\`\`\`[dovecot.conf]
fts_header_excludes {
  * = yes
}

fts_header_includes {
  From = yes
  To = yes
  Cc = yes
  Bcc = yes
  Subject = yes
  Message-ID = yes
  In-* = yes
  X-CustomApp-* = yes
}
\`\`\`

- No headers are indexed, except those specified in the \`includes\`.
`
	},

	fts_header_includes: {
		plugin: 'fts',
		values: setting_types.BOOLLIST,
		seealso: [ 'fts_header_excludes' ],
		text: ``
	},

	fts_index_timeout: {
		default: 0,
		plugin: 'fts',
		values: setting_types.UINT,
		text: `
When the full text search driver detects that the index isn't up-to-date,
the indexer is told to index the messages and is given this much time to do
so. If this time limit is reached, an error is returned, indicating that
the search timed out during waiting for the indexing to complete:
\`NO [INUSE] Timeout while waiting for indexing to finish\`.

A value of \`0\` means no timeout.`
	},

	fts_message_max_size: {
		default: 0,
		added: {
			settings_fts_message_max_size_added: false,
		},
		plugin: 'fts',
		values: setting_types.SIZE,
		text: `Maximum body size that is processed by fts. \`0\` means unlimited.`
	},

	fts_decoder_tika_url: {
		added: {
			settings_fts_tika_changed_auth: `
Basic authentication support (via URL) is added.`
		},
		changed: {
			settings_fts_decoder_tika_url_changed: `
Renamed from \`fts_tika\`.`
		},
		plugin: 'fts',
		values: setting_types.STRING,
		text: `
URL for [Apache Tika](https://tika.apache.org/) decoder for attachments.

Example:

\`\`\`[dovecot.conf]
fts_decoder_driver = tika
fts_decoder_tika_url = http://tikahost:9998/tika/
\`\`\``
	},

	textcat_config_path: {
		plugin: 'fts',
		default: '<textcat dir>',
		values: setting_types.STRING,
		seealso: [ 'language' ],
		text: `
Path to the textcat/exttextcat configuration file, which lists the
supported languages.

This is recommended to be changed to point to a minimal version of a
configuration that supports only the languages listed in
[[setting,language]].

Doing this improves language detection performance during indexing and also
makes the detection more accurate.

Example:

\`\`\`
textcat_config_path = /usr/share/libexttextcat/fpdb.conf
\`\`\``
	},

	language: {
		plugin: 'fts',
		default: '<textcat dir>',
		values: setting_types.NAMED_LIST_FILTER,
		dependencies: [ 'language_default' ],
		seealso: [ 'textcat_config_path', '[[link,fts_tokenization]]' ],
		text: `
Defines a language to be used in tokenization.

At least one language must be specified and one single language must be flagged
as the default language using [[setting,language_default,yes]].

The language listed first is the default and is used when language
recognition fails.

The filters used for stemming and stopwords are language dependent.

::: tip
For better performance it's recommended to synchronize this setting with the
textcat configuration file; see [[setting,textcat_config_path]].
:::

Example:

\`\`\`[dovecot.conf]
language en {
  default = yes
}
language de {
}
\`\`\``
	},

	language_default: {
		plugin: 'fts',
		values: setting_types.BOOLEAN,
		default: 'no',
		dependencies: [ 'language' ],
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
The language marked as default will be used when language detection cannot
identify the proper language of the text being processed.

Exactly one language must be marked with this flag.`
	},

	language_filters: {
		plugin: 'fts',
		values: setting_types.BOOLLIST,
		seealso: [
			'[[link,fts_tokenization]]',
			'[[link,fts_filter_configuration]]',
		],
		text: `
The list of filters to apply.

Language specific filter chains can be specified with
\`language_filters_<lang>\` (e.g. \`language_filters_en\`).

See [[link,fts_filter_configuration]] for configuration information.`
	},

	language_tokenizers: {
		plugin: 'fts',
		values: setting_types.BOOLLIST,
		default: 'generic email-address',
		seealso: [
			'[[link,fts_tokenization]]',
			'[[link,fts_tokenizer_configuration]]',
		],
		text: `
The list of tokenizers to use.

This setting can be overridden for specific tokenizers by using
\`language_tokenizer_<lang>\` (e.g. \`language_tokenizer_generic\`).

See [[link,fts_tokenizer_configuration]] for configuration information.`
	},

	language_filter_normalizer_icu_id: {
		plugin: 'fts',
		tags: [ 'language-filter-normalizer-icu' ],
		values: setting_types.STRING,
		default: `Any-Lower; NFKD; [: Nonspacing Mark :] Remove; [\\x20] Remove`,
		text: `
Description of the normalizing/transliterating rules to use.

See
[Normalizer Format](https://unicode-org.github.io/icu/userguide/transforms/general/#transliterator-identifiers)
for syntax.`
	},

	language_filter_stopwords_dir: {
		plugin: 'fts',
		tags: [ 'language-filter-stopwords-dir' ],
		values: setting_types.STRING,
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
Path to the directory containing stopword files. The files inside the directory
have names with the form \`/stopwords_<lang>.txt\`.

See [[link,fts_languages]] for the list of stopword files that are currently
distributed with Dovecot.

More languages can be obtained from:
* [Apache Lucene](https://lucene.apache.org/),
* [Snowball stemmer](https://snowballstem.org/), or
* [GitHub - Stopwords ISO](https://github.com/stopwords-iso/).`
	},

	language_tokenizer_address_token_maxlen: {
		plugin: 'fts',
		tags: [ 'language-tokenizer-email-address' ],
		values: setting_types.UINT,
		default: 250,
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
Maximum length of token, before an arbitrary cut off is made.`
	},

	language_tokenizer_generic_algorithm: {
		plugin: 'fts',
		tags: [ 'language-tokenizer-generic' ],
		values: setting_types.ENUM,
		values_enum: [ 'simple', 'tr29' ],
		default: 'simple',
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
Defines the method for finding word boundaries.

| Value | Description |
| --- | --- |
| \`simple\` | Faster algorithm that works for many texts, especially using the latin alphabets, but leaves corner cases. |
| \`tr29\` | Implements a version of Unicode technical report 29 word boundary lookup. It might work better with texts containing e.g. Katakana or Hebrew characters, but it is not possible to use a single algorithm for all existing languages. |`
	},

	language_tokenizer_generic_token_maxlen: {
		plugin: 'fts',
		tags: [ 'language-tokenizer-generic' ],
		values: setting_types.UINT,
		default: 30,
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
Maximum length of token, before an arbitrary cut off is made.`
	},

	language_tokenizer_generic_wb5a: {
		plugin: 'fts',
		tags: [ 'language-tokenizer-generic' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
Unicode TR29 rule WB5a setting to the tr29 tokenizer. Splits prefixing
contracted words from base word. E.g. \`l'homme\` -> \`l\` and \`homme\`.
Together with a language specific stopword list unnecessary contractions can
thus be filtered away. This is disabled by default and only works with the TR29
algorithm.

Enable by declaring:
* [[setting,language_tokenizer_generic_algorithm,tr29]] and
* [[setting,language_tokenizer_generic_wb5a,yes]].`
	},

	language_tokenizer_kuromoji_icu_id: {
		plugin: 'fts',
		values: setting_types.STRING,
		default: 'Any-NFKC',
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
Description of the normalizing/transliterating rules to use. See
[Normalizer Format](https://unicode-org.github.io/icu/userguide/transforms/general/#transliterator-identifiers)
for syntax.

Defaults to \`Any-NFKC\` which is quite good for CJK text mixed with latin
alphabet languages. It transforms CJK characters to full-width encoding and
transforms latin ones to half-width. The NFKC transformation is described
above.

::: warning
If this setting is changed, existing FTS indexes will produce unexpected
results. The FTS indexes should be recreated in this case.
:::`
	},

	language_tokenizer_kuromoji_split_compounds: {
		plugin: 'fts',
		advanced: true,
		values: setting_types.BOOLEAN,
		default: 'yes',
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
This setting enables \`search mode\` in the Atilika Kuromoji library. The
setting defaults to enabled and should not be changed unless there is a
compelling reason.

::: warning
If this setting is changed, existing FTS indexes will produce unexpected
results. The FTS indexes should be recreated in this case.
:::`
	},

	language_tokenizer_kuromoji_token_maxlen: {
		plugin: 'fts',
		values: setting_types.UINT,
		default: 1024,
		seealso: [ '[[link,fts_tokenization]]' ],
		text: `
Maximum length of token, before an arbitrary cut off is made.`
	},

	/* fts-flatcurve plugin */

	fts_flatcurve_commit_limit: {
		default: 500,
		values: setting_types.UINT,
		plugin: 'fts-flatcurve',
		advanced: true,
		text: `
Commit database changes after this many documents are updated. Higher commit
limits will result in faster indexing for large transactions (i.e. indexing
a large mailbox) at the expense of high memory usage. The default value
should be sufficient to allow indexing in a 256 MB maximum size process.

Set to \`0\` to use the Xapian default.`
	},

	fts_flatcurve_max_term_size: {
		default: 30,
		values: setting_types.UINT,
		plugin: 'fts-flatcurve',
		advanced: true,
		text: `
The maximum number of characters in a term to index.

The maximum value for this setting is \`200\`.`
	},

	fts_flatcurve_min_term_size: {
		default: 2,
		values: setting_types.UINT,
		plugin: 'fts-flatcurve',
		advanced: true,
		text: `The minimum number of characters in a term to index.`
	},

	fts_flatcurve_optimize_limit: {
		default: 10,
		values: setting_types.UINT,
		plugin: 'fts-flatcurve',
		advanced: true,
		text: `
Once the database reaches this number of shards, automatically optimize the
DB at shutdown.

Set to \`0\` to disable auto-optimization.`
	},

	fts_flatcurve_rotate_count: {
		default: 5000,
		values: setting_types.UINT,
		plugin: 'fts-flatcurve',
		advanced: true,
		text: `
When the "current" fts database reaches this number of messages, it is
rotated to a read-only database and replaced by a new write DB. Most people
should not change this setting.

Set to \`0\` to disable rotation.`
	},

	fts_flatcurve_rotate_time: {
		default: 5000,
		values: setting_types.TIME_MSECS,
		plugin: 'fts-flatcurve',
		advanced: true,
		text: `
When the "current" fts database exceeds this length of time (in msecs) to
commit changes, it is rotated to a read-only database and replaced by a new
write DB. Most people should not change this setting.

Set to \`0\` to disable rotation.`
	},

	fts_flatcurve_substring_search: {
		default: 'no',
		values: setting_types.BOOLEAN,
		plugin: 'fts-flatcurve',
		text: `
If enabled, allows substring searches ([[rfc,3501]] compliant). However, this
requires significant additional storage space. Many users today expect
"Google-like" behavior, which is prefix searching, so substring searching is
arguably not the modern expected behavior anyway. Therefore, even though it
is not strictly RFC compliant, prefix (non-substring) searching is enabled
by default.`
	},

	/* fts-solr plugin */

	fts_solr_batch_size: {
		plugin: 'fts-solr',
		values: setting_types.UINT,
		default: 1000,
		text: `
Configures the number of mails sent to Solr in a single request.

* With [[setting,fts_autoindex,yes]] each new mail gets separately indexed on
  arrival, so \`fts_solr_batch_size\` only matters during the initial indexing
  of a mailbox.
* With [[setting,fts_autoindex,no]] new mails don't get indexed on arrival, so
  \`fts_solr_batch_size\` is used when indexing is triggered.`
	},

	fts_solr_soft_commit: {
		plugin: 'fts-solr',
		values: setting_types.BOOLEAN,
		default: 'yes',
		seealso: [ '[[link,fts_solr_soft_commits]]' ],
		text: `
Controls whether new mails are immediately searchable via Solr.`
	},

	fts_solr_url: {
		plugin: 'fts-solr',
		values: setting_types.STRING,
		text: `
Required base URL for Solr.

::: info
Remember to add your core name if using solr 7+: \`/solr/dovecot\`.

Example:
\`\`\`[dovecot.conf]
fts_solr_url = http://solr.example.org:8983/solr/dovecot/
fts_solr_batch_size = 1000
\`\`\`
:::`
	},

	/* imap-acl plugin */

	acl_anyone: {
		plugin: 'imap-acl',
		values: setting_types.ENUM,
		values_enum: [ 'allow' ],
		text: `
Users who have different set of keys cannot share mails when the mails are
encrypted, but sharing is possible within the scope of a key.

By default Dovecot doesn't allow using the IMAP \`anyone\` or
\`authenticated\` identifier, because it would be an easy way to spam
other users in the system. If you wish to allow it, set:

\`\`\`
plugin {
  acl_anyone = allow
}
\`\`\``
	},

	/* last-login plugin */

	last_login: {
		plugin: 'last-login',
		values: setting_types.NAMED_FILTER,
		text: `
Named filter for initializing dictionary used to store last login information.

Example:

\`\`\`[dovecot.conf]
redis_host = 127.0.0.1
redis_port = 6379
last_login {
  dict redis {
  }
}
\`\`\``
	},

	last_login_key: {
		default: 'last-login/%u',
		plugin: 'last-login',
		values: setting_types.STRING,
		text: `
The key that is updated in the dictionary with the last login information.`
	},

	last_login_precision: {
		default: 's',
		plugin: 'last-login',
		values: setting_types.ENUM,
		values_enum: [ 's', 'ms', 'us', 'ns' ],
		text: `Precision for last login timestamp.`
	},

	/* lazy-expunge plugin */

	lazy_expunge_mailbox: {
		plugin: 'lazy-expunge',
		seealso: [ '[[link,lazy_expunge_storage]]' ],
		values: setting_types.STRING,
		text: `
The mailbox to move messages to when expunged. This setting MUST be defined or
else lazy-expunge plugin will not be active.

\`\`\`[dovecot.conf]
lazy_expunge_mailbox = .EXPUNGED
namespace inbox {
  mailbox Drafts {
    lazy_expunge_mailbox =
  }
  namespace "External accounts" {
    lazy_expunge_mailbox =
  }
}
\`\`\``
	},

	lazy_expunge_only_last_instance: {
		default: 'no',
		plugin: 'lazy-expunge',
		values: setting_types.BOOLEAN,
		text: `
If \`yes\`, only move to expunged storage if this is the last copy of the
message in the user's account. This prevents the same mail from being
duplicated in the lazy-expunge folder as the mail becomes expunged from
all the folders it existed in.

This setting prevents copying mail to the lazy-expunge folder when using
the IMAP MOVE command. When using COPY/EXPUNGE, this setting prevents
duplicates only with the following mailbox formats:

* [[link,maildir]] (with [[setting,maildir_copy_with_hardlinks,yes]], which is
  the default)
* [[link,sdbox]]/[[link,mdbox]]`
	},

	/* mail-compress plugin */

	compress_bz2_block_size_100k: {
		plugin: 'mail-compress',
		values: setting_types.UINT,
		default: 9,
		text: `
The compression block size to use. Must be between \`1\` (\`100 000\` bytes)
and \`9\` (\`900 000\` bytes).`
	},

	compress_deflate_level: {
		plugin: 'mail-compress',
		values: setting_types.UINT,
		default: 6,
		text: `
The compression level to use for deflate compression. Must be between \`0\` (no compression) and \`9\`.`
	},

	compress_gz_level: {
		plugin: 'mail-compress',
		values: setting_types.UINT,
		default: 6,
		text: `
The compression level to use for gz compression. Must be between \`0\` (no compression) and \`9\`.`
	},

	compress_zstd_level: {
		plugin: 'mail-compress',
		values: setting_types.UINT,
		default: 3,
		text: `
The compression level to use for zstd compression. Must be between \`1\` and
\`22\`.`
	},

	mail_compress_write_method: {
		plugin: 'mail-compress',
		values: setting_types.STRING,
		text: `
The [[link,mail_compress_compression_methods,Compression Method]] to use for
writing new mails. If empty, new mails are written without compression. Old
mails can still be read.`
	},

	/* mail-crypt plugin */

	crypt_acl_require_secure_key_sharing: {
		plugin: 'mail-crypt',
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If enabled, you cannot share a key to groups or someone without a public key.`
	},

	crypt_user_key_curve: {
		plugin: 'mail-crypt',
		values: setting_types.STRING,
		text: `
Defines the elliptic curve to use for key generation.

Any valid curve supported by the underlying cryptographic library is allowed.

Example:

\`\`\`
crypt_user_key_curve = secp521r1
\`\`\`

This must be set if you wish to use folder keys rather than global keys.

With global keys (either RSA or EC keys), all keying material is taken
from the setting and no key generation is performed.

In folder-keys mode, a key pair is generated for the user, and a
folder-specific key pair is generated. The latter is encrypted by means of
the user's key pair.

For EdDSA, you need to use X448 or X25519, case sensitive.`
	},

	crypt_global_private_keys: {
		plugin: 'mail-crypt',
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'crypt_private_key_file', 'crypt_private_key_password' ],
		text: `
List of private keys to decrypt files. Add [[setting,crypt_private_key_file]]
and optionally [[setting,crypt_private_key_password]] inside each filter.`
	},

	crypt_global_public_key_file: {
		plugin: 'mail-crypt',
		values: setting_types.FILE,
		text: `
Public key to encrypt files. Key must be in
[[link,mail_crypt_converting_ec_key_to_pkey,PEM pkey format]]. The PEM key may
additionally be base64-encoded into a single line, which can make it easier to
store into userdb extra fields.`
	},

	crypt_global_private_key: {
		plugin: 'mail-crypt',
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'crypt_private_key_file', 'crypt_private_key_password' ],
		text: `
List of global private key(s) to decrypt mails. Add
[[setting,crypt_private_key_file]] and optionally
[[setting,crypt_private_key_password]] inside each filter.`
	},

	crypt_user_key_encryption_key: {
		plugin: 'mail-crypt',
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'crypt_private_key_file', 'crypt_private_key_password' ],
		text: `
List of private key(s) to decrypt user's master private key. Add
[[setting,crypt_private_key_file]] and optionally
[[setting,crypt_private_key_password]] inside each filter.`
	},

	crypt_user_key_password: {
		plugin: 'mail-crypt',
		values: setting_types.STRING,
		text: `
Password to decrypt user's master private key.`
	},

	crypt_user_key_require_encrypted: {
		plugin: 'mail-crypt',
		values: setting_types.BOOLEAN,
		seealso: [
			'crypt_user_key_password',
			'crypt_user_key_encryption_key',
		],
		text: `
If yes, require user's master private key to be encrypted with
[[setting,crypt_user_key_password]] or
[[setting,crypt_user_key_encryption_key]]. If they are unset new user key
generation will fail. This setting doesn't affect already existing
non-encrypted keys.`
	},

	crypt_write_algorithm: {
		plugin: 'mail-crypt',
		values: setting_types.STRING,
		default: 'aes-256-gcm-sha256',
		text: `
Set the encryption algorithm. If empty new mails are not encrypted, but
existing mails can still be decrypted.`
	},

	crypt_private_key_name: {
		plugin: 'mail-crypt',
		values: setting_types.STRING,
		seealso: [
			'crypt_global_private_keys',
			'crypt_user_key_encryption_key',
		],
		text: `
Name of the private key inside [[setting,crypt_global_private_keys]] or
[[setting,crypt_user_key_encryption_key]].`
	},

	crypt_private_key_file: {
		plugin: 'mail-crypt',
		values: setting_types.FILE,
		seealso: [
			'[[link,mail_crypt_converting_ec_key_to_pkey]]',
			'crypt_global_private_keys',
			'crypt_user_key_encryption_key',
		],
		text: `
Private key in [[link,mail_crypt_converting_ec_key_to_pkey]]. The PEM key may
additionally be base64-encoded into a single line, which can make it easier to
store into userdb extra fields.

Used inside [[setting,crypt_global_private_keys]] and
[[setting,crypt_user_key_encryption_key]] lists.`
	},

	crypt_private_key_password: {
		plugin: 'mail-crypt',
		values: setting_types.STRING,
		seealso: [ 'crypt_private_key_file' ],
		text: `
Password to decrypt [[setting,crypt_private_key_file]].`
	},

	/* mail-log plugin */

	mail_log_cached_only: {
		default: 'no',
		plugin: 'mail-log',
		values: setting_types.BOOLEAN,
		text: `
If enabled, everything except \`save\` event will log only the fields that
can be looked up from cache. This improves performance if some of the
fields aren't cached and it's not a strict requirement to log them.`
	},

	mail_log_events: {
		plugin: 'mail-log',
		values: setting_types.BOOLLIST,
		text: `
List of events to log.

Available events:

* \`delete\`
* \`undelete\`
* \`expunge\`
* \`save\`
* \`copy\`
* \`mailbox_create\`
* \`mailbox_delete\`
* \`mailbox_rename\`
* \`flag_change\``
	},

	mail_log_fields: {
		plugin: 'mail-log',
		values: setting_types.BOOLLIST,
		text: `
List of fields to log.

| Field | Restrictions |
| ----- | ------------ |
| \`uid\` | |
| \`box\` | |
| \`msgid\` | |
| \`size\` | Only available for \`expunge\` and \`copy\` events. |
| \`vsize\` | Only available for \`expunge\` and \`copy\` events. |
| \`vsize\` | |
| \`flags\` | |
| \`from\` | |
| \`subject\` | |`
	},

	/* mail-lua plugin */

	mail_lua: {
		added: {
			settings_mail_lua_added: false,
		},
		plugin: 'mail-lua',
		values: setting_types.NAMED_FILTER,
		seealso: [ 'lua_file', 'lua_settings' ],
		text: `
Named filter for initializing [[plugin,mail_lua]] settings.

Example:

\`\`\`[dovecot.conf]
mail_lua {
  lua_file = /etc/dovecot/user.lua
  lua_settings {
    extra_param = %{userdb:extra_param}
  }
}
\`\`\``
	},

	/* notify-status plugin */

	mailbox_notify_status: {
		plugin: 'notify-status',
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Whether notifications for a single mailbox or mailbox wildcards are enabled.

Example:

\`\`\`
mailbox INBOX {
  notify_status = yes
}
mailbox Spam {
  notify_status = yes
}
mailbox *BOX {
  notify_status = yes
}
\`\`\``
	},

	notify_status: {
		filter: '`notify_status`',
		plugin: 'notify-status',
		values: setting_types.STRING,
		dependencies: [
			'[[link,dict]]',
		],
		text: `
The URI of the dictionary to use. This MUST be set for the plugin to be active.

See [[link,dict]] for how to configure dictionaries.

\`\`\`
plugin {
  notify_status_dict = proxy:dict-async:notify_status
}
\`\`\``
	},

	notify_status_value: {
		default: '{"messages":%{messages},"unseen":%{unseen}}',
		plugin: 'notify-status',
		values: setting_types.STRING_NOVAR,
		text: `
A template of the string that will be written to the dictionary.

The template supports variable substitution of the form
\`%{variable_name}\`.

Supported variable substitutions:

| Field | Value |
| ----- | ----- |
| \`first_recent_uid\` | First recent UID |
| \`highest_modseq\` | Highest modification sequence number |
| \`highest_pvt_modseq\` | Highest private modification sequence number |
| \`mailbox\` | Mailbox name |
| \`messages\` | Number of messages |
| \`recent\` | Number of recent messages (deprecated) |
| \`uidnext\` | Predicted next UID value |
| \`uidvalidity\` | Current UID validity |
| \`unseen\` | Number of unseen messages |
| \`username\` | Username (user@domain) |`
	},

	/* pop3-migration plugin */

	pop3_migration_all_mailboxes: {
		default: 'no',
		plugin: 'pop3-migration',
		values: setting_types.BOOLEAN,
		text: `
By default it's assumed that POP3 contains the same messages as IMAP INBOX.
If there are any unexpected mails, the migration fails. If the POP3 server
includes other folders' contents in POP3 as well, this setting needs to be
enabled. It causes Dovecot to try to match POP3 messages in all the migrated
folders, not just INBOX. There is no warning logged if any POP3 UIDLs are
missing or if POP3 has messages that aren't found from IMAP.`
	},

	pop3_migration_ignore_extra_uidls: {
		default: 'no',
		plugin: 'pop3-migration',
		values: setting_types.BOOLEAN,
		text: `
If IMAP INBOX has all messages that exist in POP3, but POP3 still has some
additional messages, the migration fails. Enable this setting to log it as
a warning and continue anyway. This could happen if there's a race condition
where a new mail is just delivered and it shows up in POP3 but not in IMAP.`
	},

	pop3_migration_ignore_missing_uidls: {
		default: 'no',
		plugin: 'pop3-migration',
		values: setting_types.BOOLEAN,
		text: `
If POP3 has messages that aren't found from IMAP INBOX, and IMAP INBOX also
has messages not found from POP3, the migration fails. Enable this setting
to log it as a warning and continue anyway.`
	},

	pop3_migration_mailbox: {
		default: 'no',
		plugin: 'pop3-migration',
		values: setting_types.STRING,
		text: `
This setting points to the POP3 INBOX in the configured pop3c namespace.
This setting is required for the plugin to be active.

\`\`\`
pop3_migration_mailbox = POP3-MIGRATION-NS/INBOX
\`\`\``
	},

	pop3_migration_skip_size_check: {
		default: 'no',
		plugin: 'pop3-migration',
		values: setting_types.BOOLEAN,
		text: `
IMAP and POP3 messages are attempted to be matched by the message sizes by
default. This is the most efficient way of matching the messages, since both
IMAP and POP3 listings can usually be looked up from indexes/caches. If the
IMAP INBOX and POP3 listings don't match exactly, or if two adjacent
messages have the same size, the rest of the messages are matched by reading
their headers.

If this setting is enabled, the message size check is skipped entirely and
only headers are matched. This may be necessary for reliability if it's
known that the IMAP and POP3 messages cannot be matched by size anyway.`
	},

	pop3_migration_skip_uidl_cache: {
		default: 'no',
		plugin: 'pop3-migration',
		values: setting_types.BOOLEAN,
		text: `
If imapc is configured with persistent indexes, the POP3 UIDLs are stored
into the imapc mailbox's dovecot.index.cache files. Any following
incremental migrations use these cached UIDLs if possible. This setting
can be used to disable this in case there are any problems with the cache.
This setting is unlikely to be ever needed.`
	},

	/* push-notification plugin */

	push_notification: {
		plugin: 'push-notification',
		values: setting_types.STRING,
		text: `
The configuration value is a named filter for a specified driver, see
[[link,push_notification]] for their names and their supported options.`
	},

	push_notification_driver: {
		plugin: 'push-notification',
		filter: 'push_notification',
		dependencies: [
			'push_notification',
		],
		values: setting_types.STRING,
		text: `
The name of the driver. This value determines the available options and the
behavior. See [[link,push_notification]] for the list of supported drivers and
options.`
	},

	/* quota-clone plugin */

	quota_clone: {
		plugin: 'quota-clone',
		added: {
			settings_quota_clone_added: false,
		},
		values: setting_types.NAMED_FILTER,
		seealso: [ '[[link,dict]]' ],
		text: `
Named filter for initializing dictionary used to update with quota clone
information.

\`\`\`[dovecot.conf]
redis_host = 127.0.0.1
redis_port = 6379
quota_clone {
  dict redis {
  }
}
\`\`\``
	},

	quota_clone_unset: {
		plugin: 'quota-clone',
		added: {
			settings_quota_clone_unset_added: false
		},
		values: setting_types.BOOLEAN,
		advanced: true,
		text: `
Unset quota information before updating. This is needed with some dict
drivers that do not support upserting, such as SQL with older SQLite.`
	},

	/* quota plugin */

	quota: {
		plugin: 'quota',
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ '[[link,quota_root]]' ],
		text: `
Create a new [[link,quota_root,quota root]]. The filter name refers
to [[setting,quota_name]] setting.

Globally configured quota roots are used only for private namespaces.
To use quota for public namespaces, configure it inside the public namespace.

Example:
\`\`\`[dovecot.conf]
quota "User quota" {
  storage_size = 1G
}
\`\`\``
	},

	quota_driver: {
		plugin: 'quota',
		values: setting_types.STRING,
		default: 'count',
		seealso: [ '[[link,quota_drivers]]' ],
		text: `
Quota driver to use. See [[link,quota_drivers]].`
	},

	quota_enforce: {
		plugin: 'quota',
		values: setting_types.BOOLEAN,
		default: {
			value: 'yes',
			text: '`quota_imapc { no }`',
		},
		text: `
If disabled, the quota limit isn't actually enforced. The quota is still
tracked and the current quota usage is visible to IMAP GETQUOTA commands.`
	},

	quota_exceeded_message: {
		plugin: 'quota',
		values: setting_types.STRING,
		default: `Quota exceeded (mailbox for user is full)`,
		text: `
The message specified here is passed on to a user who goes over quota.
There are also other messages, which are currently hard coded:

 * When exceeding [[setting,quota_mail_size]]:
   \`Mail size is larger than the maximum size allowed by server configuration\`
 * When exceeding [[setting,quota_mailbox_message_count]]:
   \`Too many messages in the mailbox\``
	},

	quota_fs_message_limit: {
		plugin: 'quota',
		values: setting_types.BOOLEAN,
		tags: [ 'quota-fs' ],
		default: 'no',
		text: `
If yes, use filesystem quota's inode limit as the message count limit.
This can be useful with Maildir or sdbox. Used only with
[[link,quota_driver_fs]].`
	},

	quota_fs_mount_path: {
		plugin: 'quota',
		values: setting_types.STRING,
		tags: [ 'quota-fs' ],
		text: `
If specified, enable FS quota for the specified mount path. Only mailboxes
existing in this mount path have the quota enabled. Empty value looks up the
mountpoint automatically. Used only with [[link,quota_driver_fs]].`
	},

	quota_fs_type: {
		plugin: 'quota',
		values: setting_types.ENUM,
		tags: [ 'quota-fs' ],
		values_enum: [ 'any', 'user', 'group' ],
		default: 'any',
		text: `
Using \`any\` attempts to use the user quota first, with a fallback to group
quota. Using \`user\` or \`group\` only attempts to use the user or the group
quota, with a fallback to unlimited quota limit. Used only with
[[link,quota_driver_fs]].`
	},

	quota_hidden: {
		plugin: 'quota',
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If yes, hide the quota root from IMAP GETQUOTA commands.`
	},

	quota_ignore: {
		plugin: 'quota',
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If yes, don't include this mailbox or namespace in quota calculations.

Example:
\`\`\`[dovecot.conf]
namespace inbox {
  mailbox Trash {
    quota_ignore = yes
  }
}
namespace secondary {
  quota_ignore = yes
}
\`\`\``
	},

	quota_ignore_unlimited: {
		plugin: 'quota',
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If yes, ignore the quota root entirely if it has no quota limits. This means
no tracking of the quota, and not making it visible to IMAP GETQUOTA commands.`
	},

	quota_imapc_mailbox_name: {
		plugin: 'quota',
		values: setting_types.STRING,
		tags: [ 'quota-imapc' ],
		seealso: [ '[[setting,quota_imapc_root_name]]' ],
		default: 'INBOX',
		text: `
If non-empty, use \`GETQUOTAROOT <mailbox>\` to get the imapc quota root.
Used only with [[link,quota_driver_imapc]].`
	},

	quota_imapc_root_name: {
		plugin: 'quota',
		values: setting_types.STRING,
		tags: [ 'quota-imapc' ],
		seealso: [ '[[setting,quota_imapc_mailbox_name]]' ],
		default: '',
		text: `
If [[setting,quota_imapc_mailbox_name]] is empty, use \`GETQUOTA <name>\`
to get the imapc quota.

Some servers may have an empty quota root name. This is why if this setting and
[[setting,quota_imapc_mailbox_name]] both have empty values, this setting is
used. Used only with [[link,quota_driver_imapc]].`
	},

	quota_mail_size: {
		default: 'unlimited',
		plugin: 'quota',
		values: setting_types.SIZE,
		tags: [ 'storage_size_limits' ],
		seealso: [ '[[link,quota_mail_size]]' ],
		text: `
The maximum message size that is allowed to be saved (e.g. by LMTP, IMAP
APPEND or [[doveadm,save]]).`
	},

	quota_mailbox_count: {
		default: 'unlimited',
		plugin: 'quota',
		values: setting_types.UINT,
		tags: [ 'storage_size_limits' ],
		seealso: [ '[[link,quota_mailbox_count]]' ],
		added: {
			settings_quota_mailbox_count_added: false
		},
		text: `
Maximum number of mailboxes that can be created. Each namespace is tracked
separately, so e.g. shared mailboxes aren't counted towards the user's own
limit.`
	},

	quota_mailbox_message_count: {
		default: 'unlimited',
		plugin: 'quota',
		values: setting_types.UINT,
		tags: [ 'storage_size_limits' ],
		added: {
			settings_quota_mailbox_message_count_added: false
		},
		text: `
Maximum number of messages that can be created in a single mailbox.`
	},

	quota_message_count: {
		default: 'unlimited',
		plugin: 'quota',
		values: setting_types.UINT,
		seealso: [
			'[[setting,quota_message_percentage]]',
			'[[setting,quota_storage_size]]',
			'[[link,quota_root]]'
		],
		tags: [ 'storage_size_limits' ],
		text: `
Maximum number of messages for the [[link,quota_root]]. This value is still
multiplied by [[setting,quota_message_percentage]] to get the final value
(in this mailbox or namespace). This is reported as the MESSAGE limit in IMAP
GETQUOTA commands. Using \`0\` as the value means the same as \`unlimited\`.`
	},

	quota_message_percentage: {
		default: '100',
		plugin: 'quota',
		values: setting_types.UINT,
		seealso: [ '[[setting,quota_message_count]]' ],
		text: `
Multiplier for the [[setting,quota_message_count]] setting (in this
mailbox/namespace).

This may be useful to exceed the regular quota limit in some mailboxes, such as
allowing clients that move messages with IMAP COPY+EXPUNGE to Trash folder to
temporarily exceed the quota.

Example:
\`\`\`[dovecot.conf]
quota_message_count = 10000
namespace inbox {
  mailbox Trash {
    # 110% * 10000 = 11000 limit
    quota_message_percentage = 110
  }
}
\`\`\``
	},

	quota_name: {
		plugin: 'quota',
		values: setting_types.STRING,
		seealso: [ 'quota', '[[link,quota_root]]' ],
		text: `
Name of the [[link,quota_root,quota root]]. The [[setting,quota]] filter name
refers to this setting.

The quota root name is just an arbitrary string that is sent to IMAP
clients, which in turn may show it to the user. The name has no meaning.`
	},

	quota_over_status: {
		plugin: 'quota',
		values: setting_types.NAMED_FILTER,
		seealso: [ '[[link,quota_overquota]]' ],
		text: `
Named filter for executing the overquota-flag script. The [[setting,execute]]
setting is required to be specified inside the filter.`
	},

	quota_over_status_current: {
		plugin: 'quota',
		values: setting_types.STRING,
		seealso: [ '[[link,quota_overquota]]' ],
		text: `
An identifier that indicates whether the overquota-flag is active for a user.

This identifier is compared against [[setting,quota_over_status_mask]] to
determine if the overquota-flag should be set for the user.

Usually, this value will be loaded via [[link,userdb]].`
	},

	quota_over_status_lazy_check: {
		default: 'no',
		plugin: 'quota',
		values: setting_types.BOOLEAN,
		text: `
If enabled, overquota-flag is checked only when current quota usage is
going to already be checked anyway. This prevents any additional storage I/O
that would be caused by the overquota-flag check.`
	},

	quota_over_status_mask: {
		plugin: 'quota',
		values: setting_types.STRING,
		seealso: [ '[[link,quota_overquota]]' ],
		text: `
The search string to match against [[setting,quota_over_status_current]] to
determine if the overquota-flag is set for the user.

Wildcards can be used in a generic way, e.g. \`*yes\` or \`*TRUE*\`.`
	},

	quota_status_nouser: {
		default: 'REJECT Unknown user',
		plugin: 'quota',
		values: setting_types.STRING,
		tags: [ 'quota-status-service' ],
		seealso: [ '[[link,quota_status_service]]' ],
		text: `
[[link,quota_status_service]]: Response when asking quota for a nonexistent
users.`
	},

	quota_status_overquota: {
		default: '554 5.2.2 %{error}',
		plugin: 'quota',
		values: setting_types.STRING,
		tags: [ 'quota-status-service' ],
		seealso: [ '[[link,quota_status_service]]' ],
		text: `
[[link,quota_status_service]]: Response when asking quota for a user that is
over the quota. The \`%{error}\` variable expands to the more detailed reason,
which is generally [[setting,quota_exceeded_message]].`
	},

	quota_status_success: {
		default: 'OK',
		plugin: 'quota',
		values: setting_types.STRING,
		tags: [ 'quota-status-service' ],
		seealso: [ '[[link,quota_status_service]]' ],
		text: `
[[link,quota_status_service]]: Response when asking quota for a user that is
under the quota.`
	},

	quota_status_toolarge: {
		default: '[[setting,quota_status_overquota]]',
		plugin: 'quota',
		values: setting_types.STRING,
		tags: [ 'quota-status-service' ],
		seealso: [ '[[link,quota_status_service]]' ],
		text: `
[[link,quota_status_service]]: Response when asking quota for a mail that is
larger than user's [[setting,quota_storage_size]] or
[[setting,quota_mail_size]]. Empty value defaults to
[[setting,quota_status_overquota]].`
	},

	quota_storage_extra: {
		default: '0',
		plugin: 'quota',
		values: setting_types.SIZE,
		seealso: [
			'[[setting,quota_storage_size]]',
			'[[setting,quota_storage_percentage]]',
			'[[link,quota_root]]'
		],
		text: `
If set, increase the [[setting,quota_storage_size]] (for the mailbox/namespace)
by this amount. This is an alternative to using
[[setting,quota_storage_percentage]], although both can also be used.

This may be useful to exceed the regular quota limit in some mailboxes, such as
allowing clients that move messages with IMAP COPY+EXPUNGE to Trash folder to
temporarily exceed the quota.

Example:
\`\`\`[dovecot.conf]
quota_storage_size = 1G
namespace inbox {
  mailbox Trash {
    # 1G + 100M = 1100M
    quota_storage_extra = 100M
  }
}
\`\`\``
	},

	quota_storage_grace: {
		default: '10 M',
		plugin: 'quota',
		values: setting_types.SIZE,
		seealso: [ '[[link,quota_root]]' ],
		text: `
If set, allows message deliveries (LDA, LMTP) to exceed quota once by this
amount. After the quota is already over the limit, the grace no longer applies.
This prevents a situation where some smaller mails may still become delivered,
but larger mail deliveries fail, and the user may not have received any warning
about reaching the quota limit.`
	},

	quota_storage_percentage: {
		default: '100',
		plugin: 'quota',
		values: setting_types.UINT,
		seealso: [
			'[[setting,quota_storage_size]]',
			'[[setting,quota_storage_extra]]',
			'[[link,quota_root]]'
		],
		text: `
Multiplier for the [[setting,quota_storage_size]] setting (in this
mailbox/namespace). This is an alternative to using
[[setting,quota_storage_extra]], although both can also be used.

This may be useful to exceed the regular quota limit in some mailboxes, such as
allowing clients that move messages with IMAP COPY+EXPUNGE to Trash folder to
temporarily exceed the quota.

Example:
\`\`\`[dovecot.conf]
quota_storage_size = 1G
namespace inbox {
  mailbox Trash {
    # 110% * 1G = 1100M
    quota_storage_percentage = 110
  }
}
\`\`\``
	},

	quota_storage_size: {
		default: 'unlimited',
		plugin: 'quota',
		values: setting_types.UINT,
		seealso: [
			'[[setting,quota_storage_extra]]',
			'[[setting,quota_storage_percentage]]',
			'[[setting,quota_message_count]]',
			'[[link,quota_root]]'
		],
		tags: [ 'storage_size_limits' ],
		text: `
Quota storage size limit for the [[link,quota_root]]. This value is still
multiplied by [[setting,quota_storage_percentage]] and then increased by
[[setting,quota_storage_extra]] to get the final value (in this mailbox or
namespace). This is reported as the STORAGE limit in IMAP GETQUOTA commands.
Using \`0\` as the value means the same as \`unlimited\`.`
	},

	quota_warning: {
		plugin: 'quota',
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ '[[link,quota_warning_scripts]]' ],
		tags: [ 'quota-warning' ],
		text: `
Create a new [[link,quota_warning_scripts,quota warning]]. The filter name
refers to [[setting,quota_warning_name]] setting. The [[setting,execute]]
setting is required to be specified inside the filter.

The order of \`quota_warning\` filters in the configuration is important:
Only the first warning that matches the rules is executed. This means you must
configure the highest limits first.`
	},

	quota_warning_name: {
		plugin: 'quota',
		values: setting_types.STRING,
		seealso: [ '[[link,quota_warning_scripts]]' ],
		tags: [ 'quota-warning' ],
		text: `
Name of the [[link,quota_warning_scripts,quota warning]]. The
[[setting,quota_warning]] filter name refers to this setting. This name is
only used within the configuration to identify the quota warning - it has no
meaning otherwise.`
	},

	quota_warning_resource: {
		plugin: 'quota',
		values: setting_types.ENUM,
		seealso: [ '[[link,quota_warning_scripts]]' ],
		values_enum: [ 'storage', 'message' ],
		default: 'storage',
		tags: [ 'quota-warning' ],
		text: `
Which [[link,quota_limits,quota resource]] the quota warning is tracking.`
	},

	quota_warning_threshold: {
		plugin: 'quota',
		values: setting_types.ENUM,
		seealso: [ '[[link,quota_warning_scripts]]' ],
		values_enum: [ 'over', 'under' ],
		default: 'over',
		tags: [ 'quota-warning' ],
		text: `
Should the quota warning be executed when quota grows over the limit, or
when it drops under the limit.`
	},

	/* trash plugin */

	trash_priority: {
		plugin: 'trash',
		values: setting_types.UINT,
		text: `
If non-zero, enables the trash plugin for the mailbox with the specified
priority. Mailboxes with smaller priority number are emptied before mailboxes
with a larger priority number. If there are multiple mailboxes with the same
priority, expunge the oldest mail from them first.

Example where Trash is emptied before Spam:

\`\`\`[dovecot.conf]
namespace inbox {
  mailbox Trash {
    trash_priority = 1
  }
  mailbox Spam {
    trash_priority = 2
  }
}
\`\`\``
	},

	/* virtual plugin */

	virtual_max_open_mailboxes: {
		default: 64,
		plugin: 'virtual',
		values: setting_types.UINT,
		advanced: true,
		text: `How many mailboxes to open in virtual plugin.`
	},

	/* welcome plugin */

	welcome_script: {
		plugin: 'welcome',
		values: setting_types.NAMED_FILTER,
		seealso: [ '[[link,welcome]]' ],
		text: `
Named filter for configuring the welcome [[setting,execute]] script.

\`\`\`[dovecot.conf]
welcome {
  execute welcome {
    args = %{user}
  }
\`\`\``
	},

	welcome_wait: {
		plugin: 'welcome',
		values: setting_types.BOOLEAN,
		default: 'no',
		seealso: [ '[[link,welcome]]' ],
		text: `
Should the welcome plugin wait for the script execution to finish before
continuing.`
	},

	welcome_wait: {
		plugin: 'welcome',
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If enabled, wait for the script to finish. By default, the welcome script
is run asynchronously.`
	},

	/* SQL Cassandra settings. */

	cassandra_connect_timeout: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.TIME_MSECS,
		default: '5s',
		text: `
Connection timeout.`
	},

	cassandra_debug_queries: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Whether to log CQL queries.`
	},

	cassandra_delete_consistency: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [
			'any',
			'local-serial',
			'serial',
			'one',
			'two',
			'three',
			'local-quorum',
			'quorum',
			'each-quorum',
			'all',
		],
		default: 'local-quorum',
		seealso: [ '[[link,sql_cassandra_consistency]]' ],
		text: `
Write consistency when deleting from the database. See
[[link,sql_cassandra_consistency]].`
	},

	cassandra_delete_fallback_consistency: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [
			'any',
			'local-serial',
			'serial',
			'one',
			'two',
			'three',
			'local-quorum',
			'quorum',
			'each-quorum',
			'all',
		],
		default: 'local-quorum',
		seealso: [ '[[link,sql_cassandra_consistency]]' ],
		text: `
Write consistency when deleting from the database fails with primary
consistency.`
	},

	cassandra_execution_retry_interval: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.TIME_MSECS,
		default: 0,
		text: `
If the driver supports speculative execution policy, configures constant
speculative execution policy. See
https://docs.datastax.com/en/developer/java-driver/latest/manual/core/speculative_execution/index.html`
	},

	cassandra_execution_retry_times: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.TIME_MSECS,
		default: 0,
		text: `
If the driver supports speculative execution policy, configures constant
speculative execution policy. See
https://docs.datastax.com/en/developer/java-driver/latest/manual/core/speculative_execution/index.html`
	},

	cassandra_heartbeat_interval: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.TIME,
		default: '30s',
		text: `
How often to send keepalive packets to cassandra nodes.`
	},

	cassandra_hosts: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.BOOLLIST,
		text: `
List of hosts or IP addresses to connect.`
	},

	cassandra_idle_timeout: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.TIME_MSECS,
		default: '0',
		text: `
How long to idle before disconnecting.`
	},

	cassandra_keyspace: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.STRING,
		text: `
Specifies the keyspace name to use.`
	},

	cassandra_latency_aware_routing: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
When turned on, latency-aware routing tracks the latency of queries to avoid
sending new queries to poorly performing Cassandra nodes.`
	},

	cassandra_log_level: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [ `critical`, `error`, `warn`, `info`, `debug`, `trace` ],
		default: 'warn',
		text: `
Driver log level.`
	},

	cassandra_log_retries: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Whether to log about failed requests that are retried (which may or may
not succeed after the retry).`
	},

	cassandra_metrics: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.STRING,
		text: `
Path where to write JSON metrics. See [[link,sql_cassandra_metrics]].`
	},

	cassandra_io_thread_count: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.UINT,
		default: 'driver dependent',
		text: `
Set number of IO threads to handle query requests.`
	},

	cassandra_page_size: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.UINT,
		default: 0,
		text: `
When a query returns many rows, it can be sometimes inefficient to return them
as a single response message. Instead, the driver can break the results into
pages which get returned as they are needed.

This setting controls the size of each page.

Set to \`0\` to disable.`
	},

	cassandra_password: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.STRING,
		text: `
Password for authentication.`
	},

	cassandra_port: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.IN_PORT,
		default: 9042,
		text: `
CQL port to use.`
	},

	cassandra_read_consistency: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [
			'any',
			'local-serial',
			'serial',
			'one',
			'two',
			'three',
			'local-quorum',
			'quorum',
			'each-quorum',
			'all',
		],
		default: 'local-quorum',
		seealso: [ '[[link,sql_cassandra_consistency]]' ],
		text: `
Read consistency.`
	},

	cassandra_read_fallback_consistency: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [
			'any',
			'local-serial',
			'serial',
			'one',
			'two',
			'three',
			'local-quorum',
			'quorum',
			'each-quorum',
			'all',
		],
		default: 'local-quorum',
		seealso: [ '[[link,sql_cassandra_consistency]]' ],
		text: `
Read consistency if primary consistency fails.`
	},

	cassandra_request_timeout: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.TIME_MSECS,
		default: '60s',
		text: `
How long to wait for a query to finish.`
	},

	cassandra_ssl: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		default: 'no',
		values_enum: [ 'no', 'cert-only', 'cert-ip' ],
		seealso: [ '[[link,ssl_configuration]]', 'ssl_client_require_valid_cert' ],
		text: `
Whether to use SSL when connecting to Cassandra, and how to verify the
certificate:


\`no\`
:   Don't use SSL

\`cert-only\`
:   Verify the certificate, but not the IP address or host name.

\`cert-ip\`
:   Verify the certificate, and require IP address to match the certificate's
    common name or one of its subject alternative names.

You can also skip certificate validation by setting
[[setting,ssl_client_require_valid_cert,yes]]. The \`cassandra_ssl\` setting
value must something else than \`no\`.

Configure SSL certificates using the \`ssl_client_*\` settings. See
[[link,ssl_configuration]].`
	},

	cassandra_user: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.STRING,
		text: `
Username for authentication.`
	},

	cassandra_protocol_version: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [ 3, 4, 5 ],
		default: 'depends on driver version',
		text: `
Cassandra protocol version to use. It is good idea to specify this to avoid
warnings about version handshake if the driver supports a higher protocol
version than the server.

::: info
If you want to use server-side prepared statements, you need to
use at least \`4\`.
:::`
	},

	cassandra_warn_timeout: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.TIME_MSECS,
		default: '5s',
		text: `
Emit warning if query takes longer than this.`
	},

	cassandra_write_consistency: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [
			'any',
			'local-serial',
			'serial',
			'one',
			'two',
			'three',
			'local-quorum',
			'quorum',
			'each-quorum',
			'all',
		],
		default: 'local-quorum',
		seealso: [ '[[link,sql_cassandra_consistency]]' ],
		text: `
Write consistency when updating or inserting to the database.`
	},

	cassandra_write_fallback_consistency: {
		tags: [ 'sql-cassandra' ],
		values: setting_types.ENUM,
		values_enum: [
			'any',
			'local-serial',
			'serial',
			'one',
			'two',
			'three',
			'local-quorum',
			'quorum',
			'each-quorum',
			'all',
		],
		default: 'local-quorum',
		seealso: [ '[[link,sql_cassandra_consistency]]' ],
		text: `
Write consistency when updating or inserting to the database fails with primary
consistency.`
	},

	/* SQL MySQL settings. */

	mysql: {
		tags: [ 'sql-mysql' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'mysql_host' ],
		text: `
Creates a new MySQL connection. If more than one is specified, the connections
are automatically used for load balancing and for failover. The filter name
refers to the [[setting,mysql_host]] setting.`
	},

	mysql_client_flags: {
		tags: [ 'sql-mysql' ],
		values: setting_types.UINT,
		default: 0,
		text: `
Flags to use when connecting to the database, provided as base-10 number. See
https://dev.mysql.com/doc/c-api/8.0/en/mysql-real-connect.html`
	},

	mysql_connect_timeout: {
		tags: [ 'sql-mysql' ],
		values: setting_types.TIME,
		default: '5s',
		text: `
How long to wait for connection.`
	},

	mysql_connection_limit: {
		tags: [ 'sql-mysql' ],
		values: setting_types.UINT,
		text: `
Maximum number of parallel connections. Currently MySQL queries are blocking,
so only a single connection can be used in parallel.`
	},

	mysql_dbname: {
		tags: [ 'sql-mysql' ],
		values: setting_types.STRING,
		text: `
Database name to connect to.`
	},

	mysql_host: {
		tags: [ 'sql-mysql' ],
		values: setting_types.STRING,
		default: 'localhost',
		text: `
Host or UNIX socket path to connect to. The [[setting,mysql]] setting defaults
to this.

::: info
MySQL drivers can default to using UNIX socket connection when host is
\`localhost\` and port is \`0\` (default). To force it to use TCP connection,
set [[setting,mysql_host,127.0.0.1]] or set [[setting,mysql_port]] explicitly.
:::`
	},

	mysql_option_file: {
		tags: [ 'sql-mysql' ],
		values: setting_types.STRING,
		text: `
File to read for client library specific configuration.`
	},

	mysql_option_group: {
		tags: [ 'sql-mysql' ],
		values: setting_types.STRING,
		text: `
Section name to read from [[setting,mysql_option_file]].`
	},

	mysql_password: {
		tags: [ 'sql-mysql' ],
		values: setting_types.STRING,
		text: `
Password for authentication.`
	},

	mysql_port: {
		tags: [ 'sql-mysql' ],
		values: setting_types.IN_PORT,
		default: '0 (defaults to 3306 for TCP connections)',
		text: `
Port to connect to.`
	},

	mysql_read_timeout: {
		tags: [ 'sql-mysql' ],
		values: setting_types.TIME,
		default: '30s',
		text: `
Timeout when reading data from server.`
	},

	mysql_ssl: {
		tags: [ 'sql-mysql' ],
		values: setting_types.BOOLEAN,
		seealso: [ '[[link,ssl]]' ],
		text: `
Whether to use SSL when connecting to MySQL. Configure it using the
\`ssl_client_*\` settings. See [[link,ssl]].`
	},

	mysql_user: {
		tags: [ 'sql-mysql' ],
		values: setting_types.STRING,
		text: `
Username for authentication.`
	},

	mysql_write_timeout: {
		tags: [ 'sql-mysql' ],
		values: setting_types.TIME,
		default: '30s',
		text: `
Timeout in seconds when writing data to server.`
	},

	/* SQL Postgres settings. */

	pgsql: {
		tags: [ 'sql-postgresql' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'pgsql_host' ],
		text: `
Creates a new PostgreSQL connection. If more than one is specified, the
connections are automatically used for load balancing and for failover. The
filter name refers to the [[setting,pgsql_host]] setting.`
	},

	pgsql_connection_limit: {
		tags: [ 'sql-postgresql' ],
		values: setting_types.UINT,
		text: `
Maximum number of parallel connections.`
	},

	pgsql_host: {
		tags: [ 'sql-postgresql' ],
		values: setting_types.STRING,
		seealso: [ 'pgsql' ],
		text: `
Host to connect to. The [[setting,pgsql]] setting defaults to this.`
	},

	pgsql_parameters: {
		tags: [ 'sql-postgresql' ],
		values: setting_types.STRLIST,
		text: `
List of key/value settings passed to PostgreSQL. See
https://www.postgresql.org/docs/current/libpq-connect.html for available
parameters.`
	},

	/* SQL sqlite settings. */

	sqlite_path: {
		tags: [ 'sql-sqlite' ],
		values: setting_types.STRING,
		text: `
Path to the sqlite database.`
	},

	sqlite_journal_mode: {
		tags: [ 'sql-sqlite' ],
		values: setting_types.ENUM,
		values_enum: [ 'delete', 'wal' ],
		default: 'wal',
		text: `
Allows using write-ahead logging mode for database.`
	},

	sqlite_readonly: {
		tags: [ 'sql-sqlite' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Specifies that this database is read-only and should not be attempted to be
created or written to.`
	},

	/* Lua settings. */

	lua_file: {
		tags: [ 'lua' ],
		values: setting_types.FILE,
		seealso: [
			'[[plugin,mail-lua]]',
			'[[plugin,push-notification-lua]]',
			'[[link,auth_lua]]',
		],
		text: `
Path to lua script to be used. This is used by
* [[plugin,mail-lua]],
* [[plugin,push-notification-lua]], and
* [[link,auth_lua]].`
	},

	lua_settings: {
		tags: [ 'lua' ],
		values: setting_types.STRLIST,
		seealso: [ 'lua_file' ],
		text: `
Key-value pairs that are passed as a table to lua \`script_init()\` functions.`
	},

	/* Dovecot core settings. */

	auth_allow_weak_schemes: {
		default: 'no',
		added: {
			settings_auth_allow_weak_schemes_added: false
		},
		values: setting_types.BOOLEAN,
		text: `
Controls whether password schemes marked as weak are allowed to be used.
See [[link,password_schemes]] for disabled by default schemes.

If enabled, will emit warning to logs. If a disabled scheme is used,
an error is logged.

Notably, any explicitly cleartext schemes (such as PLAIN), CRAM-MD5, and
DIGEST-MD5 are not affected by this setting.`
	},

	auth_anonymous_username: {
		default: 'anonymous',
		values: setting_types.STRING,
		text: `
This specifies the username to be used for users logging in with the
ANONYMOUS SASL mechanism.`
	},

	auth_allow_cleartext: {
		default: 'no',
		values: setting_types.BOOLEAN,
		added: {
			settings_auth_allow_cleartext_added: false
		},
		text: `
If \`no\`, disables the LOGIN command and all other cleartext
authentication unless SSL/TLS is used (LOGINDISABLED capability) or the
connection is secured (see [[setting,ssl]]).

See [[link,ssl_configuration]] for more detailed explanation of how
this setting interacts with the [[setting,ssl]] setting.

This setting replaces the \`disable_plaintext_auth\` setting.`
	},

	auth_cache_negative_ttl: {
		default: '1hour',
		tags: [ 'auth_cache' ],
		values: setting_types.TIME,
		text: `
This sets the time to live for negative hits to passdb or userdb (i.e.,
when the user is not found or there is a password mismatch).

The value \`0\` completely disables caching of these hits.`
	},

	auth_cache_size: {
		default: 0,
		tags: [ 'auth_cache' ],
		values: setting_types.SIZE,
		text: `
The authentication cache size (e.g., \`10M\`).

[[setting,auth_cache_size,0]] disables use of the authentication cache.

A typical passdb cache entry is around 50 bytes and a typical userdb cache
entry is around 100-200 bytes, depending on the amount of information your
user and password database lookups return.`
	},

	auth_cache_ttl: {
		default: '1hour',
		tags: [ 'auth_cache' ],
		values: setting_types.TIME,
		text: `
Time to live for cache entries.

After the TTL expires, the cached record is no longer used, unless the main
database look-up returns internal failure.

Entries are removed from the cache only when the cache is full and a new
entry is to be added.`
	},

	auth_cache_verify_password_with_worker: {
		default: 'no',
		tags: [ 'auth_cache' ],
		values: setting_types.BOOLEAN,
		text: `
The auth master process by default is responsible for the hash
verifications. Setting this to \`yes\` moves the verification to auth-worker
processes. This allows distributing the hash calculations to multiple CPU
cores, which could make sense if strong hashes are used.`
	},

	auth_debug: {
		default: 'no',
		values: setting_types.BOOLEAN,
		deprecated: {
			settings_auth_debug_deprecated: `
The setting is obsolete, and kept only for backwards compatibility.

Use [[setting,log_debug,category=auth]] instead.`
		},
		text: `
Enables all authentication debug logging (also enables
[[setting,auth_verbose]]).

Passwords are logged as \`<hidden>\`.`
	},

	auth_debug_passwords: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
This setting adjusts log verbosity. In the event of password
mismatches, the passwords and the scheme used are logged so that the
problem can be debugged.

Note: You also need to enable [[setting,log_debug,category=auth]].`
	},

	auth_default_domain: {
		added: {
			settings_auth_default_domain_added: false
		},
		values: setting_types.BOOLEAN,
		text: `
This setting indicates the default realm/domain to use if none has
been specified. The setting is used for both SASL realms
and appending an \`@domain\` element to the username in cleartext logins.`
	},

	auth_failure_delay: {
		default: '2secs',
		values: setting_types.TIME,
		seealso: [ 'auth_internal_failure_delay' ],
		text: `
This is the delay before replying to failed authentication attempts.

This setting defines the interval for which the authentication process
flushes all auth failures. Thus, this is the maximum interval a user may
encounter.`
	},

	auth_gssapi_hostname: {
		default: '<name returned by gethostname()>',
		values: setting_types.STRING,
		text: `
This supplies the hostname to use in Generic Security Services API
(GSSAPI) principal names.

Use \`"$ALL"\` (with the quotation marks) to allow all keytab entries.`
	},

	auth_internal_failure_delay: {
		default: '2secs',
		values: setting_types.TIME_MSECS,
		added: {
			settings_auth_internal_failure_delay_added: false
		},
		seealso: [ 'auth_failure_delay' ],
		text: `
The delay before replying to client when authentication fails with
internal failure. An additional 0..50% delay is added on top of this to
prevent thundering herd issues.

This setting is intended to prevent clients from hammering the server with
immediate retries.`
	},

	auth_krb5_keytab: {
		default: '<system default (e.g. /etc/krb5.keytab)>',
		values: setting_types.STRING,
		text: `
This specifies the Kerberos keytab to use for the GSSAPI mechanism.

Note: You may need to set the auth service to run as root in order for
this file to be readable.`
	},

	auth_master_user_separator: {
		values: setting_types.STRING,
		text: `
The separator to use to enable master users to login by specifying the
master username within the normal username string (i.e., not using the SASL
mechanism's master support).

Example:

\`\`\`
# Allows master login of the format <username>*<masteruser>
# E.g. if user = foo, and master_user = muser,
#	login username = foo*muser
auth_master_user_separator = *
\`\`\``
	},

	auth_mechanisms: {
		default: 'plain',
		values: setting_types.BOOLLIST,
		seealso: [ '[[link,authentication_mechanisms]]' ],
		text: `
Here you can supply a space-separated list of the authentication
mechanisms you wish to use.

Example:

\`\`\`[dovecot.conf]
auth_mechanisms = plain login
\`\`\``
	},

	auth_policy: {
		added: {
			settings_auth_policy_added: false,
		},
		tags: [ 'auth_policy' ],
		values: setting_types.NAMED_FILTER,
		seealso: [ '[[link,auth_policy]]' ],
		text: `
Filter for auth policy specific settings.`
	},

	auth_policy_check_after_auth: {
		default: 'yes',
		tags: [ 'auth_policy' ],
		values: setting_types.BOOLEAN,
		seealso: [ 'auth_policy_server_url' ],
		text: `Do policy lookup after authentication is completed?`
	},

	auth_policy_check_before_auth: {
		default: 'yes',
		tags: [ 'auth_policy' ],
		values: setting_types.BOOLEAN,
		seealso: [ 'auth_policy_server_url' ],
		text: `Do policy lookup before authentication is started?`
	},

	auth_policy_hash_mech: {
		default: 'sha256',
		tags: [ 'auth_policy' ],
		values: setting_types.ENUM,
		values_enum: [ 'md4', 'md5', 'sha1', 'sha256', 'sha512' ],
		seealso: [ 'auth_policy_server_url' ],
		text: `Hash mechanism to use for password.`
	},

	auth_policy_hash_nonce: {
		tags: [ 'auth_policy' ],
		values: setting_types.STRING,
		seealso: [ 'auth_policy_server_url' ],
		text: `
Cluster-wide nonce to add to hash.

This should contain a secret randomly generated string, which is the
same for each Dovecot server within the cluster.

REQUIRED configuration when you want to use authentication policy.

Example:

\`\`\`
auth_policy_hash_nonce = <localized_random_string>
\`\`\``
	},

	auth_policy_hash_truncate: {
		default: 12,
		tags: [ 'auth_policy' ],
		values: setting_types.UINT,
		seealso: [ 'auth_policy_server_url' ],
		advanced: true,
		text: `
How many bits to use from password hash when reporting to policy server.`
	},

	auth_policy_log_only: {
		default: 'no',
		tags: [ 'auth_policy' ],
		values: setting_types.BOOLEAN,
		seealso: [ 'auth_policy_server_url' ],
		text: `
Only log what the policy server response would do?

If \`yes\`, no request is made to the policy server.`
	},

	auth_policy_reject_on_fail: {
		default: 'no',
		tags: [ 'auth_policy' ],
		values: setting_types.BOOLEAN,
		seealso: [ 'auth_policy_server_url' ],
		text: `
If policy request fails for some reason, should users be rejected?`
	},

	auth_policy_report_after_auth: {
		default: 'yes',
		tags: [ 'auth_policy' ],
		values: setting_types.BOOLEAN,
		text: `
Report authentication result?

If \`no\`, there will be no report for the authentication result.`
	},

	auth_policy_request_attributes: {
		default: 'login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%{protocol} session_id=%{session} fail_type=%{fail_type}',
		changed: {
			settings_auth_policy_request_attributes_changed: `
Default has changed.`
		},
		tags: [ 'auth_policy' ],
		values: setting_types.STRING,
		seealso: [ 'auth_policy_server_url' ],
		text: `
Request attributes specification.

Variables that can be used for this setting:

- [[variable,auth]]

- \`%{hashed_password}\`

  - Truncated auth policy hash of username and password

- \`%{requested_username}\`

  - Logged in user. Same as \`%{user}\`, except for master user logins the
	same as \`%{login_user}\`.`
	},

	auth_policy_server_api_header: {
		tags: [ 'auth_policy' ],
		values: setting_types.STRING,
		seealso: [ 'auth_policy_server_url' ],
		text: `
Header and value to add to request (for API authentication).

Note: See https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side

This can be used when you are using the weakforced policy server and the
web listener password is "super":

\`\`\`
$ echo -n wforce:super | base64
d2ZvcmNlOnN1cGVy
\`\`\`

Then the correct value for this setting is:

\`\`\`
auth_policy_server_api_header = Authorization: Basic d2ZvcmNlOnN1cGVy
\`\`\``
	},

	auth_policy_server_url: {
		tags: [ 'auth_policy' ],
		values: setting_types.URL,
		text: `
URL of the policy server.

URL is appended with \`?command=allow/report\`. If URL ends with \`&\`, the
\`?\` is not appended.

REQUIRED configuration when you want to use authentication policy.

Example:

\`\`\`
auth_policy_server_url = http://example.com:4001/
\`\`\``
	},

	auth_realms: {
		values: setting_types.BOOLLIST,
		text: `
This setting supplies a list of realms for those SASL authentication mechanisms
that need them. Realms are an integral part of Digest-MD5.

You will need to specify realms you want to advertise to the client in the
config file:

Example:

\`\`\`
auth_realms = example.com another.example.com foo
\`\`\``
	},

	auth_socket_path: {
		default: 'auth-userdb',
		values: setting_types.STRING,
		text: `
The UNIX socket path to the master authentication server for finding users.

It is usually neither necessary nor advisable to change the default.`
	},

	auth_ssl_require_client_cert: {
		default: 'no',
		seealso: [
			'ssl_ca_file',
			'ssl_request_client_cert',
			'[[link,ssl_configuration]]',
		],
		values: setting_types.BOOLEAN,
		text: `
If \`yes\`, authentication fails when a valid SSL client certificate is not
provided.`
	},

	auth_ssl_username_from_cert: {
		default: 'no',
		seealso: [ 'ssl_cert_username_field' ],
		values: setting_types.BOOLEAN,
		text: `
Setting to \`yes\` indicates that the username should be taken from the
client's SSL certificate.

Generally, this will be either \`commonName\` or \`x500UniqueIdentifier\`.

The text is looked up from subject DN's specified field using OpenSSL's
X509_NAME_get_text_by_NID() function. By default the CommonName field is
used. You can change the field with
[[setting,ssl_cert_username_field,name]] setting (parsed using OpenSSL's
OBJ_txt2nid() function).

\`x500UniqueIdentifier\` is a common choice.`
	},

	auth_use_winbind: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
By default, the NTLM mechanism is handled internally.

If \`yes\`, perform NTLM and GSS-SPNEGO authentication with Samba's winbind
daemon and ntlm_auth helper.

This option is useful when you need to authenticate users against a Windows
domain (either AD or NT).`
	},

	auth_username_chars: {
		default: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890.-_@',
		values: setting_types.STRING,
		text: `
The list of the characters allowed in a username.

If the user-supplied username contains a character not listed here, login
automatically fails.

This is an additional check to make sure the user can't exploit any
quote-escaping vulnerabilities that may be connected with SQL/LDAP
databases.

If you want to allow all characters, leave the value empty.`
	},

	auth_username_format: {
		default: '%Lu',
		values: setting_types.STRING,
		text: `
Formatting applied to username before querying the auth database.

You can use the standard variables here.

Examples:

- \`%Lu\`: Lowercases the username
- \`%n\`: Drops the domain if one was supplied
- \`%n-AT-%d\`: Changes the "@" symbol into "-AT-" before lookup

This translation is done after the changes specified with the
[[setting,auth_username_translation]] setting.`
	},

	auth_username_translation: {
		values: setting_types.STRING,
		advanced: true,
		text: `
If set, performs username character translations before querying the auth
database.

The value is a string formed of sets of \`from\` and \`to\` characters
alternating.

A value of \`#@/@\` means that \`#\` and \`/\` will both be translated to
the \`@\` character.`
	},

	auth_verbose: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
Adjust log verbosity.

If \`yes\`, log unsuccessful authentication attempts and why they failed.`
	},

	auth_verbose_passwords: {
		default: 'no',
		values: setting_types.ENUM,
		values_enum: [ 'no', 'yes', 'plain', 'sha1' ],
		text: `
In case of password mismatches, log the attempted password. You can also
truncate the logged password to \`n\` chars by appending \`:n\` (e.g.
\`sha1:6\`).

Available transformations:

- \`plain\`, \`yes\`: Output cleartext password (NOT RECOMMENDED)
- \`sha1\`: Output SHA1 hashed password`
	},

	auth_winbind_helper_path: {
		values: setting_types.STRING,
		text: `
This setting tells the system the path for Samba's ntlm_auth helper binary.

Example:

\`\`\`
auth_winbind_helper_path = /usr/bin/ntlm_auth
\`\`\``
	},

	auth_worker_max_count: {
		default: 30,
		values: setting_types.UINT,
		text: `
Maximum number of dovecot-auth worker processes active.

The auth workers are used to execute blocking passdb and userdb queries
(e.g., MySQL and PAM). They are automatically created and destroyed as
necessary.`
	},

	base_dir: {
		default: '/var/run/dovecot/',
		values: setting_types.STRING,
		advanced: true,
		text: `
The base directory in which Dovecot should store runtime data.

This can be used to override the base directory determined at compile time.`
	},

	cdb_path: {
		tags: [ 'dict', 'dict-cdb' ],
		values: setting_types.STRING,
		text: `
Path to the CDB database file.`
	},

	debug_log_path: {
		default: '[[setting,info_log_path]]',
		values: setting_types.STRING,
		text: `The log file to use for debug messages.`
	},

	default_internal_group: {
		default: 'dovecot',
		seealso: [ 'default_internal_user' ],
		values: setting_types.STRING,
		text: `Define the default internal group.`
	},

	default_internal_user: {
		default: 'dovecot',
		seealso: [ 'default_internal_group' ],
		values: setting_types.STRING,
		text: `
Define the default internal user.

Unprivileged processes run under the ID of the internal user. This
user should be distinct from the login user, to prevent login processes
from disturbing other processes.`
	},

	default_login_user: {
		default: 'dovenull',
		values: setting_types.STRING,
		text: `
The user the login process should run as.

This is the least trusted user in Dovecot: this user should not have access
to anything at all.`
	},

	deliver_log_format: {
		default: 'msgid=%m: %$',
		values: setting_types.STRING_NOVAR,
		text: `
The format to use for logging mail deliveries.

Variables that can be used for this setting (see [[variable,global]]):

| Variable Name | Short Form | Description |
| ------------- | ---------- | ----------- |
| \`%$\` | | Delivery status message (e.g., saved to INBOX) |
| \`%{msgid}\` | \`%m\` | Message-ID |
| \`%{subject}\` | \`%s\` | Subject |
| \`%{from}\` | \`%f\` | From address |
| \`%{from_envelope}\` | \`%e\` | SMTP FROM envelope |
| \`%{size}\` | \`%p\` | Physical size |
| \`%{vsize}\` | \`%w\` | Virtual size |
| \`%{to_envelope}\` | | RCPT TO envelope |
| \`%{delivery_time}\` | | How many milliseconds to deliver the mail |
| \`%{session_time}\` | | LMTP session duration, not including \`%{delivery_time}\` |
| \`%{storage_id}\` | | Backend-specific ID for mail, e.g. Maildir filename |

Example:

\`\`\`
deliver_log_format = stime=%{session_time} msgid=%m: %$
\`\`\``
	},

	dict: {
		tags: [ 'dict' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'dict_name', 'dict_driver' ],
		text: `
Creates a new dict. The filter name refers to the [[setting,dict_name]]
setting.

Example:

\`\`\`[dovecot.conf]
dict file {
  # ...
}
\`\`\`

Since an empty [[setting,dict_driver]] defaults to [[setting,dict_name]], there
is no need to specify the [[setting,dict_driver]] setting explicitly.`
	},

	dict_name: {
		tags: [ 'dict' ],
		values: setting_types.STRING,
		seealso: [ 'dict_driver' ],
		text: `
Name of the dict. The [[setting,dict_driver]] setting defaults to this.`
	},

	dict_driver: {
		tags: [ 'dict' ],
		values: setting_types.STRING,
		default: '<dict_name>',
		text: `
The dict driver to use. Defaults to [[setting,dict_name]].`
	},

	dict_file_path: {
		tags: [ 'dict', 'dict-file' ],
		values: setting_types.STRING,
		text: `
Path for the dictionary file.`
	},

	dict_proxy_name: {
		tags: [ 'dict', 'dict-proxy' ],
		values: setting_types.STRING,
		seealso: [ 'dict_name' ],
		text: `
Name of the dict to access in the dict server. This refers to the
[[setting,dict_name]] setting.`
	},

	dict_proxy_socket_path: {
		tags: [ 'dict', 'dict-proxy' ],
		values: setting_types.STRING,
		default: 'dict',
		text: `
Points to the dict server's UNIX socket. The path is relative to the the
[[setting,base_dir]] setting. This should be changed to \`dict-async\` if the
dict driver supports asynchronous lookups (e.g. ldap, pgsql, cassandra, NOT
mysql). The \`dict-async\` service allows more than one client, so this
configuration prevents creating unnecessarily many dict processes.`
	},

	dict_proxy_idle_timeout: {
		tags: [ 'dict', 'dict-proxy' ],
		values: setting_types.TIME_MSECS,
		default: 0,
		text: `
How long to keep the connection open to dict server before disconnecting. \`0\`
means immediate disconnection after finishing the operation.`
	},

	dict_proxy_slow_warn: {
		tags: [ 'dict', 'dict-proxy' ],
		values: setting_types.TIME_MSECS,
		default: '5s',
		text: `
Log a warning about dict lookups that take longer than this interval.`
	},

	redis_socket_path: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.STRING,
		text: `
UNIX socket path to the Redis server. This is preferred over
[[setting,redis_host]] if both are set.`
	},

	redis_host: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.STRING,
		default: '127.0.0.1',
		text: `
Redis server host.`
	},

	redis_port: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.UINT,
		default: 6379,
		text: `
Value Range: \`<1-65535>\`

Redis server port.`
	},

	redis_password: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.STRING,
		text: `
Redis server password.`
	},

	redis_db_id: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.UINT,
		default: 0,
		text: `
Database number.`
	},

	redis_key_prefix: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.STRING,
		text: `
Prefix to add to all keys.`
	},

	redis_expire: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.TIME,
		default: 'infinite',
		text: `
Expiration value for all keys.`
	},

	redis_request_timeout: {
		tags: [ 'dict', 'dict-redis' ],
		values: setting_types.TIME_MSECS,
		default: '30s',
		text: `
How long to wait for answer before aborting request.`
	},

	dict_map: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'dict_map_pattern' ],
		text: `
Creates a new dict mapping. The filter name refers to the
[[setting,dict_map_pattern]] setting.`
	},

	dict_map_pattern: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.STRING,
		text: `
Pattern that is matched to the accessed dict keys. The [[setting,dict_map]]
filter name refers to this setting. If the pattern matches the key, this dict
map (and no other) is used. The dict maps are processed in the order listed in
the configuration file.`
	},

	dict_map_sql_table: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.STRING,
		text: `
SQL table to use for accessing this dict map.`
	},

	dict_map_username_field: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.STRING,
		text: `
Field in the SQL table to use for accessing private dict keys in this dict map.
This setting is optional if only shared keys are accessed.`
	},

	dict_map_expire_field: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.STRING,
		text: `
Field in the SQL table to use for tracking dict key expiration. This field is
optional if no expiration is used by the code accessing the dict map.`
	},

	dict_map_value: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'dict_map_value_name' ],
		text: `
Creates a new value for the dict map. The filter name refers to the
[[setting,dict_map_value_name]] setting. Dict supports reading/writing multiple
values for the same key.`
	},

	dict_map_field: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'dict_map_field_pattern' ],
		text: `
Creates a new field for the dict map. The filter name refers to the
[[setting,dict_map_field_pattern]] setting. The fields are part of the SQL
query looking up the dict key.`
	},

	dict_map_value_name: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.STRING,
		seealso: [ 'dict_map_value' ],
		text: `
Field in the SQL table to use for the [[setting,dict_map_value]].`
	},

	dict_map_value_type: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.ENUM,
		values_enum: [ 'string', 'int', 'uint', 'double', 'hexblob', 'uuid' ],
		default: 'string',
		seealso: [ 'dict_map_value' ],
		text: `
Type of the field in the SQL table for the [[setting,dict_map_value]].`
	},

	dict_map_field_pattern: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.STRING,
		seealso: [ 'dict_map_pattern', 'dict_map_field' ],
		text: `
Variable in the [[setting,dict_map_pattern]] that maps to this
[[setting,dict_map_field]]. The value must always begin with \`$\`.`
	},

	dict_map_field_name: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.STRING,
		seealso: [ 'dict_map_field' ],
		text: `
Field in the SQL table to use for the [[setting,dict_map_field]].`
	},

	dict_map_field_type: {
		tags: [ 'dict', 'dict-sql' ],
		values: setting_types.ENUM,
		values_enum: [ 'string', 'int', 'uint', 'double', 'hexblob', 'uuid' ],
		default: 'string',
		seealso: [ 'dict_map_field' ],
		text: `
Type of the field in the SQL table for the [[setting,dict_map_field]].`
	},

	dict_server: {
		tags: [ 'dict', 'dict-server' ],
		values: setting_types.NAMED_FILTER,
		seealso: [ 'dict' ],
		text: `
Named filter for the dict server settings. Add the available named dicts for
the dict server under this filter using the [[setting,dict]] settings.

For example:

\`\`\`[dovecot.conf]
dict_server {
  dict quota {
    driver = sql
    # ...
  }
  dict acl {
    driver = file
    # ...
  }
}
\`\`\``
	},

	dotlock_use_excl: {
		default: 'yes',
		values: setting_types.BOOLEAN,
		text: `
If \`yes\`, rely on O_EXCL to work when creating dotlock files.

NFS has supported O_EXCL since version 3, so \`yes\` should be safe to use
by default.`
	},

	doveadm_allowed_commands: {
		default: 'ALL',
		values: setting_types.BOOLLIST,
		text: `
Lists the commands that the client may use with the doveadm server.

The setting \`ALL\` allows all commands.`
	},

	doveadm_api_key: {
		values: setting_types.STRING,
		text: `
Set an API key for use of the HTTP API for the doveadm server.

If set, the key must be included in the HTTP request (via X-API-Key header)
base64 encoded.`
	},

	doveadm_password: {
		values: setting_types.STRING,
		text: `
The doveadm client and server must have a shared secret. This setting
configures the doveadm server's password, used for client authentication.

Because it grants access to users' mailboxes, it must be kept secret.`
	},

	doveadm_port: {
		default: 0,
		values: setting_types.IN_PORT,
		text: `
The destination port to be used for the next doveadm proxying hop.

A value of \`0\` means that proxying is not in use.`
	},

	doveadm_server: {
		values: setting_types.NAMED_FILTER,
		text: `
Filter for doveadm server specific settings.`
	},

	doveadm_socket_path: {
		default: 'doveadm-server',
		values: setting_types.STRING,
		text: `
The UNIX socket or host (\`host:port\` syntax is allowed) for connecting to
the doveadm server.`
	},

	doveadm_ssl: {
		default: 'no',
		values: setting_types.ENUM,
		values_enum: [ 'no', 'ssl', 'starttls' ],
		text: `TODO`
	},

	doveadm_username: {
		default: 'doveadm',
		values: setting_types.STRING,
		text: `The username for authentication to the doveadm service.`
	},

	doveadm_worker_count: {
		default: 0,
		values: setting_types.UINT,
		text: `
If the worker count set here is non-zero, mail commands are run via this
many connections to the doveadm service.

If \`0\`, commands are run directly in the same process.`
	},

	dovecot_config_version: {
		values: setting_types.STRING,
		added: {
			settings_dovecot_config_version_added: false
		},
		text: `
Dovecot configuration version. It uses the same versioning as Dovecot in
general, e.g. \`3.0.5\`. This must be the first setting in the
configuration file. It specifies the configuration syntax, the used setting
names and the expected default values.

When there are default configuration changes in newer Dovecot versions, the
existing installations will continue to work the same as before with the same
default settings until this version number is increased. If there are other
configuration changes, the old configuration will either keep working or there
will be a clear failure at startup.`
	},

	dovecot_storage_version: {
		values: setting_types.STRING,
		added: {
			settings_dovecot_storage_version_added: false
		},
		text: `
Dovecot storage file format version. It uses the same versioning as Dovecot in
general, e.g. \`3.0.5\`. It specifies the oldest Dovecot version
that must be able to read files written by this Dovecot instance. The intention
is that when upgrading Dovecot cluster, this setting is first kept as the old
Dovecot version. Once the cluster is fully upgraded to a new version and
there is no intention to rollback to the old version anymore, this version
number can be increased.`
	},

	dsync_alt_char: {
		default: '_',
		tags: [ 'dsync' ],
		values: setting_types.STRING,
		text: `
When the source and destination mailbox formats are different, it's
possible for a mailbox name to exist on one source that isn't valid for
the destination. Any invalid characters are replaced with the
character indicated here.`
	},

	dsync_commit_msgs_interval: {
		default: 100,
		tags: [ 'dsync' ],
		values: setting_types.UINT,
		text: `
Dsync will commit this number of messages incrementally, to avoid huge
transactions that fail.`
	},

	dsync_features: {
		tags: [ 'dsync' ],
		values: setting_types.STRING,
		text: `
This setting specifies features and workarounds that can be used with
dsync. Options are specified in this setting via a space-separated list.

Available options:

\`empty-header-workaround\`
:   Workaround for servers (e.g. Zimbra) that sometimes send FETCH replies
    containing no headers.

\`no-header-hashes\`
:   When this setting is enabled and one dsync side doesn't support mail
    GUIDs (i.e. imapc), there is no fallback to using header hashes. Instead,
    dsync assumes that all mails with identical IMAP UIDs contain the same
    mail contents. This can significantly improve dsync performance with some
    IMAP servers that don't support caching Date/Message-ID headers.`
	},

	dsync_hashed_headers: {
		tags: [ 'dsync' ],
		default: 'Date Message-ID',
		values: setting_types.STRING,
		advanced: true,
		text: `
Which email headers are used in incremental syncing for checking whether
the local email matches the remote email?

Format: a space-separated list of headers.

This list should only include headers that can be efficiently downloaded
from the remote server.`
	},

	event_exporter: {
		tags: [ 'event-export' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'event_exporter_name' ],
		text: `
Creates a new event exporter. The filter name refers to the
[[setting,event_exporter_name]] setting.`
	},

	event_exporter_driver: {
		tags: [ 'event-export' ],
		values: setting_types.ENUM,
		values_enum: [ 'log', 'file', 'unix', 'http-post', 'drop' ],
		default: 'log',
		seealso: [ '[[link,event_export_drivers]]' ],
		text: `
The event exporter driver to use.`
	},

	event_exporter_http_post_url: {
		tags: [ 'event-export' ],
		values: setting_types.STRING,
		text: `
Target URL for [[setting,event_exporter_driver,http-post]].`
	},

	event_exporter_file_path: {
		tags: [ 'event-export' ],
		values: setting_types.STRING,
		text: `
Path to event log file with [[setting,event_exporter_driver,file]].`
	},

	event_exporter_format: {
		tags: [ 'event-export' ],
		values: setting_types.STRING,
		seealso: [ '[[link,event_export_formats]]' ],
		text: `
Format used for serializing the event.`
	},

	event_exporter_name: {
		tags: [ 'event-export' ],
		values: setting_types.STRING,
		seealso: [ 'metric_exporter' ],
		text: `
Name of the event exporter. It is referred by the [[setting,metric_exporter]]
settings.`
	},

	event_exporter_time_format: {
		tags: [ 'event-export', 'event-exporter-format' ],
		values: setting_types.ENUM,
		values_enum: [ 'rfc3339', 'unix' ],
		default: 'rfc3339',
		seealso: [ '[[link,event_export_formats]]' ],
		text: `
\`rfc3339\`
:   Serialize timestamps as strings using the [[rfc,3339]] format
    (\`YYYY-MM-DDTHH:MM:SS.uuuuuuZ\`).

\`unix\`
:   Serialize timestamps as a floating point number of seconds since the Unix
    epoch.`
	},

	event_exporter_unix_connect_timeout: {
		tags: [ 'event-export' ],
		values: setting_types.TIME_MSECS,
		default: '250ms',
		seealso: [ 'event_exporter_unix_path' ],
		text: `
Timeout when connecting to unix socket with
[[setting,event_exporter_driver,unix]].`
	},

	event_exporter_unix_path: {
		tags: [ 'event-export' ],
		values: setting_types.STRING,
		seealso: [ 'event_exporter_unix_connect_timeout' ],
		text: `
Path to event unix socket with [[setting,event_exporter_driver,unix]].`
	},

	execute: {
		tags: [ 'execute' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ '[[link,execute_scripts]]' ],
		text: `
Configure external execution script. Used by various different features, such
as [[link,welcome]]. Currently only a single execute block (per feature) is
allowed.`
	},

	execute_args: {
		tags: [ 'execute' ],
		values: setting_types.STRING,
		text: `
External execution script arguments. The parameters are split by space
characters. Currently escape characters are not supported.`
	},

	execute_driver: {
		tags: [ 'execute' ],
		values: setting_types.ENUM,
		values_enum: [ 'unix', 'fork', 'tcp' ],
		seealso: [ '[[link,execute_scripts]]' ],
		text: `
How to execute the external script:

\`unix\`
:   Use UNIX socket connection to a \`script\` service listening in
    [[setting,execute_unix_socket_path]].

\`fork\`
:   Fork and execute the [[setting,execute_fork_path]] binary directly.

\`tcp\`
:   Use TCP connection to a \`script\` service listening in
    [[setting,execute_tcp_host]]:[[setting,execute_tcp_port]].`
	},

	execute_fork_path: {
		tags: [ 'execute' ],
		values: setting_types.STRING,
		default: '[[setting,execute_name]]',
		text: `
Path to the binary that is executed with [[setting,execute_driver,fork]].`
	},

	execute_name: {
		tags: [ 'execute' ],
		values: setting_types.STRING,
		text: `
Name of the execution script. This is the [[setting,execute]] named filter
name. It is also used to provide a default driver-specific settings:

\`unix\`
:   Used as the default for [[setting,execute_unix_socket_path]].

\`fork\`
:   Used as the default for [[setting,execute_fork_path]].

\`tcp\`
:   Used as the default for [[setting,execute_tcp_host]]:[[setting,execute_tcp_port]].`
	},

	execute_tcp_host: {
		tags: [ 'execute' ],
		values: setting_types.STRING,
		default: '[[setting,execute_name,host:]]',
		text: `
TCP host where to connect to with [[setting,execute_driver,tcp]].`
	},

	execute_tcp_port: {
		tags: [ 'execute' ],
		values: setting_types.STRING,
		default: '[[setting,execute_name,:port]]',
		text: `
TCP port where to connect to with [[setting,execute_driver,tcp]].`
	},

	execute_unix_socket_path: {
		tags: [ 'execute' ],
		values: setting_types.STRING,
		default: '[[setting,execute_name]]',
		text: `
UNIX socket path where to connect to with [[setting,execute_driver,unix]].`
	},

	fifo_listener: {
		tags: [ 'service' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'service', 'fifo_listener_path' ],
		text: `
Creates a new FIFO listener for a [[setting,service]]. The filter name refers
to the [[setting,fifo_listener_path]] setting.`
	},

	fifo_listener_path: {
		tags: [ 'service' ],
		values: setting_types.STRING_NOVAR,
		seealso: [ 'base_dir', 'fifo_listener' ],
		text: `
Path to the FIFO, relative to [[setting,base_dir]] setting. The
[[setting,fifo_listener]] filter name refers to this setting.`
	},

	fifo_listener_type: {
		tags: [ 'service' ],
		added: {
			settings_fifo_listener_type_added: false,
		},
		values: setting_types.STRING,
	text: `
Listener type. This string value has service-specific meaning and is used to
distinguish different listener types that one service may employ.`
	},

	fifo_listener_mode: {
		tags: [ 'service' ],
		values: setting_types.OCTAL_UINT,
		default: '0600',
		text: `
Mode of the file. Note that \`0600\` is an octal value, while \`600\` is a
different decimal value. Setting mode to \`0\` disables the listener.`
	},

	fifo_listener_user: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		text: `
Owner of the listener file. Empty (default) means UID 0 (root).`
	},

	fifo_listener_group: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		text: `
	Group of the listener file. Empty (default) means GID 0 (root/wheel).`
	},

	first_valid_gid: {
		default: 1,
		seealso: [ 'last_valid_gid' ],
		values: setting_types.UINT,
		text: `
This setting and [[setting,last_valid_gid]] specify the valid GID
range for users.

A user whose primary GID is outside this range is not allowed to log in.

If the user belongs to any supplementary groups, the corresponding IDs are
not set.`
	},

	first_valid_uid: {
		default: 500,
		seealso: [ 'last_valid_uid' ],
		values: setting_types.UINT,
		text: `
This setting and [[setting,last_valid_uid]] specify the valid UID
range for users.

A user whose UID is outside this range is not allowed to log in.`
	},

	haproxy_timeout: {
		default: '3secs',
		tags: [ 'haproxy' ],
		values: setting_types.TIME,
		text: `
When to abort the HAProxy connection when no complete header has been
received.`
	},

	haproxy_trusted_networks: {
		tags: [ 'haproxy' ],
		values: setting_types.STRING,
		text: `
A space-separated list of trusted network ranges for HAProxy connections.

Connections from networks outside these ranges to ports that are configured
for HAProxy are aborted immediately.`
	},

	hostname: {
		default: '<system\'s real hostname@domain.tld>',
		tags: [ 'submission' ],
		values: setting_types.STRING,
		text: `
The hostname to be used in email messages sent out by the local delivery
agent (such as the Message-ID: header), in LMTP replies, and as the
hostname advertised by submission SMTP service.`
	},

	http_client_auto_redirect: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.BOOLEAN,
		default: 'yes',
		seealso: [ 'http_client_request_max_redirects' ],
		text: `
If this setting is \`yes\` redirects are handled as long as
[[setting,http_client_request_max_redirects]] isn't reached. If \`no\` the
redirect responses are handled as regular failure responses.

::: warning
This setting should likely be changed only in the code, never in configuration.
:::`
	},

	http_client_auto_retry: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.BOOLEAN,
		default: 'yes',
		seealso: [ 'http_client_request_max_attempts' ],
		text: `
If this setting is \`no\` requests are not automatically retried by the generic
HTTP client code. It's still possible to retry the requests with explicit
\`http_client_request_try_retry()\` calls as long as
[[setting,http_client_request_max_attempts]] isn't reached.

::: warning
This setting should likely be changed only in the code, never in configuration.
:::`
	},

	http_client_connect_backoff_max_time: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.TIME_MSECS,
		default: '1 min',
		text: `
Maximum backoff time for retries.`
	},

	http_client_connect_backoff_time: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.TIME_MSECS,
		default: '100 ms',
		text: `
Initial backoff time for retries. It's doubled at each connection failure.`
	},

	http_client_connect_timeout: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.TIME_MSECS,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		seealso: [ 'http_client_request_timeout' ],
		text: `
Max time to wait for TCP connect and SSL handshake to finish before retrying.
\`0\` = use [[setting,http_client_request_timeout]].`
	},

	http_client_delete_request_max_attempts: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		seealso: [ 'http_client_request_max_attempts' ],
		text: `
If non-zero, override [[setting,http_client_request_max_attempts]] for
\`DELETE\` requests.`
	},

	http_client_delete_request_timeout: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.TIME_MSECS,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		seealso: [ 'http_client_request_timeout' ],
		text: `
If non-zero, override [[setting,http_client_request_timeout]] for
\`DELETE\` requests.`
	},

	http_client_dns_client_socket_path: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.STRING,
		default: 'dns-client',
		text: `
UNIX socket path to the dns-client service.`
	},

	http_client_dns_ttl: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.TIME_MSECS,
		default: '30 mins',
		text: `
How long to cache DNS entries.`
	},

	http_client_max_auto_retry_delay: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.TIME,
		default: 0,
		text: `
Maximum acceptable delay for automatically retrying/redirecting requests. If a
server sends a response with a \`Retry-After\` header that causes a delay
longer than this, the request is not automatically retried and the response is
returned.`
	},

	http_client_max_connect_attempts: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		text: `
Maximum number of connection attempts to a host before all associated requests fail.

If non-zero, the maximum will be enforced across all IPs for that host, meaning
that IPs may be tried more than once eventually if the number of IPs is smaller
than the specified maximum attempts. If the number of IPs is higher than the
maximum attempts not all IPs are tried.

If \`0\`, all IPs are tried at most once.`
	},

	http_client_max_idle_time: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.TIME_MSECS,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		text: `
Maximum time a connection will idle. If parallel connections are idle, the
duplicates will end earlier based on how many idle connections exist to that
same service.`
	},

	http_client_max_parallel_connections: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 1,
		text: `
Maximum number of parallel connections per peer.`
	},

	http_client_max_pipelined_requests: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 1,
		text: `
Maximum number of pipelined requests per connection.`
	},

	http_client_proxy_password: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.STRING,
		added: {
			settings_http_client_settings_added: false,
		},
		text: `
Password for HTTP proxy.`
	},

	http_client_proxy_socket_path: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.STRING,
		added: {
			settings_http_client_settings_added: false,
		},
		seealso: [ 'http_client_proxy_url' ],
		text: `
UNIX socket path for HTTP proxy. Overrides [[setting,http_client_proxy_url]].`
	},

	http_client_proxy_ssl_tunnel: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.BOOLEAN,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 'yes',
		text: `
If \`no\` the HTTP proxy delegates SSL negotiation to proxy, rather than
creating a \`CONNECT\` tunnel through the proxy for the SSL link.`
	},

	http_client_proxy_url: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.STRING,
		added: {
			settings_http_client_settings_added: false,
		},
		seealso: [ 'http_client_proxy_socket_path' ],
		text: `
URL for HTTP proxy. Ignored if [[setting,http_client_proxy_socket_path]] is
set.`
	},

	http_client_proxy_username: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.STRING,
		added: {
			settings_http_client_settings_added: false,
		},
		text: `
Username for HTTP proxy.`
	},

	http_client_rawlog_dir: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.STRING,
		added: {
			settings_http_client_settings_added: false,
		},
		text: `
Directory for writing raw log data for debugging purposes.`
	},

	http_client_read_request_max_attempts: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		seealso: [ 'http_client_request_max_attempts' ],
		text: `
If non-zero, override [[setting,http_client_request_max_attempts]] for \`GET\`
and \`HEAD\` requests.`
	},

	http_client_read_request_timeout: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.TIME_MSECS,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		seealso: [ 'http_client_request_timeout' ],
		text: `
If non-zero, override [[setting,http_client_request_timeout]] for \`GET\` and
\`HEAD\` requests.`
	},

	http_client_request_absolute_timeout: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		text: `
Max total time to wait for HTTP request to finish, including all retries. \`0\`
means no limit.`
	},

	http_client_request_max_attempts: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 1,
		text: `
Maximum number of attempts for a request.`
	},

	http_client_request_max_redirects: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		text: `
Maximum number of redirects for a request. \`0\` = redirects refused.`
	},

	http_client_request_timeout: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.TIME_MSECS,
		added: {
			settings_http_client_settings_added: false,
		},
		default: '1 min',
		text: `
Max time to wait for HTTP requests to finish before retrying.`
	},

	http_client_response_hdr_max_field_size: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.SIZE,
		default: '8k',
		text: `
Response header limit: Max size for an individual field.`
	},

	http_client_response_hdr_max_fields: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.UINT,
		default: 50,
		text: `
Response header limit: Max number of fields.`
	},

	http_client_response_hdr_max_size: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.SIZE,
		default: '200k',
		text: `
Response header limit: Max size for the entire response header.`
	},

	http_client_socket_recv_buffer_size: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.SIZE,
		default: 0,
		text: `
The kernel receive buffer size for the connection sockets. \`0\` = kernel
defaults.`
	},

	http_client_socket_send_buffer_size: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.SIZE,
		default: 0,
		text: `
The kernel send buffer size for the connection sockets. \`0\` = kernel
defaults.`
	},

	http_client_soft_connect_timeout: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.TIME_MSECS,
		default: 0,
		text: `
Time to wait for TCP connect and SSL handshake to finish for the first
connection before trying the next IP in parallel. \`0\` = wait until current
connection attempt finishes.`
	},

	http_client_user_agent: {
		advanced: true,
		tags: [ 'http', 'http_client' ],
		added: {
			settings_http_client_settings_added: false,
		},
		values: setting_types.STRING,
		text: `
\`User-Agent:\` header to send.`
	},

	http_client_write_request_max_attempts: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.UINT,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		seealso: [ 'http_client_request_max_attempts' ],
		text: `
If non-zero, override [[setting,http_client_request_max_attempts]] for \`PUT\`
and \`POST\` requests.`
	},

	http_client_write_request_timeout: {
		tags: [ 'http', 'http_client' ],
		values: setting_types.TIME_MSECS,
		added: {
			settings_http_client_settings_added: false,
		},
		default: 0,
		seealso: [ 'http_client_request_timeout' ],
		text: `
If non-zero, override [[setting,http_client_request_timeout]] for \`PUT\` and
\`POST\` requests.`
	},

	http_server_default_host: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.STRING,
		text: `
Overwrite the local hostname with http_server_default_host.`
	},

	http_server_max_idle_time: {
		tags: [ 'http', 'http-server' ],
		values: setting_types.TIME_MSECS,
		default: 0,
		text: `
Maximum time a connection will idle.`
	},

	http_server_max_payload_size: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.SIZE,
		default: '10G',
		text: `
Request payload limit: Max size for the request payload.`
	},

	http_server_max_pipelined_requests: {
		tags: [ 'http', 'http-server' ],
		values: setting_types.UINT,
		default: 1,
		text: `
Maximum number of pipelined requests per connection.`
	},

	http_server_max_target_length: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.SIZE,
		default: '8k',
		text: `
Request target limit: Maximum length of the request target.`
	},

	http_server_request_hdr_max_field_size: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.SIZE,
		default: '8k',
		text: `
Request header limit: Max size for an individual field.`
	},

	http_server_request_hdr_max_fields: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.UINT,
		default: 50,
		text: `
Request header limit: Max number of fields.`
	},

	http_server_request_hdr_max_size: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.SIZE,
		default: '200k',
		text: `
Request header limit: Max size for the entire request header.`
	},

	http_server_socket_recv_buffer_size: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.SIZE,
		default: 0,
		text: `
The kernel receive buffer size for the connection sockets. \`0\` = kernel
defaults.`
	},

	http_server_socket_send_buffer_size: {
		advanced: true,
		tags: [ 'http', 'http-server' ],
		values: setting_types.SIZE,
		default: '0',
		text: `
The kernel send buffer size for the connection sockets. \`0\` = kernel
defaults.`
	},

	http_server_rawlog_dir: {
		tags: [ 'http', 'http-server' ],
		values: setting_types.STRING,
		text: `
Directory for writing raw log data for debugging purposes.`
	},

	imap_capability: {
		tags: [ 'imap' ],
		values: setting_types.BOOLLIST,
		text: `
Override the IMAP CAPABILITY response.

Example of modifying capability banner by adding QUOTA and ACL, and removing IDLE:

\`\`\`
imap_capability {
  QUOTA = yes
  ACL = yes
  IDLE = no
}
\`\`\`

Example of setting capability banner to exactly IMAP4rev1 SASL-IR IDLE:

\`\`\`
imap_capability = IMAP4rev1 SASL-IR IDLE
\`\`\``
	},

	imap_client_workarounds: {
		tags: [ 'imap' ],
		values: setting_types.BOOLLIST,
		text: `
Workarounds for various IMAP client bugs can be enabled here.

The following values are currently supported:

\`delay-newmail\`
:   EXISTS/RECENT new-mail notifications are sent only in replies to NOOP
    and CHECK commands. Some clients, such as pre-2.1 versions of Mac OS X
    Mail, ignore them otherwise, and, worse, Outlook Express may report
    that the message is no longer on the server (note that the workaround
    does not help for OE6 if synchronization is set to Headers Only).

\`tb-extra-mailbox-sep\`
:   Because [[setting,mailbox_list_layout,fs]] (mbox and dbox) confuses
    Thunderbird, causing extra / suffixes to mailbox names, Dovecot can be told
    to ignore the superfluous character instead of judging the mailbox name to
    be invalid.

\`tb-lsub-flags\`
:   Without this workaround, Thunderbird doesn't immediately recognize
    that LSUB replies with [[setting,mailbox_list_layout,fs]] aren't
    selectable, and users may receive pop-ups with not selectable errors.
    Showing \\Noselect flags for these replies (e.g., in mbox use) causes them
    to be grayed out.`
	},

	'imap_compress_<algorithm>_level': {
		default: '<algorithm dependent>',
		tags: ['imap'],
		values: setting_types.UINT,
		text: `
Defines the compression level for the given algorithm.

Per [[rfc,4978]], only the deflate algorithm is currently supported.

| Algorithm | Minimum | Default | Maximum |
| --------- | ------- | ------- | ------- |
| \`deflate\` | 0 (no compression) | 6 | 9 |`
	},

	imap_fetch_failure: {
		default: 'disconnect-immediately',
		tags: [ 'imap' ],
		values: setting_types.ENUM,
		values_enum: [ 'disconnect-after', 'disconnect-immediately', 'no-after' ],
		text: `
Behavior when IMAP FETCH fails due to some internal error. Options:

\`disconnect-immediately\`
:   The FETCH is aborted immediately and the IMAP client is disconnected.

\`disconnect-after\`
:   The FETCH runs for all the requested mails returning as much data as
    possible. The client is finally disconnected without a tagged reply.

\`no-after\`
:   Same as disconnect-after, but tagged NO reply is sent instead of
    disconnecting the client.

    If the client attempts to FETCH the same failed mail more than once,
    the client is disconnected.

    This is to avoid clients from going into infinite loops trying to FETCH
    a broken mail.`
	},

	imap_hibernate_timeout: {
		default: 0,
		tags: [ 'imap' ],
		values: setting_types.TIME,
		text: `
How long to wait while the client is in IDLE state before moving the
connection to the hibernate process, to save on memory use, and close the
existing IMAP process.

If nothing happens for this long while client is IDLEing, move the
connection to imap-hibernate process and close the old imap process. This
saves memory, because connections use very little memory in imap-hibernate
process. The downside is that recreating the imap process back uses some
additional system resources.`
	},

	imap_id_retain: {
		default: 'no',
		tags: [ 'imap' ],
		values: setting_types.BOOLEAN,
		text: `
When proxying IMAP connections to other hosts, this variable must be
enabled to forward the IMAP ID command provided by the client.

This setting enables the \`%{client_id}\` variable for auth processes. See
[[variable,auth]].`
	},

	imap_id_send: {
		default: 'name=%{dovecot:name}',
		tags: [ 'imap' ],
		values: setting_types.STRLIST,
		text: `
Which ID field names and values to send to clients.

You can access the default values by using
[[link,settings_variables_distribution_variables]].

\`\`\`[dovecot.conf]
imap_id_send {
  name = %{dovecot:name}
  version = %{dovecot:version}
  support-url = http://example.com/
}
\`\`\``
	},

	imap_idle_notify_interval: {
		default: '2mins',
		tags: [ 'imap' ],
		values: setting_types.TIME,
		advanced: true,
		text: `
The amount of time to wait between "OK Still here" untagged IMAP responses
when the client is in IDLE operation.`
	},

	imap_literal_minus: {
		default: 'no',
		tags: [ 'imap' ],
		values: setting_types.BOOLEAN,
		text:
`Enable IMAP LITERAL- ([[rfc,7888]]) extension (replaces LITERAL+)?`
	},

	imap_logout_format: {
		default: 'in=%i out=%o deleted=%{deleted} expunged=%{expunged} trashed=%{trashed} hdr_count=%{fetch_hdr_count} hdr_bytes=%{fetch_hdr_bytes} body_count=%{fetch_body_count} body_bytes=%{fetch_body_bytes}',
		tags: [ 'imap' ],
		values: setting_types.STRING_NOVAR,
		text: `
This setting specifies the IMAP logout format string. Supported variables,
in addition to [[variable,mail-user]] are:

| Variable Name | Short Form | Description |
| ------------- | ---------- | ----------- |
| \`%{input}\` | \`%i\` | Total number of bytes read from client |
| \`%{output}\` | \`%o\` | Total number of bytes sent to client |
| \`%{fetch_hdr_count}\` | | Number of mails with mail header data sent to client |
| \`%{fetch_hdr_bytes}\` | | Number of bytes with mail header data sent to client |
| \`%{fetch_body_count}\` | | Number of mails with mail body data sent to client |
| \`%{fetch_body_bytes}\` | | Number of bytes with mail body data sent to client |
| \`%{deleted}\` | | Number of mails where client added \Deleted flag |
| \`%{expunged}\` | | Number of mails that client expunged, which does not include automatically expunged mails |
| \`%{autoexpunged}\` | | Number of mails that were automatically expunged after client disconnected |
| \`%{trashed}\` | | Number of mails that client copied/moved to the special_use=\Trash mailbox. |
| \`%{appended}\` | | Number of mails saved during the session |`
	},

	imap_max_line_length: {
		default: '64k',
		tags: [ 'imap' ],
		values: setting_types.SIZE,
		advanced: true,
		text: `
Maximum IMAP command line length. Some clients generate very long command
lines with huge mailboxes, so you may need to raise this if you get
Too long argument or IMAP command line too large errors often.`
	},

	imap_metadata: {
		default: 'no',
		tags: [ 'imap', 'metadata' ],
		values: setting_types.BOOLEAN,
		text: `
Dovecot supports the IMAP METADATA extension ([[rfc,5464]]), which allows
per-mailbox, per-user data to be stored and accessed via IMAP commands. Set
this parameter's value to \`yes\` if you wish to activate the IMAP METADATA
commands.

Note: If activated, a dictionary needs to be configured, via the
[[setting,mail_attribute]] setting.

Example:

\`\`\`
# Store METADATA information within user's Maildir directory
mail_attribute {
  dict file {
    path = %h/Maildir/dovecot-attributes
  }
}

protocol imap {
  imap_metadata = yes
}
\`\`\``
	},

	imap_urlauth_host: {
		tags: [ 'imap' ],
		values: setting_types.URL,
		text: `
Specifies the host used for URLAUTH URLs. Only this host is accepted in
the client-provided URLs. Using \`*\` value (not recommended) allows all
hosts and the generated URLs use [[setting,hostname]] as the host.

An empty value disables the URLAUTH extension entirely.

::: warning
URLAUTH in current versions of Dovecot is broken in several ways.
This will be fixed in the future, but activating URLAUTH support on
production systems is not recommended.
:::

::: info
This setting is REQUIRED for the URLAUTH ([[rfc,4467]]) extension to
be active.
:::`
	},

	imap_urlauth_logout_format: {
		default: 'in=%i out=%o',
		seealso: [ 'imap_urlauth_host' ],
		tags: [ 'imap' ],
		values: setting_types.STRING_NOVAR,
		text: `
Specifies the logout format used with the URLAUTH extension in IMAP
operation.

::: warning
This setting is currently not used.
:::

Variables allowed:

| Name | Description |
| ---- | ----------- |
| \`%i\` | Total number of bytes read from the client |
| \`%o\` | Total number of bytes sent to the client |`
	},

	imap_urlauth_port: {
		default: 143,
		seealso: [ 'imap_urlauth_host' ],
		tags: [ 'imap' ],
		values: setting_types.IN_PORT,
		text: `
The port is used with the URLAUTH extension in IMAP operation.`
	},

	imapc_cmd_timeout: {
		default: '5 mins',
		tags: [ 'imapc' ],
		values: setting_types.TIME,
		text: `
How long to wait for a reply to an IMAP command sent to the remote IMAP
server before disconnecting and retrying.`
	},

	imapc_connection_timeout_interval: {
		tags: [ 'imapc' ],
		values: setting_types.TIME_MSECS,
		default: '30secs',
		text: `
How long to wait before considering a connection attempt as timed out.`
	},

	imapc_connection_retry_count: {
		default: 1,
		tags: [ 'imapc' ],
		values: setting_types.UINT,
		text: `
How many times to retry connection against a remote IMAP server?`
	},

	imapc_connection_retry_interval: {
		default: '1 secs',
		tags: [ 'imapc' ],
		values: setting_types.TIME_MSECS,
		text: `How long to wait between retries against a remote IMAP server?`
	},

	imapc_features: {
		tags: [ 'imapc' ],
		changed: {
			settings_imapc_features_changed: `
Several features are now automatically enabled and the respective flags
dropped. In their place new flags to disable these features were added.`
		},
		values: setting_types.BOOLLIST,
		text: `
List of features, optimizations, and workarounds that can be enabled.

**Features**
:   \`no-acl\`
    :   If the [[plugin,imap-acl]] is loaded, the imapc acl feature is
        automatically enabled. With it IMAP ACL commands (MYRIGHTS, GETACL,
        SETACL, DELETEACL) are proxied to the imapc remote location. Note
        that currently these commands are attempted to be used even if the
        remote IMAP server doesn't advertise the ACL capability.

        To disable this feature either unload the [[plugin,imap-acl]] or
        provide this feature.

        ::: info [[changed,imapc_features_no_acl]]
        Earlier versions had an "acl" feature, which is now enabled by default.
        :::

:   \`no-delay-login\`
    :   Immediately connect to the remote server. By default this is
        delayed until a command requires a connection.

        ::: info [[changed,imapc_features_no_delay_login]]
        Earlier versions had a "delay-login" feature, which is now enabled
        by default.
        :::

:   \`gmail-migration\`
    :   Enable GMail-specific migration. Use IMAP \`X-GM-MSGID\` as POP3 UIDL.
        Add \`$GMailHaveLabels\` keyword to mails that have \`X-GM-LABELS\`
        except for \`\Muted\` keyword (to be used for migrating only archived
        emails in \`All Mails\`). Add [[setting,pop3_deleted_flag]] to
        mails that don't exist in POP3 server.

:   \`no-modseq\`
    :   Disable access to \`MODSEQ\` and \`HIGHESTMODSEQ\` fields. By default
        these fields are available if the remote server advertises the
        CONDSTORE or the QRESYNC capability. If modseqs are disabled, or not
        supported by the new server, they can still be used if imapc is
        configured to have local index files.

        ::: info [[changed,imapc_features_no_modseq]]
        Earlier versions had a "modseq" feature, which is now enabled by
        default.
        :::

:   \`proxyauth\`
    :   Use Sun/Oracle IMAP-server specific \`PROXYAUTH\` command to do master
        user authentication. Normally this would be done using the SASL PLAIN
        authentication.

:   \`throttle:<INIT>:<MAX>:<SHRINK>\`
    :   When receiving [THROTTLED] response (from GMail), throttling is
        applied.

        **INIT** = initial throttling msecs (default: 50 ms), afterwards each
        subsequent [THROTTLED] doubles the throttling until **MAX** is reached
        (default: 16000 ms). When [THROTTLED] is not received for a while,
        it's shrunk again. The initial shrinking is done after **SHRINK**
        (default: 500 ms). If [THROTTLED] is received again within this
        timeout, it's doubled, otherwise both throttling and the next
        shrinking timeout is shrank to 3/4 the previous value.

**Optimizations**
:   \`no-fetch-bodystructure\`
    :   Disable fetching of IMAP \`BODY\` and \`BODYSTRUCTURE\` from the
        remote server. Instead, the whole message body is fetched to
        regenerate them.

        ::: info [[changed,imapc_features_no_fetch_bodystructure]]
        Earlier versions had a "fetch-bodystructure" feature, which is now
        enabled by default.
        :::

:   \`no-fetch-headers\`
    :   Disable fetching of specific message headers from the remote server
        using the IMAP \`FETCH BODY.PEEK[HEADER.FIELDS(...)]\` command.
        Instead, the whole header is fetched and the wanted headers are
        parsed from it.

        ::: info [[changed,imapc_features_no_fetch_headers]]
        Earlier versions had a "fetch-headers" feature, which is now enabled
        by default.
        :::

:   \`no-fetch-size\`
    :   Disable fetching of message sizes from the remote server using the
        IMAP \`FETCH RFC822.SIZE\` command. Instead, the whole message body
        is fetched to calculate the size.

        ::: info [[changed,imapc_features_no_fetch_size]]
        Earlier versions had a "rfc822.size" feature, which is now enabled
        by default.
        :::

:   \`no-metadata\`
    :   Disable the detection of the \`METADATA\` capability from the
        remote server. The client will receive a \`NO [UNAVAILABLE]\`
        response for any request that requires access to metadata on the
        remote server (the same happens if the server does not announce
        the capability at all).

:   \`no-search\`
    :   Disable searching messages using the IMAP \`SEARCH\` command.
        Instead, all the message headers/bodies are fetched to perform
        the search locally.

        ::: info [[changed,imapc_features_no_search]]
        Earlier versions had a "search" feature, which is now enabled by
        default.
        :::

**Workarounds**
:   \`fetch-fix-broken-mails\`
    :   If a \`FETCH\` returns \`NO\` (but not \`NO [LIMIT]\` or \`NO
        [SERVERBUG]\`), assume the mail is broken in server and just treat
        it as if it were an empty email.

        ::: danger
        This is often a dangerous option! It's not safe to assume that \`NO\`
        means a permanent error rather than a temporary error. This feature
        should be enabled only for specific users who have been determined
        to be broken.
        :::

:   \`fetch-msn-workarounds\`
    :   Try to ignore wrong message sequence numbers in \`FETCH\` replies
        whenever possible, preferring to use the returned UID number instead.

:   \`no-examine\`
    :   Use \`SELECT\` instead of \`EXAMINE\` even when we don't want to
        modify anything in the mailbox. This is a Courier-workaround where
        it didn't permanently assign \`UIDVALIDITY\` to an \`EXAMINE\`d
        mailbox, but assigned it for \`SELECT\`ed mailbox.

:   \`zimbra-workarounds\`
    :    Fetch full message using \`BODY.PEEK[HEADER] BODY.PEEK[TEXT]\`
         instead of just \`BODY.PEEK[]\` because the header differs between
         these two when there are illegal control chars or 8bit chars.
         This mainly caused problems with dsync, but this should no longer
        be a problem and there's probably no need to enable this workaround.`
	},

	imapc_host: {
		tags: [ 'imapc', 'imapc-auth' ],
		values: setting_types.STRING,
		text: `The remote IMAP host to connect to.`
	},

	imapc_list_prefix: {
		tags: [ 'imapc' ],
		values: setting_types.STRING,
		text: `
Access only mailboxes under this prefix.

Example, for a source IMAP server that uses an INBOX namespace prefix:

\`\`\`
imapc_list_prefix = INBOX/
\`\`\``
	},

	imapc_master_user: {
		tags: [ 'imapc' ],
		seealso: [ 'imapc_password', 'imapc_user' ],
		values: setting_types.STRING,
		text: `
The master username to authenticate as on the remote IMAP host.

To authenticate as a master user but use a separate login user, the
following configuration should be employed, where the credentials are
represented by masteruser and masteruser-secret:

\`\`\`
imapc_user = %u
imapc_master_user = masteruser
imapc_password = masteruser-secret
\`\`\`

[[variable,mail-user]] can be used.`
	},

	imapc_max_idle_time: {
		default: '29 mins',
		tags: [ 'imapc' ],
		values: setting_types.TIME,
		text: `
Send a command to the source IMAP server as a keepalive after no other
command has been sent for this amount of time.

Dovecot will send either \`NOOP\` or \`DONE\` to the source IMAP server.`
	},

	imapc_max_line_length: {
		tags: [ 'imapc' ],
		values: setting_types.SIZE,
		default: 'unlimited',
		text: `
The maximum line length to accept from the remote IMAP server.

This setting is used to limit maximum memory usage.`
	},

	imapc_password: {
		tags: [ 'imapc' ],
		seealso: [ 'imapc_master_user', 'imapc_user' ],
		values: setting_types.STRING,
		text: `
The authentication password for the remote IMAP server.

If using master users, this setting will be the password of the master user.`
	},

	imapc_port: {
		default: 143,
		tags: [ 'imapc', 'imapc-auth' ],
		values: setting_types.IN_PORT,
		text: `The port on the remote IMAP host to connect to.`
	},

	imapc_rawlog_dir: {
		seealso: [ '[[link,rawlog]]' ],
		tags: [ 'imapc', 'imapc-auth' ],
		values: setting_types.STRING,
		text: `Log all IMAP traffic input/output to this directory.`
	},

	imapc_sasl_mechanisms: {
		default: 'plain',
		tags: [ 'imapc' ],
		values: setting_types.BOOLLIST,
		text: `
The [[link,sasl]] mechanisms to use for authentication when connection to a
remote IMAP server.

The first one advertised by the remote IMAP sever is used.

\`\`\`[dovecot.conf]
imapc_sasl_mechanisms {
  external = yes
  plain = yes
  login = yes
}
\`\`\``
	},

	imapc_ssl: {
		default: 'no',
		tags: [ 'imapc', 'imapc-auth' ],
		values: setting_types.ENUM,
		values_enum: [ 'no', 'imaps', 'starttls' ],
		text: `
Use TLS to connect to the remote IMAP server.

| Value | Description |
| ----- | ----------- |
| \`no\` | No TLS |
| \`imaps\` | Explicitly connect to remote IMAP port using TLS |
| \`starttls\` | Use IMAP STARTTLS command to switch to TLS connection |`
	},

	imapc_ssl_verify: {
		removed: {
			settings_imapc_ssl_verify_removed: `
Dropped in favor of using the global
[[setting,ssl_client_require_valid_cert]].`
		},
		default: 'yes',
		tags: [ 'imapc' ],
		seealso: [ 'imapc_ssl' ],
		values: setting_types.BOOLEAN,
		text: `
Verify remote IMAP TLS certificate?

Verification may be disabled during testing, but should be enabled during
production use.

Only used if [[setting,imapc_ssl]] is enabled.`
	},

	imapc_user: {
		tags: [ 'imapc', 'imapc-auth' ],
		seealso: [ 'imapc_master_user', 'imapc_password' ],
		values: setting_types.STRING,
		default: '%{owner_user}',
		text: `
The user identity to be used for performing a regular IMAP LOGIN to the
source IMAP server.

[[variable,mail-user]] can be used.`
	},

	import_environment: {
		default: `
TZ=%{env:TZ} CORE_OUTOFMEM=%{env:CORE_OUTOFMEM} CORE_ERROR=%{env:CORE_ERROR}
PATH=%{env:PATH}`,
		values: setting_types.STRLIST,
		text: `
A list of environment key=value pairs, that are preserved and passed to all
child processes.

The value can be determined from the existing environment upon Dovecot startup or directly specified.

Example:
\`\`\`[dovecot.conf]
import_environment {
  TZ = :/etc/localtime
  TMPDIR = /dovecot-tmp
}
\`\`\``
	},

	inet_listener: {
		tags: [ 'service' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'service', 'inet_listener_name' ],
		text: `
Creates a new network socket listener for a [[setting,service]]. The filter
name refers to the [[setting,inet_listener_name]] setting.`
	},

	inet_listener_name: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		seealso: [ 'inet_listener_type', 'inet_listener' ],
		text: `
Name of this listener. It is meant to be descriptive for humans (e.g. \`imap\`,
\`imaps\`), but it is also used by services to determine the socket type,
unless [[setting,inet_listener_type]] overrides it. The
[[setting,inet_listener]] filter name refers to this setting.`
	},

	inet_listener_type: {
		tags: [ 'service' ],
		added: {
			settings_inet_listener_type_added: false,
		},
		values: setting_types.STRING,
		text: `
Listener type. This string value has service-specific meaning and is used to
distinguish different listener types that one service may employ.`
	},

	inet_listener_address: {
		tags: [ 'service' ],
		values: setting_types.IPADDR,
		text: `
Overrides the [[setting,listen]] setting for this listener.`
	},

	inet_listener_port: {
		tags: [ 'service' ],
		values: setting_types.IN_PORT,
		default: 0,
		text: `
Port number where to listen. \`0\` disables the listener.`
	},

	inet_listener_ssl: {
		tags: [ 'service' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		seealso: [ 'ssl' ],
		text: `
If \`yes\`, the listener does an immediate SSL/TLS handshake after accepting a
connection. This is needed for e.g. the \`imaps\` and \`pop3s\` ports.

::: info
All listeners with \`ssl=yes\` will be removed if the global [[setting,ssl]]
setting is \`no\`.

Regardless of the value for listener's ssl setting, some services will still
try to initialize encryption if the global [[setting,ssl]] is \`yes\`. This is
for example done to accommodate STARTTLS commands for IMAP/SUBMISSION/LMTP
protocols. In other words, SSL is truly disabled only when the global
[[setting,ssl]] is \`no\`.
:::`
	},

	inet_listener_haproxy: {
		tags: [ 'service' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If \`yes\`, this listener is configured for use with HAProxy. It expects a
Proxy Protocol header right after accepting the connection. Connections are
aborted immediately if this protocol is violated.`
	},

	info_log_path: {
		default: '[[setting,log_path]]',
		values: setting_types.STRING,
		text: `The log file to use for informational messages.`
	},

	instance_name: {
		default: 'dovecot',
		values: setting_types.STRING,
		text: `
For multi-instance setups, supply the unique name of this Dovecot instance.

This simplifies use of commands such as doveadm: rather than using \`-c\`
and the config path, you can use the \`-i\` flag with the relevant instance
name.`
	},

	last_valid_gid: {
		default: 0,
		seealso: [ 'first_valid_gid' ],
		values: setting_types.UINT,
		text: `
This setting and [[setting,first_valid_gid]] specify the valid GID
range for users.

A user whose primary GID is outside this range is not allowed to log in.

\`0\` means there is no explicit last GID.

If the user belongs to any supplementary groups, the corresponding IDs are
not set.`
	},

	last_valid_uid: {
		default: 0,
		seealso: [ 'first_valid_uid' ],
		values: setting_types.UINT,
		text: `
This setting and [[setting,first_valid_uid]] specify the valid UID
range for users.

\`0\` means there is no explicit last UID.

A user whose UID is outside this range is not allowed to log in.`
	},

	lda_mailbox_autocreate: {
		default: 'no',
		tags: [ 'lda' ],
		values: setting_types.BOOLEAN,
		text: `
Should LDA create a nonexistent mailbox automatically when attempting to
save a mail message?`
	},

	lda_mailbox_autosubscribe: {
		default: 'no',
		tags: [ 'lda' ],
		values: setting_types.BOOLEAN,
		text: `Should automatically created mailboxes be subscribed to?`
	},

	lda_original_recipient_header: {
		tags: [ 'lda' ],
		values: setting_types.STRING,
		text: `
The header from which the original recipient address (used in the SMTP RCPT
TO: address) is obtained if that address is not available elsewhere.

Example:

\`\`\`
lda_original_recipient_header = X-Original-To
\`\`\``
	},

	libexec_dir: {
		default: '/usr/libexec/dovecot',
		values: setting_types.STRING,
		advanced: true,
		text: `
The directory from which you execute commands via doveadm-exec.`
	},

	listen: {
		default: '\*, \:\:',
		values: setting_types.IPADDR,
		text: `
A comma-separated list of IP addresses or hostnames on which external network
connections will be handled.

\`*\` listens at all IPv4 interfaces, and \`::\` listens at all IPv6
interfaces.

Example:

\`\`\`
listen = 127.0.0.1, 192.168.0.1
\`\`\``
	},

	lmtp_add_received_header: {
		default: 'yes',
		tags: [ 'lmtp' ],
		values: setting_types.BOOLEAN,
		text: `
Controls if "Received:" header should be added to delivered mails.`
	},

	lmtp_client_workarounds: {
		tags: [ 'lmtp' ],
		values: setting_types.BOOLLIST,
		text: `
Configures the list of active workarounds for LMTP client bugs. Supported
workaround identifiers are:

\`whitespace-before-path\`
:   Allow one or more spaces or tabs between 'MAIL FROM:' and path and
    between 'RCPT TO:' and path.

\`mailbox-for-path\`
:   Allow using bare Mailbox syntax (i.e., without \<...\>) instead of full
    path syntax.`
	},

	lmtp_hdr_delivery_address: {
		default: 'final',
		tags: [ 'lmtp' ],
		values: setting_types.ENUM,
		values_enum: [ 'alternative', 'final', 'none' ],
		text: `
The recipient address to use for the "Delivered-To:" header and the
relevant "Received:" header.

Options:

\`alternative\`
:   Address from the RCPT TO OCRPT parameter

\`final\`
:   Address from the RCPT TO command

\`none\`
:   No address (always used for messages with multiple recipients)`
	},

	lmtp_proxy: {
		default: 'no',
		seealso: [ '[[link,authentication_proxies]]' ],
		tags: [ 'lmtp' ],
		values: setting_types.BOOLEAN,
		text: `
Proxy to other LMTP/SMTP servers?

Proxy destination is determined via passdb lookup parameters.`
	},

	lmtp_proxy_rawlog_dir: {
		seealso: [ '[[link,rawlog]]' ],
		tags: [ 'lmtp' ],
		values: setting_types.STRING,
		text: `
Directory location to store raw LMTP proxy protocol traffic logs.

[[variable,mail-service-user]] can be used. However, because LMTP session
starts without a user, all user-specific variables expand to empty.`
	},

	lmtp_rawlog_dir: {
		seealso: [ '[[link,rawlog]]' ],
		tags: [ 'lmtp' ],
		values: setting_types.STRING,
		text: `
Directory location to store raw LMTP protocol traffic logs.

[[variable,mail-service-user]] can be used. However, because LMTP session
starts without a user, all user-specific variables expand to empty.`
	},

	lmtp_rcpt_check_quota: {
		default: 'no',
		tags: [ 'lmtp' ],
		values: setting_types.BOOLEAN,
		text: `
Should quota be verified before a reply to RCPT TO is issued?

If active, this creates a small amount of extra overhead so it is disabled
by default.`
	},

	lmtp_save_to_detail_mailbox: {
		default: 'no',
		tags: [ 'lmtp' ],
		values: setting_types.BOOLEAN,
		text: `
If the recipient address includes a detail element / role (as in user+detail
format), save the message to the detail mailbox.`
	},

	lmtp_user_concurrency_limit: {
		default: 0,
		tags: [ 'lmtp', 'user_concurrency_limits' ],
		values: setting_types.UINT,
		text: `
Limit the number of concurrent deliveries to a single user to this maximum
value.

It is useful if one user is receiving numerous mail messages and thereby
causing delays to other deliveries.`
	},

	lmtp_verbose_replies: {
		default: 'no',
		tags: [ 'lmtp' ],
		values: setting_types.BOOLEAN,
		advanced: true,
		text: `
This setting makes the replies returned to the client much more verbose.
Currently, this only applies when the LMTP proxy is involved, for which
e.g. backend connection errors are returned in full detail.

Normally, these errors are replaced by a more generic error message to
prevent leaking system details to the clients (e.g. IP addresses and ports).
It is therefore not recommended to enable this setting beyond troubleshooting
efforts.`
	},

	lock_method: {
		default: 'fcntl',
		values: setting_types.ENUM,
		values_enum: [ 'fcntl', 'flock', 'dotlock' ],
		text: `
Specify the locking method to use for index files.

Options:

\`dotlock\`
:   \`mailboxname.lock\` file created by almost all software when writing to
    mboxes. This grants the writer an exclusive lock over the mbox, so it's
    usually not used while reading the mbox so that other processes can also
    read it at the same time. So while using a dotlock typically prevents
    actual mailbox corruption, it doesn't protect against read errors if
    mailbox is modified while a process is reading.

\`flock\`
:   flock() system call is quite commonly used for both read and write
    locking. The read lock allows multiple processes to obtain a read lock
    for the mbox, so it works well for reading as well. The one downside to
    it is that it doesn't work if mailboxes are stored in NFS.

\`fcntl\`
:   Very similar to flock, also commonly used by software. In some systems
    this fcntl() system call is compatible with flock(), but in other
    systems it's not, so you shouldn't rely on it. fcntl works with NFS if
    you're using lockd daemon in both NFS server and client.`
	},

	log_core_filter: {
		values: setting_types.STRING,
		text: `
Crash after logging a matching event. The syntax of the filter is described
in [[link,event_filter_global]].

For example:

\`\`\`
log_core_filter = category=error
\`\`\`

will crash any time an error is logged, which can be useful for debugging.`
	},

	log_debug: {
		values: setting_types.STRING,
		text: `
Filter to specify what debug logging to enable.  The syntax of the filter is
described in [[link,event_filter_global]].

::: info
This will eventually replace [[setting,mail_debug]] and
[[setting,auth_debug]] settings.
:::`
	},

	log_path: {
		default: 'syslog',
		seealso: [ 'debug_log_path', 'info_log_path' ],
		values: setting_types.STRING,
		text: `
Specify the log file to use for error messages.

Options:

- \`syslog\`: Log to syslog
- \`/dev/stderr\`: Log to stderr

If you don't want to use syslog, or if you just can't find the Dovecot's
error logs, you can make Dovecot log elsewhere as well:

\`\`\`
log_path = /var/log/dovecot.log
\`\`\`

If you don't want errors, info, and debug logs all in one file, specify
[[setting,info_log_path]] or [[setting,debug_log_path]] as well:

\`\`\`
log_path = /var/log/dovecot.log
info_log_path = /var/log/dovecot-info.log
\`\`\``
	},

	log_timestamp: {
		default: '%b %d %H:%M:%S',
		values: setting_types.STRING_NOVAR,
		text: `
The prefix for each line written to the log file.

\`%\` variables are in strftime(3) format.`
	},

	login_socket_path: {
		values: setting_types.STRING,
		added: {
			settings_login_socket_path_added: false,
		},
		text: `
Default socket path for all services' login processes. Can be overridden by
passing a parameter to the login executable.`
	},

	login_greeting: {
		default: 'Dovecot ready.',
		values: setting_types.STRING,
		advanced: true,
		text: `
The greeting message displayed to clients.

Variables allowed:

- LMTP: [[variable,mail-service-user]]
- Other Protocols: [[variable,login]]`
	},

	login_log_format: {
		default: '%$: %s',
		values: setting_types.STRING_NOVAR,
		text: `
The formatting of login log messages.

Variables allowed (in addition to [[variable,global]]):

| Variable Name | Description |
| ------------- | ----------- |
| \`%s\` | A [[setting,login_log_format_elements]] string |
| \`%$\` | The log data |`
	},

	login_log_format_elements: {
		default: 'user=<%u> method=%m rip=%r lip=%l mpid=%e %c session=<%{session}>',
		// TODO: Provide join example
		values: setting_types.STRING_NOVAR,
		text: `
A space-separated list of elements of the login log formatting.

Elements that have a non-empty value are joined together to form a
comma-separated string.

[[variable,login]] can be used.`
	},

	login_plugin_dir: {
		default: '/usr/lib64/dovecot/login',
		values: setting_types.STRING,
		text: `Location of the login plugin directory.`
	},

	login_plugins: {
		values: setting_types.BOOLLIST,
		text: `List of plugins to load for IMAP and POP3 login processes.`
	},

	login_proxy_max_disconnect_delay: {
		default: 0,
		values: setting_types.UINT,
		text: `
Specify the delayed disconnection interval of clients when there is a
server mass-disconnect.

For prevention of load spikes when a backend server fails or is restarted,
disconnection is spread over the amount of time indicated.

\`0\` disables the delay.`
	},

	login_proxy_max_reconnects: {
		default: 3,
		values: setting_types.UINT,
		text: `
How many times login proxy will attempt to reconnect to destination server
on connection failures (3 reconnects = total 4 connection attempts).

Reconnecting is done for most types of failures, except for regular
authentication failures.

There is a 1 second delay between each reconnection attempt.

If [[setting,login_proxy_timeout]] is reached, further reconnects
aren't attempted.`
	},

	login_proxy_rawlog_dir: {
		seealso: [ '[[link,rawlog]]' ],
		values: setting_types.STRING,
		text: `
Login processes write rawlogs for proxied connections to this directory for
debugging purposes. Note that login processes are usually chrooted, so the
directory is relative to \`$base_dir/login/\`.`
	},

	login_proxy_timeout: {
		default: '30 secs',
		values: setting_types.TIME_MSECS,
		text: `
Timeout for login proxy failures.

The timeout covers everything from the time connection is started until a
successful login reply is received.

This can be overwritten by [[link,authentication_proxies]] passdb extra field.

This setting applies only to proxying via login processes, not to lmtp or
doveadm processes.`
	},

	login_source_ips: {
		values: setting_types.IPADDR,
		text: `
Value Format: List of trusted network ranges, see
[[link,settings_types_boollist]].

A list of hosts / IP addresses that are used in a round-robin manner for
the source IP address when the proxy creates TCP connections.

Example:

\`\`\`[dovecot.conf]
login_source_ips {
  proxy-sources.example.com = yes
}
\`\`\``
	},

	login_trusted_networks: {
		values: setting_types.IPADDR,
		text: `
Value Format: List of trusted network ranges, see
[[link,settings_types_boollist]].

This setting is used for a few different purposes, but most importantly it
allows the client connection to tell the server what the original client's
IP address was. This original client IP address is then used for logging
and authentication checks.

Client connections from trusted networks are also treated as secured unless
[[setting,ssl,required]]. Plaintext authentication is always allowed for
[[link,secured_connections]] ([[setting,auth_allow_cleartext]] is ignored).

Localhost connections are secured by default, but they are not
trusted by default. If you want localhost to be trusted, it needs to be
included in this setting.

The details of how this setting works depends on the used protocol:

**IMAP**
:   ID command can be used to override:

    * Session ID
    * Client IP and port (\`%{rip}\`, \`%{rport}\`)
    * Server IP and port (\`%{lip}\`, \`%{lport}\`)

    \`forward_*\` fields can be sent to auth process's passdb lookup

    The trust is always checked against the connecting IP address.
    Except if HAProxy is used, then the original client IP address is used.

**POP3**
:   XCLIENT command can be used to override:

    * Session ID
    * Client IP and port (\`%{rip}\`, \`%{rport}\`)

    \`forward_*\` fields can be sent to auth process's passdb lookup

    The trust is always checked against the connecting IP address.
    Except if HAProxy is used, then the original client IP address is used.

**ManageSieve**
:   XCLIENT command can be used to override:

    * Session ID
    * Client IP and port (\`%{rip}\`, \`%{rport}\`)

    The trust is always checked against the connecting IP address.
    Except if HAProxy is used, then the original client IP address is used.

**Submission**
:   XCLIENT command can be used to override:

    * Session ID
    * Client IP and port (\`%{rip}\`, \`%{rport}\`)
    * HELO - Overrides what the client sent earlier in the EHLO command
    * LOGIN - Currently unused
    * PROTO - Currently unused

    \`forward_*\` fields can be sent to auth process's passdb lookup

    The trust is always checked against the connecting IP address.
    Except if HAProxy is used, then the original client IP address is used.

**LMTP**
:   XCLIENT command can be used to override:

    * Session ID
    * Client IP and port (\`%{rip}\`, \`%{rport}\`)
    * HELO - Overrides what the client sent earlier in the LHLO command
    * LOGIN - Currently unused
    * PROTO - Currently unused
    * TIMEOUT (overrides [[setting,mail_max_lock_timeout]])

    The trust is always checked against the connecting IP address.
    Except if HAProxy is used, then the original client IP address is used.`
	},

	mail_access_groups: {
		values: setting_types.BOOLLIST,
		text: `
Supplementary groups that are granted access for mail processes.

Typically, these are used to set up access to shared mailboxes.

::: warning
It may be dangerous to set these up if users can create symlinks.

Examples for if the "mail" group is chosen here:
* \`ln -s /var/mail ~/mail/var\` could allow a user to delete others'
  mailboxes, or
* \`ln -s /secret/shared/box ~/mail/mybox\` would allow reading others' mail.
:::`
	},

	mail_always_cache_fields: {
		seealso: [ 'mail_cache_fields', 'mail_never_cache_fields' ],
		values: setting_types.BOOLLIST,
		text: `
The fields specified here are always added to cache when saving mails, even
if the client never accesses these fields.

See [[link,mail_cache]] for details and for the list of fields.`
	},

	mail_attachment_detection_options: {
		values: setting_types.BOOLLIST,
		text: `
Settings to control adding \`$HasAttachment\` or \`$HasNoAttachment\`
keywords. By default, all MIME parts with \`Content-Disposition=attachment\`
or inlines with filename parameter are considered attachments.

To enable this feature, this setting needs at least one option specified.
Multiple options can be added in a space-separated list.

Options:

\`add-flags\`
:   Attachments are detected and marked during save. Detection is done also
    during fetch if it can be done without extra disk IO and with minimal CPU
    cost. This means that either both \`mime.parts\` and
    \`imap.bodystructure\` has to be in cache already, or if mail body is
    opened in any case.

\`add-flags no-flags-on-fetch\`
:   Flags are added during save, but not during fetch. This option will
    likely be removed in a later release.

\`content-type=<type|!type>\`
:   Include or exclude given content type. Including will only negate an
    exclusion (e.g. \`content-type=!foo/* content-type=foo/bar\`).

\`exclude-inlined\`
:   Do not consider any attachment with disposition inlined.`
	},

	mail_ext_attachment_dir: {
		values: setting_types.STRING,
		text: `
The directory in which to store mail attachments.

With [[link,sdbox]] and [[link,mdbox]], mail attachments can be saved to
external files, which also allows single-instance storage of them.

If no value is specified, attachment saving to external files is disabled.

[[variable,mail-user]] can be used.`
	},

	mail_ext_attachment: {
		values: setting_types.NAMED_FILTER,
		seealso: [ 'fs_driver', 'mail_ext_attachment_dir' ],
		text: `
Named filter for initializing [[link,fs,FS Driver]] for external attachments.

Commonly used options:

\`posix\`
:   No single-instance storage (SIS) done (this option might simplify the
    filesystem's own de-duplication operations).

\`sis\`
:   SIS with immediate byte-by-byte comparison during saving.

    SIS is deprecated and writing of SIS files is disabled. Reading is
    supported for now, any missing SIS attachments are replaced with files
    filled with spaces.

\`sis-queue\`
:   SIS with delayed comparison and de-duplication.

	[[changed,settings_mail_attachment_sis_option_changed]] SIS is deprecated
	and writing SIS files is disabled. Reading is supported for now. Any
	missing SIS attachments are replaced with files filled with spaces.`
	},

	mail_ext_attachment_hash: {
		default: '%{sha1}',
		seealso: [ 'mail_ext_attachment_dir' ],
		values: setting_types.ENUM,
		values_enum: [ '%{md4}', '%{md5}', '%{sha1}', '%{sha256}', '%{sha512}', '%{size}' ],
		advanced: true,
		text: `
The hash format to use in attachment filenames when saving attachments
externally.

Variables and additional text can be included in this string.

The syntax allows truncation of any variable. For example \`%{sha256:80}\`
will return only the first 80 bits of the SHA256 output.`
	},

	mail_ext_attachment_min_size: {
		default: '128k',
		seealso: [ 'mail_ext_attachment_dir' ],
		values: setting_types.SIZE,
		text: `Attachments below this size will not be saved externally.`
	},

	mail_attribute: {
		seealso: [ 'imap_metadata' ],
		tags: [ 'metadata' ],
		values: setting_types.NAMED_FILTER,
		text: `
Named filter for initializing [[link,dict,dict driver]] for server and mailbox
attributes (\`key=value\`).

This is used by the URLAUTH and METADATA extensions, as well as various other
features.

Example:

\`\`\`
mail_attribute {
  dict file {
    path = %h/dovecot-attributes
  }
}
\`\`\``
	},

	mail_cache_fields: {
		default: 'flags',
		seealso: [ 'mail_always_cache_fields', 'mail_never_cache_fields' ],
		values: setting_types.BOOLLIST,
		text: `
The default list of fields that are added to cache if no other caching
decisions exist yet. This setting is used only when creating the initial
INBOX for the user. Other folders get their defaults from the INBOX.

See [[link,mail_cache]] for details and for the list of fields.`
	},

	mail_chroot: {
		values: setting_types.STRING,
		text: `
The default chroot directory for mail processes.

This chroots all users globally into the same directory.

[[variable,mail-service-user]] can be used.`
	},

	mail_debug: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
This setting adjusts log verbosity. It enables mail-process debugging. This
can help you figure out the reason if Dovecot isn't finding certain mail
messages.`
	},

	mail_fsync: {
		default: 'optimized',
		values: setting_types.ENUM,
		values_enum: [ 'always', 'optimized', 'never' ],
		text: `
Specify when to use fsync() or fdatasync() calls.

Using fsync waits until the data is written to disk before it continues,
which is used to prevent corruption or data loss in case of server crashes.

This setting applies to mail files and index files on the filesystem. This
setting doesn't apply to object storage operations.

Options:

\`always\`
:   Use fsync after all disk writes.

    Recommended for NFS to make sure there aren't any delayed write()s.

\`optimized\`
:   Use fsync after important disk writes.

    For example cache file writes aren't fsynced, because they can be
    regenerated if necessary.

\`never\`
:   Never fsync any disk writes.

    This provides the best performance, but risks losing recently saved emails
    in case of a crash with most mailbox formats.`
	},

	mail_full_filesystem_access: {
		default: 'no',
		values: setting_types.BOOLEAN,
		advanced: true,
		seealso: [ 'mailbox_list_validate_fs_names' ],
		text: `
Allow full filesystem access to clients?

If enabled, no access checks are performed other than what the operating
system does for the active UID/GID. This also disables the
[[setting,mailbox_list_validate_fs_names]] setting.

This setting works with both [[link,maildir]] and [[link,mbox]], allowing you
to prefix mailbox names with \`/path/\` or \`~user/\` indicators.`
	},

	mail_gid: {
		seealso: [ 'mail_uid' ],
		values: [ setting_types.STRING, setting_types.UINT ],
		// TODO: Describe value format (comma-separated list?)
		text: `
The system group ID used for accessing mail messages.

Can be either numeric IDs or group names.

If you use multiple values here, userdb can override them by returning the
gid field.`
	},

	mail_home: {
		seealso: [ 'mail_path', '[[link,quick_config]]' ],
		values: setting_types.STRING,
		text: `
There are various possible ways of specifying this parameter and
[[setting,mail_path]].

The following example is one option when home is in \`/var/vmail/domain/user/\`
and mails are in \`/var/vmail/domain/user/mail/\`:

\`\`\`[dovecot.conf]
mail_home = /var/vmail/%d/%n
mail_path = ~/mail
\`\`\`

[[variable,mail-service-user]] can be used.`
	},

	mail_log_prefix: {
		default: '%s(%u)\<%{process:pid}\>\<%{session}\>',
		values: setting_types.STRING,
		text: `
You can specify a log prefix for mail processes here.

[[variable,mail-service-user]] can be used.`
	},

	mail_max_keyword_length: {
		default: 50,
		values: setting_types.UINT,
		advanced: true,
		text: `
The maximum length allowed for a mail keyword name.

Compliance is enforced only during attempts to create new keywords.`
	},

	mail_max_lock_timeout: {
		default: '0',
		values: setting_types.TIME,
		text: `
This value is used as a timeout for tempfailing mail connections.  It
can be set globally, for application to all Dovecot services, but
is normally better to set it in only certain protocol blocks.  You
may wish to set a value for this for LMTP and LDA while leaving it at
the global default of \`0\` for IMAP and POP3 connections, which
tolerate tempfailing less well.`
	},

	mail_max_userip_connections: {
		default: '10',
		values: setting_types.UINT,
		tags: [ 'user_concurrency_limits' ],
		text: `
The maximum number of IMAP connections allowed for a user from each IP
address.

This setting is checked only by backends, not proxies.

Note that for this to work, any username changes must be done already by
passdb lookup (not by userdb lookup).

Unique users are identified via case-sensitive comparison.`
	},

	mail_never_cache_fields: {
		default: 'imap.envelope',
		seealso: [ 'mail_always_cache_fields', 'mail_cache_fields' ],
		values: setting_types.BOOLLIST,
		text: `
List of fields that should never be cached.

This should generally never include anything other than \`imap.envelope\`,
which isn't needed because it can be generated from the cached header
fields.

See [[link,mail_cache]] for details and for the list of fields.`
	},

	mail_nfs_index: {
		default: 'no',
		seealso: [ 'mail_fsync' ],
		values: setting_types.BOOLEAN,
		text: `
When mail-index files exist in NFS storage and you're running a
multi-server setup that you wish to flush NFS caches, this can be set
to \`yes\` (in this case, make sure also to use [[setting,mmap_disable,yes]]
and [[setting,mail_fsync,optimized]]).`
	},

	mail_nfs_storage: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
Flush NFS caches whenever it is necessary to do so.

This setting should only be enabled if you are using multiple servers on NFS.`
	},

	mail_plugin_dir: {
		default: '/usr/lib64/dovecot',
		seealso: [ 'mail_plugins' ],
		values: setting_types.STRING,
		text: `The directory in which to search for Dovecot mail plugins.`
	},

	mail_plugins: {
		seealso: [ 'mail_plugin_dir' ],
		values: setting_types.BOOLLIST,
		text: `
A list of mail plugins to load.`
	},

	mail_prefetch_count: {
		default: '0',
		values: setting_types.UINT,
		text: `
The number of messages to try to prefetch whenever possible. Depending on
the (remote) storage latency, this may significantly speed up performance
when reading many mails. The exact behavior depends on the mailbox format:

* [[link,mbox]], [[link,mdbox]]: No effect in behavior.
* [[link,sdbox]], [[link,maildir]]: Call
  \`posix_fadvise(POSIX_FADV_WILLNEED)\` on mail files to instruct kernel to
  read the whole files into memory.
* [[link,imapc]]: Combine multiple mail reads into the same remote imapc FETCH
  command. For example with [[setting,mail_prefetch_count,0]] reading two mails
  would result in \`FETCH 1 BODY.PEEK[]\` and \`FETCH 2 BODY.PEEK[]\`
  commands, while with [[setting,mail_prefetch_count,1]] they would be
  combined into a single \`FETCH 1:2 BODY.PEEK[]\` command. The downside is
  that each mail uses a file descriptor and disk space in
  [[setting,mail_temp_dir]].

For imapc, a good value is likely between \`10..100\`.

\`0\` means that no prefetching is done.`
	},

	mail_privileged_group: {
		values: setting_types.STRING,
		text: `
This group is enabled temporarily for privileged operations.  Currently,
this is used only with the INBOX when either its initial creation or
dotlocking fails.

Typically, this is set to \`mail\` to give access to \`/var/mail\`.

You can give Dovecot access to mail group by setting
\`mail_privileged_group = mail\`.`
	},

	mail_save_crlf: {
		default: 'no',
		values: setting_types.BOOLEAN,
		advanced: true,
		text: `
Save message with CR+LF line endings?

Messages are normally saved with LF line endings.

Enabling this makes saving messages less CPU-intensive, especially with the
sendfile() system call used in Linux and FreeBSD. However, enabling comes at
the cost of slightly increased disk I/O, which could decrease the speed in
some deployments.`
	},

	mail_server_admin: {
		seealso: [ 'imap_metadata' ],
		tags: [ 'metadata' ],
		values: setting_types.STRING,
		text: `
The method for contacting the server administrator.

Per the METADATA standard ([[rfc,5464]]), this value MUST be a URI (e.g., a
mailto: or tel: URL), but that requirement is not enforced by Dovecot.

This value is accessible to authenticated users through the
\`/shared/admin\` IMAP METADATA server entry.

Example:

\`\`\`
mail_server_admin = mailto:admin@example.com
\`\`\``
	},

	mail_server_comment: {
		seealso: [ 'imap_metadata' ],
		tags: [ 'metadata' ],
		values: setting_types.STRING,
		text: `
A comment or note that is associated with the server.

This value is accessible to authenticated users through the
\`/shared/comment\` IMAP METADATA server entry.`
	},

	mail_shared_explicit_inbox: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
This setting determines whether a shared INBOX should be visible as
"shared/user" or as "shared/user/INBOX" instead.`
	},

	mail_sort_max_read_count: {
		default: 0,
		values: setting_types.UINT,
		text: `
The number of slow mail accesses an IMAP SORT can perform before it returns
failure to the client.

On failure, the untagged SORT reply is retuned, but it is likely not correct.

The IMAP reply returned to the client is:

\`\`\`
NO [LIMIT] Requested sort would have taken too long.
\`\`\``
	},

	mail_temp_dir: {
		default: '/tmp',
		tags: [ 'lda', 'lmtp' ],
		values: setting_types.STRING,
		text: `
The directory in which LDA/LMTP will temporarily store incoming message data
that is above 128kB in size.

[[variable,mail-user]] can be used.`
	},

	mail_temp_scan_interval: {
		default: '1week',
		values: setting_types.TIME,
		text: `
How often Dovecot scans for and deletes stale temporary files. These files
exist only if Dovecot crashes while saving a message. This is just to make
sure such temporary files will eventually get deleted to avoid wasting disk
space. This scan happens independently for each folder, and it's done at the
time the folder is opened.

In order to prevent load spikes, the actual value of the setting is spread
increasing it by 0..30%, based on a hash of the username.

The scanning is done only for these mailbox formats:

* [[link,maildir]]: Delete all files having ctime older than 36 hours from
  \`tmp/\`. The scan is done if tmp/ directory's atime older than this setting.
* [[link,sdbox]], [[link,mdbox]]: Delete \`.temp.*\` files having ctime older
  than 36 hours from \`dbox-Mails/\`. The scan is done if the
  \`last_temp_file_scan\` header field in dovecot.index is older than this
  setting.
* [[link,mdbox]]: Delete \`.temp.*\` files having ctime older than 36 hours
  from \`storage/\`. The scan is done if storage/ directory's atime is older
  than this setting.

A value of \`0\` means this scan never occurs.`
	},

	mail_uid: {
		seealso: [ 'mail_gid' ],
		// TODO: Describe value format (comma-separate list?)
		values: [ setting_types.STRING, setting_types.UINT ],
		text: `
This setting indicates the system userid used for accessing mail
messages.  If you use multiple values here, userdb can override them
by returning UID or GID fields.  You can use either numeric IDs or
usernames here.`
	},

	mail_vsize_bg_after_count: {
		default: 0,
		seealso: [ '[[plugin,quota]]' ],
		values: setting_types.UINT,
		text: `
Controls transitioning mail size determination to the background instead of
synchronously during the delivery process.

After this many messages have been opened, the system allows a background
indexer-worker process to perform quota calculations in the background.

This may happen when mail messages do not have their virtual sizes cached.

When indexing is occurring in the background, explicit quota size queries
return an internal error and mail deliveries are assumed to succeed.

This setting must not be set to indexer-worker process, or the background
calculation isn't finished. The configuration should be like:

\`\`\`
protocol !indexer-worker {
  mail_vsize_bg_after_count = 10
}
\`\`\``
	},

	mail_driver: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		seealso: [
			'[[link,mailbox_formats]]',
			'[[link,mail_location_mailbox_root_autodetection]]',
			'mail_path',
		],
		text: `
One of the mailbox formats described at [[link,mailbox_formats]].

For an empty value or \`auto\`, Dovecot attempts to find the mailboxes
automatically.`
	},

	mail_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		default: '<specific to mail_driver setting>',
		seealso: [
			'[[link,settings_variables_mail_user_variables]]',
			'[[link,home_directories_for_virtual_users]]',
			'mail_driver',
		],
		text: `
Path to a directory where the mail is stored. [[link,settings_variables_mail_user_variables]] are commonly used here.

Usually the mails should be stored in a sub-directory under the home directory,
but not the home directory itself (see
[[link,home_directories_for_virtual_users]]).

The path must be absolute, not a relative path. Even if relative paths appear
to work, this usage is deprecated and will likely stop working at some point.`
	},

	mail_inbox_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		seealso: [ 'mail_path' ],
		text: `
Path to the INBOX mailbox. The path doesn't have to be absolute - it is
relative to the [[setting,mail_path]].

This is often used with mbox format where INBOX is in \`/var/mail/\` while the
rest of the folders are under the user's home directory.

This can also be used to specify a different INBOX path with Maildir:

\`\`\`[dovecot.conf]
 mail_driver = maildir
 mail_path = ~/Maildir
 mail_inbox_path = ~/Maildir/.INBOX
\`\`\``
	},

	mail_index_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		default: '<same as mail_path setting>',
		seealso: [
			'[[link,design_indexes_index_format]]',
			'[[link,mail_location_index_files]]',
		],
		text: `
Location of [[link,design_indexes_index_format]].`
	},

	mail_index_private_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		seealso: [ '[[link,shared_mailboxes_public]]' ],
		text: `
The private index files are used with shared mailboxes to provide private
(per-user) message flags.`
	},

	mail_cache_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		default: '<same as mail_index_path setting',
		text: `
Place \`dovecot.index.cache\` files to this directory instead of among the
other index files. This may be used as an optimization to split most index
files to the fastest (smallest) storage while keeping cache files in a slightly
slower (larger) storage.`
	},

	mail_control_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		text: `
Location for (mailbox-format specific) control files.`
	},

	mail_alt_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		seealso: [ '[[link,dbox_alt_storage]]' ],
		text: `
Specifies the [[link,dbox_alt_storage]] path.`
	},

	mail_alt_check: {
		tags: [ 'mail-location' ],
		values: setting_types.BOOLEAN,
		default: 'yes',
		seealso: [ 'mail_alt_path' ],
		text: `
Whether to perform a sanity check and warn if [[setting,mail_alt_path]] changes
from the last access. This can catch accidentally broken configurations before
users start reporting missing mails. The downside to this check is some
additional disk IO.`
	},

	mailbox_list_layout: {
		tags: [ 'mail-location' ],
		values: setting_types.ENUM,
		values_enum: [ 'fs', 'index', 'Maildir++' ],
		default: 'fs',
		seealso: [
			'[[link,dbox]]',
			'[[link,maildir]]',
			'[[link,mbox]]',
		],
		text: `
Directory layout to use.

| Value | Description |
| --- | --- |
| \`Maildir++\` | The default used by [[link,maildir]]. |
| \`fs\` | The default used by [[link,mbox]] and [[link,dbox]]. |
| \`index\` | Uses mailbox GUIDs as the directory names. The mapping between mailbox names and GUIDs exists in \`dovecot.list.index*\` files. |

::: info
The [[setting,mail_driver]] setting provides the default value, that the
\`mailbox_list_layout\` setting can override.
:::`
	},

	mailbox_subscriptions_filename: {
		advanced: true,
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		default: {
			value: 'subscriptions',
			text: 'specific [[link,mailbox_formats]] have different defaults',
		},
		text: `
Specifies the filename used for storing mailbox subscriptions.`
	},

	mailbox_directory_name: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		default: '<specific to mail_driver setting',
		seealso: [ 'mail_driver', 'mailbox_directory_name_legacy' ],
		text: `
Specifies the directory name used for mailbox, index, and control directory
paths. See the individual mailbox format pages for further information. For
example \`dbox-Mails\` with [[link,dbox]].

With mbox format this works differently. The user-provided mailbox name is the
directory name, while \`mailbox_directory_name\` is the mbox file. For example
with \`mailbox_directory_name=mbox\`, creating \`foo/bar\` mailbox name ends up
creating \`.../foo/bar/mbox\` file.`
	},

	mailbox_directory_name_legacy: {
		tags: [ 'mail-location' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		seealso: [ 'mailbox_directory_name' ],
		text: `
If \`no\`, [[setting,mailbox_directory_name]] applies also to index and control
directories. The only reason to set this to \`yes\` is if you already have an
existing Dovecot installation with the legacy \`DIRNAME\` (rather than
\`FULLDIRNAME\`) parameter and don't want to migrate the data.`
	},

	mailbox_root_directory_name: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		default: 'specific to the mail_driver setting',
		text: `
Specifies directory name under which all mailbox directories are stored. For
example \`mailboxes\` with [[link,dbox]].`
	},

	mail_volatile_path: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		text: `
Specifies the location of volatile files. This includes lock files and
potentially other files that don't need to exist permanently, so it can point
to an in-memory filesystem (\`tmpfs\`). This is especially useful to avoid
creating lock files to NFS or other remote filesystems.`
	},

	mailbox_list_index_prefix: {
		tags: [ 'mail-location' ],
		values: setting_types.STRING,
		default: 'dovecot.list.index',
		text: `
Prefix for the mailbox list index filename. It may also optionally include a
path (relative to [[setting,mail_index_path]]) to place it in a different
  directory.`
	},

	mailbox_list_visible_escape_char: {
		tags: [ 'mail-location' ],
		seealso: [ 'mailbox_list_storage_escape_char' ],
		values: setting_types.STRING,
		default: {
			value: '*[None]*',
			text: `The default for [[link,imapc]] storage is \`~\`.`,
		},
		text: `
Specifies an escape character that is used for broken or otherwise inaccessible
mailbox names. If mailbox name can't be changed reversibly to UTF-8 and back,
encode the problematic parts using
\`<mailbox_list_visible_escape_char><hex>\`in the user-visible UTF-8 name. The
\`mailbox_list_visible_escape_char\` itself also has to be encoded the same
way.

This can be useful with [[link,imapc]] to access mailbox names that aren't
valid mUTF-7 charset from remote servers, or if the remote server uses a
different hierarchy separator and has folder names containing the local
separator.

::: info
It's possible to use the same character here as for
[[setting,mailbox_list_storage_escape_char]].
:::`
	},

	mailbox_list_storage_escape_char: {
		tags: [ 'mail-location' ],
		seealso: [ 'mailbox_list_visible_escape_char' ],
		values: setting_types.STRING,
		default: {
			value: '*[None]*',
			text: `The default for [[link,imapc]] storage is \`%%\`.`,
		},
		text: `
Specifies an escape character that it used for encoding special characters in
the mailbox names in storage. This allows users to use characters in mailboxes
names that would otherwise be illegal. For example:

* [[link,maildir]] layout disallows using the \`.\` character, since it's used
  internally as the folder hierarchy separator.
* The \`~\` character at the beginning of the mailbox name is disallowed,
  because of the possibility that it gets expanded to user's home directory.
* The \`/\` character can't be used on POSIX filesystems, since it's the
  directory separator.

The characters are escaped to the mailbox name as
\`<mailbox_list_storage_escape_char><hex>\`.

::: info
It's possible to use the same character here as for
[[setting,mailbox_list_visible_escape_char]].
:::`
	},

	mailbox_list_drop_noselect: {
		tags: [ 'mail-location' ],
		values: setting_types.BOOLEAN,
		default: 'yes',
		text: `
Specifies whether to automatically delete \`\NoSelect\` mailboxes that have no
children. These mailboxes are sometimes confusing to users. Also if a
\`\NoSelect\` mailbox is attempted to be created with \`CREATE box/\`, it's
created as selectable mailbox instead.

::: info
[[link,maildir]] layout does not support \`\NoSelect\` mailboxes, so this
setting has no effect with it.
:::`
	},

	mailbox_list_validate_fs_names: {
		tags: [ 'mail-location' ],
		seealso: [ 'mail_full_filesystem_access' ],
		values: setting_types.BOOLEAN,
		default: 'yes',
		text: `
Specifies whether to disallow mailbox names that might be unsafe to use in
filesystems or potentially allow bypassing ACL checks:

* \`/\` character anywhere in the name (except as a hierarchy separator),
  unless mailbox list isn't on a filesystem (e.g. index, imapc).
* \`/\` as the first character.
* \`~\` as the first character (so it's not confused as home directory).
* No adjacent \`/\` characters.
* No \`.\` or \`..\` names between \`/\` characters.
* No [[setting,mailbox_directory_name]] between \`/\` characters.
* No mailbox format-specific internal directories between \`/\` characters,
* unless [[setting,mailbox_directory_name]] is non-empty. This mainly means the
  Maildir \`new\`, \`cur\` and \`tmp\` directories in some configurations.

Enabling [[setting,mail_full_filesystem_access]] enables also this setting.`
	},

	mailbox_list_iter_from_index_dir: {
		tags: [ 'mail-location' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Perform mailbox listing using the [[setting,mail_index_path]] directories
instead of the [[setting,mail_path]] directories. Mainly useful when the index
file storage is on a faster storage.`
	},

	mailbox_list_utf8: {
		tags: [ 'mail-location' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Store mailbox names on disk using UTF-8 instead of modified UTF-7 (mUTF-7).`
	},

	mailbox_idle_check_interval: {
		default: '30secs',
		tags: [ 'imap' ],
		values: setting_types.TIME,
		advanced: true,
		text: `
The minimum time between checks for new mail/other changes when a mailbox
is in the IMAP IDLE state.`
	},

	mailbox_list_index: {
		default: 'yes',
		values: setting_types.BOOLEAN,
		text: `
Dovecot indexes live at the root of user's mailbox storage, and allows
quick lookup of mailbox status instead of needing to open all mailbox
indexes separately.

Enabling this optimizes the server reply to IMAP STATUS commands, which are
commonly issued by clients. This also needs to be enabled if you wish to
enable the IMAP NOTIFY extension.`
	},

	mailbox_list_index_include_inbox: {
		default: 'no',
		seealso: [ 'mailbox_list_index' ],
		values: setting_types.BOOLEAN,
		text: `
Should INBOX be kept up-to-date in the mailbox list index?

Disabled by default as most mailbox accesses will open INBOX anyway.`
	},

	mailbox_list_index_very_dirty_syncs: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
If enabled, assume that the mailbox list index is fully updated so that
stat() will not be run for mailbox files/directories.`
	},

	maildir_broken_filename_sizes: {
		default: 'no',
		tags: [ 'maildir' ],
		seealso: [ '[[link,maildir]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, do not obtain a mail message's physical size from the
\`S=<size>\` data in the Maildir filename except when recalculating the
Maildir++ quota.`
	},

	maildir_copy_with_hardlinks: {
		default: 'yes',
		tags: [ 'maildir' ],
		seealso: [ '[[link,maildir]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, copying of a message is done with hard links whenever possible.

This makes the performance much better, and it's unlikely to have any side
effects. The only reason to disable this is if you're using a filesystem
where hard links are slow (e.g. HFS+).`
	},

	maildir_empty_new: {
		default: 'no',
		tags: [ 'maildir' ],
		seealso: [ '[[link,maildir]]' ],
		values: setting_types.BOOLEAN,
		text: `
Should mail messages always be moved from the \`new/\` directory to
\`cur/\`, even when the \`\Recent\` flags aren't being reset?`
	},

	maildir_stat_dirs: {
		default: 'no',
		tags: [ 'maildir' ],
		seealso: [ '[[link,maildir]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, don't include non-directory files in a LIST response that begin
with a dot. Thus, if disabled, Dovecot assumes that all the files beginning
with a dot in the Maildir are Maildirs.

You shouldn't have any non-directory files beginning with a dot in the
Maildirs, but if you do you may need to set this to \`yes\`, in which case
Dovecot needs to \`stat()\` each directory entry, which degrades the
performance. Some filesystems (e.g. ext4) provide the
directory/non-directory status for free without having to \`stat()\`.
In those filesystems this setting is ignored.`
	},

	maildir_very_dirty_syncs: {
		default: 'no',
		tags: [ 'maildir' ],
		seealso: [ '[[link,maildir]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled (\`yes\`), Dovecot is assumed to be the only MUA that accesses
Maildir directly, so the \`cur/\` directory is scanned only when its mtime
changes unexpectedly or when the mail cannot otherwise be found.

If enabled and another process (or a Dovecot process which doesn't update
index files) does changes to \`cur/\` while the mailbox is simultaneously
being modified by Dovecot, Dovecot may not notice those external changes.

It is still safe to deliver new mails to \`new/\` using non-Dovecot
software (except with [[setting,mailbox_list_index,yes]], changes aren't
noticed outside INBOX).`
	},

	mbox_dirty_syncs: {
		default: 'yes',
		seealso: [ 'mbox_very_dirty_syncs', '[[link,mbox]]' ],
		tags: [ 'mbox' ],
		values: setting_types.BOOLEAN,
		text: `
Enable optimized mbox syncing?

For larger mbox files, it can take a long time to determine what has
changed when the file is altered unexpectedly. Since the change in
most cases consists solely of newly appended mail, Dovecot can
operate more quickly if it starts off by simply reading the new
messages, then falls back to reading the entire mbox file if
something elsewhere in it isn't as expected.

Dovecot assumes that external mbox file changes only mean that new messages
were appended to it. Without this setting Dovecot re-reads the whole mbox
file whenever it changes. There are various safeguards in place to make this
setting safe even when other changes than appends were done to the mbox. The
downside to this setting is that external message flag modifications may not
be visible immediately.

When this setting is enabled, Dovecot tries to avoid re-reading the mbox
every time something changes. Whenever the mbox changes (i.e. timestamp or
size), Dovecot first checks if the mailbox's size changed. If it didn't, it
most likely meant that only message flags were changed so it does a full
mbox read to find it. If the mailbox shrunk, it means that mails were
expunged and again Dovecot does a full sync. Usually however the only thing
besides Dovecot that modifies the mbox is the LDA which appends new mails
to the mbox. So if the mbox size was grown, Dovecot first checks if the
last known message is still where it was last time. If it is, Dovecot reads
only the newly added messages and goes into "dirty mode". As long as
Dovecot is in dirty mode, it can't be certain that mails are where it
expects them to be, so whenever accessing some mail, it first verifies that
it really is the correct mail by finding its X-UID header. If the X-UID
header is different, it fallbacks to a full sync to find the mail's correct
position. The dirty mode goes away after a full sync. If
[[setting,mbox_lazy_writes]] was enabled and the mail didn't yet
have an X-UID header, Dovecot uses the MD5 sum of a couple of headers to
compare the mails.`
	},

	mbox_dotlock_change_timeout: {
		default: '2 mins',
		tags: [ 'mbox' ],
		seealso: [ '[[link,mbox]]' ],
		values: setting_types.TIME,
		text: `
Override a lockfile after this amount of time if a dot-lock exists but the
mailbox hasn't been modified in any way.`
	},

	mbox_lazy_writes: {
		default: 'yes',
		tags: [ 'mbox' ],
		seealso: [ '[[link,mbox]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, mbox headers (e.g., metadata updates, such as writing X-UID
headers or flag changes) are not written until a full write sync is
performed (triggered via IMAP EXPUNGE or CHECK commands and/or when the
mailbox is closed). mbox rewrites can be costly, so this may avoid a lot of
disk writes.

Enabling this setting is especially useful with POP3, in which clients
often delete all mail messages.

One negative consequence of enabling this setting is that the changes
aren't immediately visible to other MUAs.

C-Client works the same way. The upside of this is that it reduces writes
because multiple flag updates to same message can be grouped, and sometimes
the writes don't have to be done at all if the whole message is expunged.
The downside is that other processes don't notice the changes immediately
(but other Dovecot processes do notice because the changes are in index
files).`
	},

	mbox_lock_timeout: {
		default: '5 mins',
		tags: [ 'mbox' ],
		seealso: [ '[[link,mbox]]' ],
		values: setting_types.TIME,
		text: `
The maximum time to wait for all locks to be released before aborting.`
	},

	mbox_md5: {
		default: 'apop3d',
		tags: [ 'mbox' ],
		seealso: [ 'pop3_uidl_format', '[[link,mbox]]' ],
		values: setting_types.STRING,
		values_enum: [ 'apop3d', 'all' ],
		advanced: true,
		text: `
The mail-header selection algorithm to use for MD5 POP3 UIDLs when the
setting [[setting,pop3_uidl_format,%m]] is applied.`
	},

	mbox_min_index_size: {
		default: 0,
		tags: [ 'mbox' ],
		seealso: [ '[[link,mbox]]' ],
		values: setting_types.SIZE,
		advanced: true,
		text: `
For mboxes smaller than this size, index files are not written.

If an index file already exists, it gets read but not updated.

The default should not be changed for most installations.`
	},

	mbox_read_locks: {
		default: 'fcntl',
		tags: [ 'mbox' ],
		seealso: [ '[[link,mbox]]' ],
		values: setting_types.BOOLLIST,
		values_enum: [ 'dotlock', 'dotlock_try', 'fcntl', 'flock', 'lockf' ],
		text: `
Specify which locking method(s) to use for locking the mbox files during
reading.

Descriptions of the locking methods can be found at [[link,mbox_locking]].`
	},

	mbox_very_dirty_syncs: {
		default: 'no',
		tags: [ 'mbox' ],
		seealso: [ 'mbox_dirty_syncs', '[[link,mbox]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, Dovecot performs the optimizations from
[[setting,mbox_dirty_syncs]] also for the IMAP SELECT, EXAMINE,
EXPUNGE, and CHECK commands.

If set, this option overrides [[setting,mbox_dirty_syncs]].`
	},

	mbox_write_locks: {
		default: 'dotlock fcntl',
		tags: [ 'mbox' ],
		seealso: [ '[[link,mbox]]' ],
		values: setting_types.BOOLLIST,
		values_enum: [ 'dotlock', 'dotlock_try', 'fcntl', 'flock', 'lockf' ],
		text: `
Specify which locking method(s) to use for locking the mbox files during
writing.

Descriptions of the locking methods can be found at [[link,mbox_locking]].`
	},

	mdbox_preallocate_space: {
		default: 'no',
		tags: [ 'mdbox' ],
		seealso: [ 'mdbox_rotate_size', '[[link,mdbox]]' ],
		values: setting_types.BOOLEAN,
		text: `
mdbox only: If enabled, preallocate space for newly created files.

In creation of new mdbox files, their size is immediately
preallocated as [[setting,mdbox_rotate_size]].

This setting currently works only in Linux with certain filesystems (ext4
and xfs).`
	},

	mdbox_rotate_interval: {
		default: 0,
		tags: [ 'mdbox' ],
		seealso: [ '[[link,mdbox]]' ],
		values: setting_types.SIZE,
		text: `
mdbox only: The maximum age the dbox file may reach before it's rotated.

\`0\` means there is no age-based rotation.`
	},

	mdbox_rotate_size: {
		default: '10M',
		tags: [ 'mdbox' ],
		seealso: [ '[[link,mdbox]]' ],
		values: setting_types.SIZE,
		text: `
mdbox only: The maximum size the dbox file may reach before it is rotated.`
	},

	mmap_disable: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
Disable mmap() usage?

This must be set to \`yes\` if you store indexes to shared filesystems
(i.e., if you use NFS or a clustered filesystem).`
	},

	namespace: {
		tags: [ 'namespace' ],
		values: setting_types.STRING,
		text: `
Creates a new namespace to the list of namespaces. The filter name refers to
the [[setting,namespace_name]] setting.

Example:

\`\`\`
namespace foo {
  [...]
}
\`\`\``
	},

	namespace_name: {
		tags: [ 'namespace' ],
		values: setting_types.STRING,
		text: `
Name of the namespace. This is used only in configurations - it's not visible
to user. The [[setting,namespace]] filter refers to this setting.`
	},

	namespace_alias_for: {
		tags: [ 'namespace' ],
		values: setting_types.STRING,
		text: `
Refers to an alias namespace's [[setting,namespace_name]].

If multiple namespaces point to the same location, they should be marked as
aliases against one primary namespace. This avoids duplicating work for
some commands (listing the same mailbox multiple times).

[[variable,mail-user]] can be used.

Note: Alias namespaces often have \`hidden=yes\` and \`list=no\` so
they are not visible unless clients have specifically configured
them, and they're typically used when migrating to a different
namespace prefix for existing users.

Example:

\`\`\`[dovecot.conf]
namespace inbox {
  prefix =
  # ...
}
namespace alias {
  prefix = INBOX/
  alias_for = inbox
}
\`\`\``
	},

	namespace_disabled: {
		default: 'no',
		tags: [ 'namespace' ],
		values: setting_types.BOOLEAN,
		text: `
If \`yes\`, namespace is disabled and cannot be accessed by user in any way.

Useful when returned by a userdb lookup to easily configure per-user
namespaces.`
	},

	namespace_hidden: {
		default: 'no',
		tags: [ 'namespace' ],
		values: setting_types.BOOLEAN,
		text: `
If \`yes\`, namespace will be hidden from IMAP NAMESPACE ([[rfc,2342]])
command.`
	},

	namespace_ignore_on_failure: {
		default: 'no',
		tags: [ 'namespace' ],
		values: setting_types.BOOLEAN,
		text: `
If namespace's storage initialization fails, by default the entire session will
fail to start. If this is set, this namespace will be ignored instead.`
	},

	namespace_inbox: {
		default: 'no',
		tags: [ 'namespace' ],
		values: setting_types.BOOLEAN,
		text: `
If \`yes\`, this namespace will be considered the one holding the INBOX
folder.

There can be only one namespace defined like this.`
	},

	namespace_list: {
		default: 'yes',
		tags: [ 'namespace' ],
		seealso: [ 'namespace_hidden' ],
		values: setting_types.ENUM,
		values_enum: [ 'yes', 'no', 'children' ],
		text: `
Include this namespace in LIST output when listing its parent's folders.

Options:

| Value | Description |
| ----- | ----------- |
| \`children\` | Namespace prefix list listed only if it has child mailboxes. |
| \`no\` | Namespace and mailboxes not listed unless listing requests explicitly mailboxes under the namespace prefix. |
| \`yes\` | Namespace and mailboxes are always listed. |

It is still possible to list the namespace's folders by explicitly asking
for them. For example, if this setting is \`no\`, using \`LIST "" *\` with
namespace prefix "lazy-expunge/" won't list it, but using \`LIST ""
lazy-expunge/*\` lists all folders under it.`
	},

	namespace_order: {
		default: 0,
		tags: [ 'namespace' ],
		values: setting_types.UINT,
		text: `
Sets display order in IMAP NAMESPACE ([[rfc,2342]]) command.

Namespaces are automatically numbered if this setting does not exist.`
	},

	namespace_prefix: {
		tags: [ 'namespace' ],
		values: setting_types.STRING,
		text: `
Specifies prefix for namespace.

::: info
Must end with [[setting,namespace_separator]].
:::

[[variable,mail-user]] can be used.

Example:

\`\`\`
namespace {
  prefix = Shared/
  separator = /
}
\`\`\``
	},

	namespace_separator: {
		default: '"." for Maildir; "/" for other mbox formats',
		tags: [ 'namespace' ],
		seealso: [ '[[link,namespaces_hierarchy_separators]]' ],
		values: setting_types.STRING,
		text: `
Specifies the hierarchy separator for the namespace.

The separator is a single character, which can't then otherwise be used in
folder names.

The commonly used separators are \`.\` and \`/\`, but other separators can
be used as well. For example \`^\` is less likely to be found in normal
folder names.

Recommended value is to leave it empty and accept the default value.`
	},

	namespace_subscriptions: {
		default: 'yes',
		tags: [ 'namespace' ],
		values: setting_types.BOOLEAN,
		text: `
Whether subscriptions are stored in this namespace.

This is usually \`no\` for shared namespaces so that the shared folders'
subscriptions are stored in the user's primary subscriptions file. If
\`no\`, the subscriptions are stored in the first parent namespace (based
on the prefix) that has this setting enabled.

Example: If this setting is \`no\` for a namespace with
\`prefix=foo/bar/\`, Dovecot first sees if there's a \`prefix=foo/\`
namespace with \`subscriptions=yes\` and then a namespace with an empty
prefix. If neither is found, an error is given.`
	},

	namespace_type: {
		default: 'private',
		tags: [ 'namespace' ],
		values: setting_types.ENUM,
		values_enum: [ 'private', 'shared', 'public' ],
		text: `
The namespace type.  One of:

| Type | Description |
| ---- | ----------- |
| \`public\` | Contains [[link,shared_mailboxes_public]]. |
| \`private\` | Typically contains only user's own private mailboxes. |
| \`shared\` | Contains other users' [[link,shared_mailboxes_user]]. |`
	},

	mailbox: {
		tags: [ 'mailbox' ],
		values: setting_types.NAMED_LIST_FILTER,
		text: `
Create a new mailbox to the list of mailboxes. The filter name refers to the
[[setting,mailbox_name]] setting.

::: tip
If the mailbox name has spaces, you can put it into quotes:

\`\`\`[dovecot.conf]
mailbox "Test Mailbox" {
  # ...
}
\`\`\`
:::`
	},

	mailbox_name: {
		tags: [ 'mailbox' ],
		values: setting_types.STRING,
		text: `
Name of the mailbox being configured. The [[setting,mailbox]] filter name
refers to this setting.`
	},

	mailbox_auto: {
		default: 'no',
		tags: [ 'mailbox' ],
		values: setting_types.ENUM,
		values_enum: [ 'create', 'no', 'subscribe' ],
		text: `
Autocreate and/or subscribe to the mailbox?

| Value | Description |
| ----- | ----------- |
| \`create\` | Autocreate but don't autosubscribe |
| \`no\` | Don't autocreate or autosubscribe |
| \`subscribe\` | Autocreate and autosubscribe |

Autocreated mailboxes are created lazily to disk only when accessed for
the first time. The autosubscribed mailboxes aren't written to
subscriptions file, unless SUBSCRIBE command is explicitly used for them.`
	},

	mailbox_autoexpunge: {
		default: 'no',
		seealso: [ 'mailbox_autoexpunge_max_mails' ],
		tags: [ 'mailbox' ],
		values: setting_types.TIME,
		text: `
Expunge all mails in this mailbox whose saved-timestamp is older than this
value.

For IMAP and POP3 this happens after the client is already disconnected.

For LMTP this happens when the user's mail delivery is finished. Note that
in case there are multiple recipients, autoexpunging is done only for some
of the recipients to prevent delays with the mail delivery: The last
recipient user is autoexpunged first. Next, the first recipient user is
autoexpunged (because the first user's mail was kept open in case it could
be directly copied to the other users). None of the middle recipient users
are autoexpunged.

[[setting,mailbox_list_index,yes]] is highly recommended when
using this setting, as it avoids actually opening the mailbox to see if
anything needs to be expunged.

[[setting,mail_always_cache_fields,date.save]] is also
recommended when using this setting with [[link,sdbox]] or [[link,maildir]],
as it avoids using \`stat()\` to find out the mail's saved-timestamp. With
[[link,mdbox]] format this isn't necessary, since the saved-timestamp is
always available.`
	},

	mailbox_autoexpunge_max_mails: {
		default: 0,
		tags: [ 'mailbox' ],
		values: setting_types.UINT,
		text: `
Mails are autoexpunged until mail count is at or below this number of messages.

Once this threshold has been reached, [[setting,mailbox_autoexpunge]]
processing is done.`
	},

	mailbox_special_use: {
		tags: [ 'mailbox' ],
		changed: {
			settings_mailbox_special_use_changed: `
Using non-standard special-use flags will result in a warning message at
startup.`
		},
		values: setting_types.BOOLLIST,
		text: `
List of SPECIAL-USE ([[rfc,6154]]) flags to broadcast for the mailbox.

There are no validity checks, so you could specify anything you want here,
but it's not a good idea to use other than the standard ones specified in
the RFC.`
	},

	metric: {
		tags: [ 'metrics' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'metric_name' ],
		text: `
Creates a new metric. The filter name refers to the [[setting,metric_name]]
setting.`
	},

	metric_name: {
		tags: [ 'metrics' ],
		values: setting_types.STRING,
		text: `
Name of the metric. It is visible in statistics outputs. The [[setting,metric]]
filter name refers to this setting.`
	},

	metric_fields: {
		changed: {
			settings_metric_fields_changed: `
All listed fields are exported to OpenMetrics as well.`
		},
		tags: [ 'metrics' ],
		values: setting_types.BOOLLIST,
		text: `
A list of fields included in the metric. All events have a default \`duration\`
field that does not need to be listed explicitly.`
	},

	metric_group_by: {
		tags: [ 'metrics' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ '[[link,stats_group_by]]' ],
		text: `
Creates a new [[link,stats_group_by,group_by]] for dynamically generating
sub-metrics based on the specified field's values. The filter name refers to
the [[setting,metric_group_by_field]].`
	},

	metric_group_by_field: {
		tags: [ 'metrics' ],
		values: setting_types.STRING,
		seealso: [ '[[link,stats_group_by]]' ],
		text: `
Generate sub-metrics based on this event field name. The
[[setting,metric_group_by]] filter name refers to this setting.`
	},

	metric_group_by_method: {
		tags: [ 'metrics' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ '[[link,stats_group_by]]' ],
		text: `
Configures [[setting,metric_group_by_method_method,the aggregation method]] for
the [[setting,metric_group_by]]. Only a single method can be specified for
a group_by. The filter name refers to the
[[setting,metric_group_by_method_method]].`
	},

	metric_group_by_method_method: {
		tags: [ 'metrics' ],
		values: setting_types.ENUM,
		values_enum: [ 'discrete', 'exponential', 'linear' ],
		default: 'discrete',
		seealso: [ '[[link,stats_group_by]]' ],
		text: `
Configures the aggregation method for the
[[setting,metric_group_by]]. The [[setting,metric_group_by_method]] filter name
refers to this setting.`
	},

	metric_group_by_method_discrete_modifier: {
		tags: [ 'metrics' ],
		values: setting_types.STRING_NOVAR,
		seealso: [ '[[link,stats_group_by]]' ],
		text: `
Configures a modifier string for values grouped by the
[[link,stats_group_by_discrete,discrete method]].
[[link,settings_variables,%variables]] and their functions can be used:

\`%{value}\`
:   The original value.

\`%{domain}\`
:   If the value is in \`user@domain\` format, this contains the \`domain\`
    text. Otherwise empty.`
	},

	metric_group_by_method_exponential_min_magnitude: {
		tags: [ 'metrics' ],
		values: setting_types.UINT,
		seealso: [
			'[[link,stats_group_by]]',
			'metric_group_by_method_exponential_max_magnitude',
			'metric_group_by_method_exponential_base'
		],
		text: `
Configures the minimum magnitude for values grouped by the
[[link,stats_group_by_exponential,exponential method]].`
	},

	metric_group_by_method_exponential_max_magnitude: {
		tags: [ 'metrics' ],
		values: setting_types.UINT,
		seealso: [
			'[[link,stats_group_by]]',
			'metric_group_by_method_exponential_min_magnitude',
			'metric_group_by_method_exponential_base'
		],
		text: `
Configures the maximum magnitude for values grouped by the
[[link,stats_group_by_exponential,exponential method]].`
	},

	metric_group_by_method_exponential_base: {
		tags: [ 'metrics' ],
		values: setting_types.UINT,
		default: 10,
		seealso: [
			'[[link,stats_group_by]]',
			'metric_group_by_method_exponential_min_magnitude',
			'metric_group_by_method_exponential_max_magnitude'
		],
		text: `
Configures the base for values grouped by the
[[link,stats_group_by_exponential,exponential method]]. Only 2 and 10 are
supported.`
	},

	metric_group_by_method_linear_min: {
		tags: [ 'metrics' ],
		values: setting_types.UINT,
		seealso: [
			'[[link,stats_group_by]]',
			'metric_group_by_method_linear_max',
			'metric_group_by_method_linear_step'
		],
		text: `
Configures the minimum for values grouped by the
[[link,stats_group_by_linear,linear method]].`
	},

	metric_group_by_method_linear_max: {
		tags: [ 'metrics' ],
		values: setting_types.UINT,
		seealso: [
			'[[link,stats_group_by]]',
			'metric_group_by_method_linear_min',
			'metric_group_by_method_linear_step'
		],
		text: `
Configures the maximum for values grouped by the
[[link,stats_group_by_linear,linear method]].`
	},

	metric_group_by_method_linear_step: {
		tags: [ 'metrics' ],
		values: setting_types.UINT,
		seealso: [
			'[[link,stats_group_by]]',
			'metric_group_by_method_linear_min',
			'metric_group_by_method_linear_max'
		],
		text: `
Configures the step for values grouped by the
[[link,stats_group_by_linear,linear method]].`
	},

	metric_filter: {
		tags: [ 'metrics' ],
		values: setting_types.STRING,
		seealso: [ '[[link,event_filter_metric]]' ],
		text: `
[[link,event_filter_metric,Event filter]] that matches the events belonging to
this metric.`
	},

	metric_exporter: {
		tags: [ 'metrics' ],
		values: setting_types.STRING,
		seealso: [ '[[link,event_export]]', 'event_exporter_name' ],
		text: `
Export events matching the filter with this
[[link,event_export,event exporter]]. Refers to the
[[setting,event_exporter_name]] setting. If empty, the events are used only for
statistics, and no exporting is done.`
	},

	metric_exporter_include: {
		tags: [ 'metrics' ],
		values: setting_types.BOOLLIST,
		default: 'name hostname timestamps categories fields',
		text: `
Specifies which parts of the event are exported to the serialized event:

| Values | Description |
| --- | --- |
| \`name\` | The name of the event. |
| \`hostname\` | The name of the host generating this event. |
| \`timestamps\` | The event start and end timestamps. |
| \`categories\` | A set of categories associated with this event. |
| \`fields\` | The fields associated with this event. The fields that will be exported are defined by the [[setting,metric_fields]] setting. |

For example:

\`\`\`[dovecot.conf]
metric example {
  exporter_include = name hostname timestamps
}
\`\`\`

includes just the 3 specified parts, while

\`\`\`[dovecot.conf]
metric another_example {
  exporter_include =
}
\`\`\`

includes nothing and the exported event will be empty (i.e. \`{}\` in JSON).`
	},

	metric_description: {
		tags: [ 'metrics' ],
		values: setting_types.STRING,
		text: `
Human-readable description of the metric. This is included in the HELP text
sent to OpenMetrics.`
	},

	oauth2: {
		tags: [ 'oauth2' ],
		values: setting_types.NAMED_FILTER,
		seealso: [ '[[link,auth_oauth2]]' ],
		text: `
Filter for oauth2 specific settings.`
	},

	oauth2_tokeninfo_url: {
		tags: [ 'oauth2' ],
		values: setting_types.STRING,
		text: `
URL for verifying token validity. Token is appended to the URL.

Example:

\`\`\`[dovecot.conf]
oauth2_tokeninfo_url = http://endpoint/oauth/tokeninfo?access_token=
\`\`\``
	},

	oauth2_introspection_url: {
		tags: [ 'oauth2' ],
		values: setting_types.STRING,
		text: `
URL for getting more information about token.`
	},

	oauth2_introspection_mode: {
		tags: [ 'oauth2' ],
		values: setting_types.ENUM,
		values_enum: [ '<empty>', 'auth', 'get', 'post', 'local' ],
		seealso: [
			'oauth2_introspection_url',
			'oauth2_tokeninfo_url',
			'oauth2_force_introspection',
		],
		text: `
To enable oauth2 you must choose how to do token introspection.
[[setting,oauth2_introspection_url]] is not required if
[[setting,oauth2_tokeninfo_url]] already provides all the necessary fields, or
if you are using \`local\` validation.

You can force introspection with [[setting,oauth2_force_introspection]], if you
need to it every time.

With \`local\` validation, [[setting,oauth2_tokeninfo_url]] is also ignored.

| Value | Description |
| --- | --- |
| \`auth\` | GET request with Bearer authentication. |
| \`get\` | GET request with token appended to URL. |
| \`post\` | POST request with token=bearer_token as content. |
| \`local\` | Attempt to locally validate and decode JWT token. |`
	},

	oauth2_force_introspection: {
		tags: [ 'oauth2' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Force introspection even if tokeninfo contains wanted fields. Set this to
\`yes\` if you are using [[setting,oauth2_active_attribute]].`
	},

	oauth2_local_validation: {
		tags: [ 'oauth2' ],
		values: setting_types.NAMED_FILTER,
		seealso: [ 'dict' ],
		text: `
A dictionary for fetching validation keys.

Example:

\`\`\`[dovecot.conf]
local_validation {
  dict fs {
    fs posix {
      prefix = /tmp/keys/
    }
  }
}
\`\`\``
	},

	oauth2_scope: {
		tags: [ 'oauth2' ],
		values: setting_types.BOOLLIST,
		text: `
A list of valid scopes.`
	},

	oauth2_username_attribute: {
		tags: [ 'oauth2' ],
		values: setting_types.STRING,
		default: 'email',
		text: `
Username attribute in response.`
	},

	oauth2_username_validation_format: {
		tags: [ 'oauth2' ],
		values: setting_types.STRING,
		default: '%u',
		seealso: [ 'oauth2_username_attribute' ],
		text: `
Normalization for oauth2 provided username, this setting is normally not
needed. You only need this if the username that comes from authentication will
not otherwise match with [[setting,oauth2_username_attribute]] value.`
	},

	oauth2_active_attribute: {
		tags: [ 'oauth2' ],
		values: setting_types.STRING,
		text: `
Attribute name for (optional) checking whether account is disabled.`
	},

	oauth2_active_value: {
		tags: [ 'oauth2' ],
		values: setting_types.STRING,
		text: `
Expected value in \`active_attribute\`. (empty = require present, but anything
goes)`
	},

	oauth2_issuers: {
		tags: [ 'oauth2' ],
		values: setting_types.BOOLLIST,
		text: `
Valid issuer(s) for the token.`
	},

	oauth2_openid_configuration_url: {
		tags: [ 'oauth2' ],
		values: setting_types.STRING,
		text: `
URL to [[rfc,7628]] OpenID Provider Configuration Information schema.`
	},

	oauth2_fields: {
		tags: [ 'oauth2' ],
		values: setting_types.STRLIST,
		text: `
Key-value fields to include in successful authentication.`
	},

	oauth2_send_auth_headers: {
		tags: [ 'oauth2' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Whether to send special headers about authentication to remote server. If you
enable this, the following headers will be sent:

\`X-Dovecot-Auth-Protocol\`
:   Requested protocol, such as imap or pop3.

\`X-Dovecot-Auth-Local\`
:   Local IP address where client connected to.

\`X-Dovecot-Auth-Remote\`
:   Remote IP address of the client connection.`
	},

	oauth2_use_worker_with_mech: {
		tags: [ 'oauth2' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		seealso: [ 'passdb_use_worker' ],
		text: `
Use worker process to verify token. This setting only applies to mechanism. If
you want to use worker with \`passdb oauth2\`, use
[[setting,passdb_use_worker]] instead. Worker processes are mostly useful for
distributing local token validation to multiple CPUs.`
	},

	passdb: {
		tags: [ 'passdb' ],
		values: setting_types.NAMED_LIST_FILTER,
		dependencies: [ 'passdb_driver' ],
		seealso: [ '[[link,passdb]]', 'passdb_name', 'passdb_driver' ],
		text: `
Creates a new [[link,passdb]]. The filter name refers to the
[[setting,passdb_name]] setting.`
	},

	passdb_name: {
		tags: [ 'passdb' ],
		values: setting_types.STRING,
		seealso: [ 'passdb', 'passdb_driver' ],
		text: `
Name of the passdb. The [[setting,passdb]] filter name refers to this setting.
If the [[setting,passdb_driver]] setting is empty, the \`passdb_name\` is used
as the driver. This allows doing e.g.:

\`\`\`[dovecot.conf]
passdb passwd-file {
  passwd_file_path = /etc/dovecot/passwd
\`\`\``
	},

	passdb_driver: {
		tags: [ 'passdb' ],
		values: setting_types.STRING,
		seealso: [ 'passdb_name', '[[link,passdb]]' ],
		text: `
The driver used for this password database. If empty, defaults to
[[setting,passdb_name]]. See [[link,passdb]] for the list of available
drivers.`
	},

	passdb_args: {
		tags: [ 'passdb' ],
		values: setting_types.STRING,
		text: `
Arguments for the passdb driver. The format of this value depends on the
passdb driver. Each one uses different args.`
	},

	passdb_fields: {
		tags: [ 'passdb' ],
		values: setting_types.STRLIST,
		seealso: [ '[[link,passdb_extra_fields]]' ],
		text: `
Passdb fields (and [[link,passdb_extra_fields]]). The values can contain
[[link,settings_variables,%variables]]. All \`%variables\` used here reflect
the state **after** the current passdb lookup, and can refer to fields returned
by previous passdb lookups. Depending on the passdb driver, it can also refer
to variable fields returned by it (e.g. \`%{ldap:fieldName}\`).

::: info
The LDAP driver provides additional specific variables,
see [[link,auth_ldap]] for more details.
:::

For example:

\`\`\`[dovecot.conf]
passdb ldap {
  fields {
    user = %{ldap:userId}
    proxy = yes
    host = %{ldap:proxyHost}
  }
}
\`\`\``
	},

	passdb_fields_import_all: {
		tags: [ 'passdb' ],
		values: setting_types.BOOLEAN,
		default: {
			value: 'yes',
			text: `For \`passdb ldap\` the default is \`no\`.`
		},
		seealso: [ 'passdb_fields' ],
		text: `
If yes, import all fields returned by the passdb lookup. If no, require
[[setting,passdb_fields]] to explicitly add wanted fields.`
	},

	passdb_default_password_scheme: {
		tags: [ 'passdb' ],
		values: setting_types.STRING,
		default: {
			value: 'PLAIN',
			text: 'specific [[link,passdb]] have different defaults',
		},
		text: `
The scheme that passwords are in the passdb, unless overridden by the passdb
entry (typically by prefixing with \`{SCHEME}\`).`
	},

	passdb_mechanisms_filter: {
		tags: [ 'passdb' ],
		added: {
			settings_passdb_mechanisms_filter_added: false,
		},
		values: setting_types.BOOLLIST,
		text: `
Skip the passdb if non-empty and the current auth mechanism is not listed here.
If the value contains \`lookup\`, it matches for non-authenticating passdb
lookups (e.g. lmtp/doveadm lookups).

Example:

\`\`\`[dovecot.conf]
passdb passwd-file {
  driver = passwd-file
  mechanisms_filter = PLAIN LOGIN
  # ...
}
\`\`\``
	},

	passdb_username_filter: {
		tags: [ 'passdb' ],
		added: {
			settings_passdb_username_filter_added: false,
		},
		values: setting_types.STRING,
		text: `
Skip the passdb if non-empty and the username doesn't match the filter. This is
mainly used to assign specific passdbs to specific domains. Space or
comma-separated list of username filters that can have \`*\` or \`?\`
wildcards. If any of the filters matches, the filter succeeds. Define negative
matches by preceding \`!\`. If any of the negative filter matches, the filter
won't succeed.

**Example**:
* Filter: \`*@example.com *@example2.com !user@example.com\`
* Matches:
  * \`any@example.com\`
  * \`user@example2.com\`
* Won't match:
  * \`user@example.com\``
	},

	passdb_skip: {
		tags: [ 'passdb' ],
		values: setting_types.ENUM,
		values_enum: [ 'never', 'authenticated', 'unauthenticated' ],
		default: 'never',
		text: `
Configures when passdbs should be skipped:

| Value | Description |
| --- | --- |
| \`never\` | Never skip over this passdb. |
| \`authenticated\` | Skip if an earlier passdb already authenticated the user successfully. |
| \`unauthenticated\` | Skip if user hasn't yet been successfully authenticated by the previous passdbs. |`
	},

	passdb_static_password: {
		added: {
			settings_passdb_static_password_added: false,
		},
		tags: [ 'passdb' ],
		values: setting_types.STRING,
		text: `
The static password to be used for all users authenticating using this passdb.`
	},

	passdb_use_worker: {
		tags: [ 'passdb' ],
		values: setting_types.BOOLEAN,
		default: {
			value: 'no',
			text: 'specific [[link,passdb]] have different defaults',
		},
		text: `
If \`yes\`, run the passdb lookup in auth-worker process instead of the main
auth process.`
	},

	passdb_result_success: {
		tags: [ 'passdb' ],
		values: setting_types.ENUM,
		values_enum: [
			'return-ok',
			'return',
			'return-fail',
			'continue',
			'continue-ok',
			'continue-fail',
		],
		default: 'return-ok',
		seealso: [ '[[link,passdb_result_values]]' ],
		text: `
What to do after the passdb authentication succeeded. Possible values and their
meaning are described fully at [[link,passdb_result_values]].

This is commonly used together with master passdb to specify that even after a
successful master user authentication, the authentication should continue to
the actual non-master passdb to lookup the user.`
	},

	passdb_result_failure: {
		tags: [ 'passdb' ],
		values: setting_types.ENUM,
		values_enum: [
			'return-ok',
			'return',
			'return-fail',
			'continue',
			'continue-ok',
			'continue-fail',
		],
		default: 'continue',
		seealso: [ '[[link,passdb_result_values]]' ],
		text: `
What to do after the passdb authentication failed. Possible values and their
meaning are described fully at [[link,passdb_result_values]].`
	},

	passdb_result_internalfail: {
		tags: [ 'passdb' ],
		values: setting_types.ENUM,
		values_enum: [
			'return-ok',
			'return',
			'return-fail',
			'continue',
			'continue-ok',
			'continue-fail',
		],
		default: 'continue',
		seealso: [ '[[link,passdb_result_values]]' ],
		text: `
What to do after the passdb authentication failed due to an internal error.
Possible values and their meaning are described fully at
[[link,passdb_result_values]]. If any of the passdbs had an internal failure
and the final passdb also returns \`continue\` the authentication will fail
with \`internal error\`.`
	},

	passdb_deny: {
		tags: [ 'passdb' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If \`yes\` and the user is found from the \`denied user database\` the
authentication will fail.`
	},

	passdb_master: {
		tags: [ 'passdb' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
If \`yes\` and the user is found from the [[link,auth_master_users]] the user
is allowed to login as other users.`
	},

	passdb_sql_query: {
		tags: [ 'passdb' ],
		values: setting_types.STRING,
		text: `
SQL query to lookup the passdb fields (\`password\` and other extra fields).`
	},

	passdb_sql_update_query: {
		tags: [ 'passdb' ],
		values: setting_types.STRING,
		text: `
SQL query to update the password. Currently used only by the \`OTP\` auth
mechanism.`
	},

	passdb_pam_max_requests: {
		tags: [ 'passdb', 'passdb-pam' ],
		values: setting_types.UINT,
		default: 100,
		seealso: [ 'service_restart_request_count' ],
		text: `
Number of requests a auth-worker process handles for passdb pam before it dies.
This configures similar behaviour as the
[[setting,service_restart_request_count]] setting but it limits only the number
of pam passdb requests, not all requests to be handled by an auth-worker.`
	},

	passdb_pam_failure_show_msg: {
		tags: [ 'passdb', 'passdb-pam' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Replace the default \`Authentication failed\` reply with PAM's failure.`
	},

	passdb_pam_service_name: {
		tags: [ 'passdb', 'passdb-pam' ],
		values: setting_types.STRING,
		default: 'dovecot',
		text: `
The PAM service name to be used with the pam passdb.`
	},

	passdb_pam_setcred: {
		tags: [ 'passdb', 'passdb-pam' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Make Dovecot create PAM credentials. The credentials are never deleted, which
may cause problems with some PAM plugins.`
	},

	passdb_pam_session: {
		tags: [ 'passdb', 'passdb-pam' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Make Dovecot open a PAM session and close it immediately.`
	},

	passwd_file_path: {
		tags: [ 'passwd-file' ],
		values: setting_types.STRING,
		text: `
Path to the passwd-file.`
	},

	pop3_client_workarounds: {
		tags: [ 'pop3' ],
		values: setting_types.BOOLLIST,
		text: `
Workarounds for various POP3 client bugs can be enabled here.

The following values are currently supported:

\`oe-ns-eoh\`
:   Because Outlook Express and Netscape Mail expect an end-of-headers
    line, this option sends one explicitly if none has been sent.

\`outlook-no-nuls\`
:   Because Outlook and Outlook Express hang if messages contain NUL
    characters, this setting replaces each of them with a \`0x80\` character.`
	},

	pop3_delete_type: {
		default: 'default',
		tags: [ 'pop3' ],
		values: setting_types.ENUM,
		values_enum: [ 'default', 'flag', 'expunge' ],
		text: `
Action to perform in POP3 when mails are deleted and
[[setting,pop3_deleted_flag]] is enabled.`
	},

	pop3_deleted_flag: {
		seealso: [ 'pop3_delete_type' ],
		tags: [ 'pop3' ],
		values: setting_types.STRING,
		text: `
Change POP3 behavior so a user cannot permanently delete messages via POP3.

Instead, the messages are hidden from POP3 sessions by setting an IMAP
flag, which Dovecot will filter out in future listings.

To enable this behavior, enter the name of the IMAP keyword to use.

::: info
This keyword will visible on IMAP clients for the message.
:::

Example:

\`\`\`
pop3_deleted_flag = $POP3Deleted
\`\`\``
	},

	pop3_enable_last: {
		default: 'no',
		tags: [ 'pop3' ],
		values: setting_types.BOOLEAN,
		text: `
Enable support for the POP3 LAST command.

While this command has been removed from newer POP3 specs, some clients
still attempt to use it. Enabling this causes the RSET command to clear all
\\Seen flags that messages may have.`
	},

	pop3_fast_size_lookups: {
		default: 'no',
		tags: [ 'pop3' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, use the virtual message size of the message for POP3 replies if
available.

POP3 requires message sizes to be listed as if they contain CR+LF
line breaks; however, many POP3 servers instead return the sizes with
pure line feeds (LFs), for the sake of speed.

If enabled, use the virtual message size if available, before
falling back to the incorrect, physical size (used by many POP3
servers) if judging the correct size would have required opening the
message to determine.`
	},

	pop3_lock_session: {
		default: 'no',
		tags: [ 'pop3' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, only one POP3 session may exist for any single user.`
	},

	pop3_logout_format: {
		default: 'top=%t/%p retr=%r/%b del=%d/%m size=%s',
		tags: [ 'pop3' ],
		values: setting_types.STRING_NOVAR,
		text: `
The string to display to the client on POP3 logout (informational only).

Variables available (in addition to [[variable,mail-user]]):

| Variable Name | Short Form | Description |
| ------------- | ---------- | ----------- |
| \`%{input}\` | \`%i\` | Bytes read from the client |
| \`%{output}\` | \`%o\` | Bytes sent to the client |
| \`%{top_count}\` | \`%t\` | Number of TOP commands run |
| \`%{top_bytes}\` | \`%p\` | Bytes sent to the client because of TOP commands |
| \`%{retr_count}\` | \`%r\` | Number of RETR commands run |
| \`%{retr_bytes}\` | \`%b\` | Bytes sent to the client because of RETR commands |
| \`%{deleted_count}\` | \`%d\` | Number of deleted messages |
| \`%{deleted_bytes}\` | | Number of bytes in deleted messages |
| \`%{message_count}\` | \`%m\` | Number of messages before deletion |
| \`%{message_bytes}\` | \`%s\` | Mailbox size, in bytes, before deletion |
| \`%{uidl_change}\` | \`%u\` | The old and the new UIDL hash (which can be useful for identifying unexpected changes in UIDLs) |`
	},

	pop3_no_flag_updates: {
		default: 'no',
		tags: [ 'pop3' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, do not attempt to mark mail messages as seen or non-recent when
a POP3 session is involved.`
	},

	pop3_reuse_xuidl: {
		default: 'no',
		tags: [ 'pop3' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, and the mail message has an X-UIDL header, use this as the
mail's UIDL.`
	},

	pop3_save_uidl: {
		default: 'no',
		tags: [ 'maildir', 'pop3' ],
		values: setting_types.BOOLEAN,
		text: `
[[link,maildir]] only: If enabled, allow permanent saving of UIDLs sent to
POP3 clients so that changes to [[setting,pop3_uidl_format]] don't cause
future changes to the corresponding UIDLs.`
	},

	pop3_uidl_duplicates: {
		default: 'allow',
		tags: [ 'pop3' ],
		values: setting_types.ENUM,
		values_enum: [ 'allow', 'rename' ],
		text: `
How to handle any duplicate POP3 UIDLs that may exist.

Options:

\`allow\`
:   Show duplicates to clients.

\`rename\`
:   Append a temporary counter (such as -2 or -3) after the UIDL`
	},

	pop3_uidl_format: {
		default: '%08Xu%08Xv',
		tags: [ 'pop3' ],
		values: setting_types.STRING_NOVAR,
		text: `
The POP3 unique mail identifier (UIDL) format to use.

The following variables can be used in combination with the
standard variable modifiers (e.g., \`%Uf\` supplies the filename in uppercase)
and with [[variable,global]]:

| Variable Name | Short Form | Description |
| ------------- | ---------- | ----------- |
| \`%{uidvalidity}\` | \`%v\` | Mailbox's IMAP UIDVALIDITY value |
| \`%{uid}\` | \`%u\` | IMAP UID associated with the message |
| \`%{md5}\` | \`%m\` | MD5 sum of the mailbox headers in hex ([[link,mbox]] only) |
| \`%{filename}\` | \`%f\` | Filename ([[link,maildir]] only) |
| \`%{guid}\` | \`%g\`| Dovecot GUID for the message |`
	},

	pop3c_features: {
		tags: [ 'pop3c' ],
		values: setting_types.BOOLLIST,
		text: `
List of features, optimizations, and workarounds that can be enabled.

Workarounds:

\`no-pipelining\`
:   Prevents use of the PIPELINING extension even when it is advertised.`
	},

	pop3c_host: {
		tags: [ 'pop3c' ],
		values: setting_types.STRING,
		text: `The remote POP3 host to connect to.`
	},

	pop3c_master_user: {
		tags: [ 'pop3c' ],
		seealso: [ 'pop3c_password', 'pop3c_user' ],
		values: setting_types.STRING,
		text: `
The master username to authenticate as on the remote POP3 host.

To authenticate as a master user but use a separate login user, the
following configuration should be employed, where the credentials are
represented by masteruser and masteruser-secret:

\`\`\`
pop3c_user = %u
pop3c_master_user = masteruser
pop3c_password = masteruser-secret
\`\`\`

[[variable,mail-user]] can be used.`
	},

	pop3c_password: {
		tags: [ 'pop3c' ],
		seealso: [ 'pop3c_master_user', 'pop3c_user' ],
		values: setting_types.STRING,
		text: `
The authentication password for the remote POP3 server.

If using master users, this setting will be the password of the master user.`
	},

	pop3c_port: {
		default: 110,
		tags: [ 'pop3c' ],
		values: setting_types.IN_PORT,
		text: `The port on the remote POP3 host to connect to.`
	},

	pop3c_quick_received_date: {
		default: 'no',
		tags: [ 'pop3c' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, pop3c doesn't require calling TOP for each message in order to
get the metadata.`
	},

	pop3c_rawlog_dir: {
		seealso: [ '[[link,rawlog]]' ],
		tags: [ 'pop3c' ],
		values: setting_types.STRING,
		text: `Log all POP3 traffic input/output to this directory.`
	},

	pop3c_ssl: {
		default: 'no',
		tags: [ 'pop3c' ],
		values: setting_types.ENUM,
		values_enum: [ 'no', 'pop3s', 'starttls' ],
		text: `
Use TLS to connect to the remote POP3 server.

| Value | Description |
| ----- | ----------- |
| \`no\` | No TLS |
| \`pop3s\` | Explicitly connect to remote POP3 port using TLS |
| \`starttls\` | Use POP3 STARTTLS command to switch to TLS connection |`
	},

	pop3c_ssl_verify: {
		default: 'yes',
		tags: [ 'pop3c' ],
		seealso: [ 'pop3c_ssl' ],
		values: setting_types.BOOLEAN,
		text: `
Verify remote POP3 TLS certificate?

Verification may be disabled during testing, but should be enabled during
production use.

Only used if [[setting,pop3c_ssl]] is enabled.`
	},

	pop3c_user: {
		default: '%u',
		tags: [ 'pop3c' ],
		seealso: [ 'pop3c_master_user', 'pop3c_password' ],
		values: setting_types.STRING,
		text: `
The user identity to be used for performing authentication to the source
POP3 server.

[[variable,mail-user]] can be used.`
	},

	postmaster_address: {
		default: 'postmaster@%{if;%d;ne;;%d;%{hostname}}',
		tags: [ 'lda', 'lmtp' ],
		values: setting_types.STRING,
		text: `
The From address from which email rejection messages (bounces) are sent.

As used here, the variable \`%d\` expands to the domain of the local user.
Other [[variable,mail-user]] can be used as well.`
	},

	process_shutdown_filter: {
		values: setting_types.STRING,
		text: `
Filter to specify which events shutdown the process after finishing the
current connections. This is mainly intended to save memory by preventing
long-running imap processes that use a lot of memory (due to libc not freeing
all of it to the OS). The syntax of the filter is described in
[[link,event_filter_global]].

For example:

\`\`\`
process_shutdown_filter = "event=mail_user_session_finished AND rss > 10M"
\`\`\``
	},

	protocols: {
		default: 'imap pop3 lmtp',
		values: setting_types.BOOLLIST,
		text: `
The list of protocols to enable.

For example:

\`\`\`[dovecot.conf]
# Only IMAP protocol enabled:
protocols = imap

# Enable also LMTP protocol (on top of IMAP):
protocols {
  lmtp = yes
}

# Disable all protocols:
protocols =
\`\`\``
	},

	quota_full_tempfail: {
		default: 'no',
		seealso: [ '[[plugin,quota]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, return a temporary failure to the sending server if quota is
exceeded. This allows the message to potentially be delivered later if the
account moves under the quota limit at the time of redelivery.

If disabled, the message is bounced with a permanent error returned to the
sending server.`
	},

	rawlog_dir: {
		seealso: [ '[[link,rawlog]]' ],
		values: setting_types.STRING,
		text: `
Directory where to create \`*.in\` and \`*.out\` rawlog files, one per TCP
connection. The directory must already exist and be writable by the process.
No error is logged if the directory doesn't exist.

[[variable,mail-user]] can be used.

Example:

\`\`\`
protocol imap {
  rawlog_dir = /tmp/rawlog/%u
  # if you want to put files into user's homedir, use this, do not use ~
  #rawlog_dir = %h/rawlog
}
\`\`\``
	},

	recipient_delimiter: {
		default: '+',
		tags: [ 'sieve' ],
		values: setting_types.STRING,
		text: `The separator between the :user and :detail address parts.`
	},

	rejection_reason: {
		default: 'Your message to \<%t\> was automatically rejected:%n%r',
		tags: [ 'lda', 'lmtp' ],
		values: setting_types.STRING_NOVAR,
		text: `
A human-readable message for the recipients of bounce messages.

The following variables are allowed, including [[variable,global]]:

| Variable Name | Short Form | Description |
| ------------- | ---------- | ----------- |
| \`%{crlf}\` | \`%n\` | Newline (CRLF) |
| \`%{reason}\` | \`%r\` | Reason for rejection |
| \`%{subject}\` | \`%s\` | Original subject line |
| \`%{to}\` | \`%t\` | Recipient address |

The variable values are obtained from the mail being delivered or the
delivery protocol.`
	},

	rejection_subject: {
		default: 'Rejected: %s',
		seealso: [ 'rejection_reason' ],
		tags: [ 'lda', 'lmtp' ],
		values: setting_types.STRING_NOVAR,
		text: `
The Subject: header to use for bounce messages.

See [[setting,rejection_reason]] for the list of variables that can be used.`
	},

	sendmail_path: {
		default: '/usr/sbin/sendmail',
		values: setting_types.STRING,
		text: `
The binary to use for sending email.

Used only if [[setting,submission_host]] is not set.`
	},

	service: {
		tags: [ 'service' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'service_name' ],
		text: `
Creates a new service to the list of services. The filter name refers to the
[[setting,service_name]] setting.`
	},

	service_name: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		seealso: [ 'service' ],
		text: `
Name of the service. The [[setting,service]] filter name refers to this
setting.`
	},

	service_protocol: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		seealso: [ 'protocols' ],
		text: `
If non-empty, this service is enabled only when the protocol name is listed in
[[setting,protocols]] setting.`
	},

	service_type: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		seealso: [ 'service_process_limit' ],
		text: `
Type of this service:

| Value | Description |
| --- | --- |
| \`<empty>\` | The default. |
| \`login\` | Used by login services. The login processes have "all processes full" notification fd. It's used by the processes to figure out when no more client connections can be accepted because client and process limits have been reached. The login processes can then kill some of their oldest connections that haven't logged in yet. |
| \`worker\` | Used by various worker services. It's normal for worker processes to fill up to [[setting,service_process_limit]], and there shouldn't be a warning logged about it. |
| \`startup\` | Creates one process at startup. |
| \`log\`<br/>\`config\`<br/>\`anvil\` | Treated specially by these specific services. |`
	},

	service_executable: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		seealso: [ 'base_dir' ],
		text: `
The binary path to execute and its parameters. If the path doesn't begin with
\`/\`, it's relative to [[setting,base_dir]].`
	},

	service_user: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		seealso: [ 'default_login_user', 'default_internal_user' ],
		text: `
UNIX user (UID) which runs this process. [[setting,default_login_user]] should
be used for \`type=login\` processes and [[setting,default_internal_user]]
should be used for other processes that don't require root privileges.`
	},

	service_group: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		text: `
The primary UNIX group (GID) which runs this process.`
	},

	service_privileged_group: {
		tags: [ 'service' ],
		advanced: true,
		values: setting_types.STRING,
		seealso: [ 'mail_privileged_group' ],
		text: `
Secondary UNIX group - which is disabled by default - but can be enabled by the
process. [[setting,mail_privileged_group]] setting is a more user friendly way
to use this setting for mail processes.`
	},

	service_extra_groups: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		text: `
Secondary UNIX groups that this process belongs to.`
	},

	service_chroot: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		seealso: [ 'base_dir' ],
		text: `
The processes are chrooted to this directory at startup. Relative to
[[setting,base_dir]].`
	},

	service_drop_priv_before_exec: {
		tags: [ 'service' ],
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
Drop all privileges after forking, but before executing the binary. This is
mainly useful for dumping core files on non-Linux OSes, since the processes are
no longer in "setuid" mode. This setting can't be used with non-empty chroot.`
	},

	service_process_min_avail: {
		tags: [ 'service' ],
		values: setting_types.UINT,
		default: 0,
		seealso: [
		'service_client_limit',
		'service_restart_request_count',
		'service_process_min_avail',
		],
		text: `
Minimum number of processes that always should be available to accept more
client connections.

Note that if [[setting,service_client_limit,1]], this means there are always
that many processes that are not doing anything. When a new process launches,
one of the idling processes will accept the connection and a new idling process
is launched.

* For [[setting,service_restart_request_count,1]] processes this decreases the
  latency for handling new connections, because there's no need to wait for
  processes to fork. This is usually not necessary to to be set. Large
  [[setting,service_process_min_avail]] values might be useful in some special
  cases, like if there are a lot of POP3 users logging in exactly at the same
  time to check mails.
* For [[setting,service_restart_request_count]] to a value \`!=1\` and
  [[setting,service_client_limit]] to a value \`>1\` processes it could be set
  to the number of CPU cores on the system to balance the load among them. This
  is commonly used with \`*-login\` processes.
* For [[setting,service_restart_request_count]] with a value of \`!=1\` and
  [[setting,service_client_limit,1]] processes it is likely not useful to use
  this, because generally there are already some idling processes waiting to
  accept new connections. However, it's not harmful either, since
  [[setting,service_process_min_avail]] includes the existing idling processes
  when counting how many new idling processes are needed.`
	},

	service_process_limit: {
		tags: [ 'service' ],
		values: setting_types.UINT,
		default: 100,
		text: `
The maximum number of processes that may exist for this service.`
	},

	service_client_limit: {
		tags: [ 'service' ],
		values: setting_types.UINT,
		default: 1000,
		text: `
Maximum number of simultaneous client connections per process. Once this number
of connections is received, the next incoming connection will prompt Dovecot to
spawn another process.`
	},

	service_restart_request_count: {
		tags: [ 'service' ],
		values: setting_types.UINT,
		default: 'unlimited',
		text: `
Number of client connections to handle until the process kills itself. Use
\`unlimited\` to keep the process alive. \`1\` means only a single connection
is handled until the process is stopped - this is the most secure choice since
there's no way for one connection's state to leak to the next one. For better
performance this can be set higher, but ideally not \`unlimited\` since more
complex services can have small memory leaks and/or memory fragmentation and
the process should get restarted eventually. For example \`100\` or \`1000\`
can be good values.`
	},

	service_idle_kill_interval: {
		tags: [ 'service' ],
		changed: {
			settings_service_idle_kill_changed: `
This behavior was redesigned to work better in busy servers.`,
		},
		values: setting_types.TIME,
		default: '1 min',
		text: `
Time interval between killing extra idling processes. During the interval the
master process tracks the lowest number of idling processes for the service.
Afterwards it sends \`SIGINT\` notification to that many idling processes. If
the processes are still idling when receiving the signal, they shut down
themselves.

Using \`infinite\` disables the idle-killing.`
	},

	service_vsz_limit: {
		tags: [ 'service' ],
		values: setting_types.SIZE,
		default: '256 M',
		text: `
Limit the process's address space (both \`RLIMIT_DATA\` and \`RLIMIT_AS\` if
available). When the space is reached, some memory allocations may start
failing with "Out of memory", or the kernel may kill the process with signal 9.
This setting is mainly intended to prevent memory leaks from eating up all of
the memory, but there can be also legitimate reasons why the process reaches
this limit. For example a huge mailbox may not be accessed if this limit is too
low. Use \`unlimited\` to disable this entirely.`
	},

	shutdown_clients: {
		default: 'yes',
		values: setting_types.BOOLEAN,
		text: `
If enabled, all processes are killed when the master process is shutdown.

Otherwise, existing processes will continue to run. This may be useful to not
interrupt earlier sessions, but may not be desirable if restarting Dovecot
to apply a security update, for example.`
	},

	sql_driver: {
		values: setting_types.STRING,
		text: `
SQL driver to use for any SQL database accesses.`
	},

	ssl: {
		default: 'yes',
		seealso: [ '[[link,ssl_configuration]]' ],
		values: setting_types.ENUM,
		values_enum: [ 'yes', 'no', 'required' ],
		text: `
The level of SSL support. This setting affects both the implicit SSL ports
and the STARTTLS commands.

Options:

\`no\`
:   SSL/TLS is completely disabled.

\`yes\`
:   SSL/TLS is enabled, but not necessarily required for clients.

\`required\`
:   SSL/TLS is required for all imap, pop3, managesieve and
    submission protocol client connections. This differs from
    [[setting,auth_allow_cleartext]] in that even non-cleartext
    authentication mechanisms aren't allowed without SSL/TLS.

This setting affects the \`secured\` state of connections. See
[[link,secured_connections]].`
	},

	ssl_alt_cert_file: {
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.FILE,
		text: `
Alternative SSL certificate that will be used if the algorithm differs from
the primary certificate.

This is useful when migrating to e.g. an ECDSA certificate.

Example:

\`\`\`[dovecot.conf]
ssl_alt_cert_file = /path/to/alternative/cert.pem
\`\`\``
	},

	ssl_alt_key_file: {
		seealso: [ 'ssl', 'ssl_alt_cert_file', '[[link,ssl_configuration]]' ],
		values: setting_types.FILE,
		text: `
Private key for [[setting,ssl_alt_cert_file]].

Example:

\`\`\`[dovecot.conf]
ssl_alt_key_file = /path/to/alternative/key.pem
ssl_alt_cert_file = /path/to/alternative/cert.pem
\`\`\``
	},

	ssl_ca_file: {
		seealso: [
			'ssl',
			'ssl_client_require_valid_cert',
			'ssl_request_client_cert',
		],
		values: setting_types.FILE,
		text: `
List of SSL CA certificates that are used to validate whether SSL
certificates presented by incoming imap/pop3/etc. client connections are
valid.

Example:

\`\`\`[dovecot.conf]
ssl_ca_file = /etc/dovecot/ca.crt
ssl_request_client_cert = yes
auth_ssl_require_client_cert = yes
\`\`\``
	},

	ssl_cert_file: {
		default: '</etc/ssl/certs/dovecot.pem',
		seealso: [ 'ssl', 'ssl_key_file', '[[link,ssl_configuration]]' ],
		values: setting_types.FILE,
		text: `
Path to the PEM-encoded X.509 SSL/TLS certificate presented for incoming
imap/pop3/etc. client connections.

The [[setting,ssl_key_file]] is also needed for the private certificate.

Example:

\`\`\`[dovecot.conf]
ssl_cert_file = /etc/ssl/private/dovecot.crt
ssl_key_file = /etc/ssl/private/dovecot.key
\`\`\``
	},

	ssl_cert_username_field: {
		default: 'commonName',
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
Field name in the SSL client certificate that is used for
[[setting,auth_ssl_username_from_cert]].

The most common choices are \`commonName\` and \`x500UniqueIdentifier\`.

Note: [[setting,auth_ssl_username_from_cert]] MUST be enabled.`
	},

	ssl_cipher_list: {
		default: 'ALL:!kRSA:!SRP:!kDHd:!DSS:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK:!RC4:!ADH:!LOW@STRENGTH',
		seealso: [ 'ssl', 'ssl_cipher_suites', 'ssl_min_protocol', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
The list of SSL ciphers to use for TLSv1.2 and below connections, in order
of preference. Use [[setting,ssl_cipher_suites]] for TLSv1.3 connections.

You do not need to edit this setting in order to disable specific SSL
protocols; that is best done with [[setting,ssl_min_protocol]] instead.

This setting is used for both incoming and outgoing SSL connections.`
	},

	ssl_cipher_suites: {
		default: '<OpenSSL version specific>',
		seealso: [ 'ssl', 'ssl_cipher_list', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
The list of SSL cipher suites to use for TLSv1.3 connections, in order of
preference. Use [[setting,ssl_cipher_list]] for TLSv1.2 and below connections.

This setting is used for both incoming and outgoing SSL connections.

See: https://wiki.openssl.org/index.php/TLS1.3#Ciphersuites`
	},

	ssl_client_ca_dir: {
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
The directory where trusted SSL CA certificates can be found. For example
\`/etc/ssl/certs\`. These certificates are used only for outgoing SSL
connections (e.g. with the imapc driver).

For extra security you might want to point to a directory containing
certificates only for the CAs that are actually needed for the server
operation instead of all the root CAs.`
	},

	ssl_client_ca_file: {
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.FILE,
		text: `
File containing the trusted SSL CA certificates. For example
\`/etc/ssl/certs/ca-bundle.crt\`.

These certificates are used only for outgoing SSL connections (e.g. with
the [[link,imapc]] driver).

Note that this setting isn't recommended to be used with large CA bundles,
because all the certificates are read into memory. This leads to excessive
memory usage, because it gets multiplied by the number of imap processes.
It's better to either use [[setting,ssl_client_ca_dir]] setting or
use a CA bundle that only contains the CAs that are actually necessary for
the server operation.`
	},

	ssl_client_cert_file: {
		seealso: [
			'ssl',
			'ssl_client_key_file',
			'[[link,ssl_configuration]]',
		],
		values: setting_types.FILE,
		text: `
Public SSL certificate used for outgoing SSL connections. This is generally
needed only when the server authenticates the client using the certificate.

[[setting,ssl_client_key_file]] is also needed for the private certificate.

Example:

\`\`\`[dovecot.conf]
ssl_client_cert_file = /etc/dovecot/dovecot-client.crt
ssl_client_key_file = /etc/dovecot/dovecot-client.key
\`\`\``
	},

	ssl_client_key_file: {
		seealso: [
			'ssl',
			'ssl_client_cert_file',
			'[[link,ssl_configuration]]',
		],
		values: setting_types.FILE,
		text: `
Private key for [[setting,ssl_client_cert_file]]. If it is password protected,
set the password with [[setting,ssl_client_key_password]].

Example:

\`\`\`[dovecot.conf]
ssl_client_cert_file = /etc/dovecot/dovecot-client.crt
ssl_client_key_file = /etc/dovecot/dovecot-client.key
\`\`\``
	},

	ssl_client_key_password: {
		values: setting_types.STRING,
		seealso: [ 'ssl', 'ssl_client_key_file', '[[link,ssl_configuration]]' ],
		text: `
Password for the [[setting,ssl_client_key_file]].`
	},

	ssl_crypto_device: {
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
Available Values: <Obtain by running \`openssl engine\` command>

Which SSL crypto device to use.`
	},

	ssl_curve_list: {
		default: '<defaults from the SSL library>',
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
Colon separated list of elliptic curves to use, in order of preference.
An empty value uses the defaults from the SSL library.

This setting is used for both incoming and outgoing SSL connections.

Example:

\`\`\`
ssl_curve_list = P-521:P-384:P-256
\`\`\``
	},

	ssl_dh_file: {
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.FILE,
		text: `
Path to the Diffie-Hellman parameters file. This setting isn't needed if using
only ECDSA certificates.

You can generate a new parameters file by, for example, running
\`openssl dhparam -out dh.pem 4096\` on a machine with sufficient entropy
(this may take some time).

Example:

\`\`\`[dovecot.conf]
ssl_dh_file = /path/to/dh.pem
\`\`\``
	},

	ssl_client_require_valid_cert: {
		default: 'yes',
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.BOOLEAN,
		text: `
Require a valid certificate when connecting to external SSL services?`
	},

	ssl_key_file: {
		seealso: [
			'ssl',
			'ssl_cert_file',
			'ssl_key_password',
			'[[link,ssl_configuration]]',
		],
		values: setting_types.FILE,
		text: `
Path to the PEM-encoded X.509 SSL/TLS private key for
[[setting,ssl_cert_file]].

Example:

\`\`\`[dovecot.conf]
ssl_cert_file = /etc/ssl/private/dovecot.crt
ssl_key_file = /etc/ssl/private/dovecot.key
\`\`\``
	},

	ssl_key_password: {
		seealso: [ 'ssl', 'ssl_key_file', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
The password to use if [[setting,ssl_key_file]] is password-protected.

Since this file is often world-readable, you may wish to specify the path
to a file containing the password, rather than the password itself, by
using the format \`ssl_key_password = <path\` here. The path should
be to a root-owned file with mode 0600.

Alternatively, you can supply the password via the -p parameter at startup.`
	},

	ssl_min_protocol: {
		default: 'TLSv1.2',
		seealso: [ 'ssl', 'ssl_cipher_list', '[[link,ssl_configuration]]' ],
		values: setting_types.STRING,
		text: `
The minimum SSL protocol version Dovecot accepts.

This setting is used for both incoming and outgoing SSL connections.

Supported values are:

\`ANY\`
:   ::: warning
    This value is meant for tests only. It should not be used in any
    deployment of any value/relevance.

\`TLSv1\`
:   Support TLSv1+. (TLSv1 deprecated: [[rfc,8996]])

\`TLSv1.1\`
:   Support TLSv1.1+. (TLSv1.1 deprecated: [[rfc,8996]])

\`TLSv1.2\`
:   Support TLSv1.2+.

\`TLSv1.3\`
:   Support TLSv1.3+.

\`LATEST\`
:   Support only the latest version available.`
	},

	ssl_options: {
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.ENUM,
		values_enum: [ 'compression', 'no_ticket' ],
		text: `
Additional options for SSL.

This setting is used for both incoming and outgoing SSL connections.

Currently supported options are:

\`compression\`
:   Enable compression.

\`no_ticket\`
:   Disable SSL session tickets.`
	},

	ssl_prefer_server_ciphers: {
		default: 'no',
		seealso: [ 'ssl', '[[link,ssl_configuration]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, give preference to the server's cipher list over a client's
list. This setting is used only for server connections.`
	},

	ssl_require_crl: {
		default: 'yes',
		seealso: [ 'ssl', 'ssl_ca_file', '[[link,ssl_configuration]]' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, the CRL check must succeed for presented SSL client
certificate and any intermediate certificates. The CRL list is generally
appended to the [[setting,ssl_ca_file]] file.

This setting is used only for server connections.`
	},

	ssl_request_client_cert: {
		changed: {
			settings_ssl_request_client_cert_changed: `
Renamed from \`ssl_verify_client_cert\` setting.`
		},
		default: 'no',
		seealso: [
			'ssl',
			'auth_ssl_require_client_cert',
			'[[link,ssl_configuration]]',
		],
		values: setting_types.BOOLEAN,
		text: `
If enabled, the imap/pop3/etc. client is requested to send an SSL certificate.

Note: This setting doesn't yet require the certificate to be valid or
to even exist. See [[setting,auth_ssl_require_client_cert]].`
	},

	state_dir: {
		default: '/var/lib/dovecot',
		values: setting_types.STRING,
		advanced: true,
		text: `
The compile-time directory PKG_STATEDIR (typically /var/lib/dovecot)
is hard-coded as the location of state files. The PKG_STATEDIR value
is taken as the default state_dir setting but can be overridden - for
instance, if you wish to use the same binaries for a system daemon and
a user daemon.

The settings [[setting,state_dir,/home/foo/dovecot/state]] and
[[setting,base_dir,/home/foo/dovecot/run]] give an example of usage.`
	},

	stats_server: {
		values: setting_types.NAMED_FILTER,
		text: `
Filter for stats server specific settings.`
	},

	stats_writer_socket_path: {
		default: 'stats-writer',
		values: setting_types.STRING,
		text: `The path to the stats-writer socket.`
	},

	submission_add_received_header: {
		default: 'yes',
		tags: [ 'submission' ],
		added: {
			settings_submission_add_received_header_added: false
		},
		values: setting_types.BOOLEAN,
		text: `
Controls if "Received:" header should be added to mails by the submission
backend.`
	},

	submission_client_workarounds: {
		tags: [ 'submission' ],
		values: setting_types.BOOLLIST,
		text: `
Configures the list of active workarounds for Submission client bugs.

Supported workaround identifiers are:

\`implicit-auth-external\`
:   Implicitly login using the EXTERNAL SASL mechanism upon the first MAIL
    command, provided that the client provides a valid TLS client
    certificate. This is helpful for clients that omit explicit SASL
    authentication when configured for authentication using a TLS certificate
    (Thunderbird for example).

\`mailbox-for-path\`
:   Allow using bare Mailbox syntax (i.e., without \<...\>) instead of full
    path syntax.

\`whitespace-before-path\`
:   Allow one or more spaces or tabs between 'MAIL FROM:' and path and
    between 'RCPT TO:' and path.`
	},

	submission_host: {
		tags: [ 'submission' ],
		values: setting_types.URL,
		text: `
Use this SMTP submission host to send messages.

Overrides [[setting,sendmail_path]] value, if set.`
	},

	submission_logout_format: {
		default: 'in=%i out=%o',
		tags: [ 'submission' ],
		values: setting_types.STRING_NOVAR,
		text: `
The SMTP Submission logout format string.

Variables supported, including [[variable,mail-user]]:

| Variable Name | Short Form | Description |
| ------------- | ---------- | ----------- |
| \`%{input}\` | \`%i\` | Bytes read from client |
| \`%{output}\` | \`%o\` | Bytes sent to client |
| \`%{command_count}\` | | Number of commands received from client |
| \`%{reply_count}\` | | Number of replies sent to client |
| \`%{transaction_id}\` | | ID of the current transaction, if any |`
	},

	submission_max_mail_size: {
		default: '40M',
		tags: [ 'submission' ],
		values: setting_types.SIZE,
		text: `
The maximum message size accepted for relay.

This value is announced in the SMTP SIZE capability.

If empty, this value is either determined from the relay server or left
unlimited if no limit is known; the relay MTA will reply with error if some
unknown limit exists there, which will be passed back to the client.`
	},

	submission_max_recipients: {
		default: 0,
		tags: [ 'submission' ],
		values: setting_types.UINT,
		text: `
Maximum number of recipients accepted per connection.

\`0\` means unlimited.`
	},

	submission_relay_command_timeout: {
		default: '5mins',
		tags: [ 'submission_relay' ],
		values: setting_types.TIME_MSECS,
		text: `
Timeout for SMTP commands issued to the submission service's relay server.

The timeout is reset every time more data is being sent or received.`
	},

	submission_relay_connect_timeout: {
		default: '30secs',
		tags: [ 'submission_relay' ],
		values: setting_types.TIME_MSECS,
		text: `
Timeout for connecting to and logging into the submission service's relay
server.`
	},

	submission_relay_host: {
		tags: [ 'submission_relay' ],
		values: setting_types.STRING,
		text: `
Host of the relay server (REQUIRED to provide the submission service).`
	},

	submission_relay_master_user: {
		tags: [ 'submission_relay' ],
		values: setting_types.STRING,
		text: `
Master user name for authentication to the relay MTA if authentication is
required.`
	},

	submission_relay_max_idle_time: {
		default: '29mins',
		tags: [ 'submission_relay' ],
		values: setting_types.TIME,
		text: `Submission relay max idle time for connection to relay MTA.`
	},

	submission_relay_password: {
		tags: [ 'submission_relay' ],
		values: setting_types.STRING,
		text: `
Password for authentication to the relay MTA if authentication is required.`
	},

	submission_relay_port: {
		default: 25,
		tags: [ 'submission_relay' ],
		values: setting_types.IN_PORT,
		text: `
Port for the submission relay server.`
	},

	submission_relay_rawlog_dir: {
		tags: [ 'submission_relay' ],
		seealso: [ '[[link,rawlog]]' ],
		values: setting_types.STRING,
		text: `
Write protocol logs for relay connection to this directory for debugging.

[[variable,mail-user]] can be used.`
	},

	submission_relay_ssl: {
		default: 'no',
		tags: [ 'submission_relay' ],
		values: setting_types.ENUM,
		values_enum: [ 'no', 'smtps', 'starttls' ],
		text: `
If enabled, SSL/TLS is used for the connection to the relay server.

Available values:

\`no\`
:   No SSL connection is used.

\`smtps\`
:   An SMTPS connection (immediate SSL) is used.

\`starttls\`
:   The STARTTLS command is used to establish the TLS layer.`
	},

	submission_relay_ssl_verify: {
		default: 'yes',
		tags: [ 'submission_relay' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, TLS certificate of the relay server must be verified.`
	},

	submission_relay_trusted: {
		default: 'no',
		tags: [ 'submission_relay' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, the relay server is trusted.

Determines whether we try to send (Postfix-specific) XCLIENT data to the
relay server (only if enabled).`
	},

	submission_relay_user: {
		tags: [ 'submission_relay' ],
		values: setting_types.STRING,
		text: `
User name for authentication to the relay MTA if authentication is required.`
	},

	submission_ssl: {
		default: 'no',
		seealso: [ 'submission_host' ],
		values: setting_types.BOOLEAN,
		text: `
If enabled, use SSL/TLS to connect to [[setting,submission_host]].`
	},

	submission_timeout: {
		default: '30secs',
		seealso: [ 'submission_host' ],
		values: setting_types.TIME,
		text: `Timeout for submitting outgoing messages.`
	},

	syslog_facility: {
		default: 'mail',
		values: setting_types.STRING,
		text: `The syslog facility used if you're logging to syslog.`
	},

	unix_listener: {
		tags: [ 'service' ],
		values: setting_types.NAMED_LIST_FILTER,
		seealso: [ 'service', 'unix_listener_path' ],
		text: `
Creates a new UNIX listener for a [[setting,service]]. The filter name refers
to the [[setting,unix_listener_path]] setting.`
	},

	unix_listener_path: {
		tags: [ 'service' ],
		values: setting_types.STRING_NOVAR,
		seealso: [ 'base_dir', 'unix_listener' ],
		text: `
Path to the UNIX socket file, relative to [[setting,base_dir]] setting. The
[[setting,unix_listener]] filter name refers to this setting.`
	},

	unix_listener_type: {
		tags: [ 'service' ],
		added: {
			settings_unix_listener_type_added: false,
		},
		values: setting_types.STRING,
		text: `
Listener type. This string value has service-specific meaning and is used to
distinguish different listener types that one service may employ.`
	},

	unix_listener_mode: {
		tags: [ 'service' ],
		values: setting_types.OCTAL_UINT,
		default: '0600',
		text: `
Mode of the file. Note that \`0600\` is an octal value, while \`600\` is a
different decimal value. Setting mode to \`0\` disables the listener.`
	},

	unix_listener_user: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		text: `
Owner of the listener file. Empty (default) means UID 0 (root).`
	},

	unix_listener_group: {
		tags: [ 'service' ],
		values: setting_types.STRING,
		text: `
Group of the listener file. Empty (default) means GID 0 (root/wheel).`
	},

	userdb: {
		tags: [ 'userdb' ],
		values: setting_types.NAMED_LIST_FILTER,
		dependencies: [ 'userdb_driver' ],
		seealso: [ '[[link,userdb]]', 'userdb_name', 'userdb_driver' ],
		text: `
Creates a new [[link,userdb]]. The filter name refers to the
[[setting,userdb_name]] setting.`
	},

	userdb_name: {
		tags: [ 'userdb' ],
		values: setting_types.STRING,
		seealso: [ 'userdb', 'userdb_driver' ],
		text: `
Name of the userdb. The [[setting,userdb]] filter name refers to this setting.
If the [[setting,userdb_driver]] setting is empty, the \`userdb_name\` is used
as the driver. This allows doing e.g.:

\`\`\`[dovecot.conf]
userdb passwd-file {
  passwd_file_path = /etc/dovecot/passwd
\`\`\``
	},

	userdb_driver: {
		tags: [ 'userdb' ],
		values: setting_types.STRING,
		seealso: [ 'userdb_name', '[[link,userdb]]' ],
		text: `
The driver used for this user database. If empty, defaults to
[[setting,userdb_name]]. See [[link,userdb]] for the list of available
drivers.`
	},

	userdb_args: {
		tags: [ 'userdb' ],
		values: setting_types.STRING,
		text: `
Arguments for the userdb driver. The format of this value depends on the userdb driver. Each one uses different args.`
	},

	userdb_fields: {
		tags: [ 'userdb' ],
		values: setting_types.STRLIST,
		seealso: [ '[[link,userdb_extra_fields]]' ],
		text: `
Userdb fields (and [[link,userdb_extra_fields]]). The values can contain
[[link,settings_variables,%variables]]. All \`%variables\` used here reflect
the state **after** the current userdb lookup, and can refer to fields returned
by previous userdb lookups. Depending on the userdb driver, it can also refer
to variable fields returned by it (e.g. \`%{ldap:fieldName}\`).

::: info
The LDAP driver provides additional specific variables,
see [[link,auth_ldap]] for more details.
:::

For example:

\`\`\`[dovecot.conf]
userdb ldap {
  fields {
    user = %{ldap:userId}
    home = /home/%{ldap:mailboxPath}
    uid = vmail
    gid = vmail
  }
}
\`\`\``
	},

	userdb_fields_import_all: {
		tags: [ 'userdb' ],
		values: setting_types.BOOLEAN,
		default: {
			value: 'yes',
			text: `For \`userdb ldap\` the default is \`no\`.`
		},
		seealso: [ 'userdb_fields' ],
		text: `
If yes, import all fields returned by the userdb lookup. If no, require
[[setting,userdb_fields]] to explicitly add wanted fields.`
	},

	userdb_skip: {
		tags: [ 'userdb' ],
		values: setting_types.ENUM,
		values_enum: [ 'never', 'found', 'notfound' ],
		default: 'never',
		text: `
Configures when userdbs should be skipped:

| Value | Description |
| --- | --- |
| \`never\` | Never skip over this userdb. |
| \`found\` | Skip if an earlier userdbs already found the user. |
| \`notfound\` | Skip if previous userdbs haven't yet found the user. |`
	},

	userdb_static_allow_all_users: {
		added: {
			settings_userdb_static_allow_all_users_added: false,
		},
		tags: [ 'userdb' ],
		values: setting_types.BOOLEAN,
		default: 'no',
		text: `
Skip user existence verification via passdb lookup.`
	},

	userdb_use_worker: {
		tags: [ 'userdb' ],
		values: setting_types.BOOLEAN,
		default: {
			value: 'no',
			text: 'specific [[link,userdb]] have different defaults',
		},
		text: `
If \`yes\`, run the userdb lookup in auth-worker process instead of the main
auth process.`
	},

	userdb_result_success: {
		tags: [ 'userdb' ],
		values: setting_types.ENUM,
		values_enum: [
			'return-ok',
			'return',
			'return-fail',
			'continue',
			'continue-ok',
			'continue-fail',
		],
		default: 'return-ok',
		seealso: [ '[[link,userdb_result_values]]' ],
		text: `
What to do if the user was successfully found from the userdb. Possible values
and their meaning are described fully at [[link,userdb_result_values]].`
	},

	userdb_result_failure: {
		tags: [ 'userdb' ],
		values: setting_types.ENUM,
		values_enum: [
			'return-ok',
			'return',
			'return-fail',
			'continue',
			'continue-ok',
			'continue-fail',
		],
		default: 'continue',
		seealso: [ '[[link,userdb_result_values]]' ],
		text: `
What to do if the user was not found from the userdb. Possible values and their
meaning are described fully at [[link,userdb_result_values]].`
	},

	userdb_result_internalfail: {
		tags: [ 'userdb' ],
		values: setting_types.ENUM,
		values_enum: [
			'return-ok',
			'return',
			'return-fail',
			'continue',
			'continue-ok',
			'continue-fail',
		],
		default: 'continue',
		seealso: [ '[[link,userdb_result_values]]' ],
		text: `
What to do after the userdb failed due to an internal error.
Possible values and their meaning are described fully at
[[link,userdb_result_values]]. If any of the userdbs had an internal failure
and the final userdb also returns \`continue\` the authentication will fail
with \`internal error\`.`
	},

	userdb_sql_query: {
		tags: [ 'userdb' ],
		values: setting_types.STRING,
		text: `
SQL query to lookup the userdb fields.`
	},

	userdb_sql_iterate_query: {
		tags: [ 'userdb' ],
		values: setting_types.STRING,
		text: `
SQL query to list all available usernames.`
	},

	valid_chroot_dirs: {
		values: setting_types.BOOLLIST,
		text: `
List of directories under which chrooting is allowed for mail processes.

Addresses the risk of root exploits enabled by incorrect use of chrooting.

Interpretation is recursive, so including \`/var/mail\` allows chrooting
to subdirectories such as \`/var/mail/foo/bar\`.`
	},

	verbose_proctitle: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
If enabled, the \`ps\` command shows more verbose process details,
including the username and IP address of the connected client.

This aids in seeing who is actually using the server, as well as helps
debugging in case there are any problems. See [[link,process_titles]].`
	},

	verbose_ssl: {
		removed: {
			settings_verbose_ssl_removed: false,
		},
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
If enabled, protocol-level SSL errors are logged. Same as
[[setting,log_debug,category=ssl]].`
	},

	version_ignore: {
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
If enabled, ignore version mismatches between different Dovecot versions.`
	},

	ldap_auth_dn: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
Specify the Distinguished Name (the username used to login to the LDAP server).

Leave it commented out to bind anonymously (useful with [[setting,passdb_ldap_bind,yes]]).

Example: \`ldap_auth_dn = uid=dov-read,dc=example,dc=com,dc=.\``
	},

	ldap_auth_dn_password: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
Password for LDAP server. Used if [[setting,ldap_auth_dn]] is specified.`
	},

	ldap_auth_sasl_authz_id: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
SASL authorization ID, ie. the [[setting,ldap_auth_dn_password]] is for this "master user", but the
[[setting,ldap_auth_dn]] is still the logged in user. Normally you want to keep this empty.`
	},

	ldap_auth_sasl_mechanisms: {
		tags: [ 'ldap' ],
		values: setting_types.BOOLLIST,
		text: `
List of SASL mechanism names to use.`
	},

	ldap_auth_sasl_realm: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
SASL realm to use.`
	},

	ldap_base: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
LDAP base.

[[variable]] can be used.

Example: \`ldap_base = dc=mail, dc=example, dc=org\``
	},

	ldap_connection_group: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
Only databases with the same connection group share the ldap connections.
By default all the databases have the same \`""\`(empty string) default connection group,
and as such share the connections.`
	},

	ldap_debug_level: {
		tags: [ 'ldap' ],
		default: '0',
		values: setting_types.UINT,
		text: `
LDAP library debug level as specified by \`LDAP_DEBUG_*\` in \`ldap_log.h\`.

Value \`-1\` means everything.

You may need to recompile OpenLDAP with debugging enabled to get enough output.`
	},

	ldap_deref: {
		tags: [ 'ldap' ],
		default: 'never',
		values: setting_types.ENUM,
		values_enum: [ 'never', 'searching', 'finding', 'always' ],
		text: `
Specify dereference which is set as an LDAP option.`
	},

	ldap_filter: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
::: info
	LDAP Authentication Only
:::

Filter for password and user lookups (passdb/userdb lookup).

Variables that can be used (see [[variable]] for full list).

Example:

\`\`\`
ldap_filter = (&(objectClass=posixAccount)(uid=%u))
\`\`\``
	},

	ldap_iterate_fields: {
		tags: [ 'ldap' ],
		values: setting_types.STRLIST,
		text: `
::: info
	LDAP Authentication Only
:::

Attributes to get a list of all users. Currently only the attribute
\`user\` is supported.

Example:
\`\`\`
	iterate_attrs {
		user = %{ldap:mailRoutingAddress}
	}
\`\`\``
	},

	ldap_iterate_filter: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
::: info
	LDAP Authentication Only
:::

Filter to get a list of all users.

Example: \`ldap_iterate_filter = (objectClass=smiMessageRecipient)\``
	},

	ldap_scope: {
		tags: [ 'ldap' ],
		default: 'subtree',
		values: setting_types.ENUM,
		values_enum: [ 'base', 'onelevel', 'subtree' ],
		text: `
This specifies the search scope.`
	},


	ldap_starttls: {
		tags: [ 'ldap' ],
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
Set to \`yes\` to use TLS to connect to the LDAP server.`
	},

	ldap_uris: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
LDAP URIs to use.

Configure this setting to specify what LDAP
server(s) to connect to.

The URIs are in syntax \`protocol://host:port\`.

Example: \`ldap_uris = ldaps://secure.domain.org\``
	},

	ldap_version: {
		tags: [ 'ldap' ],
		default: '3',
		values: setting_types.UINT,
		text: `
LDAP protocol version to use. Likely \`2\` or \`3\`.`
	},

	passdb_ldap_bind: {
		tags: [ 'ldap' ],
		default: 'no',
		values: setting_types.BOOLEAN,
		text: `
::: info
	LDAP Authentication Only
:::

Set \`yes\` to use authentication binding for verifying password's validity.

This works by logging into LDAP server using the username and password given by client.

The [[setting,ldap_filter]] is used to find the DN for the user.
Note that the [[setting,passdb_fields]] are still used, only the password field
is ignored in it.

Before doing any search, the binding is switched back to the default DN.

If you use this setting, it's a good idea to use a different
[[setting,ldap_connection_group]] for userdb. That way one connection is used
only for LDAP binds and another connection is used for user lookups.
Otherwise the binding is changed to the default DN before each user lookup.`
	},

	passdb_ldap_bind_userdn: {
		tags: [ 'ldap' ],
		values: setting_types.STRING,
		text: `
::: info
	LDAP Authentication Only
:::

If authentication binding is used, you can save one LDAP request per login
if users' DN can be specified with a common template. The template can use
the standard [[variable]].

Note that you can't use any [[setting,passdb_fields]] declaration if you use this setting.

Example: \`passdb_ldap_bind_userdn = cn=%u,ou=people,o=org\``
	}

}
