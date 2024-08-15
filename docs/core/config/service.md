---
layout: doc
title: Services
dovecotlinks:
  service_configuration: services configuration
  service_auth_worker:
    hash: auth-worker
    text: auth_worker service
  service_chroot:
    hash: chroot
    text: service configuration (chroot)
  service_client_limit:
    hash: client-limit
    text: service configuration (client_limit)
  service_drop_priv_before_exec:
    hash: drop-priv-before-exec
    text: service configuration (drop_priv_before_exec)
  service_executable:
    hash: executable
    text: service configuration (executable)
  service_extra_groups:
    hash: extra-groups
    text: service configuration (extra_groups)
  service_group:
    hash: group
    text: service configuration (group)
  service_idle_kill:
    hash: idle-kill
    text: service configuration (idle_kill)
  service_privileged_group:
    hash: privileged-group
    text: service configuration (privileged_group)
  service_process_limit:
    hash: process-limit
    text: service configuration (process_limit)
  service_process_min_avail:
    hash: protocol
    text: service configuration (process_min_avail)
  service_protocol:
    hash: protocol
    text: service configuration (protocol)
  service_service_count:
    hash: service-count
    text: service configuration (service_count)
  service_type:
    hash: type
    text: service configuration (type)
  service_user:
    hash: user
    text: service configuration (user)
  service_vsz_limit:
    hash: vsz-limit
    text: service configuration (vsz_limit)
---

# Service Configuration

This page describes Dovecot's services comprehensively.

Most admins don't need to know these details.

The important service settings are described in the
`example-config/conf.d/10-master.conf` file.

## Settings

<SettingsComponent tag="service" />

## Service Limits

There are 3 types of services that need to be optimized in different ways:

1. Master services (e.g. `auth`, `anvil`, `indexer`, `log`): Currently there
   isn't any easy way to optimize these. If these become a bottleneck,
   typically you need to run another Dovecot server. In some cases it may be
   possible to create multiple master processes and have each one be
   responsible for only specific users/processes, although this may also
   require some extra development.
1. Services that do disk I/O or other blocking operations (e.g. `imap`, `pop3`,
   `lmtp`): These should have [[setting,service_client_limit,1]], because any
   blocking operation will block all the other clients and cause unnecessary
   delays and even timeouts. This means that [[setting,service_process_limit]]
   specifies the maximum number of available parallel connections.
1. Services that have no blocking operations (e.g. `imap-login`, `pop3-login`):
   For best performance (but a bit less safety), these should have
   [[setting,service_process_limit]] and [[setting,service_process_min_avail]]
   set to the number of CPU cores, so each CPU will be busy serving the process
   but without unnecessary context switches. Then
   [[setting,service_client_limit]] needs to be set high enough to be able to
   serve all the needed connections (max connections = `process_limit *
   client_limit`).
   [[setting,service_service_count]] is commonly set to `unlimited` for these
   services. Otherwise when the limit is beginning to be reached, the total
   number of available connections will shrink. With very bad luck that could
   mean that all the processes are simply waiting for the existing connections
   to die away before the process can die and a new one can be created.
   Although this could be made less likely by setting
   [[setting,service_process_limit]] higher than
   [[setting,service_process_min_avail]], but that's still not a guarantee
   since each process could get a very long running connection and the
   [[setting,service_process_limit]] would be eventually reached.

## Default Services

### anvil

The anvil process tracks state of users and their connections.

* **chroot=empty** and **user=$default_internal_user**, because anvil doesn't
  need access to anything.

* **process_limit=1**, because there can be only one.

* **client_limit** should be large enough to handle all the simultaneous
  connections.

  Dovecot attempts to verify that the limit is high enough at startup.
  If it's not, it logs a warning such as:

    * "Warning: service anvil { client_limit=200 } is lower than required under max. load (207)"

      This is calculated by counting the [[setting,service_process_limit]] of
      auth and login services, because each of them has a persistent connection
      to anvil.

* **idle_kill=infinite**, because it should never die or all of its tracked
  state would be lost.

* [[doveadm,who]] and some other doveadm commands connect to anvil's UNIX
  listener and request its state.

### auth

The master auth process. There are 4 types of auth client connections:

**auth**
:   Only [[link,sasl]] authentication is allowed. This can be safely
    exposed to entire world.

**userdb**
:   userdb lookups and passdb lookups (without the password itself) can
    be done for any user, and a list of users can be requested. This may
    or may not be a security issue. Access to userdb lookup is commonly
    needed by [[link,lda]], doveadm, and other tools.

**login**
:   Starts a two phase user login by performing authenticating (same as
    `client` type). Used by login processes.

