.. _config_variables:

======================
Config Variables
======================

You can use special variables in several places:

* mail_location setting and namespace locations
* static :ref:`authentication-user_database` and :ref:`passwd-file userdb <authentication-passwd_file>` template strings
* :ref:`authentication-ldap` and :ref:`authentication-sql` :ref:`authentication-user_database` query strings
* log prefix for imap/pop3 process
* Plugin settings

.. _variables-global:

Global variables
----------------

Global variables that work everywhere are:

+------------+-----------------------------------------------------------------------------+
| Long name  |  Description                                                                |
+============+=============================================================================+
| %%         | '%' character. See :ref:`user_shared_mailboxes`                             |
|            | for further information about %% variables                                  |
+------------+-----------------------------------------------------------------------------+
| env:<name> | Environment variable <name>                                                 |
+------------+-----------------------------------------------------------------------------+
| uid        | Effective UID of the current process NOTE: This is overridden for           |
|            | :ref:`mail service user variables <variables-mail_service_user>`.           |
+------------+-----------------------------------------------------------------------------+
| gid        | Effective GID of the current process NOTE: This is overridden for           |
|            | :ref:`mail service user variables <variables-mail_service_user>`.           |
+------------+-----------------------------------------------------------------------------+
| pid        | PID of the current process (e.g. login or imap/pop3 process).               |
+------------+-----------------------------------------------------------------------------+
| hostname   | Hostname (without domain). Can be overridden with DOVECOT_HOSTNAME          |
|            | environment variable. NOTE: This is overridden for                          |
|            | :ref:`mail user variables <variables-mail_user>`.                           |
+------------+-----------------------------------------------------------------------------+

If :ref:`var_expand_crypt_plugin` is loaded, these also work globally:

+-------------------------------+-----------------------------+
| Long name                     | Description                 |
+===============================+=============================+
| encrypt; <parameters>:<field> | Encrypt field (v2.2.29+)    |
|                               |                             |
|                               | .. versionadded:: v2.2.29   |
+-------------------------------+-----------------------------+
| decrypt; <parameters>:<field> | Decrypt field               |
|                               |                             |
|                               | .. versionadded:: v2.2.29   |
+-------------------------------+-----------------------------+

.. _variables-mail_service_user:

Mail service user variables
---------------------------

+----------+----------------+---------------------------------------------------------------+
| Variable | Long name      | Description                                                   |
+==========+================+===============================================================+
| See also :ref:`variables-global`                                                          |
+----------+----------------+---------------------------------------------------------------+
| %u       | user           | full username (e.g. user@domain)                              |
+----------+----------------+---------------------------------------------------------------+
| %n       | username       | user part in user@domain, same as %u if there's no domain     |
+----------+----------------+---------------------------------------------------------------+
| %d       | domain         | domain part in user@domain, empty if user with no domain      |
+----------+----------------+---------------------------------------------------------------+
| %s       | service        | imap, pop3, smtp, lda (and doveadm, dsync, etc.)              |
+----------+----------------+---------------------------------------------------------------+
| %p       | pid            | PID of the current process                                    |
+----------+----------------+---------------------------------------------------------------+
| %l       | local_ip       | local IP address                                              |
|          |                |                                                               |
|          |                | .. versionchanged:: v2.3.14 variable long name changed        |
+----------+----------------+---------------------------------------------------------------+
| %r       | remote_ip      | remote IP address                                             |
|          |                |                                                               |
|          |                | .. versionchanged:: v2.3.14 variable long name changed        |
+----------+----------------+---------------------------------------------------------------+
| %i       | uid            | UNIX user identifier of the user                              |
+----------+----------------+---------------------------------------------------------------+
|          | gid            | UNIX group identifier of the user                             |
+----------+----------------+---------------------------------------------------------------+
|          | session        | session ID for this client connection (unique for 9 years)    |
+----------+----------------+---------------------------------------------------------------+
|          | auth_user      | SASL authentication ID (e.g. if master user login is done,    |
|          |                | this contains the master username). If username changes during|
|          |                | authentication, this value contains the original username.    |
|          |                | Otherwise the same as %{user}.                                |
|          |                |                                                               |
|          |                | .. versionadded:: v2.2.11                                     |
+----------+----------------+---------------------------------------------------------------+
|          | auth_username  | user part in %{auth_user}                                     |
|          |                |                                                               |
|          |                | .. versionadded:: v2.2.11                                     |
+----------+----------------+---------------------------------------------------------------+
|          | auth_domain    | domain part in %{auth_user}                                   |
|          |                |                                                               |
|          |                | .. versionadded:: v2.2.11                                     |
+----------+----------------+---------------------------------------------------------------+
|          | userdb:<name>  | Return userdb extra field "name". %{userdb:name:default}      |
|          |                | returns "default" if "name" doesn't exist (not returned if    |
|          |                | name exists but is empty)                                     |
|          |                |                                                               |
|          |                | .. versionadded:: v2.2.19                                     |
+----------+----------------+---------------------------------------------------------------+
|          | lip            | Deprecated version of %{local_ip}                             |
|          |                |                                                               |
|          |                | .. deprecated:: v2.3.14                                       |
+----------+----------------+---------------------------------------------------------------+
|          | rip            | Deprecated version of %{remote_ip}                            |
|          |                |                                                               |
|          |                | .. deprecated:: v2.3.14                                       |
+----------+----------------+---------------------------------------------------------------+

