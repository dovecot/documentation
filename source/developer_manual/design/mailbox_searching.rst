.. _lib-storage_mailbox_searching:

=================
Mailbox Searching
=================

``mailbox_search_*()`` functions should be used always when you're
iterating through multiple messages. The search queries can be complex
or as simple as "all messages". Without searching there's also a way to
directly switch to a specific message by its sequence number or UID, but
this should be avoided usually.

Initializing
------------

Search is initialized with ``mailbox_search_init()`` on top of a
:ref:`transaction <lib-storage_mailbox_transactions>`.
Although it would appear that a search is a read-only operation, it can
actually write data to Dovecot's cache file. For example if you search
for a specific header not yet in cache file, the results are saved to
cache file so the next search will be fast. This is why you should
always commit search transactions, even if the rest of your operation
fails (you should use separate transactions for search and for updates
if necessary).

You'll need a search query. ``src/lib-storage/mail-search.h`` and
``mail-search-build.h`` contain all the functions and structures related
to it. Usually you should start with ``mail_search_build_init()`` and
then start adding the search parameters, either manually or with one of
the existing ``mail_search_build_add_*()`` helper functions. The same
search query structures can be saved and used for other searches later,
but because search state is stored inside the structs you need to be
careful that multiple searches aren't using them at the same time. This
is usually more trouble than worth, so avoid doing it.

Search results can be sorted by giving a sort program. Dovecot optimizes
this by keeping sort indexes in the index files.

Reading search results
----------------------

While ``mailbox_search_next()`` returns TRUE, a new search result is
found and it changes the given :ref:`mail <lib-storage_mail>`
to point to the search result. The mail's "wanted fields/headers"
parameters don't need to include anything needed by the search query,
Dovecot optimizes them internally.

If the search needs to parse message bodies and the mailbox is large,
this call can take a long time. If you want to do other things while
searching, you can use ``mailbox_search_next_nonblock()`` that does only
a bit of work and then returns either with a result or "try again later"
status. Dovecot attempts to keep each non-matching call to this function
between 200 and 250 milliseconds, although the upper bound can't be
guaranteed.

It's possible that messages are being expunged while Dovecot is
searching them, so it can't determine if they would have matched the
search rule or not. In this case it skips over them, but if you want to
know if this has happened, you can see if
``mailbox_search_seen_lost_data()`` returns TRUE.

Deinitializing
--------------

``mailbox_search_deinit()`` finishes the search. If it returns -1, some
error occurred and some search results might not have been returned.

Example
-------

Iterating through all messages in a mailbox goes like:

.. code-block:: C

   /* build search query */
   search_args = mail_search_build_init();
   mail_search_build_add_all(search_args);

   search_ctx = mailbox_search_init(trans, search_args, NULL);
   /* search context keeps args referenced */
   mail_search_args_unref(&search_args);

   mail = mail_alloc(trans, 0, NULL);
   while (mailbox_search_next(ctx, mail)) {
           printf("matched uid %u\n", mail->uid);
   }
   mail_free(&mail);
   if (mailbox_search_deinit(&search_ctx) < 0)
           i_error("search failed");

Saving search results
---------------------

Search results can be saved for future use by calling
``mailbox_search_result_save()`` just after initializing the search. The
results as returned as UIDs with ``mailbox_search_result_get()`` and may
contain UIDs that are already expunged. Once you're done with the saved
result, free it with ``mailbox_search_result_free()``.

The search result can also be automatically updated whenever mailbox is
synced if ``MAILBOX_SEARCH_RESULT_FLAG_UPDATE`` is set. The update is
optimized, so Dovecot doesn't do a full re-search, but matches only new
and changed messages. If ``MAILBOX_SEARCH_RESULT_FLAG_QUEUE_SYNC`` is
also set, search result additions and removals are also tracked and can
be retrieved with ``mailbox_search_result_sync()``, i.e. with this you
can implement "what changed in search results since last time I
checked".
