.. _mail_cache_settings:

===================
Mail Cache Settings
===================

Dovecot caches the mail headers and other fields to dovecot.index.cache files automatically based on what the IMAP client uses. This is a per-folder decision. This works generally well for newly created folders, but not so well during migration, because Dovecot doesn't yet known which fields need to be cached. So Dovecot needs to be told what to initially add to dovecot.index.cache while mails are being saved. This can be useful even after migration. For example a user might normally use their mobile app IMAP client, but once a few months they would login to the webmail. Dovecot would normally preserve the fields used by the mobile IMAP client, but drop the extra fields used only by webmail after a month. This might not be wanted. This can be configured with:

* :dovecot_core:ref:`mail_cache_fields`: List of fields that are initially
  cached for newly created users. Afterwards the caching decisions will live
  on based on the user's IMAP access patterns. Note that the INBOX's caching
  decisions are copied to newly created folders.
* :dovecot_core:ref:`mail_always_cache_fields`: List of fields that are always
  cached for everyone. These fields won't get dropped automatically even if
  user never accesses them.
* :dovecot_core:ref:`mail_never_cache_fields`: List of fields that should never
  be cached. This should probably never include anything other than
  imap.envelope, which isn't needed because it can be generated from the cached
  header fields.

Settings for clients
--------------------

The list of cached fields depends on which IMAP clients are expected to be used. These are commonly used:

* IMAP ENVELOPE is used by many clients, which includes: hdr.date hdr.subject hdr.from hdr.sender hdr.reply-to hdr.to hdr.cc hdr.bcc hdr.in-reply-to hdr.message-id

* Open-Xchange AppSuite:

   * IMAP ENVELOPE

   * flags date.received size.virtual imap.bodystructure mime.parts hdr.importance hdr.x-priority hdr.references body.snippet hdr.x-open-xchange-share-url

* POP3 clients: size.virtual pop3.uidl pop3.order

* iOS 9.3.1:

   * Some (but not all) of the IMAP ENVELOPE headers: hdr.date hdr.subject hdr.from hdr.tohdr.cc hdr.bcc hdr.message-id hdr.in-reply-to
   * hdr.content-type hdr.references

* K9: date subject from content-type to cc reply-to message-id references in-reply-to X-K9mail-Identity

Fields
------

 * ``flags``: Tracks various boolean flags for the mail: Does the header/body
   have CRLF linefeeds? Does it have NUL characters?
 * ``date.sent``: The Date: header parsed to timestamp
 * ``date.received``: Mail delivery date (IMAP INTERNALDATE)
 * ``date.save``: Mail save/copy date (mdbox and obox formats store this always in
   dovecot.index)
 * ``size.virtual``: Virtual message size (line feeds counted as CRLFs). This is
   also often stored in dovecot.index file (especially when using
   :ref:`count quota <quota_backend_count>`.).
 * ``size.physical``: Physical message size (line feeds exactly as they are
   stored in the stored mail). Note that the size is of the mail as plaintext,
   i.e. after decryption/compression. This is typically used by :ref:`fs <quota_backend_fs>` or :ref:`maildir <quota_backend_maildir>` quota.
 * ``imap.bodystructure``: IMAP BODYSTRUCTURE response, which describes what
   the message's MIME structure looks like.
 * ``imap.body``: IMAP BODY response. This is the short version of
   imap.bodystructure, not the message body itself. If imap.bodystructure is
   cached, this field isn't cached because it can be generated from the
   imap.bodystructure.
 * ``imap.envelope``: IMAP ENVELOPE response, which contains the From, To, Cc,
   Bcc, Sender, Reply-To, Date, Subject, Message-ID and In-Reply-To headers in
   parsed forms. This is typically in the
   :dovecot_core:ref:`mail_never_cache_fields` because the raw headers are
   more useful in the cache and the ENVELOPE can be generated from them.
 * ``pop3.uidl``: POP3 UIDL responses. This is useful especially if some of the
   UIDLs have been migrated from an old system or if
   :dovecot_core:ref:`pop3_reuse_xuidl` is used. Otherwise Dovecot generates
   the UIDL in a way that usually doesn't require cache.
 * ``pop3.order``: POP3 messages' order. This is used after migration from
   another system where the IMAP and POP3 messages' order differs.
 * ``guid``: Internal Dovecot GUID for messages.
 * ``mime.parts``: MIME parts' sizes.
 * ``binary.parts``: MIME parts' sizes after decoding Content-Transfer-Encoding
   to binary. Used by IMAP BINARY extension.
 * ``body.snippet``: A short snippet (:ref:`imap_preview`) of the message body.
 * ``hdr.*``: Message headers listed individually, e.g. ``hdr.date``,
   ``hdr.from``

Cache decision algorithm
------------------------

Nowadays there are three types of IMAP clients:

 * Clients that download all the (new) messages' headers and other metadata
   into local cache. Afterwards they use only the local cache for accessing
   the metadata. They may download the message bodies later on though. These
   clients don't benefit from Dovecot's caching after they have downloaded
   the metadata. For example Outlook, Thunderbird, OSX Mail.
 * Clients that work otherwise like the local clients described above, but
   don't download all mails locally (even their metadata). They may also use
   server-side search for mails. For example iOS Mail.
 * Clients that don't have a local cache at all, or only a short-lived cache.
   These clients would benefit from having all mails cached by Dovecot.
   For example webmails.

IMAP clients don't advertise how they work, so Dovecot attempts to figure it
out dynamically. The behavior is now:

 * For a newly created INBOX Dovecot gets the caching decisions from the
   :dovecot_core:ref:`mail_cache_fields` and
   :dovecot_core:ref:`mail_always_cache_fields` settings.
 * For a newly created non-INBOX folder the caching decisions are copied from
   the INBOX.
 * Whenever a new non-cached field is accessed, its caching decision is set to
   TEMP, which means only the last 1 week's mails have the field cached.
 * Whenever a field is accessed for a mail older than 1 week the caching
   decision changes from TEMP to YES, which means the field is cached for all
   mails.
 * Whenever a single IMAP session accesses the mails in non-ascending order
   (e.g. mail UIDs 100 -> 99 instead of 99 -> 100) the caching decision changes
   from TEMP to YES. Especially the SORT/THREAD commands trigger this.
 * Whenever cache file is recreated (purged) it can cause some fields'
   decisions to change:

    * .. dovecotchanged:: 2.3.11 Changes YES -> TEMP if the YES decision hasn't
                          been reconfirmed for the last 30 days
                          (:dovecot_core:ref:`mail_cache_unaccessed_field_drop`).
                          Older versions changed the YES -> TEMP decision every
                          time the cache was purged, which could have happened
                          too early sometimes.
    * .. dovecotchanged:: 2.3.11 Changes TEMP -> NO and drops the field if it
                          hasn't been accessed for the last 60 days (2 *
                          :dovecot_core:ref:`mail_cache_unaccessed_field_drop`).
                          Older versions dropped it after 30 days (1 *
                          :dovecot_core:ref:`mail_cache_unaccessed_field_drop`).
