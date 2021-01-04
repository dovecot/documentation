.. _dovecot_cache:

==========
Cache file
==========

Cache file is used for storing immutable data. It supports several
different kinds of fields:

``MAIL_CACHE_FIELD_FIXED_SIZE``
   The field size doesn't need to be stored in the cache file. It's
   always the same.

``MAIL_CACHE_FIELD_BITMASK``
   A fixed size bitmask field. It's possible to add new bits by updating
   this field. All the added fields are ORed together.

``MAIL_CACHE_FIELD_VARIABLE_SIZE``
   Variable sized binary data.

``MAIL_CACHE_FIELD_STRING``
   Variable sized string.

``MAIL_CACHE_FIELD_HEADER``
   Variable sized message header. The data begins with a 0-terminated
   ``uint32_t line_numbers[]``. The line number exists only for each
   header, header continuation lines in multiline headers don't get
   listed. After the line numbers comes the list of headers, including
   the "header-name: " prefix for each line, LFs and the TABs or spaces
   for continued lines.

The last 3 variable sized fields are treated identically by the cache
file code. Their main purpose is to make it easier for "dump cache
file's contents" programs (``src/util/idxview``) to do their job.

Locking
-------

Because cache file is typically used in potentially long-running
operations, such as with IMAP command
``FETCH 1:* (BODY.PEEK[] ENVELOPE BODYSTRUCTURE)`` it's important that
updating the cache file doesn't block out any other readers. Also
because the readers are often also writers (if something isn't cached,
it's added there), it's important that they don't block writers either.

Reading cache files requires no locking. Writing is done by first
locking the file, reserving some space to write to, and immediately
after that unlocking the file. This way the transaction can keep writing
to the cache file as long as it wants to without blocking other writers.
When the transaction is committed, the updated cache offsets are written
to the transaction log which makes them visible to other processes.

This also means that it's possible for two processes to write the same
cached fields twice to the cache file. Because the data written to the
cache file are really just cached data, the fields' contents are
identical. Having the data exist twice (or even more times) means
wasting some disk space, but otherwise it isn't a problem. The
duplicates are dropped the next time the file is compressed.

Cache decisions
---------------

Dovecot tries to be smart about what it keeps in the cache file. If the
client never fetches the cached data, it's just waste of disk space and
disk I/O.

The caching decisions are:

``MAIL_CACHE_DECISION_NO``
   This field isn't cached currently.

``MAIL_CACHE_DECISION_TEMP``
   This field is cached for new mails.

``MAIL_CACHE_DECISION_YES``
   This field is cached for all mails.

Normally Dovecot changes the decisions based on what fields are fetched
and for what messages. A specific decision can be forced by ORing it
with ``MAIL_CACHE_DECISION_FORCED``.

``mail-cache-decisions.c`` file contains the rules how Dovecot changes
the decisions. The following is copied from the file:

Users can be divided to three groups:

1. Most users will use only a single IMAP client which caches everything
   locally. For these users it's quite pointless to do any kind of
   caching as it only wastes disk space. That might also mean more disk
   I/O.

2. Some users use multiple IMAP clients which cache everything locally.
   These could benefit from caching until all clients have fetched the
   data. After that it's useless.

3. Some clients don't do permanent local caching at all. For example
   Pine and webmails. These clients would benefit from caching
   everything. Some locally caching clients might also access some data
   from server again, such as when searching messages. They could
   benefit from caching only these fields.

After thinking about these a while, I figured out that people who care
about performance most will be using Dovecot optimized LDA anyway which
updates the indexes/cache immediately. In that case even the first user
group would benefit from caching the same way as second group. LDA reads
the mail anyway, so it might as well extract some information about it
and store them into cache.

So, group 1. and 2. could be optimally implemented by keeping things
cached only for a while. I thought a week would be good. When cache file
is compressed, everything older than week will be dropped.

But how to figure out if user is in group 3? One quite easy rule would
be to see if client is accessing messages older than a week. But with
only that rule we might have already dropped useful cached data. It's
not very nice if we have to read and cache it twice.

Most locally caching clients always fetch new messages (all but body)
when they see them. They fetch them in ascending order. Noncaching
clients might fetch messages in pretty much any order, as they usually
don't fetch everything they can, only what's visible in screen. Some
will use server side sorting/threading which also makes messages to be
fetched in random order. Second rule would then be that if a session
doesn't fetch messages in ascending order, the fetched field type will
be permanently cached.

So, we have three caching decisions:

1. Don't cache: Clients have never wanted the field

2. Cache temporarily: Clients want this only once

3. Cache permanently: Clients want this more than once

Different mailboxes have different decisions. Different fields have
different decisions.

There are some problems, such as if a client accesses message older than
a week, we can't know if user just started using a new client which is
just filling its local cache for the first time. Or it might be a client
user hasn't just used for over a week. In these cases we shouldn't have
marked the field to be permanently cached. User might also switch
clients from non-caching to caching.

So we should re-evaluate our caching decisions from time to time. This
is done by checking the above rules constantly and marking when was the
last time the decision was right. If decision hasn't matched for two
months, it's changed. I picked two months because people go to at least
one month vacations where they might still be reading mails, but with
different clients.
