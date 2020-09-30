.. _lda:

===========
Dovecot LDA
===========

The Dovecot LDA is a `local delivery
agent <https://wiki2.dovecot.org/MDA#>`__, which takes mail from an
`MTA <https://wiki2.dovecot.org/MTA#>`__ and delivers it to a user's
mailbox, while keeping Dovecot index files up to date. Nowadays you
should probably use the `LMTP
server <https://wiki2.dovecot.org/LMTP#>`__ instead, because it's
somewhat easier to configure (especially related to permissions) and
gives better performance.

This page describes the common settings required to make LDA work. You
should read it first, and then the MTA specific pages:

-  `LDA/Postfix <https://wiki2.dovecot.org/LDA/Postfix#>`__

-  `LDA/Exim <https://wiki2.dovecot.org/LDA/Exim#>`__

-  `LDA/Sendmail <https://wiki2.dovecot.org/LDA/Sendmail#>`__

-  `LDA/Qmail <https://wiki2.dovecot.org/LDA/Qmail#>`__

-  `LDA/ZMailer <https://wiki2.dovecot.org/LDA/ZMailer#>`__

Main features of Dovecot LDA
----------------------------

-  `Mailbox indexing during mail
   delivery <https://wiki2.dovecot.org/LDA/Indexing#>`__, providing
   faster mailbox access later

-  :ref:`Quota enforcing by a plugin <quota_plugin>`

-  :ref:`Sieve language support by a
   plugin <sieve>`

   -  Mail filtering

   -  Mail forwarding

   -  Vacation auto-reply

Common configuration
--------------------

The settings are listed in the example ``conf.d/15-lda.conf`` file. The
important settings are:

-  :ref:`setting-postmaster_address` is used as the From: header address in bounce
   mails

-  :ref:`setting-hostname` is used in generated Message-IDs and in Reporting-UA:
   header in bounce mails

-  :ref:`setting-sendmail_path` is used to send mails. Note that the default is
   ``/usr/sbin/sendmail``, which doesn't necessarily work the same as
   ``/usr/lib/sendmail``.

   -  Alternatively you can use :ref:`setting-submission_host` to send mails via
      the specified SMTP server.

-  :ref:`setting-auth_socket_path` specifies the UNIX socket to auth-userdb where
   LDA can lookup userdb information when ``-d`` parameter is used. See
   below how to configure Dovecot to configure the socket.

Note that the config files must be world readable to enable dovecot-lda
process read them, while running with user privileges. You can put
password related settings to a separate file, which you include with
``!include_try`` and dovecot-lda skips them.

Parameters
----------

Parameters accepted by dovecot-lda:

-  ``-d <username>``: Destination username. If given, the user
   information is looked up from dovecot-auth. Typically used with
   virtual users, but not necessarily with system users.

-  ``-a <address>``: Original envelope recipient address (e.g.
   user+ext@domain), typically same as SMTP's RCPT TO: value. If not
   specified, it's taken from header specified by
   :ref:`setting-lda_original_recipient_header` setting (v2.0.3+). If the header
   doesn't exist either, defaults to same as username.

-  ``-r <address>``: Final envelope recipient address. Defaults to -a
   address, but may differ if e.g. aliases are used or when dropping the
   +ext part. (v2.0.3+)

-  ``-f <address>``: Envelope sender address. If not specified and
   message data begins with a valid mbox-style "From " line, the address
   is taken from it.

-  ``-c <path>``: Alternative configuration file path.

-  ``-m <mailbox>``: Destination mailbox (default is INBOX). If the
   mailbox doesn't exist, it will not be created (unless the
   lda_mailbox_autocreate setting is set to yes). If message couldn't be
   saved to the mailbox for any reason, it's delivered to INBOX instead.

   -  If Sieve plugin is used, this mailbox is used as the "keep"
      action's mailbox. It's also used if there is no Sieve script or if
      the script fails for some reason.

   -  Deliveries to namespace prefix will result in saving the mail to
      INBOX instead. For example if you have "Mail/" namespace, this
      allows you to specify ``dovecot-lda -m Mail/$mailbox`` where mail
      is stored to Mail/$mailbox or to INBOX if $mailbox is empty.

   -  The mailbox name is specified the same as it's visible in IMAP
      client. For example if you've a Maildir with ``.box.sub/``
      directory and your namespace configuration is ``prefix=INBOX/``,
      ``separator=/``, the correct way to deliver mail there is to use
      ``-m INBOX/box/sub``

