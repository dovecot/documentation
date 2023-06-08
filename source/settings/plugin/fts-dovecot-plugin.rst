.. _plugin-fts-dovecot:

==================
fts-dovecot plugin
==================

.. important:: The Dovecot FTS driver is a part of :ref:`ox_dovecot_pro` only.

.. seealso:: See :ref:`fts_backend_dovecot` for detailed information.

Settings
========

.. dovecot_plugin:setting:: fts_dovecot_mail_flush_interval
   :added: 2.3.5 defaults was 0
   :changed: 3.0.0 defaults changes from 0 to 10
   :default: 10
   :plugin: fts-dovecot
   :values: @uint

   Upload locally cached FTS indexes to object storage every N new emails.
   This reduces the number of emails that have to be read after backend
   failure to update the FTS indexes, but at the cost of doing more writes to
   object storage.


.. dovecot_plugin:setting:: fts_dovecot_max_triplets
   :added: 2.3.15 defaults was 0
   :changed: 3.0.0 defaults changes from 0 to 200
   :default: 200
   :plugin: fts-dovecot
   :values: @uint

   FTS lookups will fail and error message will be logged, when the number of
   triplets exceeds the threshold specified in the setting. ``0`` means there
   is no maximum number of triplets to be exceeded.


.. dovecot_plugin:setting:: fts_dovecot_min_merge_l_file_size
   :added: 2.3.5
   :default: 128 kB
   :plugin: fts-dovecot
   :values: @size

   The smallest FTS triplet is getting recreated whenever indexing new mails
   until it reaches this size. Then the triplet becomes merged with the next
   largest triplet.

   When fts-cache is used, this effectively controls how large the fts.L file
   can become in metacache until the FTS triplet is uploaded to object
   storage.


.. dovecot_plugin:setting:: fts_dovecot_fs
   :plugin: fts-dovecot
   :seealso: @obox_fs;dovecot_plugin, @mail_location;dovecot_core
   :values: @string

   Define the location for the fts cache and indexes path on remote
   filesystems.

   It must be somewhat synchronized with :dovecot_plugin:ref:`obox_fs` and
   :dovecot_core:ref:`mail_location`.

   It is strongly recommended to use :ref:`fscache` to speed up
   :ref:`obox <obox_settings>` and Dovecot FTS Engine operation.

   It is recommended that the FTS and email fscaches point to *DIFFERENT*
   locations.

   A simple example with local storage for FTS:

   .. code-block:: none

     mail_plugins = $mail_plugins fts fts_dovecot

     plugin {
       fts = dovecot
       fts_dovecot_fs = posix:prefix=/var/fts/%u/
     }

   Example configurations for different object storage backends:

   * :ref:`dictmap_example_configuration`
   * :ref:`s3_example_configuration`


.. dovecot_plugin:setting:: fts_dovecot_prefix
   :added: 2.3.5
   :default: no
   :plugin: fts-dovecot
   :values: @string

   Specifies how prefix search should be invoked. May not work with some
   filters.

   Options:

   ================== ==================================================
   Value              Description
   ================== ==================================================
   ``yes``            Equivalent to ``0-255``
   ``<num>-[<num>]``  Search strings with that length will be treated as
                      prefixes (e.g. ``4-``, ``3-10``)
   ``no``             No prefix searching is performed.
   ================== ==================================================

.. dovecot_plugin:setting:: fts_dovecot_message_count_stats
   :added: 2.3.21
   :default: no
   :plugin: fts-dovecot
   :values: @string

   Enable tracking per-folder message counts in fts.S stats file. This is
   useful for the :ref:`"doveadm fts check fast" command
   <fts_dovecot_consistency_check>` to return per-folder results. Note that
   this changes the fts.S file format to be backwards incompatible, so this
   should be enabled only after all backends in the cluster have been upgraded.
   Old Dovecot versions won't fail when they see the new fts.S file, but it
   needs to be regenerated, which can temporarily cause bad performance.
