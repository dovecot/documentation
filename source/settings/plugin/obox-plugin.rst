.. _plugin-obox:

===========
obox plugin
===========

``obox-plugin``
^^^^^^^^^^^^^^^

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
upload at the cost of potentially changing IMAP UIDs. Normally it should not be
enabled. This setting may be removed in a future version.


.. _plugin-obox-setting_obox_fetch_lost_mails_as_empty:

``obox_fetch_lost_mails_as_empty``
----------------------------------

- Default: ``no``
- Values: :ref:`boolean`

 Cassandra: "Object exists in dict, but not in storage" errors will be handled by returning empty emails to the IMAP client. The tagged FETCH response will be OK instead of NO.


.. _plugin-obox-setting_obox_track_copy_flags:

``obox_track_copy_flags``
-------------------------

- Default: ``no``
- Values: :ref:`boolean`

Enable only if Cassandra & lazy_expunge plugin are used: Try to avoid Cassandra SELECTs when expunging mails. 


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


.. _plugin-obox-setting_obox_refresh_index_once_after:

``obox_refresh_index_once_after``
---------------------------------

- Default: ``0``
- Values: :ref:`uint`

This forces the next mailbox open after the specified UNIX timestamp to refresh locally cached indexes to see if other backends have modified the user's indexes simultaneously.


.. _plugin-obox-setting_obox_rescan_mails_once_after:

``obox_rescan_mails_once_after``
--------------------------------

- Default: ``0``
- Values: :ref:`uint`

This forces the next mailbox open after the specified UNIX timestamp to rescan the mails to make sure there aren't any unindexed mails.


.. _plugin-obox-setting_metacache_socket_path:

``metacache_socket_path``
-------------------------

- Default: ``metacache``
- Values: :ref:`string`

Path to communicate with metacache process. Shouldn't be changed normally.


.. _plugin-obox-setting_obox_fs:

``obox_fs``
-----------

- Default: <empty>
- Values: :ref:`string`

This setting handles the basic Object Storage configuration, typically via the plugin block of 90-plugin.conf.


.. _plugin-obox-setting_obox_index_fs:

``obox_index_fs``
-----------------

- Default: Same as obox_fs
- Values: :ref:`string`

This setting handles the object storage configuration for index bundles.

.. WARNING:: obox_index_fs is currently not compatible with fs-posix driver.

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

By default doing changes to folders (e.g. creating or renaming) uploads changes immediately to object storage. If this setting is enabled, the upload happens sometimes later (within metacache_upload_interval).
