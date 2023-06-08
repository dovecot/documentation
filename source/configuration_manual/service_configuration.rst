.. _service_configuration:

=====================
Service configuration
=====================

This page describes Dovecot's services comprehensively. Most admins don't need to know these details. The important service settings are described in the ``example-config/conf.d/10-master.conf`` file.

Service basics
==============

executable
^^^^^^^^^^
The binary path to execute and its parameters. If the path doesn't begin with ``/``, it's relative to base_dir.

type
^^^^
Type of this service:

   * "" is the default.
   * "startup" creates one process at startup. For example SSL parameters are generated at startup because of this, instead of only after the first SSL connection arrives.
   * "login" is used by login processes. The login processes have "all processes full" notification fd. It's used by the processes to figure out when no more client connections can be accepted because client and process limits have been reached. The login processes can then kill some of their oldest connections that haven't logged in yet.
   * "log", "config" and "anvil" are treated specially by these specific processes.

protocol
^^^^^^^^
If non-empty, this service is enabled only when the protocol name is listed in protocols setting.

.. _service_configuration-idle_kill:

idle_kill
^^^^^^^^^

Time interval between killing extra idling processes. During the interval
the master process tracks the lowest number of idling processes for the
service. Afterwards it sends SIGINT notification to that many idling
processes. If the processes are still idling when receiving the signal,
they shut down themselves.

If set to ``0``, :dovecot_core:ref:`default_idle_kill` is used.

Using ``4294967295 secs`` disables the idle-killing.

.. versionchanged:: v2.3.21 This behavior was redesigned to work better
		    in busy servers.

Service privileges
==================

user
^^^^
UNIX user (UID) which runs this process.`` default_login_user`` setting's value should be used for type=login processes and ``default_internal_user`` should be used for other processes that don't require root privileges.

group
^^^^^
The primary UNIX group (GID) which runs this process.

extra_groups
^^^^^^^^^^^^
Secondary UNIX groups that this process belongs to.

privileged_group
^^^^^^^^^^^^^^^^
Secondary UNIX group, which is disabled by default, but can be enabled by the process. This setting is probably never needed directly. ``mail_privileged_group`` setting is a more user friendly way to use this setting for mail processes.

chroot
^^^^^^
The processes are chrooted to this directory at startup. Relative to ``base_dir``.

drop_priv_before_exec
^^^^^^^^^^^^^^^^^^^^^
Drop all privileges after forking, but before executing the binary. This is mainly useful for dumping core files on non-Linux OSes, since the processes are no longer in `etuid` mode. This setting can't be used with non-empty chroot.

Service limits
==============

There are 3 types of services that need to be optimized in different ways:

1. Master services (e.g. auth, anvil, indexer, director, log):
    Currently there isn't any easy way to optimize these. If these become a bottleneck, typically you need to run another Dovecot server. In some cases it may be possible to create multiple master processes and have each one be responsible for only specific users/processes, although this may also require some extra development.
2. Services that do disk I/O or other blocking operations (e.g. imap, pop3, lmtp):
    These should have ``client_limit=1``, because any blocking operation will block all the other clients and cause unnecessary delays and even timeouts.
    This means that ``process_limit`` specifies the maximum number of available parallel connections.

3. Services that have no blocking operations (e.g. imap-login, pop3-login):
    For best performance (but a bit less safety), these should have ``process_limit`` and ``process_min_avail`` set to the number of CPU cores, so each CPU will be busy serving the process but without unnecessary context switches.
    Then ``client_limit`` needs to be set high enough to be able to serve all the needed connections (``max connections=process_limit * client_limit``).
    ``service_count`` is commonly set to unlimited (0) for these services. Otherwise when the service_count is beginning to be reached, the total number of available connections will shrink. With very bad luck that could mean that all the processes are simply waiting for the existing connections to die away before the process can die and a new one can be created. Although this could be made less likely by setting ``process_limit`` higher than ``process_min_avail``, but that's still not a guarantee since each process could get a very long running connection and the ``process_limit`` would be eventually reached.

.. _service_configuration-client_limit:

client_limit
^^^^^^^^^^^^
Maximum number of simultaneous client connections per process. Once this number of connections is received, the next incoming connection will prompt Dovecot to spawn another process. If set to ``0``, ``default_client_limit`` is used instead.

service_count
^^^^^^^^^^^^^

Number of client connections to handle until the process kills itself. ``0`` means unlimited. 1 means only a single connection is handled until the process is stopped - this is the most secure choice since there's no way for one connection's state to leak to the next one. For better performance this can be set higher, but ideally not unlimited since more complex services can have small memory leaks and/or memory fragmentation and the process should get restarted eventually. For example ``100..1000`` can be good values.

.. _service_configuration-process_limit:

