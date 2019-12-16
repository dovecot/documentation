.. _scality_sproxyd:

======================
 Scality sproxyd
======================

sproxy driver requires Cassandra.  Cassandra portions of the configuration
(``dictmap/refcounting``) is explained in the Cassandra section.

Example sproxyd configuration:

.. code-block:: none

  mail_location = obox:%u:INDEX=~/:CONTROL=~/
  plugin {
    obox_fs = fscache:1G:/var/cache/mails:compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2 ; refcounting-table:lockdir=/tmp:bucket-size=10000:bucket-cache=%h/buckets.cache:nlinks-limit=3
    obox_index_fs = compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=2 ; diff-table
    fts_dovecot_fs = fts-cache:fscache:1G:/var/cache/mails: compress:gz:6:dictmap:proxy:dict-async:cassandra ; sproxyd:http://sproxyd.scality.example.com/?class=1 ; dict-prefix=%u/fts/
  }

The ``class=2`` specifies that Dovecot uses sproxyd with Class of Service value
2, which means that the objects are written to the Scality RING 3 times.  This
is generally the minimum allowable redundancy for mail and index objects.

FTS data is more easily reproducible, so losing those indexes is not as
critical; Class of Service 1 (as used in example above) may be appropriate
based on customer requirements.

Dovecot uses its own Scality key format, which encodes the object type also to
the key itself.

Replace ``gz`` with ``maybe-gz`` if compression was not activated when the
storage bucket was created.  Ensure that ``zlib_save`` is not active if
``compress`` is active in obox plugin settings.

See also
********

.. toctree::
  :maxdepth: 1

  scality_sproxyd_dictmap

  key_format

  compression
