.. _dovecot_mail_index_api:

==============
Mail Index API
==============

``lib-index/mail-index.h`` contains the functions to access the index
files. ``mail-cache.h`` contains the functions to access the cache file.

The purpose of the main structures are:

-  ``struct mail_index``: Global state of the index.

-  ``struct mail_index_view``: You can have multiple views to the index.
   The views see new messages come and expunged messages go only when
   it's being explicitly synchronized. With mmaped indexes you can't
   really trust the record data (flags, keywords, extensions) not to
   change. This doesn't matter with IMAP.

-  ``struct mail_index_map``: Index file is accessed via maps. Views can
   point to one or more maps. Maps can be shared by different views.
   Maps can contain either mmap()ed memory areas pointing to the index
   file, or a in-memory copy of it.

-  ``struct mail_index_transaction``: In-memory list of changes to be
   written to the transaction log. The writing is done only when the
   transaction is committed.

Views and maps
--------------

In general you access all the data in the index files via views. The
mails are accessed using sequence numbers, which change only when the
view is synchronized.

For accessing messages with their UIDs, you'll first need to convert
them to sequences with either ``mail_index_lookup_uid()`` or
``mail_index_lookup_uid_range()``.

``mail_index_lookup()`` can be used to look up a single record's UID and
flags. The returned record points to the latest map, so that it contains
the latest flag changes. If the message was already expunged from the
latest map, it returns 0.

``mail_index_lookup_full()`` can be used to get also the map where the
message was found. This can be important with extensions. If extension
record's state depends on the extension header, they must be looked up
from the same map. For this reason there exists
``mail_index_map_get_header_ext()`` and ``mail_index_lookup_ext_full()``
functions which take the map as parameter. The non-map versions return
the data from the latest map if the message hasn't been expunged.