**master**
:   Finishes the two phase user login by performing a userdb lookup
    (similar to "userdb" type). Used by post-login processes (e.g. imap,
    pop3).

::: info [[changed,service_auth_listener_type]]
The listener type is configured explicitly using the **type** field.

For older versions, the listener type is selected based on the (file)name
after the last `-` in the name. For example `anything-userdb` is of
`userdb` type.

The default type is `auth` for unrecognized listeners.

You can add as many `auth` and `userdb` listeners as you want (and you
probably shouldn't touch the `login` and `master` listeners).
:::

* **client_limit** should be large enough to handle all the simultaneous
  connections.

  Dovecot attempts to verify that the limit is high enough at startup.
  If it's not, it logs a warning such as:

    * Warning: service auth { client_limit=1000 } is lower than required under max. load (1328)

      This is calculated by counting the [[setting,service_process_limit]] of
      every service that is enabled with the `protocol` setting (e.g. imap,
      pop3, lmtp). Only services with `service_count != 1` are counted, because
      they have persistent connections to auth, while `service_count=1`
      processes only do short-lived auth connections.

* **process_limit=1**, because there can be only one auth master process.

* **user=$default_internal_user**, because it typically doesn't need
  permissions to do anything (PAM lookups are done by auth-workers).

* **chroot** could be set (to e.g. `empty`) if passdb/userdb doesn't need
  to read any files (e.g. SQL, LDAP config is read before chroot)

### auth-worker

Auth master process connects to auth worker processes.

It is mainly used by passdbs and userdbs that do potentially long running
lookups.

For example MySQL supports only synchronous lookups, so each query is run
in a separate auth worker process that does nothing else during the query.

PostgreSQL and LDAP supports asynchronous lookups, so those don't use
worker processes at all.

With some passdbs and userdbs you can select if worker processes should
be used.

* **client_limit=1**, because only the master auth process connects to
  auth worker.

* **process_limit** should be a bit higher than
  [[setting,auth_worker_max_count]].

* **user=root** by default, because by default PAM authentication is used,
  which usually requires reading `/etc/shadow`.

  If this isn't needed, it's a good idea to change this to something else,
  such as `$default_internal_user`.

* **chroot** could also be set if possible.

* **service_count=0** counts the number of processed auth requests.

  This can be used to cycle the process after the specified number of auth
  requests (default is unlimited). The worker processes also stop after
  being idle for `idle_kill` seconds.

### config

Config process reads and parses the `dovecot.conf` file, and exports the
parsed data in simpler format to config clients.

* **user=root**, because the process needs to be able to reopen the
  config files during a config reload, and often some parts of the
  config having secrets are readable only by root.

* Only root should be able to connect to its UNIX listener, unless there
  are no secrets in the configuration.

  Passwords are obviously secrets, but less obviously [[setting,ssl_key]]
  is also a secret, since it contains the actual SSL key data instead of
  only a filename.

### dict

Dovecot has a [[link,dict,lib-dict]] API for doing simple key-value
lookups/updates in various backends (SQL, file).

This is optionally used by things like quota, expire plugin, and other
things in the future.

It would be wasteful for each mail process to separately create a connection
to SQL, so usually they go through the `proxy` dict backend. These proxy
connections are the client connections of dict processes.

* dict / Synchronous lookups (e.g. mysql)
  * `client_limit=1`, because dict lookups are synchronous and the client
    is supposed to disconnect immediately after the lookup.

* dict-async / Asynchronous lookups (e.g. pgsql, cassandra, ldap)
  * [[setting,service_process_limit]] should commonly be the same as number of
    CPU cores. Although with Cassandra this may not be true, because Cassandra
    library can use multiple threads.

* **user=$default_internal_user**, because the proxy dict lookups are
  typically SQL lookups, which require no filesystem access. (The SQL
  config files are read while still running as root.)

* The dict clients can do any kind of dict lookups and updates for all users,
  so they can be rather harmful if exposed to an attacker. That's why by
  default only root can connect to dict socket. Unfortunately that is too
  restrictive for all setups, so the permissions need to be changed so
  that Dovecot's mail processes (and only them) can connect to it.

### dict-expire

[[added,service_dict_expire]]

This process periodically goes through configured dicts and deletes all
expired rows in them. Currently this works only for dict-sql when
`expire_field` has been configured.

* **process_limit=1**, because only one process should be running expires.

* **user** and other permissions should be the same as for the dict service.

### dns_client

Used by lib-dns library to perform asynchronous DNS lookups.

The dns-client processes internally use the synchronous `gethostbyname()`
function.

* **client_limit=1**, because the DNS lookup is synchronous.

* **user=$default_internal_user**, because typically no special
  privileged files need to be read.

* **chroot** can be used only if it contains `etc/resolv.conf` and other
  files necessary for DNS lookups.

### doveadm

It's possible to run doveadm mail commands via doveadm server processes.

This is useful for running doveadm commands for multiple users
simultaneously, and it's also useful in a multiserver system where
doveadm can automatically connect to the correct backend to run the command.

* **client_limit=1**, because doveadm command execution is synchronous.

* **service_count=1** just in case there were any memory leaks. This could
  be set to some larger value (or `0`) for higher performance.

* **user=root**, but the privileges are (temporarily) dropped to the
  mail user's privileges after userdb lookup.

  If only a single UID is used, user can be set to the mail UID for
  higher security, because the process can't gain root privileges anymore.

### imap, pop3, submission, managesieve

Post-login process for handling IMAP/POP3/Submission/ManageSieve client
connections.

* **client_limit** may be increased from the default `1` to save some CPU
  and memory, but it also increases the latency when one process
  serving multiple clients is waiting for a long time for a lock or disk
  I/O.

  In the future these waits may be reduced or avoided completely, but for
  now it's not safe to set this value higher than `1` in enterprise mail
  systems.

  For small, mostly-idling hobbyist servers, a larger number may work
  without problems.

* **service_count** can be changed from `1` if only a single UID is used
  for mail users.

  This improves performance, but it's less secure, because bugs in code
  may leak email data from another user's earlier connection.

* **process_limit** defaults to `1024`, which means that the number of
  simultaneous connections for the protocol that this service handles
  (IMAP, POP3, Submission, or ManageSieve) is limited by this setting.

  If you expect more connections, increase this value.

### imap-login, pop3-login, submission-login, managesieve-login

See [[link,login_processes]].

### indexer

Indexer master process, which tracks and prioritizes indexing requests
from mail processes.

The actual indexing is done by indexer-worker processes.

The indexing means both updating Dovecot's internal index and cache files
with new messages and updating full text search indexes (if enabled).

The indexer master process guarantees that the FTS index is never modified
by more than one process.

* **process_limit=1**, because only one process can keep the FTS guarantee.

* **user=$default_internal_user**, because the process doesn't need any
  permissions.

* **chroot** could be set to [[setting,base_dir]] for extra security. It
  still needs to be able to connect to indexer-worker socket.

### indexer-worker

Indexer worker process.

indexer-workers are background processes that are not normally visible to the
end user (exception: if mails are not indexed, i.e. on delivery, indexing needs
to occur on-demand if a user issues a SEARCH command). Therefore, they
generally should be configured to a lower priority to ensure that they do not
steal resources from other processes that are user facing.

A recommendation is to execute the process at a lower priority. This can be
done by prefixing the executable location with a priority modifier, such as:

```[dovecot.conf]
service indexer-worker {
  executable = /usr/bin/nice -n 10 /usr/libexec/dovecot/indexer-worker
}
```

* **client_limit=1**, because indexing is a synchronous operation.

* **process_limit** defaults to `10`, because the FTS index updating can
  eat a lot of CPU and disk I/O. You may need to adjust this value
  depending on your system.

* **user=root**, but the privileges are (temporarily) dropped to the
  mail user's privileges after userdb lookup. If only a single UID is
  used, user can be set to the mail UID for higher security, because
  the process can't gain root privileges anymore.

### lmtp

LMTP process for delivering new mails.

* **client_limit=1**, because most of the time spent on an LMTP client is
  spent waiting for disk I/O and other blocking operations. There's no
  point in having more clients waiting around during that doing nothing.

  However, LMTP proxying is only writing to temporary files that normally
  stay only in memory. So for LMTP proxying, a `client_limit` above `1`
  could be useful.

* **user=root**, but the privileges are (temporarily) dropped to the mail
  user's privileges after userdb lookup. If only a single UID is used,
  user can be set to the mail UID for higher security, because the process
  can't gain root privileges anymore.

### log

All processes started via Dovecot master process log their messages via
the `log` process. This allows some nice features compared to directly
logging via syslog.

* **process_limit=1**, because the log process keeps track of all the
  other logging processes.

* **user=root**, because it guarantees being able to write to syslog
  socket and to the log files directly.

### stats

Event statistics tracking. Its behavior is very similar to the anvil process,
but anvil's data is of higher importance and lower traffic than stats, so stats
are tracked in a separate process.

* **client_limit** should be large enough to handle all the simultaneous
  connections.

  Dovecot attempts to verify that the limit is high enough at startup.
  If it's not, it logs a warning such as:

  `Warning: service stats { client_limit=1000 } is lower than required under max. load (7945)`

  This is calculated by counting the [[setting,service_process_limit]] of all
  the services, because each of them has a persistent connection to stats.
