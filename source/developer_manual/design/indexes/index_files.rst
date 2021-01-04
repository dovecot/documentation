.. _dovecot_index_files_2:

=====================
Dovecot's index files
=====================

The basic idea behind Dovecot's index files is that it makes reading the
mailboxes a lot faster. The index files consist of the following files:

-  ``dovecot.index``: Main index file

-  ``dovecot.index.cache``: Cached mailbox data

-  ``dovecot.index.log``: Transaction log file

-  ``dovecot.index.log.2``: .log file is rotated to .log.2 file when it
   grows too large.

-  ``dovecot.list.index*``: Mailbox list index files

Each mailbox has its own separate index files. If the index files are
disabled, the same structures are still kept in the memory, except cache
file is disabled completely (because the client probably won't fetch the
same data twice within a connection).

If index files are missing, Dovecot creates them automatically when the
mailbox is opened. If at any point creating a file or growing a file
gives "not enough disk space" error, the indexes are transparently moved
to memory for the rest of the session. This isn't done with mailbox
formats that rely on index files (e.g. dbox).

See :ref:`Indexes <dovecot_index_files>` for more technical
information how the index files are handled.

Main index
----------

The main index contains the following information for each message:

-  IMAP UID

-  Current flags and keywords

-  Pointer to cache file

-  mbox-only: mbox file offset

-  mbox-only: MD5 sum of some of the message headers, intended to help
   find the message when its X-UID: header hasn't yet been written

-  Other extensions in Dovecot v1.1+, such as mailbox sorting data

This is the same information that most other IMAP servers keep in memory
while the mailbox is open, but Dovecot has the advantage of keeping the
information permanently stored so it's easy to get it when opening the
mailbox.

The index file's header also contains some summary information, such as
how many messages exist, how many of them are unseen and how many are
marked with ``\Deleted`` flag. Opening mailboxes and answering to STATUS
IMAP commands can be usually done simply by getting the required
information from the index file's header. This is why these operations
are extremely fast with Dovecot compared to other servers that don't use
an equivalent index file.

Mailbox synchronization
~~~~~~~~~~~~~~~~~~~~~~~

The main index's header also contains mailbox syncing state:

-  Maildir: cur/ and new/ directories' timestamps

-  mbox: mbox file's mtime and size

The index file is synchronized against mailbox only if the syncing
information changes.

Cache file
----------

Cache file may contain the following information for messages:

-  Message headers (some, not all)

-  Sent date (parsed Date: header)