.. _variables-mail_user:

Mail user variables
-------------------

+----------+-----------+--------------------------------------------------------------------+
| Variable | Long name | Description                                                        |
+==========+===========+====================================================================+
| See also :ref:`variables-global` and :ref:`variables-mail_service_user`                   |
+----------+-----------+--------------------------------------------------------------------+
| %h       | home      | home directory. Use of ~/ is better whenever possible.             |
+----------+-----------+--------------------------------------------------------------------+
|          | hostname  | Expands to the hostname setting. Overrides the global %{hostname}. |
+----------+-----------+--------------------------------------------------------------------+

.. _variables-login:

Login variables
---------------

+----------+-----------------------+---------------------------------------------------------------+
| Variable | Long name             | Description                                                   |
+==========+=======================+===============================================================+
| See also :ref:`variables-global`                                                                 |
+----------+-----------------------+---------------------------------------------------------------+
| %u       | user                  | full username (e.g. user@domain)                              |
+----------+-----------------------+---------------------------------------------------------------+
| %n       | username              | user part in user@domain, same as %u if there's no domain     |
+----------+-----------------------+---------------------------------------------------------------+
| %d       | domain                | domain part in user@domain, empty if user with no domain      |
+----------+-----------------------+---------------------------------------------------------------+
| %s       | service               | imap, pop3, smtp, lda (and doveadm, dsync, etc.)              |
+----------+-----------------------+---------------------------------------------------------------+
|          | local_name            | TLS SNI hostname, if given                                    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.26                                     |
+----------+-----------------------+---------------------------------------------------------------+
| %l       | local_ip              | local IP address                                              |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{lip}       |
+----------+-----------------------+---------------------------------------------------------------+
| %r       | remote_ip             | remote IP address                                             |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{rip}       |
+----------+-----------------------+---------------------------------------------------------------+
| %a       | local_port            | local port                                                    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{lport}     |
+----------+-----------------------+---------------------------------------------------------------+
| %b       | remote_port           | remote port                                                   |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{rport}     |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_remote_ip        | Same as %{remote_ip}, except in proxy setups contains the     |
|          |                       | remote proxy's IP instead of the client's IP                  |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{real_rip}  |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_local_ip         | Same as %{local_ip}, except in proxy setups contains the local|
|          |                       | proxy's IP instead of the remote proxy's IP                   |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{real_lip}  |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_remote_port      | Similar to %{real_rip} except for port instead of IP          |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{real_rport}|
+----------+-----------------------+---------------------------------------------------------------+
|          | real_local_port       | Similar to %{real_lip} except for port instead of IP          |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14 For older versions use %{real_lport}|
+----------+-----------------------+---------------------------------------------------------------+
|          | rip                   | Deprecated version of %{remote_ip}                            |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | lip                   | Deprecated version of %{local_ip}                             |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | rport                 | Deprecated version of %{remote_port}                          |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | lport                 | Deprecated version of %{local_port}                           |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_rip              | Deprecated version of %{real_remote_ip}                       |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_lip              | Deprecated version of %{real_local_ip}                        |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.0                                      |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_rport            | Deprecated version of %{real_remote_port}                     |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.0                                      |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_lport            | Deprecated version of %{real_local_port}                      |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.0                                      |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
| %p       | pid                   | process ID of the authentication client                       |
+----------+-----------------------+---------------------------------------------------------------+
| %m       | mechanism             | :ref:`authentication-authentication_mechanisms` e.g. PLAIN    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | mech                  | Deprecated version of %{mechanism}                            |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
| %c       | secured               | "TLS" with established SSL/TLS connections, "TLS handshaking",|
|          |                       | or "TLS [handshaking]: error text" if disconnecting due to TLS|
|          |                       | error. "secured" with localhost connections. Otherwise empty. |
+----------+-----------------------+---------------------------------------------------------------+
| %k       | ssl_security          | TLS session security string. If HAProxy is configured and it  |
|          |                       | terminated the TLS connection, contains "(proxied)".          |
+----------+-----------------------+---------------------------------------------------------------+
| %e       | mail_pid              | PID for process that handles the mail session post-login      |
+----------+-----------------------+---------------------------------------------------------------+
|          | session               | Session ID for this client connection (unique for 9 years)    |
+----------+-----------------------+---------------------------------------------------------------+
|          | auth_user             | SASL authentication ID (e.g. if master user login is done,    |
|          |                       | this contains the master username). If username changes during|
|          |                       | authentication, this value contains the original username.    |
|          |                       | Otherwise the same as %{user}.                                |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.11                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | auth_username         | user part in %{auth_user}                                     |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.11                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | auth_domain           | domain part in %{auth_user}                                   |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.11                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | original_user         | Same as %{user}, except using the original username the client|
|          |                       | sent before any changes by auth process                       |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | original_username     | Same as %{username}, except using the original username       |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | original_domain       | Same as %{domain}, except using the original username         |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.14                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | orig_user             | Deprecated version of %{original_user}                        |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | orig_username         | Deprecated version of %{original_username}                    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | orig_username         | Deprecated version of %{original_domain}                      |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
|          |                       | .. deprecated:: v2.3.14                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | listener              | Socket listener name as specified in config file, which       |
|          |                       | accepted the client connection.                               |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.19                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | passdb:<name>         | Return passdb extra field "name". %{passdb:name:default}      |
|          |                       | returns "default" if "name" doesn't exist (not returned if    |
|          |                       | name exists but is empty). Note that this doesn't work in     |
|          |                       | passdb/userdb ldap's pass_attrs or user_attrs.                |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.19                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | passdb:forward_<name> | Used by proxies to pass on extra fields to the next hop, see  |
|          |                       | :ref:`authentication-proxies`                                 |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.29                                     |
+----------+-----------------------+---------------------------------------------------------------+

