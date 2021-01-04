.. _lib-storage_mailbox_list:

============
Mailbox List
============

``src/lib-storage/mailbox-list.h`` and ``mailbox-list-private.h``
describes mailbox list. The purpose of mailbox list is to manage mailbox
storage name <-> physical directory path mapping. Its most important
functions are:

-  listing existing mailboxes,

-  creating directories for new mailboxes (but not the mailboxes
   themselves, that's storage's job),

-  deleting mailboxes,

-  renaming mailboxes and

-  managing mailbox subscriptions.

Mailbox list code also internally creates and updates mailbox changelog
(in ``dovecot.mailbox.log`` file), which keeps track of mailbox
deletions, renames and subscription changes. This is primarily useful
for dsync utility.

Mailbox list is configured by
:ref:`mail_location <mail_location_settings>` setting, which fills ``struct mailbox_list_settings``:

-  root_dir: The root mail directory (e.g. with
   ``mail_location=maildir:~/Maildir`` it would be the ``~/Maildir``).

-  index_dir: Directory under which index files are written to. Empty
   string means in-memory indexes. Defaults to root_dir.

-  control_dir: Directory under which control files are written to.
   Control files are files that contain some important metadata
   information about mailbox so (unlike index files) they should never
   be deleted. For example subscriptions file is a control file.
   Defaults to root_dir.

-  alt_dir: This is currently
   `dbox <https://wiki.dovecot.org/MailboxFormat/dbox#>`__-specific
   setting.

-  inbox_path: Path to INBOX mailbox. This exists mainly because with
   mbox format INBOX is often in a different location than other
   mailboxes.

-  subscription_fname: Filename used by subscriptions file.

-  dir_guid_fname: Filename used to store directories' (not mailboxes')
   global UIDs. Directory GUIDs are mainly useful for dsync.

-  maildir_name: Directory name under which the actual mailboxes are
   stored in, such as dbox-Mails/ with dbox. See the .h file for more
   detailed description.

-  mailbox_dir_name: If non-empty, store all mailboxes under
   root_dir/mailbox_dir_name/.

Listing mailboxes
-----------------

First the list operation is initialized with one of the init functions:

-  ``mailbox_list_iter_init()`` lists mailboxes that match the given
   pattern.

-  ``mailbox_list_iter_init_multiple()`` lists mailboxes that match any
   of the given patterns list.

-  ``mailbox_list_iter_init_namespaces()`` lists matching mailboxes from
   all namespaces.

   -  ``MAILBOX_LIST_ITER_SKIP_ALIASES`` flag skips namespaces that have
      ``alias_for`` set. You usually want to set this flag to avoid
      processing the same mailbox multiple times.

The patterns are IMAP-style patterns with '%' and '*' wildcards as
described by RFC 3501: '%' matches only up to next hierarchy separator,
while '*' matches the rest of the string.

These flags control what mailboxes are returned:

-  ``MAILBOX_LIST_ITER_NO_AUTO_INBOX`` doesn't list INBOX unless it
   physically exists. Normally INBOX is listed, because INBOX doesn't
   need to be (and cannot be) explicitly created. It can always be
   opened and messages can be saved to it, it's just automatically
   created when it doesn't exist.

-  ``MAILBOX_LIST_ITER_SELECT_SUBSCRIBED`` lists only subscribed
   mailboxes.

-  ``MAILBOX_LIST_ITER_SELECT_RECURSIVEMATCH`` is currently only useful
   when combined with ``_SELECT_SUBSCRIBED`` flag. Then it adds
   ``MAILBOX_CHILD_SUBSCRIBED`` flags for mailboxes whose children are
   subscribed. It also lists mailboxes that aren't themselves
   subscribed, but have children that do.

These flags control what is returned for matching mailboxes:

-  ``MAILBOX_LIST_ITER_RETURN_NO_FLAGS`` can be set when you don't care
   about mailbox flags. They're then set only if it can be done without
   any additional disk I/O.

-  ``MAILBOX_LIST_ITER_RETURN_SUBSCRIBED`` returns mailbox's
   subscription state.

