.. _mbox_child_folders:

================================
Mbox Child Folders Configuration
================================

Under :ref:`mbox <mbox_mbox_format>`, it is not normally possible to have a
mail folder which contains both messages and sub-folders. This is because
there would be a filesystem name collision between the name of the mbox file
containing the messages and the name of the directory containing the
sub-folders. For example:

* Mail folder "foo" containing messages would be stored in a file at
  ``~/mail/foo``.
* Mail folder "foo/bar" containing messages would be stored in a file at
  ``~/mail/foo/bar``, but this cannot happen because this relies on the
  existence of a directory ``~/mail/foo/`` which can't exist because there is
  already a file with that name.

Under mbox, Dovecot normally stores mail folders in "filesystem" layout. In
this layout, mail folders are stored in mbox files (potentially under
subdirectories) with the same relative path as the mail folder path. For
example:

================== =============================================================
File               Description
================== =============================================================
``~/mail/foo``     mbox file containing mail for mail folder "foo"; cannot
                   create any mail sub-folders of "foo"
``~/mail/bar/baz`` mbox file containing mail for mail folder "bar/baz"; cannot
                   create any mail sub-folders of "bar/baz"
``~/mail/inbox``   mbox file containing mail for INBOX
================== =============================================================

If there is a requirement to be able to have a mail folder which contains both
messages and sub-folders, then there are two ways to do it:

1. Maildir++ layout
2. Messages in named file

These approaches are described in more detail below.

Maildir++ Layout
^^^^^^^^^^^^^^^^

Dovecot can be configured to keep mbox mail in a Maildir++-like
layout. This makes Dovecot keep mail in mbox files where all the mailbox
folder naming levels are separated with dots (with a leading dot). For
example:

=================== ============================================================
File                Description
=================== ============================================================
``~/mail/.foo``     mbox file containing mail for mail folder "foo"
``~/mail/.foo.bar`` mbox file containing mail for mail folder "foo/bar".
                    We can now do this.
``~/mail/.bar.baz`` mbox file containing mail for mail folder "bar/baz"
``~/mail/inbox``    mbox file containing mail for INBOX
=================== ============================================================

This can be enabled by adding ``:LAYOUT=maildir++`` to the mail location:

.. code-block:: none

  # Incomplete example. Do not use!
  mail_location = mbox:~/mail:LAYOUT=maildir++

