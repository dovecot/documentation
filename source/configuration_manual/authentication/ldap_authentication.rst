.. _authentication-ldap_authentication:

=========================
LDAP Authentication
=========================

See :ref:`LDAP <authentication-ldap>` for more details.

.. code-block:: none

  passdb ldap {
    args = /etc/dovecot/dovecot-ldap.conf.ext
  }
  userdb prefetch {
  }
  userdb ldap {
    args = /etc/dovecot/dovecot-ldap.conf.ext
  }

These enable ``LDAP`` to be used as ``passdb`` and ``userdb``. The userdb
prefetch allows ``IMAP`` or ``POP3`` logins to do only a single LDAP lookup by
returning the userdb information already in the passdb lookup.
:ref:`authentication-prefetch_userdb` has more details on the prefetch
userdb.

See :ref:`common LDAP configuration <authentication-ldap_settings_common>` and
:ref:`auth LDAP configuration <authentication-ldap_settings_auth>` for
the setting parameters available in the ldap conf.ext
(i.e, /etc/dovecot/dovecot-ldap.conf.ext shown in the above example), 
