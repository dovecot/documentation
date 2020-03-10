.. _dovecot_backend:

==================
Dovecot Backend
==================

The Dovecot Backend does all the hard work of reading and writing mails to storage and handling all of the ``IMAP/POP3/LMTP`` protocols. Dovecot Backend is connected to the object storage where users' mails and mail indexes are stored.

As a user is connecting to Dovecot for reading mails, the user's mail indexes are fetched from the object storage and cached in local file system. The mail indexes are updated locally while the user does mailbox modifications. The modified local indexes are uploaded back to object storage on background every ``5 minutes``, except for ``LMTP`` mail deliveries. With ``LMTP`` mail deliveries the indexes are uploaded only every ``10th mail`` (see :ref:`plugin-obox-storage-setting_obox_max_rescan_mail_count`) to avoid unnecessary object storage writes. The index updates for ``LMTP`` deliveries don't contain anything that can't be recreated from the mails themselves.

Dovecot Backends are stateless, so should the server crash the only thing lost for the logged in users are the recent message flag updates. When user logs in the next time to another backend, the indexes are fetched again from the object storage to local cache. Because ``LMTP`` mail deliveries don't update indexes immediately, the email objects are also listed once for each accessed folder to find out if there are any newly delivered mails that don't exist yet in the index.

Dovecot backends attempt to do as much in local cache as possible to minimize the object storage ``I/O``. The larger the local cache the less object storage I/O there is. Typically you can count that each backend should have at least 2 MB of local cache allocated for its active users (e.g. if there are ``100 000`` users per backend who are receiving mails or who are accessing mails within ``15 minutes``, there should be at least ``200 GB of local`` cache on the backend).

It's important that the local cache doesn't become a bottleneck, so ideally it would be using ``SSDs``. Alternatives are to use ``in-memory disk (tmpfs)`` or filesystem on ``SAN`` that provides enough disk ``IOPS``. (``NFS`` should not be used for local cache.) Dovecot never uses fsyncing when writing to local cache, so after a server crash the cache may be inconsistent or corrupted. This is why the caches should be deleted at server bootup, although Dovecot also attempts to keep track of crashes internally and won't open an index that was potentially corrupted.