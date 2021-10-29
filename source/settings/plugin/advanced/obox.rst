.. _obox_settings_advanced:

======================
Obox Advanced Settings
======================

.. _plugin-obox-setting_obox_avoid_cached_vsize:

``obox_avoid_cached_vsize``
----------------------------

- Default: ``no``
- Values: :ref:`boolean`

Avoid getting the email's size from the cache whenever the email body is
opened anyway. This avoid unnecessary errors if a lot of the vsizes are wrong.
The vsize in dovecot.index is also automatically updated to the fixes value
with or without this setting. This setting was mainly useful due to earlier
bugs that caused the vsize to be wrong in many cases.


.. _plugin-obox-setting_obox_dont_use_object_ids:

``obox_dont_use_object_ids``
----------------------------

- Default: ``no``
- Values: :ref:`boolean`

.. versionadded:: v2.3.0

This is the reverse of :ref:`plugin-obox-setting_obox_use_object_ids` with
newer Dovecot versions. See its description for more details.

.. _plugin-obox-setting_obox_allow_inconsistency:

``obox_allow_inconsistency``
----------------------------

- Default: ``no``
- Values: :ref:`boolean`

Even in case of object storage errors, try to allow accessing the emails as well as possible. This especially means that if the local metacache already has a copy of the indexes, they can be used to provide access to user's emails even if the object storage is unavailable.


.. _plugin-obox-setting_obox_allow_nonreproducible_uids:

``obox_allow_nonreproducible_uids``
-----------------------------------

- Default: ``no``
- Values: :ref:`boolean`


.. versionadded:: v2.3.6

Normally Dovecot attempts to make sure that IMAP UIDs aren't lost even if
a backend crashes (or if user is moved to another backend without indexes first
being uploaded). This requires uploading index bundles whenever expunging
recently saved mails. Setting this to "yes" avoids this extra index bundle
upload at the cost of potentially changing IMAP UIDs. This could cause caching
IMAP clients to become confused, possibly even causing it delete wrong mails.
Also FTS indexes may become inconsistent since they also rely on UIDs.
Normally this setting should not be enabled and it may be removed in a future version.


.. _plugin-obox-setting_obox_fetch_lost_mails_as_empty:

``obox_fetch_lost_mails_as_empty``
----------------------------------

- Default: ``no``
- Values: :ref:`boolean`

Cassandra: `Object exists in dict, but not in storage` errors will be handled
by returning empty emails to the IMAP client. The tagged FETCH response will
be ``OK`` instead of ``NO``.

See :ref:`storage_workarounds` for more details.

.. _plugin-obox-setting_obox_disable_fast_copy:

``obox_disable_fast_copy``
--------------------------

- Default: ``no``
- Values: :ref:`boolean`

Workaround for object storages with a broken copy operation. Instead perform copying by reading and writing the full object.


.. _plugin-obox-setting_obox_username:

``obox_username``
-----------------

- Default: Taken from mail_location setting.
- Values: :ref:`string`

Overrides the obox username in storage. Normally the username is taken from the mail_location setting.


.. _plugin-obox-setting_metacache_socket_path:

``metacache_socket_path``
-------------------------

- Default: ``metacache``
- Values: :ref:`string`

Path to communicate with metacache process. Shouldn't be changed normally.

.. _plugin-obox-setting_metacache_userdb:

``metacache_userdb``
--------------------

- Default: ``metacache/metacache-users.db``
- Values: :ref:`string`

Path to a database which metacache process periodically writes to.
This database is read by metacache at startup to get the latest state.
The path is relative to :ref:`setting-state_dir`.
This setting shouldn't be changed normally.

.. _plugin-obox-setting_obox_lost_mailbox_prefix:

``obox_lost_mailbox_prefix``
----------------------------

- Default: ``recovered-lost-folder-``
- Values: :ref:`string`

If folder name is lost entirely due to lost index files, generate a name for the folder using this prefix. The default is "recovered-lost-folder-".


.. _plugin-obox-setting_obox_no_pop3_backend_uidls:

``obox_no_pop3_backend_uidls``
------------------------------

- Default: ``no``
- Values: :ref:`boolean`