process_limit
^^^^^^^^^^^^^
Maximum number of processes that can exist for this service.
If set to ``0``, ``default_process_limit`` is used instead.

process_min_avail
^^^^^^^^^^^^^^^^^
Minimum number of processes that always should be available to accept more client connections.

Note that if ``client_limit=1``, this means there are always that many
processes that are not doing anything. When a new process launches, one of the
idling processes will accept the connection and a new idling process is
launched.

 * For ``service_count=1`` processes this decreases the latency for handling new connections.
   This is usually not necessary to to be set.
   Large values might be useful in some special cases, like if there are a lot of POP3 users logging in exactly at the same time to check mails.
 * For ``service_count!=1`` and ``client_limit>1`` processes it could be set to the number of CPU cores on the system to balance the load among them.
   This is commonly used with ``*-login`` processes.
 * For ``service_count!=1`` and ``client_limit=1`` processes it is likely not
   useful to use this, and it might actually be worse for both performance and
   latency. With these type of services the processes are already being reused,
   so there are already some idling processes that can accept the new
   connections. Using ``process_min_avail`` on top of that will just keep
   launching new idling processes unnecessarily.

.. _service_configuration-vsz_limit:

vsz_limit
^^^^^^^^^
Limit the process's address space (both ``RLIMIT_DATA`` and ``RLIMIT_AS`` if available). When the space is reached, some memory allocations may start failing with "Out of memory", or the kernel may kill the process with signal 9. This setting is mainly intended to prevent memory leaks from eating up all of the memory, but there can be also legitimate reasons why the process reaches this limit. For example a huge mailbox may not be accessed if this limit is too low. The default value (``18446744073709551615=2^64-1``) sets the limit to ``default_vsz_limit``, while 0 disables the limit entirely.

Service listeners
=================

unix_listeners and fifo_listeners
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

path
^^^^
Path to the file, relative to ``base_dir`` setting. This is also used as the section name.

user
^^^^
Owner of the file. Defaults to 0 (root).

group
^^^^^
Group of the file. Defaults to 0 (root/wheel).

mode
^^^^^
Mode of the file. Defaults to 0700. Note that 0700 is an octal value, while 700 is a different decimal value. Setting mode to ``0`` disables the listener.

.. _service_configuration_inet_listeners:

inet_listeners
^^^^^^^^^^^^^^

name
^^^^^
Section name of this listener. It is meant to be descriptive for humans (e.g. `imap`, `imaps`).

address
^^^^^^^
Space separated list of IP addresses / host names to listen on. ``*`` means all IPv4 addresses, ``::`` means all IPv6 addresses. Defaults to listen setting.

port
^^^^^
Port number where to listen. ``0`` disables the listener.

ssl
^^^
If yes, the listener does an immediate SSL/TLS handshake after accepting a connection. This is needed for the legacy imaps and pop3s ports.

.. Note:: All listeners with ssl=yes will be removed if global ssl is turned off
.. Note:: Regardless of the value for listener's ssl setting, some services will still try to initialize encryption if global ssl is on.
          This is for example done to accommodate STARTTLS commands for IMAP/SUBMISSION/LMTP protocols. In other words, ssl is truly disabled
          only when global ssl is turned off.

haproxy (v2.2.19+)
^^^^^^^^^^^^^^^^^^
If yes, this listener is configured for use with HAProxy. It expects a Proxy Protocol header right after accepting the connection. Connections are aborted immediately when this protocol is violated.

Default services
================
anvil
^^^^^
The anvil process tracks state of users and their connections.

  * **chroot=empty** and **user=$default_internal_user**, because anvil doesn't need access to anything.

  * **process_limit=1**, because there can be only one.

  * **client_limit** should be large enough to handle all the simultaneous connections.
    Dovecot attempts to verify that the limit is high enough at startup.
    If it's not, it logs a warning such as:

     * ``Warning: service anvil { client_limit=200 } is lower than required under max. load (207)``

     This is calculated by counting the process_limit of auth and login services,
     because each of them has a persistent connection to anvil.

  * **idle_kill=4294967295s**, because it should never die or all of its tracked state would be lost.

  * ``doveadm who`` and some other doveadm commands connect to anvil's UNIX listener and request its state.

auth
^^^^^
The master auth process. There are 4 types of auth client connections:

   * **client**: Only :ref:`sasl` authentication is allowed. This can be safely exposed to entire world.
   * **userdb**: userdb lookups and passdb lookups (without the password itself) can be done for any user, and a list of users can be requested. This may or may not be a security issue. Access to userdb lookup is commonly needed by dovecot-lda, doveadm and other tools.
   * **login**: Starts a two phase user login by performing authenticating (same as`client` type). Used by login processes.
   * **master**: Finishes the two phase user login by performing a userdb lookup (similar to "userdb" type). Used by post-login processes (e.g. imap, pop3).

