.. _s3_object_id_format:

==========================
S3 Object ID Format
==========================

URI Path we write to:

``/<key prefix>/<bucketname>/<dispersion prefix>/<dovecot internal path>``

============================= ====================================================================================
<key prefix> =                 From URL config [optional; empty if not specified]
<bucketname> =                 Either from URL hostname or URL "bucket=" query parameter
<dispersion prefix> =          From mail_location setting. Recommended value (see XXX)
                               gives two levels of dispersion of the format: [0-9a-f]{2}/[0-9a-f]{3}
<dovecot internal path> =      Dovecot internal path to file. Example: $user/mailboxes/$mailboxguid/$messageguid
============================= ====================================================================================

================ =======================================================
$user =           Dovecot unique username (installation defined)
$mailboxguid =    32 byte randomly generated UID defining a mailbox
$messageguid =    32 byte randomly generated UI defining a message blob
================ =======================================================
