.. _obox_settings:

=============
Obox Settings
=============

.. code-block:: none
   
   mail_plugins = $mail_plugins obox

Enable obox plugin.

.. code-block:: none

   mail_prefetch_count = 10

How many mails to download in parallel from object storage.

A higher number improves the performance, but also increases the local disk
usage and number of used file descriptors.

This setting is also the default for ``obox_max_parallel_*`` settings below. 

.. code-block:: none
   
   plugin {
     obox_use_object_ids = yes
   }

Store object IDs to Dovecot indexes (default).

Can also use ``obox_dont_use_object_ids`` to disable this behavior.  

.. code-block:: none

   plugin {
     metacache_max_space = 200G
   }

How much disk space metacache can use before old data is cleaned up.

Generally, this should be set at ~90% of the available disk space.

.. code-block:: none

   plugin {
     metacache_delay_uploads = yes
   }

Avoid uploading indexes at the cost of more GETs on failures.

Must be set in v2.2. In v2.3 it's enabled by default and cannot be disabled.

.. code-block:: none

   plugin {
     metacache_upload_interval = 5min
   }

How often to upload modified indexes to object storage?

.. code-block:: none

   plugin {
     obox_max_rescan_mail_count = 10
   }

If delayed index uploads are enabled, upload indexes anyway after this many
mails have been saved.

.. code-block:: none

   plugin {
     metacache_close_delay = 2secs
   }

If user was accessed this recently, assume the user's indexes are up-to-date.
If not, list index bundles in object storage (or Cassandra) to see if they
have changed. This typically matters only when user is being moved to another
backend and soon back again, or if the user is simultaneously being accessed
by multiple backends. Default is 2 seconds.

Must be less than ``director_user_expire`` (Default: 15min).

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

Enable only if Cassandra & lazy_expunge plugin are used.  If enabled, attempts
to avoid Cassandra SELECTs when expunging mails. 

.. code-block:: none

   plugin {
     obox_size_missing_action = warn-read|read|stat
   }

This setting controls what should be done when the mail object is missing the
size metadata.

Options:

:``warn-read``: (DEFAULT) Log a warning and fallback to reading the email to
                calculate its size.
:``read``: Same as ``warn-read``, but doesn't log a warning.
:``stat``: Use fs_stat() to get the size, which is the fastest but doesn't
           work if mails are compressed or encrypted.

See :ref:`plugin-obox-storage` for additional plugin options.

See :ref:`obox_settings_advanced` for additional, advanced obox settings.

Obox Drivers
============

See :ref:`obox_drivers`.

Obox Metacache Maintenance
==========================

It can be useful to flush unimportant changes in metacache every night when
the system has idle capacity. This way if users are moved between backends,
there's somewhat less work to do on the new backends since caches are more
up-to-date. This can be done by running ``doveadm metacache flushall`` in a
cronjob.
