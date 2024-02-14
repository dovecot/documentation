.. _basic_configuration:

Basic Configuration
===================

This page tells you the basics that you'll need to get a working Dovecot
installation.

Find Dovecot configuration file location using:

::

   doveconf -n | head -n1

Your configuration file doesn't exist if you installed Dovecot from
sources. The config directory should contain a ``README`` file pointing
to an example configuration, which you can use as your basic
configuration. For example:

::

   cp -r /usr/share/doc/dovecot/example-config/* /etc/dovecot/

The default configuration starts from ``dovecot.conf``, which contains
an ``!include conf.d/*.conf`` statement to read the rest of the
configuration. This split of configuration files isn't a requirement to
use, and it doesn't really matter which .conf file you add any
particular setting, just as long as it isn't overridden in another file.
You can verify with ``doveconf -n`` that everything looks as you
intended.

Authentication
--------------

By default Dovecot is set up to use system user authentication. If
you're planning on using system users, you can simply skip this section
and read
:ref:`PAM <authentication-pam>` (or :ref:`bsdauth <authentication-bsdauth>`)
for configuring it.

If you're planning on using virtual users, it's easier to first create a
simple passwd-like file to make sure that the authentication will work.
Later when you know Dovecot is working, you can do it differently (see
:ref:`virtual_users`).

Run as your own non-root user:

::

   echo "$USER:{PLAIN}password:$UID:$GID::$HOME" > users
   sudo mv users /etc/dovecot/

   # If SELinux is enabled:
   restorecon -v /etc/dovecot/users

You can (and should) replace the "password" with whatever password you
wish to use, but don't use any important password here as we'll be
logging in with insecure plaintext authentication until
:ref:`SSL <ssl>` is
configured.

If you used the example configuration files, switch to passwd-file by
modifying ``conf.d/10-auth.conf``:

::

   # Add '#' to comment out the system user login for now:

   # Remove '#' to use passwd-file:
   !include auth-passwdfile.conf.ext

In ``conf.d/auth-passwdfile.conf.ext`` you should have:

::

   passdb {
     driver = passwd-file
     args = scheme=CRYPT username_format=%u /etc/dovecot/users
   }
   userdb {
     driver = passwd-file
     args = username_format=%u /etc/dovecot/users
   }

Verify with ``doveconf -n passdb userdb`` that the output looks like
above (and there are no other passdbs or userdbs).

Plaintext Authentication
------------------------

To allow any Authentication without SSL, disable SSL in the
``conf.d/10-ssl.conf`` file. This has to be done because Dovecot (now)
uses SSL as default. You probably want to switch this back to "yes" or
other options afterward.

::

   ssl = no

Until SSL is configured, allow plaintext authentication in the
``conf.d/10-auth.conf`` file. You probably want to switch this back to
"yes" afterward.

::

   auth_allow_cleartext = yes

If you didn't use the temporary passwd-file created above, don't do this
if you don't want your password to be sent in clear to network. Instead
get SSL configuration working and connect to Dovecot only using SSL.

Mail Location
-------------

Set the :dovecot_core:ref:`mail_location`  in ``conf.d/10-mail.conf`` as determined by
the instructions in :ref:`find_mail_location`.

mbox
~~~~

If you're using mboxes, it's important to have locking configuration
correct. See :ref:`mbox_locking` for more information.

If you're using ``/var/mail/`` or ``/var/spool/mail/`` directory for
INBOXes, you may need to give Dovecot additional permissions so it can
create dotlock files there. A failure to do so will result in errors
like these:

::

   open(/var/mail/.temp.host.1234.abcdefg) failed: Permission denied
   file_lock_dotlock() failed with mbox file /var/mail/user: Permission denied

From here on I'm assuming the INBOX directory is ``/var/mail``.

First check what the permissions of ``/var/mail`` are:

::

   # ls -ld /var/mail
   drwxrwxrwt 2 root mail 47 2006-01-07 20:44 /var/mail/

In this case everyone has write access there and the directory is marked
sticky. This allows Dovecot to create the dotlock files, so you don't
need to do anything.

::

   # ls -ld /var/mail
   drwxrwxr-- 2 root mail 47 2006-01-07 20:44 /var/mail/

In this case only the root and the ``mail`` group has write permission
to the directory. You'll need to give Dovecot's mail processes ability
to use this group by changing ``conf.d/10-mail.conf``:

::

   mail_privileged_group = mail

Note: Specifying the privileged user must be done as shown. Simply
adding ``dovecot`` user to the ``mail`` group does **not** grant write
permission.
