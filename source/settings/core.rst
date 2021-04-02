.. _core_settings:

========================
Dovecot Core Settings
========================

See :ref:`settings` for list of all setting groups.

.. _setting-auth_anonymous_username:

``auth_anonymous_username``
---------------------------

- Default: ``anonymous``
- Values:  :ref:`string`

This specifies the username to be used for users logging in with the ANONYMOUS
SASL mechanism.


.. _setting-auth_cache_negative_ttl:

``auth_cache_negative_ttl``
---------------------------

- Default: ``1hour``
- Values:  :ref:`time`

This sets the time to live for negative hits (i.e., when the user is
not found or there is a password mismatch).

The value ``0`` completely disables caching of these hits.


.. _setting-auth_cache_size:

``auth_cache_size``
-------------------

- Default: ``0``
- Values:  :ref:`size`

The authentication cache size (e.g., 10M).

The setting ``auth_cache_size = 0`` disables use of the authentication cache.


.. _setting-auth_cache_ttl:

``auth_cache_ttl``
------------------

- Default: ``1hour``
- Values:  :ref:`time`

This determines the time to live for cached data. After the TTL
expires, the cached record is no longer used, unless the main
database look-up returns internal failure.


.. _setting-auth_cache_verify_password_with_worker:

``auth_cache_verify_password_with_worker``
------------------------------------------

.. versionadded:: v2.2.34

- Default: ``no``
- Values:  :ref:`boolean`

.. Warning:: This feature doesn't currently work correctly when the passdb
             lookup is done via auth-workers. The password is checked correctly,
             but all the passdb extra fields are lost.

The auth master process by default is responsible for the hash verifications.
Setting this to yes moves the verification to auth-worker processes.
This allows distributing the hash calculations to multiple CPU cores, which could make sense if strong hashes are used.


.. _setting-auth_debug:

``auth_debug``
--------------

- Default: ``no``
- Values: :ref:`boolean`

Enables all authentication debug logging (also enables
:ref:`setting-auth_verbose`). Passwords are logged as ``<hidden>``.


.. _setting-auth_debug_passwords:

``auth_debug_passwords``
------------------------

- Default: ``no``
- Values: :ref:`boolean`

This setting adjusts log verbosity. In the event of password
mismatches, the passwords and the scheme used are logged so that the
problem can be debugged.

Enabling this enables :ref:`setting-auth_debug` as well.


.. _setting-auth_default_realm:

``auth_default_realm``
----------------------

- Default: <empty>

This setting indicates the default realm/domain to use if none has
been specified. The setting is used for both SASL realms
and appending an @domain element to the username in plaintext logins.


.. _setting-auth_failure_delay:

``auth_failure_delay``
----------------------

- Default: ``2secs``
- Values:  :ref:`time`

This is the delay before replying to failed authentication attempts.

This setting defines the interval for which the authentication process flushes
all auth failures. Thus, this is the maximum interval a user may encounter.


.. _setting-auth_gssapi_hostname:

``auth_gssapi_hostname``
------------------------

- Default: <empty>

This supplies the hostname to use in Generic Security Services API
(GSSAPI) principal names.

The default is to use the name returned by gethostname().

Use ``"$ALL"`` (with the quotation marks) to allow all keytab entries.


.. _setting-auth_krb5_keytab:

``auth_krb5_keytab``
--------------------

- Default: <empty>

This specifies the Kerberos keytab to use for the GSSAPI mechanism.

If this is left undefined, the system default (usually ``/etc/krb5.keytab``)
will be used.

.. Note:: You may need to set the auth service to run as root in order for this file to be readable.


.. _setting-auth_master_user_separator:

``auth_master_user_separator``
------------------------------

- Default: <empty>

