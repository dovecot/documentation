.. _plugin-fts-dovecot:

===========================
fts-dovecot plugin
===========================

.. _plugin-fts-dovecot-setting-fts_dovecot_fs:

``fts_dovecot_fs``
-------------------

- Default: <empty>

Define the location for the fts cache and indexes path on remote filesystems.

It must be somewhat synchronized with :ref:`plugin-obox-setting_obox_fs` and ``mail_location``, see also :ref:`mail_location_settings`.

It is strongly recommended to use fscache to speed up Obox and Dovecot FTS operation.
It is recommended that the FTS and email fscaches point to DIFFERENT locations.

A simple example with local storage for FTS::

  mail_plugins = $mail_plugins fts fts_dovecot

  plugin {
    fts = dovecot
    fts_dovecot_fs = posix:prefix=/var/fts/%u/
  }

Example configurations for different object storage backends:

 * :ref:`dictmap_example_configuration`
 * :ref:`s3_example_configuration`


.. _plugin-fts-dovecot-setting-fts_dovecot_filename_sizes:

``fts_dovecot_filename_sizes``
------------------------------

- Default: <empty>

Specifies whether or no filenames should contain the file size.

Example::

  fts.D_238a58274822005cc3350000654d370e.000000b1-00000698.0001   # with size (0x698 == 1688 bytes)
  fts.D_bc75a6128d5fff5b83070000654d370e.00000046.0001            # without size

The possible values are:

  * ``yes``: Include sizes in new triplets' filenames (recommended for fresh installations)
  * ``no``: Do not include sizes in new triplets' filenames
  * ``yes-force``: like ``yes``, but running ``doveadm fts optimize`` will replace all triplets with new ones using sizes in the filenames
  * ``no-force``: like ``no``, but running ``doveadm fts optimize`` will replace all triplets with new ones not using sizes in the filenames


.. _plugin-fts-dovecot-setting-fts_dovecot_prefix:

``fts_dovecot_prefix``
----------------------

.. versionadded:: v2.3.5

- Default: ``no``

Specifies how prefix search should be invoked. May not work with some
filters.

Options:

  * ``yes``: equivalent to ``0-255``
  * ``<num>-[<num>]``: search strings with that length will be treated as prefixes (e.g. "4-", "3-10")
  * ``no`` : no prefix searching is performed (this is the default)


.. _plugin-fts-dovecot-setting-fts_dovecot_min_merge_l_file_size:

``fts_dovecot_min_merge_l_file_size``
-------------------------------------

.. versionadded:: v2.3.5

- Default: ``128 kB``

The smallest FTS triplet is getting recreated whenever indexing new mails until
it reaches this size. Then the triplet becomes merged with the next largest
triplet.

When fts-cache is used, this effectively controls how large the fts.L file
can become in metacache until the FTS triplet is uploaded to object storage.


.. _plugin-fts-dovecot-setting-fts_dovecot_mail_flush_interval:

``fts_dovecot_mail_flush_interval``
-----------------------------------

.. versionadded:: v2.3.5

- Default: ``0`` (none)

Upload locally cached FTS indexes to object storage every N new emails. This
reduces the number of emails that have to be read after backend failure to
update the FTS indexes, but at the cost of doing more writes to object storage.

The recommended value is 10. This will become the default in some future
version.
