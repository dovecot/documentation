.. _plugin-fts-dovecot:

==================
fts-dovecot plugin
==================

.. important:: The Dovecot FTS driver is a part of
               :ref:`OX Dovecot Pro <ox_dovecot_pro_releases>` only.

.. seealso:: See :ref:`fts_backend_dovecot` for detailed information.

Settings
========

.. _plugin-fts-dovecot-setting-fts_dovecot_mail_flush_interval:

``fts_dovecot_mail_flush_interval``
-----------------------------------

.. versionadded:: v2.3.5

- Default: ``0`` (none)
- Values:  :ref:`uint`

Upload locally cached FTS indexes to object storage every N new emails. This
reduces the number of emails that have to be read after backend failure to
update the FTS indexes, but at the cost of doing more writes to object storage.

The recommended value is ``10``. This will become the default in some future
version.


.. _plugin-fts-dovecot-setting-fts_dovecot_max_triplets:

``fts_dovecot_max_triplets``
----------------------------

.. versionadded:: v2.3.15

- Default: ``0`` (unlimited)
- Values:  :ref:`uint`

FTS lookups will fail and error message will be logged, when the number of
triplets exceeds the threshold specified in the setting. ``0`` means there is
no maximum number of triplets to be exceeded.

The recommended value is ``200``. This will become the default in some future
version.


.. _plugin-fts-dovecot-setting-fts_dovecot_min_merge_l_file_size:

``fts_dovecot_min_merge_l_file_size``
-------------------------------------

.. versionadded:: v2.3.5

- Default: ``128 kB``
- Values:  :ref:`size`

The smallest FTS triplet is getting recreated whenever indexing new mails until
it reaches this size. Then the triplet becomes merged with the next largest
triplet.

When fts-cache is used, this effectively controls how large the fts.L file
can become in metacache until the FTS triplet is uploaded to object storage.


.. _plugin-fts-dovecot-setting-fts_dovecot_fs:

``fts_dovecot_fs``
------------------

- Default: <empty>
- Values:  :ref:`string`

Define the location for the fts cache and indexes path on remote filesystems.

It must be somewhat synchronized with :ref:`plugin-obox-setting_obox_fs` and
:ref:`setting-mail_location`.

It is strongly recommended to use :ref:`fscache` to speed up
:ref:`obox <obox_settings>` and Dovecot FTS Engine operation.

It is recommended that the FTS and email fscaches point to *DIFFERENT*
locations.

A simple example with local storage for FTS::

  mail_plugins = $mail_plugins fts fts_dovecot

  plugin {
    fts = dovecot
    fts_dovecot_fs = posix:prefix=/var/fts/%u/
  }

Example configurations for different object storage backends:

* :ref:`dictmap_example_configuration`
* :ref:`s3_example_configuration`


.. _plugin-fts-dovecot-setting-fts_dovecot_prefix:

``fts_dovecot_prefix``
----------------------

.. versionadded:: v2.3.5

- Default: ``no``
- Values:  :ref:`string`

Specifies how prefix search should be invoked. May not work with some filters.

Options:

================== ===========================================================
Value              Description
================== ===========================================================
``yes``            Equivalent to ``0-255``
``<num>-[<num>]``  Search strings with that length will be treated as prefixes
                   (e.g. ``4-``, ``3-10``)
``no``             No prefix searching is performed.
================== ===========================================================
