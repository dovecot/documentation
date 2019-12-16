.. _authentication-ldap_authentication:

=========================
LDAP Authentication
=========================

See http://wiki.dovecot.org/AuthDatabase/LDAP for more details.

.. code-block:: none

  passdb {
    args = /etc/dovecot/dovecot-ldap.conf.ext
    driver = ldap
  }
  userdb {
    driver = prefetch
  }
  userdb {
    args = /etc/dovecot/dovecot-ldap.conf.ext
    driver = ldap
  }

These enable ``LDAP``to be used as ``passdb`` and ``userdb``. The userdb
prefetch allows ``IMAP`` or ``POP3`` logins to do only a single LDAP lookup by
returning the userdb information already in the passdb lookup.
http://wiki.dovecot.org/UserDatabase/Prefetch has more details on the prefetch
userdb.
