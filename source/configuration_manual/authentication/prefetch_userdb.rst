.. _authentication-prefetch_userdb:

======================
Prefetch User Database
======================

Prefetch userdb can be used to combine passdb and userdb lookups into a single
lookup. It's usually used with :ref:`authentication-sql` and
:ref:`authentication-ldap_authentication`.

Prefetch basically works by requiring that the passdb returns the userdb
information in :ref:`authentication-password_database_extra_fields`
with ``userdb_``
prefixes. For example if a userdb typically returns ``uid``, ``gid`` and home
fields, the passdb would have to return ``userdb_uid``, ``userdb_gid`` and
``userdb_home`` fields.

If you're using :ref:`lda` or :ref:`lmtp_server` you still need a valid userdb which can be
used to locate the users. You can do this by adding a normal SQL/LDAP userdb
**after the userdb prefetch**. The order of definitions is significant. See
below for examples.

LDAP: ``auth_bind=yes`` with ``auth_bind_userdn-template`` is incompatible with
prefetch, because no passdb lookup is done then. If you want zero LDAP lookups,
you might want to use :ref:`authentication-static_user_database` instead of
prefetch.

SQL example
===========

``dovecot.conf``:

.. code-block:: none

  passdb db1 {
    driver = sql
    args = /etc/dovecot/dovecot-sql.conf.ext
  }
  userdb db1 {
    driver = prefetch
  }
  # The userdb below is used only by lda.
  userdb db2 {
    driver = sql
    args = /etc/dovecot/dovecot-sql.conf.ext
  }

``dovecot-sql.conf.ext``:

.. code-block:: none

  password_query = SELECT userid AS user, password, \
    home AS userdb_home, uid AS userdb_uid, gid AS userdb_gid \
    FROM users \
    WHERE userid = '%u'

  # For LDA:
  user_query = SELECT home, uid, gid FROM users WHERE userid = '%u'

LDAP example
============

``dovecot.conf``:

.. code-block:: none

  passdb db1 {
    driver = ldap
    args = /etc/dovecot/dovecot-ldap.conf.ext
  }
  userdb db1 {
    driver = prefetch
  }
  # The userdb below is used only by LDA.
  userdb db2 {
    driver = ldap
    args = /etc/dovecot/dovecot-ldap.conf.ext
  }

``dovecot-ldap.conf.ext``:

.. code-block:: none

  pass_attrs = uid=user, userPassword=password, \
    homeDirectory=userdb_home, uidNumber=userdb_uid, gidNumber=userdb_gid

  # For LDA:
  user_attrs = homeDirectory=home, uidNumber=uid, gidNumber=gid