However, there is a problem. Under mbox, setting ``LAYOUT=maildir++`` alone
leaves Dovecot unable to place index files, which would likely result in
performance issues. So when using ``LAYOUT=maildir++` with mbox, it is
advisable to also configure ``INDEX``. Now, mail files (other than INBOX) all
have names beginning with a dot, so if we like we can store other things in
the ``~/mail`` directory by using names which do not begin with a dot. So we
could think to use ``INDEX`` to store indexes at ``~/mail/index/``. Example:

.. code-block:: none

  # Incomplete example. Do not use!
  mail_location = mbox:~/mail:LAYOUT=maildir++:INDEX=~/mail/index

If we do this, then indexes will be kept at ``~/mail/index/`` and this will
not clash with any names used for mail folders. There is one more thing we
may want to consider though. By default Dovecot will maintain a list of
subscribed folders in a file ``.subscriptions`` under the mail location root.
In this case that means it would end up at ``~/mail/.subscriptions``. This
would then mean that it would be impossible to create a mail folder called
"subscriptions". We can get around this by using the ``CONTROL`` parameter to
move the ``.subscriptions`` file somewhere else, for example into the
directory ``~/mail/control`` (again, choosing a name which doesn't begin with
a dot so we don't collide with the names of mbox files storing mail folders).
That gives us:

.. code-block:: none

  # Trick mbox configuration which allows a mail folder which contains both
  # messages and sub-folders
  mail_location = mbox:~/mail:LAYOUT=maildir++:INDEX=~/mail/index:CONTROL=~/mail/control

This then allows mail folders which contains both messages and sub-folders
without possibility of naming collisions between mail folders and other data.

There is one further wrinkle. Specifying ``:LAYOUT=maildir++`` for mbox
changes the default hierarchy separator from a slash to a dot. This should
not be a problem for IMAP clients as the hierarchy separator is exposed
through IMAP. However anything which expects to just "know" that the
hierarchy separator is a slash may get confused. This can be worked around by
configuring :ref:`namespaces` to set the folder separator back to a slash.

Messages in Named File
^^^^^^^^^^^^^^^^^^^^^^

In the default "filesystem" example from above, we can't create any
sub-folders of "foo" because there is a file - ``foo`` - in the way. So we
could think to get rid of that file and put a directory there instead. But if
we do that then we need somewhere to put the messages for folder "foo". We
could think to put them in a specially-named file in the directory: ``foo/``.
Then if we wanted to create a sub-folder of "foo" we would be fine because we
could then do that. The rule would then be that messages go into the
specially-named file in the directory corresponding to the mail folder name.
We want want to choose a special name which would be unlikely to collide with
a folder name. We could think to use something like ``mBoX-MeSsAgEs``. Now,
it turns out that you can configure Dovecot to do this using the ``DIRNAME``
parameter:

.. code-block:: none

  # Incomplete example. Do not use!
  mail_location = mbox:~/mail:DIRNAME=mBoX-MeSsAgEs

With that config, we would get a layout like this:

================================ ===============================================
File                             Description
================================ ===============================================
``~/mail/inbox``                 mbox file containing mail for INBOX
``~/mail/foo/mBoX-MeSsAgEs``     mbox file containing mail for mail folder
                                 "foo"
``~/mail/foo/bar/mBoX-MeSsAgEs`` mbox file containing mail for mail folder
                                 "foo/bar"
================================ ===============================================

However there is a problem. Under mbox, setting ``DIRNAME`` alone leaves
Dovecot unable to place index files, which would likely result in performance
issues, or worse, if the index directory gets created first, this will
obstruct the creation of the mbox file. So when using ``DIRNAME`` with mbox,
it is also necessary to configure ``INDEX``. The question then arises where
to put index files.

Any directory under the ``~/mail`` directory could be considered as a mail
folder. We could think to use a name beginning with a dot, for example
``~/mail/.index`` but that would then mean that it would not be possible to
create a mail folder called ".index"; unlikely, but it would be nice to have
as few implementation-specific restrictions as possible.

In addition, by default, Dovecot will create a file ``.subscriptions`` at the
mail location root to hold a list of mailbox subscriptions. This would make it
impossible to create a mail folder called ".subscriptions". But we can move
the ``.subscriptions`` file to another directory by using the ``CONTROL``
parameter. To get around these issues, we can add another directory layer
which separates these purposes. For example:

.. code-block:: none

  # Trick mbox configuration which allows a mail folder which contains both
  # messages and sub-folders
  mail_location = mbox:~/mail/mailboxes:DIRNAME=mBoX-MeSsAgEs:INDEX=~/mail/index:CONTROL=~/mail/control

would result in the following layout:

========================================== =====================================
File                                       Description
========================================== =====================================
``~/mail/mailboxes/foo/mBoX-MeSsAgEs``     mbox file containing messages for
                                           mail folder "foo"
``~/mail/mailboxes/foo/bar/mBoX-MeSsAgEs`` mbox file containing messages for
                                           mail folder "foo/bar"
``~/mail/mailboxes/inbox``                 mbox file containing messages for
                                           INBOX
``~/mail/control/.subscriptions``          File containing list of subscribed
                                           mailboxes
``~/mail/index/INBOX/dovecot.index.*``     Index files for INBOX
``~/mail/index/foo/dovecot.index.*``       Index files for mail folder "foo"
``~/mail/index/foo/bar/dovecot.index.*``   Index files for mail folder
                                           "foo/bar"
``~/mail/index/dovecot.mailbox.log``       Other index files
========================================== =====================================

Restrictions on mail folder names are then minimised; we can't have mail
folders with the names "mBoX-MeSsAgEs", "dovecot.index.*, or
"dovecot.mailbox.log".

Unlike the Maildir++ layout approach above, because we are still using
"filesystem" layout, the hierarchy separator remains as a slash.