There are no migrated POP3 UIDLs. Don't try to look them up in any situation. Normally this shouldn't be necessary to use.


.. _plugin-obox-setting_metacache_bg_root_uploads:

``metacache_bg_root_uploads``
-----------------------------

- Default: ``no``
- Values: :ref:`boolean`

By default doing changes to folders (e.g. creating or renaming) uploads changes
immediately to object storage. If this setting is enabled, the upload happens
sometimes later (within :ref:`plugin-obox-setting_metacache_upload_interval`).


.. _plugin-obox-setting_obox_autofix_storage:

``obox_autofix_storage``
------------------------

- Default: ``no``
- Values: :ref:`boolean`

If activated, when an unexpected 404 is found when retrieving a message from
object storage, Dovecot will rescan the mailbox by listing its objects. If
the 404-object is still listed in this query, Dovecot issues a HEAD to
determine if the message actually exists. If this HEAD request returns a 404,
the message is dropped from the index. The message object is not removed from
the object storage.

**THIS SHOULD NORMALLY NOT BE SET**

.. _plugin-obox-setting_obox_max_rescan_mail_count:

``obox_max_rescan_mail_count``
------------------------------

- Default: ``10``
- Values: :ref:`uint`

Upload indexes after this many mails have been saved since the last upload.
A higher value reduces the number of uploads, but increases the number of
mail downloads to fill the caches after a backend crash.

.. _plugin-obox-setting_obox_size_missing_action:

``obox_size_missing_action``
----------------------------

- Default: ``warn-read``
- Values: ``warn-read``, ``read`` or ``stat``

This setting controls what should be done when the mail object is missing the
size metadata.

Options:

:``warn-read``: (DEFAULT) Log a warning and fallback to reading the email to
                calculate its size.
:``read``: Same as ``warn-read``, but doesn't log a warning.
:``stat``: Use fs_stat() to get the size, which is the fastest but doesn't
           work if mails are compressed or encrypted.


.. _plugin-obox-setting_metacache_disable_bundle_list_cache:

``metacache_disable_bundle_list_cache``
---------------------------------------

- Default: ``no``
- Values: :ref:`boolean`

Disable caching bundle list. This setting was added to disable it in case there
were bugs in it. This setting is likely to become removed entirely.


.. _plugin-obox-setting_metacache_index_merging:

``metacache_index_merging``
---------------------------

.. versionadded:: v2.3.6

- Default: ``v2``

  .. versionchanged:: v2.3.16 Changed default from v1 to v2

Specifies the algorithm to use when merging folder indexes:

 * ``v1`` - The old dsync-based algorithm, which can cause very inefficient
   behavior in some situations.
 * ``v2`` - The new algorithm designed specifically for this purpose of merging
   two indexes. This is the recommended setting.
 * ``none`` - Alias for :ref:`plugin-obox-setting_metacache_disable_merging`


.. _plugin-obox-setting_metacache_disable_merging:

``metacache_disable_merging``
-----------------------------

- Default: ``no``
- Values: :ref:`boolean`

Disable index merging when opening root or mailbox indexes. This can be used
to work around bugs in the merging code that cause crashes. Usually this
setting isn't set in dovecot.conf, but set via doveadm call:

.. code-block:: none

    doveadm -o plugin/metacache_disable_merging=yes force-resync -u user@example '*'


.. _plugin-obox-setting_metacache_max_parallel_requests:

``metacache_max_parallel_requests``
-----------------------------------

- Default: ``10``
- Values: :ref:`uint`

Maximum number of metacache read/write operations to do in parallel.


.. _plugin-obox-setting_metacache_merge_max_uid_renumbers:

``metacache_merge_max_uid_renumbers``
-------------------------------------

- Default: ``100``
- Values: :ref:`uint`

This is used only with metacache_index_merging=v2. If the merging detects that
there are more than this many UIDs that are conflicting and would have to be
renumbered, don't renumber any of them. This situation isn't expected to happen
normally, and renumbering too many UIDs can cause unnecessary extra disk IO.
The downside is that a caching IMAP client might become confused if it had
previously seen different UIDs.


.. _plugin-obox-setting_metacache_disable_secondary_indexes:

``metacache_disable_secondary_indexes``
---------------------------------------

