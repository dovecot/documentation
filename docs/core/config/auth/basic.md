---
layout: doc
title: Basic Configuration
---

# Basic Configuration

This page highlights some common authentication-related settings that
may need to be set on your system.

## General Settings

### `auth_mechanisms`

[[setting,auth_mechanisms,plain login]]

Enables the `PLAIN` and `LOGIN` authentication mechanisms.

The `LOGIN` mechanism is obsolete, but still used by old clients.

### `auth_verbose`

[[setting,auth_verbose,yes]]

Log a line for each authentication attempt failure.

### `auth_verbose_passwords`

[[setting,auth_verbose_passwords,sha1:6]]

Log the password hashed and truncated for failed authentication attempts.

For example the SHA1 hash for "pass" is
`9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684` but because of the setting of `:6`
we only log `9d4e1e`.

This can be useful for detecting brute force authentication attempts without
logging the users' actual passwords.

### Authentication Penalty

See [[link,auth_penalty]].

### `auth_cache_size`

[[setting,auth_cache_size,100M]]

Specifies the amount of memory used for authentication caching (passdb
and userdb lookups).

### `imap_id_retain`

[[setting,imap_id_retain,yes]]

If `imap_id_retain=yes`, imap-login will send the IMAP ID string to auth
process.

The variable `%{client_id}` will expand to the IMAP ID in the auth process.
The ID string is also sent to the next hop when proxying.

This allows passing the ID string to [[link,auth_policy]] requests

## Authentication After Proxies

This section describes authentication tactics that can be used if an
architecture is used where an edge Proxy authenticates a user and then
redirects to an internal Backend.

::: tip Note
Proxy already verifies the authentication (in the reference Dovecot
architecture; password has been switched to a master password at this
point), so we don't really need to do it again. We could, in fact, even avoid
the password checking entirely, but for extra security it's still done in
this document.
:::

### `auth_mechanisms`

[[setting,auth_mechanisms,plain login]]

Enables the `PLAIN` and `LOGIN` authentication mechanisms.

The `LOGIN` mechanism is obsolete, but still used by some older clients.

### Authentication Penalty

See [[link,auth_penalty]] for how to disable authentication penalty.
The proxy already handled this.

### `auth_cache_size`

[[setting,auth_cache_size,100M]]

Specifies the amount of memory used for authentication caching (passdb and
userdb lookups).

### `login_trusted_networks`

[[setting,login_trusted_networks,10.0.0.0/24]]

Space-separated list of IP/network ranges that contain the Dovecot Proxies.
This setting allows Proxies to forward the client's original IP address and
session ID to the Backends.

### `mail_max_userip_connections`

[[setting,mail_max_userip_connections,10]]

Maximum number of simultaneous IMAP4 or POP3 connections allowed for
the same user from the same IP address (`10` = 10 IMAP + 10 POP3).

### SSL

[[setting,ssl,no]], [[setting,auth_allow_cleartext,yes]]

`Proxy` already decrypted the SSL connections. The Backends
will always see only unencrypted connections (unless internal connections
are also configured to use SSL).
