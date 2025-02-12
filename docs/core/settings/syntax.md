---
layout: doc
title: Config Syntax
dovecotlinks:
  settings_syntax_expansion:
    hash: variable-expansion
    text: variable expansion
  settings_syntax_named_filters:
    hash: named-filters
    text: Named Filters
  settings_connection_filters:
    hash: connection-filters
    text: Connection Filters
  settings_groups_includes:
    hash: groups-includes
    text: Groups Includes
---

# Dovecot Config File Syntax

::: tip
See Also:
* [[link,settings_types]], and
* [[link,settings_variables]].
:::

## Example Configuration

The example configuration files are split into multiple files in `conf.d/`
directory for grouping the settings. This is just for human readability though.
Dovecot doesn't care which settings are in which files. They could all be put
into a single `dovecot.conf` if preferred (except for
[external config files](#external-config-files)).

## Config Version

The first setting in the configuration file must be
[[setting,dovecot_config_version]]. It specifies the configuration syntax,
the used setting names and the expected default values.

## Basic Syntax

The syntax generally looks like this:

```
# this is a comment

settings_key = settings_value
```

The `#` character and everything after it are comments. Extra spaces and tabs
are ignored. If you need to use these, put the value inside quotes. The quote
character inside a quoted string is escaped with `\"`:

```[dovecot.conf]
settings_key = "# char, \"quote\", and trailing whitespace    "
```

If Dovecot doesn't seem to be reading your configuration correctly, use
`doveconf -n` to check how Dovecot actually parses it.

## Named Filters

[[added,settings_syntax_named_filters_added]]

All settings are globals. There are several filters which can be used to
restrict when the settings are used. There are "named filters" and "named list
filters".

Named filters are used to access settings in some specific situations. For
example:

```[dovecot.conf]
mail_attribute {
  dict file {
  }
}
```

In this case when mail attributes are being accessed, the dict settings are
looked up using the named filter called `mail_attribute`. Note that named
filters cannot have a name before the `{`, i.e. `mail_attribute foo {` will
result in an error.

Setting names that begin with the same prefix as a named filter will be treated
as if they belong inside the named filter. For example all these settings are
equivalent and modify the exact same setting:

```[dovecot.conf]
auth_policy_server_url = example.com
auth_policy {
  server_url = example.com
  auth_policy_server_url = example.com
}
```

Regardless of which method is used in `dovecot.conf`, the [[man,doveconf]]
output will be:

```[dovecot.conf]
auth_policy {
  server_url = example.com
}
```

Named list filters are similar to named filters, except there can be many of
them, each with a unique name. For example:

```[dovecot.conf]
namespace inbox {
  prefix = INBOX/
}
namespace virtual {
  prefix = Virtual/
}
```

Both named filters and named list filters can be updated later on in the
configuration. For example:

```[dovecot.conf]
namespace inbox {
  prefix = INBOX/
}

# ...

# possibly included from another file:
# The namespaces settings get merged into the same inbox namespace filter.
namespace inbox {
  mailbox Trash {
    special_use = \Trash
  }
}
```

The named list filter's name may also sometimes be used as part of the settings
instead of simply a name. For example:

```[dovecot.conf]
service auth {
  unix_listener auth-master {
    # ...
  }
}
```

Above the `auth-master` both uniquely identifies the filter name, but it also
acts as the `unix_listener_path` setting.

Settings inside filters are automatically attempted to be prefixed by the
innermost filter prefix to avoid repetition. For example:

```[dovecot.conf]
service imap {
  inet_listener imaps {
    ssl = yes
  }
}
```

The `ssl` setting is attempted to be looked up in this order:
1. `inet_listener_imaps_ssl`
1. `inet_listener_ssl`
1. `ssl`

The first setting that exists is used.

::: tip
The filters must currently be written with the linefeeds as shown above.
For example this doesn't work:

```[dovecot.conf]
namespace inbox { prefix = INBOX/ } # DOES NOT WORK
```
:::

## Named Filter Overrides

It's possible to add/update/replace named (list) filters via userdb settings or
via `-o` command line parameters. For example if you have:

```[dovecot.conf]
oauth2 {
  http_client_request_max_attempts = 1
}
```

This can be replaced with `-o oauth2/http_client_request_max_attempts=2`
command line parameters.

Similarly for named list filters if you have:

```[dovecot.conf]
namespace inbox {
 separator = /
}
```

This can be replaced with `-o namespace/inbox/separator=.` command line
parameters.

If you want to add a new named list filter, use
`<setting name>+=<filter name>[,<filter name>,...]`. For example:
`-o namespace+=second -o namespace/second/...=...`

If you want to replace all the named list filters, use
`<setting name>=<filter name>[,<filter name>,...]` (i.e. without the `+`).
For example:
`-o namespace=inbox,second -o namespace/second/...=...`

## Connection Filters

There are a few different connection/session related filters:

* `protocol <name>`: Name of the service/protocol that is reading the settings.
  For example: `imap`, `pop3`, `doveadm`, `lmtp`, `lda`
* `remote <ip/network>`: Remote client's IP/network. For non-TCP connections
  this will never match. For example `10.0.0.1` or `10.0.0.0/16`.
* `local_name <name>`: Matches TLS connection's SNI name, if it's sent by the
  client. Commonly used to [[link,ssl,configure multiple TLS certificates]].
* `local <ip/range>`: Locally connected IP/network. For non-TCP connections
  this will never match. For example `127.0.0.1` or `10.0.0.0/16`.

These filters work for most of the settings, but most importantly auth
settings currently only support the protocol filter. Some of the other
settings are also global and can't be filtered, such as [[setting,log_path]].

An example, which uses all of the filters:

```
local 127.0.0.1 {
  local_name imap.example.com {
    remote 10.0.0.0/24 {
      protocol imap {
        # ...
      }
    }
  }
}
```

The nesting of the filters must be exactly in that order or the config
parsing will fail.

When applying the settings, the settings within the most-specific filters
override the less-specific filter's settings, so the order of the filters
in config file doesn't matter.

Example:

```
local 127.0.0.2 {
  key = 127.0.0.2
}
local 127.0.0.0/24 {
  key = 127.0.0.0/24
}
local 127.0.0.1 {
  key = 127.0.0.1
}
# The order of the above blocks doesn't matter:
# If local IP=127.0.0.1, key=127.0.0.1
# If local IP=127.0.0.2, key=127.0.0.2
# If local IP=127.0.0.3, key=127.0.0.0/24
```

Similarly remote local filters override remote filters, which override
`local_name` filters, which override protocol filters. In some situations
Dovecot may also return an error if it detects that the same setting is being
ambiguously set by multiple matching filters.

## Setting types

See [[link,settings_types]] for which types of settings are supported by the
configuration. Note especially the [[link,settings_types_strlist]] and
[[link,settings_types_boollist]] which look similar to named filters.

## Groups includes

You can create groups of settings, which can be referred to elsewhere. The
groups themselves are grouped into labels. The label prefix can be omitted from
the settings' names. The syntax is:

```[dovecot.conf]
group @label name {
  # settings, with label_ prefix automatically attempted to be added
}
```

For example:

```[dovecot.conf]
group @mysql default {
  host = mysql.example.com
  mysql_ssl = yes
  ssl_client_ca_file = /etc/ssl/ca.pem
}
passdb sql {
  @mysql = default
  # ...
}

group @mailboxes english {
  mailbox Trash {
    auto = subscribe
    special_use = \Trash
  }
  mailbox Drafts {
    auto = subscribe
    special_use = \Drafts
  }
}
group @mailboxes finnish {
  mailbox Roskakori {
    auto = subscribe
    special_use = \Trash
  }
  mailbox Luonnokset {
    auto = subscribe
    special_use = \Drafts
  }
}
namespace inbox {
  @mailboxes = english
}
```

It's possible to override groups using the command line parameter `-o` or
userdb. For example above you can return `namespace/inbox/@mailboxes=finnish`
from userdb to change mailbox names to Finnish language. Note that groups can't
be added via overrides unless `@label` is already set in the config file.

## Including Config Files

The main `dovecot.conf` file can also include other config files:

```
!include local.conf
!include /path/to/another.conf
!include conf.d/*.conf
```

The paths are relative to the currently parsed config file's directory.

Example:

```
# /etc/dovecot/dovecot.conf:
!include conf.d/imap.conf
# /etc/dovecot/conf.d/imap.conf:
!include imap2.conf
# /etc/dovecot/conf.d/imap2.conf is being included
```

If any of the includes fail (e.g. file doesn't exist or permission
denied), it results in an error. It's not an error if wildcards don't result
in any matching files. To avoid these errors, you can use `!include_try`
instead:

```
!include_try passwords.conf
```

Including a file preserves the context where it's included from.

Example:

```
protocol imap {
  !include imap-settings.conf
}
```

## External Config Files

Due to historical reasons, there are still some config files that are
external to the main `dovecot.conf`, which are typically named `*.conf.ext`.

Example:

* dict_legacy { .. } points to `dovecot-dict-*.conf.ext`.

Although these external config files look similar to the main `dovecot.conf`
file, they have quite a lot of differences in details. Their parsing is done
with a completely different config parser, so things like `filters`,
`$variables`, `!includes` and `<files` don't work.

The external config files are also not loaded by the config process at
startup, but instead they're parsed whenever the value is being used. So the
external passdb/userdb files are loaded by auth process at startup, while
the dict config is loaded by dict process at startup.

Eventually these external config files will hopefully be removed.

## Long lines

It's possible to split the setting values into multiple lines.

```
setting_key = \
  long \
  value
# equivalent to: "long value"
```

All the whitespace between lines is converted to a single space regardless
of how many spaces or tabs are at the beginning of the line or before
the '\'. Even if there is zero whitespace a single space is added.

## Reading Value From File

It's possible to read the value for a setting from a file:

```
key = </path/to/file
```

The value is read exactly as the entire contents of the file. This includes
all the whitespace and newlines. The paths are relative to the currently
parsed config file's directory, similar to how `!include` works. The file is
read immediately whenever parsing the configuration file, so if it changes
afterwards it requires a configuration reload to see the changes. This
functionality is especially useful for reading SSL certificates and keys.

## Variable Expansion

It's possible to refer to other earlier settings as `$SET:name`.

Example:

```
key = value1
key2 = $SET:key value2
# Equivalent to key2 = value1 value2
```

However, you must be careful with the ordering of these in the configuration
file, because the `$SET:variables` are expanded immediately while parsing the
config file and they're not updated later.

See also [[link,settings_variables]].

## Environment Variables

It is possible use `$ENV:name` to expand values from environment.

Expansion only works when it's surrounded by spaces, and is not inside
`"quotes"` or `'quotes'`.

Note that these are also Case Sensitive.

These can also be used for external config files, but you need to list them in
[[setting,import_environment]] so that processes can see them.

For [[link,settings_types_file]] it is better to use `$ENV:` instead of `%{env:}`.
This is because with `$ENV:` the expansion and file reading is done by the config
process, which normally runs as root. With `%{env:}` the expansion is delayed
until the process accessing the setting expands it, but the process may not
have enough permissions to open the file.
