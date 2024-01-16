.. _fts_backend_dovecot:

Dovecot Pro FTS Engine
======================

.. important:: The Dovecot Pro FTS driver is a part of
               :ref:`ox_dovecot_pro` only.

The Dovecot FTS indexes are created and queried by a custom (Dovecot Pro) FTS
engine. The FTS engine component is loaded into the Dovecot FTS plugin as an
index backend and it processes text input from the FTS tokenizer and filter
chains and search queries constructed by the FTS plugin.

Settings
^^^^^^^^

See :ref:`plugin-fts-dovecot` for setting information.

The :dovecot_plugin:ref:`fts_dovecot` setting defines the location for the
fts indexes.

See :ref:`plugin-fts` for generic FTS settings.

.. _fts_dovecot_consistency_check:

Consistency Checking
^^^^^^^^^^^^^^^^^^^^

.. dovecotadded:: 2.3.21

The FTS indexes can sometimes become out-of-sync with the actual mailbox. Some
messages could be missing and some could be leaked. In theory it should not be
possible to have missing mails in FTS, but there still seem to be some bugs
left. Leaked messages (i.e. already deleted messages that still appear in FTS)
are possible in case of unexpected crashes or storage errors.

The consistency of FTS indexes can be checked using ``doveadm fts check fast``
and ``doveadm fts check full`` commands. These are intended to be run in e.g.
nightly batch jobs. The "fast" check is expected to be run nightly for all the
users in local metacache, since it doesn't access object storage. However, it
might not always have all the information for giving a reliable answer whether
the FTS indexes are synced or not, in which case some of the numbers may be
either "?" or "123?". There is a ``--refresh`` parameter, which can be used to
do the necessary object storage accesses to give reliable results. However, at
that point it might be better to just run a "full" check instead.

After all backends in the cluster have been upgraded to the new Dovecot
version, the :dovecot_plugin:ref:`fts_dovecot_message_count_stats` setting
should be enabled. This allows per-folder results for the "fast" scan, which 
makes the scan more reliable and more detailed. After the setting is enabled,
all the triplets in fts.S files still need to be refreshed for the per-folder
result to work. This happens for newly written triplets automatically, but
eventually it is necessary to use the ``--refresh`` parameter (or some other
method) to add the missing information for older triplets.

When these checks are run nightly, it's possible to find out quickly when
something breaks. This means it's possible to fix the FTS indexes before users
notice that search isn't finding some messages. It also makes it easier for
Dovecot developers to find and fix any remaining FTS bugs, because we can be
sure that the bug happened within the last 24 hours and all the logs are still
available during that time.

The idea for the nightly script is to:

 * Each backend runs ``doveadm fts check fast`` for all users that have recently
   been accessed in the metacache.
 * Sort the results so that users with the most missing messages are processed
   first.

    * Eventually also process users that don't have enough information locally,
      so they aren't skipped forever.

 * Start running ``doveadm fts check full`` for users to find exactly what
   differences there really are.
 * Run ``doveadm fts rescan`` followed by ``doveadm index`` to reindex users
   that have missing mails. This unfortunately for now requires reindexing
   all of the messages for the user.
 * If the full check revealed that the differences weren't actually due to
   missing messages, but for some other reason, store this information in a
   tracking database so the user can be skipped. Although once all the users
   with missing messages have been reindexed, the rest of the inconsistencies
   would be good to fix as well.

``doveadm fts check fast`` fields:

autoindex
    "yes" or "no" depending on whether the mailbox matches
    :dovecot_plugin:ref:`fts_autoindex` settings.
mailbox uidnext
    The expected UID for the next message that is saved to the mailbox.
    This can be compared against the "fts highest uid"+1.
fts highest uid
    The highest UID in the mailbox that has been FTS indexed.
mailbox total count
    Total number of messages in the mailbox, also including messages that
    haven't even been attempted to be FTS indexed.
expected fts count
    Expected number of messages in FTS index, based on "fts highest uid" and
    the current mailbox state.
fts count
    Actual number of messages in FTS index.
fts expunges
    Number of messages marked as expunged in the fts.X file, but not yet purged
    from the FTS triplets. This is already included in the calculation to
    produce the "fts count" field, so it's only for informative/debugging
    purposes.

``doveadm fts check full`` states:

synced
    Message exists in both mailbox and in FTS.
synced_expunged
    Message doesn't exist in mailbox, but it's correctly marked as expunged in FTS (but not yet purged out of the triplets).
missing
    Message exists in mailbox, but is missing from FTS. It needs to be reindexed.
unexpunged
    Message exists in mailbox, but it was already marked as expunged in FTS, although it's not yet purged from triplets. This isn't supposed to happen.
missing_unexpunged
    Message exists in mailbox, but it was already marked as expunged in FTS and already purged from triplets. This really isn't supposed to happen.
leaked
    Message doesn't exist in mailbox, but it exists in FTS. The same message may be leaked multiple times in different triplets (they are not counted as "duplicate").
expunge_leaked
    Message doesn't exist in mailbox or triplets, but it is marked as expunged in FTS. The messages were never removed from the fts.X file. There were various bugs that caused this to happen.
duplicate
    Message exists in mailbox, and multiple times in FTS. The first time is counted as "synced", "synced_expunged" or "unexpunged" while the other instances are "duplicate".

See :man:`doveadm-fts(1)` for detailed list of parameters and command exit codes.

Data Storage Engine
^^^^^^^^^^^^^^^^^^^

Each account's mail is indexed into a small set of control files, and one or
more triplets of files.

