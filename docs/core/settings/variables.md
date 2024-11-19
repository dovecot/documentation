---
layout: doc
title: Settings Variables
dovecotlinks:
  settings_variables: Settings Variables
  settings_variables_distribution_variables:
    hash: distribution-variables
    text: Distribution Variables
  settings_variables_mail_user_variables:
    hash: mail-user-variables
    text: Mail User Variables
  login_variables:
    hash: login-variables
    text: Login Variables
  settings_variables_modifiers:
    hash: modifiers
    text: Variable Modifiers
  conditionals:
    hash: conditionals
    text: Conditionals
---

# Settings Variables

You can use special variables in several places:

* All settings, except of type [[link,settings_types_string_novar]]. Most
  commonly used by [[link,mail_location]].
* Static [[link,userdb]] and [[link,auth_passwd_file]] template strings
* [[link,auth_ldap]], [[link,auth_sql]], and [[link,userdb]] query strings
* Log prefix for imap/pop3 process

## Variable expansion syntax

[[changed,var_expand]]

We have introduced an entirely new variable expansion syntax.
See [[link,var_expand]] for in-depth details how it works.

The basic syntax is `%{variable (| filter | filter ...)}`, which means that most existing
variables work, but there are some changes, so check variable usage carefully when converting old syntax.

The simple case of just getting a value of variable is `%{variable}`.
These can be in middle of strings.

Another syntax is `%{provider:variable}`, where the value is provided by
a provider. There are global providers, and context-specific providers.

A variable can be then filtered with various filters, such as `%{variable | upper}` to get
uppercase representation of variable. You can chain as many filters as you need.

Filters can accept parameters, both positional and named. E.g. `%{literal('\r\n\')}` will expand
to CR LF. `%{user | substr(0, 1)}` will take first character of username. Example of named parameters
would be `%{user | md5(rounds=1000,salt='pepper')}`

For escaping:
 * `%%{text}` emits `%{text}`
 * `%%%{text}` emits `%%{text}`
 * `%{concat('%', variable)}` emits `%<expanded variable>`
 * Otherwise `%` doesn't need any escaping. `%%` emits the same `%%`.

Filters accept strings, numbers and variables as parameters. Parameters can be positional or
named key-value pairs. Key names cannot be variables.
The left side of pipe character (`|`) is provided as input to a filter. Some filters can be used
in place of variables, e.g. lookup, literal and if.

When value is missing or empty, you can use the `default` filter to provide value. Missing variables
will cause errors and must be negated with default. This does not apply to all providers, some
providers return empty when value is missing.

If the last filter would output binary data, the data is encoded with `hexlify` filter by default.
To avoid this, you can use `text` filter, which will sanitize the input and mark it as text.

The new syntax also supports simple maths, you can do one operation. E.g. `%{port + 1000}`.
Addition, substraction, multiplication, division and modulo operations are supported for now.

A special case for modulo operation is that it can be applied to binary input, e.g. `sha1 % 256`.
The input is treated as 64-bit unsigned number and modulo is taken from that.

All strings must be encapsulated with `"` or `'`, and you can escape them using `\\` within string.
Numbers when used as parameters must be provided without quotes.

## List of filters

All parameters are strings unless stated otherwise.
If parameter is `any`, it accepts both numbers and strings.
Boolean type is `0` for false and `1` for true.

Filters that have `any` in input and output mean that they will accept bytes or string, and the result
will be bytes or strings, depending on the input. The types indicated as interpreted types, as everything
is stored as strings internally.

Bytes output type indicates that the output will be tagged as binary output. Subsequent filters can change this.

