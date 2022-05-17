.. _errors_chgrp_no_perm:

====================================
Change Group Operation Not Permitted
====================================

.. code-block:: none

   imap(user): Error: chown(/home/user/mail/.imap/INBOX, group=12(mail)) failed: Operation not permitted (egid=1000(user), group based on /var/mail/user - see https://doc.dovecot.org/admin_manual/errors/chgrp_no_perm/)

This means that Dovecot tried to copy ``/var/mail/user`` file's group (mail) to
the index file directory it was creating (``/home/user/mail/.imap/INBOX``), but
the process didn't belong to the mail group, so it failed. This is important
for preserving access permissions with :ref:`shared_mailboxes`. Group copying
is done only when it actually changes the access permissions; for example with
0600 or 0666 mode the group doesn't matter at all, but with 0660 or 0640 it
does.

To solve this problem you can do only one of two things:

1. If the group doesn't actually matter, change the permissions so that
   the group isn't copied (e.g. ``chmod 0600 /var/mail/*``, see
   :ref:`Mbox Mailbox Format <mbox_mbox_format>`).

2. Give the mail process access to the group (e.g. ``mail_access_groups=mail``
   setting). However, this is dangerous. `It allows users with shell access to
   read other users' INBOXes
   <http://dovecot.org/list/dovecot-news/2008-March/000060.html>`_.
