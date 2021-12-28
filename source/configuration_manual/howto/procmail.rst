===========================
Using procmail with Dovecot
===========================

.. warning::
  This page is provided for historical purposes only. The final release of procmail is 3.22 and was made in September 10, 2001.
  It is no longer maintained, and it has a number of security vulnerabilities. 
  Please consider using :ref:`sieve` instead.

Please see `<https://porkmail.org/era/procmail/mini-faq.html>`__. Procmail is
often installed as the default
:ref:`LDA <lda>`. A simple system wide Procmail :ref:`maildir <maildir_mbox_format>`
configuration looks like this:

::

   # file: /etc/procmailrc
   # system-wide settings for procmail
   SHELL="/bin/bash"
   SENDMAIL="/usr/sbin/sendmail -oi -t"
   LOGFILE="/var/log/procmail.log"
   DEFAULT="$HOME/Maildir/"
   MAILDIR="$HOME/Maildir/"
   :0
   * ^X-Spam-Status: Yes
   .spam/

Procmail delivers mails into Maildir folders, if a slash is appended to
the folder name (e.g. ".spam/"). But Procmail itself could not update
the Dovecot index files. This decreases the performance a bit, because
the Dovecot IMAP or POP3 server has to add new mails for the index
files.

To increase the performance, it's possible to combine Procmail with
Dovecot's deliver tool:

::

   # file: /etc/procmailrc
   # system-wide settings for procmail
   SHELL="/bin/bash"
   SENDMAIL="/usr/sbin/sendmail -oi -t"
   LOGFILE="/var/log/procmail.log"
   # fully define here so user .procmailrc can use it too
   DELIVER="/usr/lib/dovecot/deliver -d $LOGNAME"
   # fallback:
   DEFAULT="$HOME/Maildir/"
   MAILDIR="$HOME/Maildir/"

   # deliver spam to spam folder
   :0 w
   * ^X-Spam-Status: Yes
   | $DELIVER -m spam

   # uncomment next line to support user .procmailrc files
   #INCLUDERC=$HOME/.procmailrc

   # deliver to INBOX and stop
   :0 w
   | $DELIVER

**CAVEAT**

-  On some Debian releases, the permission of
   ``/etc/dovecot/dovecot.conf`` is incorrectly set to 600, which will
   cause the method above to fail; instead of going to your spam folder,
   ``/usr/lib/dovecot/deliver`` just gives up and dumps it in your
   INBOX. To fix this, as root you must:

   ::

             chmod 644 /etc/dovecot/dovecot.conf 

On a Debian system at 2010-04-04 I found that the delivery wasn't
working with an error of "Fatal: destination user parameter (-d user)
not given" If I add the following line to the /etc/procmailrc file it
fixes the problem: DROPPRIVS=yes It seems the deliver program from
Dovecot 1.2 expects a -d parameter if it is run as root, rather than the
user that the delivery is being done for.

Note that if you use this DROPPRIV method, then you cannot use a global
procmail log file unless it is world writable, so using 'deliver -d
$LOGNAME' is usually a better option.

Lenny Update
============

On Debian Lenny I had a couple of problems. For historic reasons, I have
inboxes in /var/mail/$USER. The most elegant approach was to add the
auth master socket in the dovecot configuration, then chmod 1777
/var/mail (root/mail) and use this procamil file:

::

   # file: /etc/procmailrc
   # system-wide settings for procmail
   SHELL="/bin/bash"
   SENDMAIL="/usr/sbin/sendmail -oi -t"
   LOGFILE="/var/log/procmail.log"
   DELIVER="/usr/lib/dovecot/deliver -d $LOGNAME"

   # uncomment next line to support user .procmailrc files
   #INCLUDERC=$HOME/.procmailrc

   :0 w
   | $DELIVER

Ubuntu 12.04 Update
===================

As far as the documentation I have for procmail the SENDMAIL variable
should 'point' at the sendmail binary and the SENDMAILFLAGS variable
should be set to command line arguments for sendmail. The '-t' flag
seems to cause a serious mail repetition problem if you are delivering
without the use of the /usr/lib/dovecot/deliver and allowing users to
have their own .procmailrc files. The '-t' flag causes sendmail to
ignore a dot as the 'end of message' identifier, as in the SMTP
protocol, however procmail appears to operate by closing the file.
Therefore the addition of the '-t' flag causes sendmail to try to
deliver the mail a number of times, until it gives up. Beware on a large
site with many .procmailrc files this can cause devastating consequences
(at the very least you'll be on the phone for hours explaining to your
users why they have about 7 copies of every email).

So the /etc/procmail command I am using successfully is as follows:

::

   # system-wide settings for procmail
   SHELL="/bin/bash"
   SENDMAIL=/usr/sbin/sendmail
   SENDMAILFLAGS="-oi"
   LOGFILE="/var/log/procmail.log"
   DEFAULT="$HOME/Maildir/"
   MAILDIR="$HOME/Maildir/"