.. _variables-auth:

Authentication variables
------------------------

+----------+-----------------------+---------------------------------------------------------------+
| Variable | Long name             | Description                                                   |
+==========+=======================+===============================================================+
| See also :ref:`variables-global`                                                                 |
+----------+-----------------------+---------------------------------------------------------------+
| %u       | user                  | full username (e.g. user@domain)                              |
+----------+-----------------------+---------------------------------------------------------------+
| %n       | username              | user part in user@domain, same as %u if there's no domain     |
+----------+-----------------------+---------------------------------------------------------------+
| %d       | domain                | domain part in user@domain, empty if user with no domain      |
+----------+-----------------------+---------------------------------------------------------------+
|          | domain_first          | For "username@domain_first@domain_last" style usernames       |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
+----------+-----------------------+---------------------------------------------------------------+
|          | domain_last           | For "username@domain_first@domain_last" style usernames       |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
+----------+-----------------------+---------------------------------------------------------------+
| %s       | service               | imap, pop3, smtp, lda (and doveadm, dsync, etc.)              |
+----------+-----------------------+---------------------------------------------------------------+
|          | local_name            | TLS SNI hostname, if given                                    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.26                                     |
+----------+-----------------------+---------------------------------------------------------------+
| %l       | local_ip              | local IP address                                              |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{lip}       |
+----------+-----------------------+---------------------------------------------------------------+
| %r       | remote_ip             | remote IP address                                             |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{rip}       |
+----------+-----------------------+---------------------------------------------------------------+
| %a       | local_port            | local port                                                    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{lport}     |
+----------+-----------------------+---------------------------------------------------------------+
| %b       | remote_port           | remote port                                                   |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{rport}     |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_remote_ip        | Same as %{remote_ip}, except in proxy setups contains the     |
|          |                       | remote proxy's IP instead of the client's IP                  |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{real_rip}  |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_local_ip         | Same as %{local_ip}, except in proxy setups contains the local|
|          |                       | proxy's IP instead of the remote proxy's IP                   |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{real_lip}  |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_remote_port      | Similar to %{real_rip} except for port instead of IP          |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{real_rport}|
+----------+-----------------------+---------------------------------------------------------------+
|          | real_local_port       | Similar to %{real_lip} except for port instead of IP          |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13 For older versions use %{real_lport}|
+----------+-----------------------+---------------------------------------------------------------+
|          | rip                   | Deprecated version of %{remote_ip}                            |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | lip                   | Deprecated version of %{local_ip}                             |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | rport                 | Deprecated version of %{remote_port}                          |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | lport                 | Deprecated version of %{local_port}                           |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_rip              | Deprecated version of %{real_remote_ip}                       |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_lip              | Deprecated version of %{real_local_ip}                        |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.0                                      |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_rport            | Deprecated version of %{real_remote_port}                     |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.0                                      |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | real_lport            | Deprecated version of %{real_local_port}                      |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.0                                      |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
| %p       | pid                   | process ID of the authentication client                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | session_pid           | For user logins: The PID of the IMAP/POP3 process handling the|
|          |                       | session.                                                      |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.7                                      |
+----------+-----------------------+---------------------------------------------------------------+
| %m       | mechanism             | :ref:`authentication-authentication_mechanisms` e.g. PLAIN    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | mech                  | Deprecated version of %{mechanism}                            |
|          |                       |                                                               |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
| %w       | password              | plaintext password from plaintext authentication mechanism    |
+----------+-----------------------+---------------------------------------------------------------+
| %c       | secured               | "TLS" with established SSL/TLS connections, "TLS handshaking",|
|          |                       | or "TLS [handshaking]: error text" if disconnecting due to TLS|
|          |                       | error. "secured" with localhost connections. Otherwise empty. |
+----------+-----------------------+---------------------------------------------------------------+
| %k       | cert                  | "valid" if client had sent a valid client certificate,        |
|          |                       | otherwise empty.                                              |
+----------+-----------------------+---------------------------------------------------------------+
|          | session               | session ID for this client connection (unique for 9 years)    |
+----------+-----------------------+---------------------------------------------------------------+
|          | auth_user             | SASL authentication ID (e.g. if master user login is done,    |
|          |                       | this contains the master username). If username changes during|
|          |                       | authentication, this value contains the original username.    |
|          |                       | Otherwise the same as %{user}.                                |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.11                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | auth_username         | user part in %{auth_user}                                     |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.11                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | auth_domain           | domain part in %{auth_user}                                   |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.11                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | login_user            | For master user logins: Logged in user@domain                 |
+----------+-----------------------+---------------------------------------------------------------+
|          | login_username        | For master user logins: Logged in user                        |
+----------+-----------------------+---------------------------------------------------------------+
|          | login_domain          | For master user logins: Logged in domain                      |
+----------+-----------------------+---------------------------------------------------------------+
|          | master_user           | For master user logins: The master username                   |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.7                                      |
+----------+-----------------------+---------------------------------------------------------------+
|          | original_user         | Same as %{user}, except using the original username the client|
|          |                       | sent before any changes by auth process                       |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | original_username     | Same as %{username}, except using the original username       |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | original_domain       | Same as %{domain}, except using the original username         |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.3.13                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | orig_user             | Deprecated version of %{original_user}                        |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
|          |                       | .. versionadded:: v2.2.13 Works in auth process.              |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | orig_username         | Deprecated version of %{original_username}                    |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
|          |                       | .. versionadded:: v2.2.13 Works in auth process.              |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | orig_username         | Deprecated version of %{original_domain}                      |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.6                                      |
|          |                       | .. versionadded:: v2.2.13 Works in auth process.              |
|          |                       | .. deprecated:: v2.3.13                                       |
+----------+-----------------------+---------------------------------------------------------------+
|          | passdb:<name>         | Return passdb extra field "name". %{passdb:name:default}      |
|          |                       | returns "default" if "name" doesn't exist (not returned if    |
|          |                       | name exists but is empty). Note that this doesn't work in     |
|          |                       | passdb/userdb ldap's pass_attrs or user_attrs.                |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.19                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | userdb:<name>         | Return userdb extra field "name". Note that this can also be  |
|          |                       | used in passdbs to access any userdb_* extra fields added by  |
|          |                       | previous passdb lookups. %{userdb:name:default} returns       |
|          |                       | "default" if "name" doesn't exist (not returned if name exists|
|          |                       | but is empty). Note that this doesn't work in passdb/userdb   |
|          |                       | ldap's pass_attrs or user_attrs.                              |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.19                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | client_id             | Expands to client ID request as IMAP arglist. Needs           |
|          |                       | imap_id_retain=yes                                            |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.29                                     |
+----------+-----------------------+---------------------------------------------------------------+
|          | passdb:forward_<name> | Used by proxies to pass on extra fields to the next hop, see  |
|          |                       | :ref:`authentication-proxies`                                 |
|          |                       |                                                               |
|          |                       | .. versionadded:: v2.2.29                                     |
+----------+-----------------------+---------------------------------------------------------------+
| %!       |                       | Internal ID number of the current passdb/userdb.              |
+----------+-----------------------+---------------------------------------------------------------+

