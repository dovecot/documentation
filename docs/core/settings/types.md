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
  settings_types_time:
    hash: time
    text: time
  settings_types_time_msecs:
    hash: millisecond-time
    text: time (milliseconds)
  settings_types_uint:
    hash: unsigned-integer
    text: unsigned integer
  settings_types_url:
    hash: url
    text: URL
---

# Dovecot Settings Types

## String

String settings are typically used with variable expansion to configure how
something is logged. For example [[setting,imap_logout_format]]:

```
imap_logout_format = in=%i out=%o
```

The `#` character and everything after it are comments. Extra spaces and tabs
are ignored, so if you need to use these, put the value inside quotes. The
quote character inside a quoted string is escaped with `\"`:

```
key = "# char, \"quote\", and trailing whitespace  "
```

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

## URL

Special type of [String](#string) setting. Conforms to Uniform Resource
Locators (URL) ([[rfc,1738]]).
