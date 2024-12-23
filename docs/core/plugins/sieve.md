---
layout: doc
title: sieve
dovecotlinks:
  sieve_configuration:
    hash: configuration
    text: Sieve configuration
  sieve_storage:
    hash: script-storage
    text: Script storage
  sieve_storage_type:
    hash: script-storage-types
    text: Script storage types
  sieve_storage_type_personal:
    hash: script-storage-type-personal
    text: Script storage type `personal`
  sieve_storage_type_after:
    hash: script-storage-type-after
    text: Script storage type `after`
  sieve_storage_type_before:
    hash: script-storage-type-before
    text: Script storage type `before`
  sieve_storage_type_default:
    hash: script-storage-type-default
    text: Script storage type `default`
  sieve_storage_type_discard:
    hash: script-storage-type-discard
    text: Script storage type `discard`
  sieve_storage_type_global:
    hash: script-storage-type-global
    text: Script storage type `global`
  sieve_storage_driver:
    hash: script-storage-drivers
    text: Script storage drivers
  sieve_storage_file:
    hash: file-storage-driver
    text: File storage driver
  sieve_storage_dict:
    hash: dict-storage-driver
    text: Dict storage driver
  sieve_storage_ldap:
    hash: ldap-storage-driver
    text: LDAP storage driver
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
  mail_plugins {
    sieve = yes
  }
}

protocol lmtp {
  mail_plugins {
    sieve = yes
  }
}
```

## Script storage

Sieve scripts are retrieved from a script storage. This can currently be the
local filesystem, an LDAP database or any dict storage. Depending on the storage
implementation, its type and its configuration, storages can contain one script,
several scripts identified by name, and a series of scripts in a well-defined
order to be executed in sequence.

Script storages are configured in a named [[setting,sieve_script]] block:

```
sieve_script personal {
  path = ~/.dovecot.sieve
}
```

The storage name (`personal` in the example) is used internally within
configurations, as an identifier for logging, and as an identifier for command
line tools. It also allows updating a storage that was defined earlier - by
repeating the [[setting,sieve_script]] block and adding additional configuration
settings - or it allows userdb to override storage settings for specific users.

### Script storage types

Sieve scripts can be evaluated at various stages in message delivery and for
stored messages. The type of the Sieve script storage determines where it is
applicable, how the storage is accessed and how the retrieved Sieve script is
evaluated.

The type of the Sieve script storage is configured using the
[[setting,sieve_script_type]] setting. The following types are currently
recognized (others are defined by the [[plugin,sieve-imapsieve]] plugin):

#### `personal` {#script-storage-type-personal}

The `personal` storage serves as the user's main personal storage. Although more
than a single `personal` storage can be defined, only the first one listed in
the configuration is used. 

The LDA Sieve plugin uses the personal storage to find the active script for
Sieve filtering at delivery. If the storage supports storing more than a single
script (e.g. the [[link,sieve_storage_file,file storage]] does), personal
scripts can also be retrieved by name. The Sieve include extension will then use
this  storage for retrieving `:personal` scripts and the ManageSieve service
will be able to store the user's scripts there.

If the storage supports storing more than a single script, only one of those
scripts will be the active script used at delivery. The active script can be
managed by the user through the ManageSieve service. If the personal storage has
no active script, the [[link,sieve_storage_type_default,default script]] will be
executed if configured.

If no personal storage is defined explicitly, auto-detection will be attempted.
This is currently only trying the
[[link,sieve_storage_file,file storage driver], which looks for a
`~/.dovecot.sieve` script file or a directory at `~/sieve/` containing script
files. In the latter case `~/.dovecot.sieve` is expected to be a symbolic link
pointing to the active script file. If auto-detection also finds no personal
storage, Sieve processing will be skipped and no default script is executed.

#### `after` {#script-storage-type-after}

An `after` storage is the source of one script or several scripts that are to be
executed after the user's personal script. If the storage supports storing more
than a single script, these scripts will be executed in a well-defined order
defined by the storage driver. Multiple `after` storages can be configured and
each storage will be accessed in sequence to retrieve scripts for execution
after the personal script. The storages will be accessed in the order these
storages are defined in the configuration, unless the order is overridden by the
[[setting,sieve_script_precedence]] setting.

This is usually a global script, so be sure to pre-compile the specified
script manually in that case using the sievec command line tool, as
explained by [[man,sievec]].`

