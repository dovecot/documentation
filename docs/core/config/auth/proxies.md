---
layout: doc
title: Proxy passdb
dovecotlinks:
  authentication_proxies: proxy passdb
  auth_forward_fields:
    hash: forwarding-fields
    text: forwarding fields
---

# Proxy passdb

Dovecot supports proxying IMAP, POP3, [[link,submission]], [[link,lmtp]],
and [[link,managesieve]] connections to other hosts.

The proxying can be done for all users, or only for some specific users. There
are two ways to do the authentication:

1. Forward the password to the remote server. The proxy may or may not perform
   authentication itself. This requires that the client uses only cleartext
   authentication, or alternatively the proxy has access to users' passwords in
   cleartext.

2. Let Dovecot proxy perform the authentication and login to remote server
   using the proxy's [[link,auth_master_users]]. This allows client
   to use also non-cleartext authentication.

The proxy is configured pretty much the same way as [[link,auth_referral]],
with the addition of `proxy` field.

## Fields

### `proxy`

Enables the proxying.

Either this or `proxy_maybe` is required.

### `proxy_maybe`

Enables the proxying.

Either this or `proxy` is required.

`proxy_maybe` can be used to implement "automatic proxying". If the
proxy destination matches the current connection, the user gets logged in
normally instead of being proxied. If the same happens with `proxy`, the
login fails with `Proxying loops` error.

* `proxy_maybe` with LMTP require.
* `proxy_maybe` with `host=<dns name>` requires.
* `auth_proxy_self` setting in `dovecot.conf` can be used to specify extra
  IPs that are also considered to be the proxy's own IPs.

### `proxy_always`

Can be used with `proxy_maybe` to conditionally do proxying to specified
remote host (host isn't self) or to let cluster assign a backend host (host
is self).

Basically, this setting just always sends the `proxy` extra field to login
process, but not necessarily the host.

Useful when dividing users across multiple clusters.

### `host=<s>`

The destination server's IP address.

This field is required.

### `source_ip=<s>`

The source IP address to use for outgoing connections.

### `port=<s>`

The destination server's port. The default is `143` with IMAP and `110`
with POP3.

### `protocol=<s>`

The protocol to use for the connection to the destination server. This
field is currently only relevant for LMTP: it can be used to select
either `lmtp` or `smtp`.

### `destuser=s`

Tell client to use a different username when logging in.

### `proxy_mech=<s>`

Tell client to use this SASL authentication mechanism when logging in.

### `proxy_timeout=<time_msecs>`

Abort connection after this much time has passed.

This overrides the default [[setting,login_proxy_timeout]].

This setting applies only to proxying via login processes, not to lmtp or
doveadm processes.

### `proxy_nopipelining`

Don't pipeline IMAP commands. This is a workaround for broken IMAP servers
that hang otherwise.

### `proxy_not_trusted`

IMAP/POP3 proxying never sends the `ID/XCLIENT` command to remote.

## SSL

You can use SSL/TLS connection to destination server by returning:

* [[setting,ssl,yes]]

  Use SSL and require a valid verified remote certificate.

  ::: warning
  Unless used carefully, this is an insecure setting!
  The only way to use this securely is to only use and allow your own private
  CA's certs; anything else is exploitable by a man-in-the-middle attack.
  :::

  ::: info NOTE
  Login processes don't currently use [[setting,ssl_client_ca_dir]] or
  [[setting,ssl_client_ca_file]] settings for verifying the remote certificate,
  mainly because login processes can't really read the files chrooted. You can
  instead use [[setting,ssl_client_ca]].
  :::

  ::: warning
  doveadm proxying doesn't support SSL/TLS currently - any ssl/starttls
  extra field is ignored.
  :::

* `ssl=any-cert`: Use SSL, but don't require a valid remote certificate.

* `starttls=yes`: Use STARTTLS command instead of doing SSL handshake
  immediately after connected.

* `starttls=any-cert`: Combine starttls and `ssl=any-cert`.

Additionally you can also tell Dovecot to send SSL client certificate to the
remote server using [[setting,ssl_client_cert]] and [[setting,ssl_client_key]]
settings in `dovecot.conf`.

Set [[setting,login_trusted_networks]] to point to the proxies in the
backends. This way you'll get the clients' actual IP addresses logged instead
of the proxy's.

The destination servers don't need to be running Dovecot, but you should make
sure that the Dovecot proxy doesn't advertise more capabilities than the
destination server can handle.

For IMAP you can do this by changing [[setting,imap_capability]].

For POP3 you'll have to modify Dovecot's sources for now
(`src/pop3/capability.h`).

Dovecot also automatically sends updated untagged CAPABILITY reply if it
detects that the remote server has different capabilities than what it
already advertised to the client, but some clients simply ignore the
updated CAPABILITY reply.

## Source IPs

If your proxy handles a lot of connections `(~64k)` to the same destination
IP, you may run out of TCP ports. The only way to work around this is to use
either multiple destination IPs or ports, or multiple source IPs.

Multiple source IPs can be easily used by adding them to 
[[setting,login_source_ips]]. You can also use hostnames which expand to
multiple IPs.

By prefixing the setting with `?` (e.g.
[[setting,login_source_ips,?proxy-sources.example.com]]) Dovecot will use
only those IPs that actually exist in the server, allowing you to share
the same config file with multiple servers.

It's probably better not to include the server's default outgoing IP
address in the setting, as explained here:
https://idea.popcount.org/2014-04-03-bind-before-connect/.

## Disconnection Delay

