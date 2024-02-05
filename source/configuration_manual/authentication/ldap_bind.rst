.. _authentication-ldap_bind:

=====================================
Passdb LDAP with authentication binds
=====================================

Advantages over :ref:`password lookups <authentication-ldap_passwords>`

-  LDAP server verifies the password, so Dovecot doesn't need to know
   what format the password is stored in.

-  A bit more secure, as a security hole in Dovecot doesn't give
   attacker access to all the users' password hashes. (And Dovecot
   admins in general don't have direct access to them.)

You can enable authentication binds by setting ``auth_bind=yes``. Next
Dovecot needs to know what DN to use in the binding. There are two ways
to configure this: lookup or template.

DN lookup
---------

DN is looked up by sending a ``pass_filter`` LDAP request and getting
the DN from the reply. This is very similar to doing a
:ref:`password lookup <authentication-ldap_passwords>`.
The only difference is that ``userPassword`` attribute isn't returned. Just
as with password lookups, the ``pass_attrs`` may contain special
:ref:`extra fields <authentication-password_database_extra_fields>`.

Example:

::

   auth_bind = yes
   pass_attrs = uid=user
   pass_filter = (&(objectClass=posixAccount)(uid=%u))

DN template
===========

The main reason to use DN template is to avoid doing the DN lookup, so
that the authentication consists only of one LDAP request. With IMAP and
POP3 logins the same optimization can be done by using :ref:`prefetch
userdb <authentication-prefetch_userdb>`
and returning userdb info in the DN lookup (a total of two LDAP requests
per login in both cases). If you're also using Dovecot for SMTP AUTH, it
doesn't do a userdb lookup so the prefetch optimization doesn't help.

If you're using DN template, ``pass_attrs`` and ``pass_filter`` settings
are completely ignored. That means you can't make passdb return any
:ref:`extra fields <authentication-password_database_extra_fields>`.
You should also set ``auth_username_format = %Lu`` in ``dovecot.conf``
to normalize the username by lowercasing it.

Example:

::

   auth_bind = yes
   auth_bind_userdn = cn=%u,ou=people,o=org

Connection optimization
=======================

When using

-  auth binds and

-  userdb ldap lookups,

the userdb lookups should use a separate connection to the LDAP server.
That way it can send LDAP requests asynchronously to the server, which
improves the performance. This can be done by specifying different
filenames in the LDAP passdb and userdb args. The second file could be a
symlink to the first one. For example:

::

   passdb db1 {
     driver = ldap
     args = /etc/dovecot/dovecot-ldap.conf.ext
   }
   userdb db1 {
     driver = ldap
     args = /etc/dovecot/dovecot-ldap-userdb.conf.ext
   }

And create the symlink:

::

   ln -s /etc/dovecot/dovecot-ldap.conf.ext /etc/dovecot/dovecot-ldap-userdb.conf.ext
