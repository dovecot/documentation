.. _authentication-proxies:

========================
Proxy PasswordDatabase
========================

Dovecot supports proxying IMAP, POP3, :ref:`submission_server`, :ref:`lmtp_server`, and :ref:`pigeonhole_managesieve_server` connections to other hosts.
The proxying can be done for all users, or only for some specific users. There
are two ways to do the authentication:

1. Forward the password to the remote server. The proxy may or may not perform
   authentication itself. This requires that the client uses only plaintext
   authentication, or alternatively the proxy has access to users' passwords in
   plaintext.

2. Let Dovecot proxy perform the authentication and login to remote server
   using the proxy's :ref:`authentication-master_users`. This allows client
   to use also non-plaintext authentication.

The proxy is configured pretty much the same way as :ref:`authentication-host`, with the
addition of proxy field. The common fields to use for both proxying ways are:

* ``proxy`` and ``proxy_maybe``: Enables the proxying. Either one of these
  fields is required.

 * ``proxy_maybe`` can be used to implement ``automatic proxying``. If the
   proxy destination matches the current connection, the user gets logged in
   normally instead of being proxied. If the same happens with ``proxy``, the
   login fails with ``Proxying loops`` error.
 * ``proxy_maybe`` with LMTP require.
 * ``proxy_maybe`` with ``host=<dns name>`` requires.
 * ``auth_proxy_self`` setting in ``dovecot.conf`` can be used to specify extra
   IPs that are also considered to be the proxy's own IPs.