#### `before` {#script-storage-type-before}

A `before` storage behaves identical to an `after` storage, except the contained
script or scripts are run **before** user's personal script (instead of
**after**).

#### `default` {#script-storage-type-default}

The `default` storage yields the sieve script that gets executed **only** if
the user's personal Sieve script does not exist. Although more
than a single `default` storage can be defined, only the first one listed in
the configuration is used. 

If [[setting,sieve_script_name]] is set for this script storage, the default
script can be seen and accessed by this name through ManageSieve (and
doveadm sieve). See below ([[link,sieve_visible_default_script]]).

This is usually a global script, so be sure to pre-compile the specified
script manually in that case using the sievec command line tool, as
explained by [[man,sievec]].`

#### `discard` {#script-storage-type-discard}

The `discard` storage yields the sieve script that gets executed for any message
that is about to be discarded; i.e., it is not delivered anywhere by the normal
Sieve execution. Although more than a single `discard` storage can be defined,
only the first one listed in the configuration is used. The `discard` storage
is currently only applicable for message delivery.

The script from the `discard` storage is only executed when the "implicit keep"
is canceled, by e.g. the "discard" action, and no actions that deliver the
message are executed. Delivery in this case means both local delivery to a
mailbox and redirection to a remote recipient. This "discard script" can prevent
discarding the message, by executing alternative actions. If the discard
script does nothing, the message is still discarded as it would be when no
discard script is configured.

#### `global` {#script-storage-type-global}

A `global` storage is the source of `:global` include scripts for the Sieve
include extension. Scripts are accessed by name, so if the storage yields only
one script, a name must be defined for it; either implicitly by the storage
driver or explicitly using [[setting,sieve_script_name]]. Multiple `global`
storages can be configured and each storage will be queried in sequence to
retrieve the requested script by name. The storages will be queried in the order
these storages are defined in the configuration until the script is found. The
order can be overridden by the [[setting,sieve_script_precedence]] setting.

### Script storage drivers

Sieve script storages are implemented as a storage driver. The default
[file](#sieve_storage_file) storage driver uses the local filesystem. It can use
a single script file or a directory containing several Sieve script files with a
symbolic link pointing to the active script.

More complex setups can use other storage drivers such as
[ldap](#sieve_storage_ldap) or [dict](#sieve_storage_dict) to fetch Sieve
scripts from LDAP databases or dict storages, respectively.

The storage driver is configured using the [[setting,sieve_script_driver]]
setting. If not explicitly configured for a [[setting,sieve_script]] block, the
storage driver is [[link,sieve_storage_file,file]] and the default directory is
`~/sieve/` with a symbolic link at `~/.dovecot.sieve` pointing to the active
script file in that directory.

#### Common Settings

All Sieve script storages support the following common settings:

<SettingsComponent tag="sieve-storage" />

### File storage driver

The `file` script storage driver is used to retrieve Sieve scripts from the file
system. This is the default type if the [[setting,sieve_script_driver]] setting
is omitted.

The path configured using the [[setting,sieve_script_path]] setting can either
point to a directory or to a regular file. If the path points to a directory, a
script called `name` is retrieved by reading a file from that directory with the
file name `name.sieve`.

When a script storage with type [[link,sieve_storage_type_personal,personal]] is
using the `file` driver and the[[setting,sieve_script_path]] points to a
directory, a symbolic link points to the currently active script (the script
executed at delivery). The active script can be modified by the user through
ManageSieve and by the administrator using [[doveadm,sieve activate]]. The
location of this symbolic link can be configured using the
[[setting,sieve_script_active_path]] setting.

When a script storage with type [[link,sieve_storage_type_before,before]] or
[[link,sieve_storage_type_after,after]] is using the `file` driver
and [[setting,sieve_script_path]] points to a directory, all files in that
directory with a `.sieve` extension are part of the sequence. The sequence order
of the scripts in that directory is determined by the file names, using a normal
8-bit per-octet comparison.

Unless overridden using the [[setting,sieve_script_bin_path]] setting, compiled
binaries for scripts retrieved from a `file` script storage are by
default stored in the same directory as where the script file was found
if possible.

#### Configuration

The `file` storage driver supports all settings described in
[Common Settings](#common-settings). Additionally, the following settings apply
to this driver:

<SettingsComponent tag="sieve-storage-file" />

##### `sieve_script_name`

If the [[setting,sieve_script_name]] setting is not configured and the Sieve
script is not retrieved by name (e.g. using the
[[link,sieve_include,include extension]] or by [[link,managesieve]]), the name
defaults to the file name without the `.sieve` suffix.

##### `sieve_script_bin_path`

If the [[setting,sieve_script_bin_path]] setting is not configured, the binaries
are stored in the same directory as the corresponding sieve scripts by default.

#### Example

```
sieve_script personal {
  driver = file
  path = ~/sieve
  active_path = ~/.dovecot.sieve
}