-  ``-e``: If mail gets rejected, write the rejection reason to stderr
   and exit with EX_NOPERM. The default is to send a rejection mail
   ourself.

-  ``-k``: Don't clear all environment at startup.

-  ``-p <path>``: Path to the mail to be delivered instead of reading
   from stdin. If using maildir the file is hard linked to the
   destination if possible. This allows a single mail to be delivered to
   multiple users using hard links, but currently it also prevents
   dovecot-lda from updating cache file so it shouldn't be used unless
   really necessary.

-  ``-o name=value``: Override a setting from dovecot.conf. You can give
   this parameter multiple times.

Return values
-------------

dovecot-lda will exit with one of the following values:

-  0 (EX_OK): Delivery was successful.

-  64 (EX_USAGE): Invalid parameter given.

-  67 (EX_NOUSER): The destination username was not found.

-  77 (EX_NOPERM): -e parameter was used and mail was rejected.
   Typically this happens when user is over quota and
   :ref:`setting-quota_full_tempfail` = ``no``.

-  75 (EX_TEMPFAIL): A temporary failure. This is returned for almost
   all failures. See the log file for details.

System users
------------

You can use LDA with a few selected system users (ie. user is found from
``/etc/passwd`` / NSS) by calling dovecot-lda in the user's
``~/.forward`` file:

::

   | "/usr/local/libexec/dovecot/dovecot-lda"

This should work with any MTA which supports per-user ``.forward``
files. For qmail's per-user setup, see
`LDA/Qmail <https://wiki2.dovecot.org/LDA/Qmail#>`__.

This method doesn't require the authentication socket explained below
since it's executed as the user itself.

Virtual users
-------------

With a lookup
~~~~~~~~~~~~~

Give the destination username to dovecot-lda with ``-d`` parameter, for
example:

::

   dovecot-lda -f $FROM_ENVELOPE -d $DEST_USERNAME

You'll need to set up a auth-userdb socket for dovecot-lda so it knows
where to find mailboxes for the users:

::

   service auth {
     unix_listener auth-userdb {
       mode = 0600
       user = vmail # User running dovecot-lda
       #group = vmail # Or alternatively mode 0660 + dovecot-lda user in this group
     }
   }

The auth-userdb socket can be used to do
:ref:`userdb <authentication-user_database>` lookups for
given usernames or get a list of all users. Typically the result will
contain the user's UID, GID and home directory, but depending on your
configuration it may return other information as well. So the
information is similar to what can be found from eg. ``/etc/passwd`` for
system users. This means that it's probably not a problem to use
mode=0666 for the socket, but you should try to restrict it more just to
be safe.

Without a lookup
~~~~~~~~~~~~~~~~

If you have already looked up the user's home directory and you don't
need a userdb lookup for any other reason either (such as overriding
settings for specific users), you can run dovecot-lda similar to how
it's run for system users:

::

   HOME=/path/to/user/homedir dovecot-lda -f $FROM_ENVELOPE

This way you don't need to have a master listener socket. Note that you
should verify the user's existence prior to running dovecot-lda,
otherwise you'll end up having mail delivered to nonexistent users as
well.

You must have set the proper UID (and GID) before running dovecot-lda.
It's not possible to run dovecot-lda as root without ``-d`` parameter.

Multiple UIDs
~~~~~~~~~~~~~

If you're using more than one UID for users, you're going to have
problems running dovecot-lda, as most MTAs won't let you run dovecot-lda
as root. Best solution is to use
:ref:`LMTP <lmtp_server>` instead, but if you can't
do that, there are two ways to work around this problem:

1. Make dovecot-lda setuid-root.

2. Use sudo to wrap the invocation of dovecot-lda.