Modifiers
---------

You can apply a modifiers for each variable (e.g. %Us or %U{service} = POP3):

* %L - lowercase
* %U - uppercase
* %E - escape '"', "'" and '\' characters by inserting '\' before them. Note
  that variables in SQL queries are automatically escaped, you don't need to
  use this modifier for them.
* %X - parse the variable as a base-10 number, and convert it to base-16
  (hexadecimal)
* %R - reverse the string
* %N - take a 32bit hash of the variable and return it as hex. You can also
  limit the hash value. For example %256Nu gives values 0..ff. You might want
  padding also, so %2.256Nu gives 00..ff. This can be useful for example in
  dividing users automatically to multiple partitions.

 * This is "New Hash", based on MD5 to give better distribution of values (no
   need for any string reversing kludges either).

   .. versionadded:: v2.2.3

* %H - Same as %N, but use "old hash" (not recommended anymore)

 * %H hash function is a bit bad if all the strings end with the same text, so
   if you're hashing usernames being in user@domain form, you probably want to
   reverse the username to get better hash value variety, e.g. `%3RHu`.

* %{<hash
  algorithm>;rounds=<n>,truncate=<bits>,salt=s,format=<hex|hexuc|base64|base64url>:field}

 * Generic hash function that outputs a hex (by default) or `base64` value.
   Hash algorithm is any of the supported ones, e.g. `md5`, `sha1`, `sha256`.
   Also "pkcs5" is supported using `SHA256`.

   Example:

   .. code-block:: none

     %{sha256:user} or %{md5;truncate=32:user}.

   .. versionadded:: v2.2.27

