.. _obox_settings_advanced:

======================
Obox Advanced Settings
======================

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

.. _plugin-obox-setting_obox_mailbox_list_quick_lookups:

``obox_mailbox_list_quick_lookups``
-----------------------------------

- Default: ``no``
- Values: :ref:`boolean`

This setting avoids downloading mailboxes to metacache if the mailbox already
exists in dovecot.list.index, even though it's not known whether it's
up-to-date or not. Any mailboxes with special use flags will be fully
refreshed though.

The most useful use case for this is with LMTP to avoid quota checks from
opening many mailboxes. In theory it could be used also with IMAP to give
quick STATUS replies, but that might cause more problems since the counters
could be wrong.

.. Warning:: This setting may still be slightly dangerous to use. If the
             user has gone above quota and afterwards deleted some mails from
             non-INBOX, non-specialuse folders and subsequently was moved to
             another backend without flushing the indexes, Dovecot may not
             realize that the user is now below quota. There are plans to
             change this so that if user appears to be over quota, the quota
             is strictly calculated before returning over quota failures or
             executing any quota warning/over scripts.

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

The ``metacache_size_weights`` contains ``<percentage> <weight adjustment>``
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
