.. _fs:

===================
Dovecot Filesystems
===================

Dovecot's lib-fs is a simplified API to access filesystems and databases that
can be made to look similar to filesystems. It is a bit similar to
:ref:`dict`, but generally dict is used for small data and fs is used for
larger data.

Currently supported FS backends are:

=============================================== =============================
Name                                            Description
=============================================== =============================
:ref:`posix <fs-posix>`                         POSIX filesystem
:ref:`dict <fs-dict>`                           Dictionary (lib-dict wrapper)
:ref:`s3 <fs-s3>`                               S3 object storage
:ref:`aws-s3 <fs-aws-s3>`                       AWS S3 object storage
:ref:`sproxyd <fs-sproxyd>`                     Scality sproxyd object storage
:ref:`scality <fs-scality>`                     Scality CDMI object storage
=============================================== =============================

Wrapper backends used on top of other backends:

=============================================== =============================
Name                                            Description
=============================================== =============================
:ref:`metawrap <fs-metawrap>`                   File metadata
:ref:`crypt <fs-crypt>`                         File encryption
:ref:`compress <fs-compress>`                   File compression
:ref:`dictmap <fs-dictmap>`                     Use dict for file listing
:ref:`fscache <fs-fscache>`                     Local file cache
:ref:`fts-cache <fs-fts-cache>`                 Local FTS cache
=============================================== =============================

.. _fs-posix:

POSIX Filesystem
----------------

Regular POSIX filesystem. It can also be used with NFS. It doesn't support
file metadata, so you likely want to use also :ref:`fs-metawrap`.

Settings
^^^^^^^^

.. dovecot_core:setting:: fs_posix_lock_method
   :values: flock, dotlock
   :default: flock

   Lock method to use for locking files. Currently nothing uses lib-fs locking.


.. dovecot_core:setting:: fs_posix_prefix
   :values: @string

   Directory prefix where files are read/written to. Note that the trailing
   ``/`` is not automatically added, so using e.g. ``/tmp/foo`` as prefix will
   cause ``/tmp/foofilename`` to be created.


.. dovecot_core:setting:: fs_posix_mode
   :values: @uint
   :default: 0600

   Mode to use for creating files.


.. dovecot_core:setting:: fs_posix_autodelete_empty_directories
   :values: @boolean
   :default: yes

   If the last file in a directory is deleted, should the parent directory be
   automatically deleted? Using this setting makes the POSIX filesystem behave
   more like an object storage would.


.. dovecot_core:setting:: fs_posix_fsync
   :values: @boolean
   :default: yes

   Should ``fsync()`` be called after writes to guarantee that it's written to
   disk?


.. dovecot_core:setting:: fs_posix_accurate_mtime
   :values: @boolean
   :default: no

   Should ``utimes()`` be called after writes to guarantee microsecond
   precision timestamps for files? By default Linux updates the mtime only on
   timer interrupts, which doesn't anywhere close to being microsecond
   precision. This is likely not useful outside testing.


.. _fs-dict:

Dictionary Filesystem
---------------------

This is a wrapper for lib-dict for using dict backends as fs backends.

Settings
^^^^^^^^

.. dovecot_core:setting:: fs_dict_value_encoding
   :values: raw, hex, base64
   :default: raw

   How to encode file content into the dict value.


.. _fs-metawrap:

Metawrap Filesystem
-------------------

This is a wrapper for other fs backends that don't support metadata. The
metadata is implemented by placing them into the beginning of the file content.
