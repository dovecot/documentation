.. _authentication-authentication:

==============
Authentication
==============

Authentication is split into four parts:

1. :ref:`Authentication mechanisms <authentication-authentication_mechanisms>`

2. :ref:`Password schemes <authentication-password_schemes>`

3. :ref:`Password databases (passdb) <authentication-password_databases>`

 * :ref:`authentication-password_database_extra_fields`

4. :ref:`User databases (userdb) <authentication-user_database>`

 * :ref:`authentication-user_database_extra_fields`

See also :ref:`authentication penalty <authentication-authentication_penalty>`
handling for IP addresses. See also :ref:`authentication policy support <authentication-auth_policy>`
for making policy based decisions.

.. _authentication-cleartext_mechanisms:

Cleartext mechanisms
--------------------

A cleartext mechanism is an authentication mechanism that contains users' passwords or
credentials in non-encrypted and non-hashed format. For example, PLAIN, LOGIN or XOAUTH2 mechanisms
contain credentials which an attacker can use to authenticate if they are captured.

To protect against this, connection encryption with TLS (or some other mechanism) is required
by default. See :dovecot_core:ref:`auth_allow_cleartext` for removing this requirement.

Authentication mechanisms vs. password schemes
----------------------------------------------

Authentication mechanisms and password schemes are often confused,
because they have somewhat similar values. For example there is a PLAIN
auth mechanism and PLAIN password scheme. But they mean completely
different things.

-  **Authentication mechanism is a client/server protocol**. It's about
   how the client and server talk to each others in order to perform the
   authentication. Most people use only PLAIN authentication, which
   basically means that the user and password are sent without any kind
   of encryption to the server. SSL/TLS can then be used to provide the
   encryption to make PLAIN authentication secure.

-  **Password scheme is about how the password is hashed in your
   password database**. If you use a PLAIN scheme, your passwords are
   stored in cleartext without any hashing in the password database. A
   popular password scheme MD5-CRYPT (also commonly used in
   ``/etc/shadow``) where passwords looks like
   ``$1$oDMXOrCA$plmv4yuMdGhL9xekM.q.I/``.

-  Cleartext authentication mechanisms work with ALL password schemes.

-  Non-cleartext authentication mechanisms require either PLAIN password
   scheme or a mechanism-specific password scheme.


Authentication in Proxies
-------------------------

.. Note::

  Proxy already verifies the authentication (in the reference
  Dovecot architecture; password has been switched to a master password at this
  point), so we don't really need to do it again. We could, in fact, even avoid
  the password checking entirely, but for extra security it's still done in
  this document.

.. parsed-literal::

  :dovecot_core:ref:`auth_mechanisms` = plain login

Enables the ``PLAIN`` and ``LOGIN`` authentication mechanisms. The LOGIN
mechanism is obsolete, but still used by old Outlooks and some Microsoft
phones.

.. code-block:: none

  service anvil {
    unix_listener anvil-auth-penalty {
      mode = 0
    }
  }

Disable authentication penalty. The proxy already handled this.

.. parsed-literal::

  :dovecot_core:ref:`auth_cache_size` = 100M

Specifies the amount of memory used for authentication caching (passdb and
userdb lookups).

.. parsed-literal::

  :dovecot_core:ref:`login_trusted_networks` = 10.0.0.0/24

Space-separated list of IP/network ranges that contain the Dovecot Proxies.
This setting allows Proxies to forward the client's original IP address and
session ID to the Backends.

.. parsed-literal::

  :dovecot_core:ref:`mail_max_userip_connections` = 10

Maximum number of simultaneous ``IMAP4`` or ``POP3`` connections allowed for
the same user from the same IP address (10 = 10 IMAP + 10 POP3)

.. parsed-literal::

  :dovecot_core:ref:`ssl` = no
  :dovecot_core:ref:`auth_allow_cleartext` = yes

``Proxy`` already decrypted the SSL connections. The Backends
will always see only unencrypted connections (unless internal connections
are also configured to use SSL).


.. toctree::
   :maxdepth: 1
   :glob:

   *

