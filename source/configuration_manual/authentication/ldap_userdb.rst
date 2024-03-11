.. _authentication-ldap_userdb:

==================
LDAP user database
==================

Usually your LDAP database also contains the :ref:`userdb
information <authentication-user_database>`
If your home directory can be specified with a template and you're using
only a single UID and GID, you
should use :ref:`static userdb <authentication-static_user_database>`
instead to avoid an unnecessary LDAP lookup. You can also use :ref:`prefetch
userdb <authentication-prefetch_userdb>` to avoid the userdb LDAP lookup.

Userdb lookups are always done using the default DN (``dn`` setting)
bind. It's not possible to do the lookup using the user's DN (remember
that e.g. :ref:`LDA <lda>` or :ref:`LMTP <lmtp_server>` needs
to do userdb lookups without knowing the user's password).

The userdb lookups are configured in very much the same way as :ref:`LDAP
password lookups <authentication-ldap_passwords>`.
Instead of ``pass_attrs`` and ``pass_filter``, the userdb uses
``user_attrs`` and ``user_filter``. Typically ``pass_filter`` and
``user_filter`` are equivalent.

If you're using a single UID and GID for all the users, you can specify
them globally with ``mail_uid`` and ``mail_gid`` settings instead of
returning them from LDAP.

Example:

::

   user_attrs = \
     =home=%{ldap:homeDirectory}, \
     =uid=%{ldap:uidNumber}, \
     =gid=%{ldap:gidNumber}
   user_filter = (&(objectClass=posixAccount)(uid=%u))

   # For using doveadm -A:
   iterate_attrs = =user=%{ldap:uid}
   iterate_filter = (objectClass=posixAccount)

Attribute templates (v2.1+)
---------------------------

You can mix static text with the value returned from LDAP by using
``%{ldap:*}`` variables, which expand to the named LDAP attribute's value.
Some examples:

Create a "quota_rule" field with value ``*:bytes=<n>`` where <n> comes
from "quotaBytes" LDAP attribute:

::

   user_attrs = \
     =quota_rule=\*:bytes=%{ldap:quotaBytes}

Create a "mail_path" field with value ``/var/mail/<dir>/Maildir`` where
``<dir>`` comes from "sAMAccountName" LDAP attribute:

::

   user_attrs = \
     =mail_path=/var/spool/vmail/%{ldap:sAMAccountName}/Maildir

You can add static fields that aren't looked up from LDAP. For example
create a "mail_path" field with value ``/var/vmail/%d/%n/Maildir``:

::

   user_attrs = \
     =quota_rule=*:bytes=%{ldap:quotaBytes}, \
     =mail_path=/var/vmail/%d/%n/Maildir

If you don't want a field to exist at all when its LDAP attribute
doesn't exist, you can give the attribute name before the first "="
character. For example this doesn't return "home" or "mail" fields if
"mailboxPath" doesn't exist:

::

   user_attrs = \
     =quota_rule=*:bytes=%{ldap:quotaBytes}, \
     mailboxPath=home=/home/%{ldap:mailboxPath}, \
     mailboxPath=mail_path=~/Maildir

It's also possible to give default values to nonexistent attributes in
v2.1.11+ by using e.g. ``%{ldap:userDomain:example.com}`` where if
userDomain attribute doesn't exist, example.com is used instead.

Subqueries and pointers (v2.2)
------------------------------

LDAP values can now have DN pointers to other entries that are queried.

.. note:: These aren't actually very useful anymore. See the next
	  section for how to do multiple queries more easily using multiple
          userdbs.

Example:

::

   user_attrs = \
     =user=%{ldap:uid}, \
     @mail=%{ldap:mailDN}, \
     =uid=%{ldap:uidNumber@mail}, \
     =gid=%{ldap:gidNumber@mail}, \
     =home=%{ldap:rootPath@mail}/%d/%n

This will do a regular lookup first. Then does another lookup with DN
taken from mailDN's value. The ``*@mail`` attributes are assigned from the
second lookup's results.

::

   user_attrs = \
     =user=%{ldap:uid}, \
     =home=%{ldap_ptr:activePath}, \
     !primaryPath, !secondaryPath

The activePath's value can be either "primaryPath" or "secondaryPath".
The home's value will be the contents of that field. The !field tells
Dovecot to fetch the field's value but not to do anything with it
otherwise.

Multiple queries via userdbs (v2.2+)
------------------------------------

Example: Give the user a class attribute, which defines the default
quota:

dovecot.conf:

::

   userdb ldap {
     args = /etc/dovecot/dovecot-users-ldap.conf.ext
     result_success = continue-ok
   }
   userdb ldap {
     args = /etc/dovecot/dovecot-class-ldap.conf.ext
     skip = notfound
   }

/etc/dovecot/dovecot-users-ldap.conf.ext:

::

   # If user has overridden quota, quota_rule is set below. Otherwise it's still unset.
   user_attrs = \
     =class=%{ldap:userClass}
     quotaBytes=quota_rule=*:bytes=%{ldap:quotaBytes}

/etc/dovecot/dovecot-class-ldap.conf.ext:

::

   # Do the lookup using the user's class:
   user_filter = (&(objectClass=userClass)(class=%{userdb:class}))
   # With :protected suffix the quota_rule isn't overridden if it's already set.
   user_attrs = \
     classQuotaBytes=quota_rule:protected=*:bytes=%{ldap:classQuotaBytes}

Variables and domains
---------------------

User names and domains may be distinguished using the
:ref:`Variables <config_variables>`
%n and %d. They split the *previous username* at the "@" character. The
*previous username* is:

-  For LMTP, it will be ``user@hostname``, where hostname depends on e.g.
   the Postfix configuration.

-  For IMAP, it will be whatever the password database has designated as
   the username. If the (LDAP) password database has ``user_attrs =
   =user=%n``, then the domain part of the login name will be stripped by
   the password database. The UserDB will not see any domain part, i.e.
   %n and %u are the same thing for the UserDB.

The UserDB may set a new username, too, using ``user_attrs = =user=...``.
This will be used for

-  Logging

-  %u and %d variables in other parts of the configuration (e.g. quota
   file names)
