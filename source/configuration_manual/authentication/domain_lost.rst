.. _authentication-domain_lost:

====================
Domain (%d) is empty
====================

IMAP or POP3 protocol doesn't have explicit support for domains. The
usernames are commonly in ``user@domain`` format, and that is also where
Dovecot gets the domain from. If the username doesn't have ``@domain``, then
the domain is also usually empty (unless :dovecot_core:ref:`auth_default_realm` setting
is used).

If you login as ``user@domain``, but the %d is still empty, the problem is
that your configuration lost the domain part by changing the username.
Dovecot doesn't keep track of the domain separately from username, so if
something changes username from ``user@domain`` to just plain ``user``, the
domain is lost and %d returns nothing. If you have
:dovecot_core:ref:`auth_debug=yes <auth_debug>`,
this shows up in logs like:

::

   Info: auth(user@domain.org): username changed user@domain.org -> user

Below are some of the most common reasons for this.

Settings
--------

:dovecot_core:ref:`auth_username_format = %Ln <auth_username_format>` lowercases
the username but also drops the domain. Use
:dovecot_core:ref:`auth_username_format = %Lu <auth_username_format>` instead.

:dovecot_core:ref:`auth_username_format` changes the username permanently when
used globally. If used inside passdb or userdb, it changes the username only
for the duration of the lookup. See also
:ref:`authentication-virtual_and_system_users`.

SQL
---

``password_query`` gets often misconfigured to drop the domain if
username and domain are stored separately. For example:

::

   # BROKEN:
   password_query = SELECT username AS user, password FROM users \
   WHERE username = '%n' AND domain = '%d'

The "username AS user" changes the username permanently and the domain
is dropped. You can instead use:

::

   # MySQL:
   password_query = SELECT concat(username, '@', domain) AS user, \
   password FROM users WHERE username = '%n' AND domain = '%d'

Or you can return username and domain fields separately and Dovecot will
merge them into a single user field:

::

   password_query = SELECT username, domain, password FROM users \
   WHERE username = '%n' AND domain = '%d'

.. _authentication-virtual_and_system_users:

Virtual and system users
========================

If you need to do PAM/passwd lookup for system users, and also have domain users,
you can configure authentication to drop the domain part after doing virtual
user lookup. 

::

   ## Your virtual passdb
   passdb ldap {
      args = /path/to/ldap/config
   }

   passdb static {
      args = user=%Ld noauthenticate
      skip = authenticated
   }

   passdb pam {
      skip = authenticated
   }

   userdb ldap {
      args = /path/to/ldap/config
   }

   userdb passwd {
   }