* ``proxy_always`` can be used with ``proxy_maybe`` to conditionally do
  proxying to specified remote host (host isn't self) or to let director assign
  a backend host (host is self). So basically this setting just always sends
  the ``proxy`` extra field to login process, but not necessarily the host.
  Useful when dividing users across multiple director clusters.

* ``host=s``: The destination server's IP address. This field is required.
* ``source_ip=s``: The source IP address to use for outgoing connections.

  .. versionadded:: v2.2.14

* ``port=s``: The destination server's port. The default is 143 with IMAP and
  110 with POP3.
* ``protocol=s``: The protocol to use for the connection to the destination
  server. This field is currently only relevant for LMTP: it can be used to
  select either ``lmtp`` or ``smtp``.
* ``destuser=s``: Tell client to use a different username when logging in.
* ``proxy_mech=s``: Tell client to use this SASL authentication mechanism when
  logging in.
* ``proxy_timeout=`` <:ref:`time_msecs`>: Abort connection after this much time has passed.
  This overrides the default :ref:`setting-login_proxy_timeout`.

  .. versionchanged:: v2.3 Added support for milliseconds.

* ``proxy_nopipelining``: Don't pipeline IMAP commands. This is a workaround
  for broken IMAP servers that hang otherwise.

  .. versionadded:: v2.2.11

* ``proxy_not_trusted``: ``IMAP/POP3`` proxying never sends the ``ID/XCLIENT``
  command to remote.

  .. versionadded:: v2.2.27


You can use SSL/TLS connection to destination server by returning:

* ``ssl=yes``: Use SSL and require a valid verified remote certificate. 

.. WARNING:: Unless used carefully, this is an insecure setting! Before
             v2.0.16/v2.1.beta1 the host name isn't checked in any way against
             the certificate's CN. The only way to use this securely is to only
             use and allow your own private CA's certs, anything else is
             exploitable by a man-in-the-middle attack.

.. Note:: ssl_client_ca_dir or ssl_client_ca_file aren't currently used for
          verifying the remote certificate, although ideally they will be in a
          future Dovecot version. For now you need to add the trusted remote
          certificates to ssl_ca.

.. Note:: LMTP proxying supports SSL/TLS only since v2.3.1 - for older versions
          any ssl/starttls extra field is ignored.

.. Note:: doveadm proxying doesn't support SSL/TLS currently - any ssl/starttls
          extra field is ignored.

* ``ssl=any-cert``: Use SSL, but don't require a valid remote certificate.
* ``starttls=yes``: Use STARTTLS command instead of doing SSL handshake
  immediately after connected.
* ``starttls=any-cert``: Combine starttls and ``ssl=any-cert``.

Additionally you can also tell Dovecot to send SSL client certificate to the
remote server using :ref:`setting-ssl_client_cert` and :ref:`setting-ssl_client_key` settings in
dovecot.conf.

Set :ref:`setting-login_trusted_networks` to point to the proxies in the backends. This
way you'll get the clients' actual IP addresses logged instead of the proxy's.

The destination servers don't need to be running Dovecot, but you should make
sure that the Dovecot proxy doesn't advertise more capabilities than the
destination server can handle. For IMAP you can do this by changing
:ref:`setting-imap_capability` setting. For POP3 you'll have to modify Dovecot's sources
for now ``(src/pop3/capability.h)``. Dovecot also automatically sends updated
untagged CAPABILITY reply if it detects that the remote server has different
capabilities than what it already advertised to the client, but some clients
simply ignore the updated CAPABILITY reply.

Source IPs
==========

.. versionadded:: v2.2.14

If your proxy handles a lot of connections ``(~64k)`` to the same destination
IP you may run out of TCP ports. The only way to work around this is to use
either multiple destination IPs or ports, or multiple source IPs. Multiple
source IPs can be easily used by adding them to the :ref:`setting-login_source_ips`
setting in ``dovecot.conf``. You can also use hostnames which expand to
multiple IPs. By prefixing the setting with ``?`` (e.g. ``login_source_ips =
?proxy-sources.example.com``) Dovecot will use only those IPs that actually
exist in the server, allowing you to share the same config file with multiple
servers. It's probably better not to include the server's default outgoing IP
address in the setting, as explained here
`<https://idea.popcount.org/2014-04-03-bind-before-connect/>`_.

Disconnection delay
===================

.. versionadded:: v2.2.19

To avoid reconnection load spikes when a backend server dies, you can tell
proxy to spread the client disconnections over a longer time period (after the
server side of the connection is already disconnected).
:ref:`setting-login_proxy_max_disconnect_delay` setting in ``dovecot.conf`` controls this
(disabled by default).

Forwarding fields
=================

.. versionadded:: v2.2.29

You can forward arbitratry variables by returning them prefixed with
``forward_``. Dovecot will use protocol dependant way to forward these
variables forward and they will appear on the other side as
``forward_variable`` Currently ``IMAP/POP3`` only feature. This feature
requires that the sending host is in :ref:`setting-login_trusted_networks`. For IMAP the
feature works by providing the variables as part of ID command, such as ``i ID
( ... x-forward-var value)``.

For POP3 the forwarding mecahism uses ``XCLIENT`` with ``FORWARD=<base64
encoded blob of forwarded variables>``

See :ref:`forwarding_parameters` for more details on
forwarding.

Moving users between backends/clusters
======================================

.. versionadded:: v2.2.25

A safe way to move users from one cluster to another is to do it like:

* Set ``delay_until=<timestamp>`` :ref:`authentication-password_database_extra_fields` where
  ``<timestamp>`` is the current timestamp plus some seconds into future (e.g.
  31s). You may also want to append e.g. +5 for some load balancing if a lot of
  users are moved at once.
* Set ``host=<new host>`` :ref:`authentication-password_database_extra_fields`. This update
  should be atomic together with the ``delay_until`` field.
* Use ``doveadm proxy kick`` or ``doveadm director kick`` to kick the user's
  existing connections.

   * The processes may still continue running in the backend for a longer time.
     If you want to be absolutely sure, you could also run a script to ``kill
     -9`` all processes for the user in the backend. This of course has its own
     problems.

The idea here is that while the user's connections are being kicked and the
backend processes are finishing up and shutting down, new connections are being
delayed in the proxy. This delay should be long enough that the user's existing
processes are expected to die, but not so large that clients get connection
timeouts. A bit over 30 seconds is likely a good value. Once the
``delay_until`` timestamp is reached, the connections continue to the new host.

If you have a lot of users, it helps to group some of them together and do the
``host/delay_until`` updates on a per-group basis rather than per-user basis.

ID command forwarding
=====================

.. versionadded:: v2.2.29

If you want to forward, for some reason, the IMAP ID command provided by the
client, set

.. code-block:: none

  imap_id_retain=yes

This will also enable ``client_id`` variable in variable expansions for auth
requests, which will contain the ID command as IMAP arglist. See :ref:`setting-imap_id_retain`.

Password forwarding
===================

If you don't want proxy itself to do authentication, you can configure it to
succeed with any given password. You can do this by returning an empty password
and ``nopassword`` field.

Master password
===============

This way of forwarding requires the destination server to support master user
feature. The users will be normally authenticated in the proxy and the common
proxy fields are returned, but you'll need to return two fields specially:

* ``master=s``: This contains the master username (e.g. proxy). It's used as
  SASL auhentication ID.

   * Alternatively you could return ``destuser=user*master`` and set
     ``auth_master_user_separator = *``.

* ``pass=s``: This field contains the master user's password.

See :ref:`authentication-master_users` for more information
how to configure this.

OAuth2 forwarding
=================

If you want to forward :ref:`authentication-oauth2` tokens, return field
``proxy_mech=%m`` as extra field.

Example password forwarding static DB configuration
===================================================

See :ref:`authentication-static_password_database`.

Example password forwarding SQL configuration
=============================================

Create the SQL table:

.. code-block:: none

  CREATE TABLE proxy (
    user varchar(255) NOT NULL,
    host varchar(16) default NULL,
    destuser varchar(255) NOT NULL default '',
    PRIMARY KEY  (user)
  );

Insert data to SQL corresponding your users.

Working data could look like this:

====== ============= ==================
user    host          destuser
john    192.168.0.1
joe     192.168.0.2   joe@example.com
====== ============= ==================

The important parts of ``dovecot.conf``:

.. code-block:: none

  # If you want to trade a bit of security for higher performance, change these settings:
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

The important parts of ``dovecot-sql.conf.ext``:

.. code-block:: none

  driver = mysql
  connect = host=sqlhost1 host=sqlhost2 dbname=mail user=dovecot password=secret
  password_query = SELECT NULL AS password, 'Y' as nopassword, host, destuser, 'Y' AS proxy FROM proxy WHERE user = '%u'

Example proxy_maybe SQL configuration
=====================================

Create the SQL table:

.. code-block:: none

  CREATE TABLE users (
    user varchar(255) NOT NULL,
    domain varchar(255) NOT NULL,
    password varchar(100) NOT NULL,
    host varchar(16) NOT NULL,
    home varchar(100) NOT NULL,
    PRIMARY KEY (user)
  );

The important parts of ``dovecot.conf``:

.. code-block:: none

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

The important parts of ``dovecot-sql.conf.ext``:

.. code-block:: none

  driver = mysql

  password_query = \
    SELECT concat(user, '@', domain) AS user, password, host, 'Y' AS proxy_maybe \
    FROM users WHERE user = '%n' AND domain = '%d'

  user_query = SELECT user AS username, domain, home \
    FROM users WHERE user = '%n' AND domain = '%d'

Example proxy LDAP configuration
================================

see: :ref:`authentication-password_database_extra_fields` for more information, and a worked
out example

.. toctree::
  :maxdepth: 1

  password_database_extra_fields
  static_password_database
