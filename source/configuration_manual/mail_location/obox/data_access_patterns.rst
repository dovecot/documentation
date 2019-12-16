.. _data_access_patterns:

===========================
Data Access Patterns
===========================

Below is a list of operations that dictmap does for accessing data. 

.. role:: red

.. role:: blue

:red:`RED = Cassandra operations`

:blue:`BLUE = Object storage operations`

* Refreshing user root index

   * Frequency: very often – nearly every time a user logs in or a mail is delivered
   * :red:`Lookup object names from user_index_objects for the given username.`
   * :red:`Lookup object names from user_index_diff_objects for the given username.`
   * :blue:`Download any missing index bundle objects`


* Refreshing folder index

   *  Frequency: somewhat often

       * This lookup is usually done only when saving the index to local cache for the first time. Afterwards it's not done unless the user's cache becomes invalidated (user modified by another backend or the folder cache deleted).

   * :red:`Lookup object names from user_mailbox_index_objects for the given (username, folder GUID).`
   * :red:`Lookup object names from user_mailbox_index_diff_objects for the given (username, folder GUID).`
   * :red:`Lookup max_bucket from user_mailbox_buckets for the given (username, folder GUID)`
   * :red:`Lookup object names from user_mailbox_objects for the given (username, folder GUID, 0..max_bucket). This is necessary for finding any newly delivered emails since the last folder index upload.`
   * :blue:`Download any missing index bundle objects`

* Writing user root self/diff index

   * Frequency: not often

       * The first time this backend modifies the user's mailbox in any way.
       * Whenever user's folders are created/renamed/deleted.

   * :red:`Insert to user_index_diff_objects (which overwrites the existing row)`
   * :blue:`Upload new index bundle object`
   * :blue:`Delete old index bundle objects`

* Writing user root base index

   * Frequency: rarely

     * Normally self/diff index is updated; only after there have been a lot of changes a new base index is created.

   * :red:`Insert to user_index_objects`
   * :red:`Delete from user_index_objects by (user, object name)`
   * :blue:`Upload new index bundle object`
   * :blue:`Delete old index bundle objects`

* Writing folder diff/self index

   * Frequency: often

       * Every 10th mail delivery
       * Every 5 minutes after IMAP client has changed the folder (flag changes, deletions)

   * :red:`Insert to user_mailbox_index_diff_objects (which overwrites the existing row)`
   * :blue:`Upload new index bundle object`
   * :blue:`Delete old index bundle objects`

* Writing folder base index

   * Frequency: not very often

     * Normally self/diff index is updated; only after there have been a lot of changes a new base index is created.

   * :red:`Insert to user_mailbox_index_objects`
   * :red:`Delete from user_mailbox_index_objects by (user, folder GUID, object name)`
   * :blue:`Upload new index bundle object`
   * :blue:`Delete old index bundle objects`

* Delivering a new email via LMTP, or saving a new email via IMAP APPEND

   * Frequency: Write folder index (as described above) for every 10th mail delivery (default)
   * :red:`Insert to user_mailbox_objects`
   * :blue:`Upload new email object`

* Reading email

   * Usually no lookup, because object ID is stored also in Dovecot indexes
   * :blue:`Download email object (unless it's already in fscache)`

* Deleting email

   * :red:`Lookup object ID from user_mailbox_objects_reverse to get list of (user, folder, object name). Dovecot only cares if the result is empty or non-empty.`
   * :red:`Delete from user_mailbox_objects (user, folder, object name) and user_mailbox_objects_reverse (object ID)`
   * Folder index is written lazily within the next 5 minutes
   * :blue:`Delete email object`

* Copying email

   * :red:`Lookup object ID from user_mailbox_objects_reverse to get list of (user, folder, object name). Dovecot only cares if the result is empty or non-empty.`
   * Write folder index (as described above) for every 10th mail delivery (default)

* Moving email

  *  This is identical to a combination of copying and then deleting the email.

* Running "doveadm force-resync"

   * Frequency: Rarely, and always a manual operation
   * Refresh user & folder indexes as described above.
   * :red:`Lookup folder GUIDs from user_mailbox_index_diff_objects for the specified user to find any missing folders. With Cassandra this returns several duplicates (one per each index object in folder), which are de-duplicated internally.`
