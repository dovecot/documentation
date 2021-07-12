.. _sharing_with_symlinks:

=============================
Mailbox sharing with symlinks
=============================

It's possible to share mailboxes simply by symlinking them among user's
private mailboxes. See :ref:`admin_manual_permissions_in_shared_mailboxes`
for issues related to filesystem permissions.

Maildir
-------

::

   ln -s /home/user2/Maildir/.Work /home/user1/Maildir/.shared.user2
   ln -s /home/user3/Maildir/.Work /home/user1/Maildir/.shared.user3

Now user1 has a "shared" directory containing "user2" and "user3" child
mailboxes, which point to those users' "Work" mailbox.

With Maildir++ layout it's not possible to automatically share "mailbox
and its children". You'll need to symlink each mailbox separately. With
the "fs" layout this is possible though.

mbox
----

Doing the same as in the above Maildir example:

::

   mkdir /home/user1/mail/shared
   ln -s /home/user2/mail/Work /home/user1/mail/shared/user2
   ln -s /home/user3/mail/Work /home/user1/mail/shared/user3

One additional problem with mbox format is the creation of dotlock
files. The dotlocks would be created under user1's directory, which
makes them useless. Make sure the locking works properly with only fcntl
or flock locking (See :ref:`mbox_locking`) and just disable dotlocks.
Alternatively instead of symlinking an mbox
file, put the shared mailboxes inside a directory and symlink the entire
directory.
