.. _obox_settings:

=============
Obox Settings
=============

.. Note:: 

   These settings are assuming that message data is being stored in object storage (obox mailbox). These settings should not be used if a block storage driver (e.g. mdbox) is being used. 

obox drivers
------------

 * :ref:`scality_sproxyd`
 * :ref:`microsoft_azure`
 * :ref:`scality_cdmi`
 * :ref:`openstack_swift`
 * :ref:`amazon_s3`
 * :ref:`other_s3_compatible_storages`


obox plugin settings
--------------------

.. code-block:: none

   mail_plugins = $mail_plugins obox

Enable obox plugin.

.. code-block:: none

   mail_prefetch_count = 10

How many mails to download in parallel from object storage.

A higher number improves the performance, but also increases the local disk
usage and number of used file descriptors.

.. code-block:: none

   plugin {
     obox_max_parallel_writes = $mail_prefetch_count
     obox_max_parallel_copies = $mail_prefetch_count
     obox_max_parallel_deletes = $mail_prefetch_count
   }

Override mail_prefetch_count setting for writes, copies, or deletes. They
default to mail_prefetch_count.

.. code-block:: none

   plugin {
     metacache_max_space = 200G
   }

How much disk space metacache can use before old data is cleaned up.

Generally, this should be set at ~90% of the available disk space.

.. code-block:: none

   plugin {
     metacache_max_grace = 10G
   }

How much disk space on top of metacache_max_space can be used before
Dovecot stops allowing more users to login.

.. code-block:: none

   plugin {
     # Needed only with v2.2.x:
     obox_use_object_ids = yes
     metacache_delay_uploads = yes
   }

These settings need to be used with v2.2. These settings have been removed
since v2.3.0 and enabled by default.

.. code-block:: none

   plugin {
     metacache_upload_interval = 5min
   }

How often to upload important index changes to object storage? This mainly
means that if a backend crashes during this time, message flag changes within
this time may be lost. A longer time can however reduce the number of index
bundle uploads.

.. code-block:: none

   plugin {
     metacache_close_delay = 2secs
   }

If user was accessed this recently, assume the user's indexes are up-to-date.
If not, list index bundles in object storage (or Cassandra) to see if they
have changed. This typically matters only when user is being moved to another
backend and soon back again, or if the user is simultaneously being accessed
by multiple backends. Default is 2 seconds.

Must be less than :ref:`setting-director_user_expire` (Default: 15min).

See :ref:`plugin-obox` for additional plugin options.

See :ref:`obox_settings_advanced` for additional, advanced obox settings.

Obox Metacache Maintenance
--------------------------

It can be useful to flush unimportant changes in metacache every night when
the system has idle capacity. This way if users are moved between backends,
there's somewhat less work to do on the new backends since caches are more
up-to-date. This can be done by running ``doveadm metacache flushall`` in a
cronjob.

Core settings
-------------

.. code-block:: none

   mail_home = /var/vmail/%2Mu/%u

Specifies the location for the local mail cache directory. This will contain Dovecot index files and it needs to be high performance (e.g. SSD storage). Alternatively, if there is enough memory available to hold all concurrent users' data at once, a tmpfs would work as well. The "%2Mu" takes the first 2 chars of the MD5 hash of the username so everything isn't in one directory. 

.. code-block:: none

   mail_uid = vmail
   mail_gid = vmail

UNIX UID & GID which are used to access the local cache mail files. 

.. code-block:: none

   mail_fsync = never

We can disable fsync()ing for better performance. It's not a problem if locally cached index file modifications are lost. 

.. code-block:: none

   mail_temp_dir = /tmp

Directory where downloaded/uploaded mails are temporarily stored to. Ideally all of these would stay in memory and never hit the disk, but in some situations the mails may have to be kept for a somewhat longer time and it ends up in disk. So there should be enough disk space available in the temporary filesystem. 

.. NOTE::

   /tmp should be a good choice on any recent OS, as it normally points to /dev/shm, so this temporary data is stored in memory and will never be written to disk. However, this should be checked on a per installation basis to ensure that it is true.

.. code-block:: none

   mailbox_list_index = yes

Enable mailbox list indexes. This is required with obox format.

.. code-block:: none

   mailbox_list_index_include_inbox = yes

If LISTINDEX resides in tmpfs, INBOX status should be included in list index.

.. toctree::
   :maxdepth: 1
   :glob:

   *
