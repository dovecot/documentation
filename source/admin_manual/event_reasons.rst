.. _event_reasons:

=============
Event Reasons
=============

.. versionadded:: v2.3.18

List of "reason_code" values that used by :ref:`events <list_of_events>`.
The reason codes are always in <module>:<name> format.

Storage
-------

 * ``storage:autoexpunge`` - Mails are being autoexpunged
 * ``storage:mailbox_list_rebuild`` - Mailbox list index is being rebuilt
 * ``mdbox:rebuild`` - mdbox storage is being rebuilt

Mailbox
-------

 * ``mailbox:create`` - Mailbox is being created
 * ``mailbox:update`` - Mailbox metadata is being updated (e.g. ``doveadm mailbox update``)
 * ``mailbox:rename`` - Mailbox is being renamed
 * ``mailbox:delete`` - Mailbox is being deleted
 * ``mailbox:subscribe`` - Mailbox is being subscribed
 * ``mailbox:unsubscribe`` - Mailbox is being unsubscribed
 * ``mailbox:search`` - Mails are being accessed due to search query
 * ``mailbox:sort`` - Mails are being sorted (IMAP SORT)
 * ``mailbox:thread`` - Threading is being built for mails (IMAP THREAD)
 * ``mailbox:vsize`` - mailbox vsize is requested or updated

Mail
----

These events are sent only when they cause a mail body to be opened (not when
they are read from cache):

 * ``mail:snippet`` - Message snippet / IMAP PREVIEW
   The other reasons may give further details why.
 * ``mail:header_fields`` - A specified list of headers.
   These are normally expected to be returned from cache.
 * ``mail:attachment_keywords`` - ``$HasAttachment`` or ``$HasNoAttachment`` keyword is being generated.
 * ``mail:mime_parts`` - MIME part structure
 * ``mail:date`` - Date header
 * ``mail:imap_envelope`` - IMAP ENVELOPE
 * ``mail:imap_bodystructure`` - IMAP BODY / BODYSTRUCTURE

imap
----

 * ``imap:notify_update`` - The active NOTIFY command is sending updates to client
 * ``imap:unhibernate`` - IMAP client is being unhibernated
 * ``imap:cmd_<name>`` - IMAP command is being run
 * ``imap:fetch_body`` - A part of the message body is explicitly being fetched.
   If set, any other imap:fetch_* reasons aren't set since this alone is a
   reason for opening the mail.
 * ``imap:fetch_header`` - The full header (except maybe some listed headers) are
   being fetched. If set, any other imap:fetch_* reasons aren't set since this
   alone is a reason for opening the mail.
 * ``imap:fetch_header_fields`` - Specific header fields are being fetched.
   These should normally come from cache.
 * ``imap:fetch_bodystructure`` - IMAP BODY or BODYSTRUCTURE is being fetched.
   These should normally come from cache.
 * ``imap:fetch_size`` - RFC822.SIZE is being fetched. This should normally come
   from cache.

pop3
----

 * ``pop3:initialize`` - POP3 mailbox is being opened
 * ``pop3:cmd_<command name>`` - POP3 command is being run

doveadm
-------

 * ``doveadm:cmd_<name>`` - doveadm command is being run

lmtp
----

 * ``lmtp:cmd_mail`` - MAIL command is being run
 * ``lmtp:cmd_rcpt`` - RCPT command is being run
 * ``lmtp:cmd_data`` - DATA command is being run

submission
----------

 * ``submission:cmd_mail`` - MAIL command is being run
 * ``submission:cmd_rcpt`` - RCPT command is being run
 * ``submission:cmd_data`` - DATA command is being run

indexer
-------

 * ``indexer:index_mailbox`` - Mailbox is being indexed

obox
----

 * ``metacache_worker:cmd_<name>`` - metacache-worker is running a command
 * ``obox:mailbox_rescan`` - Mailbox is being rescanned when opening
 * ``obox:mailbox_rebuild`` - Mailbox index is being rebuilt when opening
 * ``obox:mailbox_uids_non_reproducible`` - Mailbox index bundle is being uploaded to make sure UIDs don't change unexpectedly.
 * ``metacache:upload_important`` - Important metacache changes are being uploaded
 * ``metacache:upload_all`` - All metacache changes are being uploaded
 * ``metacache:upload_root`` - User's root metacache is being uploaded
 * ``metacache:upload_mailbox`` - Mailbox's metacache is being uploaded
 * ``metacache:flush_all_changed`` - All the changes in metacache are being uploaded due to ``doveadm metacache flushall``
 * ``metacache:flush_all_important`` - All the important changes in metacache are being uploaded due to ``doveadm metacache flushall -i``
 * ``metacache:flush_bg_important`` - Important changes for a user in metacache are being uploaded due to background uploader.
 * ``obox:mail_metadata_fill`` - Filling metadata after mail stream was read.
   This shouldn't cause any additional IO.
 * ``obox:mail_metadata_<name>`` - Mail metadata with specified name requested.

Other plugins
-------------

 * ``virtual:config_read`` - virtual plugin mailbox configuration is being read.
   This may cause mailbox metadata to be accessed.
 * ``trash:clean`` - trash plugin cleaning space
 * ``quota:count`` - quota plugin is counting the mailbox's full size.
   This is normal with quota=count driver. Also quota=dict uses it for the
   initial mailbox calculation.
 * ``quota:recalculate`` - Quota is being recalculated (e.g. doveadm quota recalc)
 * ``pop3_migration:uidl_sync`` - pop3_migration plugin matching IMAP and POP3 mails.
 * ``lazy_expunge:expunge`` - lazy_expunge plugin is handling an expunge.
   Use for checking the refcount and for actually doing the lazy_expunge move.
 * ``fts:lookup`` - Searching is accessing full text search index.
 * ``fts:index`` - Message is being added to the full text search index.
   Note that this reason won't be used for email opening events, because the
   emails are already opened by the indexer precache searching code. So usually
   the indexer:index_mailbox reason is what is wanted to be used.