With UNIX listeners the client type is selected based on the filename after the last ``-`` in the filename. For example ``anything-userdb`` is of `userdb` type. The default type is `client` for inet listeners and unrecognized UNIX listeners. You can add as many client and userdb listeners as you want (and you probably shouldn't touch the login/master listeners).

   * **client_limit** should be large enough to handle all the simultaneous connections.
     Dovecot attempts to verify that the limit is high enough at startup.
     If it's not, it logs a warning such as:

      * ``Warning: service auth { client_limit=1000 } is lower than required under max. load (1328)``

     This is calculated by counting the process_limit of every service that
     is enabled with the "protocol" setting (e.g. imap, pop3, lmtp).
     Only services with service_count != 1 are counted, because they have
     persistent connections to auth, while service_count=1 processes only do
     short-lived auth connections.

   * **process_limit=1**, because there can be only one auth master process.

   * **user=$default_internal_user**, because it typically doesn't need permissions to do anything (PAM lookups are done by auth-workers).

   * **chroot** could be set (to e.g. `empty`) if passdb/userdb doesn't need to read any files (e.g. SQL, LDAP config is read before chroot)


.. _service_configuration_auth_worker:

auth-worker
^^^^^^^^^^^

Auth master process connects to auth worker processes. It is mainly used by passdbs and userdbs that do potentially long running lookups. For example MySQL supports only synchronous lookups, so each query is run in a separate auth worker process that does nothing else during the query. PostgreSQL and LDAP supports asynchronous lookups, so those don't use worker processes at all. With some passdbs and userdbs you can select if worker processes should be used.

   * **client_limit=1**, because only the master auth process connects to auth worker.

   * **process_limit** should be a bit higher than ``auth_worker_max_count`` setting.

   * **user=root** by default, because by default PAM authentication is used, which usually requires reading ``/etc/shadow``. If this isn't needed, it's a good idea to change this to something else, such as ``$default_internal_user``.

   * **chroot** could also be set if possible.

   * **service_count=0** counts the number of processed auth requests. This can be used to cycle the process after the specified number of auth requests (default is unlimited). The worker processes also stop after being idle for ``idle_kill`` seconds. Prior to v2.3.16, you should keep this as **1**.

     .. versionchanged:: v2.3.16


config
^^^^^^
Config process reads and parses the dovecot.conf file, and exports the parsed data in simpler format to config clients.

   * **user=root**, because the process needs to be able to reopen the config files during a config reload, and often some parts of the config having secrets are readable only by root.

   * Only root should be able to connect to its UNIX listener, unless there are no secrets in the configuration. Passwords are obviously secrets, but less obviously ssl_key is also a secret, since it contains the actual SSL key data instead of only a filename.

dict
^^^^
Dovecot has a `lib-dict"` API for doing simple key-value lookups/updates in various backends (SQL, file, others in future). This is optionally used by things like quota, expire plugin and other things in future. It would be wasteful for each mail process to separately create a connection to SQL, so usually they go through the `proxy` dict backend. These proxy connections are the client connections of dict processes.

   * dict / Synchronous lookups (e.g. mysql):
      * ``client_limit=1``, because dict lookups are synchronous and the client is supposed to disconnect immediately after the lookup.

   * dict-async / Asynchronous lookups (e.g. pgsql, cassandra, ldap):
     * ``process_limit`` should commonly be the same as number of CPU cores. Although with Cassandra this may not be true, because Cassandra library can use multiple threads.

   * **user=$default_internal_user**, because the proxy dict lookups are typically SQL lookups, which require no filesystem access. (The SQL config files are read while still running as root.)

   * The dict clients can do any kind of dict lookups and updates for all users, so they can be rather harmful if exposed to an attacker. That's why by default only root can connect to dict socket. Unfortunately that is too restrictive for all setups, so the permissions need to be changed so that Dovecot's mail processes (and only them) can connect to it.

director
^^^^^^^^
Director tracker process, which hooks into all auth-client and auth-userdb connections.

   * **process_limit=1**, because only one process can keep track of everyone's state.

   * **user=$default_internal_user**, because director doesn't access any files.

   * **chroot** can't be set, because it still needs to be connect to auth process.

   * Connections are basically proxying auth connections, so they have similar security considerations.

dns_client
^^^^^^^^^^
Used by `lib-dns` library to perform asynchronous DNS lookups. The dns-client processes internally use the synchronous ``gethostbyname()`` function.

   * **client_limit=1**, because the DNS lookup is synchronous.

   * **user=$default_internal_user**, because typically no special privileged files need to be read.

   * **chroot** can be used only if it contains etc/resolv.conf and other files necessary for DNS lookups.

doveadm
^^^^^^^
It's possible to run doveadm mail commands via doveadm server processes. This is useful for running doveadm commands for multiple users simultaneously, and it's also useful in a multiserver system where doveadm can automatically connect to the correct backend to run the command.

   * **client_limit=1**, because doveadm command execution is synchronous.

   * **service_count=1** just in case there were any memory leaks. This could be set to some larger value (or 0) for higher performance.

   * **user=root**, but the privileges are (temporarily) dropped to the mail user's privileges after userdb lookup. If only a single UID is used, user can be set to the mail UID for higher security, because the process can't gain root privileges anymore.

imap, pop3, submission, managesieve
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Post-login process for handling IMAP/POP3/Submission/ManageSieve client connections.

   * **client_limit** may be increased from the default 1 to save some CPU and memory, but it also increases the latency when one process serving multiple clients it waiting for a long time for a lock or disk I/O. In future these waits may be reduced or avoided completely, but for now it's not safe to set this value higher than 1 in enterprise mail systems. For small mostly-idling hobbyist servers a larger number may work without problems.

   * **service_count** can be changed from 1 if only a single UID is used for mail users. This is improves performance, but it's less secure, because bugs in code may leak email data from another user's earlier connection.

   * **process_limit** defaults to 1024, which means that the number of simultaneous connections for the protocol that this service handles (IMAP, POP3, Submission, or ManageSieve) is limited by this setting. If you expect more connections, increase this value.

imap-login, pop3-login, submission-login, managesieve-login
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
See :ref:`login_processes`.

indexer
^^^^^^^

Indexer master process, which tracks and prioritizes indexing requests from mail processes. The actual indexing is done by indexer-worker processes. The indexing means both updating Dovecot's internal index and cache files with new messages and more importantly updating full text search indexes (if enabled). The indexer master process guarantees that the FTS index is never modified by more than one process.

   * **process_limit=1**, because only one process can keep the FTS guarantee.

   * **user=$default_internal_user**, because the process doesn't need any permissions.

   * **chroot** could be set to **$base_dir** for extra security. It still needs to be able to connect to indexer-worker socket.

indexer-worker
^^^^^^^^^^^^^^
Indexer worker process.

   * **client_limit=1**, because indexing is a synchronous operation.

   * **process_limit** defaults to 10, because the FTS index updating can eat a lot of CPU and disk I/O. You may need to adjust this value depending on your system.

   * **user=root**, but the privileges are (temporarily) dropped to the mail user's privileges after userdb lookup. If only a single UID is used, user can be set to the mail UID for higher security, because the process can't gain root privileges anymore.

indexer-workers are background processes that are not normally visible to the
end user (exception: if mails are not indexed, i.e. on delivery, indexing needs
to occur on-demand if a user issues a SEARCH command). Therefore, they
generally should be configured to a lower priority to ensure that they do not
steal resources from other processes that are user facing. A recommendation
is to execute the process at a lower priority. This can be done by prefixing
the executable location with a priority modifier, such as:

.. code-block:: none

   service indexer-worker {
     executable = /usr/bin/nice -n 10 /usr/libexec/dovecot/indexer-worker
   }

ipc
^^^^^
IPC hub process.

   * **process_limit=1**, because there can be only one hub.

   * **chroot=empty** and **user=$default_internal_user**, because it doesn't need any files and there are no outbound connections.

The `ipc` UNIX socket can be used to send any commands to other processes, such as killing a specific user's connection. It is somewhat security sensitive.

lmtp
^^^^^
LMTP process for delivering new mails.

   * **client_limit=1**, because most of the time spent on an LMTP client is spent waiting for disk I/O and other blocking operations. There's no point in having more clients waiting around during that doing nothing.

However, LMTP proxying is only writing to temporary files that normally stay only in memory. So for LMTP proxying a ``client_limit`` above 1 could be useful.
   * **user=root**, but the privileges are (temporarily) dropped to the mail user's privileges after userdb lookup. If only a single UID is used, user can be set to the mail UID for higher security, because the process can't gain root privileges anymore.

log
^^^
All processes started via Dovecot master process log their messages via the `log` process. This allows some nice features compared to directly logging via syslog.

   * **process_limit=1**, because the log process keeps track of all the other logging processes.

   * **user=root**, because it guarantees being able to write to syslog socket and to the log files directly.

ssl-params
^^^^^^^^^^^
Build SSL parameters every n days, based on ``ssl_parameters_regenerate`` setting. Obsoleted in v2.3.0.

type=startup so that the (re)generation can be started immediately at startup when needed, instead of waiting until the first SSL handshake starts.

stats
^^^^^
Mail process statistics tracking. Its behavior is very similar to the anvil process, but anvil's data is of higher importance and lower traffic than stats, so stats are tracked in a separate process.