Making dovecot-lda setuid-root:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Beware: **it's insecure to make dovecot-lda setuid-root**, especially if
you have untrusted users in your system. **Setuid-root dovecot-lda can
be used to gain root privileges**. You should take extra steps to make
sure that untrusted users can't run it and potentially gain root
privileges. You can do this by making sure only your MTA has execution
access to it. For example:

::

   # chgrp secmail /usr/local/libexec/dovecot/dovecot-lda
   # chmod 04750 /usr/local/libexec/dovecot/dovecot-lda
   # ls -l /usr/local/libexec/dovecot/dovecot-lda
   -rwsr-x--- 1 root secmail 4023932 2010-06-15 16:23 dovecot-lda

Then start dovecot-lda as a user that belongs to secmail group. Note
that you have to recreate these rights after each update of dovecot.

Using sudo:
^^^^^^^^^^^

Alternatively, you can use sudo to wrap the invocation of dovecot-lda.
This has the advantage that updates will not clobber the setuid bit, but
note that **it is just as insecure being able to run dovecot-lda via
sudo as setuid-root**. Make sure you only give your MTA the ability to
invoke dovecot-lda via sudo.

First configure sudo to allow 'dovelda' user to invoke dovecot-lda by
adding the following to your ``/etc/sudoers``:

::

   Defaults:dovelda !syslog
   dovelda          ALL=NOPASSWD:/usr/local/libexec/dovecot/dovecot-lda

Then configure your MTA to invoke dovecot-lda as user 'dovelda' and via
sudo:

::

   /usr/bin/sudo /usr/local/libexec/dovecot/dovecot-lda

instead of just plain ``/usr/local/libexec/dovecot/dovecot-lda``.

Problems with dovecot-lda
-------------------------

-  If you are using :ref:`prefetch
   userdb <authentication-prefetch_userdb>`,
   keep in mind that ``dovecot-lda`` does not make a password query and
   thus will not work if ``-d`` parameter is used. The
   :ref:`UserDatabase/Prefetch <authentication-prefetch_userdb>` page explains how to fix this.

   -  See
      :ref:`Checkpassword <authentication-checkpassword>`
      for how to make dovecot-lda work with checkpassword.

Logging
~~~~~~~

-  Normally Dovecot logs everything through its log process, which is
   running as root. dovecot-lda doesn't, which means that you might need
   some special configuration for it to log anything at all.

-  If dovecot-lda fails to write to log files it exits with temporary
   failure.

-  If you have trouble finding where Dovecot logs by default, see
   `Logging <https://wiki2.dovecot.org/Logging#>`__.

-  Note that Postfix's ``mailbox_size_limit`` setting applies to all
   files that are written to. So if you have a limit of 50 MB,
   dovecot-lda can't write to log files larger than 50 MB and you'll
   start getting temporary failures.

If you want dovecot-lda to keep using Dovecot's the default log files:

-  If you're logging to syslog, make sure the syslog socket (usually
   ``/dev/log``) has enough write permissions for dovecot-lda. For
   example set it world-read/writable: ``chmod a+rw /dev/log``.

-  If you're logging to Dovecot's default log files again you'll need to
   give enough write permissions to the log files for dovecot-lda.

You can also specify different log files for dovecot-lda. This way you
don't have to give any extra write permissions to other log files or the
syslog socket. You can do this by overriding the :ref:`setting-log_path` and
:ref:`setting-info_log_path` settings:

::

   protocol lda {
    ..
     # remember to give proper permissions for these files as well
     log_path = /var/log/dovecot-lda-errors.log
     info_log_path = /var/log/dovecot-lda.log
   }

For using syslog with dovecot-lda, set the paths empty:

::

   protocol lda {
    ..
     log_path =
     info_log_path =
     # You can also override the default syslog_facility:
     #syslog_facility = mail
   }

Plugins
-------

-  Most of the `Dovecot
   plugins <https://wiki2.dovecot.org/Plugins#>`__ work with
   dovecot-lda.

-  Virtual quota can be enforced using :ref:`Quota
   plugin <quota_plugin>`.

-  Sieve language support can be added with the :ref:`Pigeonhole Sieve
   plugin <sieve>`.
