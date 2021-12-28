.. _authentication-checkpassword:

=============
CheckPassword
=============

.. versionadded:: v2.3.0

You can also use Lua to write your custom authentication, see :ref:`lua`
Checkpassword is an authentication interface originally implemented by qmail.

Note that the original Qmail site is gone, but you can still find resources at 
<https://www.getmailbird.com/what-resources-are-available-now-that-qmail-org-is-gone/>.

Checkpassword combines both the :ref:`authentication-password_databases` and
:ref:`authentication-user_database` lookups into a single checkpassword lookup, which
makes the standard implementation unsuitable for a standalone userdb.

With Dovecot extensions it's also possible to use checkpassword as a userdb.

Typically you'll use prefetch as the userdb, but it's not required that you use
the checkpassword script's userdb capabilities. You can still use for example
:ref:`authentication-static_password_database` if you're using only a single UID and GID, and
your home directory fits into a template.

Security
========

The standard checkpassword design is incompatible with Dovecot's security
model. If the system has local users and the checkpassword script setuid()s
into a local user, the user is able to ptrace into the communication and change
the authentication results. This is of course undesirable, so v2.2.7+ will just
refuse to run in such environments by default. The possibilities to solve this
are:

If possible, change the checkpassword to return userdb_uid and userdb_gid extra
fields instead of using ``setuid()`` and ``setgid()``. This also improves the
performance.

If you can't change the script, you can make Dovecot's checkpassword-reply
binary setuid or setgid (e.g. chgrp dovecot
/usr/local/libexec/dovecot/checkpassword-reply; chmod g+s
/usr/local/libexec/dovecot/checkpassword-reply)

If you don't have any untrusted local users and you just don't care about this
check, you can set ``INSECURE_SETUID=1`` environment e.g. with a wrapper
checkpassword script.

Deliver
========

If your checkpassword script doesn't support Dovecot extensions, you can't use
it as a user database. This means that if you wish to use LDA, you can't use
the -d parameter to do userdb lookups. There are two ways to solve this:

Use another userdb which does the lookup for deliver, for example SQL or
static. Add this userdb after the prefetch userdb.

Use a script to look up the user's home directory and run deliver without -d
parameter. For example:

.. code-block:: none

  #!/bin/sh

  # <<Lookup user's home directory here.>>

  # If users have different UIDs/GIDs, make sure to also change this process's UID and GID.
  # If you want to override any settings, use dovecot-lda's -o parameter
  # (e.g. dovecot-lda -o mail_location=maildir:~/Maildir).

  export HOME
  exec /usr/local/libexec/dovecot/dovecot-lda
