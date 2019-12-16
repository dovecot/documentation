.. _obox_settings:

====================
Obox Settings
====================

.. code-block:: none
   
   mail_plugins = $mail_plugins obox

Enable obox plugin.

.. code-block:: none

   mail_prefetch_count = 10

How many mails to download in parallel from object storage. A higher number improves the performance, but also increases the local disk usage and number of used file descriptors. This setting is also the default for obox_max_parallel_* settings below. 

.. code-block:: none
   
   plugin {
    obox_use_object_ids = yes
   }

Store object IDs to Dovecot indexes (Now the default).  Can also use ``obox_dont_use_object_ids`` to disable this behavior.  

.. code-block:: none

   plugin {
    metacache_max_space = 200G
   }

How much disk space metacache can use before old data is cleaned up. (Normally ~90% of the available disk space.)

.. code-block:: none

   plugin {
    metacache_delay_uploads = yes
   }

Avoid uploading indexes at the cost of more GETs on failures. Must be set in v2.2. In v2.3 it's enabled by default and cannot be disabled.

.. code-block:: none

   plugin {
    metacache_upload_interval = 5min
   }

How often to upload modified indexes to object storage? (This is done in the background; Default 5 min.)

.. code-block:: none

   plugin {
    obox_max_rescan_mail_count = 10
   }

If delayed index uploads are enabled, upload indexes anyway after this many mails have been saved. (Default is 10.)

.. code-block:: none

   plugin {
    metacache_close_delay = 5 min
   }

If user was accessed this recently, assume the user's indexes are up-to-date. If not, list index bundles in object storage (or Cassandra) to see if they have changed. This typically matters only when user is being moved to another backend and soon back again, or if the user is simultaneously being accessed by multiple backends. Default is 2 seconds,  Must be less than director_user_expire (15min).

.. code-block:: none

   plugin {
    obox_max_parallel_writes = $mail_prefetch_count
    obox_max_parallel_copies = $mail_prefetch_count
    obox_max_parallel_deletes = $mail_prefetch_count
   }

Override mail_prefetch_count setting for writes, copies, or deletes.

.. code-block:: none

   plugin {
    obox_track_copy_flags = yes
   }

Enable only if Cassandra & lazy_expunge plugin are used: Try to avoid Cassandra SELECTs when expunging mails. 

.. code-block:: none

   plugin {
    obox_size_missing_action = warn-read|read|stat
   }

This setting controls what should be done when the mail object is missing the size metadata. Default (warn-read) is to log a warning and fallback to reading the email to calculate its size. "read" is the same but doesn't log a warning. stat uses fs_stat() to get the size, which is the fastest but doesn't work if mails are e.g. compressed or encrypted.

.. code-block:: none

   plugin {
    obox_autofix_storage = no
   }

If activated, when an unexpected 404 is found when retrieving a message from object storage, Dovecot will rescan the mailbox by listing its objects. If the 404-object is still listed in this query, Dovecot issues a HEAD to determine if the message actually exists. If this HEAD request returns a 404, the message is dropped from the index. The message object is not removed from the object storage. THIS SHOULD NORMALLY NOT BE ACTIVATED.

.. code-block:: none

   plugin {
    obox_mailbox_list_quick_lookups = yes
   }

This setting avoids downloading mailboxes to metacache if the mailbox already exists in dovecot.list.index, even though it's not known whether it's up-to-date or not. Any mailboxes with special_use flags will be fully refreshed though.
Probably the most useful use case for this is with LMTP to avoid quota checks from opening a lot of mailboxes. In theory it could be used also with IMAP to give quick STATUS replies, but that might cause more problems since the counters could be wrong.

.. Warning:: This setting may still be slightly dangerous to use. If the user has gone above quota and afterwards deleted some mails from non-INBOX, non-specialuse folders and afterwards was moved to another backend without flushing the indexes, Dovecot may not realize that the user is now below quota. We are still planning to change this so that if user appears to be over quota, the quota is strictly calculated before returning over quota failures or executing any quota warning/over scripts.

.. code-block:: none

   metacache_priority_weights = 10% +1d 10% +1d 50% +1h 100% 0
   metacache_size_weights = 2M +30 1G +120

Whenever metacache notices that metacache_max_space has been reached, it needs to delete some older index files to make space for new ones. This is done by calculating cleanup weights. The simplest cleanup weight is to just use the user's last access UNIX timestamp as the weight. The lowest weight gets deleted first. It's possible to enable using only simple weights by explicitly setting ``metacache_priority_weights`` and ``metacache_size_weights`` to empty values. However, by default priorities are taken into account when calculating the weight:

The metacache_priority_weights setting can be used to fine tune how metacache adjusts the cleanup weights for different index priorities. There are 4 major priorities (these are also visible in e.g. "doveadm metacache list" output):

 * 0 = User root indexes (highest priority)
 * 1 = FTS indexes
 * 2 = INBOX and \Junk folder indexes
 * 3 = other folders' indexes (lowest priority)

The metacache_size_weights contains <percentage> <weight adjustment> pairs for each of these priorities.So for example the first "10% +1d" applies to the user root priority and the last "100% 0" applies to other folders' priority. The weight calculation is then done by:

 * Initial weight is the user's last access UNIX timestamp
 * metacache_priority_weights is next looked up for the given priority indexes, 
 
 Example:

.. code-block:: none 
   
    10% +1d

 * If the total disk space used by the indexes is equal or less than the <percentage>, add <weight adjustment> to weight. So for example with 10% +1d if the disk space used by index files of this priority type take <= 10% of metacache_max_space, increase the weight by 1d = 60*60*24 = 86400.
   * Because the initial weight is based on UNIX timestamp, the weight adjustment is also given as time. This practically means that e.g. +1d typically gives 1 extra day for the index files to exist compared to index files that don't have the weight boost.
   * The <percentage> exists so that the weight boost doesn't cause some index files to dominate too much. For example if root indexes' weights weren't limited, it could be possible that the system would be full of only root indexes and active users' other indexes would be cleaned almost immediately.

The metacache_size_weights setting is used to do final adjustments depending on the disk space used by this user's indexes of the specific priority. The setting is in format <low size> <low weight adjustment> <max size> <high weight adjustment>. The weight adjustment calculation is:

 * If disk space is equal or less than <low size>, increase weight by (<low size> - <disk space>) * <low weight adjustment> / <low size>
 * Otherwise, cap the <disk space> to <max size> and increase weight by (<disk space> - <low size>) * <high weight adjustment> / (<max size> - <low size>)
 * The idea here is to give extra weight boost for
   * small indexes, because they're small enough that it won't matter if they live longer than most and
   * very large indexes, because it's so expensive to keep uploading/downloading them in object storage
 * With the default "2M +30 1G +120" value the priority adjustments will look like:
   * 0 kB: +30
   * 500 kB: +23
   * 1 MB: +15
   * 1,5 MB: +8
   * 2 MB: 0
   * 10 MB: +1
   * 50 MB: +6
   * 100 MB: +12
   * 258 MB: +30
   * 500 MB: +60
   * >=1 GB: +120

The rest of the obox settings are specific to the object storage backend that is used. 

It can be useful to flush unimportant changes in metacache every night when the system has idle capacity. This way if users are moved between backends, there's somewhat less work to do on the new backends since caches are more up-to-date. This can be done by running "doveadm metacache flushall" in a cronjob.