-  Received date (IMAP's INTERNALDATE field)

-  Physical and virtual message sizes

-  Message's parsed MIME structure, allowing to quickly read only a
   specific MIME part (IMAP's FETCH BODY[1.2.3] command)

-  IMAP's BODY and BODYSTRUCTURE fields

   -  If both are used, only BODYSTRUCTURE is saved, since BODY can be
      generated from it

-  IMAP's ENVELOPE isn't cached currently. Instead the headers used to
   build it are cached directly.

IMAP clients can work in many different ways. There are basically 2
types:

1. Online clients that ask for the same information multiple times (eg.
   webmails, Pine)

2. Offline clients that usually download first some of the interesting
   message headers and only after that the message bodies (possibly
   automatically, or possibly only when the user opens the mail). Most
   IMAP clients behave like this.

Cache file is extremely helpful with the type 1 clients. The first time
that client requests message headers or some other metadata they're
stored into the cache file. The second time they ask for the same
information Dovecot can now get it quickly from the cache file instead
of opening the message and parsing the headers.

For type 2 clients the cache file is helpful if they use multiple
clients or if the data was cached while the message was being saved
(Dovecot v1.1+ can do this). Some of the information is helpful in any
case, for example it's required to know the message's virtual size when
downloading the message. Without the virtual size being in cache Dovecot
first has to read the whole message to calculate it.

Only the mailbox metadata that client(s) have asked for earlier are
stored into cache file. This allows Dovecot to be adaptive to different
clients' needs and still not waste disk space (and cause extra disk
I/O!) for fields that client never needs.

Dovecot can cache fields either permanently or temporarily. Temporarily
cached fields are dropped from the cache file after about a week.
Dovecot uses two rules to determine when data should be cached
permanently instead of temporarily:

1. Client accessed messages in non-sequential order within this session.
   This most likely means it doesn't have a local cache.

2. Client accessed a message older than one week.

:ref:`Indexes/Cache <dovecot_cache>` explains the reasons for these rules.

Transaction log
---------------

All changes to the main index go through transaction log first. This has
two advantages when the mailbox is accessed using multiple simultaneous
connections:

1. It allows getting a list of changes quickly so that IMAP clients can
   be notified of the changes. An alternative would be to do a
   comparison of two index mappings, which is what most other IMAP
   servers do.

2. ``mmap_disable=yes`` implementation relies on the transaction log.
   Instead of re-reading the whole main index file after each change
   it's necessary to only read a few bytes from the transaction log.

In Dovecot v1.1+ the transaction log plays an even more important role.
The main index file is updated only "once in a while" to reduce disk
writes, so it is common to first read the main index and then apply new
changes from the transaction log on top of that. With empty mailboxes
(eg. download+delete POP3 users) it would even be possible to delete the
whole main index and keep only the transaction log (although this isn't
done currently).

List index
----------

Mailbox list index file is called dovecot.list.index[.log] and it
basically contains:

-  Header contains ID => name mapping. The name isn't the full mailbox
   name, but rather each hierarchy level has its own ID and name. For
   example a mailbox name "foo/bar" (with '/' as separator) would have
   separate IDs for "foo" and "bar" names.

-  The records contain { parent_uid, uid, name_id } field that can be
   used to build the whole mailbox tree. parent_uid=0 means root,
   otherwise it's the parent node's uid.

-  Each record also contains GUID for each selectable mailbox. If a
   mailbox is recreated using the same name, its GUID also changes. Note
   however that the UID doesn't change, because the UID refers to the
   mailbox name, not to the mailbox itself.

-  The records may contain also extensions for allowing
   mailbox_get_status() to return values directly from the mailbox list
   index.

-  Storage backends may also add their own extensions to figure out if a
   record is up to date.

Settings
--------

.. versionchanged:: v2.2.34
   Some of the previously hardcoded  optimization-related settings can be
   configured. It's not recommended  to change these settings without fully
   understanding the consequences.

-  :ref:`setting-mail_cache_unaccessed_field_drop`: Drop fields that haven't been
   accessed for n seconds.

-  :ref:`setting-mail_cache_record_max_size`: If cache record becomes larger than
   this, don't add it.

-  :ref:`setting-mail_cache_compress_min_size`: Never compress the file if it's
   smaller than this.

-  :ref:`setting-mail_cache_compress_delete_percentage`: Compress the file when n%
   of records are deleted (by count, not by size).

-  :ref:`setting-mail_cache_compress_continued_percentage`: Compress the file when
   n% of rows contain continued rows. For example 200% means that the
   record has 2 continued rows, i.e. it exists in 3 separate segments in
   the cache file.

-  :ref:`setting-mail_cache_compress_header_continue_count`: Compress the file when
   we need to follow more than n next_offsets to find the latest cache
   header.

-  :ref:`setting-mail_index_rewrite_min_log_bytes`,
   :ref:`setting-mail_index_rewrite_max_log_bytes`: Rewrite the index when the
   number of bytes that needs to be read from the .log on refresh is
   between these min/max values.

-  :ref:`setting-mail_index_log_rotate_min_size`,
   :ref:`setting-mail_index_log_rotate_max_size`,
   :ref:`setting-mail_index_log_rotate_min_age`: Rotate transaction log after it's
   a) min_size or larger and it was created at least min_age_secs or b)
   larger than max_size.

-  :ref:`setting-mail_index_log2_max_age`: Delete .log.2 when it's older than
   log2_stale_secs. Don't be too eager, because older files are useful
   for QRESYNC and dsync.
