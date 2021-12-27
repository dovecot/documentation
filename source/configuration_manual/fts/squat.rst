.. _fts_backend_squat:

Squat FTS Engine
================

.. deprecated:: v2.1

.. warning:: Squat is deprecated and should no longer be used.
             It is going to be removed in a future version entirely.
	     It's recommended to use :ref:`fts_backend_solr` instead.

The main difference between Squat indexes and the others is that Squat
provides support for substring searches, while pretty much all other FTS
indexes support only matching from the beginning of words. By strictly
reading the IMAP RFC it requires substring matching, so to optimize
regular TEXT and BODY searches you must use Squat with Dovecot v2.0. The
other indexes are used only for Dovecot's non-standard X-TEXT-FAST and
X-BODY-FAST searches. However, almost all other commonly used IMAP
servers no longer care about this requirement, so Dovecot v2.1 also no
longer makes this distinction. In Dovecot v2.1 TEXT and BODY searches
are done using any indexes available.

-  The Squat indexes are currently updated only when SEARCH TEXT or
   SEARCH BODY command is used. It's planned that in future they could
   be updated immediately when messages are being saved.

-  The Squat indexes take about 30% of the mailbox size (with partial=4
   full=4).

-  The initial Squat index building for large mailboxes can be very CPU
   and memory hungry.

-  The Squat indexes are stored among Dovecot's other index files.
   They're called ``dovecot.index.search`` and
   ``dovecot.index.search.uids``. It's safe to delete both of these
   files to trigger a rebuild.

Some statistics with Core2 duo 6600, 2 GB memory (partial=4 full=4):

-  1,4 GB mbox with 368000 messages: SEARCH BODY asdfgh

   -  Without Squat: 2 min 35 sec CPU, process RSS size 24 MB

   -  Initial Squat build: 6 min 36 sec CPU, process RSS size peaks at
      800 MB, drops to 96 MB at end.

   -  Subsequent searches: 0.10 sec CPU, 1.18 sec real with cold cache,
      process RSS size 2 MB.

      -  Most of the time was spent verifying Squat results. Searching
         for a 1..4 letter word gives results in 0.00 CPU secs and 0.80
         real secs with cold cache.

-  32 MB mbox with 7500 messages: SEARCH BODY asdfgh

   -  Without Squat: 2.3 sec CPU, 3.6 sec real with cold cache, process
      RSS size 5 MB

   -  Initial Squat build: 8.9 sec CPU, 10.0 sec real with cold cache,
      process RSS size peaks at 61 MB, drops to 20 MB at end.

-  48 MB maildir with 10000 messages: SEARCH BODY asdfgh

   -  Without Squat: 2.6 sec CPU, 9.7 sec real with cold cache

   -  Initial Squat build: 9.7 sec CPU, 15.3 sec real with cold cache

Internal workings
-----------------

Squat works by building a trie of all 1..4 character combinations of all
words in messages. For example given a word "world" it indexes "worl",
"orld", "rld", "ld" and "d". Matching message UIDs are stored to each
trie node, so Squat supports giving definitive answers to any searches
with a length of 1..4 characters. For longer search words the word is
looked up in 4 letter pieces and the results are merged. The resulting
list is a list of messages where the word \*may\* exist. This means that
those messages are still opened and the word is searched from them the
slow way.

Squat also supports indexing more characters from the beginning of
words. For example if 5 first characters are indexed, the word
"character" would be cut to "chara". If a user then searches for
"chara", Dovecot does:

1. Search for messages having "char" (reply example: 1,5,10)

2. Search for messages having "hara" (reply example: 3,5,10)

3. Store the intersection of the above searches to "maybe UIDs"
   (example: 5,10)

4. Search for full word "chara" and store it as "definite UIDs" (reply
   example: 5)

5. Remove definite UIDs (5) from maybe UIDs (5,10 -> 10)

In the above example Dovecot would know that message UID 5 has the word
"chara", but it still has to check if UID 10 has it as a substring (e.g.
in word "achara") by reading the message contents. If the user's search
words match mostly non-substrings (which is common), using long enough
full word indexing can improve the search performance a lot, especially
when the word matches a lot of messages.

The Squat name comes from `Cyrus IMAP <http://cyrusimap.web.cmu.edu/>`_
which implements slightly similar Squat indexes ("Search QUery Answer
Tool"). Dovecot's implementation and file format however is completely
different. The main visible difference is that Dovecot allows updating
the index incrementally instead of requiring to re-read the entire
mailbox to build it. Cyrus Squat also doesn't support 1..3 characters
long searches.

Configuration
-------------

``fts_squat`` setting can be used to change Squat options:

- ``full=n``: Index n first characters from the beginning of words. Default
  is 4, but it could be useful to increase this to e.g. 10 or so.
  However larger values take more disk space.

- ``partial=n``: Length of the substring blocks to index. Default is 4
  characters and it's probably not a good idea to change it.

::

   mail_plugins = $mail_plugins fts fts_squat

   plugin {
     fts = squat
     fts_squat = partial=4 full=10
   }

Using both Squat and non-Squat (v2.0-only)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

It's possible to use both Squat and non-Squat indices at the same time,
so that TEXT/BODY are looked up from Squat indexes and
X-TEXT-FAST/X-BODY-FAST are looked up from the non-Squat index. This of
course means that indices will have to be built and updated for both, so
it might not be that good idea.

::

   protocol imap {
   ..
     mail_plugins = fts fts_squat fts_solr
   }
   ...
   plugin {
     fts = squat solr
   }
