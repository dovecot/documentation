Upgrading Dovecot v0.99.x to v1.0
=================================

The upgrade from Dovecot v0.99.x to v1.0 isn't just a drop-in upgrade, but also requires the administrator to adjust the configuration in several places, as detailed in the chapters below.

Configuration file
------------------

The configuration file has had a lot of changes, so it's better to just modify the included ``dovecot-example.conf`` file manually.
The easiest way to remember what you had changed in the old file is with grep::

   egrep -v '^ *(#|$)'|less

PAM
---

Dovecot v0.99.x defaulted to using "imap" or "pop3" PAM service identifiers, ie. ``/etc/pam.d/imap`` or ``/etc/pam.d/pop3`` files.
With v1.0, the default is to use "dovecot" service identifier, i.e. ``/etc/pam.d/dovecot``.
Either change the passdb pam args to use the "*" parameter or set up the ``/etc/pam.d/`` files properly.

SQL Configuration
-----------------

The SQL configuration has changed. ``password_query`` in the new dovecot-sql.conf must return a field named ``password``.

Subscriptions
-------------

**Maildir only**: The filename that stores user subscriptions has changed from ``.subscriptions`` to ``subscriptions``.
It is still called ``.subscriptions`` for mbox.
Since v1.0.rc2 the renaming is done automatically.

Keywords
--------

**Maildir-only**: The former ``.customflags`` file has been renamed to ``dovecot-keywords``, which is incompatible with v0.99.x's format.
Since v1.0.rc2 Dovecot can convert the file automatically.
This conversion does not happen when going directly from v0.99 to v1.1, though.
The files must be renamed manually.

POP3 UIDLs
----------

UIDLs are used by POP3 clients to keep track of what messages they've downloaded, typically only if you've enabled "keep messages in server" option.
If the UIDL changes, the existing messages are re-downloaded as new messages, which you should try to avoid.

For compatibility with Dovecot v0.99.x, use::

  pop3_uidl_format = %v.%u

However this doesn't work well for Outlook 2003 users (as it didn't with v0.99.x either), which is the reason this isn't the default anymore.
See :ref:`pop3_server_uidl_format` for alternative (and better) UIDL formats.

mbox errors
-----------

The first time a user opens a mailbox after upgrading it may log some errors such as::

   mbox sync: UID inserted in the middle of mailbox /var/mail/**** (4409 > 4237)

The user may need to log out and log in again to see all of the messages in the affected mailboxes.
Note that this shouldn't happen unless the mbox already had some errors.
The new mbox parsing code just does better error checking.

Port Changes
------------

The port settings are different. The new settings are::

   # if you wish to just change IP address, change:
   listen = 1.2.3.4
   ssl_listen = 1.2.3.4
   
   # if you wish to change ports also, use instead:
   protocol imap {
     listen = *:143
     ssl_listen = *:993
   }
   protocol pop3 {
     listen = *:110
     ssl_listen = *:995
   }

Log Changes for POP before SMTP
-------------------------------

If you used `POP-before-SMTP <https://wiki.dovecot.org/HowTo/PopBSMTPAndDovecot>`_ , the log strings are different. This should work with new versions::

  $s =~ s/^... .. ..:..:.. .* dovecot: (pop3|imap)-login: Login: .+ rip=(\d+\.\d+\.\d+\.\d+),.*$/$2/i;