* %M - return the string's MD5 sum as hex.
* %D - return "sub.domain.org" as "sub,dc=domain,dc=org" (for LDAP queries)
* %T - Trim trailing whitespace

You can take a substring of the variable by giving optional offset followed by
'.' and width after the '%' character. For example %2u gives first two
characters of the username. %2.1u gives third character of the username.

If the offset is negative, it counts from the end, for example `%-2.2i` gives
the UID mod 100 (last two characters of the UID printed in a string). If a
positive offset points outside the value, empty string is returned, if a
negative offset does then the string is taken from the start.

If the width is prefixed with zero, the string isn't truncated, but only padded
with '0' character if the string is shorter.

.. Note::

  %04i may return "0001", "1000" and "12345". %1.04i for the same string would
  return "001", "000" and "2345".

If the width is negative, it counts from the end.

.. Note::

  `%0.-2u` gives all but the last two characters from the username.

   .. versionadded:: none v2.2.13

The modifiers are applied from left-to-right order, except the substring is
always taken from the final string.

Conditionals
------------

.. versionadded:: v2.2.33

It's possible to use conditionals in variable expansion. The generic syntax is

.. code-block:: none

  %{if;value1;operator;value2;value-if-true;value-if-false}

Each of the value fields can contain another variable expansion, facilitating
for nested ifs. Both `%f` and `%{field}` syntaxes work.

Escaping is supported, so it's possible to use values like `\%`, `\:` or `\;`
that expand to the literal `%`, `:` or `;` characters. Values can have spaces
and quotes without any special escaping.

Note that currently unescaped `:` cuts off the if statement and ignores
everything after it.

Following operators are supported

======== ============================================================
Operator Explanation
==       NUMERIC equality
!=       NUMERIC inequality
<        NUMERIC less than
<=       NUMERIC less or equal
>        NUMERIC greater than
>=       NUMERIC greater or equal
eq       String equality
ne       String inequality
lt       String inequality
le       String inequality
gt       String inequality
ge       String inequality
`*`      Wildcard match (mask on value2)
!*       Wildcard non-match (mask on value2)
~        Regular expression match (pattern on value2, extended POSIX)
!~       String inequality (pattern on value2, extended POSIX)
======== ============================================================

Examples:

.. code-block:: none

  # If %u is "testuser", return "INVALID". Otherwise return %u uppercased.
  %{if;%u;eq;testuser;INVALID;%Uu}

  # Same as above, but for use nested IF just for showing how they work:
  %{if;%{if;%u;eq;testuser;a;b};eq;a;INVALID;%Uu}
