.. _authentication-authentication:

===============
Authentication
===============

See http://wiki.dovecot.org/Authentication for more details.

.. Note::

  that Proxy or Director already verifies the authentication (in the reference
  Dovecot architecture; password has been switched to a master password at this
  point), so we don't really need to do it again. We could, in fact, even avoid
  the password checking entirely, but for extra security it's still done in
  this document.

.. code-block:: none

  auth_mechanisms = plain login

Enables the ``PLAIN`` and ``LOGIN`` authentication mechanisms. The LOGIN
mechanism is obsolete, but still used by old Outlooks and some Microsoft
phones.

.. code-block:: none

  service anvil {
    unix_listener anvil-auth-penalty {
      mode = 0
    }
  }

Disable authentication penalty. ``Proxy`` or ``Director`` already handled this.

.. code-block:: none

  auth_cache_size = 100M

Specifies the amount of memory used for authentication caching (passdb and
userdb lookups).

.. code-block:: none

  login_trusted_networks = 10.0.0.0/24

Space-separated list of IP/network ranges that contain the Dovecot Directors.
This setting allows Directors to forward the client's original IP address and
session ID to the Backends.

.. code-block:: none

  mail_max_userip_connections = 10

Maximum number of simultaneous ``IMAP4`` or ``POP3`` connections allowed for
the same user from the same IP address (10 = 10 IMAP + 10 POP3) 

.. code-block:: none

  ssl = no
  disable_plaintext_auth = no

``Proxy``or ``Director`` already decrypted the SSL connections. The Backends
will always see only plaintext connections.

.. toctree::
  :maxdepth: 1

  ldap_authentication

  ldap_backend_configuration
