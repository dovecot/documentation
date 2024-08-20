---
layout: doc
title: Settings Variables
dovecotlinks:
  login_variables:
    hash: login-variables
    text: Login Variables
  settings_variables: Settings Variables
---

# Settings Variables

You can use special variables in several places:

* [[setting,mail_location]] setting and namespace locations
* Static [[link,userdb]] and [[link,auth_passwd_file]] template strings
* [[link,auth_ldap]], [[link,auth_sql]], and [[link,userdb]] query strings
* Log prefix for imap/pop3 process
* Plugin settings

## Global Variables

Global variables that work everywhere are:

| Long Name | Description |
| --------- | ----------- |
| `%%` | '%' character. [[link,shared_mailboxes_percent,Further information about %% variables]] |
| `env:<name>` | Environment variable \<name\>. |
| `system:<name>` | Get a system variable, see [below](#system-variables) for list of supported names. |
| `process:<name>` | Get a process variable, see [below](#process-variables) for list of supported names. |

If [[plugin,var-expand-crypt]] is loaded, these also work globally:

| Long Name | Description |
| --------- | ----------- |
| `encrypt; <parameters>:<field>` | Encrypt field |
| `decrypt; <parameters>:<field>` | Decrypt field |

## System Variables

### `cpu_count`

Number of CPUs available. Works only on Linux and FreeBSD-like systems.

Can be overridden with `NCPU` environment variable.

This needs to be included in [[setting,import_environment]].

### `hostname`

Hostname (without domain). Can be overridden with `DOVECOT_HOSTNAME`
environment variable.

This needs to be included in [[setting,import_environment]].

## Process Variables

### `pid`

Current process ID.

### `uid`

Effective user ID of the current process.

### `gid`

Effective group ID of the current process.

## User Variables

::: tip
See also:
* [Global Variables](#global-variables)
:::

Variables that work nearly everywhere where there is a username:

| Variable | Long Name | Description |
| -------- | --------- | ----------- |
| `%u` | `user` | full username (e.g. user@domain) |
| `%n` | `username` | user part in user@domain, same as `%u` if there's no domain |
| `%d` | `domain` | domain part in user@domain, empty if user with no domain |
| | `session` | session ID for this client connection (unique for 9 years) |
| | `auth_user` | SASL authentication ID (e.g. if master user login is done, this contains the master username). If username changes during authentication, this value contains the original username. Otherwise the same as `%{user}`. |
| | `auth_username` | user part in `%{auth_user}` |
| | `auth_domain` | domain part in `%{auth_user}` |

## Mail Service User Variables

::: tip
See also:
* [Global Variables](#global-variables), and
* [User Variables](#user-variables).
:::

| Variable | Long Name | Description |
| -------- | --------- | ----------- |
| | `service` | imap, pop3, smtp, lda (and doveadm, etc.) |
| `%l` | `local_ip` | local IP address |
| `%r` | `remote_ip` | remote IP address |
| | `userdb:<name>` | Return userdb extra field "name". `%{userdb:name:default}` returns "default" if "name" doesn't exist (not returned if name exists but is empty) |

## Mail User Variables

::: tip
See also:
* [Global Variables](#global-variables),
* [User Variables](#user-variables), and
* [Mail Service User Variables](#mail-service-user-variables).
:::

| Variable | Long Name | Description |
| -------- | --------- | ----------- |
| `%h` | `home` | home directory. Use of `~/` is better whenever possible. |
| | `hostname` | Expands to the hostname setting. Overrides the global `%{hostname}`. |

## Login Variables

::: tip
See also:
* [Global Variables](#global-variables), and
* [User Variables](#user-variables).
:::

| Variable | Long Name | Description |
| -------- | --------- | ----------- |
| | `protocol` | imap, pop3, smtp, lda (and doveadm, etc.)<br/>[[added,variables_login_variables_protocol]] Renamed from `%{service}` variable. |
| | `local_name` | TLS SNI hostname, if given |
| `%l` | `local_ip` | local IP address |
| `%r` | `remote_ip` | remote IP address |
| `%a` | `local_port` | local port |
| `%b` | `remote_port` | remote port |
| | `real_remote_ip` | Same as `%{remote_ip}`, except in proxy setups contains the remote proxy's IP instead of the client's IP |
| | `real_local_ip` | Same as `%{local_ip}`, except in proxy setups contains the local proxy's IP instead of the remote proxy's IP |
| | `real_remote_port` | Similar to `%{real_rip}` except for port instead of IP |
| | `real_local_port` | Similar to `%{real_lip}` except for port instead of IP |
| `%m` | `mechanism` | [[link,sasl]], e.g., PLAIN |
| `%c` | `secured` | "TLS" with established SSL/TLS connections, "TLS handshaking", or "TLS [handshaking]: error text" if disconnecting due to TLS error. "secured" with secured connections (see: [[setting,ssl]]). Otherwise empty. |
| `%k` | `ssl_security` | TLS session security string. If HAProxy is configured and it terminated the TLS connection, contains "(proxied)". |
| | `ssl_ja3` | [[link,ssl_ja3]] composed from TLS Client Hello. |
| | `ssl_ja3_hash` | MD5 hash from [[link,ssl_ja3]] composed from TLS Client Hello. |
| `%e` | `mail_pid` | PID for process that handles the mail session post-login |
| | `original_user` | Same as `%{user}`, except using the original username the client sent before any changes by auth process. With master user logins (also with [[setting,auth_master_user_separator]] based logins),this contains only the original master username. |
| | `original_username` | Same as `%{username}`, except using the original username |
| | `original_domain` | Same as `%{domain}`, except using the original username  |
| | `listener` | Socket listener name as specified in config file, which accepted the client connection. |
| | `passdb:<name>` | Return passdb extra field "name". `%{passdb:name:default}` returns "default" if "name" doesn't exist (not returned if name exists but is empty). Note that this doesn't work in passdb/userdb ldap's pass_attrs or user_attrs. |
| | `passdb:forward_<name>` | Used by proxies to pass on extra fields to the next hop, see [[link,auth_forward_fields]]. |

## Authentication Variables

::: tip
See also:
* [Global Variables](#global-variables), and
* [User Variables](#user-variables).
:::

| Variable | Long Name | Description |
| -------- | --------- | ----------- |
| | `protocol` | imap, pop3, smtp, lda (and doveadm, etc.)<br/>[[added,variables_auth_variables_protocol]] Renamed from `%{service}` variable. |
| | `domain_first` | For "username@domain_first@domain_last" style usernames |
| | `domain_last` | For "username@domain_first@domain_last" style usernames |
| | `local_name` | TLS SNI hostname, if given |
| `%l` | `local_ip` | local IP address |
| `%r` | `remote_ip` | remote IP address |
| `%a` | `local_port` | local port |
| `%b` | `remote_port` | remote port |
| | `real_remote_ip` | Same as `%{remote_ip}`, except in proxy setups contains the remote proxy's IP instead of the client's IP |
| | `real_local_ip` | Same as `%{local_ip}`, except in proxy setups contains the local proxy's IP instead of the remote proxy's IP |
| | `real_remote_port` | Similar to `%{real_rip}` except for port instead of IP |
| | `real_local_port` | Similar to `%{real_lip}` except for port instead of IP |
| `%p` | `client_pid` | process ID of the authentication client |
| | `session_pid` | For user logins: The PID of the IMAP/POP3 process handling the session. |
| `%m` | `mechanism` | [[link,sasl]], e.g., PLAIN |
| `%w` | `password` | cleartext password from cleartext authentication mechanism |
| `%c` | `secured` | "TLS" with established SSL/TLS connections, "secured" with secured connections (see: [[setting,ssl]]). Otherwise empty. |
| | `ssl_ja3_hash` | MD5 hash from JA3 string composed from TLS Client Hello. |
| `%k` | `cert` | "valid" if client had sent a valid client certificate, otherwise empty. |
| | `login_user` | For master user logins: Logged in user@domain |
| | `login_username` | For master user logins: Logged in user |
| | `login_domain` | For master user logins: Logged in domain |
| | `master_user` | For master user logins: The master username |
| | `original_user` | Same as `%{user}`, except using the original username the client sent before any changes by auth process |
| | `original_username` | Same as `%{username}`, except using the original username |
| | `original_domain` | Same as `%{domain}`, except using the original username |
| | `passdb:<name>` | Return passdb extra field "name". `%{passdb:name:default}` returns "default" if "name" doesn't exist (not returned if name exists but is empty). Note that this doesn't work in passdb/userdb ldap's pass_attrs or user_attrs. |
| | `userdb:<name>` | Return userdb extra field "name". Note that this can also be  used in passdbs to access any userdb_\* extra fields added by previous passdb lookups. `%{userdb:name:default}` returns "default" if "name" doesn't exist (not returned if name exists but is empty). Note that this doesn't work in passdb/userdb ldap's pass_attrs or user_attrs. |
| | `client_id` | If [[setting,imap_id_retain]] is enabled this variable is populated with the client ID request as IMAP arglist. For directly logging the ID see the [[event,imap_id_received]] event. |
| | `passdb:forward_<name>` | Used by proxies to pass on extra fields to the next hop, see [[link,auth_forward_fields]]. |
| `%!` | | Internal ID number of the current passdb/userdb. |

## Modifiers

You can apply a modifies for each variable (e.g. `%Us` or `%U{service}` = POP3):

* `%L` - lowercase
* `%U` - uppercase
* `%E` - escape '"', "'" and '\\' characters by inserting '\\' before them.
  Note that variables in SQL queries are automatically escaped, you don't need
  to use this modifier for them.
* `%X` - parse the variable as a base-10 number, and convert it to base-16
  (hexadecimal)
* `%R` - reverse the string
* `%N` - take a 32bit hash of the variable and return it as hex. You can also
  limit the hash value. For example `%256Nu` gives values 0..ff. You might want
  padding also, so `%2.256Nu` gives 00..ff.

  * This is "New Hash", based on MD5 to give better distribution of values (no
    need for any string reversing kludges either).

* `%H` - Same as `%N`, but use "old hash" (not recommended anymore)

  * `%H` hash function is a bit bad if all the strings end with the same text,
    so if you're hashing usernames being in user@domain form, you probably
	want to reverse the username to get better hash value variety, e.g.
	`%3RHu`.

* `%{<hash algorithm>;rounds=<n>,truncate=<bits>,salt=s,format=<hex|hexuc|base64|base64url>:field}`

  * Generic hash function that outputs a hex (by default) or `base64` value.
    Hash algorithm is any of the supported ones, e.g. `md5`, `sha1`, `sha256`.
    Also "pkcs5" is supported using `SHA256`.

    Example:

    ```
    %{sha256:user} or %{md5;truncate=32:user}.
	```

* `%M` - return the string's MD5 sum as hex.
* `%D` - return "sub.domain.org" as "sub,dc=domain,dc=org" (for LDAP queries)
* `%T` - Trim trailing whitespace

You can take a substring of the variable by giving optional offset followed by
'.' and width after the '%' character. For example `%2u` gives first two
characters of the username. `%2.1u` gives third character of the username.

If the offset is negative, it counts from the end, for example `%-2.2i` gives
the UID mod 100 (last two characters of the UID printed in a string). If a
positive offset points outside the value, empty string is returned, if a
negative offset does then the string is taken from the start.

If the width is prefixed with zero, the string isn't truncated, but only padded
with '0' character if the string is shorter.

::: warning
`%04i` may return "0001", "1000" and "12345". `%1.04i` for the same string
would return "001", "000" and "2345".
:::

If the width is negative, it counts from the end.

::: warning
`%0.-2u` gives all but the last two characters from the username.
:::

The modifiers are applied from left-to-right order, except the substring is
always taken from the final string.

## Conditionals

It's possible to use conditionals in variable expansion. The generic syntax is

```
%{if;value1;operator;value2;value-if-true;value-if-false}
```

Each of the value fields can contain another variable expansion, facilitating
for nested ifs. Both `%f` and `%{field}` syntaxes work.

Escaping is supported, so it's possible to use values like `\%`, `\:` or `\;`
that expand to the literal `%`, `:` or `;` characters. Values can have spaces
and quotes without any special escaping.

Note that currently unescaped `:` cuts off the if statement and ignores
everything after it.

The following operators are supported:

| Operator | Explanation |
| -------- | ----------- |
| `==` | NUMERIC equality |
| `!=` | NUMERIC inequality |
| `<` | NUMERIC less than |
| `<=` | NUMERIC less or equal |
| `>` | NUMERIC greater than |
| `>=` | NUMERIC greater or equal |
| `eq` | String equality |
| `ne` | String inequality |
| `lt` | String inequality |
| `le` | String inequality |
| `gt` | String inequality |
| `ge` | String inequality |
| `*` | Wildcard match (mask on value2) |
| `!*` | Wildcard non-match (mask on value2) |
| `~` | Regular expression match (pattern on value2, extended POSIX) |
| `!~` | String inequality (pattern on value2, extended POSIX) |

Examples:

```
# If %u is "testuser", return "INVALID". Otherwise return %u uppercased.
%{if;%u;eq;testuser;INVALID;%Uu}

# Same as above, but for use nested IF just for showing how they work:
%{if;%{if;%u;eq;testuser;a;b};eq;a;INVALID;%Uu}
```
