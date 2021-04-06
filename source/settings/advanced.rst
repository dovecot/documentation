.. _core_settings_advanced:

======================
Core Advanced Settings
======================

.. warning::

  These settings should not normally be changed.

.. _setting-mail_cache_unaccessed_field_drop:

``mail_cache_unaccessed_field_drop``
------------------------------------

- Default: ``30days``
- Values:  :ref:`time`

Specifies when cache decisions are downgraded.

.. versionchanged:: v2.3.11 Change caching decision from YES to TEMP after this
                    much time has passed. Drop the field entirely after twice
                    this much time has passed (i.e. 60 days by default),
                    regardless of whether the cache decision was YES or TEMP
                    previously. Older versions used this setting only for
                    dropping the field after it hadn't been accessed for this
                    long.

See :ref:`mail_cache_settings` for details.


.. _setting-mail_cache_record_max_size:

``mail_cache_record_max_size``
------------------------------

- Default: ``64k``
- Values:  :ref:`size`

If a cache record becomes larger than this, don't add it to the cache file.


.. _setting-mail_cache_max_size:

``mail_cache_max_size``
-----------------------

.. versionadded:: v2.3.11

- Default: ``1G``
- Values:  :ref:`size`

If dovecot.index.cache becomes becomes larger than this, it's truncated to
empty size. The maximum value is 1 GB because the cache file format can't
currently support large sizes.


.. _setting-mail_cache_purge_min_size:

``mail_cache_purge_min_size``
--------------------------------

- Default: ``32k``
- Values:  :ref:`size`

Only compress cache file if it is larger than this size.


.. _setting-mail_cache_purge_delete_percentage:

``mail_cache_purge_delete_percentage``
-----------------------------------------

- Default: ``20``
- Values: :ref:`uint`

Compress the cache file when n% of records are deleted (by count, not by
size).


.. _setting-mail_cache_purge_continued_percentage:

``mail_cache_purge_continued_percentage``
--------------------------------------------

- Default: ``200``
- Values: :ref:`uint`

Compress the cache file when n% of rows contain continued rows.

For example ``200`` means that the record has 2 continued rows, i.e. it exists
in 3 separate segments in the cache file.


.. _setting-mail_cache_purge_header_continue_count:

``mail_cache_purge_header_continue_count``
---------------------------------------------

- Default: ``4``
- Values: :ref:`uint`

Compress the cache file when we need to follow more than n next_offsets to
find the latest cache header.


.. _setting-mail_index_rewrite_min_log_bytes:

``mail_index_rewrite_min_log_bytes``
------------------------------------

- Default: ``8k``
- Values:  :ref:`size`

Rewrite the index when the number of bytes that needs to be read from the
.log index file on refresh is between these min/max values.

See :ref:`setting-mail_index_rewrite_max_log_bytes`


.. _setting-mail_index_rewrite_max_log_bytes:

``mail_index_rewrite_max_log_bytes``
------------------------------------

- Default: ``128k``
- Values:  :ref:`size`

Rewrite the index when the number of bytes that needs to be read from the
.log index file on refresh is between these min/max values.

See :ref:`setting-mail_index_rewrite_min_log_bytes`


.. _setting-mail_index_log_rotate_max_size:

``mail_index_log_rotate_max_size``
----------------------------------

- Default: ``1M``
- Values:  :ref:`size`

Always rotate transaction log after it exceeds this size.

See also:

* :ref:`setting-mail_index_log_rotate_min_age`
* :ref:`setting-mail_index_log_rotate_min_size`


.. _setting-mail_index_log_rotate_min_age:

``mail_index_log_rotate_min_age``
---------------------------------

- Default: ``5mins``
- Values:  :ref:`time`

Rotate transaction log if it is older than this value and is larger than
:ref:`setting-mail_index_log_rotate_min_size`.

See :ref:`setting-mail_index_log_rotate_max_size`


.. _setting-mail_index_log_rotate_min_size:

``mail_index_log_rotate_min_size``
----------------------------------

- Default: ``32k``
- Values:  :ref:`size`

Rotate transaction log if it is larger than this size and is older than
:ref:`setting-mail_index_log_rotate_min_age`.


.. _setting-mail_index_log2_max_age:

``mail_index_log2_max_age``
---------------------------

- Default: ``2days``
- Values:  :ref:`time`

Delete .log.2 index file when older than this value.

Older .log.2 files are useful for QRESYNC and dsync, so this value should not
be too low.