The control files are:

 * S - the 'Stats' cache - contains information about all of the triplets
 * X - the 'eXpunge' file - a list of mails to be expunged
 * Y - the 'expunged' file - a list of mails that have been expunged

Both X and Y grow by being appended to. When Y grows to sufficient size to
indicate that the X file contains old stuff, the contents of Y will be
subtracted from X, and Y will be deleted. This is automatic as part of an
expunge.

Each triplet contains of the following:

  * D - the 'Docindex', or index of documents - contains { mailbox_guid, uid, header/mime_part } info
  * W - the 'Wordlist' - contains all the indexed words, and offsets into the L file
  * L - the 'docList' - containing lists of indices into the D file.

To perform a lookup of a word, find the L-offset for that word from the W
file. From that offset in the L file, read the list of docidx (document
index) values. From the D file, look up the { guid, uid, hdr/part } values.

This sounds complicated, but if a word is not found, you don't need to touch
the L and D files. If (AND) searching for multiple words, and one of the words
is not in the W file, then you don't need to touch the L file. If (AND)
searching, and the intersection of the lists in the L file is empty, then you
don't need to touch the D file.

These three files can be considered as 2 dimensional data, with W and D being
the two axes, and L being the 2D region itself. Preferably in typical use the
L files dominate the sizes. However, because deciding what is and isn't a
"word" is hard, the W files also can grow very large.

For storage planning, Product decision is to assume that no FTS file will
exceed 500MB.  Theoretically, they could grow past that size, but allowing
non-sparse objects to be used in Scality (for obox) is a valid trade-off for
better performance.

Stats Caching
^^^^^^^^^^^^^

Stats for each triplet are cached in the 'S' file - this includes the number
of entities (documents (= headers + parts) for D, words for W, and matches
for L files).

Maxuid stats for every mailbox_guid in each triplet are also cached in the
same file. This helps give fast answers to some common queries.

.. _fs-fts-cache:

FTS Caches
^^^^^^^^^^

By default FTS has no read or write caches. When indexing a new mail the
FTS indexes are immediately written to the storage. With object storages this
means quite a lot of write and delete operations. To optimize this, "fts-cache"
was implemented for write caching. The fts-cache causes the last triplet to
be kept in local metacache until one of the following happens:

 * fts.L file's size grows larger than
   :dovecot_plugin:ref:`fts_dovecot_min_merge_l_file_size` (default: 128 kB)
 * The triplet has at least
   :dovecot_plugin:ref:`fts_dovecot_mail_flush_interval` number of mails. Note
   that the default is 0, which means this check isn't done at all.
 * Metacache is flushed

FTS is commonly also configured to use :ref:`fscache`, which caches reading
of FTS triplets that were already saved to the object storage.

Lookups
^^^^^^^

The precise techniques for doing lookups depends on whether it's an AND or
an OR query. AND permits early aborts before any of the L file is even
touched. OR invites no such optimization.

Example Configuration
^^^^^^^^^^^^^^^^^^^^^

Example configuration using OBOX::

  #These are assumed below,
  # mail_driver = obox
  # mail_path = %2Mu/%2.3Mu/%u
  # mail_index_path = ~/
  # mail_control_path = ~/
  fs_s3_url = http://mails.s3.example.com/
  obox {
    fs_driver = fscache
    fs_fscache_size = 512M
    fs_fscache_path = /var/cache/mails/%4Nu
    fs_parent {
      fs_driver = s3
    }
  }

  mail_plugins {
    fts = yes
    fts_dovecot = yes
  }

  plugin {
    fts = dovecot

    # Fall back to built in search.
    #fts_enforced = no

    # Local filesystem example:
    # Use local filesystem storing FTS indexes
    fts_dovecot {
      fs_driver = posix
      fs_posix_prefix = %h/fts/
    }

    # OBOX example:
    # Keep URL the same as obox plus the mail_path setting.
    # Then append e.g. /fts/
    # Example: http://<ip.address.>/%2Mu/%2.3Mu/%u/fts/
    fts_dovecot {
      fs_driver = fts-cache
      fs_parent {
        fs_driver = fscache
	fs_fscache_size = 512M
	fs_fscache_path = /var/cache/fts/%4Nu
	fs_parent {
	  fs_driver = s3
	  fs_s3_url = http://fts.s3.example.com/%2Mu/%2.3Mu/%u/fts/
	}
      }
    }

    # Detected languages. Languages that are not recognized, default to the
    # first enumerated language, i.e. en.
    fts_languages = en fr # English and French.

    # This chain of filters first normalizes and lower cases the text, then
    #  stems the words and lastly removes stopwords.
    fts_filters = normalizer-icu snowball stopwords

    # This chain of filters will first lowercase all text, stem the words,
    # remove possessive suffixes, and remove stopwords.
    fts_filters_en = lowercase snowball english-possessive stopwords

    # These tokenizers will preserve addresses as complete search tokens, but
    # otherwise tokenize the text into "words".
    fts_tokenizers = generic email-address
    fts_tokenizer_generic = algorithm=simple

    # Proactively index mail as it is delivered or appended, not only when
    # searching.
    fts_autoindex=yes

    # How many \Recent flagged mails a mailbox is allowed to have, before it
    # is not autoindexed.
    # This setting can be used to exclude mailboxes that are seldom accessed
    # from automatic indexing.
    fts_autoindex_max_recent_msgs=99

    # Exclude mailboxes we do not wish to index automatically.
    # These will be indexed on demand, if they are used in a search.
    fts_autoindex_exclude = \Junk
    fts_autoindex_exclude2 = \Trash
    fts_autoindex_exclude3 = .DUMPSTER
  }
