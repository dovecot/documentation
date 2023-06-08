.. _core_settings_advanced:

==============================
Dovecot Core Advanced Settings
==============================

See :ref:`settings` for list of all setting groups.

.. warning::

  These settings should not normally be changed.

.. dovecot_core:setting:: login_proxy_notify_path
   :default: proxy-notify
   :values: @string

   Path to proxy-notify pipe.

   :ref:`Login variables <variables-login>` can be used.


.. dovecot_core:setting:: mail_cache_max_header_name_length
   :added: 2.4.0,3.0.0
   :default: 100
   :values: @uint

   Maximum header name length stored in the cache, where 0 stands for unlimited
   (which is also the former behavior).

   When enabled, the cache truncates the names to this length in memory and on
   file. While the header name remains unchanged in the storage, all the headers
   sharing the first ``mail_cache_max_header_name_length`` prefix characters are
   de facto aliased and will be considered as the same header on cache fetch.

   Also, attempting to fetch a specific aliased header will succeed even if
   the header does not actually exist (this does NOT happen when the feature
   is disable with explicitly with ``mail_cache_max_header_name_length = 0``)

   Example: (``mail_cache_max_header_name_length = 5``)

      If the mail contains the header ``X-name: value``, attempting to fetch
      ``X-nam`` or ``X-names`` will also produce ``X-name: value`` as a result
      (with the original header name, not the requested one).

      Trying to fetch the mail text or the mail headers will properly return only
      ``X-name: value``


.. dovecot_core:setting:: mail_cache_max_headers_count
   :added: 2.4.0,3.0.0
   :default: 100
   :values: @uint

   Maximum number of headers in ``yes``/``temp`` cache decision before the cache
   refuses to promote more header decisions from ``no`` to ``temp``, where 0
   stands for unlimited (which is also the former behavior).

   When entries are rejected, the event
   :dovecot_core:ref:`mail_cache_decision_rejected` is emitted.

   Also, while the cache's headers count is saturated, the effective value of
   :dovecot_core:ref:`mail_cache_unaccessed_field_drop` is reduced to 1/4 of
   of the specified one, in order to aid the cache to return within the limits.


.. dovecot_core:setting:: mail_cache_max_size
   :added: 2.3.11
   :default: 1G
   :values: @size

   If ``dovecot.index.cache`` becomes larger than this, it's truncated
   to empty size.

   .. warning:: The maximum value is 1 GB because the cache file format can't
                currently support large sizes.


.. dovecot_core:setting:: mail_cache_min_mail_count
   :default: 0
   :values: @uint

   Only update cache file when the mailbox contains at least this many
   messages.

   With a setting other than ``0``, you can optimize behavior for fewer disk
   writes at the cost of more disk reads.


.. dovecot_core:setting:: mail_cache_purge_continued_percentage
   :default: 200
   :values: @uint

   Compress the cache file when n% of rows contain continued rows.

   For example ``200`` means that the record has 2 continued rows, i.e. it
   exists in 3 separate segments in the cache file.


.. dovecot_core:setting:: mail_cache_purge_delete_percentage
   :default: 20
   :values: @uint

   Compress the cache file when n% of records are deleted (by count, not by
   size).


.. dovecot_core:setting:: mail_cache_purge_header_continue_count
   :default: 4
   :values: @uint

   Compress the cache file when we need to follow more than n next_offsets to
   find the latest cache header.


.. dovecot_core:setting:: mail_cache_purge_min_size
   :default: 32k
   :values: @size

   Only compress cache file if it is larger than this size.


.. dovecot_core:setting:: mail_cache_record_max_size
   :default: 64k
   :values: @size

   If a cache record becomes larger than this, don't add it to the cache file.


.. dovecot_core:setting:: mail_cache_unaccessed_field_drop
   :default: 30days
   :seealso: @mail_cache_settings
   :values: @time

   Specifies when cache decisions are downgraded.

   .. dovecotchanged:: 2.3.11 Change caching decision from YES to TEMP after
                       this much time has passed. Drop the field entirely
                       after twice this much time has passed (i.e. 60 days by
                       default), regardless of whether the cache decision was
                       YES or TEMP previously. Older versions used this
                       setting only for dropping the field after it hadn't
                       been accessed for this long.

   .. dovecotchanged:: 2.4.0,3.0.0 If the cache header count is capped to
                       :dovecot_core:ref:`mail_cache_max_headers_count` then the
                       effective value is reduced to 1/4 of the configured value
                       until enough headers expire for the cache to fall back
                       inside the limits.

.. dovecot_core:setting:: mail_index_log_rotate_max_size
   :default: 1M
   :seealso: @mail_index_log_rotate_min_age;dovecot_core, @mail_index_log_rotate_min_size;dovecot_core
   :values: @size

   Always rotate transaction log after it exceeds this size.


.. dovecot_core:setting:: mail_index_log_rotate_min_age
   :default: 5mins
   :seealso: @mail_index_log_rotate_max_size;dovecot_core
   :values: @time

   Rotate transaction log if it is older than this value and is larger than
   :dovecot_core:ref:`mail_index_log_rotate_min_size`.


.. dovecot_core:setting:: mail_index_log_rotate_min_size
   :default: 32k
   :values: @size

   Rotate transaction log if it is larger than this size and is older than
   :dovecot_core:ref:`mail_index_log_rotate_min_age`.


.. dovecot_core:setting:: mail_index_log2_max_age
   :default: 2days
   :values: @time

   Delete ``.log.2`` index file when older than this value.

   Older ``.log.2`` files are useful for QRESYNC and dsync, so this value
   should not be too low.


.. dovecot_core:setting:: mail_index_rewrite_max_log_bytes
   :default: 128k
   :seealso: @mail_index_rewrite_min_log_bytes;dovecot_core
   :values: @size

   Rewrite the index when the number of bytes that needs to be read from the
   .log index file on refresh is between these min/max values.


.. dovecot_core:setting:: mail_index_rewrite_min_log_bytes
   :default: 8k
   :seealso: @mail_index_rewrite_max_log_bytes;dovecot_core
   :values: @size

   Rewrite the index when the number of bytes that needs to be read from the
   .log index file on refresh is between these min/max values.