- Default: ``no``
- Values: :ref:`boolean`

.. versionadded:: v2.3.17

Disable including secondary indexes into the user root bundle when using the
virtual or virtual-attachments plugin (see
:ref:`virtual plugin <virtual_plugin_obox_secondary_indexes>` and
:ref:`virtual-attachments plugin<virtual_attachments_plugin_obox_secondary_indexes>`).
This setting can be used to exclude the virtual and virtual-attachments folders
from the user root bundle in case any problems are encountered.

.. _plugin-obox-setting_metacache_priority_weights:
.. _plugin-obox-setting_metacache_size_weights:

``metacache_priority_weights``
------------------------------

``metacache_size_weights``
------------------------------

.. code-block:: none

   plugin {
     metacache_priority_weights = 10% +1d 10% +1d 50% +1h 100% 0
     metacache_size_weights = 2M +30 1G +120
   }

Whenever metacache notices that ``metacache_max_space`` has been reached, it
needs to delete some older index files to make space for new ones. This is
done by calculating cleanup weights.

The simplest cleanup weight is to just use the user's last access UNIX
timestamp as the weight. The lowest weight gets deleted first.

It's possible to enable using only simple weights by explicitly setting
``metacache_priority_weights`` and ``metacache_size_weights`` to empty
values. However, by default priorities are taken into account when calculating
the weight.

The ``metacache_priority_weights`` setting can be used to fine tune how
metacache adjusts the cleanup weights for different index priorities. There
are 4 major priorities (these are also visible in e.g. ``doveadm metacache
list`` output):

 * 0 = User root indexes (highest priority)
 * 1 = FTS indexes
 * 2 = INBOX and \Junk folder indexes ("special" folders)
 * 3 = Non-special folder indexes (lowest priority)

The ``metacache_priority_weights`` contains ``<percentage> <weight adjustment>``
pairs for each of these priorities. So, for example, the first ``10% +1d``
applies to the user root priority and the last ``100% 0`` applies to other
folders' priority.

The weight calculation is then done by:

 * Initial weight is the user's last access UNIX timestamp
 * ``metacache_priority_weights`` is next looked up for the given priority
   indexes
 * If the total disk space used by the indexes is equal or less than the
   ``<percentage>``, add ``<weight adjustment>`` to weight. So, for example,
   with ``10% +1d`` if the disk space used by index files of this priority
   type take <= 10% of ``metacache_max_space``, increase the weight by
   ``1d = 60*60*24 = 86400``.

  * Because the initial weight is based on UNIX timestamp, the weight
    adjustment is also given as time. This practically means that e.g.
    ``+1d`` typically gives 1 extra day for the index files to exist
    compared to index files that don't have the weight boost.
  * ``<percentage>`` exists so that the weight boost doesn't cause some
    index files to dominate too much. For example, if root indexes' weights
    weren't limited, it could be possible that the system would be full of
    only root indexes and active users' other indexes would be cleaned
    almost immediately.

The ``metacache_size_weights`` setting is used to do final adjustments
depending on the disk space used by this user's indexes of the specific
priority. The setting is in format
``<low size> <low weight adjustment> <max size> <high weight adjustment>``.

The weight adjustment calculation is:

 * If disk space is equal or less than ``<low size>``, increase weight by
   ``(<low size> - <disk space>) * <low weight adjustment> / <low size>``
 * Otherwise, cap the ``<disk space>`` to ``<max size>`` and increase weight
   by ``(<disk space> - <low size>) * <high weight adjustment> / (<max size> - <low size>)``
 * The idea here is to give extra weight boost for

  * Small indexes, because they're small enough that it won't matter if they
    live longer than most, AND
  * Very large indexes, because it's so expensive to keep
    uploading/downloading them in object storage

 * With the default ``2M +30 1G +120`` value the priority adjustments will
   look like:

  * 0 kB: ``+30``
  * 500 kB: ``+23``
  * 1 MB: ``+15``
  * 1,5 MB: ``+8``
  * 2 MB: ``0``
  * 10 MB: ``+1``
  * 50 MB: ``+6``
  * 100 MB: ``+12``
  * 258 MB: ``+30``
  * 500 MB: ``+60``
  * >=1 GB: ``+120``