sieve_script default {
  type = default
  name = default
  driver = file
  path = /etc/dovecot/sieve/default/
}
```

### Dict storage driver

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

The `dict` storage driver supports all settings described in
[Common Settings](#common-settings).

##### `sieve_script_name`

If the [[setting,sieve_script_name]] setting is not configured and the Sieve
script is not retrieved by name (e.g. using the
[[link,sieve_include,include extension]] or by [[link,managesieve]]), the name
defaults to `default`.

##### `sieve_script_bin_path`

By default, compiled binaries are not stored at all for Sieve
scripts retrieved from a dict database. Thus, the Sieve binaries will be
compiled each time they are called.

To improve performance, [[setting,sieve_script_bin_path]] should be specified to
cache the compiled binaries on the local filesystem. For Example:

```[dovecot.conf]
sieve_script personal {
  driver = dict
  name = keep

  bin_path = ~/.sieve-bin
  # or
  #bin_path=/var/sieve-scripts/%{user}

  dict file {
    path = /etc/dovecot/sieve.dict
  }
}
```

::: tip
Sieve uses the ID number as its cache index and to detect the
need to compile. Therefore, if a script is changed, then its ID must
also be changed for it to be reloaded.
:::

#### Examples

##### Flat File Driver

To retrieve the Sieve script named "keep" from the dict file
/etc/dovecot/sieve.dict:

::: code-group
```[dovecot.conf]
# Only the "keep" script will be used.
sieve_script personal {
  driver = dict
  name = keep
  dict file {
    path = /etc/dovecot/sieve.dict
  }
}
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

##### Using a SQL Driver

For greater flexibility, it's possible to use a SQL driver for your
dict scripts.

First, set up a configuration file (such as
`/etc/dovecot/dict-sieve-sql.conf.inc`) with your database configuration. This
should consist of the following parts:

First, set up a configuration file (such as
`/etc/dovecot/dict-sieve-sql.conf`) with your database configuration. Next,
create a dict proxy service (in `dovecot.conf`). Finally, configure Sieve to
check the dict to lookup up a script called "active" in the database:

::: code-group
```[/etc/dovecot/dict-sieve-sql.conf.inc]
# The name mapping that yields the ID of the Sieve script

# The name of the script, as per the "sieve" config parameter
dict_map priv/sieve/name/$script_name {
  # The database table
  sql_table = user_sieve_scripts

  # The username field in the table to query
  username_field = username

  # The field which contains the return value of the script ID
  value_field id {
  }

  # The script name field in the table to query
  key_field script_name {
    pattern = $script_name
  }
}

# The name mapping that yields the script content from ID

# The ID, obtained from above
dict_map priv/sieve/data/$id {
  # The database table
  sql_table = user_sieve_scripts

  # The username field in the table to query
  username_field = username

  # The field which contains the script
  value_field script_data {
  }

  # The id field in the table to query
  fields id {
    id = $id
  }
}
```

