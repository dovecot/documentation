.. _obox_background:

======================
 Obox Background
======================

Dovecot **obox** format (object storage mailbox) was designed from the
beginning to use simple blob storage to store all the email data and metadata.
It doesn't require separate metadata storage, but for it to function properly
it requires the ability to list (a few) index objects quickly.

For better reliability it's also good if possible to list all the stored email
objects, although the performance of that doesn't need to be as good since it's
only done in failover and error handling situations.

The requirement to be able to list objects complicates the object storage
design though.

Many object storages can't handle the listing at all, while others handle it
inefficiently and/or by placing extra restrictions on how the storage can be
used.

This has especially become a problem in multi-site installations.

For this reason, Dovecot has implemented the ability to store the object name
(``Dovecot ID``) to Object ID mapping(s) in a separate database.

The object listing is done via this database and only Object IDs need to be
accessed from the primary object storage (ID access is normally the best
performing interface to the object storage backend).

Because the Dovecot IDs and Object IDs are small, the total size of this
database will also be small and independent of the message data size.

The Dovecot ID to Object ID mapping database is accessed via Dovecot's simple
``dict API``. The current implementation is heavily optimized for Cassandra
but, in theory, any kind of a key-value database could be used.
