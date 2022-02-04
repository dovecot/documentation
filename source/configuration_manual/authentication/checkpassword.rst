.. _authentication-checkpassword:

=============
CheckPassword
=============

.. versionremoved:: v2.4;v3.0

.. note:: You can also use Lua to write your custom authentication, see
          :ref:`lua`

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

 * If possible, change the checkpassword to return userdb_uid and userdb_gid extra
   fields instead of using ``setuid()`` and ``setgid()``. This also improves the
   performance.

 * If you can't change the script, you can make Dovecot's checkpassword-reply
   binary setuid or setgid (e.g. ``chgrp dovecot
   /usr/local/libexec/dovecot/checkpassword-reply; chmod g+s
   /usr/local/libexec/dovecot/checkpassword-reply``)

 * If you don't have any untrusted local users and you just don't care about this
   check, you can set ``INSECURE_SETUID=1`` environment e.g. with a wrapper
   checkpassword script.

Deliver
=======

If your checkpassword script doesn't support Dovecot extensions, you can't use
it as a user database. This means that if you wish to use LDA, you can't use
the ``-d`` parameter to do userdb lookups. There are two ways to solve this:

 * Use another userdb which does the lookup for deliver, for example SQL or
   static. Add this userdb after the prefetch userdb.

 * Use a script to look up the user's home directory and run deliver without ``-d``
   parameter. For example:

   .. code-block:: none

     #!/bin/sh

     # <<Lookup user's home directory here.>>

     # If users have different UIDs/GIDs, make sure to also change this process's UID and GID.
     # If you want to override any settings, use dovecot-lda's -o parameter
     # (e.g. dovecot-lda -o mail_location=maildir:~/Maildir).

     export HOME
     exec /usr/local/libexec/dovecot/dovecot-lda

Checkpassword Interface
=======================

The interface is specified in <http://cr.yp.to/checkpwd/interface.html>.
However, here's a quick tutorial for writing a script:

 * Read ``<username> NUL <password> NUL`` from fd 3.
 * Verify the username and password.

   * If the authentication fails, exit with code 1. This makes Dovecot give
     "Authentication failed" error to user.

     * This error is returned both for password mismatch and also if the user
       doesn't exist at all. Internally Dovecot maps this as password mismatch.

   * If you encounter an internal error, exit with code 111. This makes Dovecot
     give "Temporary authentication failure" error to user.

 * If the authentication succeeds, you'll need to:

   * Set user's home directory to ``$HOME`` environment. This isn't required,
     but highly encouraged: <https://wiki.dovecot.org/VirtualUsers/Home>.
   * Set ``$USER`` environment variable. If the user name was changed (eg. if
     you lowercased "Username" to "username"), you can tell about it to Dovecot
     by setting ``$USER`` to the changed user name.
   * Return the user's :ref:`UNIX UID and GID <system_users_used_by_dovecot>`
     using ``userdb_uid`` and ``userdb_gid`` environments and add them to the
     ``EXTRA`` environment (see below for Dovecot extensions).

     * This is recommended over actually changing the UID/GID using
       setuid()/setgid() as specified by the standard checkpassword interface,
       because it's incompatible with Dovecot's security model.

   * Your program received a path to ``checkpassword-reply`` binary as the
     first parameter. Execute it.

Qmail-LDAP
==========