To avoid reconnection load spikes when a backend server dies, you can tell
proxy to spread the client disconnections over a longer time period (after the
server side of the connection is already disconnected).

[[setting,login_proxy_max_disconnect_delay]] controls this (disabled by
default).

## Forwarding Fields

You can forward arbitrary variables by returning them prefixed with
`forward_`.

Dovecot will use a protocol-dependent extension to forward these
variables to the next hop. The next hop imports these to the auth request as
passdb extra fields, so they are visible in, e.g.,
`%{passdb:forward_variable}`.

If the proxying continues, all these fields are further forwarded to the next
hop again.

This feature requires that the sending host is in
[[setting,login_trusted_networks]].

See [[link,forwarding_parameters]] for more details on how this is implemented
for different protocols, which includes limits to the key and value lengths
and counts.

::: info Note
Most importantly the IMAP ID command restricts the forward key length
to just 20 bytes (excluding `forward_` prefix). Larger keys are silently
dropped.
:::

## Moving Users Between Backends/Clusters

A safe way to move users from one cluster to another is to do it like:

* Set `delay_until=<timestamp>` [[link,passdb_extra_fields]] where
  `<timestamp>` is the current timestamp plus some seconds into future (e.g.
  31s). You may also want to append, e.g., +5 for some load balancing if a
  lot of users are moved at once.
* Set `host=<new host>` [[link,passdb_extra_fields]]. This update
  should be atomic together with the `delay_until` field.
* Use [[doveadm,kick]] to kick the user's
  existing connections.

  * The processes may still continue running in the backend for a longer time.
    If you want to be absolutely sure, you could also run a script to `kill
    -9` all processes for the user in the backend. This of course has its own
    problems.

The idea here is that while the user's connections are being kicked and the
backend processes are finishing up and shutting down, new connections are being
delayed in the proxy. This delay should be long enough that the user's existing
processes are expected to die, but not so large that clients get connection
timeouts. A bit over 30 seconds is likely a good value. Once the
`delay_until` timestamp is reached, the connections continue to the new host.

If you have a lot of users, it helps to group some of them together and do the
`host/delay_until` updates on a per-group basis rather than per-user basis.

## ID Command Forwarding

If you want to forward, for some reason, the IMAP ID command provided by the
client, set [[setting,imap_id_retain,yes]].

This will also enable `client_id` variable in variable expansions for auth
requests, which will contain the ID command as IMAP arglist.

## Password Forwarding

If you don't want proxy itself to do authentication, you can configure it to
succeed with any given password. You can do this by returning an empty
password and `nopassword` field.

## Master Password

This way of forwarding requires the destination server to support master user
feature. The users will be normally authenticated in the proxy and the common
proxy fields are returned, but you'll need to return two fields specially:

* `master=<s>`: This contains the master username (e.g. proxy). It's used as
  SASL authentication ID.

  * Alternatively you could return `destuser=user*master` and set
    [[setting,auth_master_user_separator,*]].

* `pass=<s`>: This field contains the master user's password.

See [[link,auth_master_users]] for more information how to configure this.

## OAuth2 Forwarding

If you want to forward [[link,auth_oauth2]] tokens, return field
`proxy_mech=%m` as extra field.

## Examples

### Password Forwarding with Static DB

See [[link,auth_staticdb]].

### Password Forwarding with SQL

Create the SQL table:

```sql
CREATE TABLE proxy (
    user varchar(255) NOT NULL,
    host varchar(16) default NULL,
    destuser varchar(255) NOT NULL default '',
    PRIMARY KEY  (user)
);
```

Insert data to SQL corresponding your users.

Working data could look like this:

| user | host | destuser |
| john |192.168.0.1 | |
| joe | 192.168.0.2 | joe@example.com |

::: code-group
```[dovecot.conf]
# If you want to trade a bit of security for higher performance, change
# these settings:
service imap-login {
  service_count = 0
}
service pop3-login {
  service_count = 0
}

# If you are not moving mailboxes between hosts on a daily basis you can
# use authentication cache pretty safely.
auth_cache_size = 4096

auth_mechanisms = plain
passdb {
  driver = sql
  args = /usr/local/etc/dovecot/dovecot-sql.conf.ext
}
```

```[dovecot-sql.conf.ext]
driver = mysql
connect = host=sqlhost1 host=sqlhost2 dbname=mail user=dovecot password=secret
password_query = SELECT NULL AS password, 'Y' as nopassword, \
    host, destuser, 'Y' AS proxy \
    FROM proxy WHERE user = '%u'
```
:::

### `proxy_maybe` with SQL

::: code-group
```sql[SQL Table]
CREATE TABLE users (
    user varchar(255) NOT NULL,
    domain varchar(255) NOT NULL,
    password varchar(100) NOT NULL,
    host varchar(16) NOT NULL,
    home varchar(100) NOT NULL,
    PRIMARY KEY (user)
);
```

```[dovecot.conf]
# user/group who owns the message files:
mail_uid = vmail
mail_gid = vmail

auth_mechanisms = plain

passdb {
  driver = sql
  args = /usr/local/etc/dovecot/dovecot-sql.conf.ext
}
userdb sql {
  driver = sql
  args = /usr/local/etc/dovecot/dovecot-sql.conf.ext
}
```

```[dovecot-sql.conf.ext]]
driver = mysql

password_query = \
SELECT concat(user, '@', domain) AS user, password, host, \
    'Y' AS proxy_maybe FROM users WHERE user = '%n' AND domain = '%d'

user_query = SELECT user AS username, domain, home \
    FROM users WHERE user = '%n' AND domain = '%d'
```
:::
