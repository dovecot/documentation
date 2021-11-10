.. _plugin-obox:

===========
obox plugin
===========

See :ref:`obox_settings` for additional configuration information.

.. seealso:: :ref:`obox_settings_advanced`

Settings
========

.. dovecot_plugin:setting:: fs_auth_cache_dict
   :plugin: obox
   :values: @string

:ref:`Dictionary <dict>` URI where fs-auth process keeps authentication cache.
This allows sharing the cache between multiple servers.


.. dovecot_plugin:setting:: fs_auth_request_max_retries
   :default: 1
   :plugin: obox
   :values: @uint

If fs-auth fails to perform authentication lookup, retry the HTTP request this
many times.


.. dovecot_plugin:setting:: fs_auth_request_timeout
   :default: 10s
   :plugin: obox
   :values: @time_msecs

Absolute HTTP request timeout for authentication lookups.


.. dovecot_plugin:setting:: metacache_close_delay
   :default: 2secs
   :plugin: obox
   :values: @time

If user was accessed this recently, assume the user's indexes are up-to-date.
If not, list index bundles in object storage (or Cassandra) to see if they
have changed. This typically matters only when user is being moved to another
backend and soon back again, or if the user is simultaneously being accessed
by multiple backends. Default is 2 seconds.

Must be less than :ref:`setting-director_user_expire` (Default: 15min).


.. dovecot_plugin:setting:: metacache_max_grace
   :default: 1G
   :plugin: obox
   :values: @size

How much disk space on top of :dovecot_plugin:ref:`metacache_max_space` can be
used before Dovecot stops allowing more users to login.


.. dovecot_plugin:setting:: metacache_max_space
   :default: 0
   :plugin: obox
   :values: @size

How much disk space metacache can use before old data is cleaned up.

Generally, this should be set at ~90% of the available disk space.


.. dovecot_plugin:setting:: metacache_rescan_interval
   :default: 1 day
   :plugin: obox
   :values: @time

How often to run a background metacache rescan, which makes sure that the disk
space usage tracked by metacache process matches what really exists on
filesystem.

The desync may happen, for example, because the metacache process (or the
whole backend) crashes.

The rescanning helps with two issues:

 * If metacache filesystem uses more disk space than metacache process thinks,
   it may run out of disk space.
 * If metacache filesystem uses less disk space than metacache process thinks,
   metacache runs non-optimally since it's not filling it out as much as it
   could.

Setting this to 0 disables the rescan.

It's also possible to do this manually by running the
``doveadm metacache rescan`` command.


.. dovecot_plugin:setting:: metacache_roots
   :default: @setting-mail_home, @setting-mail_chroot
   :plugin: obox
   :values: @string

List of metacache root directories, separated with ``:``.

Usually this is automatically parsed directly from :ref:`setting-mail_home`
and :ref:`setting-mail_chroot` settings.

Accessing a metacache directory outside these roots will result in a warning:
"Index directory is outside metacache_roots".

It's possible to disable this check entirely by setting the value to ``:``.

This setting is required for
:dovecot_plugin:ref:`metacache_rescan_interval`.


.. dovecot_plugin:setting:: metacache_upload_interval
   :default: 5min
   :plugin: obox
   :values: @time

How often to upload important index changes to object storage?

This mainly means that if a backend crashes during this time, message flag
changes within this time may be lost. A longer time can however reduce the
number of index bundle uploads.


.. dovecot_plugin:setting:: obox_fs
   :plugin: obox
   :values: @string

This setting handles the basic Object Storage configuration.

.. todo:: Document this!


.. dovecot_plugin:setting:: obox_index_fs
   :default: @obox_fs;dovecot_plugin
   :plugin: obox
   :values: @string

This setting handles the object storage configuration for index bundles.

.. todo:: Document this!

.. versionchanged:: v2.3.18 Fixed to work properly with fs-posix driver.
                    Earlier versions don't work correctly in all situations.


.. dovecot_plugin:setting:: obox_max_parallel_copies
   :default: @setting-mail_prefetch_count
   :plugin: obox
   :values: @uint

Maximum number of email HTTP copy/link operations to do in parallel.

If the storage driver supports bulk-copy/link operation, this controls how
many individual copy operations can be packed into a single bulk-copy/link
HTTP request.


.. dovecot_plugin:setting:: obox_max_parallel_deletes
   :default: @setting-mail_prefetch_count
   :plugin: obox
   :values: @uint

Maximum number of email HTTP delete operations to do in parallel.

If the storage driver supports bulk-delete operation, this controls how
many individual delete operations can be packed into a single bulk-delete
HTTP request.


.. dovecot_plugin:setting:: obox_max_parallel_writes
   :default: @setting-mail_prefetch_count
   :plugin: obox
   :values: @uint

Maximum number of email write HTTP operations to do in parallel.


.. dovecot_plugin:setting:: obox_refresh_index_once_after
   :default: 0
   :plugin: obox
   :values: @uint

This forces the next mailbox open after the specified UNIX timestamp to
refresh locally cached indexes to see if other backends have modified the
user's indexes simultaneously.


.. dovecot_plugin:setting:: obox_rescan_mails_once_after
   :default: 0
   :plugin: obox
   :values: @uint

This forces the next mailbox open after the specified UNIX timestamp to rescan
the mails to make sure there aren't any unindexed mails.


.. dovecot_plugin:setting:: obox_track_copy_flags
   :default: no
   :plugin: obox
   :values: @boolean

Enable only if dictmap/Cassandra & :ref:`lazy_expunge_plugin` plugin are used:
Try to avoid Cassandra SELECTs when expunging mails.
