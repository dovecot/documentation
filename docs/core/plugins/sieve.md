---
layout: doc
title: sieve
dovecotlinks:
  sieve_configuration:
    hash: configuration
    text: Sieve configuration
  sieve_file:
    hash: file
    text: Sieve file storage location
  sieve_location:
    hash: script-locations
    text: Sieve script locations
  sieve_multiscript:
    hash: executing-multiple-scripts-sequentially
    text: executing multiple Sieve scripts sequentially
  sieve_trace_debugging:
    hash: trace-debugging
    text: Sieve trace debugging
  sieve_visible_default_script:
    hash: visible-default-script
    text: Sieve visible default script
---

# Sieve Plugin (`sieve`)

## Configuration

To use Sieve, you will first need to make sure you are using Dovecot
[[link,lda]] or [[link,lmtp]] for delivering incoming mail to users'
mailboxes.

Then, you need to enable the Sieve plugin in your configuration:

```[dovecot.conf]
protocol lda {
  mail_plugins = $mail_plugins sieve
}

protocol lmtp {
  mail_plugins = $mail_plugins sieve
}
```

## Script Locations

The Sieve interpreter can retrieve Sieve scripts from several types of
locations.

The default [file](#file) location type is a directory containing
one or more Sieve script files with a symlink pointing to the active
one.

More complex setups can use other location types such as [LDAP](#ldap) or
[dict](#dict) to fetch Sieve scripts from remote databases.

All settings that specify the location of one or more Sieve scripts
accept the following syntax:

```
<setting> = [<type>:]path[;<option>[=<value>][;...]]
```

If `<type>` is omitted, the script location type is `file` and the location
is interpreted as a local filesystem path pointing to a Sieve script file
or directory.

### Common Settings

All location types support the following settings:

#### `name=<script-name>`

Set the name of the Sieve script that this location points to. If the
name of the Sieve script is not contained in the location path and
the location of a single script is specified, this option is required
(e.g. for dict locations that must point to a particular script).

If the name of the script is contained in the location path, the
value of the name option overrides the name retrieved from the
location. If the Sieve interpreter explicitly queries for a specific
name (e.g. to let the Sieve [[link,sieve_include]] retrieve a script from
the [[setting,sieve_global]]), this option has no effect.

#### `bindir=<dirpath>`

Points to the directory where the compiled binaries for this script
location are stored. This directory is created automatically if
possible.

If this option is omitted, the behavior depends on the location type.

Don't specify the same directory for different script locations, as this
will result in undefined behavior. Multiple mail users can share a single
script directory if the script location is the same and all users share
the same system credentials (uid, gid).

### File

The `file` location is used to retrieve Sieve scripts from the file system.
This is the default type if the type specifier is omitted from the location
specification.

The location can either point to a directory or to a regular file. If the
location points to a directory, a script called `name` is retrieved by
reading a file from that directory with the file name `name.sieve`.

When this location type is involved in a [[setting,sieve_before]] or
[[setting,sieve_after]] script sequence, and the location points to a
directory, all files in that directory with a `.sieve` extension are part of
the sequence. The sequence order of the scripts in that directory is
determined by the file names, using a normal 8bit per-character
comparison.

Unless overridden using the `;bindir=<path>` location option, compiled
binaries for scripts retrieved from the `file` location type are by
default stored in the same directory as where the script file was found
if possible.

#### Configuration

The script location syntax is specified as follows:

```
location = file:<path>[;<option>[=<value>][;...]]
```

The location `<path>` is a file system path pointing to a directory
containing one or more script files with names structured as
`<script-name>.sieve` with the active option (default `~/.dovecot.sieve`)
specifying a symlink to the one that will be used, or without the active
option specified, it may be a script file instead of a directory.

##### Settings

This location supports all settings described in
[Common Settings](#common-settings).

##### `bindir`

If the `bindir` setting is omitted, the binary is stored in the same
directory as where the script file was found, if possible

###### `active=<path>`

When [[link,managesieve_server]] is used, one script in the storage can
be active; i.e., evaluated at delivery.

For the `file` location type, the active script in the storage directory
is pointed to by a symbolic link.

This option configures where this symbolic link is located. If the `file`
location path points to a regular file, this setting has no effect
(and ManageSieve cannot be used).

##### Example

```
plugin {
   ...
   sieve = file:~/sieve;active=~/.dovecot.sieve
   sieve_default = file:/var/lib/dovecot/;name=default
}
```

### Dict

To retrieve a Sieve script from a [[link,dict]] database, two lookups are
performed.

First, the name of the Sieve script is queried from the dict
path `/priv/sieve/name/<name>`. If the Sieve script exists, this
yields a data ID which in turn points to the actual script text. The
script text is subsequently queried from the dict path
`/priv/sieve/data/<dict-id>`.

The second query is only necessary when no compiled binary is available
or when the script has changed and needs to be recompiled. The data ID
is used to detect changes in the dict's underlying database. Changing a
Sieve script in the database must be done by first making a new script
data item with a new data ID. Then, the mapping from name to data ID
must be changed to point to the new script text, thereby changing the
data ID returned from the name lookup, i.e. the first query mentioned
above. Script binaries compiled from Sieve scripts contained in a dict
database record the data ID. While the data ID contained in the binary
is identical to the one returned from the dict lookup, the binary is
assumed up-to-date. When the returned data ID is different, the new
script text is retrieved using the second query and compiled into a new
binary containing the updated data ID.

#### Configuration

The script location syntax is specified as follows:

```
sieve = dict:<dict-uri>[;<option>[=<value>][;...]]
```
The `<dict-uri>` path is a Dovecot dict uri.

If the name of the Script is left unspecified and is not otherwise
provided by the Sieve interpreter, the name defaults to `default`.

##### Settings

This location supports all settings described in
[Common Settings](#common-settings).

##### `bindir`

By default, compiled binaries are not stored at all for Sieve
scripts retrieved from a dict database. Thus, the Sieve binaries will be
compiled each time they are called.

To improve performance, this setting should be specified to cache the
compiled binaries on the local filesystem. For Example:

```[dovecot.conf]
sieve = dict:file:/etc/dovecot/sieve.dict;name=keep;bindir=~/.sieve-bin
# or
#sieve = dict:file:/etc/dovecot/sieve.dict;name=keep;bindir=/var/sieve-scripts/%u
```

::: tip
Sieve uses the ID number as its cache index and to detect the
need to compile. Therefore, if a script is changed, then its ID must
also be changed for it to be reloaded.
:::

##### `user=<username>`

Overrides the user name used for the dict lookup. Normally, the name
of the user running the Sieve interpreter is used.

##### Examples

###### Flat File Backend

To retrieve the Sieve script named "keep" from the dict file
/etc/dovecot/sieve.dict:

::: code-group
```[dovecot.conf]
# Only the "keep" script will be used.
sieve = dict:file:/etc/dovecot/sieve.dict;name=keep
```

```[/etc/dovecot/sieve.dict]
priv/sieve/name/keep
1
priv/sieve/name/discard
2
priv/sieve/data/1
keep;
priv/sieve/data/2
discard;
```
:::

A more advanced example using the same config as above: notify an external
email address when new mail has arrived.

Note that the script all needs to be on one line.

::: code-group
```[/etc/dovecot/sieve.dict]
priv/sieve/name/notify
5
priv/sieve/data/5
require ["enotify", "variables"]; if header :matches "From" "*" { set "from" "${1}";} notify :importance "3" :message "New email from ${from}" "mailto:other@domain.com?body=New%20email%20has%20arrived.";
```
:::

###### Using a SQL backend

For greater flexibility, it's possible to use a SQL backend for your
dict scripts.

First, set up a configuration file (such as
`/etc/dovecot/dict-sieve-sql.conf`) with your database configuration. Next,
create a dict proxy service (`/etc/dovecot/dovecot.conf`). Finally,
configure Sieve to check the dict to lookup up a script called "active" in the
database:

::: code-group
```[/etc/dovecot/dict-sieve-sql.conf]
# The database connection params
connect = host=localhost dbname=dovecot user=dovecot password=password

# The name mapping that yields the ID of the Sieve script
map {
  # The name of the script, as per the "sieve" config parameter
  pattern = priv/sieve/name/$script_name

  # The database table
  table = user_sieve_scripts

  # The field in the table to query on
  username_field = username

  # The field which contains the return value of the script ID
  value_field = id

  fields {
	# FIXME: The other database field to query?
    script_name = $script_name
  }
}

# The name mapping that yields the script content from ID
map {
  # The ID, obtained from above
  pattern = priv/sieve/data/$id

  # The database table
  table = user_sieve_scripts

  # The field in the table to query
  username_field = username

  # The field which contains the script
  value_field = script_data

  fields {
	# FIXME: The other database field to query?
    id = $id
  }
}
```

```[/etc/dovecot/dovecot.conf]
# dict proxy service
dict {
  sieve = pgsql:/etc/dovecot/dict-sieve-sql.conf.ext
}

# dict lookup
plugin {
  sieve = dict:proxy::sieve;name=active
}
```
:::

As with the flat file, the database query will need to return the Sieve
script all in one line, otherwise the subsequent lines will be ignored.

::: info
You might need to configure the [[link,dict_proxy,dict proxy permissions]].
:::

### LDAP

The `ldap` location is used to retrieve Sieve scripts from an LDAP database.
To retrieve a Sieve script from the LDAP database, at most two lookups are
performed.

First, the LDAP entry containing the Sieve script is searched using the
specified LDAP search filter. If the LDAP entry changed since it was
last retrieved (or it was never retrieved before), the attribute
containing the actual Sieve script is retrieved in a second lookup. In
the first lookup, a special attribute is read and checked for changes.
Usually, this is the `modifyTimestamp` attribute, but an alternative
can be configured.

Depending on how Pigeonhole was configured and compiled (refer to
INSTALL file for more information), LDAP support may only be available
when a plugin called `sieve_storage_ldap` is loaded.

#### Configuration

If support for the `ldap` location type is compiled as a plugin, it
needs to be added to the sieve_plugins setting before it can be used,
e.g.:

```
sieve_plugins = sieve_storage_ldap
```

The `ldap` script location syntax is specified as follows:

```
location = ldap:<config-file>[;<option>[=<value>][;...]]
```

`<config-file>` is a filesystem path that points to a configuration file
containing the actual configuration for this `ldap` script location.

If the name of the Script is left unspecified and not otherwise provided
by the Sieve interpreter, the name defaults to `default`.

##### Settings

This location supports all settings described in
[Common Settings](#common-settings).

##### `bindir`

By default, compiled binaries are not stored at all for Sieve
scripts retrieved from LDAP. Thus, the Sieve binaries will be
compiled each time they are called.

To improve performance, this setting should be specified to cache the
compiled binaries on the local filesystem. For Example:

```[dovecot.conf]
sieve = ldap:/etc/dovecot/sieve.ldap;name=keep;bindir=~/.sieve-bin
# or
#sieve = ldap:/etc/dovecot/sieve.ldap;name=keep;bindir=/var/sieve-scripts/%u
```

::: tip
Sieve uses the ID number as its cache index and to detect the
need to compile. Therefore, if a script is changed, then its ID must
also be changed for it to be reloaded.
:::

##### `user=<username>`

Overrides the user name used for the lookup. Normally, the name of
the user running the Sieve interpreter is used.

##### LDAP Settings

The configuration file is based on the [[link,auth_ldap]]. These
parameters are specific to the Sieve ldap configuration:

###### `sieve_ldap_filter`

- Default: `(&(objectClass=posixAccount)(uid=%u))`
- Values: [[link,settings_types_string]]

The LDAP search filter that is used to find the entry containing the
Sieve script.

These variables can be used:

| Variable | Long Name | Description |
| -------- | --------- | ----------- |
| `%u` | `%{user}` | username |
| `%n` | `%{username}` | user part in user@domain, same as `%u` if there's no domain |
| `%d` | %{domain} | domain part in user@domain, empty if user there's no domain |
| | `%{home}` | user's home directory |
| | `%{name}` | name of the Sieve script |

###### `sieve_ldap_script_attr`

- Default: `mailSieveRuleSource`
- Values: [[link,settings_types_string]]

The name of the attribute containing the Sieve script.

###### `sieve_ldap_mod_attr`

- Default: `modifyTimestamp`
- Values: [[link,settings_types_string]]

The name of the attribute used to detect modifications to the LDAP entry.

##### Example

::: code-group
```[dovecot.conf]
plugin {
  sieve = ldap:/etc/dovecot/sieve-ldap.conf;bindir=~/.sieve-bin/
}
```

```[/etc/dovecot/sieve-ldap.conf]
# This file needs to be accessible by the Sieve interpreter running in LDA/LMTP.
# This requires access by the mail user. Don't use privileged LDAP credentials
# here as these may likely leak. Only search and read access is required.

# Space separated list of LDAP hosts to use. host:port is allowed too.
hosts = localhost

# Distinguished Name - the username used to login to the LDAP server.
# Leave it commented out to bind anonymously.
dn = cn=sieve,ou=Programs,dc=example,dc=org

# Password for LDAP server, if dn is specified.
dnpass = secret

# Simple binding.
sasl_bind = no

# No TLS
tls = no

# LDAP library debug level as specified by LDAP_DEBUG_* in ldap_log.h.
# -1 = everything. You may need to recompile OpenLDAP with debugging enabled
# to get enough output.
debug_level = 0

# LDAP protocol version to use. Likely 2 or 3.
ldap_version = 3

# LDAP base
base = dc=mail,dc=example,dc=org

# Dereference: never, searching, finding, always
deref = never

# Search scope: base, onelevel, subtree
scope = subtree

# Filter for user lookup. Some variables can be used:
#   %u      - username
#   %n      - user part in user@domain, same as %u if there's no domain
#   %d      - domain part in user@domain, empty if there's no domain
#   %{name} - name of the Sieve script
sieve_ldap_filter = (&(objectClass=posixAccount)(uid=%u))

# Attribute containing the Sieve script
sieve_ldap_script_attr = mailSieveRuleSource

# Attribute used for modification tracking
sieve_ldap_mod_attr = modifyTimestamp
```
:::

## Settings

<SettingsComponent tag="sieve" />

### Extension-specific Configuration

Sieve language extensions may have specific configuration.

See [[link,sieve_extensions]] for a list of extensions and links to their
configuration pages.

### Per-user Sieve script location

By default, the Dovecot Sieve plugin looks for the user's Sieve script
file in the user's home directory (`~/.dovecot.sieve`). This requires
that the [[link,home_directories_for_virtual_users]] is set for the user.

If you want to store the script elsewhere, you can override the default
using the `sieve` setting, which specifies the path to the user's
script file. This can be done in two ways:

1. Define the `sieve` setting in the plugin section of `dovecot.conf`.

2. Return `sieve` extra field from [[link,userdb_extra_fields]].

For example, to use a Sieve script file named `<username>.sieve` in
`/var/sieve-scripts`, use:

```
plugin {
  ...
  sieve = /var/sieve-scripts/%u.sieve
}
```

You may use templates like `%u`, as shown in the example. See [[variable]].

A relative path (or just a filename) will be interpreted to point under
the user's home directory.

## Executing Multiple Scripts Sequentially

The Dovecot Sieve plugin allows executing multiple Sieve scripts
sequentially. The extra scripts can be executed before and after the
user's private script. For example, this allows executing global Sieve
policies before the user's script. This is not possible using the
[[setting,sieve_default]] setting because that is only used when the
user's private script does not exist.

See [[setting,sieve_before]] and [[setting,sieve_after]] for details on how
to configure the execution sequence.

The script execution ends when the currently executing script in the
sequence does not yield a "keep" result: when the script terminates, the
next script is only executed if an implicit or explicit "keep" is in
effect. Thus, to end all script execution, a script must not execute
keep and it must cancel the implicit keep, e.g. by executing
`discard; stop;`.

This means that the command `keep;` has different semantics when used in
a sequence of scripts. For normal Sieve execution, `keep;` is equivalent
to `fileinto "INBOX";`, because both cause the message to be stored in
INBOX.

However, in sequential script execution, it only controls whether the
next script is executed. Storing the message into INBOX (the default
folder) is not done until the last script in the sequence executes
(implicit) keep.

To force storing the message into INBOX earlier in the sequence, the fileinto
command can be used (with `:copy` or together with `keep;`).

Apart from the `keep` action, all actions triggered in a script in the
sequence are executed before continuing to the next script. This means
that when a script in the sequence encounters an error, actions from
earlier executed scripts are not affected. The sequence is broken
however, meaning that the script execution of the offending script is
aborted and no further scripts are executed. An implicit keep is
executed in stead.

Just as for executing a single script the normal way, the Dovecot Sieve
plugin takes care never to duplicate deliveries, forwards or responses.
When vacation actions are executed multiple times in different scripts,
the usual error is not triggered: the subsequent duplicate vacation
actions are simply discarded.

For example:

```[dovecot.conf]
plugin {
  # Global scripts executed before the user's personal script.
  #   E.g. handling messages marked as dangerous
  sieve_before = /var/lib/dovecot/sieve/discard-viruses.sieve

  # Domain-level scripts retrieved from LDAP
  sieve_before2 = ldap:/etc/dovecot/sieve-ldap.conf;name=ldap-domain

  # User-specific scripts executed before the user's personal script.
  #   E.g. a vacation script managed through a non-ManageSieve GUI.
  sieve_before3 = /var/vmail/%d/%n/sieve-before

  # User-specific scripts executed after the user's personal script.
  # (if keep is still in effect)
  #   E.g. user-specific default mail filing rules
  sieve_after = /var/vmail/%d/%n/sieve-after

  # Global scripts executed after the user's personal script
  # (if keep is still in effect)
  #   E.g. default mail filing rules.
  sieve_after2 = /var/lib/dovecot/sieve/after.d/
}
```

::: tip
Be sure to manually pre-compile the scripts specified by
[[setting,sieve_before]] and [[setting,sieve_after]] by using the
[[link,sievec]] tool.
:::

## Visible Default Script

The [[setting,sieve_default]] setting specifies the location of a default
script that is executed when the user has no active personal script.

Normally, this default script is invisible to the user; i.e., it is not
listed in [[link,managesieve_server]].

To give the user the ability to see and read the default script, it is
possible to make it visible under a specific configurable name using
[[setting,sieve_default_name]]. The [[setting,sieve_default]]
setting needs to point to a valid script location as well for this to
work. If the default script does not exist at the indicated location, it
is not shown.

ManageSieve will magically list the default script under that name, even
though it does not actually exist in the user's normal script storage
location. This way, the ManageSieve client can see that it exists and it
can retrieve its contents. If no normal script is active, the default is
always listed as active. The user can replace the default with a custom
script, by uploading it under the default script's name. If that custom
script is ever deleted, the default script will reappear from the
shadows implicitly.

This way, ManageSieve clients will not need any special handling for
this feature. If the name of the default script is equal to the name the
client uses for the main script, it will initially see and read the
default script when the user account is freshly created. The user can
edit the script, and when the edited script is saved through the
ManageSieve client, it will override the default script. If the
user ever wants to revert to the default, the user only needs to delete
the edited script and the default will reappear.

```[dovecot.conf]
plugin {
  sieve = file:~/sieve;active=~/.dovecot.sieve

  sieve_default = /var/lib/dovecot/sieve/default.sieve
  sieve_default_name = roundcube
}
```

## Trace Debugging

Trace debugging provides detailed insight in the operations performed by
the Sieve script. Messages about what the Sieve script is doing are
written to the specified directory.

::: warning
On a busy server, this functionality can quickly fill up
the trace directory with a lot of trace files. Enable this only
temporarily and as selective as possible; e.g., enable this only for a
few users by returning the settings below from userdb as
[[link,userdb_extra_fields]] rather than enabling these for everyone.
:::

### Settings

These settings apply to both the Sieve plugin and [[plugin,imap-sieve]].

<SettingsComponent tag="sieve-trace" level="3" />