Note that auth_imap that comes with qmail-ldap is not compatible with this
interface. You can use auth_pop instead, but you may need to pass
``aliasempty`` to let auth_pop find the Maildir, so it is recommended to write
a ``/var/qmail/bin/auth_dovecot`` wrapper (don't forget to ``chmod +x`` it)
around auth_pop.

.. code-block:: sh

   #!/bin/sh
   QMAIL="/var/qmail"
   if [ -e $QMAIL/control/defaultdelivery ]; then
       ALIASEMPTY=`head -n 1 $QMAIL/control/defaultdelivery 2> /dev/null`
   else
       ALIASEMPTY=`head -n 1 $QMAIL/control/aliasempty 2> /dev/null`
   fi
   ALIASEMPTY=${ALIASEMPTY:-"./Maildir/"}
   exec $QMAIL/bin/auth_pop "$@" $ALIASEMPTY

You can also use this wrapper to pass ``LOGLEVEL`` environmental variable to
auth_pop.

Dovecot Extensions
==================

If you wish to return
:ref:`extra fields <authentication-password_database_extra_fields>` for
Dovecot, set them in environment variables and then list them in ``EXTRA``
environment variable. The
:ref:`userdb extra fields <authentication-user_database_extra_fields>`
can be returned by prefixing them with ``userdb_``. For example:

.. code-block:: none

   userdb_quota_rule=*:storage=10000
   userdb_mail=mbox:$HOME/mboxes
   EXTRA=userdb_quota_rule userdb_mail

Dovecot also sets some environment variables that the script may use:

 * ``SERVICE``: contains eg. imap, pop3 or smtp
 * ``TCPLOCALIP`` and `TCPREMOTEIP`: Client socket's IP addresses if available
 * ``MASTER_USER``: If master login is attempted. This means that the password
    contains the master user's password and the normal username contains the
    user who master wants to log in as.
 * ``AUTH_*``: All of the :ref:`variables <config_variables>` are available as
   ``AUTH_<long name>`` extra fields. For example ``%{cert}`` is in
   ``AUTH_CERT``.

   .. versionadded:: v2.0.16

Checkpassword as userdb
=======================

Dovecot calls the script with ``AUTHORIZED=1`` environment set when performing
a userdb lookup. The script must acknowledge this by changing the environment
to ``AUTHORIZED=2``, otherwise the lookup fails. Other than that, the script
works the same way as a passdb checkpassword script. If user doesn't exist,
use exit code 3.

Checkpassword with passdb lookups
=================================

.. versionadded:: v2.1.2

Normally checkpassword answers to questions "is user X's password Y?" This
doesn't work with non-plaintext auth mechanisms, or when Dovecot wants to do a
non-authenticating passdb lookup (e.g. for LMTP proxy). These passdb
credentials lookups can be implemented the same way as a userdb lookup
(i.e. change the ``AUTHORIZED`` environment).

 * ``AUTHORIZED=1`` is set, just like for userdb lookup
 * When doing a non-plaintext authentication:

   * ``CREDENTIALS_LOOKUP=1`` environment is set
   * The password scheme that Dovecot wants is available in ``SCHEME``
     environment (e.g. ``SCHEME=CRAM-MD5``)
   * If a password is returned, it must be returned as
     ``password={SCHEME}secret``.

 * When doing a passdb lookup, e.g. a proxy which doesn't really want the
   password, just the passdb extra fields:

    * Neither ``CREDENTIALS_LOOKUP`` nor ``SCHEME`` is set.
    * FIXME: Unfortunately it looks like you currently can't easily
      differentiate a passdb lookup from userdb lookup!

 * If user doesn't exist, use exit code 3.
 * If you get an error about checkpassword exiting with code 0, you didn't
   execute the ``checkpassword-reply`` binary as you should have (which exits
   with code 2 on success)

Example
=======

The standard way:

.. code-block: none

   passdb {
     driver = checkpassword
     args = /usr/bin/checkpassword
   }
   userdb {
     driver = prefetch
   }
   # If you want to use deliver -d and your users are in SQL:
   userdb {
     driver = sql
     args = /etc/dovecot/dovecot-sql.conf.ext
   }

Using checkpassword only to verify the password:

.. code-block:: none

   passdb {
     driver = checkpassword
     args = /usr/bin/checkpassword
   }
   userdb {
     driver = static
     args = uid=vmail gid=vmail home=/home/%u
   }

Performance
===========

The CheckPassword backend is not suited for heavy traffic. Especially if the
script spawned has to launch an entire language interpreter.

If your user database is only accessible with custom code an alternative might
be :ref:`lua`.

Specific checkpassword implementations
======================================

 * phpBB dovecot checkpassword authentication, written in python:
   <https://github.com/ser/checkpassword-phpbb>