-  ``MAILBOX_LIST_ITER_RETURN_CHILDREN`` sets "has child mailboxes" or
   "doesn't have child mailboxes" flag.

Other flags:

-  ``MAILBOX_LIST_ITER_RAW_LIST`` should usually be avoided. It ignores
   ACLs and just returns everything.

-  ``MAILBOX_LIST_ITER_VIRTUAL_NAMES`` enables listing to use virtual
   names instead of storage names in patterns and returned mailbox
   names.

Once listing is initialized, ``mailbox_list_iter_next()`` can be called
until it returns NULL. The returned mailbox_info struct contains:

-  ``name``: Mailbox's name, either virtual or storage name depending on
   ``_VIRTUAL_NAMES`` flag.

-  ``ns``: Mailbox's namespace. This is useful only when mailboxes are
   listed using ``mailbox_list_iter_init_namespaces()``.

-  ``flags``: Mailbox flags:

   -  ``MAILBOX_NOSELECT``: Mailbox exists, but can't be selected. It's
      possible that it can be created and then it becomes selectable.
      For example with mbox and FS layout the directories aren't
      selectable mailboxes.

   -  ``MAILBOX_NONEXISTENT``: Mailbox doesn't exist. It's listed only
      because it has child mailboxes that do exist but don't match the
      pattern.

      -  Example: "foo/bar" exists, but "foo" doesn't. "%", "foo" or
         "*o" pattern would list "foo", because it matches the pattern
         but its child doesn't. Then again "*", "*bar" or "%/%" wouldn't
         list "foo", because "foo/bar" matches the pattern (and is also
         listed). Something like "*asd*" wouldn't match either "foo" or
         "foo/bar" so neither is returned.

   -  ``MAILBOX_CHILDREN`` and ``MAILBOX_NOCHILDREN``: Mailbox has or
      doesn't have children. If neither of these flags are set, it's not
      known if mailbox has children.

   -  ``MAILBOX_NOINFERIORS``: Mailbox doesn't have children and none
      can ever be created. For example with mbox and FS layout the
      mailboxes have this flag set, because files can't be created under
      files.

   -  ``MAILBOX_MARKED`` and ``MAILBOX_UNMARKED``: Mailbox has or
      doesn't have messages with \\Recent flags. If neither is set, the
      state is unknown. Because this check is done in a very cheap way,
      having ``MAILBOX_MARKED`` doesn't always mean that there are
      \\Recent flags. However, if ``MAILBOX_UNMARKED`` is returned it is
      guaranteed to be correct. (False positives are ok, false negatives
      are not ok.)

   -  ``MAILBOX_SUBSCRIBED``: Mailbox is subscribed.

   -  ``MAILBOX_CHILD_SUBSCRIBED``: Mailbox has a child that is
      subscribed (and ``_SELECT_RECURSIVEMATCH`` flag was set).

Finally the listing is deinitalized with ``mailbox_list_iter_deinit()``.
If it returns -1, it means that some mailboxes perhaps weren't listed
due to some internal error.

If you wish to get mailbox_info flags only for a single mailbox, you can
use ``mailbox_list_mailbox()``.

Directory permissions
---------------------

``mailbox_list_get_permissions()`` and
``mailbox_list_get_dir_permissions()`` can be used to get wanted
permissions for newly created files and directories.

-  For global files, give NULL as the mailbox name. The permissions are
   then based on the root_dir. If root_dir doesn't exist, it returns
   0700/0600 mode.

-  For per-mailbox files, give the mailbox name. The permissions are
   then based on the mailbox's directory.

The returned permissions are:

-  mode: Creation mode, like 0600.

-  gid: Group that should be set, unless it's ``(gid_t)-1``. There are 3
   reasons why it could be that:

   -  directory has g+s bit set, so the wanted group is set
      automatically

   -  group is the same as process's effective GID, so it gets set
      automatically

   -  mode's group permissions are the same as world permissions, so
      group doesn't matter.

-  gid_origin: This string points to the directory where the group (and
   permissions in general) was based on, or "defaults" for internal
   defaults.

If changing the group fails with EPERM, ``eperm_error_get_chgrp()`` can
be used to log a nice and understandable error message.
