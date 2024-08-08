---
layout: doc
title: Settings Types
dovecotlinks:
  settings_types: Settings Types
  settings_types_boolean:
    hash: boolean
    text: boolean
  settings_types_ip:
    hash: ip-addresses
    text: IP addresses
  settings_types_size:
    hash: size
    text: size
  settings_types_string:
    hash: string
    text: string
  settings_types_string_novar:
    hash: string-without-variables
    text: String without variables
  settings_types_time:
    hash: time
    text: time
  settings_types_time_msecs:
    hash: millisecond-time
    text: time (milliseconds)
  settings_types_uint:
    hash: unsigned-integer
    text: unsigned integer
  settings_types_in_port:
    hash: port-number
    text: Port Number
  settings_types_url:
    hash: url
    text: URL
  settings_types_named_filter:
    hash: named-filter
    text: Named Filter
  settings_types_named_list_filter:
    hash: named-list-filter
    text: Named List Filter
  settings_types_strlist:
    hash: string-list
    text: String List
  settings_types_boollist:
    hash: boolean-list
    text: Boolean List
---

# Dovecot Settings Types

## String

String can contain any character. Strings support [[variable]].

::: tip
If you need the `%` character verbatim you have to escape it as `%%`.
:::

## String without variables

Certain settings require specific variables and thus don't use the default
[[variable]]. For example:

```[dovecot.conf]
imap_logout_format = in=%i out=%o
```

Here the `%i` and `%o` refer to variables specific to the
[[setting,imap_logout_format]] setting.

## Unsigned Integer

Unsigned integer is a number between 0..4294967295, although specific settings
may have additional restrictions.

## Boolean

Boolean settings interpret any value as true, or false.

`yes` and `no` are the recommended values. However, `y` and `1` also
work as `yes`. Whereas, only `no` will work as false.

All these are case-insensitive. Other values give errors.

## Size

The size value type is used in Dovecot configuration to define the amount of
space taken by something, such as a file, cache or memory limit. The size value
type is case insensitive. The following suffixes can be used to define size:

| Suffix | Value |
| ------ | ----- |
| `B` | bytes |
| `K` | kilobytes |
| `M` | megabytes |
| `G` | gigabytes |
| `T` | terabytes |

The values can optionally be followed by "I" or "IB". For example K = KI = KIB.
The size value type is base 2, meaning a kilobyte equals 1024 bytes.

## Time

The Time value is used in Dovecot configuration to define the amount of Time
taken by something or for doing something, such as a sending or downloading
file, processing, and more.

The Time value supports using suffixes of any of the following words:

```
secs, seconds, mins, minutes, hours, days, weeks
```

::: tip Note
So for example, `d`, `da`, `day`, and `days` all mean the same.
:::

## Millisecond Time

Same as [Time](#time), but additionally supports milliseconds (`ms`) precision.

In addition to Time suffixes, adds support for the following words:

```
msecs, mseconds, millisecs, milliseconds
```

## IP Addresses

The IP can be IPv4 address like `127.0.0.1`, IPv6 address without brackets
like `::1`, or with brackets like `[::1]`. The DNS name is looked up once
during config parsing, e.g. `host.example.com`. If a /block is specified,
then it's a CIDR address like `1.2.3.0/24`. If a /block isn't specified, then
it defaults to all bits, i.e. /32 for IPv4 addresses and /128 for IPv6
addresses.

## Port Number

This type is an [[link,settings_types_uint]] with numbers ranging only from `0`
to `65535`.

## URL

Special type of [String](#string) setting. Conforms to Uniform Resource
Locators (URL) ([[rfc,1738]]).

## Named Filter

The settings inside the filter are used only in a specific situation. See
[[link,settings_syntax_named_filters]] for more details.

## Named List Filter

The settings inside the filter are used only in a specific situation. The
filter has a unique name, which can be used to identify it within the list.
See [[link,settings_syntax_named_filters]] for more details.

## String List

The string list type is a list of `key=value` pairs. Each key name is unique
within the list (i.e. giving the same key multiple times overrides the previous
one). The string list is configured similarly to
[[link,settings_syntax_named_filters]]:

```[dovecot.conf]
fs_randomfail_ops {
  read = 100
  write = 50
}
```

## Boolean List

The boolean list type is a list of `key=yes/no` pairs. Each key is unique
within the list (i.e. giving the same key multiple times overrides the previous
one). The boolean list can be configured as a space or comma-separated list,
which replaces the previous boolean  list entirely. For example:

```[dovecot.conf]
mail_plugins = quota imap_quota
mail_plugins = acl,imap_acl # removes quota and imap_quota
```

Quotes are also supported:

doveadm_allowed_commands = "mailbox list" "mailbox create"

The boolean list can also be configured to update an existing boolean list. For
example:

```[dovecot.conf]
mail_plugins = quota acl
protocol imap {
  mail_plugins {
    imap_quota = yes
    imap_acl = yes
  }
}
local 10.0.0.0/24 {
  protocol imap {
    mail_plugins {
      imap_acl = no
    }
  }
}
```
