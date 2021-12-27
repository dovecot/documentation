.. _scality_key_format:

==========================
Scality sproxyd Key Format
==========================

Scality sproxyd key format (160 bits)
-------------------------------------

========= ===========
Size      Description
========= ===========
152 bits  Entropy
4 bits    Class
4 bits    Replica
========= ===========

"Entropy" Component
-------------------

Definition of entropy component of Scality's Universal Key Scheme (UKS):

========= ==========================
Size      Description
========= ==========================
24 bits   Dispersion (**important**)
64 bits   Object ID
32 bits   Volume ID
8 bits    Service ID (**important**)
24 bits   App-specific
========= ==========================

So if we use 128 bit MD5 of the GUID as our unique key, this means we can do:

========= ============================================================
Size      Description
========= ============================================================
120 bits  MD5 part prefix (``md5(timestamp + process id + hostname)``)
8 bits    Service ID = ``FS_SPROXYD_SERVICE_ID_DOVECOT = 0x83``
8 bits    MD5 part suffix
8 bits    Object type (*see below*)
8 bits    Unused (``0x00``)
4 bits    Class ID (configurable)
4 bits    Replica ID (``0x00``)
========= ============================================================

Where "object type" is:

=========================================== ======================
Internal Type                               Value
=========================================== ======================
``FS_SPROXYD_OBJECT_TYPE_UNKNOWN``          ``0x00``
``FS_SPROXYD_OBJECT_TYPE_MAIL``             ``0x01``
``FS_SPROXYD_OBJECT_TYPE_OLD_FTS_INDEX``    ``0x02``
``FS_SPROXYD_OBJECT_TYPE_FTS_INDEX``        ``0x03``
``FS_SPROXYD_OBJECT_TYPE_USER_INDEX_SELF``  ``0x08 | 0x01``
``FS_SPROXYD_OBJECT_TYPE_USER_INDEX_BASE``  ``0x08 | 0x02``
``FS_SPROXYD_OBJECT_TYPE_USER_INDEX_DIFF``  ``0x08 | 0x03``
``FS_SPROXYD_OBJECT_TYPE_BOX_INDEX_SELF``   ``0x08 | 0x04 | 0x01``
``FS_SPROXYD_OBJECT_TYPE_BOX_INDEX_BASE``   ``0x08 | 0x04 | 0x02``
``FS_SPROXYD_OBJECT_TYPE_BOX_INDEX_DIFF``   ``0x08 | 0x04 | 0x03``
=========================================== ======================

For listing index objects, these can be helpful masks:

=========================================== =========
Internal Type                               Value
=========================================== =========
``FS_SPROXYD_OBJECT_TYPE_BIT_INDEX``         ``0x08``
``FS_SPROXYD_OBJECT_TYPE_BIT_BOX_INDEX``     ``0x04``
``FS_SPROXYD_OBJECT_TYPE_BIT_DIFF_OR_SELF``  ``0x01``
=========================================== =========

Script
------

The ``scality-keys.pl`` script installed with the obox package takes a 160bit
hex-encoded sproxyd Scality ID as input and outputs the object type.