If you want to allow master users to log in by specifying the master
username within the normal username string (i.e., not using the SASL
mechanism's support for it), you can specify the separator character here.

Example:

.. code-block:: none

   auth_master_user_separator = *


.. _setting-auth_mechanisms:

``auth_mechanisms``
-------------------

- Default: ``plain``

Here you can supply a space-separated list of the authentication
mechanisms you wish to use.

Supported mechanisms:

* plain
* login
* digest-md5
* cram-md5
* ntml
* rpa
* apop
* anonymous
* gssapi
* otp
* skey
* gss-spnego

.. todo:: Describe the mechanisms

Example:

.. code-block:: none

  auth_mechanisms = plain login


.. _setting-auth_policy_check_after_auth:

``auth_policy_check_after_auth``
--------------------------------

- Default: ``yes``

- Values: :ref:`boolean`

Do policy lookup after authentication is completed?

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_check_before_auth:

``auth_policy_check_before_auth``
---------------------------------

- Default: ``yes``

- Values: :ref:`boolean`

Do policy lookup before authentication is started?

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_hash_mech:

``auth_policy_hash_mech``
-------------------------

- Default: ``sha256``
- Values: ``md4, md5, sha1, sha256, sha512``

Hash mechanism to use for password.

See :ref:`setting-auth_policy_server_url`
.. todo:: Is this the full list?


.. _setting-auth_policy_hash_nonce:

``auth_policy_hash_nonce``
--------------------------

- Default: <empty>
- Values:  :ref:`string`

Cluster-wide nonce to add to hash.

REQUIRED configuration when you want to use authentication policy.

Example Setting:

.. code-block:: none

   auth_policy_hash_nonce = <localized_random_string>

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_log_only:

``auth_policy_log_only``
------------------------

- Default: ``no``
- Values: :ref:`boolean`

Only log what the policy server response would do?

If ``yes``, no request is made to the policy server.

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_hash_truncate:

``auth_policy_hash_truncate``
-----------------------------

- Default: ``12``
- Values: :ref:`uint`

How many bits to use from password hash when reporting to policy server.

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_reject_on_fail:

``auth_policy_reject_on_fail``
------------------------------

- Default: ``no``
- Values: :ref:`boolean`

If policy request fails for some reason should users be rejected?

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_report_after_auth:

``auth_policy_report_after_auth``
---------------------------------

- Default: ``yes``
- Values: :ref:`boolean`

Report authentication result?

If ``no``, there will be no report for the authentication result.


.. _setting-auth_policy_request_attributes:

``auth_policy_request_attributes``
----------------------------------

- Default: ``login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s``

Request attributes specification.

Variables that can be used for this setting:

* :ref:`Auth variables <variables-auth>`.
* ``%{hashed_password}`` - Truncated auth policy hash of username and password
* ``%{requested_username}`` - Logged in user. Same as ``%{user}``, except for master user logins the same as ``%{login_user}``. (v2.2.34+)

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_server_api_header:

``auth_policy_server_api_header``
---------------------------------

- Default: <empty>

Header and value to add to request (for API authentication).

.. Note::

   See: https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side

This can be used when you are using the weakforced policy server and the web
listener password is "super"

.. code-block:: none

   $ echo -n wforce:super | base64
   d2ZvcmNlOnN1cGVy

Then the correct value for ``auth_policy_server_api_header`` is

.. code-block:: none

   auth_policy_server_api_header = Authorization: Basic d2ZvcmNlOnN1cGVy

See :ref:`setting-auth_policy_server_url`


.. _setting-auth_policy_server_timeout_msecs:

``auth_policy_server_timeout_msecs``
------------------------------------

- Default: ``2000``
- Values: :ref:`uint`

Request timeout, in milliseconds.

.. _setting-auth_policy_server_url:

``auth_policy_server_url``
--------------------------

- Default: <empty>

URL of the policy server.

URL is appended with ``?command=allow/report``. If URL ends with ``&``, the
``?`` is not appended.

REQUIRED configuration when you want to use authentication policy.

Example Setting:

.. code-block:: none

   auth_policy_server_url = http://example.com:4001/


.. _setting-auth_proxy_self:

``auth_proxy_self``
-------------------

- Default: <empty>

If the destination for proxying matches any of the IP addresses listed
here, proxying is not performed when ``proxy_maybe=yes`` is returned.

.. todo:: Link to proxy_mayqe
.. todo:: Mark setting as "normally don't touch"

This parameter isn't normally needed; its main use is if the
destination IP address belongs to, for instance, a load-balancer rather
than the server itself.


.. _setting-auth_realms:

``auth_realms``
---------------

- Default: <empty>

This setting supplies a space-separated list of realms for those SASL
authentication mechanisms that need them. Realms are an integral part of Digest-MD5. You will need to specify realms you want to advertise to the client in the config file:

Example Setting:

.. code-block:: none

   auth_realms = example.com another.example.com foo


.. _setting-auth_socket_path:

``auth_socket_path``
--------------------

- Default: ``auth-userdb``

This setting gives the UNIX socket path to the master authentication
server for finding users. It is usually not necessary nor advisable to change the default.


.. _setting-auth_ssl_require_client_cert:

``auth_ssl_require_client_cert``
--------------------------------

- Default: ``no``
- Values: :ref:`boolean`

If ``yes``, authentication fails when a valid SSL client certificate is not
provided.


.. _setting-auth_ssl_username_from_cert:

``auth_ssl_username_from_cert``
-------------------------------

- Default: ``no``
- Values: :ref:`boolean`


Setting this to "yes" indicates that the username should be taken from
the client's SSL certificate 

Generally, this will be either ``commonName`` or ``x500UniqueIdentifier``.

The text is looked up from subject DN's specified field using OpenSSL's X509_NAME_get_text_by_NID() function.
By default the CommonName field is used.
You can change the field with ssl_cert_username_field = name setting (parsed using OpenSSL's OBJ_txt2nid() function). x500UniqueIdentifier is a common choice.

See :ref:`setting-ssl_cert_username_field`


.. _setting-auth_stats:

``auth_stats``
--------------

.. versionadded:: v2.3

- Default: ``no``
- Values: :ref:`boolean`

If the setting ``auth_stats=yes`` is chosen, authentication statistics are added.


.. _setting-auth_use_winbind:

``auth_use_winbind``
--------------------

- Default: ``no``
- Values: :ref:`boolean`

By default, the NTLM mechanism is handled internally.

If ``yes``, perform NTLM and GSS-SPNEGO authentication with Samba's winbind
daemon and ntlm_auth helper.

This option is useful when you need to authenticate users against a Windows
domain (either AD or NT).


.. _setting-auth_username_chars:

``auth_username_chars``
-----------------------

- Default: ``abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890.-_@``

The list of the characters allowed in a username.

If the user-supplied username contains a character not listed here, login automatically fails.

This is an additional check to make sure the user can't exploit any quote-escaping vulnerabilities that may be connected with SQL/LDAP databases.

If you want to allow all characters, leave the value empty.


.. _setting-auth_username_format:

``auth_username_format``
------------------------

- Default: ``%u``
- Values:  :ref:`string`

Formattting applied to username before querying the auth database.

.. todo:: List allowed formatting modifiers

You can use the standard variables here.

Examples:

* ``%Lu`` - lowercases the username
* ``%n`` - drops the domain if one was supplied
* ``%n-AT-%d`` - changes the "@" symbol into "-AT-" before lookup

This translation is done after the changes specified with the
:ref:`setting-auth_username_translation` setting.


.. _setting-auth_username_translation:

``auth_username_translation``
-----------------------------

- Default: <empty>

If set, performs username character translations before querying the auth
database.

The value is a string formed of sets of `from` and `to` characters
alternating.  A value of `#@/@` means that `#` and `/` will both be
translated to the `@` character.

.. todo:: Better explanation


.. _setting-auth_verbose:

``auth_verbose``
----------------

.. versionadded:: v2.2.24

- Default: ``no``
- Values: :ref:`boolean`

Adjust log verbosity.

If ``yes``, log unsuccessful authentication attempts and why they failed.

Explicitly setting :ref:`setting-auth_debug` will override this setting.


.. _setting-auth_verbose_passwords:

``auth_verbose_passwords``
--------------------------

- Default: ``no``
- Values: ``no``, ``yes``, ``plain`` or ``sha1``

In case of password mismatches, log the attempted password. You can also
truncate the logged password to ``n`` chars by appending ``:n`` (e.g.
``sha1:6``).

Available transformations:

* ``plain``, ``yes``: output plaintext password (NOT RECOMMENDED)
* ``sha1``: output SHA1 hashed password


.. _setting-auth_winbind_helper_path:

``auth_winbind_helper_path``
----------------------------

This setting tells the system the path for Samba's ntlm_auth helper
binary.

Example Setting:

.. code-block:: none

   auth_winbind_helper_path = /usr/bin/ntlm_auth


.. _setting-auth_worker_max_count:

``auth_worker_max_count``
-------------------------

- Default: ``30``
- Values: :ref:`uint`

Maximum number of dovecot-auth worker processes active.

The auth workers are used to execute blocking passdb and userdb queries (e.g., MySQL and PAM). They are automatically created and destroyed as necessary.


.. _setting-base_dir:

``base_dir``
------------

- Default: ``/var/run/dovecot/``

The base directory in which Dovecot should store runtime data.

This can be used to override the ``base_dir`` determined at compile time.


.. _setting-config_cache_size:

``config_cache_size``
---------------------

- Default: ``1 M``
- Values:  :ref:`size`

The maximum size of the in-memory configuration cache.
The cache should be large enough to allow keeping the full, parsed Dovecot configuration in memory. 
The default is almost always large enough, unless your system has numerous large TLS certificates in the configuration.


.. _setting-debug_log_path:

``debug_log_path``
------------------

This indicates the log file to use for debug messages. The default is to use
:ref:`setting-info_log_path` for debug messages as well.


.. _setting-default_client_limit:

``default_client_limit``
------------------------

- Default: ``1000``
- Values: :ref:`uint`

The maximum number of simultaneous client connections per process for a service.

Once this number of connections is reached, the next incoming connection
prompts spawning of another process.

This value can be overridden via the ``client_limit`` setting within service
blocks.

.. todo:: Link to service configuration page, when complete


.. _setting-default_idle_kill:

``default_idle_kill``
---------------------

- Default: ``1mins``
- Values:  :ref:`time`

If a process is idle after this much time has elapsed,
it is notified that it should terminate itself if inactive.

This value can be overridden via the ``idle_kill`` setting within service
blocks.

.. todo:: Link to service configuration page, when complete


.. _setting-default_internal_group:

``default_internal_group``
--------------------------

- Default: ``dovecot``

Define the default internal group.

See :ref:`setting-default_internal_user`


.. _setting-default_internal_user:

``default_internal_user``
-------------------------

- Default: ``dovecot``

Define the default internal user.

Unprivileged processes run under the ID of the internal user. This
user should be distinct from the login user, to prevent login processes
from disturbing other processes.

See :ref:`setting-default_internal_group`


.. _setting-default_login_user:

``default_login_user``
----------------------

- Default: ``dovenull``

The user the login process should run as.

This is the least trusted user in Dovecot: this user should not
have access to anything at all.


.. _setting-default_process_limit:

``default_process_limit``
-------------------------

- Default: ``100``
- Values: :ref:`uint`

The maximum number of processes that may exist for a service.

This value can be overridden via the ``process_limit`` setting within service
blocks.

.. todo:: Link to service configuration page, when complete


.. _setting-default_vsz_limit:

``default_vsz_limit``
---------------------

- Default: ``256M``
- Values:  :ref:`size`

The default virtual memory size limit for service processes.

Designed to catch processes that leak memory so
that they can be terminated before they use up all the available
resources.


.. _setting-deliver_log_format:

``deliver_log_format``
----------------------

- Default: ``msgid=%m: %$``
- Values:  :ref:`string`

The format to use for logging mail deliveries.

Variables that can be used for this setting:

* :ref:`Global variables <variables-global>`.
* ``%$`` - Delivery status message (e.g., saved to INBOX)
* ``%{msgid}`` / ``%m`` - Message-ID
* ``%{subject}`` / ``%s`` - Subject
* ``%{from}`` / ``%f`` - From address
* ``%{from_envelope}`` / ``%e`` : SMTP FROM envelope
* ``%{size}`` / ``%p`` - Physical size
* ``%{vsize}`` / ``%w`` - Virtual size
* ``%{to_envelope}`` - RCPT TO envelope
* ``%{delivery_time}`` - How many milliseconds to deliver the mail
* ``%{session_time}`` - LMTP session duration, not including delivery_time
* ``%{storage_id}`` - Backend-specific ID for mail, e.g. Maildir filename

Example Setting:

.. code-block:: none

   deliver_log_format = stime=%{session_time} msgid=%m: %$


 .. _setting-dict_db_config:

``dict_db_config``
------------------

 - Default: <empty>
 - Values: :ref:`string`

Points to a Berkeley DB config file. Equivalent to adding
DB_CONFIG=/path to import_environment.

See https://docs.oracle.com/database/bdb181/html/bdb-sql/sql_db_config.html for more information.

Example setting:

.. code-block:: none

  dict_db_config=/etc/dovecot/berkeley.conf


.. _setting-director_flush_socket:

``director_flush_socket``
-------------------------

- Default: <empty>

The ``doveadm director flush`` command removes all user associations either
from the given host or all hosts. All the existing connections will be kicked.

This setting points to a file path of a flush script that is automatically
executed when the flush command is run.

Variables that can be used for this setting:

* :ref:`Global variables <variables-global>`.
* ``%{ip}`` / ``%i`` : IP address of the backend
* ``%{host}`` / ``%h`` : Hostname of the backend

.. todo:: Indicate director-only setting


.. _setting-director_mail_servers:

``director_mail_servers``
-------------------------

- Default: <empty>

List of IPs or hostnames of all backend mail servers.

This list is used to bootstrap a Director ring; backend hosts can be
dynamically added to a running ring via the doveadm commands.

.. todo:: Link to IP range type format page.
.. todo:: Indicate director-only setting


.. _setting-director_max_parallel_kicks:

``director_max_parallel_kicks``
-------------------------------

- Default: ``100``
- Values: :ref:`uint`

The maximum number of concurrent kicks allowed in the Director ring.

.. todo:: Indicate director-only setting


.. _setting-director_max_parallel_moves:

``director_max_parallel_moves``
-------------------------------

- Default: ``100``
- Values: :ref:`uint`

How many concurrent user moves are allowed in the Director ring?

This default can be overridden with ``doveadm director flush --max-parallel``
parameter.

.. todo:: Indicate director-only setting


.. _setting-director_output_buffer_size:

``director_output_buffer_size``
-------------------------------

- Default: ``10M``
- Values:  :ref:`size`

This allows configuring the max buffer size for outgoing connections.
Previously it was hardcoded to 10 MB, which wasn't necessarily enough for
very busy directors. If the max buffer size is reached, the connection is
disconnected (and reconnected).

.. todo:: Indicate director-only setting


.. _setting-director_ping_idle_timeout:

``director_ping_idle_timeout``
------------------------------

- Default: ``30secs``
- Values:  :ref:`time`

Minimum time to wait for a reply to PING that was sent to another director
before disconnecting (and reconnecting). This setting is used when there's
otherwise no input coming from the connection.

.. todo:: Indicate director-only setting


.. _setting-director_ping_max_timeout:

``director_ping_max_timeout``
-----------------------------

- Default: ``1mins``
- Values:  :ref:`time`

Maximum time to wait for a reply to PING that was sent to another director
before disconnecting (and reconnecting).
This setting is used when the other director keeps sending input, but among it is no PONG reply.

.. todo:: Indicate director-only setting


.. _setting-director_servers:

``director_servers``
--------------------

- Default: <empty>

A space-separated list of IP addresses or hostnames for all Director servers,
including the machine on which the setting is made.

Ports can be specified after a colon (in IP:port
form) if something other than the default port is to be used (the
default port is the one used by the Director service's inet_listener).

This list is used to bootstrap a Director ring; directors can be dynamically
added to a running ring via the doveadm commands.

.. todo:: Indicate director-only setting


.. _setting-director_user_expire:

``director_user_expire``
------------------------

- Default: ``15mins``
- Values:  :ref:`time`

How long to keep routing information in the Director ring after a user has no
more active connections.

.. todo:: Indicate director-only setting


.. _setting-director_user_kick_delay:

``director_user_kick_delay``
----------------------------

- Default: ``2secs``
- Values:  :ref:`time`

How long to wait after a user has been kicked from the Director ring
before that user can log in to the new server. This timeout should allow time
for the old backend to complete all of the user's existing processes.

.. todo:: Indicate director-only setting


.. _setting-director_username_hash:

``director_username_hash``
--------------------------

- Default: ``%Lu``
- Values:  :ref:`string`

How the username is translated before being hashed. For example, one might
want to use ``%Ln`` if the user can log in with or without @domain and
``%Ld`` if mailboxes are shared within the domain.

Variables that can be used for this setting:

* :ref:`Global variables <variables-global>`.
* ``%{user}`` / ``%u`` : Username (username@domain)
* ``%{username}`` / ``%n`` : Username
* ``%{domain}`` / ``%d`` : Domain

.. todo:: Indicate director-only setting


.. _setting-disable_plaintext_auth:

``disable_plaintext_auth``
--------------------------

- Default: ``yes``
- Values: :ref:`boolean`

If ``yes``, disables the LOGIN command and all other plaintext authentication
unless SSL/TLS is used (LOGINDISABLED capability).


.. _setting-dotlock_use_excl:

``dotlock_use_excl``
--------------------

- Default: ``yes``
- Values: :ref:`boolean`

If ``yes``, rely on O_EXCL to work when creating dotlock
files.  NFS has supported O_EXCL since version 3, so yes should be
safe to use by default.


.. _setting-doveadm_allowed_commands:

``doveadm_allowed_commands``
----------------------------

- Default: ``ALL``

Lists the commands that the client may use with the
doveadm server. The setting ``ALL`` allows all commands.


.. _setting-doveadm_api_key:

``doveadm_api_key``
-------------------

- Default: <empty>

Set an API key for use of the HTTP API for the doveadm
server.

If set, the key must be included in the HTTP request (via X-API-Key header) base64 encoded.

.. _setting-doveadm_http_rawlog_dir:

``doveadm_http_rawlog_dir``
---------------------------

- Default: <empty>

Directory where doveadm stores HTTP rawlogs.


.. _setting-doveadm_password:

``doveadm_password``
--------------------

- Default: <empty>

The doveadm client and server must have a shared secret.  This setting
configures the doveadm server's password, used for client
authentication.

Because it grants access to users' mailboxes, it must be kept secret.


.. _setting-doveadm_port:

``doveadm_port``
----------------

- Default: ``0``
- Values:  :ref:`ip_addresses`

The destination port to be used for the next doveadm proxying hop.

A value of 0 means that proxying is not in use.

.. todo:: Indicate director-only setting
.. todo:: Indicate proxy-only setting


.. _setting-doveadm_socket_path:

``doveadm_socket_path``
-----------------------

- Default: ``doveadm-server``

The UNIX socket or host (host:port syntax is allowed) for connecting to the
doveadm server.

.. _setting-doveadm_ssl:

``doveadm_ssl``
---------------

.. versionadded:: 2.3.9

- Default: ``no``
- Values: ``no, ssl, starttls``

.. _setting-doveadm_username:

``doveadm_username``
--------------------

- Default: ``doveadm``

The username for authentication to the doveadm service.


.. _setting-doveadm_worker_count:

``doveadm_worker_count``
------------------------

- Default: ``0``
- Values: :ref:`uint`

If the worker count set here is non-zero, mail commands are run via
this many connections to the doveadm service.

If ``0``, commands are run directly in the same process.


.. _setting-dsync_alt_char:

``dsync_alt_char``
------------------

- Default: ``_``

When the source and destination mailbox formats are different, it's
possible for a mailbox name to exist on one source that isn't valid for
the destination. Any invalid characters are replaced with the
character indicated here.

.. todo:: Indicate dsync setting


.. _setting-dsync_commit_msgs_interval:

``dsync_commit_msgs_interval``
------------------------------

.. versionadded:: v2.2.30

- Default: ``100``
- Values: :ref:`uint`

Dsync will commit this number of messages incrementally, to avoid huge
transactions that fail.

.. todo:: Indicate dsync setting


.. _setting-dsync_features:

``dsync_features``
------------------

.. versionadded:: v2.2.26

- Default: <empty>

This setting specifies features and workarounds that can be used with
dsync.  Options are specified in this setting via a space-separated list.

Available options:

* ``empty-header-workaround``: Workaround for servers (e.g. Zimbra) that sometimes send FETCH replies containing no headers.

.. code-block:: none

    dsync_features = empty-header-workaround

.. todo:: Indicate dsync setting


.. _setting-dsync_hashed_headers:

``dsync_hashed_headers``
------------------------

.. versionadded:: v2.2.33

- Default: ``Date Message-ID``

Which email headers are used in incremental syncing for checking whether the
local email matches the remote email.

This list should only include headers that can be efficiently downloaded from
the remote server.

.. todo:: Indicate dsync setting


.. _setting-dsync_remote_cmd:

``dsync_remote_cmd``
--------------------

- Default: ``ssh -l%{login} %{host} doveadm dsync-server -u%u -U``

Command to replicate when the mail_replica plug-in is used.

Variables that can be used for this setting:

* :ref:`Global variables <variables-global>`.
* ``%{user}`` / ``%u`` : Username
* ``%{login}`` : Remote login name (from login@host)
* ``%{host}`` : Remote hostname (from login@host)

.. todo:: Indicate dsync setting


.. _setting-first_valid_gid:

``first_valid_gid``
-------------------

- Default: ``1``
- Values: :ref:`uint`

This setting and ``last_valid_gid`` specify the valid GID range for users.

A user whose primary GID is outside this range is not allowed to log in.

If the user belongs to any supplementary groups, the corresponding IDs are
not set.

See also :ref:`setting-last_valid_gid`.


.. _setting-first_valid_uid:

``first_valid_uid``
-------------------

- Default: ``500``
- Values: :ref:`uint`

This setting and ``last_valid_uid`` specify the valid UID range for users.

A user whose UID is outside this range is not allowed to log in.

See also :ref:`setting-last_valid_uid`.


.. _setting-haproxy_timeout:

``haproxy_timeout``
-------------------

- Default: ``3secs``
- Values:  :ref:`time`

When to abort the HAProxy connection when no complete header has been received. The value is given in seconds.

.. todo:: Indicate haproxy setting


.. _setting-haproxy_trusted_networks:

``haproxy_trusted_networks``
----------------------------

- Default: <empty>

A space-separated list of trusted network ranges for HAProxy connections.

Connections from networks outside these ranges to ports that are configured
for HAProxy are aborted immediately.

.. todo:: Indicate haproxy setting


.. _setting-hostname:

``hostname``
------------

- Default: <empty>

The hostname to be used in email messages sent out by the local delivery
agent (such as the Message-ID: header) and in LMTP replies.

The default is the system's real hostname@domain.tld.


.. _setting-imap_capability:

``imap_capability``
-------------------

- Default: <empty>

Override the IMAP CAPABILITY response.

If the value begins with the ``+`` character, the capabilities listed here
are added at the end of the default string.

.. todo:: Indicate imap setting

.. code-block:: none

   imap_capability = +XFOO XBAR


.. _setting-imap_client_workarounds:

``imap_client_workarounds``
---------------------------

- Default: <empty>

Workarounds for various IMAP client bugs can be enabled here.  The list is
space-separated.

The following values are currently supported:

``delay-newmail``:

   EXISTS/RECENT new-mail notifications are sent only in replies to NOOP
   and CHECK commands.  Some clients, such as pre-2.1 versions of OSX
   Mail, ignore them otherwise, and, worse, Outlook Express may report
   that the message is no longer on the server (note that the workaround
   does not help for OE6 if synchronization is set to Headers Only).

``tb-extra-mailbox-sep``:

   Because ``LAYOUT=fs`` (mbox and dbox) confuses Thunderbird, causing
   extra / suffixes to mailbox names, Dovecot can be told to ignore
   the superfluous character instead of judging the mailbox name to be
   invalid.

``tb-lsub-flags``:

   Without this workaround, Thunderbird doesn't immediately recognize
   that LSUB replies with ``LAYOUT=fs`` aren't selectable, and users may
   receive pop-ups with not selectable errors.  Showing
   \Noselect flags for these replies (e.g., in mbox use) causes them to be
   grayed out.

.. todo:: Indicate imap setting


.. _setting-imap_fetch_failure:

``imap_fetch_failure``
----------------------

- Default: ``disconnect-immediately``

Behavior when FETCH fails due to some internal error:

``disconnect-immediately``:

   The FETCH is aborted immediately and the IMAP client is disconnected.

``disconnect-after``:

   The FETCH runs for all the requested mails returning as much data as
   possible. The client is finally disconnected without a tagged reply.

``no-after``:

   Same as disconnect-after, but tagged NO reply is sent instead of
   disconnecting the client.

   If the client attempts to FETCH the same failed mail more than once, the
   client is disconnected.

   This is to avoid clients from going into infinite loops trying to FETCH a
   broken mail.

.. todo:: Indicate imap setting


.. _setting-imap_hibernate_timeout:

``imap_hibernate_timeout``
--------------------------

- Default: ``0``
- Values:  :ref:`size`

How long to wait while the client is in IDLE state before moving the
connection to the hibernate process, to save on memory use, and close the
existing IMAP process.
If nothing happens for this long while client is IDLEing, move the connection
to imap-hibernate process and close the old imap process. This saves memory,
because connections use very little memory in imap-hibernate process. The
downside is that recreating the imap process back uses some resources.

Example Setting:

.. code-block:: none
   
   imap_hibernate_timeout = 0


.. _setting-imap_id_log:

``imap_id_log``
---------------

- Default: <empty>

The ID fields sent by the client that are output to the log.

Using ``*`` as the value denotes that everything available should be sent.

.. todo:: Is there list of fields?
.. todo:: Indicate imap setting

Example Setting:

.. code-block:: none
   
   imap_id_log = 
   
.. _setting-imap_id_retain:

``imap_id_retain``
------------------

.. versionadded:: v2.2.29

- Default: ``no``
- Values: :ref:`boolean`

When proxying IMAP connections to other hosts, forward the IMAP ID command
provided by the client?

Example Setting:

.. code-block:: none

     imap_id_retain=yes


.. _setting-imap_id_send:

``imap_id_send``
----------------

- Default: ``name *``

Which ID field names and values to send to clients.

Using * as the value makes Dovecot use the default value.

There are currently defaults for the following fields:

* ``name``: Name of distributed package (Default: ``Dovecot``)
* ``version``: Dovecot version
* ``os``: OS name reported by uname syscall (similar to ``uname -s`` output)
* ``os-version``: OS version reported by uname syscall (similar to ``uname -r`` output)
* ``support-url``: Support webpage set in Dovecot distribution (Default: ``http://www.dovecot.org/``)
* ``support-email``: Support email set in Dovecot distribution (Default: ``dovecot@dovecot.org``)
* ``revision``: Short commit hash of Dovecot git source tree HEAD (same as the commit hash reported in ``dovecot --version``)

  .. versionadded:: 2.3.10
     ``revision`` field.

.. todo:: Indicate imap setting

Example Setting:

.. code-block:: none

   imap_id_send = "name" * "version" * support-url http://example.com/


.. _setting-imap_idle_notify_interval:

``imap_idle_notify_interval``
-----------------------------

- Default: ``2mins``
- Values:  :ref:`time`

The amount of time to wait between "OK Still here" untagged IMAP responses
when the client is in IDLE operation.

Example Setting:

.. code-block:: none
   
   imap_idle_notify_interval = 2 mins


.. _setting-imap_literal_minus:

``imap_literal_minus``
----------------------

- Default: ``no``
- Values:  :ref:`boolean`

Enable IMAP LITERAL- extension (replaces LITERAL+)?

.. todo:: Indicate imap setting
.. todo:: This was added in 2.2 version?


.. _setting-imap_logout_format:

``imap_logout_format``
----------------------

- Default: ``in=%i out=%o deleted=%{deleted} expunged=%{expunged} trashed=%{trashed} hdr_count=%{fetch_hdr_count} hdr_bytes=%{fetch_hdr_bytes} body_count=%{fetch_body_count} body_bytes=%{fetch_body_bytes}``
- Values:  :ref:`string`

This setting specifies the IMAP logout format string. Supported variables are:

* :ref:`Mail user variables <variables-mail_user>`.
* ``%{input}`` / ``%i`` - total number of bytes read from client
* ``%{output}`` / ``%o`` - total number of bytes sent to client
* ``%{fetch_hdr_count}`` - Number of mails with mail header data sent to client
* ``%{fetch_hdr_bytes}`` - Number of bytes with mail header data sent to client
* ``%{fetch_body_count}`` - Number of mails with mail body data sent to client
* ``%{fetch_body_bytes}`` - Number of bytes with mail body data sent to client
* ``%{deleted}`` - Number of mails where client added \Deleted flag
* ``%{expunged}`` - Number of mails that client expunged, which does not include automatically expunged mails
* ``%{autoexpunged}`` - Number of mails that were automatically expunged after client disconnected
* ``%{trashed}`` - Number of mails that client copied/moved to the special_use=\Trash mailbox.
* ``%{appended}`` - Number of mails saved during the session

The following multi-line example, which is the default, uses some of the most
common variables:

.. code-block:: none

   imap_logout_format = in=%i out=%o del=%{deleted} expunged=%{expunged} \
    trashed=%{trashed} hdr_count=%{fetch_hdr_count} \
    hdr_bytes=%{fetch_hdr_bytes} body_count=%{fetch_body_count} \
    body_bytes=%{fetch_body_bytes}

.. todo:: Indicate imap setting
.. todo:: Explain variables


.. _setting-imap_max_line_length:

``imap_max_line_length``
------------------------

- Default: ``64k``
- Values:  :ref:`size`

Maximum IMAP command line length. Some clients generate very long command
lines with huge mailboxes, so you may need to raise this if you get
Too long argument or IMAP command line too large errors often.

Example Setting:

.. code-block:: none

   imap_max_line_length = 64k

.. todo:: Indicate imap setting


.. _setting-imap_metadata:

``imap_metadata``
-----------------

- Default: ``no``
- Values:  :ref:`boolean`

Dovecot supports the IMAP METADATA extension (RFC 5464), which
allows per-mailbox, per-user data to be stored and accessed via IMAP
commands.  Set this parameter's value to "yes" if you wish to activate
the IMAP METADATA commands.

If activated, a dictionary needs to be configured, via the
:ref:`setting-mail_attribute_dict` setting.

Example Setting:

.. code-block:: none

   # Store METADATA information within user's Maildir directory
   mail_attribute_dict = file:%h/Maildir/dovecot-attributes

   protocol imap 
   {
     imap_metadata = yes
   }

.. todo:: Indicate imap setting
.. todo:: Indicate metadata setting


.. _setting-imap_urlauth_host:

``imap_urlauth_host``
---------------------

- Default: <empty>

Specifies the hosts allowed in URLAUTH URLs sent by clients.

``*`` allows all. An empty value disables checking.

.. todo:: Indicate imap setting


.. _setting-imap_urlauth_logout_format:

``imap_urlauth_logout_format``
------------------------------

- Default: ``in=%i out=%o``
- Values:  :ref:`string`

Specifies the logout format used with the URLAUTH extension in IMAP operation.
NOTE: This setting is currently not actually used.

Variables allowed:

* ``%i``: Total number of bytes read from the client
* ``%o``: Total number of bytes sent to the client

.. todo:: Indicate imap setting

Example Setting:

.. code-block:: none

     imap_urlauth_logout_format = in=%i out=%o


.. _setting-imap_urlauth_port:

``imap_urlauth_port``
---------------------

- Default: ``143``

The port is used with the URLAUTH extension in IMAP operation.

Example Setting:

.. code-block:: none
   
   imap_urlauth_port = 143

.. todo:: Indicate imap setting


.. _setting-imapc_cmd_timeout:

``imapc_cmd_timeout``
---------------------

- Default: ``5mins``
- Values:  :ref:`time`

How long to wait for a reply to an IMAP command sent to a remote IMAP server
before disconnecting and retrying.

This parameter is used in dsync-based migration of mail from the remote system.

.. todo:: Indicate dsync setting


.. _setting-imapc_connection_retry_count:

``imapc_connection_retry_count``
--------------------------------

- Default: ``1``
- Values: :ref:`uint`

How many times to retry connection against a remote IMAP server?

.. todo:: Indicate dsync setting


.. _setting-imapc_connection_retry_interval:

``imapc_connection_retry_interval``
-----------------------------------

- Default: ``1secs``
- Values:  :ref:`time_msecs`

How long to wait between retries against a remote IMAP server?

.. todo:: Indicate dsync setting


.. _setting-imapc_features:

``imapc_features``
------------------

- Default: <empty>

This setting provides a space-separated list of features and workarounds that
can be enabled for dsync-based migration of mail from a remote IMAP server.

Supported imapc_features:

* ``rfc822.size`` - Allow passing through message sizes using FETCH RFC822.SIZE
* ``fetch-headers`` - Allow fetching specific message headers using FETCH
  BODY.PEEK[HEADER.FIELDS (..)], may give a significant performance improvement

.. todo:: Import imapc_features list from wiki
.. todo:: Indicate dsync setting


.. _setting-imapc_host:

``imapc_host``
--------------

- Default: <empty>

The remote IMAP server to use for dsync-based migration of mail (which allows
preservation of the IMAP UIDs etc.).

Example:

.. code-block:: none

   imapc_host = imap.example.com

.. todo:: Indicate dsync setting


.. _setting-imapc_list_prefix:

``imapc_list_prefix``
---------------------

- Default: <empty>

In dsync-based migration, only mailboxes under this prefix on the
remote system are accessed.

Example, for a source IMAP server that uses an INBOX namespace prefix:

.. code-block:: none

   imapc_list_prefix = INBOX/

.. todo:: Indicate dsync setting


.. _setting-imapc_master_user:

``imapc_master_user``
---------------------

- Default: <empty>

If you are using master users for dsync-based migration of mail,
this is the master user for the source IMAP server.

To authenticate as a master user but use a separate login user, the
following configuration should be employed, where the credentials are
represented by masteruser and masteruser-secret:

.. code-block:: none

   imapc_user = %u
   imapc_master_user = masteruser
   imapc_password = masteruser-secret

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-imapc_password`.
See also :ref:`setting-imapc_user`.

.. todo:: Indicate dsync setting


.. _setting-imapc_max_idle_time:

``imapc_max_idle_time``
-----------------------

- Default: ``29mins``
- Values:  :ref:`time`

Send a command to the source IMAP server as a keepalove after no other command
has been sent for this amount of time.

Dovecot will send either "NOOP" or "DONE" to the source IMAP server.

.. todo:: Indicate dsync setting


.. _setting-imapc_max_line_length:

``imapc_max_line_length``
-------------------------

- Default: ``0``
- Values:  :ref:`size`

The maximum line length to accept from the remote IMAP server.

This setting is used to limit maximum memory usage.

A value of ``0`` indicates no maximum.

.. todo:: Indicate dsync setting


.. _setting-imapc_password:

``imapc_password``
------------------

- Default: <empty>

The password used in the login to the source IMAP server for migration of mail
via dsync.

If using master users, this setting will be the password of the master user.

See also :ref:`setting-imapc_master_user`.

See also :ref:`setting-imapc_user`.

.. todo:: Indicate dsync setting


.. _setting-imapc_port:

``imapc_port``
--------------

- Default: ``143``

Port used for connection to the source IMAP server in dsync-based migration of
mail.

.. todo:: Indicate dsync setting


.. _setting-imapc_rawlog_dir:

``imapc_rawlog_dir``
--------------------

- Default: <empty>

Directory location to store raw IMAP protocol traffic logs used in
dsync-based migration of mail..

See: https://wiki.dovecot.org/Debugging/Rawlog

.. todo:: Link to rawlog documentation
.. todo:: Indicate dsync setting


.. _setting-imapc_sasl_mechanisms:

``imapc_sasl_mechanisms``
-------------------------

- Default: <empty>

The SASL mechanisms to use for authentication when connection to a remote
IMAP server during dsync-based migration of mail.

The first one advertised by the IMAP sever is used.

PLAIN authentication will be used by default.

Example value:

.. code-block:: none

   imapc_sasl_mechanisms = external plain login

.. todo:: Indicate dsync setting


.. _setting-imapc_ssl:

``imapc_ssl``
-------------

- Default: ``no``
- Values: ``yes``, ``no``, or ``imaps``

To enable SSL for dsync-based migration of mail, use ``imapc_ssl = imaps``
to specify the protocol for connection to the source IMAP server.

.. todo:: Values are incorrect?  At least "imaps" is also supported.
.. todo:: Indicate dsync setting


.. _setting-imapc_ssl_verify:

``imapc_ssl_verify``
--------------------

- Default: ``yes``
- Values: :ref:`boolean`

Require SSL verification of remote IMAP account certificate during dsync-based
migration of mail.

Verification may be disabled during testing, but should be enabled during
production use.

.. todo:: Indicate dsync setting


.. _setting-imapc_user:

``imapc_user``
--------------

- Default: <empty>

The user identity to be used for performing a regular IMAP LOGIN to the
source IMAP server in dsync-based migration of mail.

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-imapc_master_user`.
See also :ref:`setting-imapc_password`.

.. todo:: Indicate dsync setting


.. _setting-import_environment:

``import_environment``
----------------------

- Default: ``TZ CORE_OUTOFMEM CORE_ERROR``

A list of environment variables, space-separated, that are preserved and
passed to all child processes.

The list is space-separated, and it can include key = value pairs for
assigning variables the desired value upon Dovecot startup.

.. todo:: Explain default variables



.. _setting-info_log_path:

``info_log_path``
-----------------

The log file to use for informational messages. The default is to use
:ref:`setting-log_path` for informational messages too.


.. _setting-instance_name:

``instance_name``
-----------------

- Default: ``dovecot``

For multi-instance setups, supply the unique name of this Dovecot instance.

This simplifies use of commands such as doveadm: rather than using ``-c`` and
the config path, you can use the ``-i`` flag with the relevant instance name.


.. _setting-last_valid_gid:

``last_valid_gid``
------------------

- Default: ``0``
- Values: :ref:`uint`

This setting and ``first_valid_gid`` specify the valid GID range for users.

A user whose primary GID is outside this range is not allowed to log in.

``0`` means there is no explicit last GID.

If the user belongs to any supplementary groups, the corresponding IDs are
not set.

See also :ref:`setting-first_valid_gid`.


.. _setting-last_valid_uid:

``last_valid_uid``
------------------

- Default: ``0``
- Values: :ref:`uint`

This setting and ``first_valid_uid`` specify the valid UID range for users.

``0`` means there is no explicit last UID.

A user whose UID is outside this range is not allowed to log in.

See also :ref:`setting-last_valid_uid`.


.. _setting-lda_mailbox_autocreate:

``lda_mailbox_autocreate``
--------------------------

- Default: ``no``
- Values: :ref:`boolean`

Should LDA create a non-existent mailbox automatically when attempting to
save a mail message?

.. todo:: Indicate LDA setting


.. _setting-lda_mailbox_autosubscribe:

``lda_mailbox_autosubscribe``
-----------------------------

- Default: ``no``
- Values: :ref:`boolean`

Should automatically created mailboxes be subscribed to?

.. todo:: Indicate LDA setting


.. _setting-lda_original_recipient_header:

``lda_original_recipient_header``
---------------------------------

- Default: <empty>

The header from which the original recipient address (used in the SMTP RCPT
TO: address) is obtained if that address is not available elsewhere.

Example:

.. code-block:: none

   lda_original_recipient_header = X-Original-To

.. todo:: Indicate LDA setting


.. _setting-libexec_dir:

``libexec_dir``
---------------

- Default: ``/usr/libexec/dovecot``

The directory from which you execute commands via doveadm-exec.


.. _setting-listen:

``listen``
----------

- Default: ``*``, ``::``

A comma-separated list of IP addresses or hostnames on which external network
connections will be handled.

``*`` listens at all IPv4 interfaces, and ``::`` listens at all IPv6
interfaces.

Example:

.. code-block:: none

   listen = 127.0.0.1, 192.168.0.1


.. _setting-lmtp_add_received_header:

``lmtp_add_received_header``
----------------------------

.. versionadded:: v2.3.9

- Default: ``yes``
- Values: :ref:`boolean`

Controls if "Received:" header should be added to delivered mails.


.. _setting-lmtp_address_translate:

``lmtp_address_translate``
--------------------------

.. versionremoved:: 2.3.0

- Default: <empty>
- Values: :ref:`string`

Allows rewriting LMTP recipient address. Supports only %u, %d, %n variables.

Example:

.. code-block:: none

   lmtp_address_translate = %n@otherdomain.com


.. _setting-lmtp_client_workarounds:

``lmtp_client_workarounds``
---------------------------

.. versionadded:: v2.3.9

- Default: <empty>

Configures the list of active workarounds for LMTP client bugs. The list is
space-separated. Supported workaround identifiers are:

* ``whitespace-before-path`` - Allow one or more spaces or tabs between 'MAIL FROM:' and path and between 'RCPT TO:' and path.
* ``mailbox-for-path`` - Allow using bare Mailbox syntax (i.e., without <...>) instead of full path syntax.

.. todo:: Indicate LMTP setting

.. _setting-lmtp_hdr_delivery_address:

``lmtp_hdr_delivery_address``
-----------------------------

- Default: ``final``

The recipient address to use for the
Delivered-To: header and the relevant Received: header.

Options:

* ``alternative``: Address from the RCPT TO OCRPT parameter
* ``final``: Address from the RCPT TO command
* ``none``: No address (always used for messages with multiple recipients)

.. todo:: Indicate LMTP setting


.. _setting-lmtp_proxy:

``lmtp_proxy``
--------------

- Default: ``no``
- Values: :ref:`boolean`

Proxy to other LMTP/SMTP servers?

Proxy destination is determined via passdb lookup parameters.

See: https://wiki.dovecot.org/PasswordDatabase/ExtraFields/Proxy

.. todo:: Link to proxy documentation
.. todo:: Indicate LMTP setting


.. _setting-lmtp_proxy_rawlog_dir:

``lmtp_proxy_rawlog_dir``
-------------------------

- Default: <empty>

Directory location to store raw LMTP proxy protocol traffic logs.

:ref:`Mail service user variables <variables-mail_service_user>` can be used.
However, because LMTP session starts without a user, all user-specific
variables expand to empty.

See: https://wiki.dovecot.org/Debugging/Rawlog

.. todo:: Indicate LMTP setting
.. todo:: Link to rawlog documentation


.. _setting-lmtp_rawlog_dir:

``lmtp_rawlog_dir``
-------------------

- Default: <empty>

Directory location to store raw LMTP protocol traffic logs.

:ref:`Mail service user variables <variables-mail_service_user>` can be used.
However, because LMTP session starts without a user, all user-specific
variables expand to empty.

See: https://wiki.dovecot.org/Debugging/Rawlog

.. todo:: Indicate LMTP setting
.. todo:: Link to rawlog documentation


.. _setting-lmtp_rcpt_check_quota:

``lmtp_rcpt_check_quota``
-------------------------

- Default: ``no``
- Values: :ref:`boolean`

Should quota be verified before a reply to RCPT TO is issued?

If active, this creates a small amount of extra overhead so it is disabled by
default.

.. todo:: Indicate LMTP setting


.. _setting-lmtp_save_to_detail_mailbox:

``lmtp_save_to_detail_mailbox``
-------------------------------

- Default: ``no``
- Values: :ref:`boolean`

If the recipient address includes a detail element / role (as in
user+detail format), save the message to the detail mailbox.

.. todo:: Indicate LMTP setting


.. _setting-lmtp_user_concurrency_limit:

``lmtp_user_concurrency_limit``
-------------------------------

- Default: ``0``
- Values: :ref:`uint`

Limit the number of concurrent deliveries to a single user to this maximum
value.

It is useful if one user is receiving numerous mail messages and thereby
causing delays to other deliveries.

.. todo:: Indicate LMTP setting


.. _setting-lock_method:

``lock_method``
---------------

- Default: ``fcntl``
- Values: ``fcntl, flock, dotlock``

* **dotlock**: mailboxname.lock file created by almost all software when writing to mboxes. This grants the writer an exclusive lock over the mbox, so it's usually not used while reading the mbox so that other processes can also read it at the same time. So while using a dotlock typically prevents actual mailbox corruption, it doesn't protect against read errors if mailbox is modified while a process is reading.
* **flock**: flock() system call is quite commonly used for both read and write locking. The read lock allows multiple processes to obtain a read lock for the mbox, so it works well for reading as well. The one downside to it is that it doesn't work if mailboxes are stored in NFS.
* **fcntl**: Very similar to flock, also commonly used by software. In some systems this fcntl() system call is compatible with flock(), but in other systems it's not, so you shouldn't rely on it. fcntl works with NFS if you're using lockd daemon in both NFS server and client.

Specify the locking method to use for index files by setting
lock_method to one of the above values.

.. todo:: Describe values


.. _setting-log_core_filter:

``log_core_filter``
-------------------

- Default: <empty>

Crash after logging a matching event.  The syntax of the filter is described
in :ref:`event_filter_global`.

For example

.. code-block:: none

   log_core_filter = category=error

will crash any time an error is logged, which can be useful for debugging.


.. _setting-log_debug:

``log_debug``
-------------

- Default: <empty>

Filter to specify what debug logging to enable.  The syntax of the filter is
described in :ref:`event_filter_global`.

This will eventually replace ``mail_debug`` and ``auth_debug`` settings.

See :ref:`setting-auth_debug`

See :ref:`setting-mail_debug`


.. _setting-log_path:

``log_path``
------------

- Default: ``syslog``

Specify the log file to use for error messages here.

Options:

* ``syslog``: Log to syslog
* ``/dev/stderr``: Log to stderr

If you don't want to use syslog, or if you just can't find the Dovecot's error
logs, you can make Dovecot log elsewhere as well:

.. code-block:: none

   log_path = /var/log/dovecot.log

If you don't want errors, info, and debug logs all in one file, specify
:ref:`setting-info_log_path` or :ref:`setting-debug_log_path` as well:

.. code-block:: none

   log_path = /var/log/dovecot.log
   info_log_path = /var/log/dovecot-info.log


.. todo:: Any other possible settings?


.. _setting-log_timestamp:

``log_timestamp``
-----------------

- Default: ``%b %d %H:%M:%S``
- Values:  :ref:`string`

The prefix for each line written to the log file.

``%`` variables are in strftime(3) format.


.. _setting-login_access_sockets:

``login_access_sockets``
------------------------

- Default: <empty>

For blacklisting or whitelisting networks, supply a
space-separated list of login-access-check sockets for this setting.

Dovecot login processes can check via UNIX socket whether login should be
allowed for the incoming connection.


.. _setting-login_greeting:

``login_greeting``
------------------

- Default: ``Dovecot ready.``
- Values:  :ref:`string`

The greeting message displayed to clients.

Variables:

* LMTP: :ref:`Mail service user variables <variables-mail_service_user>`.
* Other protocols: :ref:`Login variables <variables-login>` can be used.

.. _setting-login_log_format:

``login_log_format``
--------------------

- Default: ``%$: %s``
- Values:  :ref:`string`

The formatting of login log messages.

Variables:

* :ref:`Global variables <variables-global>`.
* ``%s``: A ``login_log_format_elements`` string
* ``%$``: The log data

See :ref:`setting-login_log_format_elements`


.. _setting-login_log_format_elements:

``login_log_format_elements``
-----------------------------

- Default: ``user=<%u> method=%m rip=%r lip=%l mpid=%e %c``
- Values:  :ref:`string`

A space-separated list of elements of the login log formatting.

Elements that have a non-empty value are joined together to form a
comma-separated string.

:ref:`Login variables <variables-login>` can be used.

======== =============  =====================================================================================================
Variable Long name      Description
======== =============  =====================================================================================================
%u       user           full username (e.g. user@domain)
%n       username       user part in user@domain, same as %u if there's no domain
%d       domain         domain part in user@domain, empty if user with no domain
%h       home           Expands to HOME environment. Usually means it's empty.
%p       pid            PID of the current process
%m       mech           `authentication mechanism <https://wiki.dovecot.org/Authentication/Mechanisms>`_ e.g. PLAIN
%a       lport          local port
%b       rport          remote port
%c       secured        "secured" string with SSL, TLS and localhost connections. Otherwise empty.
%k       ssl_security   SSL protocol and cipher information, e.g. "TLSv1 with cipher DHE-RSA-AES256-SHA (256/256 bits)"
%e       mail_pid       Mail process (imap/pop3) PID that handles the post-login connection
-        real_rip       Same as %{rip}, except in proxy setups contains the remote proxy's IP instead of the client's IP
-        real_lip       Same as %{lip}, except in proxy setups contains the local proxy's IP instead of the remote proxy's IP (v2.2+)
-        real_rport     Similar to %{real_rip} except for port instead of IP (v2.2+)
-        real_lport     Similar to %{real_lip} except for port instead of IP (v2.2+)
-        orig_user      Same as %{user}, except using the original username the client sent before any changes by auth process (v2.2.6+, v2.2.13+ for auth)
-        orig_username  Same as %{username}, except using the original username (v2.2.6+, v2.2.13+ for auth)
-        orig_domain    Same as %{domain}, except using the original username (v2.2.6+, v2.2.13+ for auth)
-        auth_user      SASL authentication ID (e.g. if master user login is done, this contains the master username). If username changes during authentication, this value contains the original username. Otherwise the same as %{user}. (v2.2.11+)
-        auth_username  user part in %{auth_user} (v2.2.11+)
-        auth_domain    domain part in %{auth_user} (v2.2.11+)
-        listener       Expands to the socket listener name as specified in config file (v2.2.19+)
-        passdb:<name>  Return passdb extra field "name". %{passdb:name:default} returns "default" if "name" doesn't exist (not returned if name exists but is empty) (v2.2.19+)
======== =============  =====================================================================================================

.. todo:: Describe login elements
.. todo:: Provide join example


.. _setting-login_plugin_dir:

``login_plugin_dir``
--------------------

- Default: ``/usr/lib64/dovecot/login``

Location of the login plugin directory.


.. _setting-login_plugins:

``login_plugins``
-----------------

- Default: <empty>

List of plugins to load for IMAP and POP3 login processes.


.. _setting-login_proxy_timeout:

``login_proxy_timeout``
-----------------------

.. versionadded:: v2.3.12

- Default:``30 secs``
- Values: :ref:`time_msecs`

Timeout for login proxy failures.
The timeout covers everything from the time connection is started until a successful login reply is received.
This can be overwritten by proxy_timeout passdb extra field.


.. _setting-login_proxy_max_reconnects:

``login_proxy_max_reconnects``
------------------------------

.. versionadded:: v2.3.12

- Default:``3``

How many times login proxy will attempt to reconnect to destination server on connection failures (3 reconnects = total 4 connection attempts).
Reconnecting is done for most types of failures, except for regular authentication failures.
There is a 1 second delay between each reconnection attempt.
If :ref:`setting-login_proxy_timeout` is reached, further reconnects aren't attempted.


.. _setting-login_proxy_max_disconnect_delay:

``login_proxy_max_disconnect_delay``
------------------------------------

- Default:``0``

Specify the delayed disconnection interval of clients when there is a
server mass-disconnect.

For prevention of load spikes when a backend server fails or is restarted,
disconnection is spread over the amount of time indicated.

``0`` disables the delay.


.. _setting-login_proxy_notify_path:

``login_proxy_notify_path``
---------------------------

- Default: ``proxy-notify``

Path to proxy-notify pipe.

The default is OK and doesn't need to be change. 

:ref:`Login variables <variables-login>` can be used.

.. todo:: Indicate that this setting should not be changed.


.. _setting-login_source_ips:

``login_source_ips``
--------------------

- Default: <empty>
- Values:  :ref:`ip_addresses`

A list of hosts / IP addresses that are used in a round-robin manner for the
source IP address when the proxy creates TCP connections.

To allow sharing of the same configuration across
multiple servers, you may use a ``?`` character at the start of the
value to indicate that only the listed addresses that exist on the
current server should be used.

Example Setting:

.. code-block:: none
   
   login_source_ips = ?proxy-sources.example.com

.. todo:: Provide example of "?" usage


.. _setting-login_trusted_networks:

``login_trusted_networks``
--------------------------

- Default: <empty>

A space-separated list of trusted network ranges.

This setting is used for a few different purposes, but most importantly it allows the client connection to tell the server what the original client's IP address was.
This original client IP address is then used for logging and authentication checks.

Plaintext authentication is always allowed for trusted networks (:ref:`setting-disable_plaintext_auth` is ignored).

The details of how this setting works depends on the used protocol:

IMAP:

 * ID command can be used to override:

   * Session ID
   * Client IP and port (``%{rip}``, ``%{rport}``)
   * Server IP and port (``%{lip}``, ``%{lport}``)

 * ``forward_*`` fields can be sent to auth process's passdb lookup
 * The trust is always checked against the connecting IP address.
   Except if HAProxy is used, then the original client IP address is used.

POP3:

 * XCLIENT command can be used to override:

   * Session ID
   * Client IP and port (``%{rip}``, ``%{rport}``)

 * ``forward_*`` fields can be sent to auth process's passdb lookup
 * The trust is always checked against the connecting IP address.
   Except if HAProxy is used, then the original client IP address is used.

ManageSieve:

 * XCLIENT command can be used to override:

   * Session ID
   * Client IP and port (``%{rip}``, ``%{rport}``)

 * The trust is always checked against the connecting IP address.
   Except if HAProxy is used, then the original client IP address is used.

Submission:

 * XCLIENT command can be used to override:

   * Session ID
   * Client IP and port (``%{rip}``, ``%{rport}``)
   * HELO - Overrides what the client sent earlier in the EHLO command
   * LOGIN - Currently unused
   * PROTO - Currently unused

 * ``forward_*`` fields can be sent to auth process's passdb lookup
 * The trust is always checked against the connecting IP address.
   Except if HAProxy is used, then the original client IP address is used.

LMTP:

 * XCLIENT command can be used to override:

   * Session ID
   * Client IP and port (``%{rip}``, ``%{rport}``)
   * HELO - Overrides what the client sent earlier in the LHLO command
   * LOGIN - Currently unused
   * PROTO - Currently unused
   * TIMEOUT (overrides :ref:`setting-mail_max_lock_timeout`)

 * The trust is always checked against the connecting IP address.
   Except if HAProxy is used, then the original client IP address is used.


.. _setting-mail_access_groups:

``mail_access_groups``
----------------------

- Default: <empty>

Supplementary groups that are granted access for mail processes.

Typically, these are used to set up access to shared mailboxes.

Note: it may be dangerous to set these up if users can create
symlinks. For example: if the "mail" group is chosen here,
``ln -s /var/mail ~/mail/var`` could allow a user to delete others'
mailboxes, or ``ln -s /secret/shared/box ~/mail/mybox`` would allow reading
others' mail).

.. todo:: Describe format; comma-separated list?


.. _setting-mail_always_cache_fields:

``mail_always_cache_fields``
----------------------------

- Default: <empty>

The fields specified here are always added to cache when saving mails, even
if the client never accesses these fields.

See :ref:`mail_cache_settings` for details and for the list of fields.

See :ref:`setting-mail_cache_fields`

See :ref:`setting-mail_never_cache_fields`


.. _setting-mail_attachment_detection_options:

``mail_attachment_detection_options``
-------------------------------------

- Default: <empty>

Settings to control adding ``$HasAttachment`` or ``$HasNoAttachment`` keywords. By default, all MIME parts with ``Content-Disposition=attachment``, or inlines with filename parameter are considered attachments.

To enable this feature, this setting needs at least one option specified.

Options:

* **add-flags** - Attachments are detected and marked during save.
  Detection is done also during fetch if it can be done without extra disk IO and with minimal CPU cost.
  This means that either both ``mime.parts`` and ``imap.bodystructure`` has to be in cache already, or if mail body is opened in any case.

  .. versionadded:: v2.3.13
* **add-flags-on-save** - Deprecated alias for **add-flags**.
  Before v2.3.13 the detection was done only during save, not during fetch.

  .. deprecated:: v2.3.13
* **add-flags no-flags-on-fetch** - Flags are added during save, but not during fetch.
  This option will likely be removed in a later release.

  .. versionadded:: v2.3.13
* **content-type=type|!type** - Include or exclude given content type. Including will only negate an exclusion (e.g. ``content-type=!foo/* content-type=foo/bar``).
* **exclude-inlined** - Do not consider any attachment with disposition inlined.

.. todo:: Description
.. todo:: Explain value format: comma-separate list?


.. _setting-mail_attachment_dir:

``mail_attachment_dir``
-----------------------

- Default: <empty>

The directory in which to store mail attachments.

With sdbox and mdbox, mail attachments can be saved to external files,
which also allows single-instance storage of them.

If no value is specified, attachment saving to external files is disabled.

:ref:`Mail user variables <variables-mail_user>` can be used.


.. _setting-mail_attachment_fs:

``mail_attachment_fs``
----------------------

- Default: ``sis posix``

Which filesystem type to use for saving attachments.

Options:

* ``posix``: No single-instance storage done (this option might simplify the filesystem's own de-duplication operations)
* ``sis posix``: SiS with immediate byte-by-byte comparison during saving
* ``sis-queue posix``: Sis with delayed comparison and de-duplication

:ref:`Mail user variables <variables-mail_user>` can be used.


.. _setting-mail_attachment_hash:

``mail_attachment_hash``
------------------------

- Default: ``%{sha1}``
- Values: ``%{md4}, %{md5}, %{sha1}, %{sha256}, %{sha512}, %{size}``

The hash format to use in attachment filenames when saving attachments
externally.

Variables and additional text can be included in this string.

The syntax allows truncation of any variable. For example ``%{sha256:80}``
will return only the first 80 bits of the SHA256 output.


.. _setting-mail_attachment_min_size:

``mail_attachment_min_size``
----------------------------

- Default: ``128k``
- Values:  :ref:`size`

Attachments below this size will not be saved externally.


.. _setting-mail_attribute_dict:

``mail_attribute_dict``
-----------------------

- Default: <empty>

The dictionary to be used for key=value mailbox attributes.

This is used by the URLAUTH and METADATA extensions.

:ref:`Mail user variables <variables-mail_user>` can be used.

Example Setting:

.. code-block:: none

   mail_attribute_dict = file:%h/dovecot-attributes

See :ref:`setting-imap_metadata`

.. todo:: Indicate metadata setting


.. _setting-mail_cache_fields:

``mail_cache_fields``
---------------------

- Default: ``flags``

The default list of fields that are added to cache if no other caching
decisions exist yet. This setting is used only when creating the initial
INBOX for the user. Other folders get their defaults from the INBOX.

See :ref:`mail_cache_settings` for details and for the list of fields.

See :ref:`setting-mail_always_cache_fields`

See :ref:`setting-mail_never_cache_fields`

.. todo:: List fields, or link to fields decription page


.. _setting-mail_cache_min_mail_count:

``mail_cache_min_mail_count``
-----------------------------

- Default: ``0``
- Values: :ref:`uint`

Only update cache file when the mailbox contains at least this many messages.

With a setting other than ``0``, you can optimize behavior for fewer disk
writes at the cost of more disk reads.


.. _setting-mail_chroot:

``mail_chroot``
---------------

- Default: <empty>

The default chroot directory for mail processes.

This chroots all users globally into the same directory.

:ref:`Mail service user variables <variables-mail_service_user>` can be used.


.. _setting-mail_debug:

``mail_debug``
--------------

- Default: ``no``
- Values: :ref:`boolean`

This setting adjusts log verbosity.  It enables mail-process
debugging.  This can help you figure out the reason if Dovecot
isn't finding certain mail messages.  


.. _setting-mail_fsync:

``mail_fsync``
--------------

- Default: ``optimized``

Specify when to use fsync() or fdatasync() calls.
Using fsync waits until the data is written to disk before it continues, which is used to prevent corruption or data loss in case of server crashes.
This setting applies to mail files and index files on the filesystem.
This setting doesn't apply to object storage operations.

Options:

* ``always``: Use fsync after all disk writes.
  Recommended for NFS to make sure there aren't any delayed write()s.
* ``optimized``: Use fsync after important disk writes.
  For example cache file writes aren't fsynced, because they can be regenerated if necessary.
* ``never``: Never fsync any disk writes.
  This provides the best performance, but risks losing recently saved emails in case of a crash with most mailbox formats.

  With obox format this option is recommended to be used, because it affects only the local metacache operations.
  If a server crashes, the existing metacache is treated as potentially corrupted and isn't used.


.. _setting-mail_full_filesystem_access:

``mail_full_filesystem_access``
-------------------------------

- Default: ``no``
- Values: :ref:`boolean`

Allow full filesystem access to clients?

If enabled, no access checks are performed other than what the operating
system does for the active UID/GID.

This setting works with both Maildir and mbox formats, allowing you to prefix
mailboxes' names with /path/ or ~user/ indicators.


.. _setting-mail_gid:

``mail_gid``
------------

- Default: <empty>

The system group ID used for accessing mail messages.

Can be either numeric IDs or group names.

If you use multiple values here, userdb can override them by returning the
gid field.

See :ref:`setting-mail_uid`

.. todo:: Describe value format (comma-separate list?)


.. _setting-mail_home:

``mail_home``
-------------

- Default: <empty>

The are various possible ways of specifying this parameter and mail_location.
The following example is one option when home=/var/vmail/domain/user/ and
mail=/var/vmail/domain/user/mail/:

.. code-block:: none

   mail_home = /var/vmail/%d/%n
   mail_location = maildir:~/mail

:ref:`Mail service user variables <variables-mail_service_user>` can be used.

See :ref:`setting-mail_location`

See: https://wiki.dovecot.org/QuickConfiguration

.. todo:: Link to configuration page - this is too complex for config page


.. _setting-mail_location:

``mail_location``
-----------------

- Default: <empty>

This setting indicates the location for users' mailboxes.

For an empty value, Dovecot attempts to find the mailboxes
automatically (looking at ``~/Maildir, /var/mail/username, ~/mail, and
~/Mail``, in that order). However, auto-detection commonly fails for
users whose mail directory hasn't yet been created, so you should
explicitly state the full location here, if possible.

:ref:`Mail user variables <variables-mail_user>` can be used.

.. _setting-mail_log_prefix:

``mail_log_prefix``
-------------------

- Default: ``%s(%u)<%{pid}><%{session}>:``

You can specify a log prefix for mail processes here.

Example setting: 

.. code-block:: none

   mail_log_prefix = "%s(%u): "

:ref:`Mail service user variables <variables-mail_service_user>` can be used.


.. _setting-mail_max_keyword_length:

``mail_max_keyword_length``
---------------------------

- Default: ``50``
- Values: :ref:`uint`

The maximum length allowed for a mail keyword name.

Compliance is enforced only during attempts to create new keywords


.. _setting-mail_max_lock_timeout:

``mail_max_lock_timeout``
-------------------------

- Default: ``0``

This value is used as a timeout for tempfailing mail connections.  It
can be set globally, for application to all Dovecot services, but
is normally better to set it in only certain protocol blocks.  You
may wish to set a value for this for LMTP and LDA while leaving it at
the global default of ``0`` for IMAP and POP3 connections, which
tolerate tempfailing less well.

.. todo:: Link to page explaining this option


.. _setting-mail_max_userip_connections:

``mail_max_userip_connections``
-------------------------------

- Default: ``10``
- Values: :ref:`uint`

The maximum number of IMAP connections allowed for a user from each IP
address.
This setting is checked only by backends, not proxies.
Note that for this to work, any username changes must be done already by passdb lookup (not by userdb lookup).

Unique users are identified via case-sensitive comparison.


.. _setting-mail_never_cache_fields:

``mail_never_cache_fields``
---------------------------

- Default: ``imap.envelope``

List of fields that should never be cached.

This should generally never include anything other than ``imap.envelope``,
which isn't needed because it can be generated from the cached header fields.

See :ref:`mail_cache_settings` for details and for the list of fields.

See :ref:`setting-mail_cache_fields`

See :ref:`setting-mail_always_cache_fields`

.. _setting-mail_nfs_index:

``mail_nfs_index``
------------------

- Default: ``no``
- Values: :ref:`boolean`

When mail-index files exist in NFS storage and you're running a
multi-server setup that you wish to flush NFS caches, this can be set
to ``yes`` (in this case, make sure also to use the settings).

.. code-block:: none

   mmap_disable=yes and fsync_disable=no 

See :ref:`setting-mail_fsync`
See :ref:`setting-mmap_disable`


.. _setting-mail_nfs_storage:

``mail_nfs_storage``
--------------------

- Default: ``no``
- Values: :ref:`boolean`

Flush NFS caches whenever it is necessasry to do so.

This setting should only be enabled if you are using multiple servers on NFS.


.. _setting-mail_plugin_dir:

``mail_plugin_dir``
-------------------

- Default: ``/usr/lib64/dovecot``

The directory in which to search for Dovecot mail plugins.

See :ref:`setting-mail_plugins`


.. _setting-mail_plugins:

``mail_plugins``
----------------

- Default: <empty>

A spece-separated list of plugins to load.

See :ref:`setting-mail_plugin_dir`


.. _setting-mail_prefetch_count:

``mail_prefetch_count``
-----------------------

- Default: ``0``
- Values: :ref:`uint`

The maximum number of messages to keep open and prefetch to memory.

``0`` indicates no limit should be applied.

Behavior is dependent on the operating system and mailbox format.


.. _setting-mail_privileged_group:

``mail_privileged_group``
-------------------------

- Default: <empty>

This group is enabled temporarily for privileged operations.  Currently, 
this is used only with the INBOX when either its initial creation or
dotlocking fails.
Typically, this is set to ``mail`` to give access to ``/var/mail``.

You can give Dovecot access to mail group by setting:

.. code-block:: none 

   mail_privileged_group = mail

.. todo:: Better explanation
.. todo:: Provide example


.. _setting-mail_save_crlf:

``mail_save_crlf``
------------------

- Default: ``no``
- Values: :ref:`boolean`

Save message with CR+LF line endings?

Messages are normally saved with LF line endings.

Enabling this makes saving messages less CPU-intensive, especially with the
sendfile() system call used in Linux and FreeBSD. However, enabling comes at
the cost of slightly increased disk I/O, which could decrease the speed in
some deployments.


.. _setting-mail_server_admin:

``mail_server_admin``
---------------------

- Default: <empty>

The method for contacting the server administrator.

Per the METADATA standard (RFC 5464), this value MUST be a URI (e.g.,
a mailto: or tel: URL), but that requirement is not enforced by Dovecot.

This value is accessible to authenticated users through the ``/shared/admin``
IMAP METADATA server entry.

.. code-block:: none

   mail_server_admin = mailto:admin@example.com

See :ref:`setting-imap_metadata`

.. todo:: Indicate metadata setting


.. _setting-mail_server_comment:

``mail_server_comment``
-----------------------

- Default: <empty>

A comment or note that is associated with the server.

This value is accessible to authenticated users through the
``/shared/comment`` IMAP METADATA server entry.

See :ref:`setting-imap_metadata`

.. todo:: Indicate metadata setting


.. _setting-mail_shared_explicit_inbox:

``mail_shared_explicit_inbox``
------------------------------

- Default: ``no``
- Values: :ref:`boolean`

This setting determines whether a shared INBOX should be visible as
"shared/user" or as "shared/user/INBOX" instead.

.. todo:: Double check description is correct


.. _setting-mail_sort_max_read_count:

``mail_sort_max_read_count``
----------------------------

- Default: ``0``
- Values: :ref:`uint`

The number of slow mail accesses an IMAP SORT can perform before it returns
failure to the client.

On failure, the untagged SORT reply is retuned, but it is likely not correct.

The IMAP reply returned to the client is:

.. code-block:: none

   NO [LIMIT] Requested sort would have taken too long.

As a special case with the obox format when doing a ``SORT (ARRIVAL)``, the SORT will always return OK.
When it reaches the slow access limit, it falls back to using the save-date (instead of received-date) for the rest of the mails.
Often this produces mostly the same result, especially in the INBOX.


.. _setting-mail_temp_dir:

``mail_temp_dir``
-----------------

- Default: ``/tmp``

The directory in which LDA/LMTP will temporarily store incoming message data
that is above 128kB in size.

:ref:`Mail user variables <variables-mail_user>` can be used.

.. todo:: Indicate LDA setting
.. todo:: Indicate LMTP setting


.. _setting-mail_temp_scan_interval:

``mail_temp_scan_interval``
---------------------------

- Default: ``1week``
- Values:  :ref:`time`

How often Dovecot scans for and deletes stale temporary files.

These files are usually created only if Dovecot crashes when saving a message.

A value of ``0`` means this scan never occurs.


.. _setting-mail_uid:

``mail_uid``
------------

- Default: <empty>

This setting indicates the system userid used for accessing mail
messages.  If you use multiple values here, userdb can override them
by returning UID or GID fields.  You can use either numeric IDs or
usernames here.

See :ref:`setting-mail_gid`

.. todo:: Describe value format (comma-separate list?)


.. _setting-mail_vsize_bg_after_count:

``mail_vsize_bg_after_count``
-----------------------------

- Default: ``0``
- Values: :ref:`uint`

Controls transitioning mail size determination to the background instead of
synchronously during the delivery process.

After this many messages have been opened, the system allows a background
indexer-worker process to perform quota calculations in the background.

This may happen when mail messages do not have their virtual sizes cached.

When indexing is occuring in the background, explicit quota size queries
return an internal error and mail deliveries are assumed to succeed.

See: https://wiki.dovecot.org/Quota

.. todo:: Link to quota page


.. _setting-mailbox_idle_check_interval:

``mailbox_idle_check_interval``
-------------------------------

- Default: ``30secs``
- Values:  :ref:`time`

The minimum time between checks for new mail/other changes when a mailbox
is in the IMAP IDLE state.

.. todo:: Indicate imap setting


.. _setting-mailbox_list_index:

``mailbox_list_index``
----------------------

- Default: ``yes``
- Values: :ref:`boolean`

These indexes live at the root of user's mailbox storage, and allows quick
lookup of mailbox status instead of needing to open all mailbox indexes
separately.

Enabling this optimizes the server reply to IMAP STATUS commands, which are
commonly issues. This also needs to be enabled if you wish to enable the IMAP
NOTIFY extension.

.. todo:: Link to IMAP NOTIFY documentation


.. _setting-mailbox_list_index_include_inbox:

``mailbox_list_index_include_inbox``
------------------------------------

- Default: ``no``
- Values: :ref:`boolean`

Should INBOX be kept up-to-date in the mailbox list index?

Disabled by default as most mailbox accesses will open INBOX anyway.

See :ref:`setting-mailbox_list_index`


.. _setting-mailbox_list_index_very_dirty_syncs:

``mailbox_list_index_very_dirty_syncs``
---------------------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, assume that the mailbox list index is fully updated so that
stat() will not be run for mailbox files/directories.


``maildir_broken_filename_sizes``
---------------------------------

See :ref:`setting-maildir_broken_filename_sizes`


``maildir_copy_with_hardlinks``
-------------------------------

See :ref:`setting-maildir_copy_with_hardlinks`


``maildir_empty_new``
---------------------

See :ref:`setting-maildir_empty_new`


``maildir_stat_dirs``
---------------------

See :ref:`setting-maildir_stat_dirs`


``maildir_very_dirty_syncs``
----------------------------

See :ref:`setting-maildir_very_dirty_syncs`


.. _setting-master_user_separator:

``master_user_separator``
-------------------------

- Default: <empty>

The separator to use to enable master users to login by specifying the master
username within the normal username string (i.e., not using the SASL
mechanism's master support).

Example:

.. code-block:: none

   # Allows master login of the format <username>*<masteruser>
   # E.g. if user = foo, and master_user = muser,
   #   login username = foo*muser
   master_user_separator = *


.. _setting-mbox_dirty_syncs:

``mbox_dirty_syncs``
--------------------

- Default: ``yes``
- Values: :ref:`boolean`

mbox only: Enable optimized mbox syncing?

For larger mbox files, it can take a long time to determine what has
changed when the file is altered unexpectedly. Since the change in
most cases consists solely of newly appended mail, Dovecot can
operate more quickly if it starts off by simply reading the new
messages, then falls back to reading the entire mbox file if
something elsewhere in it isn't as expected.

See :ref:`setting-mbox_very_dirty_syncs`

.. todo:: Indicate mbox-only setting


.. _setting-mbox_dotlock_change_timeout:

``mbox_dotlock_change_timeout``
-------------------------------

- Default: ``2 mins``
- Values:  :ref:`time`

mbox only: Override a lockfile after this amount of time if a dot-lock exists
but the mailbox hasn't been modified in any way.

.. todo:: Indicate mbox-only setting


.. _setting-mbox_lazy_writes:

``mbox_lazy_writes``
--------------------

- Default: ``yes``
- Values: :ref:`boolean`

mbox only: If enabled, mbox headers are not written until a
full write sync is performed (with the EXPUNGE and CHECK commands and
during closing of the mailbox).

Enabling this setting is especially useful with POP3, in which clients often
delete all mail messages.

One negative consequence of enabling this setting is that the changes aren't
immediately visible to other MUAs.

.. todo:: Indicate mbox-only setting


.. _setting-mbox_lock_timeout:

``mbox_lock_timeout``
---------------------

- Default: ``5mins``
- Values:  :ref:`time`

mbox only: The maximum time to wait for all locks to be released before
aborting.

.. todo:: Indicate mbox-only setting


.. _setting-mbox_md5:

``mbox_md5``
------------

- Default: ``apop3d``

mbox only: The mail-header selection algorithm to use for MD5 POP3 UIDLs when
the setting ``pop3_uidl_format=%m`` is applied.

See :ref:`setting-pop3_uidl_format`

.. todo:: Indicate mbox-only setting


.. _setting-mbox_min_index_size:

``mbox_min_index_size``
-----------------------

- Default: ``0``

mbox only: For mboxes smaller than this size, index files are not
written.

If an index file already exists, it gets read but not updated.

The default is OK and doesn't need to be change. 

.. todo:: Indicate mbox-only setting
.. todo:: Should not be changed


.. _setting-mbox_read_locks:

``mbox_read_locks``
-------------------

- Default: ``fcntl``
- Values: ``dotlock, dotlock_try, fcntl, flock, lockf``

mbox only: Specify which locking method(s) to use for locking the mbox files
during reading.

To use multiple values, separate them with spaces.

There are at least four different ways to lock a mbox:

* **dotlock**: mailboxname.lock file created by almost all software when writing to mboxes. This grants the writer an exclusive lock over the mbox, so it's usually not used while reading the mbox so that other processes can also read it at the same time. So while using a dotlock typically prevents actual mailbox corruption, it doesn't protect against read errors if mailbox is modified while a process is reading.

* **flock**: flock() system call is quite commonly used for both read and write locking. The read lock allows multiple processes to obtain a read lock for the mbox, so it works well for reading as well. The one downside to it is that it doesn't work if mailboxes are stored in NFS.

* **fcntl**: Very similar to flock, also commonly used by software. In some systems this fcntl() system call is compatible with flock(), but in other systems it's not, so you shouldn't rely on it. fcntl works with NFS if you're using lockd daemon in both NFS server and client.

* **lockf**: POSIX lockf() locking. Because it allows creating only exclusive locks, it's somewhat useless so Dovecot doesn't support it. With Linux lockf() is internally compatible with fcntl() locks, but again you shouldn't rely on this.


.. todo:: Explain differences between values
.. todo:: Indicate mbox-only setting


.. _setting-mbox_very_dirty_syncs:

``mbox_very_dirty_syncs``
-------------------------

- Default: ``no``
- Values: :ref:`boolean`

mbox only: If enabled, Dovecot performs the optimizations from
``mbox_dirty_syncs`` also for the IMAP SELECT, EXAMINE, EXPUNGE, and CHECK
commands.

If set, this option overrides ``mbox_dirty_syncs``.

See :ref:`setting-mbox_dirty_syncs`

.. todo:: Indicate mbox-only setting


.. _setting-mbox_write_locks:

``mbox_write_locks``
--------------------

- Default: ``dotlock fcntl``
- Values: ``dotlock, dotlock_try, fcntl, flock, lockf``

mbox only: Specify which locking method(s) to use for locking the mbox files
during writing.

To use multiple values, separate them with spaces.

There are at least four different ways to lock a mbox:

* **dotlock**: mailboxname.lock file created by almost all software when writing to mboxes. This grants the writer an exclusive lock over the mbox, so it's usually not used while reading the mbox so that other processes can also read it at the same time. So while using a dotlock typically prevents actual mailbox corruption, it doesn't protect against read errors if mailbox is modified while a process is reading.

* **flock**: flock() system call is quite commonly used for both read and write locking. The read lock allows multiple processes to obtain a read lock for the mbox, so it works well for reading as well. The one downside to it is that it doesn't work if mailboxes are stored in NFS.

* **fcntl**: Very similar to flock, also commonly used by software. In some systems this fcntl() system call is compatible with flock(), but in other systems it's not, so you shouldn't rely on it. fcntl works with NFS if you're using lockd daemon in both NFS server and client.

* **lockf**: POSIX lockf() locking. Because it allows creating only exclusive locks, it's somewhat useless so Dovecot doesn't support it. With Linux lockf() is internally compatible with fcntl() locks, but again you shouldn't rely on this.

.. todo:: Explain differences between values
.. todo:: Indicate mbox-only setting


.. _setting-mdbox_preallocate_space:

``mdbox_preallocate_space``
---------------------------

- Default: ``no``
- Values: :ref:`boolean`

mdbox only: If enabled, preallocate space for newly created files.

In creation of new mdbox files, their size is immediately
preallocated as ``mdbox_rotate_size``.

This setting currently works only in Linux with certain filesystems (ext4
and xfs).

See :ref:`setting-mdbox_rotate_size`

.. todo:: Indicate mdbox-only setting


.. _setting-mdbox_rotate_interval:

``mdbox_rotate_interval``
-------------------------

- Default: ``0``
- Values:  :ref:`size`

mdbox only: The maximum age the dbox file may reach before it's rotated.

``0`` means there is no age-based rotation.

.. todo:: Indicate mdbox-only setting


.. _setting-mdbox_rotate_size:

``mdbox_rotate_size``
---------------------

- Default: ``10M``
- Values:  :ref:`size`

mdbox only: The maximum size the dbox file may reach before it is rotated.

.. todo:: Indicate mdbox-only setting


.. _setting-mmap_disable:

``mmap_disable``
----------------

- Default: ``no``
- Values: :ref:`boolean`

Disable mmap() usage?

This must be disabled if you store indexes to shared filesystems (i.e., if you
use NFS or a clustered filesystem).


.. _setting-namespace:

``namespace``
-------------

Declares new namespace, see :ref:`namespaces` for more details.

.. _setting-old_stats_carbon_interval:

``old_stats_carbon_interval``
-----------------------------

.. versionadded:: v2.2.27

- Default: ``30secs``
- Values:  :ref:`time`

The interval at which to send stats to the Carbon server.

See :ref:`setting-old_stats_carbon_server`

.. todo:: Indicate old stats setting


.. _setting-old_stats_carbon_name:

``old_stats_carbon_name``
-------------------------

.. versionadded:: v2.2.27

- Default: <empty>

The identifier to use for this node when exporting stats to the Carbon server.

Do not use dots (``.``) in this setting.

Example:

.. code-block:: none

   stats_carbon_name = hostname

See :ref:`setting-old_stats_carbon_server`

.. todo:: Indicate old stats setting


.. _setting-old_stats_carbon_server:

``old_stats_carbon_server``
---------------------------

.. versionadded:: v2.2.27

- Default: <empty>

Send server statistics to an external Carbon server.

Format is ``<hostname | ip>:<port>``.

Example Setting:

.. code-block:: none

   127.0.0.1:2003
.. todo:: Indicate old stats setting
.. todo:: Is this correct default setting?


.. _setting-old_stats_command_min_time:

``old_stats_command_min_time``
------------------------------

- Default: ``1min``
- Values:  :ref:`time`

Command-level stats older than this value will be cleared once the memory
limit in ``old_stats_memory_limit`` is reached.

See :ref:`setting-old_stats_memory_limit`

.. todo:: Indicate old stats setting


.. _setting-old_stats_domain_min_time:

``old_stats_domain_min_time``
-----------------------------

- Default: ``12hours``
- Values:  :ref:`time`

Domain-level stats older than this value will be cleared once the memory
limit in ``old_stats_memory_limit`` is reached.

See :ref:`setting-old_stats_memory_limit`

.. todo:: Indicate old stats setting


.. _setting-old_stats_ip_min_time:

``old_stats_ip_min_time``
-------------------------

- Default: ``12hours``
- Values:  :ref:`time`

IP Address-level stats older than this value will be cleared once the memory
limit in ``old_stats_memory_limit`` is reached.

See :ref:`setting-old_stats_memory_limit`

.. todo:: Indicate old stats setting


.. _setting-old_stats_memory_limit:

``old_stats_memory_limit``
--------------------------

- Default: ``16M``
- Values:  :ref:`size`

The maximum amount of memory that can be used by the old stats process.

.. todo:: Indicate old stats setting


.. _setting-old_stats_session_min_time:

``old_stats_session_min_time``
------------------------------

- Default: ``15mins``
- Values:  :ref:`time`

Session-level stats older than this value will be cleared once the memory
limit in ``old_stats_memory_limit`` is reached.

See :ref:`setting-old_stats_memory_limit`

.. todo:: Indicate old stats setting


.. _setting-old_stats_user_min_time:

``old_stats_user_min_time``
---------------------------

- Default: ``1hour``
- Values:  :ref:`time`

User-level stats older than this value will be cleared once the memory
limit in ``old_stats_memory_limit`` is reached.

See :ref:`setting-old_stats_memory_limit`

.. todo:: Indicate old stats setting


.. _setting-pop3_client_workarounds:

``pop3_client_workarounds``
---------------------------

- Default: <empty>

Workarounds for various POP3 client bugs can be enabled here.  The list is
space-separated.

The following values are currently supported:

``oe-ns-eoh``:

   Because Outlook Express and Netscape Mail expect an end-of-headers
   line, this option sends one explicitly if none has been sent.

``outlook-no-nuls``:

   Because Outlook and Outlook Express hang if messages contain NUL
   characters, this setting replaces each of them with a 0x80 character.

.. todo:: Indicate POP3 setting


.. _setting-pop3_delete_type:

``pop3_delete_type``
--------------------

- Default: < >
- Values: ``flag`` or ``expunge``

Action to perform in POP3 when mails are deleted and the ``pop3_deleted_flag``
is enabled.

See :ref:`setting-pop3_deleted_flag`

.. todo:: Indicate POP3 setting
.. todo:: Describe difference between flag and expunge


.. _setting-pop3_deleted_flag:

``pop3_deleted_flag``
---------------------

- Default: <empty>

Change POP3 behavior so a user cannot permanently delete messages via POP3.

Instead, the messages are hidden from POP3 sessions by setting an IMAP
flag, which Dovecot will filter out in future listings.

To enable this behavior, enter the name of the IMAP keyword to use. Note: this
keyword will visibile on IMAP clients for the message.

Example:

.. code-block:: none

   pop3_deleted_flag = $POP3Deleted

See :ref:`setting-pop3_delete_type`

.. todo:: Indicate POP3 setting


.. _setting-pop3_enable_last:

``pop3_enable_last``
--------------------

- Default: ``no``
- Values: :ref:`boolean`

Enable support for the POP3 LAST command.

While this command has been removed from newer POP3 specs, some clients still
attempt to use it. Enabling this causes the RSET command to clear all \Seen
flags that messages may have.

.. todo:: Indicate POP3 setting


.. _setting-pop3_fast_size_lookups:

``pop3_fast_size_lookups``
--------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, use the virtual message size of the message for POP3 replies if
available.

POP3 requires message sizes to be listed as if they contain CR+LF
line breaks; however, many POP3 servers instead return the sizes with
pure line feeds (LFs), for the sake of speed.

If enabled, use the virtual message size if available, before
falling back to the incorrect, physical size (used by many POP3
servers) if judging the correct size would have required opening the
message to determine.

.. todo:: Indicate POP3 setting


.. _setting-pop3_lock_session:

``pop3_lock_session``
---------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, only one POP3 session may exist for any single user.

.. todo:: Indicate POP3 setting


.. _setting-pop3_logout_format:

``pop3_logout_format``
----------------------

- Default: ``top=%t/%p``, ``retr=%r/%b``, ``del=%d/%m``, ``size=%s``
- Values:  :ref:`string`

The string to display to the client on POP3 logout (informational only).

Variables available:

* :ref:`Mail user variables <variables-mail_user>`.
* ``%{input}`` / ``%i``: Bytes read from the client
* ``%{output}`` / ``%o``: Bytes sent to the client
* ``%{top_count}`` / ``%t``: Number of TOP commands run
* ``%{top_bytes}`` / ``%p``: Bytes sent to the client because of TOP commands
* ``%{retr_count}`` / ``%r``: Number of RETR commands run
* ``%{retr_bytes}`` / ``%b``: Bytes sent to the client because of RETR commands
* ``%{deleted_count}`` / ``%d``: Number of deleted messages
* ``%{deleted_bytes}``: Number of bytes in deleted messages
* ``%{message_count}`` / ``%m``: Number of messages before deletion
* ``%{message_bytes}`` / ``%s``: Mailbox size, in bytes, before deletion
* ``%{uidl_change}`` / ``%u``: The old and the new UIDL hash (which can be useful for identifying unexpected changes in UIDLs)

.. todo:: Indicate POP3 setting


.. _setting-pop3_no_flag_updates:

``pop3_no_flag_updates``
------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, do not attempt to mark mail messages as seen or non-recent when a
POP3 session is involved.

.. todo:: Indicate POP3 setting


.. _setting-pop3_reuse_xuidl:

``pop3_reuse_xuidl``
--------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, and the mail message has an X-UIDL header, use this as the mail's
UIDL.

.. todo:: Indicate POP3 setting


.. _setting-pop3_save_uidl:

``pop3_save_uidl``
------------------

- Default: ``no``
- Values: :ref:`boolean`

Maildir only: If enabled, allow permanent permanent saving of UIDLs sent to
POP3 clients so that changes to ``pop3_uidl_format`` don't cause
future changes to the corresponding UIDLs.

See :ref:`setting-pop3_uidl_format`

.. todo:: Indicate Maildir-only setting
.. todo:: Indicate POP3 setting


.. _setting-pop3_uidl_duplicates:

``pop3_uidl_duplicates``
------------------------

- Default: ``allow``
- Values: ``allow`` or ``rename``

How to handle any duplicate POP3 UIDLs that may exist.

Options:

* ``allow``: Show duplicates to clients
* ``rename``: Append a temporary counter (such as -2 or -3) after the UIDL

.. todo:: Indicate POP3 setting


.. _setting-pop3_uidl_format:

``pop3_uidl_format``
--------------------

- Default: ``%08Xu%08Xv``
- Values:  :ref:`string`

The POP3 unique mail identifier (UIDL) format to use.

The following variables can be used in combination with the
standard variable modifiers (e.g., %Uf supplies the filename in uppercase):

* :ref:`Global variables <variables-global>`.
* ``%{uidvalidity}`` / ``%v``: Mailbox's IMAP UIDVALIDITY value
* ``%{uid}`` / ``%u``: IMAP UID associated with the message
* ``%{md5}`` / ``%m``: MD5 sum of the mailbox headers in hex (mbox only)
* ``%{filename}`` / ``%f``: Filename (Maildir only)
* ``%{guid}`` / ``%g``: Dovecot GUID for the message

.. todo:: Indicate POP3 setting


.. _setting-pop3c_features:

``pop3c_features``
------------------

- Default: <empty>

A space-separated list of features and workarounds that can be enabled for
access to a remote POP3 server.

Available options:

* ``no-pipelining``: Prevents use of the PIPELINING extension even when it's advertised

.. todo:: Indicate dsync setting


.. _setting-pop3c_host:

``pop3c_host``
--------------

- Default: <empty>

The remote POP3 server to use for dsync-based migration of mail (which allows
preservation of the POP3 UIDLs etc.).

Example:

.. code-block:: none

   pop3c_host = pop3.example.com

.. todo:: Indicate dsync setting


.. _setting-pop3c_master_user:

``pop3c_master_user``
---------------------

- Default: <empty>

If you are using master users for dsync-based migration of mail,
this is the master user for the source POP3 server.

To authenticate as a master user but use a separate login user, the
following configuration should be employed, where the credentials are
represented by masteruser and masteruser-secret:

.. code-block:: none

   pop3c_user = %u
   pop3c_master_user = masteruser
   pop3c_password = masteruser-secret

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-pop3c_password`.

See also :ref:`setting-pop3c_user`.

.. todo:: Indicate dsync setting


.. _setting-pop3c_password:

``pop3c_password``
------------------

- Default: <empty>

The password used in the login to the source POP3 server for migration of mail
via dsync.

If using master users, this setting will be the password of the master user.

See also :ref:`setting-pop3c_master_user`.

See also :ref:`setting-pop3c_user`.

.. todo:: Indicate dsync setting


.. _setting-pop3c_port:

``pop3c_port``
--------------

- Default: ``110``

Port used for connection to the source POP3 server in dsync-based migration of
mail.

.. todo:: Indicate dsync setting


.. _setting-pop3c_quick_received_date:

``pop3c_quick_received_date``
-----------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, dsync doesn't require calling TOP for each message in order to get
the metadata.

.. todo:: Indicate dsync setting


.. _setting-pop3c_rawlog_dir:

``pop3c_rawlog_dir``
--------------------

- Default: <empty>

Directory location to store raw POP3 protocol traffic logs used in
dsync-based migration of mail..

See: https://wiki.dovecot.org/Debugging/Rawlog

.. todo:: Link to rawlog documentation
.. todo:: Indicate dsync setting


.. _setting-pop3c_ssl:

``pop3c_ssl``
-------------

- Default: ``no``
- Values: ``yes``, ``no``, or ``pop3s``

Enable SSL to remote POP3 account for dsync-based migration of mail?

.. todo:: Values are incorrect?  At least "pop3s" is also supported.
.. todo:: Indicate dsync setting


.. _setting-pop3c_ssl_verify:

``pop3c_ssl_verify``
--------------------

- Default: ``yes``
- Values:  :ref:`boolean`

Require SSL verification of remote POP3 account certificate during dsync-based
migration of mail.

Verification may be disabled during testing, but should be enabled during
production use.

.. todo:: Indicate dsync setting


.. _setting-pop3c_user:

``pop3c_user``
--------------

- Default: ``%u``

The user identity to be used for performing a regular LOGIN to the
source POP3 server in dsync-based migration of mail.

:ref:`Mail user variables <variables-mail_user>` can be used.

See also :ref:`setting-pop3c_master_user`.
See also :ref:`setting-pop3c_password`.

.. todo:: Indicate dsync setting


.. _setting-postmaster_address:

``postmaster_address``
----------------------

- Default: ``postmaster@%{if;%d;ne;;%d;%{hostname}}``

The From address from which email rejection messages (bounces) are sent.

As used here, the variable ``%d`` expands to the domain of the local user.
Other :ref:`mail user variables <variables-mail_user>` can be used as well.

.. todo:: Indicate LDA setting
.. todo:: Indicate LMTP setting


.. _setting-protocols:

``protocols``
-------------

- Default: ``imap pop3 lmtp``

The list of protocols this node will support.

It takes a space-separated list of protocols (which are configured separately)
as its value.


.. _setting-quota_full_tempfail:

``quota_full_tempfail``
-----------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, return a temporary failure to the sending server if quota is
exceeded. This allows the message to potentially be delivered later if the
account moves under the quota limit at the time of redelivery.

If disabled, the message is bounced with a permanent error returned to the
sending server.

.. todo:: Link to quota page

See: https://wiki.dovecot.org/Quota


.. _setting-rawlog_dir:

``rawlog_dir``
--------------

.. versionadded:: v2.2.26

- Default: <empty>

Location to store rawlog data files.

If empty, rawlog files are not created.

:ref:`Mail user variables <variables-mail_user>` can be used.

See: https://wiki.dovecot.org/Debugging/Rawlog

.. todo:: Link to rawlog information page


.. _setting-recipient_delimiter:

``recipient_delimiter``
-----------------------

- Default: ``+``

The separator between the :user and :detail address parts.

.. _setting-rejection_reason:

``rejection_reason``
--------------------

- Default: ``Your message to <%t> was automatically rejected:%n%r``

A human-readable message for the recipients of bounce messages.

The following variables are allowed:

* :ref:`Global variables <variables-global>`.
* ``%{crlf}`` / ``%n``: Newline (CRLF)
* ``%{reason}`` / ``%r``: Reason for rejection
* ``%{subject}`` / ``%s``: Original subject line
* ``%{to}`` / ``%t`` : Recipient address

The variable values are obtained from the mail being delivered or the
delivery protocol.

.. todo:: Indicate LDA setting
.. todo:: Indicate LMTP setting


.. _setting-rejection_subject:

``rejection_subject``
---------------------

- Default: ``Rejected: %s``

The Subject: header to use for bounce messages.

See ``rejection_reason`` for the list of variables that can be used.

See :ref:`setting-rejection_reason`


.. _setting-replication_dsync_parameters:

``replication_dsync_parameters``
--------------------------------

.. versionadded:: v2.2.9

- Default: ``-d -N -l 30 -U``

The parameters used by the replicator for the doveadm sync (dsync) command.

See :ref:`setting-replicator`

.. todo:: Indicate replicator setting


.. _setting-replication_full_sync_interval:

``replication_full_sync_interval``
----------------------------------

- Default: ``1day``
- Values:  :ref:`time`

How often full synchronization is to be performed with the replicator.

See :ref:`setting-replicator`

.. todo:: Indicate replicator setting


.. _setting-replication_max_conns:

``replication_max_conns``
-------------------------

- Default:``10``
- Values: :ref:`uint`

How many dsyncs may be run in parallel for replicator.

See :ref:`setting-replicator`

.. todo:: Indicate replicator setting


.. _setting-replicator:

``replicator``
--------------

- Default: 

The replicator host to be used in dsync operation.

.. todo:: Indicate replicator setting
.. todo:: Is this correct value?


.. _setting-replicator_host:

``replicator_host``
-------------------

- Default: <empty>
- Values: :ref:`string`

Specifies remote hostname or UNIX socket to connect for replicator process.
If :ref:`setting-replicator_port` is set to ``0``, then it will be treated
as UNIX socket.

See :ref:`setting-replicator`


.. _setting-replicator_port:

``replicator_port``
-------------------

- Default: ``0``
- Values: :ref:`uint`

The port indicated here is used by dsync for replication. If set to ``0``,
:ref:`setting-replicator_host` is interpreted as UNIX socket path.

See :ref:`setting-replicator`


.. _setting-sendmail_path:

``sendmail_paths``
------------------

- Default: ``/usr/sbin/sendmail``

The binary to use for sending email.

Used only if ``submission_host`` is not set.

See :ref:`setting-submission_host`


.. _setting-shutdown_clients:

``shutdown_clients``
--------------------

- Default: ``yes``
- Values: :ref:`boolean`

If enabled, all processes are killed when the master process is shutdown.

Otherwise, existing processes will contiue to run. This may be useful to not
interrupt earlier sessions, but may not be desirable if restarting Dovecot
to apply a security update, for example.


.. _setting-ssl:

``ssl``
-------

- Default: ``yes``
- Values: ``yes``, ``no``, or ``required``

The level of SSL support.

ssl=no: SSL/TLS is completely disabled.

With both ssl=yes and ssl=required it's still possible that the client attempts to do a plaintext authentication before enabling SSL/TLS, which exposes the plaintext password to the internet. Dovecot attempts to indicate this to the IMAP clients via the LOGINDISABLED capability, but many clients still ignore it and send the password anyway. There is unfortunately no way for Dovecot to prevent this behavior. The POP3 standard doesn't have an equivalent capability at all, so the POP3 clients can't even know if the server would accept a plaintext authenticatio

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Explain levels
.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_alt_cert:

``ssl_alt_cert``
----------------

.. versionadded:: v2.2.31

- Default: <empty>

Specify alternative ssl certificate that will be used if the algorithm
differs from the primary certificate.

This is useful when migrating to e.g. an ECDSA certificate.

Example:

.. code-block:: none

   ssl_alt_cert = </path/to/alternative/cert.pem

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_alt_key:

``ssl_alt_key``
---------------

.. versionadded:: v2.2.31

- Default: <empty>

Specify alternative ssl key that will be used if the algorithm differs from
the primary key.

This is useful when migrating to e.g. an ECDSA key.

Example:

.. code-block:: none

   ssl_alt_key = </path/to/alternative/key.pem

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_ca:

``ssl_ca``
----------

- Default: <empty>

.. todo:: Add description

Example:

.. code-block:: none

   ssl_ca = </etc/dovecot/ca.crt

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_cert:

``ssl_cert``
------------

- Default: ``</etc/ssl/certs/dovecot.pem``

The PEM-encoded X.509 SSL/TLS certificate, with the value of ``ssl_key``
pointing to the encoded private key.

See :ref:`setting-ssl`

See :ref:`setting-ssl_key`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_cert_username_field:

``ssl_cert_username_field``
---------------------------

- Default: ``commonName``

Which field from the certificate to use for the username.

The most common choices are ``commonName`` and ``x500UniqueIdentifier``.

.. Note::

   ``auth_ssl_username_from_cert`` must be enabled.

See :ref:`setting-auth_ssl_username_from_cert`

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_cipher_list:

``ssl_cipher_list``
-------------------

- Default: ``ALL:!kRSA:!SRP:!kDHd:!DSS:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK:!RC4:!ADH:!LOW@STRENGTH``

The list of SSL ciphers to use, in order of preference.

You do not need to edit this setting in order to disable specific SSL
protocols; that is best done with ``ssl_min_protocol`` instead.

See :ref:`setting-ssl`

See :ref:`setting-ssl_min_protocol`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_client_ca_dir:

``ssl_client_ca_dir``
---------------------

- Default: <empty>

The directory and/or file where trusted SSL CA certificates can be found.

These certs are used only when Dovecot needs to act as an SSL client (e.g.
with the imapc back end).

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_client_ca_file:

``ssl_client_ca_file``
----------------------

- Default: <empty>

Specifies CAs to verify outgoing connections from dovecot. Note that this
setting isn't recommended to be used with large CA bundles, because all the
certificates are read into memory. This leads to excessive memory usage,
because it gets multiplied by the number of imap processes. It's better to
either use ``ssl_client_ca_dir`` setting or use a CA bundle that only
contains the CAs that are actually necessary.

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_client_cert:

``ssl_client_cert``
-------------------

- Default: <empty>

Client certificate used in outgoing SSL connections.

Example Setting:

   ssl_client_cert = </etc/dovecot/dovecot-client.crt

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_client_key:

``ssl_client_key``
------------------

- Default: <empty>

Client certificate private key used in outgoing SSL connections.

Example Setting:

   ssl_client_key = </etc/dovecot/dovecot-client.key

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_crypto_device:

``ssl_crypto_device``
---------------------

- Default: <empty>
- Values: <Obtain by running ``openssl engine`` command>

Which SSL crypto device to use.

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_curve_list:

``ssl_curve_list``
------------------

- Default: <empty>

Colon separated list of elliptic curves to use.

An empty value uses the defaults from the SSL library.

Example:

.. code-block:: none

   ssl_curve_list = P-521:P-384:P-256

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration


.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_dh:

``ssl_dh``
----------

.. versionadded:: v2.3

- Default: <empty>

As of Dovecot v2.3, the path to the Diffie-Hellman parameters file must be
provided.

You can generate a new parameters file by, for example, running
``openssl gendh 4096`` on a machine with sufficient entropy (this may take
some time).

Example Setting:

.. code-block:: none

   ssl_dh=</path/to/dh.pem

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_client_require_valid_cert:

``ssl_client_require_valid_cert``
---------------------------------

- Default: ``yes``
- Values: :ref:`boolean`

Require a valid cerficate when connecting to external SSL services?

See :ref:`setting-ssl`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_key:

``ssl_key``
-----------

- Default: <empty>

The PEM-encoded X.509 SSL/TLS key, with the value of ``ssl_key``
pointing to the encoded private certificate.

Example Setting:

.. code-block:: none

   ssl_key = </etc/ssl/private/dovecot.pem

See :ref:`setting-ssl`

See :ref:`setting-ssl_cert`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_key_password:

``ssl_key_password``
--------------------

- Default: <empty>

The password to use if the SSL key file is password-protected.

Since this file is often world-readable, you may wish to specify the path to a
file containing the password, rather than the password itself, by using the
ormat ``ssl_key_password = <path`` here. The path should be to a root-owned
file with mode 0600.

Alternatively, you can supply the password via the -p parameter at startup.

See :ref:`setting-ssl`

See :ref:`setting-ssl_key`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_min_protocol:

``ssl_min_protocol``
--------------------

- Default: ``TLSv1``

The minimum SSL protocol version Dovecot accepts.

See :ref:`setting-ssl`

See :ref:`setting-ssl_cipher_list`

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page


.. _setting-ssl_options:

``ssl_options``
---------------

- Default: <empty>

Additional options for SSL.

Currently supported options are:

* ``compression``: (before v2.3) Enable compression.
* ``no_compression``: (v2.3+) Disable compression.
* ``no_ticket``: Disable SSL session tickets.

See :ref:`setting-ssl`

.. todo:: Indicate SSL setting

See: https://wiki.dovecot.org/SSL/DovecotConfiguration


.. _setting-ssl_prefer_server_ciphers:

``ssl_prefer_server_ciphers``
-----------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, give preference to the server's cipher list over a client's list.

See :ref:`setting-ssl`

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page

See: https://wiki.dovecot.org/SSL/DovecotConfiguration


.. _setting-ssl_require_crl:

``ssl_require_crl``
-------------------

- Default: ``yes``
- Values: :ref:`boolean`

If enabled, the CRL check must succeed for client certificates.

See :ref:`setting-ssl`

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page

See: https://wiki.dovecot.org/SSL/DovecotConfiguration


.. _setting-ssl_verify_client_cert:

``ssl_verify_client_cert``
--------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, the client is required to send a certificate that can be verified.

See :ref:`setting-ssl`

See :ref:`setting-auth_ssl_require_client_cert`

.. todo:: Indicate SSL setting
.. todo:: Link to SSL page

See: https://wiki.dovecot.org/SSL/DovecotConfiguration

See: https://wiki.dovecot.org/SSL


.. _setting-state_dir:

``state_dir``
-------------

- Default: ``/var/lib/dovecot``

The compile-time directory PKG_STATEDIR (typically /var/lib/dovecot)
is hard-coded as the location of things such as the ssl-parameters.dat
file and the replicator database. The PKG_STATEDIR value is taken as
the default state_dir setting but can be overridden - for instance,
if you wish to use the same binaries for a system daemon and a user
daemon.

The settings ``state_dir = /home/foo/dovecot/state`` and
``base_dir = /home/foo/dovecot/run`` give an example of usage.


.. _setting-stats_writer_socket_path:

``stats_writer_socket_path``
----------------------------

- Default: ``stats-writer``

The path to the stats-writer socket.


.. _setting-submission_client_workarounds:

``submission_client_workarounds``
---------------------------------

- Default: <empty>

Configures the list of active workarounds for Submission client bugs. The list is
space-separated. Supported workaround identifiers are:

* ``whitespace-before-path`` - Allow one or more spaces or tabs between 'MAIL FROM:' and path and between 'RCPT TO:' and path.
* ``mailbox-for-path`` - Allow using bare Mailbox syntax (i.e., without <...>) instead of full path syntax.

.. todo:: Indicate submission setting


.. _setting-submission_host:

``submission_host``
-------------------

- Default: <empty>

Use this SMTP submission host to send messages.

Overrides ``sendmail_path`` value, if set.

See :ref:`setting-sendmail_path`

.. code-block:: none

   submission_host = mail.example.com:6543


.. _setting-submission_logout_format:

``submission_logout_format``
----------------------------

- Default: ``in=%i out=%o``
- Values:  :ref:`string`

The SMTP Submission logout format string.

Variables supported:

* :ref:`Mail user variables <variables-mail_user>`.
* ``%{input}`` / ``%i``: Bytes read from client
* ``%{output}`` / ``%o``: Bytes sent to client
* ``%{command_count}``: Number of commands received from client
* ``%{reply_count}``: Number of replies sent to client
* ``%{transaction_id}``: ID of the current transaction, if any

.. todo:: Indicate submission setting


.. _setting-submission_max_mail_size:

``submission_max_mail_size``
----------------------------

- Default: ``40M``
- Values:  :ref:`size`

The maximum message size accepted for relay.

This value is announced in the SMTP SIZE capability.

If empty, this value is either determined from the relay server or left
unlimited if no limit is known; the relay MTA will reply with error if some
unknown limit exists there, which will be passed back to the client.

.. todo:: Indicate submission setting


.. _setting-submission_max_recipients:

``submission_max_recipients``
-----------------------------

- Default: ``0``
- Values: :ref:`uint`

Maximum number of recipients accepted per connection.

.. todo:: Indicate submission setting


.. _setting-submission_relay_command_timeout:

``submission_relay_command_timeout``
------------------------------------

- Default: ``5mins``
- Values:  :ref:`time_msecs`

Timeout for SMTP commands issued to the submission service's relay server.

The timeout is reset every time more data is being sent or received.

.. todo:: Indicate submission setting


.. _setting-submission_relay_connect_timeout:

``submission_relay_connect_timeout``
------------------------------------

- Default: ``30secs``
- Values:  :ref:`time_msecs`

Timeout for connecting to and logging into the submission service's relay
server.

.. todo:: Indicate submission setting


.. _setting-submission_relay_host:

``submission_relay_host``
-------------------------

- Default: <empty>

Host of the relay server (required to provide the submission service).

.. todo:: Indicate submission setting


.. _setting-submission_relay_master_user:

``submission_relay_master_user``
--------------------------------

- Default: <empty>

Master user name for authentication to the relay MTA if authentication is
required.

.. todo:: Indicate submission setting


.. _setting-submission_relay_max_idle_time:

``submission_relay_max_idle_time``
----------------------------------

- Default: ``29mins``
- Values:  :ref:`time`

Submission relay max idle time for connection to relay MTA.

.. todo:: Indicate submission setting


.. _setting-submission_relay_password:

``submission_relay_password``
-----------------------------

- Default: <empty>

Password for authentication to the relay MTA if authentication is required.

.. todo:: Indicate submission setting


.. _setting-submission_relay_port:

``submission_relay_port``
-------------------------

- Default: ``25``

Port for the submission relay server.

.. todo:: Indicate submission setting


.. _setting-submission_relay_rawlog_dir:

``submission_relay_rawlog_dir``
-------------------------------

- Default: <empty>

Write protocol logs for relay connection to this directory for debugging.

:ref:`Mail user variables <variables-mail_user>` can be used.

.. todo:: Indicate submission setting

see: https://wiki.dovecot.org/Debugging/Rawlog


.. _setting-submission_relay_ssl:

``submission_relay_ssl``
------------------------

- Default: ``no``
- Values: ``no``, ``smtps``, or ``starttls``

If enabled, SSL/TLS is used for the connection to the relay server.

Avaialble values:

* ``no``: No SSL connection is used
* ``smtps``: An SMTPS connection (immediate SSL) is used
* ``starttls:``: The STARTTLS command is used to establish the TLS layer

.. todo:: Indicate submission setting


.. _setting-submission_relay_ssl_verify:

``submission_relay_ssl_verify``
-------------------------------

- Default: ``yes``
- Values: :ref:`boolean`

If enabled, TLS certificate of the relay server must be verified.

.. todo:: Indicate submission setting


.. _setting-submission_relay_trusted:

``submission_relay_trusted``
----------------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, the relay server is trusted.

Determines whether we try to send (Postfix-specific) XCLIENT data to the relay
server (only if enabled).

.. todo:: Indicate submission setting


.. _setting-submission_relay_user:

``submission_relay_user``
-------------------------

- Default: <empty>

User name for authentication to the relay MTA if authentication is required.

.. todo:: Indicate submission setting


.. _setting-submission_ssl:

``submission_ssl``
------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, use SSL/TLS to connect to ``submission_host``.

See :ref:`setting-submission_host`


.. _setting-submission_timeout:

``submission_timeout``
----------------------

- Default: ``30secs``
- Values:  :ref:`time`

Timeout for submitting outgoing messages.

See :ref:`setting-submission_host`


.. _setting-syslog_facility:

``syslog_facility``
-------------------

- Default: ``mail``

The syslog facility used if you're logging to syslog.


.. _setting-valid_chroot_dirs:

``valid_chroot_dirs``
---------------------

- Default: <empty>
- Values: :ref:`boolean`

A colon-separated list of directories under which chrooting is allowed for
mail processes.

Addresses the risk of root exploits enabled by incorrect use of chrooting.

Interpretation is recursive, so including ``/var/mail`` allows chrooting
to subdirectories such as ``/var/mail/foo/bar``.


.. _setting-verbose_proctitle:

``verbose_proctitle``
---------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, the ``ps`` command shows more verbose process details, including
the username and IP address of the connected client.

This aids in seeing who is actually using the IMAP processes.


.. _setting-verbose_ssl:

``verbose_ssl``
---------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, protocol-level SSL errors are logged.


.. _setting-version_ignore:

``version_ignore``
------------------

- Default: ``no``
- Values: :ref:`boolean`

If enabled, ignore version mismatches between different Dovecot versions.