```[dovecot.conf]
dict_server {
  dict sieve {
    driver = sql
    sql_driver = pgsql

    pgsql localhost {
      parameters {
        dbname = dovecot
        user = dovecot
        password = password
      }
    }

    !include /etc/dovecot/dict-sieve-sql.conf.inc
  }
}

# dict lookup
sieve_script personal {
  driver = dict
  name = active
  dict proxy {
    name = sieve
  }
}
```
:::

As with the flat file, the database query will need to return the Sieve
script all in one line, otherwise the subsequent lines will be ignored.

::: info
You might need to configure the [[link,dict_proxy,dict proxy permissions]].
:::

### LDAP storage driver

The `ldap` storage driver is used to retrieve Sieve scripts from an LDAP
database. To retrieve a Sieve script from the LDAP database, at most two lookups
are performed.

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

The `ldap` storage driver supports all settings described in
[Common Settings](#common-settings). The following settings apply to this script
storage driver:

<SettingsComponent tag="sieve-storage-ldap" />

##### `sieve_script_name`

If the [[setting,sieve_script_name]] setting is not configured and the Sieve
script is not retrieved by name (e.g. using the
[[link,sieve_include,include extension]] or by [[link,managesieve]]), the name
defaults to `default`.

##### `sieve_script_bin_path`

By default, compiled binaries are not stored at all for Sieve scripts retrieved
from LDAP. Thus, the Sieve binaries will be compiled each time they are called.

To improve performance, [[setting,sieve_script_bin_path]] should be specified to
cache the compiled binaries on the local filesystem. For Example:

```[dovecot.conf]
sieve_script personal {
  driver = ldap
  name = keep

  bin_path = ~/.sieve-bin
  # or
  #bin_path = /var/sieve-scripts/%{user}

  # LDAP settings:
  ...
}
```
::: tip
Sieve uses the LDAP entry configured using
[[setting,sieve_script_ldap_modified_attribute]] to detect the need to compile.
Therefore, if a script is changed, then this entry must also be changed for it
to be reloaded. Depending on which LDAP entry is configured, this can happen
implicitly by the LDAP database itself (which is normally the case for the
default `modifyTimestamp` entry).
:::

#### Example

If support for the `ldap` script storage driver is compiled as a plugin, it
needs to be added to the [[setting,sieve_plugins]] setting before it can be
used, e.g.:

```
sieve_plugins {
  sieve_storage_ldap = yes
}
```

::: code-group
```[dovecot.conf]
sieve_script personal {
  driver = ldap
  bin_path = ~/.sieve-bin/

  # Don't use privileged LDAP credentials here as these may likely leak. Only
  # search and read access is required.

  # Space separated list of LDAP URIs to use.
  ldap_uris = ldap://localhost

  # Distinguished Name - the username used to login to the LDAP server.
  # Leave it commented out to bind anonymously.
  ldap_auth_dn = cn=sieve,ou=Programs,dc=example,dc=org

  # Password for LDAP server, if dn is specified.
  ldap_auth_dnpassword = secret

  # LDAP base
  ldap_base = dc=mail,dc=example,dc=org

  # Dereference: never, searching, finding, always
  ldap_deref = never

  # Search scope: base, onelevel, subtree
  ldap_scope = subtree

  # Filter for user lookup. Some variables can be used:
  #   %{user}      - username
  #   %{user | username}      - user part in user@domain, same as %{user} if there's no domain
  #   %{user | domain}      - domain part in user@domain, empty if there's no domain
  #   %{name} - name of the Sieve script
  ldap_filter = (&(objectClass=posixAccount)(uid=%{user}))

  # Attribute containing the Sieve script
  ldap_script_attribute = mailSieveRuleSource

  # Attribute used for modification tracking
  ldap_modified_attribute = modifyTimestamp
}
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
by configuring a [[link,sieve_storage_type_personal,personal script storage]].
This can be done in two ways:

1. Define the full [[setting,sieve_script]] block in dovecot configuration.

2. Return the user-specific settings as a extra fields from
   [[link,userdb_extra_fields]].

For example, to use a Sieve script file named `<username>.sieve` in
`/var/sieve-scripts`, use:

```
sieve_script personal {
  path = /var/sieve-scripts/%{user}.sieve
}
```

You may use templates like `%{user}`, as shown in the example. See [[variable]].

A relative path (or just a filename) will be interpreted to point under
the user's home directory.

## Executing Multiple Scripts Sequentially

The Dovecot Sieve plugin allows executing multiple Sieve scripts
sequentially. The extra scripts can be executed before and after the
user's private script. For example, this allows executing global Sieve
policies before the user's script. See the
[[link,sieve_storage_type_before,before]] and
[[link,sieve_storage_type_after,after]] Sieve storage
types for details on how to configure the execution sequence.

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
# Global scripts executed before the user's personal script.
#   E.g. handling messages marked as dangerous
sieve_script before1 {
  type = before
  path = /var/lib/dovecot/sieve/discard-viruses.sieve
}

# Domain-level scripts retrieved from LDAP
sieve_script before2 {
  type = before
  name = ldap-domain
  driver = ldap
  # ldap settings here: ...
}

# User-specific scripts executed before the user's personal script.
#   E.g. a vacation script managed through a non-ManageSieve GUI.
sieve_script before3 {
  type = before
  path = /var/vmail/%{user | domain}/%{user | username}/sieve-before
}

# User-specific scripts executed after the user's personal script.
# (if keep is still in effect)
#   E.g. user-specific default mail filing rules
sieve_script after1 {
  type = after
  path = /var/vmail/%{user | domain}/%{user | username}/sieve-after
}

# Global scripts executed after the user's personal script
# (if keep is still in effect)
#   E.g. default mail filing rules.
sieve_script after2 {
  type = after
  path = /var/lib/dovecot/sieve/after.d/
}
```

::: tip
Be sure to manually pre-compile the scripts specified by
[[link,sieve_storage_type_before,before]] and
[[link,sieve_storage_type_after,after]] Sieve storage types by using the
[[link,sievec]] tool.
:::

## Visible Default Script

The [[link,sieve_storage_type_default,default]] Sieve storage type
specifies the location of a default script that is executed when the user has no
active personal script.

Normally, this default script is invisible to the user; i.e., it is not
listed in [[link,managesieve_server]].

To give the user the ability to see and read the default script, it is
possible to make it visible under a specific configurable name using
[[setting,sieve_script_name]] in the [[setting,sieve_script]] block of the
[[link,sieve_storage_type_default,default]] storage setting. The
[[link,sieve_storage_type_default,default]] storage needs to point to a valid
script location as well for this to work: if the default script does not exist
at the indicated location, it is not shown.

ManageSieve will magically list the default script under that name, even
though it does not actually exist in the user's normal personal script storage.
This way, the ManageSieve client can see that it exists and it can retrieve its
contents. If no normal script is active, the default is always listed as active.
The user can replace the default with a custom script, by uploading it under the
default script's name. If that custom script is ever deleted, the default script
will reappear from the shadows implicitly.

This way, ManageSieve clients will not need any special handling for this
feature. If the name of the default script is equal to the name the client uses
for the main script, it will initially see and read the default script when the
user account is freshly created. The user can edit the script, and when the
edited script is saved through the ManageSieve client, it will override the
default script. If the user ever wants to revert to the default, the user only
needs to delete the edited script and the default will reappear.

```[dovecot.conf]
sieve_script personal {
  path = ~/sieve
  active_path = ~/.dovecot.sieve
}

sieve_script default {
  type = default
  name = roundcube
  path = /var/lib/dovecot/sieve/default.sieve
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