| Filter | Input | Output | Description |
| ------ | ----- | ------ | ----------- |
| base64(pad=boolean, url=boolean) | Bytes | String | Base64 encode given input, defaults to pad and not url scheme. |
| benumber | Bytes | Number | Convert big-endian encoded input into a number. |
| concat(any, any...) | Bytes | Bytes | Concatenates input with value(s). Numbers are coerced to strings. Input is optional. |
| default(value) | String | String | Replace empty or missing input with value. Clears missing variable error. If no value is provided, empty string is used. |
| domain | String | String | Provides domain part of user@domain value. |
| hash(method, rounds=number, salt=string) | Bytes | Bytes | Returns raw hash from input using given hash method. Rounds and salt are optional. |
| hexlify(width) | Bytes | String | Convert bytes into hex with optional width, truncates or pads up to width. |
| hex(width) | Number | Number | Convert base-10 number to base-16 number. If width is specified the result is truncated or padded with 0 to width. Negative width is applied after number. |
| if(left,operator,right,true,false) | String | String | Evaluates given comparison and returns true or false value. See [conditionals](#conditionals). |
| if(operator,right,true,false) | String | String | Evaluates given comparison against input value and retuns true or false value. |
| index(separator, nth) | String | String | Returns nth element from separator separated string. Zero based. Negative values are looked relative to end of list. |
| ldap_dn | String | String | Converts `domain.com` to `dc=domain,dc=com`. |
| lenumber | Bytes | Number| Convert little-endian encoded input into a number. |
| lfill(width, filler) | Any | Any | Pads value from left with filler until length is width. Default filler is `0`. |
| list(separator) | String | String | Converts tab-escaped list into separator separated list. Defaults to `,`. |
| literal(string) | None | String | Expands into literally the value. If variable is used, works like lookup. Input is ignored. |
| lookup(name) | None | String | Lookup var from table. If var is variable, the name is taken from variable's contents. Input is ignored. |
| lower | String | String | Lowercases input. |
| md5(rounds=number, salt=string) | Bytes | Bytes | Alias for hash with method md5. |
| regexp(expression, replacement) | String | String |Performs regular expression replacement using [POSIX Extended Regular Expression syntax](https://www.gnu.org/software/findutils/manual/html_node/find_html/posix_002dextended-regular-expression-syntax.html). Supports up to 9 capture groups. |
| reverse | Any | Any | Reverse input bytes. |
| rfill(width, filler) | Any | Any | Pads value to right with filler until length is width. Default filler is `0`. |
| sha1(rounds=number, salt=string) | Bytes | Bytes | Alias for hash with method sha1. |
| sha256(rounds=number, salt=string) | Bytes | Bytes | Alias for hash with method sha256. |
| sha384(rounds=number, salt=string) | Bytes | Bytes | Alias for hash with method sha384. |
| sha512(rounds=number, salt=string) | Bytes | Bytes | Alias for hash with method sha512. |
| substr(offset, length) | Any | Any | Extracts a substring out of input and returns it. First character is at offset zero. If offset is negative, starts that far back from the end of the string. If length is omitted, returns everything through the end of the string. If length is negative, leaves that many characters off the end of the string. |
| text | Bytes | String | Sanitize input into text and clear binary tag. |
| truncate(len, bits=number) | Bytes | Bytes | Truncate to len bytes, or number of bits. The parameters are mutually exclusive. |
| unbase64(pad=boolean, url=boolean) | String | Bytes | Base64 decode given input, defaults to pad and not url scheme. |
| unhex | String | Number | Convert base-16 number to base-10 number. |
| unhexlify | String | Bytes | Convert hex encoded input into bytes. |
| upper | String | String | Uppercases input. |
| username | String | String | Provides user part of user@domain value. |

If [[plugin,var-expand-crypt]] is loaded, these filters are registered as well.

| Filter | Input | Output | Description |
| ------ | ----- | -----  | ----------- |
| decrypt(algorithm=string,key=string,iv=string,raw=boolean) | Bytes/String | Bytes | Decrypts input with given parameters. If raw is `0`, expects '$' separated value of IV and encrypted data. |
| encrypt(algorithm=string,key=string,iv=string,raw=boolean) | Bytes | Bytes/String | Encrypts input with given parameters. If raw is `0`, outputs `$` separated value of IV and encrypted data. |

## Global providers

Global providers that work everywhere are:

| Long Name | Description |
| --------- | ----------- |
| `date:<name>`    | Get a date field, available keys are `year`, `month`, `day`. |
| `dovecot:<name>` | Get a distribution variable, see [below](#distribution-variables) for a list of supported names. |
| `env:<name>` | Environment variable \<name\>. Returns empty string if unset. |
| `event:<name>`   | Get an event field. Returns empty string if no such field is found from event. |
| `process:<name>` | Get a process variable, see [below](#process-variables) for list of supported names. |
| `system:<name>` | Get a system variable, see [below](#system-variables) for list of supported names. |
| `time:<name>`    | Get a time field, available keys are `hour`, `min`, `minute`, `sec`, `second` and `usec`. |
| `generate:<name>`    | Generate a GUID/UUID. Available keys are `guid`, `guid128`, `uuid`, `uuid:record`, `uuid:compact` and `uuid:microsoft`. |

## System Variables

### `cpu_count`

Number of CPUs available. Works only on Linux and FreeBSD-like systems.

Can be overridden with `NCPU` environment variable.

This needs to be included in [[setting,import_environment]].

### `hostname`

Hostname (without domain). Can be overridden with `DOVECOT_HOSTNAME`
environment variable.

This needs to be included in [[setting,import_environment]].

### `os`

OS name reported by `uname()` call. (Similar to `uname -s` output.)

### `os-version`

OS version reported by `uname()` call. (Similar to `uname -r` output.)

## Process Variables

### `pid`

Current process ID.

### `uid`

Effective user ID of the current process.

### `gid`

Effective group ID of the current process.

## Distribution Variables

### `name`

Name of distributed package. (Default: `Dovecot`)

### `version`

Dovecot version.

### `support-url`

Support webpage set in Dovecot distribution. (Default:
https://www.dovecot.org/)

### `support-email`

Support email set in Dovecot distribution. (Default: `dovecot@dovecot.org`)

### `revision`

Short commit hash of Dovecot git source tree HEAD. (Same as the commit hash
reported in `dovecot --version`.)

## User Variables

::: tip
See also:
* [Global Variables](#global-variables)
:::

Variables that work nearly everywhere where there is a username:

| Variable | Description |
| -------- | ----------- |
| `user` | Full username (e.g. user@domain) |
| `session` | Session ID for this client connection (unique for 9 years) |
| `auth_user` | SASL authentication ID (e.g. if master user login is done, this contains the master username). If username changes during authentication, this value contains the original username. Otherwise the same as `user`. |

## Mail Service User Variables

::: tip
See also:
* [Global Variables](#global-variables), and
* [User Variables](#user-variables).
:::

| Variable | Description |
| -------- | ----------- |
| `service` | imap, pop3, smtp, lda (and doveadm, etc.) |
| `local_ip` | local IP address |
| `remote_ip` | remote IP address |
| `userdb:<name>` | Return userdb extra field "name". |

## Mail User Variables

::: tip
See also:
* [Global Variables](#global-variables),
* [User Variables](#user-variables), and
* [Mail Service User Variables](#mail-service-user-variables).
:::

| Variable | Description |
| -------- | ----------- |
| `home` | home directory. Use of `~/` is better whenever possible. |
| `hostname` | Expands to the hostname setting. Overrides the global `hostname`. |

## Login Variables

::: tip
See also:
* [Global Variables](#global-variables), and
* [User Variables](#user-variables).
:::

| Variable | Description |
| -------- | ----------- |
| `protocol` | imap, pop3, smtp, lda (and doveadm, etc.)<br/>[[added,variables_login_variables_protocol]] Renamed from `service` variable. |
| `local_name` | TLS SNI hostname, if given. |
| `local_ip` | Local IP address. |
| `remote_ip` | Remote IP address. |
| `local_port` | Local port. |
| `remote_port` | Remote port. |
| `real_remote_ip` | Same as `remote_ip`, except in proxy setups contains the remote proxy's IP instead of the client's IP. |
| `real_local_ip` | Same as `local_ip`, except in proxy setups contains the local proxy's IP instead of the remote proxy's IP. |
| `real_remote_port` | Similar to `real_remote_ip` except for port instead of IP. |
| `real_local_port` | Similar to `real_local_ip` except for port instead of IP. |
| `mechanism` | [[link,sasl]], e.g., PLAIN. |
| `secured` | "TLS" with established SSL/TLS connections, "TLS handshaking", or "TLS [handshaking]: error text" if disconnecting due to TLS error. "secured" with secured connections (see: [[setting,ssl]]). Otherwise empty. |
| `ssl_security` | TLS session security string. If HAProxy is configured and it terminated the TLS connection, contains "(proxied)". |
| `ssl_ja3` | [[link,ssl_ja3]] composed from TLS Client Hello. |
| `ssl_ja3_hash` | MD5 hash from [[link,ssl_ja3]] composed from TLS Client Hello. |
| `mail_pid` | PID for process that handles the mail session post-login. |
| `original_user` | Same as `user`, except using the original username the client sent before any changes by auth process. With master user logins (also with [[setting,auth_master_user_separator]] based logins),this contains only the original master username. |
| `listener` | Socket listener name as specified in config file, which accepted the client connection. |
| `owner_user` | For shared storage this is the `user` variable of the owner, otherwise it is the same as `user`.<br />[[added,variables_owner_user_added]] |
| `passdb:<name>` | Return passdb extra field "name". |
| `passdb:forward_<name>` | Used by proxies to pass on extra fields to the next hop, see [[link,auth_forward_fields]]. |

## Authentication Variables

::: tip
See also:
* [Global Variables](#global-variables), and
* [User Variables](#user-variables).
:::

| Variable | Description |
| -------- | ----------- |
| `protocol` | imap, pop3, smtp, lda (and doveadm, etc.)<br/>[[added,variables_auth_variables_protocol]] Renamed from `service` variable. |
| `domain_first` | For "username@domain_first@domain_last" style usernames.|
| `domain_last` | For "username@domain_first@domain_last" style usernames. |
| `local_name` | TLS SNI hostname, if given. |
| `local_ip` | Local IP address. |
| `remote_ip` | Remote IP address |
| `local_port` | Local port. |
| `remote_port` | Remote port. |
| `real_remote_ip` | Same as `remote_ip`, except in proxy setups contains the remote proxy's IP instead of the client's IP. |
| `real_local_ip` | Same as `local_ip`, except in proxy setups contains the local proxy's IP instead of the remote proxy's IP. |
| `real_remote_port` | Similar to `real_remote_ip` except for port instead of IP. |
| `real_local_port` | Similar to `real_local_ip` except for port instead of IP. |
| `client_pid` | Process ID of the authentication client. |
| `session_pid` | For user logins: The PID of the IMAP/POP3 process handling the session. |
| `mechanism` | [[link,sasl]], e.g., PLAIN. |
| `password` | Cleartext password from cleartext authentication mechanism. |
| `secured` | "TLS" with established SSL/TLS connections, "secured" with secured connections (see: [[setting,ssl]]). Otherwise empty. |
| `ssl_ja3_hash` | MD5 hash from JA3 string composed from TLS Client Hello. |
| `cert` | "valid" if client had sent a valid client certificate, otherwise empty. |
| `login_user` | For master user logins: Logged in user@domain. |
| `master_user` | For master user logins: The master username. |
| `original_user` | Same as `user`, except using the original username the client sent before any changes by auth process. |
| `passdb:<name>` | Return passdb extra field "name". |
| `userdb:<name>` | Return userdb extra field "name". Note that this can also be used in passdbs to access any userdb_\* extra fields added by previous passdb lookups. |
| `client_id` | If [[setting,imap_id_retain]] is enabled this variable is populated with the client ID request as IMAP arglist. For directly logging the ID see the [[event,imap_id_received]] event. |
| `passdb:forward_<name>` | Used by proxies to pass on extra fields to the next hop, see [[link,auth_forward_fields]]. |
| `id` | Internal ID number of the current passdb/userdb. |

## Conditionals

The following operators are supported:

| Operator | Explanation |
| -------- | ----------- |
| `==` | Numeric equality. |
| `!=` | Numeric inequality. |
| `<` | Numeric less than. |
| `<=` | Numeric less or equal. |
| `>` | Numeric greater than. |
| `>=` | Numeric greater or equal. |
| `eq` | String equality. |
| `ne` | String inequality. |
| `lt` | String less than. |
| `le` | String less or equal. |
| `gt` | String greater than. |
| `ge` | String greater or equal. |
| `*` | Wildcard match (mask on value2). |
| `!*` | Wildcard non-match (mask on value2). |
| `~` | Regular expression match (pattern on value2, [POSIX Extended Regular Expression syntax](https://www.gnu.org/software/findutils/manual/html_node/find_html/posix_002dextended-regular-expression-syntax.html)). |
| `!~` | String inequality (pattern on value2, [POSIX Extended Regular Expression syntax](https://www.gnu.org/software/findutils/manual/html_node/find_html/posix_002dextended-regular-expression-syntax.html)). |

Examples:

```
# If %{user} is "testuser", return "INVALID". Otherwise return %{user} uppercased.
%{user | if ("=", "testuser, "invalid", user) | upper }
```
