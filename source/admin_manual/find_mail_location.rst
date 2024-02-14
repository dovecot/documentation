.. _find_mail_location:

Finding Your Mail
=================

Before configuring Dovecot, you'll need to know where your mails are
located. You should already have an SMTP server installed and configured
to deliver mails somewhere, so the easiest way to make Dovecot work is
to just use the same location. Otherwise you could create a ``~/Maildir``
directory and configure your SMTP server to use the Maildir format.

First send a test mail to yourself (as your own non-root user):

::

   echo "Hello me" | mail -s "Dovecot test" $USER

Now, find where the mail went. Here's a simple script which checks the
most common locations:

::

   for mbox in /var/mail/$USER /var/spool/mail/$USER ~/mbox ~/mail/* ~/*; do
     grep -q "Dovecot test" "$mbox" && echo "mbox: $mbox"
   done
   grep -q "Dovecot test" ~/Maildir/new/* 2>/dev/null && echo "Maildir: ~/Maildir"

mbox
----

In most installations your mail went to ``/var/mail/username`` file.
This file is called **INBOX** in IMAP world. Since IMAP supports
multiple mailboxes, you'll also have to have a directory for them as
well. Usually ``~/mail`` is a good choice for this. For installation
such as this, the mail location is specified with (typically in
``conf.d/10-mail.conf``):

::

   mail_location = mbox:~/mail:INBOX=/var/mail/%u

Where ``%u`` is replaced with the username that logs in. Similarly if
your INBOX is in ``~/mbox``, use:

::

   mail_location = mbox:~/mail:INBOX=~/mbox

Maildir
-------

Maildir exists almost always in ``~/Maildir`` directory. The mail
location is specified with (typically in ``conf.d/10-mail.conf``):

::

   mail_location = maildir:~/Maildir

Problems?
---------

If you can't find the mail, you should check your SMTP server logs and
configuration to see where it went or what went wrong.

If you can find the mail, but it's in more exotic location, see if
:ref:`mail_location_settings` can help you to configure it.
