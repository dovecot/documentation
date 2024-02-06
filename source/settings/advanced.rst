.. _core_settings_advanced:

==============================
Dovecot Core Advanced Settings
==============================

See :ref:`settings` for list of all setting groups.

.. warning::

  These settings should not normally be changed.

.. dovecot_core:setting:: http_client_auto_redirect
   :default: yes
   :values: @boolean

   If yes, redirects are handled as long as
   :dovecot_core:ref:`http_client_request_max_redirects` isn't reached. If no,
   the redirect responses are handled as regular failure responses. This
   setting should likely be changed only in the code, never in configuration.


.. dovecot_core:setting:: http_client_auto_retry
   :default: yes
   :values: @boolean

   If no, requests are not automatically retried by the generic HTTP client
   code. It's still possible to retry the requests with explicit
   ``http_client_request_try_retry()`` calls as long as
   :dovecot_core:ref:`http_client_request_max_attempts` isn't reached. This
   setting should likely be changed only in the code, never in configuration.

.. dovecot_core:setting:: http_client_max_auto_retry_delay
   :default: 0
   :values: @time

   Maximum acceptable delay in for automatically retrying/redirecting requests.
   If a server sends a response with a Retry-After header that causes a delay
   longer than this, the request is not automatically retried and the response
   is returned.


.. dovecot_core:setting:: http_client_connect_backoff_time
   :default: 100 ms
   :values: @time_msecs

   Initial backoff time for retries. It's doubled at each connection failure.


.. dovecot_core:setting:: http_client_connect_backoff_max_time
   :default: 1 mins
   :values: @time_msecs

   Maximum backoff time for retries.


.. dovecot_core:setting:: http_client_dns_client_socket_path
   :default: dns-client
   :values: @string

   UNIX socket path to the dns-client service.


.. dovecot_core:setting:: http_client_dns_ttl
   :default: 30 mins
   :values: @time_msecs

   How long to cache DNS entries.


.. dovecot_core:setting:: http_client_response_hdr_max_field_size
   :default: 8 k
   :values: @size

   Response header limit: Max size for an individual field.


.. dovecot_core:setting:: http_client_response_hdr_max_fields
   :default: 50
   :values: @uint

   Response header limit: Max number of fields.


.. dovecot_core:setting:: http_client_response_hdr_max_size
   :default: 200 k
   :values: @size

   Response header limit: Max size for the entire response header.


.. dovecot_core:setting:: http_client_socket_recv_buffer_size
   :default: 0
   :values: @size

   The kernel receive buffer size for the connection sockets.
   0 = kernel defaults.


.. dovecot_core:setting:: http_client_socket_send_buffer_size
   :default: 0
   :values: @size

   The kernel send buffer size for the connection sockets.
   0 = kernel defaults.


.. dovecot_core:setting:: http_client_soft_connect_timeout
   :default: 0
   :values: @time_msecs

   Time to wait for TCP connect and SSL handshake to finish for the
   first connection before trying the next IP in parallel.
   0 = wait until current connection attempt finishes.


.. dovecot_core:setting:: http_client_user_agent
   :values: @string

   User-Agent: header to send.


.. dovecot_core:setting:: http_server_max_target_length
   :default: 8 k
   :values: @size

   Request target limit: Maximum length of the request target.


.. dovecot_core:setting:: http_server_max_payload_size
   :default: 10 G
   :values: @size

   Request payload limit: Max size for the request payload.


.. dovecot_core:setting:: http_server_request_hdr_max_size
   :default: 200 k
   :values: @size

   Request header limit: Max size for the entire request header.


.. dovecot_core:setting:: http_server_request_hdr_max_field_size
   :default: 8 k
   :values: @size

   Request header limit: Max size for an individual field.


.. dovecot_core:setting:: http_server_request_hdr_max_fields
   :default: 50
   :values: @uint

   Request header limit: Max number of fields.


.. dovecot_core:setting:: http_server_default_host
   :values: @string

   Overwrite the local hostname with http_server_default_host.


.. dovecot_core:setting:: http_server_socket_recv_buffer_size
   :default: 0
   :values: @size

   The kernel receive buffer size for the connection sockets.
   0 = kernel defaults.


.. dovecot_core:setting:: http_server_socket_send_buffer_size
   :default: 0
   :values: @size

   The kernel send buffer size for the connection sockets.
   0 = kernel defaults.


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
