=====================
Dovecot Core Settings
=====================

See :ref:`settings` for list of all setting groups.


.. dovecot_core:setting:: auth_allow_weak_schemes
   :added: 2.4.0,3.0.0
   :default: no
   :values: @boolean

   Controls whether password schemes marked as weak are allowed to be used.
   See :ref:`authentication-password_schemes` for disabled by default schemes.

   If enabled, will emit warning to logs. If a disabled scheme is used,
   an error is logged.

   Notably, any explicitly cleartext schemes (such as PLAIN), CRAM-MD5 and DIGEST-MD5 are
   not affected by this setting.

.. dovecot_core:setting:: auth_anonymous_username
   :default: anonymous
   :values: @string

   This specifies the username to be used for users logging in with the
   ANONYMOUS SASL mechanism.

.. dovecot_core:setting:: auth_allow_cleartext
   :default: no
   :values: @boolean
   :added: 2.4.0,3.0.0

   If ``no``, disables the LOGIN command and all other cleartext
   authentication unless SSL/TLS is used (LOGINDISABLED capability) or the
   :ref:`connection is secured <secured_connections>`.

   See :ref:`dovecot_ssl_configuration` for more detailed explanation of how
   this setting interacts with the :dovecot_core:ref:`ssl` setting.

   This setting replaces the ``disable_plaintext_auth`` setting.

.. dovecot_core:setting:: auth_cache_negative_ttl
   :default: hour
   :values: @time

   This sets the time to live for negative hits (i.e., when the user is
   not found or there is a password mismatch).

   The value ``0`` completely disables caching of these hits.


.. dovecot_core:setting:: auth_cache_size
   :default: 0
   :values: @size

   The authentication cache size (e.g., 10M).

   The setting ``auth_cache_size = 0`` disables use of the authentication cache.


.. dovecot_core:setting:: auth_cache_ttl
   :default: 1hour
   :values: @time

   This determines the time to live for cached data. After the TTL
   expires, the cached record is no longer used, unless the main
   database look-up returns internal failure.


.. dovecot_core:setting:: auth_cache_verify_password_with_worker
   :added: 2.2.34
   :changed: 2.3.18 Fixed to work properly. Older versions lost passdb extra fields.
   :default: no
   :values: @boolean

   The auth master process by default is responsible for the hash
   verifications. Setting this to yes moves the verification to auth-worker
   processes. This allows distributing the hash calculations to multiple CPU
   cores, which could make sense if strong hashes are used.


.. dovecot_core:setting:: auth_debug
   :changed: 2.4.0,3.0.0
   :default: no
   :values: @boolean

   Enables all authentication debug logging (also enables
   :dovecot_core:ref:`auth_verbose`). Passwords are logged as ``<hidden>``.

   .. note::
      The setting is obsolete, and kept only for backwards compatibility.
      Use ``log_debug = category=auth`` instead.
      (see :dovecot_core:ref:`log_debug`)


.. dovecot_core:setting:: auth_debug_passwords
   :default: no
   :values: @boolean

   This setting adjusts log verbosity. In the event of password
   mismatches, the passwords and the scheme used are logged so that the
   problem can be debugged.

   .. note:: You also need to enable ``log_debug = category=auth``

   See :dovecot_core:ref:`log_debug`

.. dovecot_core:setting:: auth_default_domain
   :added: 2.4.0,3.0.0
   :values: @string

   This setting indicates the default realm/domain to use if none has
   been specified. The setting is used for both SASL realms
   and appending an @domain element to the username in cleartext logins.

.. dovecot_core:setting:: auth_default_realm
   :removed: 2.4.0,3.0.0
   :values: @string

   Renamed to :dovecot_core:ref:`auth_default_domain`

.. dovecot_core:setting:: auth_failure_delay
   :default: 2secs
   :values: @time

   This is the delay before replying to failed authentication attempts.

   This setting defines the interval for which the authentication process
   flushes all auth failures. Thus, this is the maximum interval a user may
   encounter.


.. dovecot_core:setting:: auth_gssapi_hostname
   :default: !<name returned by gethostname()>
   :values: @string

   This supplies the hostname to use in Generic Security Services API
   (GSSAPI) principal names.

   Use ``"$ALL"`` (with the quotation marks) to allow all keytab entries.


.. dovecot_core:setting:: auth_krb5_keytab
   :default: !<system default (e.g. /etc/krb5.keytab)>
   :values: @string

   This specifies the Kerberos keytab to use for the GSSAPI mechanism.

   .. note:: You may need to set the auth service to run as root in order for
             this file to be readable.


