---
layout: doc
title: Mail User
---

# Mail User

`src/lib-storage/mail-user.h` describes mail user. The struct contains
all kinds of useful information about the user that can be accessed
directly. Some of the most useful things you can do with a user are:

- `user->username` gives you the actual username string (e.g.
  `user@domain.org`).

- `user->set` gives you access to user's settings.

- `user->namespaces` points to a linked list of user's namespaces.

- `mail_user_get_home()` returns user's home directory, if there's
   one.

- `mail_user_home_expand()` expands `~/` at the beginning of given
   path to user's actual home directory.

- `mail_user_plugin_getenv()` returns value for a setting defined in
  `plugin {}` section.

Typically each new IMAP/POP3/etc. connection creates a single mail user.
If the same process handles multiple connections for the same user, they
don't share the same mail_user (especially since each mail_user has a
unique session ID).

If a user has shared mailboxes from other users (not public namespaces),
a mail user is also created whenever necessary to list/access the user's
mailboxes. Again there is no attempt to share the created mail user with
other connections.
