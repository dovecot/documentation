.. _known_issues-mbox_problems:

=============
mbox problems
=============

External modifications
----------------------

In general Dovecot doesn't mind if you modify the mbox file externally.
It's fine if external software expunges messages or appends new ones.
However moving around existing messages, inserting messages in the
middle of the file or modifying existing messages isn't allowed.

Especially modifying existing messages (eg. removing attachments) may
cause all kinds of problems. If you do that, at the minimum go and
delete ``dovecot.index.cache`` file from the mailbox, otherwise weird
things may happen. However IMAP protocol guarantees that messages don't
change at all, and deleting Dovecot's cache file doesn't clear clients'
local caches, so it still may not work right.

If you insert messages, or if you "undelete" messages (eg. replace mbox
from a backup), you may see errors in Dovecot's logs:

::

   mbox sync: UID inserted in the middle of mailbox /home/tss/mail/inbox (817 > 787, seq=18, idx_msgs=32)

This is normal. Dovecot just assigned new UIDs for the messages. See
below for other reasons why UID insertions could happen.

Debugging UID insertions
------------------------

The above error message can be read as: "18th message in the mbox file
contained X-UID: 787 header, however the index file at that position
told the message was supposed to have UID 817. There are 32 messages
currently in the index file."

There are four possibilities why the error message could happen:

1. Message with a X-UID: 787 header really was inserted in the mbox
   file. For example you replaced mbox from a backup.

2. Something changed the X-UID headers. Very unlikely. 

3. The message was expunged from the index file, but for some reason it
   wasn't expunged from the mbox file. The index file is updated only
   after a successful mbox file modification, so this shouldn't really
   happen either.

4. If this problem happens constantly, it could mean that you're sharing
   the same index file for multiple different mboxes!

   -  This could happen if you let Dovecot do mailbox autodetection and
      it sometimes uses ``/var/mail/%u`` (when it exists) and other
      times ``~/mail/inbox``. Use an explicit
      :dovecot_core:ref:`mail_location`
      setting to make sure the same INBOX is used.

   -  Another possibility is that you're sharing index files between
      multiple users. Each user must have their own home directory.

It's possible that broken X-UID headers in mails and
:dovecot_core:ref:`mbox_lazy_writes=yes <mbox_lazy_writes>` combination has some bugs.
If you're able to reproduce such an error, please let us know how.

UIDVALIDITY changes
~~~~~~~~~~~~~~~~~~~

UIDVALIDITY is stored in X-IMAPbase: or X-IMAP: header of the first
message in mbox file. This is done by both Dovecot and UW-IMAP (and
Pine). It's also stored in ``dovecot.index`` file. It shouldn't normally
change, because if it does it means that client has to download all the
messages for the mailbox again.

If the UIDVALIDITY in mbox file doesn't match the one in
``dovecot.index`` file, Dovecot logs an error:

::

   UIDVALIDITY changed (1100532544 -> 1178155834) in mbox file /home/user/mail/mailbox

This can happen when the following happens:

1. Dovecot accesses the mailbox saving the current UIDVALIDITY to
   ``dovecot.index`` file.

2. The UIDVALIDITY gets lost from the mbox file

   -  X-IMAP: or X-IMAPbase: header gets lost because something else
      than Dovecot or UW-IMAP deletes the first message

   -  The whole file gets truncated

   -  Something else than Dovecot deletes or renames the mbox

3. The mailbox is accessed (or created if necessary) by UW-IMAP or Pine.
   It notices that the mailbox is missing UIDVALIDITY, so it assigns a
   new UIDVALIDITY and writes the X-IMAPbase: or X-IMAP: header.

   -  Also Dovecot that's configured to not use index files behaves the
      same.

4. Dovecot accesses again the mailbox. UIDVALIDITY in the mbox file's
   header doesn't match the one in ``dovecot.index`` file. It logs an
   error and updates the UIDVALIDITY in the index file to the new one.

Crashes
-------

Dovecot's mbox code is a bit fragile because of the way it works.
However instead of just corrupting the mbox file, it usually
assert-crashes whenever it notices an inconsistency. You may see crashes
such as:

::

   Panic: mbox /home/user/mail/mailbox: seq=2 uid=45 uid_broken=0 originally needed 12 bytes, now needs 27 bytes

This is a bit difficult problem to fix. Usually this crash has been
related to Dovecot rewriting some headers that were broken. If you see
these crashes, it would really help if you were able to reproduce the
crash.

If you have such a mailbox which crashes every time when it's tried to
be opened, please put the mbox through `mbox
anonymizer <https://github.com/dovecot/tools/blob/main/mbox-anonymize.pl>`__ and send it,
the mailbox's ``dovecot.index`` and ``dovecot.index.log`` files to
dovecot@dovecot.org (see `<https://dovecot.org/mailman3/mailman3/lists/dovecot.dovecot.org/>`__. None of those files contain any actual message contents so
it's be safe to send them.

Avoiding crashes and errors
---------------------------

Since the problems usually have been related to broken headers, you
should be able to avoid them by filtering out all the Dovecot's internal
metadata headers. This is a good idea to do in any case. If you use
:ref:`Dovecot LDA <lda>` it does
this filtering automatically. Otherwise you could do this in your SMTP
server. The headers that you should filter out are:

-  Content-Length

-  Status

-  X-IMAP

-  X-IMAPbase

-  X-Keywords

-  X-Status

-  X-UID

-  X-UIDL (if you're using :dovecot_core:ref:`pop3_reuse_xuidl=yes <pop3_reuse_xuidl>`)