.. dovecot_core:setting:: auth_master_user_separator
   :values: @string

   The separator to use to enable master users to login by specifying the
   master username within the normal username string (i.e., not using the SASL
   mechanism's master support).

   Example:

   .. code-block:: none

     # Allows master login of the format <username>*<masteruser>
     # E.g. if user = foo, and master_user = muser,
     #   login username = foo*muser
     auth_master_user_separator = *


.. dovecot_core:setting:: auth_mechanisms
   :default: plain
   :values: @boollist

   Here you can supply a space-separated list of the authentication
   mechanisms you wish to use.

   See :ref:`authentication-authentication_mechanisms`.

   Example:

   .. code-block:: none

     auth_mechanisms = plain login


.. dovecot_core:setting:: auth_policy
   :values: @named_filter

   Filter for auth policy specific settings. See
   :ref:`authentication-auth_policy`.


.. dovecot_core:setting:: auth_policy_check_after_auth
   :default: yes
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @boolean

   Do policy lookup after authentication is completed?


.. dovecot_core:setting:: auth_policy_check_before_auth
   :default: yes
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @boolean

   Do policy lookup before authentication is started?


.. dovecot_core:setting:: auth_policy_hash_mech
   :default: sha256
   :seealso: @auth_policy_server_url;dovecot_core
   :values: md4, md5, sha1, sha256, sha512

   Hash mechanism to use for password.


.. dovecot_core:setting:: auth_policy_hash_nonce
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @string

   Cluster-wide nonce to add to hash.

   REQUIRED configuration when you want to use authentication policy.

   Example Setting:

   .. code-block:: none

     auth_policy_hash_nonce = <localized_random_string>


.. dovecot_core:setting:: auth_policy_hash_truncate
   :default: 12
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @uint

   How many bits to use from password hash when reporting to policy server.


.. dovecot_core:setting:: auth_policy_log_only
   :default: no
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @boolean

   Only log what the policy server response would do?

   If ``yes``, no request is made to the policy server.


.. dovecot_core:setting:: auth_policy_reject_on_fail
   :default: no
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @boolean

   If policy request fails for some reason, should users be rejected?


.. dovecot_core:setting:: auth_policy_report_after_auth
   :default: yes
   :values: @boolean

   Report authentication result?

   If ``no``, there will be no report for the authentication result.


.. dovecot_core:setting:: auth_policy_request_attributes
   :default: login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @string

   Request attributes specification.

   Variables that can be used for this setting:

   :ref:`Auth variables <variables-auth>`

   ``%{hashed_password}``

     Truncated auth policy hash of username and password

   ``%{requested_username}``

     Logged in user. Same as ``%{user}``, except for master user logins the
     same as ``%{login_user}``. (v2.2.34+)


.. dovecot_core:setting:: auth_policy_server_api_header
   :seealso: @auth_policy_server_url;dovecot_core
   :values: @string

   Header and value to add to request (for API authentication).

   .. note::

      See: https://en.wikipedia.org/wiki/Basic_access_authentication#Client_side

   This can be used when you are using the weakforced policy server and the
   web listener password is "super":

   .. code-block:: none

     $ echo -n wforce:super | base64
     d2ZvcmNlOnN1cGVy

   Then the correct value for this setting is:

   .. code-block:: none

     auth_policy_server_api_header = Authorization: Basic d2ZvcmNlOnN1cGVy


.. dovecot_core:setting:: auth_policy_server_url
   :values: @string

   URL of the policy server.

   URL is appended with ``?command=allow/report``. If URL ends with ``&``, the
   ``?`` is not appended.

   REQUIRED configuration when you want to use authentication policy.

   Example Setting:

   .. code-block:: none

     auth_policy_server_url = http://example.com:4001/


.. dovecot_core:setting:: auth_proxy_self
   :todo: Link to proxy_maybe; Mark setting as "normally don't touch"
   :values: @string

   If the destination for proxying matches any of the IP addresses listed
   here, proxying is not performed when ``proxy_maybe=yes`` is returned.

   This parameter isn't normally needed; its main use is if the
   destination IP address belongs to, for instance, a load-balancer rather
   than the server itself.


.. dovecot_core:setting:: auth_realms
   :values: @string

   This setting supplies a space-separated list of realms for those SASL
   authentication mechanisms that need them. Realms are an integral part of
   Digest-MD5.

   You will need to specify realms you want to advertise to the client in the
   config file:

   Example Setting:

   .. code-block:: none

     auth_realms = example.com another.example.com foo


.. dovecot_core:setting:: auth_socket_path
   :default: auth-userdb
   :values: @string

   The UNIX socket path to the master authentication server for finding users.

   It is usually neither necessary nor advisable to change the default.


.. dovecot_core:setting:: auth_ssl_require_client_cert
   :default: no
   :seealso: @ssl_ca;dovecot_core, @ssl_request_client_cert;dovecot_core, @dovecot_ssl_configuration
   :values: @boolean

   If ``yes``, authentication fails when a valid SSL client certificate is not
   provided.


.. dovecot_core:setting:: auth_ssl_username_from_cert
   :default: no
   :seealso: @ssl_cert_username_field;dovecot_core
   :values: @boolean

   Setting to ``yes`` indicates that the username should be taken from the
   client's SSL certificate.

   Generally, this will be either ``commonName`` or ``x500UniqueIdentifier``.

   The text is looked up from subject DN's specified field using OpenSSL's
   X509_NAME_get_text_by_NID() function. By default the CommonName field is
   used. You can change the field with
   :dovecot_core:ref:`ssl_cert_username_field` = ``name`` setting (parsed
   using OpenSSL's OBJ_txt2nid() function).

   ``x500UniqueIdentifier`` is a common choice.


.. dovecot_core:setting:: auth_stats
   :added: 2.3.0
   :removed: 3.0.0
   :default: no
   :values: @boolean

   If enabled, authentication statistics are added.


.. dovecot_core:setting:: auth_use_winbind
   :default: no
   :values: @boolean

   By default, the NTLM mechanism is handled internally.

   If ``yes``, perform NTLM and GSS-SPNEGO authentication with Samba's winbind
   daemon and ntlm_auth helper.

   This option is useful when you need to authenticate users against a Windows
   domain (either AD or NT).


.. dovecot_core:setting:: auth_username_chars
   :default: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890.-_@
   :values: @string

   The list of the characters allowed in a username.

   If the user-supplied username contains a character not listed here, login
   automatically fails.

   This is an additional check to make sure the user can't exploit any
   quote-escaping vulnerabilities that may be connected with SQL/LDAP
   databases.

   If you want to allow all characters, leave the value empty.


.. dovecot_core:setting:: auth_username_format
   :default: %Lu
   :todo: List allowed formatting modifiers
   :values: @string

   Formatting applied to username before querying the auth database.

   You can use the standard variables here.

   Examples:

   ``%Lu``

     Lowercases the username

   ``%n``

     Drops the domain if one was supplied

   ``%n-AT-%d``

     Changes the "@" symbol into "-AT-" before lookup

   This translation is done after the changes specified with the
   :dovecot_core:ref:`auth_username_translation` setting.


.. dovecot_core:setting:: auth_username_translation
   :values: @string

   If set, performs username character translations before querying the auth
   database.

   The value is a string formed of sets of ``from`` and ``to`` characters
   alternating.

   A value of ``#@/@`` means that ``#`` and ``/`` will both be translated to
   the ``@`` character.


.. dovecot_core:setting:: auth_verbose
   :added: 2.2.24
   :default: no
   :values: @boolean

   Adjust log verbosity.

   If ``yes``, log unsuccessful authentication attempts and why they failed.


.. dovecot_core:setting:: auth_verbose_passwords
   :default: no
   :values: no, yes, plain, sha1

   In case of password mismatches, log the attempted password. You can also
   truncate the logged password to ``n`` chars by appending ``:n`` (e.g.
   ``sha1:6``).

   Available transformations:

   ``plain``, ``yes``

     Output cleartext password (NOT RECOMMENDED)

   ``sha1``

     Output SHA1 hashed password


.. dovecot_core:setting:: auth_winbind_helper_path
   :values: @string

   This setting tells the system the path for Samba's ntlm_auth helper binary.

   Example:

   .. code-block:: none

     auth_winbind_helper_path = /usr/bin/ntlm_auth


.. dovecot_core:setting:: auth_worker_max_count
   :default: 30
   :values: @uint

   Maximum number of dovecot-auth worker processes active.

   The auth workers are used to execute blocking passdb and userdb queries
   (e.g., MySQL and PAM). They are automatically created and destroyed as
   necessary.


.. dovecot_core:setting:: base_dir
   :default: /var/run/dovecot/
   :values: @string

   The base directory in which Dovecot should store runtime data.

   This can be used to override the base directory determined at compile time.


.. dovecot_core:setting:: config_cache_size
   :default: 1 M
   :values: @size
   :removed: 2.4.0,3.0.0

   The maximum size of the in-memory configuration cache.

   The cache should be large enough to allow keeping the full, parsed Dovecot
   configuration in memory.

   The default is almost always large enough, unless your system has numerous
   large TLS certificates in the configuration.


.. dovecot_core:setting:: debug_log_path
   :default: @info_log_path;dovecot_core
   :values: @string

   The log file to use for debug messages.


.. dovecot_core:setting:: default_internal_group
   :default: dovecot
   :seealso: @default_internal_user;dovecot_core
   :values: @string

   Define the default internal group.


.. dovecot_core:setting:: default_internal_user
   :default: dovecot
   :seealso: @default_internal_group;dovecot_core
   :values: @string

   Define the default internal user.

   Unprivileged processes run under the ID of the internal user. This
   user should be distinct from the login user, to prevent login processes
   from disturbing other processes.


.. dovecot_core:setting:: default_login_user
   :default: dovenull
   :values: @string

   The user the login process should run as.

   This is the least trusted user in Dovecot: this user should not have access
   to anything at all.


.. dovecot_core:setting:: deliver_log_format
   :default: msgid=%m: %$
   :values: @string_novars

   The format to use for logging mail deliveries.

   Variables that can be used for this setting:

   ============================ ==============================================
   Variable Name                Description
   ============================ ==============================================
   :ref:`variables-global`
   ``%$``                       Delivery status message (e.g., saved to INBOX)
   ``%{msgid}``, ``%m``         Message-ID
   ``%{subject}``, ``%s``       Subject
   ``%{from}``, ``%f``          From address
   ``%{from_envelope}``, ``%e`` SMTP FROM envelope
   ``%{size}``, ``%p``          Physical size
   ``%{vsize}``, ``%w``         Virtual size
   ``%{to_envelope}``           RCPT TO envelope
   ``%{delivery_time}``         How many milliseconds to deliver the mail
   ``%{session_time}``          LMTP session duration, not including
                                ``%{delivery_time}``
   ``%{storage_id}``            Backend-specific ID for mail, e.g. Maildir
                                filename
   ============================ ==============================================

   Example:

   .. code-block:: none

     deliver_log_format = stime=%{session_time} msgid=%m: %$


.. dovecot_core:setting:: dict_db_config
   :values: @string
   :removed: 2.4.0,3.0.0

   Points to a Berkeley DB config file. Equivalent to adding
   ``DB_CONFIG=/path`` to :dovecot_core:ref:`import_environment`.

   See https://docs.oracle.com/database/bdb181/html/bdb-sql/sql_db_config.html
   for more information.

   Example:

   .. code-block:: none

     dict_db_config=/etc/dovecot/berkeley.conf


.. dovecot_core:setting:: dotlock_use_excl
   :default: yes
   :values: @boolean

   If ``yes``, rely on O_EXCL to work when creating dotlock files.

   NFS has supported O_EXCL since version 3, so ``yes`` should be safe to use
   by default.


.. dovecot_core:setting:: doveadm_allowed_commands
   :default: ALL
   :values: @string

   Lists the commands that the client may use with the doveadm server.

   The setting ``ALL`` allows all commands.


.. dovecot_core:setting:: doveadm_api_key
   :values: @string

   Set an API key for use of the HTTP API for the doveadm server.

   If set, the key must be included in the HTTP request (via X-API-Key header)
   base64 encoded.


.. dovecot_core:setting:: doveadm_http_rawlog_dir
   :seealso: @debugging_rawlog
   :values: @string

   Directory where doveadm stores HTTP rawlogs.


.. dovecot_core:setting:: doveadm_password
   :values: @string

   The doveadm client and server must have a shared secret. This setting
   configures the doveadm server's password, used for client authentication.

   Because it grants access to users' mailboxes, it must be kept secret.


.. dovecot_core:setting:: doveadm_port
   :default: 0
   :values: !<1-65535>

   The destination port to be used for the next doveadm proxying hop.

   A value of ``0`` means that proxying is not in use.


.. dovecot_core:setting:: doveadm_socket_path
   :default: doveadm-server
   :values: @string

   The UNIX socket or host (``host:port`` syntax is allowed) for connecting to
   the doveadm server.


.. dovecot_core:setting:: doveadm_ssl
   :added: 2.3.9
   :default: no
   :values: no, ssl, starttls

   TODO


.. dovecot_core:setting:: doveadm_username
   :default: doveadm
   :values: @string

   The username for authentication to the doveadm service.


.. dovecot_core:setting:: doveadm_worker_count
   :default: 0
   :values: @uint

   If the worker count set here is non-zero, mail commands are run via this
   many connections to the doveadm service.

   If ``0``, commands are run directly in the same process.


.. dovecot_core:setting:: dsync_alt_char
   :default: _
   :todo: Indicate dsync setting
   :values: @string

   When the source and destination mailbox formats are different, it's
   possible for a mailbox name to exist on one source that isn't valid for
   the destination. Any invalid characters are replaced with the
   character indicated here.


.. dovecot_core:setting:: dsync_commit_msgs_interval
   :added: 2.2.30
   :default: 100
   :todo: Indicate dsync setting
   :values: @uint

   Dsync will commit this number of messages incrementally, to avoid huge
   transactions that fail.


.. dovecot_core:setting:: dsync_features
   :added: 2.2.26
   :todo: Indicate dsync setting
   :values: @string

   This setting specifies features and workarounds that can be used with
   dsync. Options are specified in this setting via a space-separated list.

   Available options:

   ``empty-header-workaround``

     Workaround for servers (e.g. Zimbra) that sometimes send FETCH replies
     containing no headers.

   ``no-header-hashes``

     When this setting is enabled and one dsync side doesn't support mail
     GUIDs (i.e. imapc), there is no fallback to using header hashes. Instead,
     dsync assumes that all mails with identical IMAP UIDs contain the same
     mail contents. This can significantly improve dsync performance with some
     IMAP servers that don't support caching Date/Message-ID headers.

     .. dovecotadded:: 2.3.20

.. dovecot_core:setting:: dsync_hashed_headers
   :added: 2.2.33
   :default: Date Message-ID
   :todo: Indicate dsync setting
   :values: @string

   Which email headers are used in incremental syncing for checking whether
   the local email matches the remote email?

   Format: a space-separated list of headers.

   This list should only include headers that can be efficiently downloaded
   from the remote server.


.. dovecot_core:setting:: first_valid_gid
   :default: 1
   :seealso: @last_valid_gid;dovecot_core
   :values: @uint

   This setting and :dovecot_core:ref:`last_valid_gid` specify the valid GID
   range for users.

   A user whose primary GID is outside this range is not allowed to log in.

   If the user belongs to any supplementary groups, the corresponding IDs are
   not set.


.. dovecot_core:setting:: first_valid_uid
   :default: 500
   :seealso: @last_valid_gid;dovecot_core
   :values: @uint

   This setting and :dovecot_core:ref:`last_valid_uid` specify the valid UID
   range for users.

   A user whose UID is outside this range is not allowed to log in.


.. dovecot_core:setting:: haproxy_timeout
   :default: 3secs
   :todo: Indicate haproxy setting
   :values: @time

   When to abort the HAProxy connection when no complete header has been
   received.


.. dovecot_core:setting:: haproxy_trusted_networks
   :todo: Indicate haproxy setting
   :values: @string

   A space-separated list of trusted network ranges for HAProxy connections.

   Connections from networks outside these ranges to ports that are configured
   for HAProxy are aborted immediately.


.. dovecot_core:setting:: hostname
   :default: !<system's real hostname@domain.tld>
   :values: @string

   The hostname to be used in email messages sent out by the local delivery
   agent (such as the Message-ID: header) and in LMTP replies.


.. dovecot_core:setting:: http_client_connect_timeout
   :default: 0
   :values: @time_msecs

   Max time to wait for TCP connect and SSL handshake to finish before retrying.
   0 (default) is to use :dovecot_core:ref:`http_client_request_timeout`.


.. dovecot_core:setting:: http_client_delete_request_max_attempts
   :default: 0
   :values: @uint

   If non-zero, override :dovecot_core:ref:`http_client_request_max_attempts`
   for DELETE requests.


.. dovecot_core:setting:: http_client_delete_request_timeout
   :default: 0
   :values: @time_msecs

   If non-zero, override :dovecot_core:ref:`http_client_request_timeout`
   for DELETE requests.


.. dovecot_core:setting:: http_client_max_connect_attempts
   :default: 0
   :values: @uint

   Maximum number of connection attempts to a host before all associated
   requests fail.

   If > 0, the maximum will be enforced across all IPs for that host,
   meaning that IPs may be tried more than once eventually if the number
   of IPs is smaller than the specified maximum attempts. If the number
   of IPs is higher than the maximum attempts, not all IPs are tried.
   If 0, all IPs are tried at most once.


.. dovecot_core:setting:: http_client_max_idle_time
   :default: 0
   :values: @time_msecs

   Maximum time a connection will idle. If parallel connections are
   idle, the duplicates will end earlier based on how many idle
   connections exist to that same service.


.. dovecot_core:setting:: http_client_max_parallel_connections
   :default: 1
   :values: @uint

   Maximum number of parallel connections per peer.


.. dovecot_core:setting:: http_client_max_pipelined_requests
   :default: 1
   :values: @uint

   Maximum number of pipelined requests per connection.


.. dovecot_core:setting:: http_client_proxy_password
   :values: @string

   Password for HTTP proxy.


.. dovecot_core:setting:: http_client_proxy_socket_path
   :values: @string

   UNIX socket path for HTTP proxy. Overrides
   :dovecot_core:ref:`http_client_proxy_url`.


.. dovecot_core:setting:: http_client_proxy_ssl_tunnel
   :default: yes
   :values: @boolean

   If "no", the HTTP proxy delegates SSL negotiation to proxy, rather
   than creating a CONNECT tunnel through the proxy for the SSL link.


.. dovecot_core:setting:: http_client_proxy_url
   :values: @string

   URL for HTTP proxy. Ignored if
   :dovecot_core:ref:`http_client_proxy_socket_path` is set.


.. dovecot_core:setting:: http_client_proxy_username
   :values: @string

   Username for HTTP proxy.


.. dovecot_core:setting:: http_client_rawlog_dir
   :values: @string

   Directory for writing raw log data for debugging purposes.


.. dovecot_core:setting:: http_client_read_request_max_attempts
   :default: 0
   :values: @uint

   If non-zero, override :dovecot_core:ref:`http_client_request_max_attempts`
   for GET and HEAD requests.


.. dovecot_core:setting:: http_client_read_request_timeout
   :default: 0
   :values: @time_msecs

   If non-zero, override :dovecot_core:ref:`http_client_request_timeout`
   for GET and HEAD requests.


.. dovecot_core:setting:: http_client_request_absolute_timeout
   :default: 0
   :values: @uint

   Max total time to wait for HTTP request to finish, including all retries.
   0 means no limit.


.. dovecot_core:setting:: http_client_request_max_attempts
   :default: 1
   :values: @uint

   Maximum number of attempts for a request.


.. dovecot_core:setting:: http_client_request_max_redirects
   :default: 0
   :values: @uint

   Maximum number of redirects for a request. 0 = redirects refused.


.. dovecot_core:setting:: http_client_request_timeout
   :default: 1 mins
   :values: @time_msecs

   Max time to wait for HTTP request to finish before retrying.


.. dovecot_core:setting:: http_client_write_request_max_attempts
   :default: 0
   :values: @uint

   If non-zero, override :dovecot_core:ref:`http_client_request_max_attempts`
   for PUT and POST requests.


.. dovecot_core:setting:: http_client_write_request_timeout
   :default: 0
   :values: @time_msecs

   If non-zero, override :dovecot_core:ref:`http_client_request_timeout`
   for PUT and POST requests.


.. dovecot_core:setting:: imap_capability
   :todo: Indicate imap setting
   :values: @string

   Override the IMAP CAPABILITY response.

   If the value begins with the ``+`` character, the capabilities listed here
   are added at the end of the default string.

   Example:

   .. code-block:: none

     imap_capability = +XFOO XBAR


.. dovecot_core:setting:: imap_client_workarounds
   :todo: Indicate imap setting
   :values: @string

   Workarounds for various IMAP client bugs can be enabled here. The list is
   space-separated.

   The following values are currently supported:

   ``delay-newmail``

      EXISTS/RECENT new-mail notifications are sent only in replies to NOOP
      and CHECK commands. Some clients, such as pre-2.1 versions of Mac OS X
      Mail, ignore them otherwise, and, worse, Outlook Express may report
      that the message is no longer on the server (note that the workaround
      does not help for OE6 if synchronization is set to Headers Only).

   ``tb-extra-mailbox-sep``

      Because :dovecot_core:ref:`mailbox_list_layout` = fs (mbox and dbox) confuses Thunderbird, causing
      extra / suffixes to mailbox names, Dovecot can be told to ignore
      the superfluous character instead of judging the mailbox name to be
      invalid.

   ``tb-lsub-flags``

      Without this workaround, Thunderbird doesn't immediately recognize
      that LSUB replies with :dovecot_core:ref:`mailbox_list_layout` = fs aren't selectable, and users may
      receive pop-ups with not selectable errors. Showing \Noselect flags for
      these replies (e.g., in mbox use) causes them to be grayed out.


.. dovecot_core:setting:: imap_fetch_failure
   :default: disconnect-immediately
   :todo: Indicate imap setting
   :values: disconnect-after, disconnect-immediately, no-after

   Behavior when IMAP FETCH fails due to some internal error. Options:

   ``disconnect-immediately``

      The FETCH is aborted immediately and the IMAP client is disconnected.

   ``disconnect-after``

      The FETCH runs for all the requested mails returning as much data as
      possible. The client is finally disconnected without a tagged reply.

   ``no-after``

      Same as disconnect-after, but tagged NO reply is sent instead of
      disconnecting the client.

      If the client attempts to FETCH the same failed mail more than once,
      the client is disconnected.

      This is to avoid clients from going into infinite loops trying to FETCH
      a broken mail.


.. dovecot_core:setting:: imap_hibernate_timeout
   :default: 0
   :todo: Indicate imap setting
   :values: @size

   How long to wait while the client is in IDLE state before moving the
   connection to the hibernate process, to save on memory use, and close the
   existing IMAP process.

   If nothing happens for this long while client is IDLEing, move the
   connection to imap-hibernate process and close the old imap process. This
   saves memory, because connections use very little memory in imap-hibernate
   process. The downside is that recreating the imap process back uses some
   additional system resources.


.. dovecot_core:setting:: imap_id_log
   :removed: 2.4.0,3.0.0
   :values: @string

   The ID fields sent by the client that are output to the log.

   Using ``*`` as the value means that everything available should be sent.


.. dovecot_core:setting:: imap_id_retain
   :added: 2.2.29
   :default: no
   :todo: Indicate imap setting
   :values: @boolean

   When proxying IMAP connections to other hosts, this variable must be
   enabled to forward the IMAP ID command provided by the client.

   This setting enables the ``%{client_id}`` variable for auth processes. See
   :ref:`Auth variables <variables-auth>`.


.. dovecot_core:setting:: imap_id_send
   :default: name *
   :todo: Indicate imap setting
   :values: @string

   Which ID field names and values to send to clients.

   Using ``*`` as the value makes Dovecot use the default value.

   There are currently defaults for the following fields:

   ================= ==========================================================
   Field             Default
   ================= ==========================================================
   ``name``          Name of distributed package (Default: ``Dovecot``)
   ``version``       Dovecot version
   ``os``            OS name reported by uname syscall (similar to ``uname -s``
                     output)
   ``os-version``    OS version reported by uname syscall (similar to ``uname
                     -r`` output)
   ``support-url``   Support webpage set in Dovecot distribution (Default:
                     ``http://www.dovecot.org/``)
   ``support-email`` Support email set in Dovecot distribution (Default:
                     ``dovecot@dovecot.org``)
   ``revision``      Short commit hash of Dovecot git source tree HEAD (same
                     as the commit hash reported in ``dovecot --version``)

                     .. dovecotadded:: 2.3.10
   ================= ==========================================================

   Example:

   .. code-block:: none

     imap_id_send = "name" * "version" * support-url http://example.com/


.. dovecot_core:setting:: imap_idle_notify_interval
   :default: 2mins
   :todo: Indicate imap setting
   :values: @time

   The amount of time to wait between "OK Still here" untagged IMAP responses
   when the client is in IDLE operation.


.. dovecot_core:setting:: imap_literal_minus
   :added: 2.2.25
   :default: no
   :todo: Indicate imap setting
   :values: @boolean

   Enable IMAP LITERAL- extension (replaces LITERAL+)?


.. dovecot_core:setting:: imap_logout_format
   :default: in=%i out=%o deleted=%{deleted} expunged=%{expunged} trashed=%{trashed} hdr_count=%{fetch_hdr_count} hdr_bytes=%{fetch_hdr_bytes} body_count=%{fetch_body_count} body_bytes=%{fetch_body_bytes}
   :todo: Indicate imap setting
   :values: @string_novars

   This setting specifies the IMAP logout format string. Supported variables
   are:

   ========================== ================================================
   Variable Name              Description
   ========================== ================================================
   :ref:`variables-mail_user`
   ``%{input}``, ``%i``       Total number of bytes read from client
   ``%{output}``, ``%o``      Total number of bytes sent to client
   ``%{fetch_hdr_count}``     Number of mails with mail header data sent to
                              client
   ``%{fetch_hdr_bytes}``     Number of bytes with mail header data sent to
                              client
   ``%{fetch_body_count}``    Number of mails with mail body data sent to
                              client
   ``%{fetch_body_bytes}``    Number of bytes with mail body data sent to
                              client
   ``%{deleted}``             Number of mails where client added \Deleted flag
   ``%{expunged}``            Number of mails that client expunged, which does
                              not include automatically expunged mails
   ``%{autoexpunged}``        Number of mails that were automatically expunged
                              after client disconnected
   ``%{trashed}``             Number of mails that client copied/moved to the
                              special_use=\Trash mailbox.
   ``%{appended}``            Number of mails saved during the session
   ========================== ================================================


.. dovecot_core:setting:: imap_max_line_length
   :default: 64k
   :todo: Indicate imap setting
   :values: @size

   Maximum IMAP command line length. Some clients generate very long command
   lines with huge mailboxes, so you may need to raise this if you get
   Too long argument or IMAP command line too large errors often.


.. dovecot_core:setting:: imap_metadata
   :default: no
   :todo: Indicate imap AND metadata setting
   :values: @boolean

   Dovecot supports the IMAP METADATA extension (:rfc:`5464`), which allows
   per-mailbox, per-user data to be stored and accessed via IMAP commands. Set
   this parameter's value to ``yes`` if you wish to activate the IMAP METADATA
   commands.

   .. note:: If activated, a dictionary needs to be configured, via the
             :dovecot_core:ref:`mail_attribute` setting.

   Example:

   .. code-block:: none

     # Store METADATA information within user's Maildir directory
     mail_attribute {
       dict_driver = file
       dict_file_path = %h/Maildir/dovecot-attributes
     }

     protocol imap {
       imap_metadata = yes
     }


.. dovecot_core:setting:: imap_urlauth_host
   :todo: Indicate imap setting
   :values: @string

   Specifies the host used for URLAUTH URLs. Only this host is accepted in
   the client-provided URLs. Using ``*`` value (not recommended) allows all
   hosts and the generated URLs use :dovecot_core:ref:`hostname` as the host.

   An empty value disables the URLAUTH extension entirely.

   .. warning::

      URLAUTH in current versions of Dovecot is broken in several ways. This
      will be fixed in the future, but activating URLAUTH support on production
      systems is not recommended.

   .. note::

      This setting is REQUIRED for the
      URLAUTH :rfc:`4467` extension to be active.


.. dovecot_core:setting:: imap_urlauth_logout_format
   :default: in=%i out=%o
   :todo: Indicate imap setting
   :values: @string_novars

   Specifies the logout format used with the URLAUTH extension in IMAP
   operation.

   .. note:: This setting is currently not used.

   Variables allowed:

   ======= ==========================================
   Name    Description
   ======= ==========================================
   ``%i``  Total number of bytes read from the client
   ``%o``  Total number of bytes sent to the client
   ======= ==========================================


.. dovecot_core:setting:: imap_urlauth_port
   :default: 143
   :todo: Indicate imap setting
   :values: !<1-65535>

   The port is used with the URLAUTH extension in IMAP operation.


.. dovecot_core:setting_link:: imapc_cmd_timeout


.. dovecot_core:setting_link:: imapc_connection_retry_count


.. dovecot_core:setting_link:: imapc_connection_retry_interval


.. dovecot_core:setting_link:: imapc_features


.. dovecot_core:setting_link:: imapc_host


.. dovecot_core:setting_link:: imapc_list_prefix


.. dovecot_core:setting_link:: imapc_master_user


.. dovecot_core:setting_link:: imapc_max_idle_time


.. dovecot_core:setting_link:: imapc_max_line_length


.. dovecot_core:setting_link:: imapc_password


.. dovecot_core:setting_link:: imapc_port


.. dovecot_core:setting_link:: imapc_rawlog_dir


.. dovecot_core:setting_link:: imapc_sasl_mechanisms


.. dovecot_core:setting_link:: imapc_ssl


.. dovecot_core:setting_link:: imapc_ssl_verify


.. dovecot_core:setting_link:: imapc_user


.. dovecot_core:setting:: import_environment
   :default: TZ CORE_OUTOFMEM CORE_ERROR
   :todo: Explain default variables
   :values: @string

   A list of environment variables, space-separated, that are preserved and
   passed to all child processes.

   It can include key = value pairs for assigning variables the desired value
   upon Dovecot startup.


.. dovecot_core:setting:: info_log_path
   :default: @log_path;dovecot_core
   :values: @string

   The log file to use for informational messages.


.. dovecot_core:setting:: instance_name
   :default: dovecot
   :values: @string

   For multi-instance setups, supply the unique name of this Dovecot instance.

   This simplifies use of commands such as doveadm: rather than using ``-c``
   and the config path, you can use the ``-i`` flag with the relevant instance
   name.


.. dovecot_core:setting:: last_valid_gid
   :default: 0
   :seealso: @first_valid_gid;dovecot_core
   :values: @uint

   This setting and :dovecot_core:ref:`first_valid_gid` specify the valid GID
   range for users.

   A user whose primary GID is outside this range is not allowed to log in.

   ``0`` means there is no explicit last GID.

   If the user belongs to any supplementary groups, the corresponding IDs are
   not set.


.. dovecot_core:setting:: last_valid_uid
   :default: 0
   :seealso: @first_valid_uid;dovecot_core
   :values: @uint

   This setting and :dovecot_core:ref:`first_valid_uid` specify the valid UID
   range for users.

   ``0`` means there is no explicit last UID.

   A user whose UID is outside this range is not allowed to log in.


.. dovecot_core:setting:: lda_mailbox_autocreate
   :default: no
   :todo: Indicate LDA setting
   :values: @boolean

   Should LDA create a nonexistent mailbox automatically when attempting to
   save a mail message?


.. dovecot_core:setting:: lda_mailbox_autosubscribe
   :default: no
   :todo: Indicate LDA setting
   :values: @boolean

   Should automatically created mailboxes be subscribed to?


.. dovecot_core:setting:: lda_original_recipient_header
   :todo: Indicate LDA setting
   :values: @string

   The header from which the original recipient address (used in the SMTP RCPT
   TO: address) is obtained if that address is not available elsewhere.

   Example:

   .. code-block:: none

     lda_original_recipient_header = X-Original-To


.. dovecot_core:setting:: libexec_dir
   :default: /usr/libexec/dovecot
   :values: @string

   The directory from which you execute commands via doveadm-exec.


.. dovecot_core:setting:: listen
   :default: \*, \:\:
   :values: @ip_addresses

   A comma-separated list of IP addresses or hostnames on which external network
   connections will be handled.

   ``*`` listens at all IPv4 interfaces, and ``::`` listens at all IPv6
   interfaces.

   Example:

   .. code-block:: none

     listen = 127.0.0.1, 192.168.0.1


.. dovecot_core:setting:: lmtp_add_received_header
   :added: 2.3.9
   :default: yes
   :todo: Indicate LMTP setting
   :values: @boolean

   Controls if "Received:" header should be added to delivered mails.


.. dovecot_core:setting:: lmtp_address_translate
   :removed: 2.3.0
   :todo: Indicate LMTP setting
   :values: @string


.. dovecot_core:setting:: lmtp_client_workarounds
   :added: 2.3.9
   :todo: Indicate LMTP setting
   :values: @string

   Configures the list of active workarounds for LMTP client bugs. The list is
   space-separated. Supported workaround identifiers are:

   ``whitespace-before-path``

     Allow one or more spaces or tabs between 'MAIL FROM:' and path and
     between 'RCPT TO:' and path.

   ``mailbox-for-path``

     Allow using bare Mailbox syntax (i.e., without <...>) instead of full
     path syntax.


.. dovecot_core:setting:: lmtp_hdr_delivery_address
   :default: final
   :todo: Indicate LMTP setting
   :values: alternative, final, none

   The recipient address to use for the "Delivered-To:" header and the
   relevant "Received:" header.

   Options:

   ``alternative``

     Address from the RCPT TO OCRPT parameter

   ``final``

     Address from the RCPT TO command

   ``none``

     No address (always used for messages with multiple recipients)


.. dovecot_core:setting:: lmtp_proxy
   :default: no
   :seealso: @authentication-proxies
   :todo: Indicate LMTP setting
   :values: @boolean

   Proxy to other LMTP/SMTP servers?

   Proxy destination is determined via passdb lookup parameters.


.. dovecot_core:setting:: lmtp_proxy_rawlog_dir
   :added: 2.3.2
   :seealso: @debugging_rawlog
   :todo: Indicate LMTP setting
   :values: @string

   Directory location to store raw LMTP proxy protocol traffic logs.

   :ref:`Mail service user variables <variables-mail_service_user>` can be
   used. However, because LMTP session starts without a user, all
   user-specific variables expand to empty.


.. dovecot_core:setting:: lmtp_rawlog_dir
   :added: 2.3.2
   :seealso: @debugging_rawlog
   :todo: Indicate LMTP setting
   :values: @string

   Directory location to store raw LMTP protocol traffic logs.

   :ref:`Mail service user variables <variables-mail_service_user>` can be
   used. However, because LMTP session starts without a user, all
   user-specific variables expand to empty.


.. dovecot_core:setting:: lmtp_rcpt_check_quota
   :default: no
   :todo: Indicate LMTP setting
   :values: @boolean

   Should quota be verified before a reply to RCPT TO is issued?

   If active, this creates a small amount of extra overhead so it is disabled
   by default.


.. dovecot_core:setting:: lmtp_save_to_detail_mailbox
   :default: no
   :todo: Indicate LMTP setting
   :values: @boolean

   If the recipient address includes a detail element / role (as in user+detail
   format), save the message to the detail mailbox.


.. dovecot_core:setting:: lmtp_user_concurrency_limit
   :default: 0
   :todo: Indicate LMTP setting
   :values: @uint

   Limit the number of concurrent deliveries to a single user to this maximum
   value.

   It is useful if one user is receiving numerous mail messages and thereby
   causing delays to other deliveries.


.. dovecot_core:setting:: lmtp_verbose_replies
   :added: 2.3.18
   :default: no
   :values: @boolean

   This setting makes the replies returned to the client much more verbose.
   Currently, this only applies when the LMTP proxy is involved, for which
   e.g. backend connection errors are returned in full detail.

   Normally, these errors are replaced by a more generic error message to
   prevent leaking system details to the clients (e.g. IP addresses and ports).
   It is therefore not recommended to enable this setting beyond troubleshooting
   efforts.


.. dovecot_core:setting:: lock_method
   :default: fcntl
   :values: fcntl, flock, dotlock

   Specify the locking method to use for index files.

   Options:

   ``dotlock``

     ``mailboxname.lock`` file created by almost all software when writing to
     mboxes. This grants the writer an exclusive lock over the mbox, so it's
     usually not used while reading the mbox so that other processes can also
     read it at the same time. So while using a dotlock typically prevents
     actual mailbox corruption, it doesn't protect against read errors if
     mailbox is modified while a process is reading.

   ``flock``

     flock() system call is quite commonly used for both read and write
     locking. The read lock allows multiple processes to obtain a read lock
     for the mbox, so it works well for reading as well. The one downside to
     it is that it doesn't work if mailboxes are stored in NFS.

   ``fcntl``

     Very similar to flock, also commonly used by software. In some systems
     this fcntl() system call is compatible with flock(), but in other
     systems it's not, so you shouldn't rely on it. fcntl works with NFS if
     you're using lockd daemon in both NFS server and client.


.. dovecot_core:setting:: log_core_filter
   :values: @string

   Crash after logging a matching event. The syntax of the filter is described
   in :ref:`event_filter_global`.

   For example:

   .. code-block:: none

     log_core_filter = category=error

   will crash any time an error is logged, which can be useful for debugging.


.. dovecot_core:setting:: log_debug
   :values: @string

   Filter to specify what debug logging to enable.  The syntax of the filter is
   described in :ref:`event_filter_global`.

   .. note:: This will eventually replace :dovecot_core:ref:`mail_debug` and
             :dovecot_core:ref:`auth_debug` settings.


.. dovecot_core:setting:: log_path
   :default: syslog
   :seealso: @debug_log_path;dovecot_core, @info_log_path;dovecot_core
   :values: @string

   Specify the log file to use for error messages.

   Options:

   ``syslog``

     Log to syslog

   ``/dev/stderr``

     Log to stderr

   If you don't want to use syslog, or if you just can't find the Dovecot's
   error logs, you can make Dovecot log elsewhere as well:

   .. code-block:: none

     log_path = /var/log/dovecot.log

   If you don't want errors, info, and debug logs all in one file, specify
   :dovecot_core:ref:`info_log_path` or :dovecot_core:ref:`debug_log_path` as
   well:

   .. code-block:: none

     log_path = /var/log/dovecot.log
     info_log_path = /var/log/dovecot-info.log


.. dovecot_core:setting:: log_timestamp
   :default: %b %d %H:%M:%S
   :values: @string_novars

   The prefix for each line written to the log file.

   ``%`` variables are in strftime(3) format.


.. dovecot_core:setting:: login_access_sockets
   :values: @string
   :removed: 2.4.0,3.0.0

   For blacklisting or whitelisting networks, supply a space-separated list of
   login-access-check sockets for this setting.

   Dovecot login processes can check via UNIX socket whether login should be
   allowed for the incoming connection.


.. dovecot_core:setting:: login_socket_path
   :values: @string

   Default socket path for all services' login processes. Can be overridden by
   passing a parameter to the login executable.


.. dovecot_core:setting:: login_greeting
   :default: Dovecot ready.
   :values: @string

   The greeting message displayed to clients.

   Variables:

   LMTP

     :ref:`Mail service user variables <variables-mail_service_user>`

   Other Protocols

     :ref:`Login variables <variables-login>`


.. dovecot_core:setting:: login_log_format
   :default: %$: %s
   :values: @string_novars

   The formatting of login log messages.

   Variables:

   ======================= ===============================================
   Variable Name           Description
   ======================= ===============================================
   :ref:`variables-global`
   ``%s``                  A :dovecot_core:ref:`login_log_format_elements`
                           string
   ``%$``                  The log data
   ======================= ===============================================


.. dovecot_core:setting:: login_log_format_elements
   :default: user=<%u> method=%m rip=%r lip=%l mpid=%e %c session=<%{session}>
   :todo: Provide join example
   :values: @string_novars

   A space-separated list of elements of the login log formatting.

   Elements that have a non-empty value are joined together to form a
   comma-separated string.

   :ref:`Login variables <variables-login>` can be used.


.. dovecot_core:setting:: login_plugin_dir
   :default: /usr/lib64/dovecot/login
   :values: @string

   Location of the login plugin directory.


.. dovecot_core:setting:: login_plugins
   :values: @string

   List of plugins to load for IMAP and POP3 login processes.


.. dovecot_core:setting:: login_proxy_max_disconnect_delay
   :default: 0
   :values: @uint

   Specify the delayed disconnection interval of clients when there is a
   server mass-disconnect.

   For prevention of load spikes when a backend server fails or is restarted,
   disconnection is spread over the amount of time indicated.

   ``0`` disables the delay.


.. dovecot_core:setting:: login_proxy_max_reconnects
   :added: 2.3.12
   :default: 3
   :values: @uint

   How many times login proxy will attempt to reconnect to destination server
   on connection failures (3 reconnects = total 4 connection attempts).

   Reconnecting is done for most types of failures, except for regular
   authentication failures.

   There is a 1 second delay between each reconnection attempt.

   If :dovecot_core:ref:`login_proxy_timeout` is reached, further reconnects
   aren't attempted.


.. dovecot_core:setting:: login_proxy_rawlog_dir
   :added: 2.3.17
   :seealso: @debugging_rawlog
   :values: @string

   Login processes write rawlogs for proxied connections to this directory for
   debugging purposes. Note that login processes are usually chrooted, so the
   directory is relative to ``$base_dir/login/``.


.. dovecot_core:setting:: login_proxy_timeout
   :added: 2.3.12
   :default: 30 secs
   :values: @time_msecs

   Timeout for login proxy failures.

   The timeout covers everything from the time connection is started until a
   successful login reply is received.

   This can be overwritten by :ref:`proxy_timeout <authentication-proxies>`
   passdb extra field.

   This setting applies only to proxying via login processes, not to lmtp or
   doveadm processes.

.. dovecot_core:setting:: login_source_ips
   :values: @ip_addresses

   A list of hosts / IP addresses that are used in a round-robin manner for
   the source IP address when the proxy creates TCP connections.

   To allow sharing of the same configuration across multiple servers, you may
   use a ``?`` character at the start of the value to indicate that only the
   listed addresses that exist on the current server should be used.

   Example:

   .. code-block:: none

     login_source_ips = ?proxy-sources.example.com


.. dovecot_core:setting:: login_trusted_networks
   :values: !<space-separated list of trusted network ranges>

   This setting is used for a few different purposes, but most importantly it
   allows the client connection to tell the server what the original client's
   IP address was. This original client IP address is then used for logging
   and authentication checks.

   Client connections from trusted networks are also treated as
   :ref:`secured <secured_connections>`,
   unless :dovecot_core:ref:`ssl` is ``required``. Plaintext authentication is
   always allowed for secured connections
   (:dovecot_core:ref:`auth_allow_cleartext` is ignored).

   Localhost connections are secured by default, but they are not
   trusted by default. If you want localhost to be trusted, it needs to be
   included in this setting.

   The details of how this setting works depends on the used protocol:

   IMAP

     ID command can be used to override:
       * Session ID
       * Client IP and port (``%{rip}``, ``%{rport}``)
       * Server IP and port (``%{lip}``, ``%{lport}``)

     ``forward_*`` fields can be sent to auth process's passdb lookup

     The trust is always checked against the connecting IP address.
     Except if HAProxy is used, then the original client IP address is used.

   POP3

     XCLIENT command can be used to override:
       * Session ID
       * Client IP and port (``%{rip}``, ``%{rport}``)

     ``forward_*`` fields can be sent to auth process's passdb lookup

     The trust is always checked against the connecting IP address.
     Except if HAProxy is used, then the original client IP address is used.

   ManageSieve

     XCLIENT command can be used to override:
       * Session ID
       * Client IP and port (``%{rip}``, ``%{rport}``)

     The trust is always checked against the connecting IP address.
     Except if HAProxy is used, then the original client IP address is used.

   Submission

     XCLIENT command can be used to override:
       * Session ID
       * Client IP and port (``%{rip}``, ``%{rport}``)
       * HELO - Overrides what the client sent earlier in the EHLO command
       * LOGIN - Currently unused
       * PROTO - Currently unused

     ``forward_*`` fields can be sent to auth process's passdb lookup

     The trust is always checked against the connecting IP address.
     Except if HAProxy is used, then the original client IP address is used.

   LMTP

     XCLIENT command can be used to override:
       * Session ID
       * Client IP and port (``%{rip}``, ``%{rport}``)
       * HELO - Overrides what the client sent earlier in the LHLO command
       * LOGIN - Currently unused
       * PROTO - Currently unused
       * TIMEOUT (overrides :dovecot_core:ref:`mail_max_lock_timeout`)

     The trust is always checked against the connecting IP address.
     Except if HAProxy is used, then the original client IP address is used.


.. dovecot_core:setting:: mail_access_groups
   :todo: Describe format; comma-separated list?
   :values: @string

   Supplementary groups that are granted access for mail processes.

   Typically, these are used to set up access to shared mailboxes.

   .. note:: It may be dangerous to set these up if users can create
             symlinks. For example: if the "mail" group is chosen here,
             ``ln -s /var/mail ~/mail/var`` could allow a user to delete
             others' mailboxes, or ``ln -s /secret/shared/box ~/mail/mybox``
             would allow reading others' mail).


.. dovecot_core:setting:: mail_always_cache_fields
   :seealso: @mail_cache_fields;dovecot_core, @mail_never_cache_fields;dovecot_core
   :values: @string

   The fields specified here are always added to cache when saving mails, even
   if the client never accesses these fields.

   See :ref:`mail_cache_settings` for details and for the list of fields.


.. dovecot_core:setting:: mail_attachment_detection_options
   :values: @string

   Settings to control adding ``$HasAttachment`` or ``$HasNoAttachment``
   keywords. By default, all MIME parts with
   ``Content-Disposition=attachment`` or inlines with filename parameter are
   considered attachments.

   To enable this feature, this setting needs at least one option specified.
   Multiple options can be added in a space-separated list.

   Options:

   ``add-flags``

     Attachments are detected and marked during save. Detection is done also
     during fetch if it can be done without extra disk IO and with minimal CPU
     cost. This means that either both ``mime.parts`` and
     ``imap.bodystructure`` has to be in cache already, or if mail body is
     opened in any case.

     .. dovecotadded:: 2.3.13

   ``add-flags-on-save``

     Deprecated alias for ``add-flags``.

     Before v2.3.13 the detection was done only during save, not during fetch.

     .. dovecotdeprecated:: 2.3.13

   ``add-flags no-flags-on-fetch``

     Flags are added during save, but not during fetch. This option will
     likely be removed in a later release.

     .. dovecotadded:: 2.3.13

   ``content-type=<type|!type>``

     Include or exclude given content type. Including will only negate an
     exclusion (e.g. ``content-type=!foo/* content-type=foo/bar``).

   ``exclude-inlined``

     Do not consider any attachment with disposition inlined.


.. dovecot_core:setting:: mail_ext_attachment_path
   :values: @string

   The directory in which to store mail attachments.

   With :ref:`sdbox and mdbox <dbox_mbox_format>`, mail attachments can be
   saved to external files, which also allows single-instance storage of them.

   If no value is specified, attachment saving to external files is disabled.

   :ref:`Mail user variables <variables-mail_user>` can be used.


.. dovecot_core:setting_filter:: mail_ext_attachment
   :filter: mail_ext_attachment
   :setting: fs_driver
   :seealso: @mail_ext_attachment_path;dovecot_core
   :values: @named_filter

   Named filter for initializing :ref:`FS driver <fs>` for external attachments.

   Commonly used options:

   ``posix``

      No single-instance storage done (this option might simplify the
      filesystem's own de-duplication operations).

   ``sis``

      SIS with immediate byte-by-byte comparison during saving.

      .. dovecotchanged:: 2.4.0,3.0.0 SIS is deprecated and writing of
        SIS files is disabled. Reading is supported for now, any missing
        SIS attachments are replaced with files filled with spaces.

   ``sis-queue``

      SIS with delayed comparison and de-duplication.

      .. dovecotchanged:: 2.4.0,3.0.0 SIS is deprecated and writing of
        SIS files is disabled. Reading is supported for now, any missing
        SIS attachments are replaced with files filled with spaces.


.. dovecot_core:setting:: mail_ext_attachment_hash
   :default: %{sha1}
   :seealso: @mail_ext_attachment_path;dovecot_core
   :values: %{md4}, %{md5}, %{sha1}, %{sha256}, %{sha512}, %{size}

   The hash format to use in attachment filenames when saving attachments
   externally.

   Variables and additional text can be included in this string.

   The syntax allows truncation of any variable. For example ``%{sha256:80}``
   will return only the first 80 bits of the SHA256 output.


.. dovecot_core:setting:: mail_ext_attachment_min_size
   :default: 128k
   :seealso: @mail_ext_attachment_path;dovecot_core
   :values: @size

   Attachments below this size will not be saved externally.


.. dovecot_core:setting:: mail_attribute
   :seealso: @imap_metadata;dovecot_core
   :values: @named_filter

   Named filter for initializing :ref:`dict driver <dict>` for server and
   mailbox attributes (key=value).

   This is used by the URLAUTH and METADATA extensions, as well as various 
   other features.

   Example:

   .. code-block:: none

     mail_attribute {
       dict_driver = file
       dict_file_path = %h/dovecot-attributes
     }


.. dovecot_core:setting:: mail_cache_fields
   :default: flags
   :seealso: @mail_always_cache_fields;dovecot_core, @mail_never_cache_fields;dovecot_core
   :values: @string

   The default list of fields that are added to cache if no other caching
   decisions exist yet. This setting is used only when creating the initial
   INBOX for the user. Other folders get their defaults from the INBOX.

   See :ref:`mail_cache_settings` for details and for the list of fields.


.. dovecot_core:setting:: mail_chroot
   :values: @string

   The default chroot directory for mail processes.

   This chroots all users globally into the same directory.

   :ref:`Mail service user variables <variables-mail_service_user>` can be
   used.


.. dovecot_core:setting:: mail_debug
   :default: no
   :values: @boolean

   This setting adjusts log verbosity. It enables mail-process debugging. This
   can help you figure out the reason if Dovecot isn't finding certain mail
   messages.


.. dovecot_core:setting:: mail_fsync
   :default: optimized
   :values: always, optimized, never

   Specify when to use fsync() or fdatasync() calls.

   Using fsync waits until the data is written to disk before it continues,
   which is used to prevent corruption or data loss in case of server crashes.

   This setting applies to mail files and index files on the filesystem. This
   setting doesn't apply to object storage operations.

   Options:

   ``always``

     Use fsync after all disk writes.

     Recommended for NFS to make sure there aren't any delayed write()s.

   ``optimized``

     Use fsync after important disk writes.

     For example cache file writes aren't fsynced, because they can be
     regenerated if necessary.

   ``never``

     Never fsync any disk writes.

     This provides the best performance, but risks losing recently saved emails
     in case of a crash with most mailbox formats.

     With :ref:`obox <obox_settings>`, this option is recommended to be used
     because it affects only the local metacache operations. If a server
     crashes, the existing metacache is treated as potentially corrupted and
     isn't used.


.. dovecot_core:setting:: mail_full_filesystem_access
   :seealso: @mailbox_list_validate_fs_names;dovecot_core
   :default: no
   :values: @boolean

   Allow full filesystem access to clients?

   If enabled, no access checks are performed other than what the operating
   system does for the active UID/GID. This also disables the
   :dovecot_core:ref:`mailbox_list_validate_fs_names` setting.

   This setting works with both :ref:`Maildir <maildir_mbox_format>` and
   :ref:`mbox <mbox_mbox_format>`, allowing you to prefix mailbox names with
   /path/ or ~user/ indicators.


.. dovecot_core:setting:: mail_gid
   :seealso: @mail_uid;dovecot_core
   :todo: Describe value format (comma-separated list?)
   :values: @string, @uint

   The system group ID used for accessing mail messages.

   Can be either numeric IDs or group names.

   If you use multiple values here, userdb can override them by returning the
   gid field.


.. dovecot_core:setting:: mail_home
   :seealso: @mail_path;dovecot_core, @quick_configuration
   :values: @string

   There are various possible ways of specifying this parameter and
   :dovecot_core:ref:`mail_path`.

   The following example is one option when home is in ``/var/vmail/domain/user/``
   and mails are in ``/var/vmail/domain/user/mail/``:

   .. code-block:: none

     mail_home = /var/vmail/%d/%n
     mail_path = ~/mail

   :ref:`Mail service user variables <variables-mail_service_user>` can be
   used.


.. dovecot_core:setting:: mail_log_prefix
   :default: %s(%u)<%{process:pid}><%{session}>:
   :values: @string

   You can specify a log prefix for mail processes here.

   :ref:`Mail service user variables <variables-mail_service_user>` can be
   used.


.. dovecot_core:setting:: mail_max_keyword_length
   :default: 50
   :values: @uint

   The maximum length allowed for a mail keyword name.

   Compliance is enforced only during attempts to create new keywords


.. dovecot_core:setting:: mail_max_lock_timeout
   :default: 0
   :values: @time

   This value is used as a timeout for tempfailing mail connections.  It
   can be set globally, for application to all Dovecot services, but
   is normally better to set it in only certain protocol blocks.  You
   may wish to set a value for this for LMTP and LDA while leaving it at
   the global default of ``0`` for IMAP and POP3 connections, which
   tolerate tempfailing less well.


.. dovecot_core:setting:: mail_max_userip_connections
   :default: 10
   :values: @uint

   The maximum number of IMAP connections allowed for a user from each IP
   address.

   This setting is checked only by backends, not proxies.

   Note that for this to work, any username changes must be done already by
   passdb lookup (not by userdb lookup).

   Unique users are identified via case-sensitive comparison.


.. dovecot_core:setting:: mail_never_cache_fields
   :default: imap.envelope
   :seealso: @mail_always_cache_fields;dovecot_core, @mail_cache_fields;dovecot_core
   :values: @string

   List of fields that should never be cached.

   This should generally never include anything other than ``imap.envelope``,
   which isn't needed because it can be generated from the cached header
   fields.

   See :ref:`mail_cache_settings` for details and for the list of fields.


.. dovecot_core:setting:: mail_nfs_index
   :default: no
   :seealso: @mail_fsync;dovecot_core
   :values: @boolean

   When mail-index files exist in NFS storage and you're running a
   multi-server setup that you wish to flush NFS caches, this can be set
   to ``yes`` (in this case, make sure also to use
   :dovecot_core:ref:`mmap_disable` = ``yes`` and
   :dovecot_core:ref:`mail_fsync` = ``optimized``).


.. dovecot_core:setting:: mail_nfs_storage
   :default: no
   :values: @boolean

   Flush NFS caches whenever it is necessary to do so.

   This setting should only be enabled if you are using multiple servers on
   NFS.


.. dovecot_core:setting:: mail_plugin_dir
   :default: /usr/lib64/dovecot
   :seealso: @mail_plugins;dovecot_core
   :values: @string

   The directory in which to search for Dovecot mail plugins.


.. dovecot_core:setting:: mail_plugins
   :seealso: @mail_plugin_dir;dovecot_core
   :values: @string

   A space-separated list of plugins to load.


.. dovecot_core:setting:: mail_prefetch_count
   :default: 0
   :values: @uint

   The number of messages to try to prefetch whenever possible. Depending on
   the (remote) storage latency, this may significantly speed up performance
   when reading many mails. The exact behavior depends on the mailbox format:

   * mbox, mdbox: No effect in behavior.
   * sdbox, maildir: Call ``posix_fadvise(POSIX_FADV_WILLNEED)`` on mail files
     to instruct kernel to read the whole files into memory.
   * imapc: Combine multiple mail reads into the same remote imapc FETCH
     command. For example with ``mail_prefetch_count=0`` reading two mails
     would result in ``FETCH 1 BODY.PEEK[]`` and ``FETCH 2 BODY.PEEK[]``
     commands, while with ``mail_prefetch_count=1`` they would be combined into
     a single ``FETCH 1:2 BODY.PEEK[]`` command. The downside is that each mail
     uses a file descriptor and disk space in :dovecot_core:ref:`mail_temp_dir`.
   * obox: Read multiple mails in parallel from object storage to local disk
     without waiting for previous reads to finish. The downside is that each
     mail uses a file descriptor and disk space in
     :dovecot_core:ref:`mail_temp_dir`.

     This setting is also the default for
     :dovecot_plugin:ref:`obox_max_parallel_copies`,
     :dovecot_plugin:ref:`obox_max_parallel_deletes` and
     :dovecot_plugin:ref:`obox_max_parallel_writes`.

   For imapc and obox formats a good value is likely between 10..100.

   ``0`` means that no prefetching is done.


.. dovecot_core:setting:: mail_privileged_group
   :values: @string

   This group is enabled temporarily for privileged operations.  Currently,
   this is used only with the INBOX when either its initial creation or
   dotlocking fails.

   Typically, this is set to ``mail`` to give access to ``/var/mail``.

   You can give Dovecot access to mail group by setting:

   .. code-block:: none

     mail_privileged_group = mail


.. dovecot_core:setting:: mail_save_crlf
   :default: no
   :values: @boolean

   Save message with CR+LF line endings?

   Messages are normally saved with LF line endings.

   Enabling this makes saving messages less CPU-intensive, especially with the
   sendfile() system call used in Linux and FreeBSD. However, enabling comes at
   the cost of slightly increased disk I/O, which could decrease the speed in
   some deployments.


.. dovecot_core:setting:: mail_server_admin
   :seealso: @imap_metadata;dovecot_core
   :todo: Indicate metadata setting
   :values: @string

   The method for contacting the server administrator.

   Per the METADATA standard (:rfc:`5464`), this value MUST be a URI (e.g., a
   mailto: or tel: URL), but that requirement is not enforced by Dovecot.

   This value is accessible to authenticated users through the
   ``/shared/admin`` IMAP METADATA server entry.

   Example:

   .. code-block:: none

     mail_server_admin = mailto:admin@example.com


.. dovecot_core:setting:: mail_server_comment
   :seealso: @imap_metadata;dovecot_core
   :todo: Indicate metadata setting
   :values: @string

   A comment or note that is associated with the server.

   This value is accessible to authenticated users through the
   ``/shared/comment`` IMAP METADATA server entry.


.. dovecot_core:setting:: mail_shared_explicit_inbox
   :default: no
   :values: @boolean

   This setting determines whether a shared INBOX should be visible as
   "shared/user" or as "shared/user/INBOX" instead.


.. dovecot_core:setting:: mail_sort_max_read_count
   :default: 0
   :values: @uint

   The number of slow mail accesses an IMAP SORT can perform before it returns
   failure to the client.

   On failure, the untagged SORT reply is retuned, but it is likely not
   correct.

   The IMAP reply returned to the client is:

   .. code-block:: none

     NO [LIMIT] Requested sort would have taken too long.

   .. note:: As a special case with the :ref:`obox <obox_settings>` format when
             doing a ``SORT (ARRIVAL)``, the SORT will always return OK.

             When it reaches the slow access limit, it falls back to using the
             save-date (instead of received-date) for the rest of the mails.

             Often this produces mostly the same result, especially in the
             INBOX.


.. dovecot_core:setting:: mail_temp_dir
   :default: /tmp
   :todo: Indicate LDA AND LMTP setting
   :values: @string

   The directory in which LDA/LMTP will temporarily store incoming message data
   that is above 128kB in size.

   :ref:`Mail user variables <variables-mail_user>` can be used.


.. dovecot_core:setting:: mail_temp_scan_interval
   :default: 1week
   :values: @time

   How often Dovecot scans for and deletes stale temporary files. These files
   exist only if Dovecot crashes while saving a message. This is just to make
   sure such temporary files will eventually get deleted to avoid wasting disk
   space. This scan happens independently for each folder, and it's done at the
   time the folder is opened.

   A value of ``0`` means this scan never occurs.

   .. dovecotchanged:: 2.3.21 In order to prevent load spikes the actual
      value of the setting is spread increasing it by 0..30%, based on a hash
      of the username.

   The scanning is done only for these mailbox formats:

   * maildir: Delete all files having ctime older than 36 hours from ``tmp/``.
     The scan is done if tmp/ directory's atime older than
     ``mail_temp_scan_interval``.
   * sdbox, mdbox: Delete ``.temp.*`` files having ctime older than 36 hours from
     ``dbox-Mails/``. The scan is done if the ``last_temp_file_scan`` header
     field in dovecot.index is older than ``mail_temp_scan_interval``.
   * mdbox: Delete ``.temp.*`` files having ctime older than 36 hours from
     ``storage/``. The scan is done if storage/ directory's atime is older than
     ``mail_temp_scan_interval``.

.. dovecot_core:setting:: mail_uid
   :seealso: @mail_gid;dovecot_core
   :todo: Describe value format (comma-separate list?)
   :values: @string, @uint

   This setting indicates the system userid used for accessing mail
   messages.  If you use multiple values here, userdb can override them
   by returning UID or GID fields.  You can use either numeric IDs or
   usernames here.


.. dovecot_core:setting:: mail_vsize_bg_after_count
   :default: 0
   :seealso: @quota_plugin
   :values: @uint

   Controls transitioning mail size determination to the background instead of
   synchronously during the delivery process.

   After this many messages have been opened, the system allows a background
   indexer-worker process to perform quota calculations in the background.

   This may happen when mail messages do not have their virtual sizes cached.

   When indexing is occurring in the background, explicit quota size queries
   return an internal error and mail deliveries are assumed to succeed.

   This setting must not be set to indexer-worker process, or the background
   calculation isn't finished. The configuration should be like:

   .. code-block:: none

     protocol !indexer-worker {
       mail_vsize_bg_after_count = 10
     }


.. dovecot_core:setting:: mailbox_idle_check_interval
   :default: 30secs
   :todo: Indicate imap setting
   :values: @time

   The minimum time between checks for new mail/other changes when a mailbox
   is in the IMAP IDLE state.


.. dovecot_core:setting:: mailbox_list_index
   :default: yes
   :values: @boolean

   Dovecot indexes live at the root of user's mailbox storage, and allows
   quick lookup of mailbox status instead of needing to open all mailbox
   indexes separately.

   Enabling this optimizes the server reply to IMAP STATUS commands, which are
   commonly issued by clients. This also needs to be enabled if you wish to
   enable the IMAP NOTIFY extension.


.. dovecot_core:setting:: mailbox_list_index_include_inbox
   :default: no
   :seealso: @mailbox_list_index
   :values: @boolean

   Should INBOX be kept up-to-date in the mailbox list index?

   Disabled by default as most mailbox accesses will open INBOX anyway.


.. dovecot_core:setting:: mailbox_list_index_very_dirty_syncs
   :default: no
   :values: @boolean

   If enabled, assume that the mailbox list index is fully updated so that
   stat() will not be run for mailbox files/directories.


.. dovecot_core:setting_link:: maildir_broken_filename_sizes


.. dovecot_core:setting_link:: maildir_copy_with_hardlinks


.. dovecot_core:setting_link:: maildir_empty_new


.. dovecot_core:setting_link:: maildir_stat_dirs


.. dovecot_core:setting_link:: maildir_very_dirty_syncs


.. dovecot_core:setting:: master_user_separator
   :values: @string
   :removed: 2.3.20

   This setting was accidentally used by the director service. It has been
   replaced by the :dovecot_core:ref:`auth_master_user_separator` setting. With
   old Dovecot versions both the settings must be set to the same value.

.. dovecot_core:setting_link:: mbox_dirty_syncs


.. dovecot_core:setting_link:: mbox_dotlock_change_timeout


.. dovecot_core:setting_link:: mbox_lazy_writes


.. dovecot_core:setting_link:: mbox_lock_timeout


.. dovecot_core:setting_link:: mbox_md5


.. dovecot_core:setting_link:: mbox_min_index_size


.. dovecot_core:setting_link:: mbox_read_locks


.. dovecot_core:setting_link:: mbox_very_dirty_syncs


.. dovecot_core:setting_link:: mbox_write_locks


.. dovecot_core:setting_link:: mdbox_preallocate_space


.. dovecot_core:setting_link:: mdbox_rotate_interval


.. dovecot_core:setting_link:: mdbox_rotate_size


.. dovecot_core:setting:: mmap_disable
   :default: no
   :values: @boolean

   Disable mmap() usage?

   This must be set to ``yes`` if you store indexes to shared filesystems
   (i.e., if you use NFS or a clustered filesystem).


.. dovecot_core:setting:: oauth2
   :values: @named_filter

   Filter for oauth2 specific settings. See
   :ref:`authentication-oauth2`.


.. dovecot_core:setting:: pop3_client_workarounds
   :todo: Indicate POP3 setting
   :values: @string

   Workarounds for various POP3 client bugs can be enabled here.  The list is
   space-separated.

   The following values are currently supported:

   ``oe-ns-eoh``

     Because Outlook Express and Netscape Mail expect an end-of-headers
     line, this option sends one explicitly if none has been sent.

   ``outlook-no-nuls``

     Because Outlook and Outlook Express hang if messages contain NUL
     characters, this setting replaces each of them with a 0x80 character.


.. dovecot_core:setting:: pop3_delete_type
   :default: default
   :todo: Indicate POP3 setting; Describe difference between flag and expunge
   :values: default, flag, expunge

   Action to perform in POP3 when mails are deleted and
   :dovecot_core:ref:`pop3_deleted_flag` is enabled.


.. dovecot_core:setting:: pop3_deleted_flag
   :seealso: @pop3_delete_type;dovecot_core
   :todo: Indicate POP3 setting
   :values: @string

   Change POP3 behavior so a user cannot permanently delete messages via POP3.

   Instead, the messages are hidden from POP3 sessions by setting an IMAP
   flag, which Dovecot will filter out in future listings.

   To enable this behavior, enter the name of the IMAP keyword to use. Note:
   this keyword will visible on IMAP clients for the message.

   Example:

   .. code-block:: none

     pop3_deleted_flag = $POP3Deleted


.. dovecot_core:setting:: pop3_enable_last
   :default: no
   :todo: Indicate POP3 setting
   :values: @boolean

   Enable support for the POP3 LAST command.

   While this command has been removed from newer POP3 specs, some clients
   still attempt to use it. Enabling this causes the RSET command to clear all
   \Seen flags that messages may have.


.. dovecot_core:setting:: pop3_fast_size_lookups
   :default: no
   :todo: Indicate POP3 setting
   :values: @boolean

   If enabled, use the virtual message size of the message for POP3 replies if
   available.

   POP3 requires message sizes to be listed as if they contain CR+LF
   line breaks; however, many POP3 servers instead return the sizes with
   pure line feeds (LFs), for the sake of speed.

   If enabled, use the virtual message size if available, before
   falling back to the incorrect, physical size (used by many POP3
   servers) if judging the correct size would have required opening the
   message to determine.


.. dovecot_core:setting:: pop3_lock_session
   :default: no
   :todo: Indicate POP3 setting
   :values: @boolean

   If enabled, only one POP3 session may exist for any single user.


.. dovecot_core:setting:: pop3_logout_format
   :default: top=%t/%p retr=%r/%b del=%d/%m size=%s
   :todo: Indicate POP3 setting
   :values: @string_novars

   The string to display to the client on POP3 logout (informational only).

   Variables available:

   ============================ ===========================================
   Variable Name                Description
   ============================ ===========================================
   :ref:`variables-mail_user`
   ``%{input}``, ``%i``         Bytes read from the client
   ``%{output}``, ``%o``        Bytes sent to the client
   ``%{top_count}``, ``%t``     Number of TOP commands run
   ``%{top_bytes}``, ``%p``     Bytes sent to the client because of TOP
                                commands
   ``%{retr_count}``, ``%r``    Number of RETR commands run
   ``%{retr_bytes}``, ``%b``    Bytes sent to the client because of RETR
                                commands
   ``%{deleted_count}``, ``%d`` Number of deleted messages
   ``%{deleted_bytes}``         Number of bytes in deleted messages
   ``%{message_count}``, ``%m`` Number of messages before deletion
   ``%{message_bytes}``, ``%s`` Mailbox size, in bytes, before deletion
   ``%{uidl_change}``, ``%u``   The old and the new UIDL hash (which can be
                                useful for identifying unexpected changes in
                                UIDLs)
   ============================ ===========================================


.. dovecot_core:setting:: pop3_no_flag_updates
   :default: no
   :todo: Indicate POP3 setting
   :values: @boolean

   If enabled, do not attempt to mark mail messages as seen or non-recent when
   a POP3 session is involved.


.. dovecot_core:setting:: pop3_reuse_xuidl
   :default: no
   :todo: Indicate POP3 setting
   :values: @boolean

   If enabled, and the mail message has an X-UIDL header, use this as the
   mail's UIDL.


.. dovecot_core:setting:: pop3_save_uidl
   :default: no
   :todo: Indicate Maildir-only AND POP3 setting
   :values: @boolean

   :ref:`Maildir <maildir_mbox_format>` only: If enabled, allow permanent
   saving of UIDLs sent to POP3 clients so that changes to
   :dovecot_core:ref:`pop3_uidl_format` don't cause future changes to the
   corresponding UIDLs.


.. dovecot_core:setting:: pop3_uidl_duplicates
   :default: allow
   :todo: Indicate POP3 setting
   :values: allow, rename

   How to handle any duplicate POP3 UIDLs that may exist.

   Options:

   ``allow``

      Show duplicates to clients.

   ``rename``

      Append a temporary counter (such as -2 or -3) after the UIDL


.. dovecot_core:setting:: pop3_uidl_format
   :default: %08Xu%08Xv
   :todo: Indicate POP3 setting
   :values: @string_novars

   The POP3 unique mail identifier (UIDL) format to use.

   The following variables can be used in combination with the
   standard variable modifiers (e.g., %Uf supplies the filename in uppercase):

   ========================== ==============================================
   Variable Name              Description
   ========================== ==============================================
   :ref:`variables-global`
   ``%{uidvalidity}``, ``%v`` Mailbox's IMAP UIDVALIDITY value
   ``%{uid}``, ``%u``         IMAP UID associated with the message
   ``%{md5}``, ``%m``         MD5 sum of the mailbox headers in hex
                              (:ref:`mbox <mbox_mbox_format>` only)
   ``%{filename}``, ``%f``    Filename (:ref:`Maildir <maildir_mbox_format>`
                              only)
   ``%{guid}``, ``%g``        Dovecot GUID for the message
   ========================== ==============================================


.. dovecot_core:setting_link:: pop3c_features


.. dovecot_core:setting_link:: pop3c_host


.. dovecot_core:setting_link:: pop3c_master_user


.. dovecot_core:setting_link:: pop3c_password


.. dovecot_core:setting_link:: pop3c_port


.. dovecot_core:setting_link:: pop3c_quick_received_date


.. dovecot_core:setting_link:: pop3c_rawlog_dir


.. dovecot_core:setting_link:: pop3c_ssl


.. dovecot_core:setting_link:: pop3c_ssl_verify


.. dovecot_core:setting_link:: pop3c_user


.. dovecot_core:setting:: postmaster_address
   :default: postmaster@%{if;%d;ne;;%d;%{hostname}}
   :todo: Indicate LDA AND LMTP setting
   :values: @string

   The From address from which email rejection messages (bounces) are sent.

   As used here, the variable ``%d`` expands to the domain of the local user.
   Other :ref:`mail user variables <variables-mail_user>` can be used as well.

.. dovecot_core:setting:: process_shutdown_filter
   :values: @string

   .. dovecotadded:: 2.3.19

   Filter to specify which events shutdown the process after finishing the
   current connections. This is mainly intended to save memory by preventing
   long-running imap processes that use a lot of memory (due to libc not freeing
   all of it to the OS). The syntax of the filter is described in
   :ref:`event_filter_global`.

   For example:

   .. code-block:: none

     process_shutdown_filter = "event=mail_user_session_finished AND rss > 10M"


.. dovecot_core:setting:: protocols
   :default: imap pop3 lmtp
   :values: @boollist

   The list of protocols to enable. For example:

   .. code-block:: none

      # Only IMAP protocol enabled:
      protocols = imap
      # Enable also LMTP protocol (on top of IMAP):
      protocols {
        lmtp = yes
      }

      # Disable all protocols:
      protocols =


.. dovecot_core:setting:: quota_full_tempfail
   :default: no
   :seealso: @quota_plugin
   :values: @boolean

   If enabled, return a temporary failure to the sending server if quota is
   exceeded. This allows the message to potentially be delivered later if the
   account moves under the quota limit at the time of redelivery.

   If disabled, the message is bounced with a permanent error returned to the
   sending server.


.. dovecot_core:setting:: rawlog_dir
   :added: 2.2.26
   :seealso: @debugging_rawlog
   :values: @string

   Directory where to create ``*.in`` and ``*.out`` rawlog files, one per TCP
   connection. The directory must already exist and be writable by the process.
   No error is logged if the directory doesn't exist.

   :ref:`Mail user variables <variables-mail_user>` can be used.

   Example:

   .. code-block:: none

     protocol imap {
       rawlog_dir = /tmp/rawlog/%u
       # if you want to put files into user's homedir, use this, do not use ~
       #rawlog_dir = %h/rawlog
     }


.. dovecot_core:setting:: recipient_delimiter
   :default: +
   :values: @string

   The separator between the :user and :detail address parts.


.. dovecot_core:setting:: rejection_reason
   :default: Your message to <%t> was automatically rejected:%n%r
   :todo: Indicate LDA AND LMTP setting
   :values: @string_novars

   A human-readable message for the recipients of bounce messages.

   The following variables are allowed:

   ======================= =====================
   Variable Name           Description
   ======================= =====================
   :ref:`variables-global`
   ``%{crlf}``, ``%n``     Newline (CRLF)
   ``%{reason}``, ``%r``   Reason for rejection
   ``%{subject}``, ``%s``  Original subject line
   ``%{to}``, ``%t``       Recipient address
   ======================= =====================

   The variable values are obtained from the mail being delivered or the
   delivery protocol.


.. dovecot_core:setting:: rejection_subject
   :default: Rejected: %s
   :seealso: @rejection_reason;dovecot_core
   :values: @string_novars

   The Subject: header to use for bounce messages.

   See :dovecot_core:ref:`rejection_reason` for the list of variables that can
   be used.


.. dovecot_core:setting:: sendmail_path
   :default: /usr/sbin/sendmail
   :values: @string

   The binary to use for sending email.

   Used only if :dovecot_core:ref:`submission_host` is not set.


.. dovecot_core:setting:: shutdown_clients
   :default: yes
   :values: @boolean

   If enabled, all processes are killed when the master process is shutdown.

   Otherwise, existing processes will continue to run. This may be useful to not
   interrupt earlier sessions, but may not be desirable if restarting Dovecot
   to apply a security update, for example.


.. dovecot_core:setting:: ssl
   :default: yes
   :seealso: @dovecot_ssl_configuration
   :values: yes, no, required

   The level of SSL support. This setting affects both the implicit SSL ports
   and the STARTTLS commands.

   Options:

   ``no``

     SSL/TLS is completely disabled.

   ``yes``

     SSL/TLS is enabled, but not necessarily required for clients.

   ``required``

     SSL/TLS is required for all imap, pop3, managesieve and
     submission protocol client connections. This differs from
     :dovecot_core:ref:`auth_allow_cleartext` in that even non-cleartext
     authentication mechanisms aren't allowed without SSL/TLS.

   .. _secured_connections:

   This setting affects the ``secured`` state of connections:

     * Dovecot-terminated TLS connections are always ``secured``.
     * :ref:`HAProxy-terminated TLS connections <haproxy_tls_forward>` are
       always ``secured``.

       * This is true even if HAProxy isn't running on the same server as
         Dovecot, and the connection between HAProxy and Dovecot isn't secured.
	 The reasoning here is that this kind of a configuration is most likely
	 intentional. If such connection wasn't treated ``secured``, it would
	 prevent using ssl=required to enforce end clients to use TLS.

     * Non-haproxy connections from localhost are always ``secured``.
     * Localhost connections from HAProxy server to HAProxy are always
       ``secured``.
     * Other connections from :dovecot_core:ref:`login_trusted_networks` are
       ``secured``, but only if ``ssl`` setting is not ``required``.

       .. dovecotchanged:: 2.4.0,3.0.0 With old versions these connections
          were ``secured`` regardless of the ``ssl`` setting.
     * Other connections from HAProxy are ``secured``, but only if ``ssl``
       setting is not ``required``.

       .. dovecotchanged:: 2.4.0,3.0.0 With old versions these connections
          were ``secured`` regardless of the ``ssl`` setting.

   Connections that are ``secured`` are always allowed to use plaintext
   authentication. Auth lookups will have the connection marked as ``secured``,
   which also affects the ``%{secured}`` :ref:`variable <config_variables>`.

.. dovecot_core:setting:: ssl_alt_cert
   :added: 2.2.31
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   Alternative SSL certificate that will be used if the algorithm differs from
   the primary certificate.

   This is useful when migrating to e.g. an ECDSA certificate.

   Example:

   .. code-block:: none

     ssl_alt_cert = </path/to/alternative/cert.pem


.. dovecot_core:setting:: ssl_alt_key
   :added: 2.2.31
   :seealso: @ssl;dovecot_core, @ssl_alt_cert;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   Private key for :dovecot_core:ref:`ssl_alt_cert`.

   Example:

   .. code-block:: none

      ssl_alt_key = </path/to/alternative/key.pem
      ssl_alt_cert = </path/to/alternative/cert.pem


.. dovecot_core:setting:: ssl_ca
   :seealso: @ssl;dovecot_core, @ssl_client_require_valid_cert;dovecot_core, @ssl_request_client_cert;dovecot_core, @dovecot_ssl_configuration
   :values: @string
   :changed: 2.4.0,3.0.0 :dovecot_core:ref:`ssl_client_ca` setting was split out of this.

   List of SSL CA certificates that are used to validate whether SSL
   certificates presented by incoming imap/pop3/etc. client connections are
   valid.

   Example:

   .. code-block:: none

      ssl_ca = </etc/dovecot/ca.crt
      ssl_request_client_cert = yes
      auth_ssl_require_client_cert = yes


.. dovecot_core:setting:: ssl_cert
   :default: </etc/ssl/certs/dovecot.pem
   :seealso: @ssl;dovecot_core, @ssl_key;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   The PEM-encoded X.509 SSL/TLS certificate presented for incoming
   imap/pop3/etc. client connections.

   The :dovecot_core:ref:`ssl_key` is also needed for the private certificate.

   Example:

   .. code-block:: none

      ssl_cert = </etc/ssl/private/dovecot.crt
      ssl_key = </etc/ssl/private/dovecot.key


.. dovecot_core:setting:: ssl_cert_username_field
   :default: commonName
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   Field name in the SSL client certificate that is used for
   :dovecot_core:ref:`auth_ssl_username_from_cert`.

   The most common choices are ``commonName`` and ``x500UniqueIdentifier``.

   .. Note::

      :dovecot_core:ref:`auth_ssl_username_from_cert` MUST be enabled.


.. dovecot_core:setting:: ssl_cipher_list
   :default: ALL:!kRSA:!SRP:!kDHd:!DSS:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK:!RC4:!ADH:!LOW@STRENGTH
   :seealso: @ssl;dovecot_core, @ssl_cipher_suites;dovecot_core, @ssl_min_protocol;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   The list of SSL ciphers to use for TLSv1.2 and below connections, in order
   of preference. Use :dovecot_core:ref:`ssl_cipher_suites` for TLSv1.3
   connections.

   You do not need to edit this setting in order to disable specific SSL
   protocols; that is best done with :dovecot_core:ref:`ssl_min_protocol`
   instead.

   This setting is used for both incoming and outgoing SSL connections.

.. dovecot_core:setting:: ssl_cipher_suites
   :added: 2.3.15
   :default: !<OpenSSL version specific>
   :seealso: @ssl;dovecot_core, @ssl_cipher_list;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   The list of SSL cipher suites to use for TLSv1.3 connections, in order of
   preference. Use :dovecot_core:ref:`ssl_cipher_list` for TLSv1.2 and below
   connections.

   This setting is used for both incoming and outgoing SSL connections.

   See: https://wiki.openssl.org/index.php/TLS1.3#Ciphersuites


.. dovecot_core:setting:: ssl_client_ca_dir
   :seealso: @ssl;dovecot_core; @dovecot_ssl_configuration
   :values: @string

   The directory where trusted SSL CA certificates can be found. For example
   ``/etc/ssl/certs``. These certificates are used only for outgoing SSL
   connections (e.g. with the imapc backend).

   For extra security you might want to point to a directory containing
   certificates only for the CAs that are actually needed for the server
   operation instead of all the root CAs.


.. dovecot_core:setting:: ssl_client_ca_file
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   File containing the trusted SSL CA certificates. For example
   ``/etc/ssl/certs/ca-bundle.crt``.

   These certificates are used only for outgoing SSL connections (e.g. with
   the :ref:`imapc backend <imapc_mbox_format>`).

   Note that this setting isn't recommended to be used with large CA bundles,
   because all the certificates are read into memory. This leads to excessive
   memory usage, because it gets multiplied by the number of imap processes.
   It's better to either use :dovecot_core:ref:`ssl_client_ca_dir` setting or
   use a CA bundle that only contains the CAs that are actually necessary for
   the server operation.


.. dovecot_core:setting:: ssl_client_ca
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @string
   :added: 2.4.0,3.0.0 Split out of :dovecot_core:ref:`ssl_ca` setting.

   List of trusted SSL CA certificates. This is used in addition to
   :dovecot_core:ref:`ssl_client_ca_file` and
   :dovecot_core:ref:`ssl_client_ca_dir`. This is mainly useful to provide
   CAs for proxying in login processes, which run chrooted and can't access
   CA files outside the chroot.


.. dovecot_core:setting:: ssl_client_cert
   :seealso: @ssl;dovecot_core, @ssl_client_key;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   Public SSL certificate used for outgoing SSL connections. This is generally
   needed only when the server authenticates the client using the certificate.

   :dovecot_core:ref:`ssl_client_key` is also needed for the private
   certificate.

   Example:

   .. code-block:: none

      ssl_client_cert = </etc/dovecot/dovecot-client.crt
      ssl_client_key = </etc/dovecot/dovecot-client.key


.. dovecot_core:setting:: ssl_client_key
   :seealso: @ssl;dovecot_core, @ssl_client_cert;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   Private key for :dovecot_core:ref:`ssl_client_cert`.

   Example:

   .. code-block:: none

      ssl_client_cert = </etc/dovecot/dovecot-client.crt
      ssl_client_key = </etc/dovecot/dovecot-client.key


.. dovecot_core:setting:: ssl_crypto_device
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: !<Obtain by running 'openssl engine' command>

   Which SSL crypto device to use.


.. dovecot_core:setting:: ssl_curve_list
   :default: !<defaults from the SSL library>
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   Colon separated list of elliptic curves to use, in order of preference.
   An empty value uses the defaults from the SSL library.

   This setting is used for both incoming and outgoing SSL connections.

   Example:

   .. code-block:: none

     ssl_curve_list = P-521:P-384:P-256


.. dovecot_core:setting:: ssl_dh
   :added: 2.3.0
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   As of Dovecot v2.3, the path to the Diffie-Hellman parameters file must be
   provided. This setting isn't needed if using only ECDSA certificates.

   You can generate a new parameters file by, for example, running
   ``openssl gendh 4096`` on a machine with sufficient entropy (this may take
   some time).

   Example:

   .. code-block:: none

     ssl_dh=</path/to/dh.pem


.. dovecot_core:setting:: ssl_client_require_valid_cert
   :default: yes
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @boolean

   Require a valid certificate when connecting to external SSL services?


.. dovecot_core:setting:: ssl_key
   :seealso: @ssl;dovecot_core, @ssl_cert;dovecot_core, @ssl_key_password;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   The PEM-encoded X.509 SSL/TLS private key for :dovecot_core:ref:`ssl_cert`.

   Example:

   .. code-block:: none

      ssl_cert = </etc/ssl/private/dovecot.crt
      ssl_key = </etc/ssl/private/dovecot.key


.. dovecot_core:setting:: ssl_key_password
   :seealso: @ssl;dovecot_core, @ssl_key;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   The password to use if :dovecot_core:ref:`ssl_key` is password-protected.

   Since this file is often world-readable, you may wish to specify the path
   to a file containing the password, rather than the password itself, by
   using the format ``ssl_key_password = <path`` here. The path should be to a
   root-owned file with mode 0600.

   Alternatively, you can supply the password via the -p parameter at startup.


.. dovecot_core:setting:: ssl_min_protocol
   :default: TLSv1.2
   :seealso: @ssl;dovecot_core, @ssl_cipher_list;dovecot_core, @dovecot_ssl_configuration
   :values: @string

   The minimum SSL protocol version Dovecot accepts.

   This setting is used for both incoming and outgoing SSL connections.

   Supported values are:

   ``ANY``

     .. dovecotadded:: 2.3.15
     .. dovecotchanged:: 2.4.0,3.0.0

     .. warning:: this value is meant for tests only.
                  It should not be used in any deployment of any value/relevance.

   ``SSLv3``

     .. dovecotremoved:: 2.4.0,3.0.0

   ``TLSv1``

     Support TLSv1+. (default before v2.3.15) (TLSv1 deprecated: :rfc:`8996`)

   ``TLSv1.1``

     Support TLSv1.1+. (TLSv1.1 deprecated: :rfc:`8996`)

   ``TLSv1.2``

     Support TLSv1.2+. (default since v2.3.15)

   ``TLSv1.3``

     Support TLSv1.3+.

     .. dovecotadded:: 2.3.15

   ``LATEST``

     Support only the latest version available.

     .. dovecotadded:: 2.3.15


.. dovecot_core:setting:: ssl_options
   :default: no-compression
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: compression, no_ticket

   Additional options for SSL.

   This setting is used for both incoming and outgoing SSL connections.

   Currently supported options are:

   ``compression``

     Enable compression.

   ``no_ticket``

     Disable SSL session tickets.


.. dovecot_core:setting:: ssl_prefer_server_ciphers
   :default: no
   :seealso: @ssl;dovecot_core, @dovecot_ssl_configuration
   :values: @boolean

   If enabled, give preference to the server's cipher list over a client's
   list. This setting is used only for server connections.


.. dovecot_core:setting:: ssl_require_crl
   :default: yes
   :seealso: @ssl;dovecot_core, @ssl_ca;dovecot_core, @dovecot_ssl_configuration
   :values: @boolean

   If enabled, the CRL check must succeed for presented SSL client
   certificate and any intermediate certificates. The CRL list is generally
   appended to the :dovecot_core:ref:`ssl_ca` file.

   This setting is used only for server connections.


.. dovecot_core:setting:: ssl_request_client_cert
   :default: no
   :seealso: @ssl, @ssl;dovecot_core, @auth_ssl_require_client_cert;dovecot_core, @dovecot_ssl_configuration
   :values: @boolean
   :changed: 2.4.0,3.0.0 Renamed from ssl_verify_client_cert setting.

   If enabled, the imap/pop3/etc. client is requested to send an SSL
   certificate.

   .. note:: This setting doesn't yet require the certificate to be valid or
             to even exist. See :dovecot_core:ref:`auth_ssl_require_client_cert`.

.. dovecot_core:setting:: state_dir
   :default: /var/lib/dovecot
   :values: @string

   The compile-time directory PKG_STATEDIR (typically /var/lib/dovecot)
   is hard-coded as the location of state files. The PKG_STATEDIR value
   is taken as the default state_dir setting but can be overridden - for
   instance, if you wish to use the same binaries for a system daemon and
   a user daemon.

   The settings ``state_dir = /home/foo/dovecot/state`` and
   ``base_dir = /home/foo/dovecot/run`` give an example of usage.


.. dovecot_core:setting:: stats_writer_socket_path
   :default: stats-writer
   :values: @string

   The path to the stats-writer socket.


.. dovecot_core:setting:: submission_add_received_header
   :added: 2.3.19
   :default: yes
   :values: @boolean

   Controls if "Received:" header should be added to mails by the submission backend.


.. dovecot_core:setting:: submission_client_workarounds
   :todo: Indicate submission setting
   :values: @string

   Configures the list of active workarounds for Submission client bugs. The
   list is space-separated.

   Supported workaround identifiers are:

   ``implicit-auth-external``

     Implicitly login using the EXTERNAL SASL mechanism upon the first MAIL
     command, provided that the client provides a valid TLS client
     certificate. This is helpful for clients that omit explicit SASL
     authentication when configured for authentication using a TLS certificate
     (Thunderbird for example).

     .. dovecotadded:: 2.3.18

   ``mailbox-for-path``

     Allow using bare Mailbox syntax (i.e., without <...>) instead of full
     path syntax.

   ``whitespace-before-path``

     Allow one or more spaces or tabs between 'MAIL FROM:' and path and
     between 'RCPT TO:' and path.


.. dovecot_core:setting:: submission_host
   :todo: Indicate submission setting
   :values: @string

   Use this SMTP submission host to send messages.

   Overrides :dovecot_core:ref:`sendmail_path` value, if set.


.. dovecot_core:setting:: submission_logout_format
   :default: in=%i out=%o
   :todo: Indicate submission setting
   :values: @string_novars

   The SMTP Submission logout format string.

   Variables supported:

   ========================== =======================================
   Variable Name              Description
   ========================== =======================================
   :ref:`variables-mail_user`
   ``%{input}``, ``%i``       Bytes read from client
   ``%{output}``, ``%o``      Bytes sent to client
   ``%{command_count}``       Number of commands received from client
   ``%{reply_count}``         Number of replies sent to client
   ``%{transaction_id}``      ID of the current transaction, if any
   ========================== =======================================


.. dovecot_core:setting:: submission_max_mail_size
   :default: 40M
   :todo: Indicate submission setting
   :values: @size

   The maximum message size accepted for relay.

   This value is announced in the SMTP SIZE capability.

   If empty, this value is either determined from the relay server or left
   unlimited if no limit is known; the relay MTA will reply with error if some
   unknown limit exists there, which will be passed back to the client.


.. dovecot_core:setting:: submission_max_recipients
   :default: 0
   :todo: Indicate submission setting
   :values: @uint

   Maximum number of recipients accepted per connection.


.. dovecot_core:setting:: submission_relay_command_timeout
   :default: 5mins
   :todo: Indicate submission setting
   :values: @time_msecs

   Timeout for SMTP commands issued to the submission service's relay server.

   The timeout is reset every time more data is being sent or received.


.. dovecot_core:setting:: submission_relay_connect_timeout
   :default: 30secs
   :todo: Indicate submission setting
   :values: @time_msecs

   Timeout for connecting to and logging into the submission service's relay
   server.


.. dovecot_core:setting:: submission_relay_host
   :todo: Indicate submission setting
   :values: @string

   Host of the relay server (required to provide the submission service).


.. dovecot_core:setting:: submission_relay_master_user
   :todo: Indicate submission setting
   :values: @string

   Master user name for authentication to the relay MTA if authentication is
   required.


.. dovecot_core:setting:: submission_relay_max_idle_time
   :default: 29mins
   :todo: Indicate submission setting
   :values: @time

   Submission relay max idle time for connection to relay MTA.


.. dovecot_core:setting:: submission_relay_password
   :todo: Indicate submission setting
   :values: @string

   Password for authentication to the relay MTA if authentication is required.


.. dovecot_core:setting:: submission_relay_port
   :default: 25
   :todo: Indicate submission setting
   :values: !<1-65535>

   Port for the submission relay server.


.. dovecot_core:setting:: submission_relay_rawlog_dir
   :seealso: @debugging_rawlog
   :todo: Indicate submission setting
   :values: @string

   Write protocol logs for relay connection to this directory for debugging.

   :ref:`Mail user variables <variables-mail_user>` can be used.


.. dovecot_core:setting:: submission_relay_ssl
   :default: no
   :todo: Indicate submission setting
   :values: no, smtps, starttls

   If enabled, SSL/TLS is used for the connection to the relay server.

   Available values:

   ``no``

      No SSL connection is used.

   ``smtps``

      An SMTPS connection (immediate SSL) is used.

   ``starttls``

      The STARTTLS command is used to establish the TLS layer.


.. dovecot_core:setting:: submission_relay_ssl_verify
   :default: yes
   :todo: Indicate submission setting
   :values: @boolean

   If enabled, TLS certificate of the relay server must be verified.


.. dovecot_core:setting:: submission_relay_trusted
   :default: no
   :todo: Indicate submission setting
   :values: @boolean

   If enabled, the relay server is trusted.

   Determines whether we try to send (Postfix-specific) XCLIENT data to the
   relay server (only if enabled).


.. dovecot_core:setting:: submission_relay_user
   :todo: Indicate submission setting
   :values: @string

   User name for authentication to the relay MTA if authentication is
   required.


.. dovecot_core:setting:: submission_ssl
   :default: no
   :todo: Indicate submission setting
   :values: @boolean

   If enabled, use SSL/TLS to connect to :dovecot_core:ref:`submission_host`.


.. dovecot_core:setting:: submission_timeout
   :default: 30secs
   :seealso: @submission_host;dovecot_core
   :todo: Indicate submission setting
   :values: @time

   Timeout for submitting outgoing messages.


.. dovecot_core:setting:: syslog_facility
   :default: mail
   :values: @string

   The syslog facility used if you're logging to syslog.


.. dovecot_core:setting:: valid_chroot_dirs
   :values: @string

   A colon-separated list of directories under which chrooting is allowed for
   mail processes.

   Addresses the risk of root exploits enabled by incorrect use of chrooting.

   Interpretation is recursive, so including ``/var/mail`` allows chrooting
   to subdirectories such as ``/var/mail/foo/bar``.


.. dovecot_core:setting:: verbose_proctitle
   :default: no
   :values: @boolean

   If enabled, the ``ps`` command shows more verbose process details,
   including the username and IP address of the connected client.

   This aids in seeing who is actually using the server, as well as helps
   debugging in case there are any problems. See :ref:`process_titles`.


.. dovecot_core:setting:: verbose_ssl
   :default: no
   :values: @boolean
   :removed: 2.4.0,3.0.0

   If enabled, protocol-level SSL errors are logged. Same as
   ``log_debug = category=ssl``.


.. dovecot_core:setting:: version_ignore
   :default: no
   :values: @boolean

   If enabled, ignore version mismatches between different Dovecot versions.
