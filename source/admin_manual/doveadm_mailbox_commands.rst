.. _doveadm_mailbox_commands:

=========================
Doveadm Mailbox Commands
=========================

These commands should be run on one of the Dovecot directors. The director is then responsible for forwarding the command to be run in the correct backend. This guarantees that two backend servers don't attempt to modify the same user's mailbox at the same time (which might cause problems).

.. versionchanged:: v3.0.0;v2.4.0

  All mail commands require providing ``-u``, ``-F`` or ``-A`` parameter. ``USER`` environment variable is no longer supported.
  This will always be subject to user database lookup and requires access to auth userdb socket.

* doveadm fetch: Fetch mail contents or metadata.

    * doveadm search does the same as doveadm fetch 'mailbox-guid uid'. It's useful for quick checks where you don't want to write the full fetch command.

* doveadm copy & move to another folder, potentially to another user.

* doveadm deduplicate: Deduplicate mails either by their GUID or by Message-Id: header.

* doveadm expunge: Expunge mails (without moving to Trash).

* doveadm flags add/remove/replace: Update IMAP flags for a mail

* doveadm force-resync: Try to fix a broken mailbox (or verify that all is ok)

* doveadm index: Index any mails that aren't indexed yet. Mainly useful if full text search indexing is enabled.

* doveadm mailbox list: List user's folders.

* doveadm mailbox create/delete/rename: Modify folders.

* doveadm mailbox subscribe/unsubscribe: Modify IMAP folder subscriptions.

* doveadm mailbox status: Quickly lookup folder metadata (# of mails, # of unseen mails, etc)

More doveadm commands as well as information about the doveadm http api is here:  Doveadm HTTP API

The man-pages also contain good descriptions of doveadm commands. Man-pages can be accessed online at e.g. https://wiki.dovecot.org/Tools/Doveadm
