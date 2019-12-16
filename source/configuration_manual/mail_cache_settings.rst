.. _mail_cache_settings:

=============================
Mail Cache Settings
=============================

Dovecot caches the mail headers and other fields to dovecot.index.cache files automatically based on what the IMAP client uses. This is a per-folder decision. This works generally well for newly created folders, but not so well during migration, because Dovecot doesn't yet known which fields need to be cached. So Dovecot needs to be told what to initially add to dovecot.index.cache while mails are being saved. This can be useful even after migration. For example a user might normally use their mobile app IMAP client, but once a few months they would login to the webmail. Dovecot would normally preserve the fields used by the mobile IMAP client, but drop the extra fields used only by webmail after a month. This might not be wanted. This can be configured with:

* ``mail_cache_fields``: List of fields that are initially cached for newly created users. Afterwards the caching decisions will live on based on the user's IMAP access patterns. Note that the INBOX's caching decisions are copied to newly created folders.

* ``mail_always_cache_fields``: List of fields that are always cached for everyone. These fields won't get dropped automatically even if user never accesses them.

* ``mail_never_cache_fields``: List of fields that should never be cached. This should probably never include anything other than imap.envelope, which isn't needed because it can be generated from the cached header fields.

The list of cached fields depends on which IMAP clients are expected to be used. These are commonly used:

* IMAP ENVELOPE is used by many clients, which includes: hdr.date hdr.subject hdr.from hdr.sender hdr.reply-to hdr.to hdr.cc hdr.bcc hdr.in-reply-to hdr.message-id

* Open-Xchange:

   * IMAP ENVELOPE

   * flags date.received size.virtual imap.bodystructure mime.parts hdr.importance hdr.x-priority hdr.references body.snippet

   * There also seems to be a new X-Open-Xchange-Share-URL header, which is probably wanted?

* POP3 clients: size.virtual pop3.uidl pop3.order

* iOS 9.3.1:

   * Some (but not all) of the IMAP ENVELOPE headers: hdr.date hdr.subject hdr.from hdr.tohdr.cc hdr.bcc hdr.message-id hdr.in-reply-to
   * hdr.content-type hdr.references

* K9: date subject from content-type to cc reply-to message-id references in-reply-to X-K9mail-Identity