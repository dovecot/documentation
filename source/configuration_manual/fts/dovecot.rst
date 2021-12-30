.. _fts_backend_dovecot:

Dovecot Pro FTS Engine
======================

.. important:: The Dovecot Pro FTS driver is a part of
               :ref:`OX Dovecot Pro <ox_dovecot_pro_releases>` only.

The Dovecot FTS indexes are created and queried by a custom (Dovecot Pro) FTS
engine. The FTS engine component is loaded into the Dovecot FTS plugin as an
index backend and it processes text input from the FTS tokenizer and filter
chains and search queries constructed by the FTS plugin.

Settings
^^^^^^^^

See :ref:`plugin-fts-dovecot` for setting information.

The :dovecot_plugin:ref:`fts_dovecot_fs` setting defines the location for the
fts indexes.

See :ref:`plugin-fts` for generic FTS settings.

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

Example Configuration:
----------------------

Example configuration using OBOX::

  #These are assumed below, 
  #mail_location = obox:%2Mu/%2.3Mu/%u:INDEX=~/:CONTROL=~/
  #obox_fs = fscache:512M:/var/cache/mails/%4Nu:s3:http://mails.s3.example.com/

  mail_plugins = $mail_plugins fts fts_dovecot

  plugin {
    fts = dovecot

    # Fall back to built in search.
    #fts_enforced = no

    # Local filesystem example:
    # Use local filesystem storing FTS indexes
    #fts_dovecot_fs = posix:prefix=%h/fts/ 

    # OBOX example:
    # Keep this the same as obox_fs plus the root "directory" in mail_location
    # setting. Then append e.g. /fts/
    # Example: s3:http://<ip.address.>/%2Mu/%2.3Mu/%u/fts/
    fts_dovecot_fs = fts-cache:fscache:512M:/var/cache/fts/%4Nu:s3:http://fts.s3.example.com/%2Mu/%2.3Mu/%u/fts/

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
