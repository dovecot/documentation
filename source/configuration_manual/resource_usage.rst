.. _resource_usage:

=====================
Resource Usage
=====================

These settings are useful to prevent IMAP commands from opening too many emails and causing larger system-wide performance problems.

.. code-block:: none
   
   mail_sort_max_read_count = 100

This controls how many slow mail accesses sorting can perform before it fails: a NO [LIMIT] Requested sort would have taken too long The SORT reply is still returned, but it's likely not correct.

.. Exception:: Exception: With obox format SORT (ARRIVAL) will always return OK. When it reaches the limit, it starts getting the received-timestamps from the time the object was saved. This is commonly the same as the received-timestamp, but not always.

.. code-block:: none

   protocol !indexer-worker {
   mail_vsize_bg_after_count = 100
   }

If more than this many mails need to be ``opened``/``stat()ed`` to get their vsize, return failure and finish up the quota recalculation on background. When a quota failure happens during LMTP delivery or IMAP APPEND/COPY, user is assumed to be below quota and the operation will succeed. Only the IMAP GETQUOTA command will return a failure

.. code-block:: none

   plugin {
   mail_log_cached_only = yes
   }

If enabled, everything except `save` event will log only the fields that can be looked up from cache. This improves performance if some of the fields aren't cached and it's not a strict requirement to log them.

.. code-block:: none

   import_environment = $import_environment MALLOC_MMAP_THRESHOLD_=131072

Avoid processes permanently using too much memory by having it use ``mmap()`` for ``>=28 kB`` memory allocations.
