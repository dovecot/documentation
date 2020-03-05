.. _issue_large_cache:

================================
dovecot.index.cache is too large
================================

Before v2.3.11 this shows up as:

.. code-block:: none

   Panic: file mail-index-util.c: line 37 (mail_index_uint32_to_offset): assertion failed: (offset < 0x40000000)

In v2.3.11 this assert-crash was changed into:

.. code-block:: none

   Error: Corrupted index cache file .../dovecot.index.cache: Cache file too large

The problem in these cases is that the user has a folder with a large number of
messages. The only solution for now is to delete the dovecot.index.cache for
that folder. Since v2.3.11 this is done automatically.

The cache files generally are useful to reduce disk IO by being able to read
commonly accessed data from the cache instead of opening the individual emails.
However, usually these kind of huge folders are some kind of system accounts
which just gather a lot of mails which are periodically deleted. In these
cases the cache file usually isn't very useful.

A similar problem is also:

.. code-block:: none

   Fatal: master: service(imap): child ... returned error 83 (Out of memory (service imap { vsz_limit=1024 MB }, you may need to increase it))

and:

.. code-block:: none

   Error: mmap(size=...) failed with file .../dovecot.index.cache: Cannot allocate memory

These usually happen because the dovecot.index.cache file is so large
that it can't fit into the memory. The solution is usually to either the
imap service's vsz_limit or default_vsz_limit to somewhat higher than the
maximum cache file size (1 GB by default). For example to 1500M.

An alternative solution to this is to reduce the maximum cache file size to
be somewhat lower than the imap service's vsz_limit. See
:ref:`setting-mail_cache_max_size`.
